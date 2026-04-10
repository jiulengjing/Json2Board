import { useState } from 'react';
import { BLUEPRINT_SKILL } from '../prompts/BlueprintSkill';
import { MATERIAL_SKILL } from '../prompts/MaterialSkill';
import { NIAGARA_SKILL } from '../prompts/NiagaraSkill';
import { SchemaType, SCHEMA_LABEL, SCHEMA_ICON, SCHEMA_ACCENT } from '../themes';

export default function HomeTab() {
  const [copied, setCopied] = useState(false);
  const [activeSchema, setActiveSchema] = useState<SchemaType>('blueprint');

  const skills: Record<SchemaType, string> = {
    blueprint: BLUEPRINT_SKILL,
    material: MATERIAL_SKILL,
    niagara: NIAGARA_SKILL
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(skills[activeSchema].trim());
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
            虚幻引擎蓝图 ↔ 文本 ↔ 可视化图 的多模态双向转译工具。支持蓝图、材质、Niagara 等节点的提取解析、GTG-Script 生成，以及 AI 驱动的无缝节点创作。
          </p>
        </div>

        {/* Usage Flow */}
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>多引擎模块支持与使用流程</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['自动识别模式', '粘贴来自 Blueprint、Material 或 Niagara 的代码，工作区会自动识别 Schema 并切换渲染模式'],
              ['发送专用 Skill', '下方提供了不同领域的专用大模型 Skill（技能）。点击复制并发送给你常用的 AI，开启对应的专业上下文'],
              ['从 UE 提取', '在 UE5 中框选节点 → Ctrl+C → 粘贴到左上方 "T3D 蓝图文本" 区域，自动转为极简文本'],
              ['从 AI 还原', '将 AI 返回的对应格式代码粘贴到 "GTG-Script" 区域，右侧立刻渲染连线图'],
              ['多身份并行', '你可以在浏览器多开 AI 窗口，分别喂入不同领域的 Skill，然后在 GTG 的多个标签页中并行制作多类逻辑'],
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
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>
                大模型专项 Skill 技能指令
              </h2>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['blueprint', 'material', 'niagara'] as SchemaType[]).map(schema => {
                  const isActive = activeSchema === schema;
                  return (
                    <button
                      key={schema}
                      onClick={() => setActiveSchema(schema)}
                      style={{
                        padding: '4px 10px', borderRadius: '4px', border: '1px solid',
                        background: isActive ? '#27272a' : 'transparent',
                        borderColor: isActive ? SCHEMA_ACCENT[schema] + '80' : 'transparent',
                        color: isActive ? SCHEMA_ACCENT[schema] : '#71717a',
                        cursor: 'pointer', fontSize: '11px', fontWeight: 500, transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#a1a1aa'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#71717a'; }}
                    >
                      <span>{SCHEMA_ICON[schema]}</span> {SCHEMA_LABEL[schema]}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCopy}
              style={{
                padding: '5px 14px', borderRadius: '4px', border: '1px solid',
                background: copied ? '#14532d' : 'transparent',
                borderColor: copied ? '#4ade8050' : '#3f3f46',
                color: copied ? '#4ade80' : '#e4e4e7',
                cursor: 'pointer', fontSize: '11px', fontWeight: 600, transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!copied) e.currentTarget.style.background = '#27272a'; }}
              onMouseLeave={e => { if (!copied) e.currentTarget.style.background = 'transparent'; }}
            >
              {copied ? '已复制 ✓' : '复制此模块专用 Skill'}
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
              {skills[activeSchema].trim()}
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
