import { JsonPayload } from './blueprintParser';
import { convertToSafeLiteT3D } from './safeLiteT3D';

/**
 * Simplifies a raw UE5 Material T3D text using the shared Safe LiteT3D compressor.
 */
export function simplifyMaterialT3D(t3dText: string): string {
  return convertToSafeLiteT3D(t3dText);
}

/**
 * Parses Material T3D/Lite-T3D text and extracts JSON payload for React Flow rendering.
 */
export function parseMaterialT3D(t3dText: string): { dsl: string, payload: JsonPayload } {
  if (!t3dText) return { dsl: '', payload: { version: '1.0', schemaType: 'material', name: 'Material', nodes: [], edges: [] } };

  const dsl = simplifyMaterialT3D(t3dText);
  const nodes: T3DNode[] = [];
  const nameCounts = new Map<string, number>();

  const cleanedText = t3dText.split('\n')
    .filter(l => { const t = l.trim(); return t && !t.startsWith('//') && !t.startsWith('#'); })
    .join('\n');

  // Split into nodes. Both Lite-T3D (which might drop Outer nested headers) and Real T3D should ideally parse.
  // In either case, the outermost Object usually defines the Node logic.
  let nodeBlocks = cleanedText.split('Begin Object Class=/Script/UnrealEd.MaterialGraphNode');
  if (nodeBlocks.length === 1) {
      // Fallback: If AI generates flat MaterialExpression nodes (Lite-T3D)
      nodeBlocks = cleanedText.split('Begin Object Class=MaterialExpression');
  } else {
      nodeBlocks.shift(); // remove everything before first node
  }

  for (const block of nodeBlocks) {
    const blockBody = block.split('End Object')[0]; // Actually for nested we should just search the whole block text

    const nameMatch = /Name="([^"]+)"/.exec(block);
    const expMatch = /MaterialExpression=\w+'([^']+)'/.exec(block);
    
    // Fallback logic for AI-generated Lite-T3D flat structure vs UE5 native nested structure
    let className = 'MaterialExpressionUnknown';
    let nodeId = nameMatch ? nameMatch[1] : `Node_${nodes.length}`;
    
    const classMatch = /Class=\/Script\/Engine\.(MaterialExpression[^\s]+)/.exec(block);
    if (classMatch) {
       className = classMatch[1];
    } else if (expMatch && expMatch[1]) {
       // Extract class name from the MaterialExpression reference (e.g. MaterialExpressionAdd'MaterialExpressionAdd_0')
       className = expMatch[1].split('_')[0];
    } else {
       // Look for class in Lite-T3D flat format
       const flatClassMatch = /Class=(MaterialExpression[^\s]+)/.exec(block);
       if (flatClassMatch) className = flatClassMatch[1];
    }

    if (className === 'MaterialExpressionComment') continue;

    let nodeName = className.replace('MaterialExpression', '');
    let typeLabel = 'Node';
    let uiType = 'function';
    
    const extractAttrRegex = (pat: RegExp) => { const m = pat.exec(block); return m ? m[1] : null; };

    // --- Type Label Deduction ---
    if (nodeName.includes('Constant')) { typeLabel = 'Constant'; uiType = 'variable'; }
    else if (nodeName.includes('Texture')) { typeLabel = 'Texture'; uiType = 'get'; }
    else if (nodeName.includes('Coordinate')) { typeLabel = 'Coordinate'; uiType = 'get'; }
    else if (nodeName.includes('Custom')) { typeLabel = 'Custom'; uiType = 'macro'; }

    // Math check
    const isMath = /Add|Subtract|Multiply|Divide|Power|Dot|Cross|Abs|Ceil|Floor|Sin|Cos|Tan|Round|Clamp|Min|Max/.test(nodeName);
    if (isMath) {
       typeLabel = 'Math'; uiType = 'math';
    }

    // Root check
    if (block.includes('MaterialGraphNode_Root')) {
        nodeName = 'Material Root'; typeLabel = 'Root'; uiType = 'event';
        nodeId = 'Root';
    }

    // Basic attributes
    const pX = parseInt(extractAttrRegex(/NodePosX=([-\d]+)/) || '0', 10);
    const pY = parseInt(extractAttrRegex(/NodePosY=([-\d]+)/) || '0', 10);

    // --- Custom specific ---
    const customCode = extractAttrRegex(/Code="([^"]*)"/);
    const customDesc = extractAttrRegex(/Description="([^"]*)"/);
    if (customDesc) nodeName = customDesc; // Override label if description exists

    // Name counting for duplication
    let finalLabel = nodeName;
    const count = nameCounts.get(nodeName) || 0;
    if (count > 0 && typeLabel !== 'Math' && typeLabel !== 'Root') finalLabel = `${nodeName}_${count}`;
    nameCounts.set(nodeName, count + 1);

    // Parse Pins
    const pins: any[] = [];
    const pinChunks = block.split('CustomProperties Pin (');
    const processedPinChunks = pinChunks.slice(1);

    for (const chunk of processedPinChunks) {
      let pName = /PinName="([^"]*)"/.exec(chunk)?.[1] || '';
      const pIdMatch = /PinId="?([0-9a-zA-Z\-]+)"?/.exec(chunk);
      const pId = pIdMatch ? pIdMatch[1] : pName;
      
      const pFriendlyMatch = /PinFriendlyName=("[^"]*"|NSLOCTEXT\([^)]*\))/.exec(chunk);
      if (pFriendlyMatch) {
         const pf = pFriendlyMatch[1];
         pName = pf.includes('NSLOCTEXT') ? (/NSLOCTEXT\([^,]*,[^,]*,[ ]*"([^"]+)"\)/.exec(pf)?.[1] || pName) : pf.replace(/"/g, '');
      }

      const isOutput = chunk.includes('Direction="EGPD_Output"');
      const defaultValue = /DefaultValue="([^"]*)"/.exec(chunk)?.[1];
      
      // Look for connections
      const linkedMatches = [...chunk.matchAll(/LinkedTo=\(([^)]+)\)/g)];
      const connections: string[] = [];
      for (const lm of linkedMatches) {
        lm[1].split(',').forEach(link => {
          if (link.trim()) {
             // Link format: NodeId PinId
             const parts = link.trim().split(' ');
             if (parts.length >= 2) connections.push(`${parts[0]}:${parts[1]}`);
          }
        });
      }

      pins.push({
        id: pId,
        name: pName,
        isOutput,
        dataType: 'float', // simplify for materials generic
        defaultValue,
        connections
      });
    }

    nodes.push({
      id: nodeId, name: finalLabel, className: typeLabel, uiType,
      posX: pX, posY: pY, pins,
      // Metadata extension supports custom code payload
      metadata: Object.assign({},
         customCode ? { customCode } : {},
         { typeLabel }
      )
    });
  }

  // --- Build Edges ---
  const edges: any[] = [];
  for (const sourceNode of nodes) {
    for (const pin of sourceNode.pins) {
      if (pin.isOutput) {
        for (const targetRef of pin.connections) {
          const [tgNodeId, tgPinId] = targetRef.split(':');
          
          let resolvedTgPinId = tgPinId;
          const targetNode = nodes.find(n => n.id === tgNodeId);
          if (targetNode) {
             const actualPin = targetNode.pins.find(p => p.id === tgPinId || p.name === tgPinId);
             if (actualPin) resolvedTgPinId = actualPin.id;
          }

          edges.push({
            id: `edge_${sourceNode.id}_${pin.id}_${tgNodeId}_${resolvedTgPinId}`,
            source: sourceNode.id,
            sourceHandle: pin.id,
            target: tgNodeId,
            targetHandle: resolvedTgPinId
          });
        }
      }
    }
  }

  const jsonNodes = nodes.map(n => {
    const inputs = n.pins.filter((p: any) => !p.isOutput).map((p: any) => ({
      id: p.id,
      label: p.name || p.id,
      type: 'data',
      dataType: p.dataType,
      defaultValue: p.defaultValue,
      isConnected: p.connections.length > 0
    }));
    const outputs = n.pins.filter((p: any) => p.isOutput).map((p: any) => ({
      id: p.id,
      label: p.name || p.id,
      type: 'data',
      dataType: p.dataType,
      isConnected: p.connections.length > 0
    }));

    return {
      id: n.id,
      type: 'material',
      label: n.name,
      position: { x: n.posX, y: n.posY },
      inputs,
      outputs,
      meta: { nodeType: n.uiType, typeLabel: n.className, ...n.metadata }
    };
  });

  return {
    dsl,
    payload: {
      version: '1.0',
      schemaType: 'material',
      name: 'Material Graph',
      nodes: jsonNodes,
      edges
    }
  };
}
