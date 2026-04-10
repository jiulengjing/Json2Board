import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, BLUEPRINT_PIN_COLORS } from '../../themes';

// ── UE5 blueprint header colors ──
const NODE_THEME: Record<string, { h1: string; h2: string; border: string; icon: string }> = {
  event:    { h1: '#8b0000', h2: '#600000', border: '#b50000', icon: '⚡' },
  function: { h1: '#004485', h2: '#002b5e', border: '#005bb5', icon: 'ƒ' },
  macro:    { h1: '#2b2b2b', h2: '#1a1a1a', border: '#444444', icon: 'M' },
  variable: { h1: '#123d12', h2: '#0a260a', border: '#1a5c1a', icon: '◈' },
};

function pinColor(pin: PinData): string {
  if (pin.type === 'exec') return '#ffffff';
  return (pin.dataType && BLUEPRINT_PIN_COLORS[pin.dataType]) ?? '#9e9e9e';
}

const ARROW = 'polygon(0% 20%, 55% 20%, 55% 0%, 100% 50%, 55% 100%, 55% 80%, 0% 80%)';
const LABEL: React.CSSProperties = {
  fontSize: '12px', color: '#c8c8c8', lineHeight: 1,
  whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.8)', userSelect: 'none',
};

function InputPin({ pin, hideLabel }: { pin: PinData; hideLabel?: boolean }) {
  const c = pinColor(pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '24px', paddingLeft: '18px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: exec ? '14px' : '10px', height: exec ? '11px' : '10px',
        left: exec ? '-7px' : '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: exec ? '0' : '50%', background: c,
        border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.55)`,
        clipPath: exec ? ARROW : undefined, boxShadow: exec ? 'none' : `0 0 4px ${c}88`,
      }} />
      {pin.label && !hideLabel && <span style={LABEL}>{pin.label}</span>}
    </div>
  );
}

function OutputPin({ pin, hideLabel }: { pin: PinData; hideLabel?: boolean }) {
  const c = pinColor(pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '24px', paddingRight: '18px' }}>
      {pin.label && !hideLabel && <span style={LABEL}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: exec ? '14px' : '10px', height: exec ? '11px' : '10px',
        right: exec ? '-7px' : '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: exec ? '0' : '50%', background: c,
        border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.55)`,
        clipPath: exec ? ARROW : undefined, boxShadow: exec ? 'none' : `0 0 4px ${c}88`,
      }} />
    </div>
  );
}

export default function BlueprintNode({ data }: { data: NodeData }) {
  const theme = useMemo(() => NODE_THEME[data.nodeType] ?? NODE_THEME.function, [data.nodeType]);
  const inputs  = [...data.inputs.filter(p => p.type === 'exec'),  ...data.inputs.filter(p => p.type !== 'exec')];
  const outputs = [...data.outputs.filter(p => p.type === 'exec'), ...data.outputs.filter(p => p.type !== 'exec')];
  const rows = Math.max(inputs.length, outputs.length, 1);

  if (data.nodeType === 'get') {
    const outDataPin = outputs.find(p => p.type !== 'exec');
    const color = outDataPin ? pinColor(outDataPin) : '#123d12';
    
    return (
      <div style={{
        minWidth: '50px', padding: '4px 14px', borderRadius: '20px',
        background: `linear-gradient(180deg, ${color}44 0%, ${color}11 100%)`, 
        border: `1px solid ${color}88`,
        boxShadow: `0 2px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
        backdropFilter: 'blur(4px)'
      }}>
        <div style={{ position: 'absolute', left: 0 }}>
           {inputs.map(p => <InputPin key={p.id} pin={p} hideLabel={true} />)}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', userSelect: 'none', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          {data.label}
        </span>
        <div style={{ position: 'absolute', right: 0 }}>
          {outputs.map(p => <OutputPin key={p.id} pin={p} hideLabel={true} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minWidth: '200px', borderRadius: '8px', overflow: 'visible',
      border: `1px solid ${theme.border}55`,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.95), 0 8px 28px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.6)`,
      background: '#222', position: 'relative',
    }}>
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        borderRadius: '7px 7px 0 0', padding: '5px 10px',
        display: 'flex', alignItems: 'center', gap: '7px',
        borderBottom: '1px solid rgba(0,0,0,0.6)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)', minHeight: '28px',
      }}>
        <span style={{ fontSize: '12px', opacity: 0.7, lineHeight: 1, flexShrink: 0 }}>{theme.icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.03em', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontFamily: '"Segoe UI", system-ui, sans-serif', whiteSpace: 'nowrap' }}>{data.label}</span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        paddingTop: '4px', paddingBottom: '5px',
        minHeight: `${rows * 24 + 9}px`,
        background: 'linear-gradient(180deg, #252525 0%, #202020 100%)',
        borderRadius: '0 0 7px 7px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{inputs.map(p => <InputPin key={p.id} pin={p} />)}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{outputs.map(p => <OutputPin key={p.id} pin={p} />)}</div>
      </div>
    </div>
  );
}
