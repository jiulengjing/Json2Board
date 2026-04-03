# UE5-Graph-Text-Graph

> 虚幻引擎 5.7 的蓝图双向编译器 —— 使用零 Token 税的文本格式提取、可视化并借助 AI 生成蓝图逻辑。

**[English](./README.md)**

---

## 这是什么？

UE5-Graph-Text-Graph（缩写 **GTG**）是一个开发者工具，用于打通 **虚幻引擎 5 蓝图**、**纯文本** 与 **可视化节点图** 三者之间的转译通道——支持双向操作。

GTG 使用一种名为 **GTG-Script** 的极简箭头语法，代替繁琐的 JSON 格式：

```
[Node: Branch] (Macro)
<- IN [Exec: execute]: InputAction_Fire.Started
<- IN [Data: Condition]: Get_Ammo.Value
-> OUT [Exec: True]: FireWeapon.execute
-> OUT [Exec: False]: PlayDryFireSound.execute
```

这种格式：
- **Token 税极低** —— 可直接粘贴进 AI 对话作为上下文
- **人类可读** —— 无需任何工具即可理解
- **可直接渲染** —— 粘贴进工具，画布立即显示节点图

---

## 核心工作流

```
UE 蓝图  →  T3D 文本  →  GTG-Script  →  AI 上下文
                              ↑               ↓
         画布渲染   ←  GTG-Script  ←  AI 返回结果
```

1. **提取**：在 UE5 中框选蓝图节点 Ctrl+C → 粘贴到 T3D 文本区
2. **转换**：GTG-Script 自动生成，右侧节点图同步渲染
3. **发给 AI**：复制语法规则和 GTG-Script，发给任何大模型
4. **接收还原**：将 AI 返回的 GTG-Script 粘贴回工具 → 画布立即渲染新蓝图
5. **多标签并行**：点击顶栏的 `+` 新建标签，同时分析多段蓝图逻辑

---

## 界面说明

工作区分为三个可自由调整大小的面板：

| 面板 | 内容 |
|------|------|
| 左上 | T3D 原始蓝图文本输入区（从 UE 粘贴，自动转换） |
| 左下 | GTG-Script 区（T3D 自动生成，或直接粘贴 AI 输出） |
| 右侧 | 实时蓝图节点图渲染画布 |

三个面板均可通过拖拽分割线调整大小。顶栏 `+` 按钮可新建多个工作标签。

---

## GTG-Script 语法

### 节点声明
```
[Node: 显示名称] (类型)
```

| 类型 | 颜色 | 适用场景 |
|------|------|----------|
| `Event` | 红色 | CustomEvent、InputAction、BeginPlay |
| `Pure` | 绿色 | 读取变量、常量、纯函数 |
| `Macro` | 灰色 | Branch、Sequence、ForLoop、Switch |
| `Function` | 蓝色 | 函数调用、设置变量 |

### 引脚声明
```
<- IN [引脚类型: 引脚名]: 来源节点.来源引脚
-> OUT [引脚类型: 引脚名]: 目标节点.目标引脚
```

- 引脚类型：`Exec`（执行流）或 `Data`（数据流）
- 未连线的固定值直接写值：`<- IN [Data: Delay]: 0.5`

---

## 从源码构建

```bash
git clone https://github.com/jiulengjing/UE5-Graph-Text-Graph
cd UE5-Graph-Text-Graph

# 前端
npm install
npm run dev      # 开发模式
npm run build    # 生产构建

# 桌面二进制（Rust/Tauri）
npm run tauri build
```

依赖要求：Node.js 20+、Rust stable

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | React 19、@xyflow/react、Vite |
| 布局引擎 | dagre（AI 生成图的自动排版） |
| 解析器 | 自研 Two-Pass T3D 解析器 + GTG 逆向解析器 |
| 桌面壳 | Tauri 2 + Rust |

---

## 许可证

MIT —— 自由使用、修改和分发。
