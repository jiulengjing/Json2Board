import { SchemaType } from '../../themes';

/**
 * Detects the schema type of a pasted Unreal Engine Raw Text block.
 * Material nodes usually contain references to MaterialGraphNode.
 * Niagara nodes usually contain references to NiagaraNode.
 */
export function detectRawTextSchema(text: string): SchemaType {
  const t = text || '';
  if (t.includes('MaterialGraphNode') || t.includes('/Script/UnrealEd.Material') || t.includes('MaterialExpression')) {
    return 'material';
  }
  if (t.includes('NiagaraNode') || t.includes('/Script/NiagaraEditor')) {
    return 'niagara';
  }
  return 'blueprint';
}

/**
 * Detects the schema type of a generated GTG-Script block.
 * We can infer it by looking at the types of the nodes declared: (material), (niagara), etc.
 */
export function detectGtgScriptSchema(gtgText: string): SchemaType {
  const gtg = gtgText || '';
  // Simple heuristic based on GTG syntax: [Node: XYZ] (type)
  const nodeTypeMatches = Array.from(gtg.matchAll(/\[Node:\s*[^\]]+\]\s*\(([^)]+)\)/gi));
  
  for (const match of nodeTypeMatches) {
    const typeLabel = match[1].toLowerCase();
    if (typeLabel.includes('root') || typeLabel.includes('texture') || typeLabel.includes('coordinate') || typeLabel.includes('math') || typeLabel.includes('material')) return 'material';
    if (typeLabel.includes('niagara')) return 'niagara';
  }
  
  return 'blueprint';
}
