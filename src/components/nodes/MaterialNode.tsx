import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, MATERIAL_PIN_COLORS } from '../../themes';

// ── UE5 Material Editor node header colors ──
const NODE_THEME: Record<string, { h1: string; h2: string; border: string; glow: string; icon: string }> = {
  input:   { h1: '#6b4e10', h2: '#4e3800', border: '#a07228', glow: 'rgba(160,114,40,0.3)',  icon: '▶' },
  macro:   { h1: '#1a2540', h2: '#101828', border: '#2a3a60', glow: 'rgba(42,58,96,0.4)',    icon: '∑' },
  function:{ h1: '#1a2540', h2: '#101828', border: '#2a3a60', glow: 'rgba(42,58,96,0.4)',    icon: 'ƒ' },
  get:     { h1: '#301455', h2: '#200c3e', border: '#6030a0', glow: 'rgba(96,48,160,0.35)', icon: '⬛' },
  output:  { h1: '#5a3000', h2: '#3a1e00', border: '#9a5a00', glow: 'rgba(154,90,0,0.35)',  icon: '◉' },

  Math:       { h1: '#26503c', h2: '#153020', border: '#306040', glow: 'rgba(48,96,64,0.4)', icon: 'ƒ' }, // Math Green
  Constant:   { h1: '#505016', h2: '#30300a', border: '#606020', glow: 'rgba(96,96,32,0.4)', icon: '1' }, // Constant Yellow
  Coordinate: { h1: '#5c1212', h2: '#300a0a', border: '#801818', glow: 'rgba(128,24,24,0.4)', icon: 'uv' }, // Coordinate Red
  Texture:    { h1: '#165050', h2: '#0a3030', border: '#206060', glow: 'rgba(32,96,96,0.4)', icon: 'T' }, // Texture Cyan
  Root:       { h1: '#222222', h2: '#111111', border: '#444444', glow: 'rgba(255,255,255,0.1)', icon: '☆' }, // Main Material Result
};

// Diamond shape for texture/sampler pins
const DIAMOND = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

const LABEL: React.CSSProperties = {
  fontSize: '11px', color: '#b8b8c8', lineHeight: 1, whiteSpace: 'nowrap', userSelect: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.8)'
};

function matPinColor(pin: PinData): string {
  return (pin.dataType && MATERIAL_PIN_COLORS[pin.dataType]) ?? '#9e9e9e';
}

/** Display-only value row — no Handle, just label + value (for bNotConnectable params like R, Y, UTiling) */
function MatValueRow({ pin }: { pin: PinData }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '20px', padding: '0 10px', gap: '8px' }}>
      <span style={{ fontSize: '10px', color: '#888899', whiteSpace: 'nowrap', userSelect: 'none' }}>{pin.label}</span>
      <span style={{ fontSize: '11px', color: '#d0d0e0', fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '0 5px', borderRadius: '3px', whiteSpace: 'nowrap' }}>{pin.defaultValue}</span>
    </div>
  );
}

function MatInputPin({ pin }: { pin: PinData }) {
  const c = matPinColor(pin);
  const isTexture = pin.dataType?.startsWith('texture') || pin.dataType === 'samplerstate';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '22px', paddingLeft: '16px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: '10px', height: '10px', left: '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: isTexture ? '0' : '50%',
        background: c, border: `1.5px solid rgba(0,0,0,0.5)`,
        clipPath: isTexture ? DIAMOND : undefined,
        boxShadow: `0 0 5px ${c}99`,
      }} />
      {pin.label && <span style={LABEL}>{pin.label}</span>}
    </div>
  );
}

function MatOutputPin({ pin, hideLabel }: { pin: PinData; hideLabel?: boolean }) {
  const c = matPinColor(pin);
  const isTexture = pin.dataType?.startsWith('texture') || pin.dataType === 'samplerstate';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '22px', paddingRight: '16px' }}>
      {pin.label && !hideLabel && <span style={LABEL}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: '10px', height: '10px', right: '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: isTexture ? '0' : '50%',
        background: c, border: `1.5px solid rgba(0,0,0,0.5)`,
        clipPath: isTexture ? DIAMOND : undefined,
        boxShadow: `0 0 5px ${c}99`,
      }} />
    </div>
  );
}

function CheckerboardPreview({ label }: { label: string }) {
  return (
    <div style={{
      width: '100px', height: '100px', margin: '4px auto',
      background: 'repeating-conic-gradient(#2a2a36 0% 25%, #1f1f2a 0% 50%) 50% / 16px 16px',
      border: '2px solid #111', borderRadius: '4px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '4px',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
    }}>
      <span style={{
         fontSize: '9px', color: '#fff', background: 'rgba(0,0,0,0.7)', 
         padding: '2px 4px', borderRadius: '3px', textShadow: '0 1px 2px rgba(0,0,0,0.9)',
         whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
      }}>
         {label}
      </span>
    </div>
  );
}

export default function MaterialNode({ data }: { data: NodeData }) {
  const typeLabel = (data.meta?.typeLabel as string) || '';
  const theme = useMemo(() => NODE_THEME[typeLabel] ?? NODE_THEME[data.nodeType] ?? NODE_THEME.function, [data.nodeType, typeLabel]);
  
  const isMath = typeLabel === 'Math' || (data.nodeType === 'macro' && ['Add', 'Multiply', 'Subtract', 'Divide'].includes(data.label));
  const mathSymbol = data.label === 'Add' ? '+' : data.label === 'Multiply' ? '×' : data.label === 'Subtract' ? '−' : data.label === 'Divide' ? '÷' : data.label;

  if (isMath && ['+', '×', '−', '÷'].includes(mathSymbol)) {
     return (
      <div style={{
        minWidth: '80px', borderRadius: '6px', overflow: 'visible',
        border: `1px solid ${theme.border}`,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.9), 0 0 16px ${theme.glow}, 0 8px 24px rgba(0,0,0,0.8)`,
        background: '#1a1a22', position: 'relative',
        display: 'flex', alignItems: 'center', padding: '4px 0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{data.inputs.map(p => <MatInputPin key={p.id} pin={p} />)}</div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#e8e0f8', opacity: 0.8, padding: '0 4px', userSelect: 'none' }}>{mathSymbol}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{data.outputs.map(p => <MatOutputPin key={p.id} pin={p} hideLabel />)}</div>
      </div>
     );
  }

  const isRoot = typeLabel === 'Root';
  const isTexture = typeLabel === 'Texture' || typeLabel === 'TextureSample' || data.nodeType === 'get';
  const rows = Math.max(data.inputs.filter(p => !p.displayOnly).length, data.outputs.length, 1);

  return (
    <div style={{
      minWidth: isTexture ? '260px' : isRoot ? '280px' : '220px', borderRadius: '6px', overflow: 'visible',
      border: `1px solid ${theme.border}`,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.9), 0 0 16px ${theme.glow}, 0 8px 24px rgba(0,0,0,0.8)`,
      background: '#1a1a22', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        borderRadius: '5px 5px 0 0', padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: `1px solid ${theme.border}88`, minHeight: '30px',
      }}>
        <span style={{ fontSize: '11px', opacity: 0.85, lineHeight: 1, flexShrink: 0, fontFamily: 'monospace' }}>{theme.icon}</span>
        <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, color: '#e8e0f8', letterSpacing: '0.02em', lineHeight: 1, whiteSpace: 'nowrap', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>{data.label}</span>
      </div>
      {/* Pin area */}
      {isRoot ? (
        // Root node: single-column, interleave connectable + display-only pins in original order
        <div style={{ paddingTop: '6px', paddingBottom: '6px', background: 'linear-gradient(180deg, #1e1e2a 0%, #18181e 100%)', borderRadius: '0 0 5px 5px' }}>
          {data.inputs.map(p => p.displayOnly
            ? <MatValueRow key={p.id} pin={p} />
            : <MatInputPin key={p.id} pin={p} />
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: isTexture ? '1fr auto 1fr' : '1fr 1fr',
          paddingTop: '6px', paddingBottom: '6px',
          minHeight: `${rows * 22 + 12}px`,
          background: 'linear-gradient(180deg, #1e1e2a 0%, #18181e 100%)',
          borderRadius: '0 0 5px 5px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data.inputs.filter(p => p.displayOnly).map(p => <MatValueRow key={p.id} pin={p} />)}
            {data.inputs.filter(p => !p.displayOnly).map(p => <MatInputPin key={p.id} pin={p} />)}
          </div>
          {isTexture && (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CheckerboardPreview label={data.label} />
             </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>{data.outputs.map(p => <MatOutputPin key={p.id} pin={p} />)}</div>
        </div>
      )}
    </div>
  );
}
