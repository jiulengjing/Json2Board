# Json2Board

> Visualize AI-generated JSON as UE5-style Blueprint node graphs — instantly.

**[Chinese README](./README.zh.md)** | [Releases](https://github.com/jiulengjing/Json2Board/releases/latest) | [Issues](https://github.com/jiulengjing/Json2Board/issues)

[![Release](https://img.shields.io/badge/Release-v0.0.1-blue?style=flat-square)](https://github.com/jiulengjing/Json2Board/releases/tag/v0.0.1)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## What is Json2Board?

Json2Board renders JSON into interactive, Unreal Engine Blueprint-style node graphs in your browser.
Just tell an AI what logic you want, paste the JSON output, and see a visual graph immediately.
No Unreal Engine needed.

**Key features:**
- AI-first workflow -- copy the built-in prompt, send it to any LLM (GPT-4o, Claude, Gemini...), paste the result
- Multi-tab -- open multiple blueprints side by side, like browser tabs
- `.j2b` files -- save/load named blueprints; custom name embedded in JSON
- HTTP API -- `POST /api/render` for scripting and plugin integration
- No install -- single portable `.exe`, no WebView2 / .NET / VC++ required

---

## Download & Run

1. Go to [Releases](https://github.com/jiulengjing/Json2Board/releases/latest)
2. Download `Json2Board-v0.0.1-windows-x64.zip`
3. Extract and **double-click `Json2Board.exe`**

The app starts a local HTTP server and automatically opens your browser to `http://localhost:14178`.

> Requirements: Windows 10/11, Chrome or any modern browser. No installation. No dependencies.

---

## How to Use

The home tab inside the app contains full instructions. The basic flow:

```
Open app -> Copy AI Prompt -> Paste to LLM -> Get JSON -> Paste into app -> See Blueprint
```

1. **Copy AI Prompt** -- click the button on the home tab, send it to your LLM as the system prompt
2. **Describe your logic** -- tell the AI what blueprint you want
3. **Paste JSON** -- click `+` for a new tab, then "Paste JSON"
4. **Save / Share** -- download as a `.j2b` file (plain JSON with a custom extension)

---

## HTTP API

For scripting or plugin integration:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/render` | POST | Send blueprint JSON; browser opens automatically |
| `/api/latest` | GET | Fetch the latest payload |
| `/api/sse` | GET | Server-Sent Events stream for real-time updates |

```bash
curl -X POST http://localhost:14178/api/render \
  -H "Content-Type: application/json" \
  -d @my_blueprint.j2b
```

---

## .j2b File Format

`.j2b` files are plain JSON with a custom extension. Example:

```json
{
  "version": "1.0",
  "name": "My Blueprint",
  "nodes": [
    {
      "id": "ev_begin",
      "type": "event",
      "label": "On Begin Play",
      "position": { "x": 100, "y": 150 },
      "inputs": [],
      "outputs": [{ "id": "exec_out", "label": "", "type": "exec" }]
    }
  ],
  "edges": []
}
```

**Node types:** `event` (red) | `function` (blue) | `macro` (grey) | `variable` (green)

**Data types:** `boolean` `integer` `float` `string` `vector` `rotator` `transform` `object` ...

---

## Build from Source

```bash
git clone https://github.com/jiulengjing/Json2Board
cd Json2Board

# 1. Build frontend
npm install
npm run build

# 2. Build backend (release)
cargo build --release --manifest-path src-tauri/Cargo.toml

# Output: src-tauri/target/release/Json2Board.exe  (~2.5 MB, self-contained)
```

Requirements: Node.js 18+, Rust stable

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Rust + Tokio + Axum |
| Frontend | React 19 + @xyflow/react + Tailwind CSS v4 + Vite |
| Packaging | rust-embed -- frontend baked into the binary |
| Distribution | Single `.exe`, no runtime dependencies |

---

## License

MIT -- free to use, modify, and distribute.
