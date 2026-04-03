export interface T3DPin {
  pinId: string;
  pinName: string;
  pinCategory: string;
  pinDataType: string;
  direction: 'IN' | 'OUT';
  linkedToIds: { nodeId: string; pinId: string }[];
  defaultValue: string;
  bHidden: boolean;
  
  // Filled in Pass 2
  inLinks: { targetNodeName: string; targetPinName: string }[];
  outLinks: { targetNodeName: string; targetPinName: string }[];
}

export interface T3DNode {
  nodeId: string;
  nodeName: string;
  className: string;
  typeLabel: string;
  uiType: 'event' | 'function' | 'macro' | 'variable' | 'reroute';
  posX: number;
  posY: number;
  pins: T3DPin[];
}

export interface JsonPayload {
  version: string;
  schemaType?: 'blueprint' | 'material' | 'niagara';
  name?: string;
  nodes: any[];
  edges: any[];
}

/**
 * Two-Pass T3D Blueprint text parser
 * Outputs Dual-Track data: DSL (for LLMs) and full JSON Payload (for UI Renderer)
 */
export function parseT3D(t3dText: string): { dsl: string, payload: JsonPayload } {
  if (!t3dText) return { dsl: '', payload: { version: '1.0', nodes: [], edges: [] } };

  const nodes: T3DNode[] = [];
  const nodeDict = new Map<string, T3DNode>();
  const pinDict = new Map<string, T3DPin>();
  const nameCounts = new Map<string, number>();

  // ==========================================
  // PASS 1: Parse string to build data maps
  // ==========================================
  const blockRegex = /Begin Object Class=([^\s]+) Name="([^"]+)"([\s\S]*?)End Object/g;
  let match;

  while ((match = blockRegex.exec(t3dText)) !== null) {
    const className = match[1];
    const nodeId = match[2];
    const blockBody = match[3];

    if (className === '/Script/BlueprintGraph.EdGraphNode_Comment' || className === 'EdGraphNode_Comment') {
      continue;
    }

    let nodeName = nodeId;
    let typeLabel = 'Node';
    let uiType: 'event' | 'function' | 'macro' | 'variable' | 'reroute' = 'function';

    // Type label deduction & UI Color mapping (Red, Green, Blue, Gray)
    const isPure = /bDefaultsToPureFunc=True/.test(blockBody);
    
    if (className.includes('Event') || className.includes('Input') || className.includes('K2Node_CustomEvent')) {
      typeLabel = 'Event';
      uiType = 'event'; // Red
    } else if (className.includes('IfThenElse') || className.includes('MacroInstance') || className.includes('ExecutionSequence')) {
      typeLabel = className.includes('IfThenElse') ? 'IfThenElse' : 'Macro';
      uiType = 'macro'; // Gray
    } else if (className === 'K2Node_Knot') {
      typeLabel = 'Reroute';
      uiType = 'reroute';
    } else if (isPure || className.includes('K2Node_VariableGet')) {
      typeLabel = 'Pure';
      uiType = 'variable'; // Green
    } else {
      typeLabel = 'Function';
      uiType = 'function'; // Blue
    }

    // NodeName deduction
    const extractAttr = (pat: RegExp) => {
      const m = pat.exec(blockBody);
      return m ? m[1] : null;
    };

    if (className.includes('K2Node_SwitchEnum')) {
      const enumRef = extractAttr(/Enum="[^"]*\/([^/"]+)"/);
      nodeName = enumRef ? `Switch on ${enumRef}` : 'Switch Enum';
    } else if (className.includes('K2Node_CallFunction')) {
      const fnName = extractAttr(/FunctionReference=\(.*MemberName="([^"]+)"/);
      if (fnName) nodeName = fnName;
    } else if (className.includes('K2Node_VariableGet') || className.includes('K2Node_VariableSet')) {
      const varName = extractAttr(/VariableReference=\(.*MemberName="([^"]+)"/);
      if (varName) nodeName = varName;
    } else if (className.includes('K2Node_EnhancedInputAction')) {
      const actionRef = extractAttr(/InputAction="[^"]*\/([^/"]+)"/);
      if (actionRef) nodeName = actionRef;
    } else if (className.includes('K2Node_IfThenElse')) {
      nodeName = 'Branch';
    } else {
      const funcRef = extractAttr(/MemberName="([^"]+)"/);
      const customFunc = extractAttr(/CustomFunctionName="([^"]+)"/);
      const macroRef = extractAttr(/MacroTitle="([^"]+)"/);
      const nodeTitle = extractAttr(/NodeTitle="([^"]+)"/);
      
      if (funcRef && funcRef !== 'None') nodeName = funcRef;
      else if (customFunc && customFunc !== 'None') nodeName = customFunc;
      else if (macroRef && macroRef !== 'None') nodeName = macroRef;
      else if (nodeTitle && nodeTitle !== 'None') nodeName = nodeTitle;
      else if (className.startsWith('K2Node_')) nodeName = className.substring(7);
    }

    // Extract Positions
    const pX = parseInt(extractAttr(/NodePosX=([-\d]+)/) || '0', 10);
    const pY = parseInt(extractAttr(/NodePosY=([-\d]+)/) || '0', 10);

    const baseName = nodeName;
    const count = (nameCounts.get(baseName) || 0) + 1;
    nameCounts.set(baseName, count);

    const pins: T3DPin[] = [];
    const pinChunks = blockBody.split('CustomProperties Pin (');
    pinChunks.shift(); 

    for (const chunk of pinChunks) {
      const pId = /PinId=([0-9a-zA-Z\-]+)/.exec(chunk)?.[1] || '';
      let pName = /PinName="([^"]*)"/.exec(chunk)?.[1] || '';
      if (pName === 'self') pName = 'Target';

      const pDirStr = /Direction="([^"]+)"/.exec(chunk)?.[1];
      const pDir = pDirStr === 'EGPD_Output' ? 'OUT' : 'IN';
      const pCategory = /PinType\.PinCategory="([^"]*)"/.exec(chunk)?.[1] || 'exec';
      const bHidden = /bHidden=True/.test(chunk);
      
      let pDataType = pCategory;
      if (pCategory === 'object' || pCategory === 'struct' || pCategory === 'enum') {
          // just simplify it
          pDataType = pCategory;
      }

      const linkedToIds: {nodeId: string, pinId: string}[] = [];
      const linkMatch = /LinkedTo=\(\s*(.+?)\s*\)/.exec(chunk);
      if (linkMatch) {
        const links = linkMatch[1].split(',');
        for (const link of links) {
          const parts = link.trim().split(' ');
          if (parts.length >= 2) {
            linkedToIds.push({ nodeId: parts[0], pinId: parts[1] });
          }
        }
      }

      let pDefault = '';
      const defMatch = /DefaultValue="([\s\S]*?)"(?:,AutogeneratedDefaultValue|,PersistentGuid|,\s*\w+=|\)$)/.exec(chunk);
      if (defMatch) {
        pDefault = defMatch[1];
      }

      const pin: T3DPin = {
        pinId: pId,
        pinName: pName,
        pinCategory: pCategory,
        pinDataType: pDataType,
        direction: pDir,
        linkedToIds,
        defaultValue: pDefault,
        bHidden,
        inLinks: [],
        outLinks: []
      };

      pins.push(pin);
      if (pId) pinDict.set(pId, pin);
    }

    const node: T3DNode = {
      nodeId, nodeName, className, typeLabel, uiType, posX: pX, posY: pY, pins
    };
    nodes.push(node);
    nodeDict.set(nodeId, node);
  }

  // Rename pass for duplicates
  for (const [name, count] of nameCounts.entries()) {
    if (count > 1) {
      let idx = 1;
      for (const node of nodes) {
        if (node.nodeName === name) {
          node.nodeName = `${name}_${idx}`;
          idx++;
        }
      }
    }
  }

  // ==========================================
  // PASS 2: Bidirectional Linking & Payload Gen
  // ==========================================

  const jsonNodes: any[] = [];
  const jsonEdges: any[] = [];

  // Arrays to track what we added to prevent duplicate UI edges
  const addedEdges = new Set<string>();

  for (const node of nodes) {
    const inputs: any[] = [];
    const outputs: any[] = [];

    for (const pin of node.pins) {
      for (const link of pin.linkedToIds) {
        const targetNode = nodeDict.get(link.nodeId);
        if (!targetNode) continue;
        
        let targetPinName = link.pinId;
        const targetPin = targetNode.pins.find(p => p.pinId === link.pinId);
        if (targetPin) {
          targetPinName = targetPin.pinName;
        }

        if (pin.direction === 'OUT') {
          pin.outLinks.push({ targetNodeName: targetNode.nodeName, targetPinName });
          if (targetPin) {
            targetPin.inLinks.push({ targetNodeName: node.nodeName, targetPinName: pin.pinName });
          }
          
          const edgeId = `${node.nodeId}-${pin.pinId}-${targetNode.nodeId}-${link.pinId}`;
          if (!addedEdges.has(edgeId)) {
            addedEdges.add(edgeId);
            jsonEdges.push({
              source: node.nodeId, sourceHandle: pin.pinId,
              target: targetNode.nodeId, targetHandle: link.pinId
            });
          }

        } else {
          pin.inLinks.push({ targetNodeName: targetNode.nodeName, targetPinName });
          if (targetPin) {
            targetPin.outLinks.push({ targetNodeName: node.nodeName, targetPinName: pin.pinName });
          }

          const edgeId = `${targetNode.nodeId}-${link.pinId}-${node.nodeId}-${pin.pinId}`;
          if (!addedEdges.has(edgeId)) {
            addedEdges.add(edgeId);
            jsonEdges.push({
              source: targetNode.nodeId, sourceHandle: link.pinId,
              target: node.nodeId, targetHandle: pin.pinId
            });
          }
        }
      }

      // Collect UI pins if visible
      if (!pin.bHidden) {
        const pinObj = {
          id: pin.pinId,
          label: pin.pinName,
          type: pin.pinCategory === 'exec' ? 'exec' : 'data',
          dataType: pin.pinDataType
        };
        if (pin.direction === 'IN') inputs.push(pinObj);
        else outputs.push(pinObj);
      }
    }

    jsonNodes.push({
      id: node.nodeId,
      type: 'blueprint',
      label: node.nodeName,
      position: { x: node.posX, y: node.posY },
      inputs,
      outputs,
      meta: { nodeType: node.uiType }
    });
  }

  // ==========================================
  // PASS 3: Generate DSL
  // ==========================================
  let dsl = '';
  
  for (const node of nodes) {
    let nodeHasContent = false;
    let nodeDsl = `[Node: ${node.nodeName}] (${node.typeLabel})\n`;
    const serializeLink = (tn: string, tp: string) => `${tn}.${tp}`;

    for (const pin of node.pins) {
      const isLinked = pin.inLinks.length > 0 || pin.outLinks.length > 0;
      const isMeaningfulDefault = pin.defaultValue !== '' && pin.defaultValue.toLowerCase() !== 'none' && pin.defaultValue !== 'false' && pin.defaultValue !== '0';
      
      // DSL Context Logic: Skip unlinked empty pins to save token tax
      if (!isLinked && !isMeaningfulDefault) {
        continue;
      }

      nodeHasContent = true;
      const kind = pin.pinCategory === 'exec' ? 'Exec' : 'Data';
      const pNameLabel = pin.pinName || (pin.pinCategory === 'exec' && pin.direction === 'OUT' ? 'then' : 'execute');

      if (pin.direction === 'IN') {
        if (pin.inLinks.length > 0) {
          const uniqueLinks = Array.from(new Set(pin.inLinks.map(l => serializeLink(l.targetNodeName, l.targetPinName))));
          for (const l of uniqueLinks) {
            nodeDsl += `<- IN [${kind}: ${pNameLabel}]: ${l}\n`;
          }
        } else if (pin.defaultValue) {
          nodeDsl += `<- IN [${kind}: ${pNameLabel}]: ${pin.defaultValue}\n`;
        }
      }

      if (pin.direction === 'OUT') {
        if (pin.outLinks.length > 0) {
          const uniqueLinks = Array.from(new Set(pin.outLinks.map(l => serializeLink(l.targetNodeName, l.targetPinName))));
          for (const l of uniqueLinks) {
            nodeDsl += `-> OUT [${kind}: ${pNameLabel}]: ${l}\n`;
          }
        }
      }
    }

    if (nodeHasContent) {
      dsl += nodeDsl + '\n';
    }
  }

  const payload: JsonPayload = {
    version: '1.0',
    schemaType: 'blueprint',
    name: 'Parsed Blueprint',
    nodes: jsonNodes,
    edges: jsonEdges
  };

  return { dsl: dsl.trim(), payload };
}
