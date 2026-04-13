import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import { NodeData, PinData, getPinColor } from '../../themes';

// ── UE5 Material Editor node header colors (Premium Deep Space Version) ──
const NODE_THEME: Record<string, { h1: string; h2: string; border: string; glow: string; icon: string }> = {
  input:   { h1: '#8a6515', h2: '#2a1e04', border: '#cca035', glow: 'rgba(204,160,53,0.5)',  icon: '▶' },
  macro:   { h1: '#263a6a', h2: '#0b1221', border: '#4b65a5', glow: 'rgba(75,101,165,0.5)',    icon: '∑' },
  function:{ h1: '#263a6a', h2: '#0b1221', border: '#4b65a5', glow: 'rgba(75,101,165,0.5)',    icon: 'ƒ' },
  get:     { h1: '#4d1e8a', h2: '#16082a', border: '#7a3fd9', glow: 'rgba(122,63,217,0.5)', icon: '⬛' },
  output:  { h1: '#8a4b08', h2: '#281502', border: '#cc7518', glow: 'rgba(204,117,24,0.5)',  icon: '◉' },

  Math:       { h1: '#326b4f', h2: '#0d2217', border: '#47946d', glow: 'rgba(71,148,109,0.5)', icon: 'ƒ' }, 
  Constant:   { h1: '#757520', h2: '#202008', border: '#afaf36', glow: 'rgba(175,175,54,0.5)', icon: '1' }, 
  Coordinate: { h1: '#821f1f', h2: '#240707', border: '#bd3333', glow: 'rgba(189,51,51,0.5)', icon: 'uv' }, 
  Texture:    { h1: '#1e7575', h2: '#082323', border: '#33acac', glow: 'rgba(51,172,172,0.5)', icon: 'T' }, 
  Custom:     { h1: '#555555', h2: '#141414', border: '#888888', glow: 'rgba(136,136,136,0.5)', icon: '{;}' },
  Root:       { h1: '#333333', h2: '#0a0a0a', border: '#666666', glow: 'rgba(102,102,102,0.3)', icon: '☆' }, 
};

const DIAMOND = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '11px', color: '#b8b8c8', fontWeight: 500,
  textShadow: '0 1px 2px rgba(0,0,0,0.9)', userSelect: 'none',
  padding: '0 4px',
};

const VALUE_BOX_STYLE: React.CSSProperties = {
  fontSize: '10px', color: '#88a', 
  background: 'rgba(0,0,0,0.4)', 
  padding: '1px 6px', borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.05)',
  marginLeft: '6px', fontStyle: 'italic',
  maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis'
};

function PinValue({ value }: { value?: string }) {
  if (!value || value === '0.0' || value === '0') return null;
  const displayValue = (value.length > 18) ? value.substring(0, 15) + '...' : value;
  return <div style={VALUE_BOX_STYLE} title={value}>{displayValue}</div>;
}

/** Display-only value row — no Handle, just label + value */
function MatValueRow({ pin }: { pin: PinData }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '22px', padding: '0 12px', gap: '8px' }}>
      <span style={{ fontSize: '10px', color: '#778', fontWeight: 600 }}>{pin.label}</span>
      <span style={{ 
        fontSize: '10px', color: '#8cd9a0', fontFamily: 'monospace', 
        background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '3px' 
      }}>{pin.defaultValue}</span>
    </div>
  );
}

function MatInputPin({ pin }: { pin: PinData }) {
  const c = getPinColor('material', pin);
  const isTexture = pin.dataType?.startsWith('texture') || pin.dataType === 'samplerstate';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '24px', paddingLeft: '18px' }}>
      <Handle type="target" position={Position.Left} id={pin.id} style={{
        width: '10px', height: '10px', left: '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: isTexture ? '0' : '50%',
        background: c, border: `1.5px solid rgba(0,0,0,0.6)`,
        clipPath: isTexture ? DIAMOND : undefined,
        boxShadow: `0 0 6px ${c}66`,
      }} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {pin.label && <span style={LABEL_STYLE}>{pin.label}</span>}
        <PinValue value={pin.defaultValue} />
      </div>
    </div>
  );
}

function MatOutputPin({ pin, hideLabel }: { pin: PinData; hideLabel?: boolean }) {
  const c = getPinColor('material', pin);
  const isTexture = pin.dataType?.startsWith('texture') || pin.dataType === 'samplerstate';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '24px', paddingRight: '18px' }}>
      {pin.label && !hideLabel && <span style={LABEL_STYLE}>{pin.label}</span>}
      <Handle type="source" position={Position.Right} id={pin.id} style={{
        width: '10px', height: '10px', right: '-5px', top: '50%', transform: 'translateY(-50%)',
        borderRadius: isTexture ? '0' : '50%',
        background: c, border: `1.5px solid rgba(0,0,0,0.6)`,
        clipPath: isTexture ? DIAMOND : undefined,
        boxShadow: `0 0 6px ${c}66`,
      }} />
    </div>
  );
}

function CheckerboardPreview({ label }: { label: string }) {
  return (
    <div style={{
      width: '90px', height: '90px', margin: '6px auto',
      background: 'repeating-conic-gradient(#2a2a36 0% 25%, #1f1f2a 0% 50%) 50% / 16px 16px',
      border: '2px solid #111', borderRadius: '4px',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '4px',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.3)'
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
  const typeLabel = (data.metadata?.typeLabel as string) || (data.meta?.typeLabel as string) || '';
  const customCode = (data.metadata?.customCode as string) || '';
  const theme = useMemo(() => NODE_THEME[typeLabel] ?? NODE_THEME[data.nodeType] ?? NODE_THEME.function, [data.nodeType, typeLabel]);
  
  const isMath = typeLabel === 'Math' || (data.nodeType === 'macro' && ['Add', 'Multiply', 'Subtract', 'Divide'].includes(data.label));
  const mathSymbol = data.label === 'Add' ? '+' : data.label === 'Multiply' ? '×' : data.label === 'Subtract' ? '−' : data.label === 'Divide' ? '÷' : data.label;

  if (isMath && ['+', '×', '−', '÷'].includes(mathSymbol)) {
     return (
      <div 
        className="gtg-material-node"
        style={{
          minWidth: '90px', borderRadius: '8px', overflow: 'visible',
          border: `1.5px solid rgba(0,0,0,0.8)`,
          boxShadow: `0 0 0 1px rgba(0,0,0,0.9), 0 8px 30px rgba(0,0,0,0.6), 0 0 15px ${theme.glow}`,
          background: 'rgba(20,20,24,0.85)', position: 'relative',
          display: 'flex', alignItems: 'center', padding: '6px 0',
          ['--hover-glow' as any]: theme.glow
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{data.inputs.map(p => <MatInputPin key={p.id} pin={p} />)}</div>
        <div style={{ fontSize: '22px', fontWeight: 900, color: '#e8e0f8', opacity: 0.8, padding: '0 8px', userSelect: 'none', textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>{mathSymbol}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>{data.outputs.map(p => <MatOutputPin key={p.id} pin={p} hideLabel />)}</div>
      </div>
     );
  }

  const isRoot = typeLabel === 'Root';
  const isCustom = typeLabel === 'Custom';
  const isTexture = typeLabel === 'Texture' || typeLabel === 'TextureSample' || data.nodeType === 'get';
  const rows = Math.max(data.inputs.filter(p => !p.displayOnly).length, data.outputs.length, 1);

  return (
    <div 
      className="gtg-material-node"
      style={{
        minWidth: isTexture ? '240px' : isCustom ? '260px' : isRoot ? '280px' : '200px', borderRadius: '10px', overflow: 'hidden',
        border: `1.5px solid rgba(0,0,0,0.9)`,
        boxShadow: `0 12px 36px rgba(0,0,0,0.7), 0 0 20px ${theme.glow}`,
        background: 'rgba(21,21,24,0.85)', position: 'relative',
        ['--hover-glow' as any]: theme.glow
      }}
    >
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.h1} 0%, ${theme.h2} 100%)`,
        padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '10px',
        borderBottom: `1.5px solid rgba(0,0,0,0.5)`, position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: '11px', opacity: 0.8, fontFamily: 'monospace' }}>{theme.icon}</span>
        <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#e8e0f8', letterSpacing: '0.01em', textShadow: '0 1px 4px #000' }}>{data.label}</span>
      </div>

      {/* Body */}
      <div style={{
        background: 'linear-gradient(180deg, #222228 0%, #1a1a1e 100%)',
      }}>
        {isRoot ? (
          <div style={{ padding: '8px 0' }}>
            {data.inputs.map(p => p.displayOnly
              ? <MatValueRow key={p.id} pin={p} />
              : <MatInputPin key={p.id} pin={p} />
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: isTexture ? '1.2fr auto 1fr' : '1fr 1fr',
            padding: '8px 0', minHeight: `${rows * 24 + 10}px`,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.inputs.filter(p => p.displayOnly).map(p => <MatValueRow key={p.id} pin={p} />)}
              {data.inputs.filter(p => !p.displayOnly).map(p => <MatInputPin key={p.id} pin={p} />)}
            </div>
            {isTexture && (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 4px' }}>
                  <CheckerboardPreview label={data.label} />
               </div>
            )}
            {!isTexture && isCustom && customCode && (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 8px', maxWidth: '200px' }}>
                  <div style={{
                    width: '100%', background: '#111', padding: '6px', borderRadius: '4px',
                    border: '1px solid #333', color: '#a0d18b', fontSize: '9px',
                    fontFamily: '"Fira Code", monospace', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'pre-wrap', maxHeight: '100px',
                    display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical'
                  }}>
                    {customCode}
                  </div>
               </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>{data.outputs.map(p => <MatOutputPin key={p.id} pin={p} />)}</div>
          </div>
        )}
      </div>
      
      {/* Gloss accent */}
      <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none', borderRadius: '10px' }} />
    </div>
  );
}
