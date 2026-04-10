import { useState, useCallback, useRef, useEffect } from 'react';
import { parseT3D } from '../utils/t3dParser';
import { parseGtgToPayload } from '../utils/gtgParser';
import BoardEditor, { JsonPayload } from './BoardEditor';

// Schema & AI Skills
import { SchemaType, SCHEMA_LABEL, SCHEMA_ICON, SCHEMA_ACCENT } from '../themes';
import { detectRawTextSchema, detectGtgScriptSchema } from '../utils/schema/SchemaRegistry';
import { BLUEPRINT_SKILL } from '../prompts/BlueprintSkill';
import { MATERIAL_SKILL } from '../prompts/MaterialSkill';
import { NIAGARA_SKILL } from '../prompts/NiagaraSkill';

const skills: Record<SchemaType, string> = {
  blueprint: BLUEPRINT_SKILL,
  material: MATERIAL_SKILL,
  niagara: NIAGARA_SKILL
};

interface Props { tabId: string; }

// Minimal inline button style builder
const btnBase: React.CSSProperties = {
  padding: '3px 9px', borderRadius: '3px', border: '1px solid #3f3f46',
  background: 'transparent', color: '#a1a1aa', cursor: 'pointer',
  fontSize: '11px', fontWeight: 500, transition: 'all 0.1s', whiteSpace: 'nowrap'
};

const SplitterH = ({ onMouseDown }: { onMouseDown: () => void }) => (
  <div
    onMouseDown={onMouseDown}
    style={{ height: '3px', background: '#27272a', cursor: 'row-resize', flexShrink: 0 }}
    onMouseEnter={e => e.currentTarget.style.background = '#3b82f680'}
    onMouseLeave={e => e.currentTarget.style.background = '#27272a'}
  />
);

const SplitterV = ({ onMouseDown }: { onMouseDown: () => void }) => (
  <div
    onMouseDown={onMouseDown}
    style={{ width: '3px', background: '#27272a', cursor: 'col-resize', flexShrink: 0, zIndex: 5 }}
    onMouseEnter={e => e.currentTarget.style.background = '#3b82f680'}
    onMouseLeave={e => e.currentTarget.style.background = '#27272a'}
  />
);

export default function GtgWorkspace({ }: Props) {
  const [t3dInput, setT3dInput] = useState('');
  const [gtgInput, setGtgInput] = useState('');
  const [payloadOutput, setPayloadOutput] = useState<JsonPayload | null>(null);
  
  const [activeSchema, setActiveSchema] = useState<SchemaType>('blueprint');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const [topHeight, setTopHeight] = useState(50);   // % of left col
  const [leftWidth, setLeftWidth] = useState(38);   // % of total
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const isDragH = useRef(false);
  const isDragV = useRef(false);

  // ------ Parsing ------
  const handleT3dChange = useCallback((val: string) => {
    setT3dInput(val);
    const schema = detectRawTextSchema(val);
    setActiveSchema(schema);
    try { 
      const r = parseT3D(val, schema); 
      setGtgInput(r.dsl); 
      setPayloadOutput(r.payload); 
    } catch (err) { 
      console.error("T3D Parse Error:", err); 
    }
  }, []);

  const handleGtgChange = useCallback((val: string) => {
    setGtgInput(val);
    const schema = detectGtgScriptSchema(val);
    setActiveSchema(schema);
    try { 
      setPayloadOutput(parseGtgToPayload(val, schema)); 
    } catch (err) { 
      console.error("GTG Parse Error:", err); 
    }
  }, []);

  // ------ Drag resize ------
  useEffect(() => {
    const up = () => { isDragH.current = false; isDragV.current = false; };
    const move = (e: MouseEvent) => {
      if (isDragH.current && leftColRef.current) {
        const b = leftColRef.current.getBoundingClientRect();
        setTopHeight(Math.max(10, Math.min(90, ((e.clientY - b.top) / b.height) * 100)));
      }
      if (isDragV.current && containerRef.current) {
        const b = containerRef.current.getBoundingClientRect();
        setLeftWidth(Math.max(20, Math.min(75, ((e.clientX - b.left) / b.width) * 100)));
      }
    };
    document.addEventListener('mouseup', up);
    document.addEventListener('mousemove', move);
    return () => { document.removeEventListener('mouseup', up); document.removeEventListener('mousemove', move); };
  }, []);

  // ------ Actions ------
  const paste = async (handler: (v: string) => void) => {
    try { const t = await navigator.clipboard.readText(); if (t) handler(t); } catch { }
  };

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true); setTimeout(() => setter(false), 2000);
  };

  // ------ Panel Header ------
  const PanelHeader = ({ title, showBadge, children }: { title: string; showBadge?: boolean; children?: React.ReactNode }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 12px', background: '#18181b', borderBottom: '1px solid #27272a',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </span>
        {showBadge && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '2px 6px', borderRadius: '12px',
            background: SCHEMA_ACCENT[activeSchema] + '15',
            border: `1px solid ${SCHEMA_ACCENT[activeSchema]}30`,
            color: SCHEMA_ACCENT[activeSchema],
            fontSize: '10px', fontWeight: 600,
          }}>
            <span>{SCHEMA_ICON[activeSchema]}</span>
            <span>{SCHEMA_LABEL[activeSchema]}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>{children}</div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', width: '100%', height: '100%', background: '#111113', overflow: 'hidden' }}
    >
      {/* ══ Left Column ══ */}
      <div
        ref={leftColRef}
        style={{ width: `${leftWidth}%`, minWidth: 200, display: 'flex', flexDirection: 'column', background: '#18181b' }}
      >
        {/* Top: T3D Input */}
        <div style={{ height: `${topHeight}%`, minHeight: 60, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PanelHeader title="Raw 原始蓝图内容" showBadge>
            <button
              style={btnBase}
              onClick={() => paste(handleT3dChange)}
              onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#e4e4e7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
            >粘贴</button>
          </PanelHeader>
          <textarea
            value={t3dInput}
            onChange={e => handleT3dChange(e.target.value)}
            placeholder="粘贴从虚幻引擎复制的代码 (Begin Object...)"
            spellCheck={false}
            style={{
              flex: 1, width: '100%', padding: '12px', boxSizing: 'border-box',
              background: 'transparent', border: 'none', outline: 'none',
              color: '#71717a', fontFamily: '"Fira Code", "Cascadia Code", monospace',
              fontSize: '11.5px', lineHeight: 1.55, resize: 'none'
            }}
          />
        </div>

        <SplitterH onMouseDown={() => { isDragH.current = true; }} />

        {/* Bottom: GTG-Script */}
        <div style={{ flex: 1, minHeight: 60, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PanelHeader title="GTG-Script AI 指令层">
            <button
              style={btnBase}
              onClick={() => paste(handleGtgChange)}
              onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#e4e4e7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
            >粘贴</button>
            <button
              style={{ ...btnBase, color: copiedText ? '#4ade80' : '#a1a1aa', borderColor: copiedText ? '#4ade8040' : '#3f3f46' }}
              onClick={() => copy(gtgInput, setCopiedText)}
              onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >{copiedText ? '已复制' : '复制文本'}</button>
            <button
              style={{ ...btnBase, color: copiedPrompt ? '#4ade80' : '#a1a1aa', borderColor: copiedPrompt ? '#4ade8040' : '#3f3f46' }}
              onClick={() => copy(skills[activeSchema].trim(), setCopiedPrompt)}
              onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >{copiedPrompt ? '已复制 ✓' : `复制 ${SCHEMA_LABEL[activeSchema]} 专精技能`}</button>
          </PanelHeader>
          <textarea
            value={gtgInput}
            onChange={e => handleGtgChange(e.target.value)}
            placeholder="GTG-Script 提取结果将显示在此，也可直接粘贴 AI 生成的 GTG-Script..."
            spellCheck={false}
            style={{
              flex: 1, width: '100%', padding: '12px', boxSizing: 'border-box',
              background: '#111113', border: 'none', outline: 'none',
              color: '#6ee7b7', fontFamily: '"Fira Code", "Cascadia Code", monospace',
              fontSize: '11.5px', lineHeight: 1.55, resize: 'none'
            }}
          />
        </div>
      </div>

      <SplitterV onMouseDown={() => { isDragV.current = true; }} />

      {/* ══ Right: Board Canvas ══ */}
      <div style={{ flex: 1, position: 'relative', background: '#0e0e10', minWidth: 280 }}>
        {payloadOutput && payloadOutput.nodes.length > 0 ? (
          <BoardEditor payload={payloadOutput} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3f3f46', fontSize: '13px', letterSpacing: '0.02em', flexDirection: 'column', gap: '8px'
          }}>
            <div>粘贴代码后，对应模块的渲染图将在此出现</div>
            <div style={{ fontSize: '11px', color: '#27272a' }}>支持 Blueprints, Materials, Niagara...</div>
          </div>
        )}
      </div>
    </div>
  );
}
