import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, getPinColor } from '../../themes';

// ── UE5 blueprint header colors (Simplified Solid Palette) ──
const NODE_THEME: Record<string, { bg: string; border: string; icon: string }> = {
  event:    { bg: '#a12323', border: '#ff4444', icon: '⚡' },
  function: { bg: '#2359a1', border: '#44aaff', icon: 'ƒ' },
  macro:    { bg: '#4a4a4a', border: '#888888', icon: 'M' },
  variable: { bg: '#23a159', border: '#44ffaa', icon: '◈' },
  get:      { bg: '#2c3e50', border: '#34495e', icon: '👁' },
  set:      { bg: '#2359a1', border: '#44aaff', icon: '✎' },
  math:     { bg: '#ecd67a', border: '#f3e5ab', icon: '∑' }, // Pale Yellow
};

// SVG Paths for Pins
const EXEC_PATH = "M 0 0 L 7 0 L 11 5 L 7 10 L 0 10 Z";
const DATA_PATH = "M 5 0 A 5 5 0 1 1 5 10 A 5 5 0 1 1 5 0 Z";

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px', color: '#e0e0e0', fontWeight: 500,
  textShadow: '0 1px 2px #000', userSelect: 'none', padding: '0 4px',
};

const VALUE_STYLE: React.CSSProperties = {
  fontSize: '10px', color: '#999', background: 'rgba(0,0,0,0.4)', 
  padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)',
  marginLeft: '6px', fontStyle: 'italic', maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis'
};

function PinIcon({ color, type, isConnected }: { color: string; type: string; isConnected: boolean }) {
  const isExec = type === 'exec';
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ overflow: 'visible' }}>
      <path 
        d={isExec ? EXEC_PATH : DATA_PATH} 
        fill={isConnected ? color : 'transparent'} 
        stroke={color} 
        strokeWidth="1.5"
        style={{ filter: isConnected ? `drop-shadow(0 0 3px ${color})` : 'none' }}
      />
      {!isConnected && !isExec && <circle cx="5" cy="5" r="1.5" fill={color} opacity="0.4" />}
    </svg>
  );
}

function InputPin({ pin, hideLabel }: { pin: PinData; hideLabel?: boolean }) {
  const c = getPinColor('blueprint', pin);
  const isConnected = pin.isConnected as any as boolean;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '26px', paddingLeft: '16px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: '12px', height: '12px', left: '-6px', top: '50%', transform: 'translateY(-50%)',
        background: 'transparent', border: 'none', zIndex: 10
      }}>
        <div style={{ pointerEvents: 'none' }}><PinIcon color={c} type={pin.type} isConnected={isConnected} /></div>
      </Handle>
      <div style={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
        {pin.label && !hideLabel && <span style={LABEL_STYLE}>{pin.label}</span>}
        {!hideLabel && pin.defaultValue && <div style={VALUE_STYLE}>{pin.defaultValue}</div>}
      </div>
    </div>
  );
}

function OutputPin({ pin, hideLabel }: { pin: PinData; hideLabel?: boolean }) {
  const c = getPinColor('blueprint', pin);
  const isConnected = pin.isConnected as any as boolean;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '26px', paddingRight: '16px' }}>
      {pin.label && !hideLabel && <span style={LABEL_STYLE}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: '12px', height: '12px', right: '-12px', top: '50%', transform: 'translateY(-50%)',
        background: 'transparent', border: 'none', zIndex: 10
      }}>
        <div style={{ pointerEvents: 'none' }}><PinIcon color={c} type={pin.type} isConnected={isConnected} /></div>
      </Handle>
    </div>
  );
}

export default function BlueprintNode({ data }: { data: NodeData }) {
  const theme = useMemo(() => NODE_THEME[data.nodeType] ?? NODE_THEME.function, [data.nodeType]);
  
  const sortedInputs = useMemo(() => 
    [...data.inputs.filter(p => p.type === 'exec'), ...data.inputs.filter(p => p.type !== 'exec')],
    [data.inputs]
  );
  const sortedOutputs = useMemo(() => 
    [...data.outputs.filter(p => p.type === 'exec'), ...data.outputs.filter(p => p.type !== 'exec')],
    [data.outputs]
  );

  const rows = Math.max(sortedInputs.length, sortedOutputs.length, 1);
  const isMath = data.nodeType === 'math';

  return (
    <div style={{
      minWidth: '180px', borderRadius: '8px', overflow: 'hidden',
      border: `1.5px solid rgba(0,0,0,0.85)`,
      boxShadow: `0 8px 24px rgba(0,0,0,0.6)`,
      background: '#222224', position: 'relative',
    }}>
      {/* Accent strip */}
      <div style={{ height: '2px', background: theme.border }} />
      {/* Header - Solid Color */}
      <div style={{
        background: theme.bg,
        padding: '6px 14px', borderBottom: '1.5px solid rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span style={{ fontSize: '12px', opacity: 0.8, color: isMath ? '#000' : '#fff' }}>{theme.icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: isMath ? '#333' : '#fff', textShadow: isMath ? 'none' : '0 1px 3px #000' }}>{data.label}</span>
      </div>
      {/* Body */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '8px 0',
        minHeight: `${rows * 26 + 12}px`,
        background: '#1a1a1c',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{sortedInputs.map(p => <InputPin key={p.id} pin={p} />)}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{sortedOutputs.map(p => <OutputPin key={p.id} pin={p} />)}</div>
      </div>
    </div>
  );
}
