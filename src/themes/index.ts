// ─────────────────────────────────────────────
// themes/index.ts — Unified schema type system
// ─────────────────────────────────────────────

export type SchemaType = 'blueprint' | 'material' | 'niagara';

// ── Shared pin interface (used across all node types) ──
export interface PinData {
  id: string;
  label: string;
  type: 'exec' | 'data';
  dataType?: string;
  displayOnly?: boolean;   // Read-only value label (no wire handle)
  defaultValue?: string;   // Value to display when displayOnly=true
}

// ── Shared node data interface for ReactFlow ──
export interface NodeData extends Record<string, unknown> {
  nodeType: string;
  label: string;
  inputs: PinData[];
  outputs: PinData[];
  meta?: Record<string, unknown>;
}

// ── Pin color palettes ──

export const BLUEPRINT_PIN_COLORS: Record<string, string> = {
  exec: '#FFFFFF', boolean: '#9B0000', integer: '#1EE5B3',
  float: '#A1FF42', double: '#A1FF42', string: '#FF00D5',
  text: '#FF00D5', name: '#d0c040', vector: '#FFC400',
  vector2d: '#FFC400', rotator: '#98b9f5', transform: '#f0803c',
  object: '#0070F0', class: '#6495ed', byte: '#008080', struct: '#002776', wildcard: '#808080',
};

export const MATERIAL_PIN_COLORS: Record<string, string> = {
  float: '#8cd9a0', float2: '#60d8f8', float3: '#c8a0f8', float4: '#f0a0d8',
  texture2d: '#c87fff', texturecube: '#a060e0', color: '#ff9060',
  uv: '#60d0ff', normal: '#a0c0ff', material: '#ffd060',
  samplerstate: '#888888', mask: '#f8d050', opacity: '#80d0a0',
  metallic: '#b0b0b0', roughness: '#d0a060', emissive: '#ff8040',
};

export const NIAGARA_PIN_COLORS: Record<string, string> = {
  exec: '#ff8040', float: '#8cd9a0', vector2: '#60d8f8',
  vector3: '#c8a0f8', vector4: '#f0a0d8', color: '#ff9060',
  int32: '#38b4f0', bool: '#cc2020', enum: '#d0c040',
  half: '#93c847', matrix: '#a060ff',
};

export function getPinColors(schemaType: SchemaType): Record<string, string> {
  if (schemaType === 'material') return MATERIAL_PIN_COLORS;
  if (schemaType === 'niagara') return NIAGARA_PIN_COLORS;
  return BLUEPRINT_PIN_COLORS;
}

export function getPinColor(schemaType: SchemaType, pin: PinData): string {
  if (pin.type === 'exec') return schemaType === 'niagara' ? '#ff8040' : '#ffffff';
  const palette = getPinColors(schemaType);
  return (pin.dataType && palette[pin.dataType]) ?? '#9e9e9e';
}

// ── Schema identity tokens ──

export const SCHEMA_ACCENT: Record<SchemaType, string> = {
  blueprint: '#3b82f6',
  material:  '#c084fc',
  niagara:   '#f97316',
};

export const SCHEMA_ICON: Record<SchemaType, string> = {
  blueprint: '📄',
  material:  '🎨',
  niagara:   '✨',
};

export const SCHEMA_LABEL: Record<SchemaType, string> = {
  blueprint: 'Blueprint',
  material:  'Material Editor',
  niagara:   'Niagara',
};

export const SCHEMA_SUBTITLE: Record<SchemaType, string> = {
  blueprint: 'Blueprint Renderer',
  material:  'Material Editor',
  niagara:   'Niagara Editor',
};
