# Json2Board

> Visualize AI-generated JSON as UE5-style node graphs — Blueprint, Material Editor, and Niagara.

**[简体中文](./README.zh.md)** | [Releases](https://github.com/jiulengjing/Json2Board/releases/latest) | [Issues](https://github.com/jiulengjing/Json2Board/issues)

[![Release](https://img.shields.io/badge/Release-v0.0.3-blue?style=flat-square)](https://github.com/jiulengjing/Json2Board/releases/tag/v0.0.3)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## What is Json2Board?

Json2Board renders JSON into interactive UE5-style node graphs in your browser — just paste AI-generated JSON and see the result instantly. No Unreal Engine needed.

**Supported graph styles (v0.0.3):**
- 🔵 **Blueprint** — event/function/macro/variable nodes, exec flow + data pins
- 🎨 **Material Editor** — data-only graph, texture/math/output nodes with glow
- ✨ **Niagara** — particle modules with Spawn/Update/Render stage badges

One `schemaType` field in the JSON switches the rendering style automatically.

**Key features:**
- AI-first workflow -- built-in prompts for each style, works with any LLM
- JSON Edit Modal -- focused popup for editing, rendering, and one-click copying JSON
- Multi-tab -- open multiple graphs side by side
- `.j2b` files -- save/load graphs; name and schemaType embedded in JSON
- HTTP API -- `POST /api/render` for scripting and plugin integration
- No install -- single portable `.exe`, no WebView2 / .NET / VC++ required

---

## Download & Run

1. Go to [Releases](https://github.com/jiulengjing/Json2Board/releases/latest)
2. Download `Json2Board-v0.0.3-windows-x64.zip`
3. Extract and **double-click `Json2Board.exe`**

The app starts a local HTTP server and automatically opens your browser to `http://localhost:14178`.

> Requirements: Windows 10/11, Chrome or any modern browser. No installation. No dependencies.

---

## How to Use

The home tab inside the app contains full instructions. The basic flow:

```
Open app -> Select style -> Copy AI Prompt -> Paste to LLM -> Get JSON -> Paste into app -> See graph
```

1. **Select graph style** -- on the home tab, choose Blueprint, Material Editor, or Niagara
2. **Copy AI Prompt** -- click the copy button, send it to your LLM as the system prompt
3. **Describe your graph** -- tell the AI what logic or material you want
4. **Paste JSON** -- click `+` for a new tab, then "Paste JSON"
5. **Save / Share** -- download as a `.j2b` file (plain JSON with a custom extension)

---

## HTTP API

For scripting or plugin integration:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/render` | POST | Send graph JSON (any schemaType); browser opens automatically |
| `/api/latest` | GET | Fetch the latest payload |
| `/api/sse` | GET | Server-Sent Events stream for real-time updates |

```bash
curl -X POST http://localhost:14178/api/render \
  -H "Content-Type: application/json" \
  -d @my_blueprint.j2b
```

---

## .j2b File Format

`.j2b` files are plain JSON. The `schemaType` field selects the rendering style:

```json
{
  "version": "1.0",
  "schemaType": "blueprint",
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

**`schemaType` values:** `"blueprint"` (default) | `"material"` | `"niagara"`

**Blueprint node types:** `event` (red) | `function` (blue) | `macro` (grey) | `variable` (green)
**Material node types:** `input` (gold) | `math` (blue-grey) | `texture` (purple) | `output` (amber)
**Niagara node types:** `emitter` (orange) | `particle` (green) | `module` (purple) | `event` (blue) | `variable` (cyan)

> Omitting `schemaType` defaults to `"blueprint"` — fully backward compatible.

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
