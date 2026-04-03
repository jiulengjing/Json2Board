// Hide the console window in Windows release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use axum::{
    extract::State,
    http::{header, StatusCode},
    response::{
        sse::{Event, Sse},
        IntoResponse,
    },
    routing::{get, post},
    Json, Router,
};
use mime_guess::from_path;
use rust_embed::Embed;
use serde_json::Value;
use std::{convert::Infallible, sync::Arc, time::Duration};
use tokio::sync::{broadcast, Mutex};
use tokio::net::TcpListener;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt as _;

// ── Embed built frontend (dist/) into the binary at compile time ──
#[derive(Embed)]
#[folder = "../dist"]
struct FrontendAssets;

// ── Shared state ──
#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<String>,
    latest: Arc<Mutex<Option<Value>>>,
}

// ── POST /api/render — receive blueprint JSON ──
async fn render_handler(State(state): State<AppState>, Json(payload): Json<Value>) {
    *state.latest.lock().await = Some(payload.clone());
    let _ = state.tx.send(payload.to_string());
    open_browser("http://localhost:14178");
}

// ── GET /api/latest ──
async fn latest_handler(State(state): State<AppState>) -> impl IntoResponse {
    let guard = state.latest.lock().await;
    match &*guard {
        Some(v) => Json(v.clone()).into_response(),
        None => (StatusCode::NO_CONTENT, "").into_response(),
    }
}

// ── GET /api/sse — Server-Sent Events ──
async fn sse_handler(
    State(state): State<AppState>,
) -> Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>> {
    let rx = state.tx.subscribe();
    let stream = BroadcastStream::new(rx).filter_map(|result: Result<String, _>| {
        result
            .ok()
            .map(|data| Ok::<Event, Infallible>(Event::default().event("update").data(data)))
    });
    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    )
}

// ── GET /* — serve embedded static assets ──
async fn static_handler(uri: axum::http::Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/');
    let path = if path.is_empty() { "index.html" } else { path };

    match FrontendAssets::get(path) {
        Some(content) => {
            let mime = from_path(path).first_or_octet_stream();
            (
                StatusCode::OK,
                [(header::CONTENT_TYPE, mime.as_ref().to_string())],
                content.data.into_owned(),
            )
                .into_response()
        }
        None => match FrontendAssets::get("index.html") {
            Some(content) => (
                StatusCode::OK,
                [(header::CONTENT_TYPE, "text/html".to_string())],
                content.data.into_owned(),
            )
                .into_response(),
            None => (StatusCode::NOT_FOUND, "Not Found").into_response(),
        },
    }
}

// ── Open browser (Chrome first on Windows, then system default) ──
fn open_browser(url: &str) {
    let url = url.to_string();
    #[cfg(target_os = "windows")]
    {
        let chrome_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ];
        for path in &chrome_paths {
            if std::path::Path::new(path).exists() {
                let _ = std::process::Command::new(path)
                    .arg("--new-window")
                    .arg(&url)
                    .spawn();
                return;
            }
        }
        // Fallback: system default browser
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn();
    }
    #[cfg(target_os = "macos")]
    let _ = std::process::Command::new("open").arg(&url).spawn();
    #[cfg(target_os = "linux")]
    let _ = std::process::Command::new("xdg-open").arg(&url).spawn();
}

// ── Entry point ──
#[tokio::main]
async fn main() {
    let (tx, _) = broadcast::channel::<String>(32);
    let state = AppState {
        tx,
        latest: Arc::new(Mutex::new(None)),
    };

    let router = Router::new()
        .route("/api/render", post(render_handler))
        .route("/api/latest", get(latest_handler))
        .route("/api/sse", get(sse_handler))
        .fallback(static_handler)
        .with_state(state);

    let addr = "127.0.0.1:14178";
    match TcpListener::bind(addr).await {
        Ok(listener) => {
            eprintln!("[UE5-GTG] Listening on http://{addr}");

            // Open browser automatically after server is ready
            tokio::spawn(async {
                tokio::time::sleep(Duration::from_millis(300)).await;
                open_browser("http://localhost:14178");
            });

            let _ = axum::serve(listener, router).await;
        }
        Err(e) => {
            eprintln!("[UE5-GTG] Failed to bind port 14178: {e}");
            // Port already in use — just open browser to existing instance
            open_browser("http://localhost:14178");
        }
    }
}
