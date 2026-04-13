/**
 * Blueprint Parser
 * ================
 * Parses UE5 Blueprint T3D / Lite-T3D text into a JsonPayload for React Flow rendering.
 * Uses the shared convertToSafeLiteT3D compressor from safeLiteT3D.ts.
 */
import { SchemaType } from '../themes';
import { convertToSafeLiteT3D } from './safeLiteT3D';

export interface PinData {
  id: string;
  label: string;
  type: 'exec' | 'data';
  dataType?: string;
  defaultValue?: string;
  displayOnly?: boolean;
  isConnected?: boolean;
  meta?: Record<string, unknown>;
}

export interface NodeData {
  nodeType: string;
  label: string;
  inputs: PinData[];
  outputs: PinData[];
  typeLabel?: string;
  meta?: Record<string, unknown>;
}

export interface JsonNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  inputs: PinData[];
  outputs: PinData[];
  meta?: Record<string, unknown>;
}

export interface JsonEdge {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface JsonPayload {
  version: string;
  schemaType: SchemaType;
  name: string;
  nodes: JsonNode[];
  edges: JsonEdge[];
}

interface T3DPin {
  pinId: string;
  pinName: string;
  pinCategory: string;
  direction: 'IN' | 'OUT';
  linkedToIds: { nodeId: string, pinId: string }[];
  defaultValue: string;
  pinDataType: string;
  bHidden: boolean;
  bNotConnectable: boolean;
  inLinks: { targetNodeName: string, targetPinName: string }[];
  outLinks: { targetNodeName: string, targetPinName: string }[];
  bDisplayOnly?: boolean;
}

interface T3DNode {
  nodeId: string;
  nodeName: string;
  className: string;
  typeLabel: string;
  uiType: string;
  posX: number;
  posY: number;
  pins: T3DPin[];
}

/**
 * Main Blueprint T3D Parser.
 * Accepts raw UE5 Blueprint T3D or AI-generated Lite-T3D.
 */
export function parseBlueprint(t3dText: string, schemaType: SchemaType = 'blueprint'): { dsl: string, payload: JsonPayload } {
  if (!t3dText) return { dsl: '', payload: { version: '1.0', schemaType, name: 'Empty', nodes: [], edges: [] } };

  const dsl = convertToSafeLiteT3D(t3dText);
  const nodes: T3DNode[] = [];
  const nodeDict = new Map<string, T3DNode>();

  // Strip comment lines before parsing (AI models sometimes add // annotations)
  const cleanedText = t3dText.split('\n')
    .filter(l => { const t = l.trim(); return t && !t.startsWith('//') && !t.startsWith('#'); })
    .join('\n');

  // ==========================================
  // PASS 1: Node & Pin Extraction
  // ==========================================
  const nodeBlocks = cleanedText.split('Begin Object');
  nodeBlocks.shift();

  for (const block of nodeBlocks) {
    const blockBody = block.split('End Object')[0];
    const match = /Class=([^\s]+)\s+Name="([^"]+)"/.exec(block);
    if (!match) continue;

    const className = match[1];
    const nodeId = match[2];

    if (className.includes('EdGraphNode_Comment')) continue;

    let nodeName = nodeId;
    let typeLabel = 'Node';
    let uiType = 'function';
    const isPure = /bDefaultsToPureFunc=True/.test(blockBody);
    
    // UI Type Deduction
    if (className.includes('Event') || className.includes('Input') || className.includes('K2Node_CustomEvent')) {
      typeLabel = 'Event'; uiType = 'event';
    } else if (className.includes('IfThenElse') || className.includes('MacroInstance') || className.includes('ExecutionSequence')) {
      typeLabel = 'Macro'; uiType = 'macro';
    } else if (className.includes('VariableGet')) {
      typeLabel = 'Get'; uiType = 'get'; 
    } else if (className.includes('VariableSet')) {
      typeLabel = 'Set'; uiType = 'set';
    } else if (isPure) {
      typeLabel = 'Pure'; uiType = 'variable'; 
    }

    const extractAttr = (pat: RegExp) => {
      const m = pat.exec(blockBody);
      return m ? m[1] : null;
    };

    // Name Extraction
    const fnName = extractAttr(/FunctionReference=\(.*MemberName="([^"]+)"/);
    const varNameAttr = extractAttr(/VariableReference=\(.*MemberName="([^"]+)"/);
    if (fnName) nodeName = fnName;
    else if (varNameAttr) nodeName = varNameAttr;
    else if (className.includes('IfThenElse')) nodeName = 'Branch';

    // Math nodes
    const isMath = (
      /equal|multiply|add|subtract|divide|and|or|not|less|greater|abs|min|max|sqrt|sin|cos|tan|percent/i.test(nodeName) ||
      className.includes('K2Node_CommutativeAssociativeBinaryOperator')
    );
    if (isMath) {
      uiType = 'math';
      if (!nodeName.startsWith('Math_')) nodeName = `Math_${nodeName}`;
    }

    const pX = parseInt(extractAttr(/NodePosX=([-\d]+)/) || '0', 10);
    const pY = parseInt(extractAttr(/NodePosY=([-\d]+)/) || '0', 10);

    const pins: T3DPin[] = [];
    const pinChunks = blockBody.split('CustomProperties Pin (');
    pinChunks.shift();

    for (const chunk of pinChunks) {
      const pIdMatch = /PinId="?([0-9a-zA-Z\-]+)"?/.exec(chunk);
      let pName = /PinName="([^"]*)"/.exec(chunk)?.[1] || '';
      const pId = pIdMatch ? pIdMatch[1] : pName;
      const pFriendly = /PinFriendlyName=("([^"]*)"|NSLOCTEXT\([^)]*\))/.exec(chunk)?.[1];
      if (pFriendly) pName = pFriendly.includes('NSLOCTEXT') ? (/NSLOCTEXT\([^,]*,[^,]*,[ ]*"([^"]+)"\)/.exec(pFriendly)?.[1] || pName) : pFriendly.replace(/"/g, '');

      const pCategory = /PinType\.PinCategory="([^"]*)"/.exec(chunk)?.[1] || '';
      const pDir = /Direction="EGPD_Output"/.test(chunk) ? 'OUT' : 'IN';
      const bHidden = /bHidden=True/.test(chunk);

      const pDataTypeMatch = /PinType\.PinSubCategoryObject="?([^"]*)"?/.exec(chunk);
      let pDataType = pCategory;
      if (pDataTypeMatch && pDataTypeMatch[1] !== 'None') {
          const parts = pDataTypeMatch[1].split('.');
          pDataType = parts.pop()?.replace(/[/'"]/g, '').toLowerCase() || pCategory;
      }
      if (pDataType === 'bool') pDataType = 'boolean';
      if (pDataType === 'int' || pDataType === 'int32') pDataType = 'integer';

      const linkedToIds: {nodeId: string, pinId: string}[] = [];
      const linkMatch = /LinkedTo=\((.+?)\)/.exec(chunk);
      if (linkMatch) {
          linkMatch[1].split(',').filter(s => s.trim()).forEach(l => {
              const [node, pin] = l.trim().split(' ');
              if (node && pin) linkedToIds.push({ nodeId: node, pinId: pin });
          });
      }

      const defMatch = /DefaultValue="([^"]+)"/.exec(chunk);

      pins.push({
        pinId: pId, pinName: pName, pinCategory: pCategory, direction: pDir,
        linkedToIds, defaultValue: defMatch ? defMatch[1] : '',
        pinDataType: pDataType, bHidden, bNotConnectable: false, inLinks: [], outLinks: []
      });
    }

    const node: T3DNode = { nodeId, nodeName, className, typeLabel, uiType, posX: pX, posY: pY, pins };
    nodes.push(node);
    nodeDict.set(nodeId, node);
  }

  // ==========================================
  // PASS 2: Payload Generation & Linking
  // ==========================================
  const jsonNodes: JsonNode[] = [];
  const jsonEdges: JsonEdge[] = [];
  const addedEdges = new Set<string>();

  for (const node of nodes) {
    const inputs: PinData[] = [];
    const outputs: PinData[] = [];

    for (const pin of node.pins) {
      // Edge Generation: Check for links on ANY pin (IN or OUT)
      for (const link of pin.linkedToIds) {
        const targetNode = nodeDict.get(link.nodeId);
        if (targetNode) {
          const targetPin = targetNode.pins.find(p => p.pinId === link.pinId || p.pinName === link.pinId);
          if (targetPin) {
            let sNode, sHandle, tNode, tHandle;
            if (pin.direction === 'OUT') {
              sNode = node.nodeId; sHandle = pin.pinId;
              tNode = targetNode.nodeId; tHandle = targetPin.pinId;
            } else {
              sNode = targetNode.nodeId; sHandle = targetPin.pinId;
              tNode = node.nodeId; tHandle = pin.pinId;
            }
            const edgeId = `${sNode}-${sHandle}-${tNode}-${tHandle}`;
            if (!addedEdges.has(edgeId)) {
              addedEdges.add(edgeId);
              jsonEdges.push({ source: sNode, sourceHandle: sHandle, target: tNode, targetHandle: tHandle });
            }
          }
        }
      }

      if (!pin.bHidden) {
        const isConnected = pin.linkedToIds.length > 0;
        const pinObj: PinData = {
          id: pin.pinId,
          label: pin.pinName,
          type: (schemaType === 'material' || pin.pinCategory !== 'exec') ? 'data' : 'exec',
          dataType: pin.pinDataType,
          isConnected
        };
        if (pin.direction === 'IN' && pin.linkedToIds.length === 0 && pin.defaultValue) {
          pinObj.defaultValue = pin.defaultValue;
        }
        if (pin.direction === 'IN') inputs.push(pinObj);
        else outputs.push(pinObj);
      }
    }

    jsonNodes.push({
      id: node.nodeId, type: 'blueprint', label: node.nodeName,
      position: { x: node.posX, y: node.posY },
      inputs, outputs,
      meta: { nodeType: node.uiType, typeLabel: node.typeLabel, isCompact: false }
    });
  }

  return { dsl, payload: { version: '1.0', schemaType, name: 'Parsed', nodes: jsonNodes, edges: jsonEdges } };
}

// ── Backward-compat alias (used internally by BlueprintWorkspace) ──
export const parseT3D = parseBlueprint;
