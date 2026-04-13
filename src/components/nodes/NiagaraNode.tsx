import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, getPinColor } from '../../themes';

// ── Niagara node header colors (warm, energetic) ──
const NODE_THEME: Record<string, { h1: string; h2: string; border: string; glow: string; icon: string }> = {
  emitter:  { h1: '#7a3000', h2: '#5a2000', border: '#cc6020', glow: 'rgba(204,96,32,0.4)',   icon: '🔥' },
  particle: { h1: '#1a5a28', h2: '#104018', border: '#30a048', glow: 'rgba(48,160,72,0.3)',   icon: '◆' },
  module:   { h1: '#3a1260', h2: '#280a48', border: '#7030b0', glow: 'rgba(112,48,176,0.4)',  icon: '⬡' },
  event:    { h1: '#0d3a6b', h2: '#082850', border: '#1865c0', glow: 'rgba(24,101,192,0.35)', icon: '⚡' },
  variable: { h1: '#0a4050', h2: '#062e38', border: '#1888a8', glow: 'rgba(24,136,168,0.35)', icon: '◈' },
};

type NiagaraStage = 'spawn' | 'update' | 'render';
const STAGE_COLORS: Record<NiagaraStage, { bg: string; text: string }> = {
  spawn:  { bg: 'rgba(255,107,53,0.18)',  text: '#ff8050' },
  update: { bg: 'rgba(168,85,247,0.18)',  text: '#c070f0' },
  render: { bg: 'rgba(56,180,240,0.18)',  text: '#60ccff' },
};

const TRIANGLE_PATH = 'polygon(0% 0%, 100% 50%, 0% 100%)';

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px', color: '#d0b8f8', fontWeight: 500,
  textShadow: '0 1px 2px rgba(0,0,0,0.9)', userSelect: 'none',
  padding: '0 4px',
};

const VALUE_STYLE: React.CSSProperties = {
  fontSize: '10px', color: '#a8a', 
  background: 'rgba(0,0,0,0.4)', 
  padding: '1px 5px', borderRadius: '3px',
  marginLeft: '6px', fontStyle: 'italic',
};

function PinValue({ value }: { value?: string }) {
  if (!value || value === '0.0' || value === '0') return null;
  const displayValue = value.length > 15 ? value.substring(0, 12) + '...' : value;
  return <div style={VALUE_STYLE}>{displayValue}</div>;
}

function NiaInputPin({ pin }: { pin: PinData }) {
  const c = getPinColor('niagara', pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '26px', paddingLeft: '20px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: exec ? '12px' : '10px', height: exec ? '12px' : '10px',
        left: exec ? '-6px' : '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: exec ? '0' : '50%', background: c,
        border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.6)`,
        clipPath: exec ? TRIANGLE_PATH : undefined,
        boxShadow: exec ? `0 0 8px ${c}88` : `0 0 4px ${c}44`,
        zIndex: 10
      }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {pin.label && <span style={LABEL_STYLE}>{pin.label}</span>}
        <PinValue value={pin.defaultValue} />
      </div>
    </div>
  );
}

function NiaOutputPin({ pin }: { pin: PinData }) {
  const c = getPinColor('niagara', pin);
  const exec = pin.type === 'exec';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '26px', paddingRight: '20px' }}>
      {pin.label && <span style={LABEL_STYLE}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: exec ? '12px' : '10px', height: exec ? '12px' : '10px',
        right: exec ? '-6px' : '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: exec ? '0' : '50%', background: c,
        border: exec ? 'none' : `1.5px solid rgba(0,0,0,0.6)`,
        clipPath: exec ? TRIANGLE_PATH : undefined,
        boxShadow: exec ? `0 0 8px ${c}88` : `0 0 4px ${c}44`,
        zIndex: 10
      }} />
    </div>
  );
}

export default function NiagaraNode({ data }: { data: NodeData }) {
  const theme = useMemo(() => NODE_THEME[data.nodeType] ?? NODE_THEME.module, [data.nodeType]);
  const stage = data.meta?.stage as NiagaraStage | undefined;
  const stageStyle = stage ? STAGE_COLORS[stage] : undefined;

  const sortedInputs  = useMemo(() => 
    [...data.inputs.filter(p => p.type === 'exec'), ...data.inputs.filter(p => p.type !== 'exec')],
    [data.inputs]
  );
  const sortedOutputs = useMemo(() => 
    [...data.outputs.filter(p => p.type === 'exec'), ...data.outputs.filter(p => p.type !== 'exec')],
    [data.outputs]
  );
  
  const rows = Math.max(sortedInputs.length, sortedOutputs.length, 1);

  return (
    <div style={{
      minWidth: '200px', borderRadius: '10px', overflow: 'hidden',
      border: `1.5px solid rgba(0,0,0,0.8)`,
      boxShadow: `0 10px 40px rgba(0,0,0,0.6), 0 0 20px ${theme.glow}`,
      background: '#1a1518', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: `1.5px solid rgba(0,0,0,0.5)`, position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: '11px', opacity: 0.8 }}>{theme.icon}</span>
        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textShadow: '0 1px 4px #000' }}>{data.label}</span>
        {stageStyle && (
          <span style={{
            fontSize: '9px', fontWeight: 800, color: stageStyle.text, background: stageStyle.bg,
            border: `1px solid ${stageStyle.text}55`, borderRadius: '3px',
            padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
          }}>{stage}</span>
        )}
      </div>

      {/* Body */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        padding: '8px 0', minHeight: `${rows * 26 + 10}px`,
        background: 'linear-gradient(180deg, #1f1a1d 0%, #151114 100%)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sortedInputs.map(p => <NiaInputPin key={p.id} pin={p} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sortedOutputs.map(p => <NiaOutputPin key={p.id} pin={p} />)}
        </div>
      </div>
      
      {/* Gloss accent */}
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none', borderRadius: '10px' }} />
    </div>
  );
}
