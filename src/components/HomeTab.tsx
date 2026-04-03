export const GTG_PROMPT = `# 工具说明：UE5-Graph-Text-Graph (GTG-Script)

这是一套为大模型设计的"零 Token 税"蓝图描述语法，用于提取、还原、生成虚幻引擎蓝图逻辑，并可直接驱动 UE5-Graph-Text-Graph 工具进行可视化渲染。

---

## 节点声明

\`[Node: 节点名称] (类型)\`

支持的类型（决定渲染颜色）：

| 类型 | 颜色 | 适用场景 |
|---|---|---|
| Event | 红色 | CustomEvent、InputAction、BeginPlay 等 |
| Pure | 绿色 | Get 变量、常量、纯函数 |
| Macro | 灰色 | Branch、Sequence、ForLoop 等控制流 |
| Function | 蓝色 | 普通函数调用、Set 变量 |

---

## 引脚声明

紧跟在节点声明下方：

\`<- IN [类型: 引脚名]: 来源节点.来源引脚\`
\`-> OUT [类型: 引脚名]: 目标节点.目标引脚\`

引脚类型：\`Exec\`（执行流）| \`Data\`（数据流）

未连线的固定值直接写值：\`<- IN [Data: Delay]: 0.5\`

---

## 示例

需求："按下F键，弹药>0时开火"

\`\`\`
[Node: InputAction_Fire] (Event)
-> OUT [Exec: Started]: Branch.execute

[Node: Get_Ammo] (Pure)
-> OUT [Data: Value]: Branch.Condition

[Node: Branch] (Macro)
<- IN [Exec: execute]: InputAction_Fire.Started
<- IN [Data: Condition]: Get_Ammo.Value
-> OUT [Exec: True]: FireWeapon.execute
-> OUT [Exec: False]: PlayDryFireSound.execute

[Node: FireWeapon] (Function)
<- IN [Exec: execute]: Branch.True
\`\`\``;

import { useState } from 'react';

export default function HomeTab() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(GTG_PROMPT.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: '#111113' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px', color: '#d4d4d8', fontFamily: '"Inter", system-ui, sans-serif' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #27272a', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#e4e4e7', margin: '0 0 6px 0', letterSpacing: '0.01em' }}>
            UE5-Graph-Text-Graph
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0, lineHeight: 1.6 }}>
            虚幻引擎蓝图 ↔ 文本 ↔ 可视化图 的双向转译工具。支持蓝图（T3D）提取、GTG-Script 生成与解析、以及基于 GTG-Script 的 AI 驱动蓝图创作。
          </p>
        </div>

        {/* Usage Flow */}
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>使用流程</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['从 UE 提取', '在 UE5 蓝图编辑器中框选节点 → Ctrl+C → 粘贴到左上方 "T3D 蓝图文本" 区域'],
              ['转为 GTG-Script', '提取后，左下方 "GTG-Script" 区域自动生成文本，右侧同步渲染节点图'],
              ['发给 AI', '点击 "复制语法规则" 作为系统指令发给 AI，描述你需要的蓝图逻辑'],
              ['从 AI 还原', '将 AI 返回的 GTG-Script 粘贴到 "GTG-Script" 区域，右侧立即生成节点图'],
              ['多标签并行', '点击顶部标签栏的 "+" 新建标签，可同时研究多段蓝图逻辑'],
            ].map(([title, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#52525b', minWidth: '18px', textAlign: 'right', marginTop: '1px' }}>{i + 1}</span>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa' }}>{title}　</span>
                  <span style={{ fontSize: '12px', color: '#71717a', lineHeight: 1.6 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prompt Card */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              大模型系统指令（GTG-Script 语法规范）
            </h2>
            <button
              onClick={handleCopy}
              style={{
                padding: '4px 12px', borderRadius: '4px', border: '1px solid #3f3f46',
                background: copied ? '#14532d' : 'transparent',
                color: copied ? '#4ade80' : '#a1a1aa',
                cursor: 'pointer', fontSize: '11px', fontWeight: 500, transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.background = '#27272a'; }}
              onMouseLeave={e => { if (!copied) e.currentTarget.style.background = 'transparent'; }}
            >
              {copied ? '已复制 ✓' : '复制语法规则'}
            </button>
          </div>

          <div style={{
            background: '#0e0e10', border: '1px solid #27272a', borderRadius: '6px',
            padding: '16px', overflowX: 'auto', userSelect: 'text'
          }}>
            <pre style={{
              margin: 0, fontFamily: '"Fira Code", "Cascadia Code", monospace',
              fontSize: '12px', lineHeight: 1.65, color: '#86efac', whiteSpace: 'pre-wrap'
            }}>
              {GTG_PROMPT.trim()}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #27272a', fontSize: '11px', color: '#3f3f46' }}>
          UE5-Graph-Text-Graph · MIT License · Unreal Engine 5.7
        </div>
      </div>
    </div>
  );
}
