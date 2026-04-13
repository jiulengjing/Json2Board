/**
 * t3dParser.ts — Backward Compatibility Re-export
 * =================================================
 * This file is kept so existing imports from schema test files and legacy code
 * continue to work without modification.
 *
 * New code should import directly from:
 *   - blueprintParser.ts  (Blueprint parsing + JsonPayload types)
 *   - safeLiteT3D.ts      (Shared Safe LiteT3D compressor)
 *   - materialParser.ts   (Material parsing)
 */
export type { PinData, NodeData, JsonNode, JsonEdge, JsonPayload } from './blueprintParser';
export { parseBlueprint, parseT3D } from './blueprintParser';
export { convertToSafeLiteT3D, convertToSafeLiteT3D as simplifyT3D } from './safeLiteT3D';

// T3DNode is an internal type in blueprintParser, expose a minimal public alias if needed
export type T3DNode = {
  nodeId: string; nodeName: string; className: string;
  typeLabel: string; uiType: string; posX: number; posY: number;
  pins: unknown[];
};
