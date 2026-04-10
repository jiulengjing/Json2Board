export interface T3DPin {
  pinId: string;
  pinName: string;
  pinCategory: string;
  pinDataType: string;
  direction: 'IN' | 'OUT';
  linkedToIds: { nodeId: string; pinId: string }[];
  defaultValue: string;
  bHidden: boolean;
  bDisplayOnly: boolean; // true = not connectable, shown as read-only value label

  // Filled in Pass 2
  inLinks: { targetNodeName: string; targetPinName: string }[];
  outLinks: { targetNodeName: string; targetPinName: string }[];
}

export interface T3DNode {
  nodeId: string;
  nodeName: string;
  className: string;
  typeLabel: string;
  uiType: 'event' | 'function' | 'macro' | 'variable' | 'reroute' | 'get' | 'set';
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

import { SchemaType } from '../themes';

/**
 * Two-Pass T3D Blueprint text parser
 * Outputs Dual-Track data: DSL (for LLMs) and full JSON Payload (for UI Renderer)
 */
export function parseT3D(t3dText: string, schemaType: SchemaType = 'blueprint'): { dsl: string, payload: JsonPayload } {
  if (!t3dText) return { dsl: '', payload: { version: '1.0', nodes: [], edges: [] } };

  const nodes: T3DNode[] = [];
  const nodeDict = new Map<string, T3DNode>();
  const pinDict = new Map<string, T3DPin>();
  const nameCounts = new Map<string, number>();

  // ==========================================
  // PASS 1: Parse string to build data maps (Supports nested blocks)
  // ==========================================
  const blocks: string[] = [];
  let currentDepth = 0;
  let currentBlockLines: string[] = [];
  const linesArr = t3dText.split('\n');

  for (let i = 0; i < linesArr.length; i++) {
     const line = linesArr[i];
     if (line.includes('Begin Object ')) {
         if (currentDepth === 0) currentBlockLines = [line];
         else currentBlockLines.push(line);
         currentDepth++;
     } else if (line.includes('End Object')) {
         currentDepth--;
         currentBlockLines.push(line);
         if (currentDepth === 0) {
             blocks.push(currentBlockLines.join('\n'));
         }
     } else if (currentDepth > 0) {
         currentBlockLines.push(line);
     }
  }

  for (const blockBody of blocks) {
    const match = /Begin Object Class=([^\s]+) Name="([^"]+)"/.exec(blockBody);
    if (!match) continue;
    
    const className = match[1];
    const nodeId = match[2];


    if (className === '/Script/BlueprintGraph.EdGraphNode_Comment' || className === 'EdGraphNode_Comment') {
      continue;
    }

    let nodeName = nodeId;
    let typeLabel = 'Node';
    let uiType: 'event' | 'function' | 'macro' | 'variable' | 'reroute' | 'get' | 'set' = 'function';

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
    } else if (className.includes('K2Node_VariableGet')) {
      typeLabel = 'Get';
      uiType = 'get'; 
    } else if (className.includes('K2Node_VariableSet')) {
      typeLabel = 'Set';
      uiType = 'set';
    } else if (isPure) {
      typeLabel = 'Pure';
      uiType = 'variable'; 
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
    } else if (className === '/Script/UnrealEd.MaterialGraphNode' || className === 'MaterialGraphNode' || className.includes('MaterialGraphNode_Root')) {
      if (className.includes('MaterialGraphNode_Root')) {
         nodeName = 'MaterialResult';
         typeLabel = 'Root';
         uiType = 'macro';
      } else {
         const matExprMatch = /MaterialExpression="[^']*?MaterialExpression([a-zA-Z0-9]+)'([^'"]+)'"/.exec(blockBody)
                           ?? /MaterialExpression=([a-zA-Z0-9_]+)'\"([^\"]+)\"'/.exec(blockBody);
         if (matExprMatch) {
            let exprType = matExprMatch[1].replace('MaterialExpression', ''); // "TextureSample"
            nodeName = exprType;
            typeLabel = exprType;
            const T = exprType.toLowerCase();
            
            if (T.includes('add') || T.includes('multiply') || T.includes('divide') || T.includes('subtract') || T.includes('power')) {
               typeLabel = 'Math';
               uiType = 'macro';
            } else if (T.includes('constant')) {
               typeLabel = 'Constant';
               uiType = 'variable';
            } else if (T.includes('texturecoordinate')) {
               typeLabel = 'Coordinate';
               uiType = 'get';
            } else if (T.includes('texturesample')) {
               typeLabel = 'Texture';
               uiType = 'get';
               // The Naming Extraction Rule (Texture)
               const texMatch = /Texture=[^\n]+\/([a-zA-Z0-9_\-]+)\.[a-zA-Z0-9_\-]+['"]?/.exec(blockBody);
               if (texMatch) {
                   nodeName = texMatch[1]; // Use shortname, e.g. T_Weapon_Set2_BaseColor
               }
            } else {
               uiType = 'function';
            }

            // ParameterName has highest priority (e.g. "Diffuse1", "Normal1") - search inner block
            // The inner block is the second Begin Object / End Object pair inside blockBody
            const innerBlockMatch = /Begin Object Name="([^"]+)"[\s\S]*?End Object/.exec(blockBody);
            const innerBlockStr = innerBlockMatch ? innerBlockMatch[0] : blockBody;
            const paramMatch = /ParameterName="([^"]+)"/.exec(innerBlockStr);
            if (paramMatch && paramMatch[1] && paramMatch[1] !== 'None') {
                nodeName = paramMatch[1]; // Overrides texture short-name
            }
         }
      }
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

    // Opt 2: Verbification & Friendly Aliases mapping
    const FriendlyAliases: Record<string, string> = {
      'K2_IsValidTimerHandle': 'Is Valid Timer Handle',
      'K2_ClearAndInvalidateTimerHandle': 'Clear and Invalidate Timer by Handle',
      'ClearAndInvalidateTimerHandle': 'Clear and Invalidate Timer by Handle',
      'K2_SetTimerDelegate': 'Set Timer by Event',
      'K2_SetTimer': 'Set Timer by Function Name',
    };
    if (FriendlyAliases[nodeName]) {
      nodeName = FriendlyAliases[nodeName];
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
      const pId = /PinId="?([0-9a-zA-Z\-]+)"?/.exec(chunk)?.[1] || '';
      let pName = /PinName="([^"]*)"/.exec(chunk)?.[1] || '';
      
      // Override with PinFriendlyName if it exists (Crucial for Materials where PinName = GUID)
      const pFriendly = /PinFriendlyName=("[^"]*"|NSLOCTEXT\([^,]*,[^,]*,[^)]*\))/.exec(chunk)?.[1];
      if (pFriendly) {
         if (pFriendly.includes('NSLOCTEXT')) {
             const locMatch = /NSLOCTEXT\([^,]*,[^,]*,[ ]*"([^"]+)"\)/.exec(pFriendly);
             if (locMatch) pName = locMatch[1];
         } else {
             pName = pFriendly.replace(/"/g, ''); 
         }
      }

      if (pName === 'self') pName = 'Target';
      
      // Blank Pin / Output Pin Fix for Materials
      if (schemaType === 'material') {
          if (pName.trim() === '' || pName.toLowerCase() === 'output') {
              pName = 'Output';
          }
      }

      // Opt 1: Branch Output Pin Labels -> True / False (UI & Internal representation)
      if (nodeName === 'Branch' || className.includes('IfThenElse')) {
          if (pName.toLowerCase() === 'then') pName = 'True';
          else if (pName === 'else' || (!pName && /EGPD_Output/.test(chunk) && /exec/.test(chunk) && pName !== 'True')) pName = 'False';
      }

      const pDirStr = /Direction="([^"]+)"/.exec(chunk)?.[1];
      const pDir = pDirStr === 'EGPD_Output' ? 'OUT' : 'IN';
      const pCategory = /PinType\.PinCategory="([^"]*)"/.exec(chunk)?.[1] || 'exec';
      let bHidden = /bHidden=True/.test(chunk);
      const bAdvancedView = /bAdvancedView=True/.test(chunk);
      const bNotConnectable = /bNotConnectable=True/.test(chunk);

      let pDataType = pCategory;
      if (pCategory === 'object' || pCategory === 'struct' || pCategory === 'enum') {
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

      // The Connectable & Filter Rules
      const isLinked = linkedToIds.length > 0;
      
      // bNotConnectable pins: hide unless they carry a meaningful displayed value
      // (e.g. Constant R=1.0, Constant2Vector X=0.0 Y=-2.0 should be visible as read-only)
      let bDisplayOnly = false;
      if (bNotConnectable && !isLinked) {
          // We'll decide after reading DefaultValue whether to keep as display-only
          bDisplayOnly = true; // tentative — confirmed below once we have pDefault
      }
      if (!isLinked && (bAdvancedView || pName.includes('Customized UV') || pName.includes('Custom Data'))) {
          bHidden = true;
      }
      // For material nodes: unlinked pins with no meaningful content -> hide
      if (schemaType === 'material' && !isLinked && !bNotConnectable && !bHidden) {
          if (pName === 'Apply View MipBias' || pName === 'Pixel Depth Offset' || pName === 'Shading Model' || pName === 'Displacement' || pName === 'Material Attributes' || pName === 'Front Material') {
             bHidden = true;
          }
      }

      let pDefault = '';
      const defMatch = /DefaultValue="([\s\S]*?)"(?:,AutogeneratedDefaultValue|,PersistentGuid|,\s*\w+=|\)$)/.exec(chunk);
      if (defMatch) {
        pDefault = defMatch[1];
      }

      // Finalize display-only: only keep if default is meaningful (non-zero, non-default)
      const defNum = parseFloat(pDefault);
      const isZeroValue = pDefault === '0' || pDefault === '0.0' || (!isNaN(defNum) && defNum === 0);
      const isMeaningfulDef = pDefault !== '' && pDefault.toLowerCase() !== 'none' && pDefault !== 'false' && !isZeroValue;
      if (bDisplayOnly && !isMeaningfulDef) {
          bHidden = true; // No useful value to show, drop it
          bDisplayOnly = false;
      }

      // For material nodes: some unlinked non-display pins should also be hidden
      if (schemaType === 'material' && !isLinked && !bDisplayOnly && !bHidden) {
          if (pName === 'Apply View MipBias' || pName === 'Pixel Depth Offset' || pName === 'Shading Model' || pName === 'Displacement' || pName === 'Material Attributes' || pName === 'Front Material') {
             bHidden = true;
          }
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
        bDisplayOnly,
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

  // ==========================================
  // PASS 1.5: Variable Singleton (Token Optimizer)
  // ==========================================
  const activeNodes: T3DNode[] = [];
  const getNodesMap = new Map<string, T3DNode>();

  for (const node of nodes) {
    if (node.uiType === 'get') {
      const varName = node.nodeName; 
      const existingGet = getNodesMap.get(varName);

      if (existingGet) {
        // Reroute global target references from node.nodeId to existingGet.nodeId
        for (const otherNode of nodes) {
          for (const otherPin of otherNode.pins) {
            for (const link of otherPin.linkedToIds) {
              if (link.nodeId === node.nodeId) {
                link.nodeId = existingGet.nodeId;
                const duplicatePin = node.pins.find(p => p.pinId === link.pinId);
                if (duplicatePin) {
                  const eqPin = existingGet.pins.find(p => p.pinName === duplicatePin.pinName);
                  if (eqPin) link.pinId = eqPin.pinId;
                }
              }
            }
          }
        }
        
        // Reroute outgoing links from node to existingGet
        for (const pin of node.pins) {
          const eqPin = existingGet.pins.find(p => p.pinName === pin.pinName && p.direction === pin.direction);
          if (eqPin) {
            eqPin.linkedToIds.push(...pin.linkedToIds);
          }
        }
        
        // Discard node
        continue;
      } else {
        getNodesMap.set(varName, node);
      }
    }
    activeNodes.push(node);
  }

  // Replace nodes array with structurally optimized singletons
  nodes.length = 0;
  nodes.push(...activeNodes);

  // Re-tally name counts for Rename Pass
  nameCounts.clear();
  for (const n of nodes) {
      nameCounts.set(n.nodeName, (nameCounts.get(n.nodeName) || 0) + 1);
  }

  // Rename pass for remaining structural duplicates (e.g. Branch_1, Branch_2)
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
      let shouldHide = pin.bHidden;
      if (node.className.includes('MaterialGraphNode_Root') && !shouldHide) {
          const isLinked = pin.inLinks.length > 0 || pin.outLinks.length > 0;
          if (!isLinked) {
              // Check if it has a meaningful non-zero value to show as display-only row
              const defNum = parseFloat(pin.defaultValue);
              const isZero = pin.defaultValue === '' || pin.defaultValue === '0' || pin.defaultValue === '0.0' || (!isNaN(defNum) && defNum === 0);
              const isBlackVector = pin.defaultValue.includes('R=0.000000,G=0.000000,B=0.000000');
              const hasDefaultVector = pin.defaultValue.startsWith('(') && !isBlackVector; // e.g. (R=1.0,G=1.0,...)
              if (!isZero && !isBlackVector || hasDefaultVector) {
                  // Mark as display-only — no connectable handle, just show the value
                  (pin as T3DPin & { bDisplayOnly: boolean }).bDisplayOnly = true;
              } else {
                  shouldHide = true;
              }
          }
      }

      if (!shouldHide) {
        const pinObj: Record<string, unknown> = {
          id: pin.pinId,
          label: pin.pinName,
          type: (schemaType === 'material' || pin.pinCategory !== 'exec') ? 'data' : 'exec',
          dataType: pin.pinDataType
        };
        if (pin.bDisplayOnly) {
          pinObj.displayOnly = true;
          pinObj.defaultValue = pin.defaultValue;
        }
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
      meta: { nodeType: node.uiType, typeLabel: node.typeLabel }
    });
  }

  // ==========================================
  // PASS 3: Generate DSL
  // ==========================================
  let dsl = '';
  
  for (const node of nodes) {
    let nodeHasContent = false;
    // DSL Form: [Node: Label] (Type:DataType) {OriginalClass}
    // We try to figure out DataType if it's a Get or Set by looking at its Pin DataType
    let mainDataType = '';
    if (node.uiType === 'get' || node.uiType === 'set') {
      const dataPin = node.pins.find(p => p.pinCategory !== 'exec' && p.pinName !== 'Target' && p.pinName !== 'self');
      if (dataPin) mainDataType = ':' + dataPin.pinDataType;
    }

    let nodeDsl = `[Node: ${node.nodeName}] (${node.typeLabel}${mainDataType}) @(${node.posX}, ${node.posY}) {${node.className}}\n`;
    const serializeLink = (tn: string, tp: string) => `${tn}.${tp}`;

    for (const pin of node.pins) {
      const isLinked = pin.inLinks.length > 0 || pin.outLinks.length > 0;
      const isMeaningfulDefault = pin.defaultValue !== '' && pin.defaultValue.toLowerCase() !== 'none' && pin.defaultValue !== 'false' && pin.defaultValue !== '0';

      // DSL Context Logic: Skip hidden pins and Root unlinked pins
      if (pin.bHidden) continue;
      // For Root node: ONLY show pins with actual wire connections in DSL (keep script minimal)
      if (node.className.includes('MaterialGraphNode_Root') && !isLinked) {
        continue;  // displayOnly values on Root don't appear in DSL, only in UI
      }
      // For all other material nodes: skip unlinked pins with no default
      if (schemaType === 'material' && !isLinked && !isMeaningfulDefault && !node.className.includes('MaterialGraphNode_Root')) {
        continue;
      }

      nodeHasContent = true;
      const kind = (schemaType === 'material' || pin.pinCategory !== 'exec') ? 'Data' : 'Exec';
      let pNameLabel = pin.pinName;
      if (!pNameLabel) {
          if (schemaType === 'material') pNameLabel = 'Output';
          else pNameLabel = (pin.pinCategory === 'exec' && pin.direction === 'OUT' ? 'then' : 'execute');
      }

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
    schemaType,
    name: 'Parsed Nodes',
    nodes: jsonNodes,
    edges: jsonEdges
  };

  return { dsl: dsl.trim(), payload };
}
