# Json2Board

> 把 AI 大模型的 JSON 输出直接可视化为 UE5 风格蓝图节点图

**[English](./README.md)** · [Releases](https://github.com/jiulengjing/Json2Board/releases/latest) · [Issues](https://github.com/jiulengjing/Json2Board/issues)

[![Release](https://img.shields.io/badge/Release-v0.0.1-blue?style=flat-square)](https://github.com/jiulengjing/Json2Board/releases/tag/v0.0.1)
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)]()

---

## 这是什么？

Json2Board 在浏览器中把 JSON 渲染成交互式的、类似虚幻引擎蓝图风格的节点图。你只需要告诉 AI 你想要什么逻辑，把 JSON 粘贴进来，立刻看到可视化的图表。不需要安装虚幻引擎。

**核心特性：**
- 🤖 **AI 优先工作流** — 内置 Prompt，发给任意大模型（GPT-4o、Claude、Gemini…），直接粘贴结果
- 📑 **多标签页** — 像浏览器一样并排打开多张蓝图
- 💾 **`.j2b` 文件** — 自定义命名保存/加载蓝图，名称内嵌在 JSON 中
- 🌐 **HTTP API** — `POST /api/render`，供脚本和插件程序化调用
- ⚡ **免安装** — 单一可执行文件，无需 WebView2 / .NET / VC++ 运行时

---

## 下载 & 运行

1. 前往 [Releases](https://github.com/jiulengjing/Json2Board/releases/latest)
2. 下载 `Json2Board-v0.0.1-windows-x64.zip`
3. 解压后**双击 `Json2Board.exe`** 即可

程序启动本地 HTTP 服务器，并自动在浏览器中打开 `http://localhost:14178`。

> **系统要求：** Windows 10/11，Chrome 或任意现代浏览器
> 无需安装，无依赖项。

---

## 使用方法

打开后默认显示使用说明页，里面有完整教程。基本流程：

```
打开应用 → 复制 AI Prompt → 发给大模型 → 得到 JSON → 粘贴进应用 → 看到蓝图
```

1. **复制 AI Prompt** — 点击主页的「复制 AI Prompt」按钮，作为系统提示词发给大模型
2. **描述你的逻辑** — 告诉 AI 你想要什么蓝图
3. **粘贴 JSON** — 点击 `+` 新建标签页，然后点「粘贴 JSON」，或使用 `Ctrl+V`
4. **保存 / 分享** — 下载为 `.j2b` 文件（本质是带自定义扩展名的 JSON）

---

## HTTP API（程序化调用）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/render` | POST | 发送蓝图 JSON，浏览器自动打开并渲染 |
| `/api/latest` | GET | 获取最新 payload |
| `/api/sse` | GET | SSE 实时推送流 |

```bash
curl -X POST http://localhost:14178/api/render \
  -H "Content-Type: application/json" \
  -d @my_blueprint.j2b
```

---

## `.j2b` 文件格式

`.j2b` 文件本质上是纯 JSON 文件，只是扩展名不同。示例：

```json
{
  "version": "1.0",
  "name": "我的蓝图",
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

**节点类型：** `event`（红）· `function`（蓝）· `macro`（灰）· `variable`（绿）

**数据类型：** `boolean` `integer` `float` `string` `vector` `rotator` `transform` `object` …

---

## 从源码构建

```bash
git clone https://github.com/jiulengjing/Json2Board
cd Json2Board

# 1. 构建前端
npm install
npm run build

# 2. 构建后端（release）
cargo build --release --manifest-path src-tauri/Cargo.toml

# 输出：src-tauri/target/release/Json2Board.exe（约 2.5 MB，自包含）
```

**构建依赖：** Node.js 18+、Rust stable

---

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Rust + Tokio + Axum |
| 前端 | React 19 + @xyflow/react + Tailwind CSS v4 + Vite |
| 打包 | `rust-embed` — 前端编译内嵌到二进制 |
| 分发 | 单一 `.exe`，无运行时依赖 |

---

## License

MIT — 可自由使用、修改和分发。
