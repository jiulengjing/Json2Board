import dagre from 'dagre';
import { JsonPayload } from '../components/BoardEditor';
import { SchemaType } from '../themes';

export function parseGtgToPayload(gtgText: string, schemaType: SchemaType = 'blueprint'): JsonPayload {
  const gtgNodes: any[] = [];
  const gtgEdges: any[] = [];
  const edgeSet = new Set<string>();

  if (!gtgText) {
    return { version: '1.0', schemaType, nodes: [], edges: [] };
  }

  // Split into lines
  const lines = gtgText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let currentNode: any = null;

  for (const line of lines) {
    // 1. Check for node declaration: [Node: NodeName] (Type:DataType) {OriginalClass}
    const nodeMatch = /\[Node:\s*([^\]]+)\]\s*\(([^):]+)(?::([^)]+))?\)(?:\s*@\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\))?(?:\s*\{([^}]+)\})?/i.exec(line);
    if (nodeMatch) {
      const nodeName = nodeMatch[1].trim();
      const typeLabel = nodeMatch[2].trim();
      const dataType = nodeMatch[3] ? nodeMatch[3].trim() : undefined;
      const posX = nodeMatch[4] ? parseInt(nodeMatch[4], 10) : undefined;
      const posY = nodeMatch[5] ? parseInt(nodeMatch[5], 10) : undefined;
      const originalClass = nodeMatch[6] ? nodeMatch[6].trim() : undefined;
      
      let uiType = 'function';
      const tlLower = typeLabel.toLowerCase();
      if (tlLower.includes('event') || tlLower.includes('input')) {
         uiType = 'event';
      } else if (tlLower.includes('get') || tlLower.includes('coordinate') || tlLower.includes('texture')) {
         uiType = 'get';
      } else if (tlLower.includes('set')) {
         uiType = 'set';
      } else if (tlLower.includes('pure') || tlLower.includes('constant') || tlLower.includes('variable')) {
         uiType = 'variable'; // Usually light green capsule
      } else if (tlLower.includes('macro') || tlLower.includes('math') || tlLower.includes('branch')) {
         uiType = 'macro';
      } else if (tlLower.includes('reroute')) {
         uiType = 'reroute';
      }

      currentNode = {
        id: nodeName,
        type: 'blueprint',
        label: nodeName,
        position: { x: posX ?? 0, y: posY ?? 0 },
        inputs: [],
        outputs: [],
        meta: { nodeType: uiType, typeLabel, dataType, originalClass, hasManualPos: posX !== undefined }
      };
      gtgNodes.push(currentNode);
      continue;
    }

    if (!currentNode) continue;

    // 2a. Check for INLINE DEFAULT value: <- IN [Data: PinName] = Value (no wire, renders as value box)
    const inlineMatch = /<-\s*IN\s*\[(Data|Exec):\s*(.+?)\]\s*=\s*(.+)/i.exec(line);
    if (inlineMatch) {
      const pinName = inlineMatch[2].trim();
      const pinValue = inlineMatch[3].trim();
      const pinId = `in_${pinName}`;
      if (!currentNode.inputs.find((p: any) => p.id === pinId)) {
        currentNode.inputs.push({
          id: pinId, label: pinName, type: 'data', dataType: 'string',
          displayOnly: true, defaultValue: pinValue
        });
      } else {
        const existing = currentNode.inputs.find((p: any) => p.id === pinId);
        if (existing) { existing.displayOnly = true; existing.defaultValue = pinValue; }
      }
      continue;
    }

    // 2b. Check for IN pin with wire: <- IN [Data/Exec: PinName]: SourceNode.SourcePin
    // Or legacy literal: <- IN [Data: PinName]: literalValue
    const inMatch = /<-\s*IN\s*\[(Data|Exec):\s*(.+?)\]:\s*(.+)/i.exec(line);
    if (inMatch) {
      const pinType = inMatch[1].toLowerCase() === 'exec' ? 'exec' : 'data';
      const pinName = inMatch[2].trim();
      const targetStr = inMatch[3].trim();
      
      const pinId = `in_${pinName}`;
      if (!currentNode.inputs.find((p: any) => p.id === pinId)) {
        currentNode.inputs.push({ id: pinId, label: pinName, type: pinType, dataType: pinType === 'exec' ? 'exec' : 'string' });
      }

      // Determine if it's a wire connection (NodeName.PinName) or a literal value
      if (targetStr.includes('.') && !targetStr.startsWith('(') && !targetStr.startsWith('"') && !targetStr.startsWith('\'')) {
         const parts = targetStr.split('.');
         const sourceNodeName = parts[0];
         const sourcePinName = parts.slice(1).join('.');
         const sourcePinId = `out_${sourcePinName}`;
         
         const edgeId = `${sourceNodeName}-${sourcePinId}-${currentNode.id}-${pinId}`;
         if (!edgeSet.has(edgeId)) {
           edgeSet.add(edgeId);
           gtgEdges.push({
             source: sourceNodeName,
             sourceHandle: sourcePinId,
             target: currentNode.id,
             targetHandle: pinId
           });
         }
      } else {
        // Legacy literal via :-syntax: treat as inline default value (no wire)
        const existingInput = currentNode.inputs.find((p: any) => p.id === pinId);
        if (existingInput) {
          existingInput.displayOnly = true;
          existingInput.defaultValue = targetStr;
        }
      }
      continue;
    }

    // 3. Check for OUT pin: -> OUT [Data/Exec: PinName]: TargetNode.TargetPin
    // Example: -> OUT [Exec: false]: CycleMovementModes.execute
    const outMatch = /->\s*OUT\s*\[(Data|Exec):\s*(.+?)\]:\s*(.+)/i.exec(line);
    if (outMatch) {
      const pinType = outMatch[1].toLowerCase() === 'exec' ? 'exec' : 'data';
      const pinName = outMatch[2].trim();
      const targetStr = outMatch[3].trim();
      
      const pinId = `out_${pinName}`;
      if (!currentNode.outputs.find((p: any) => p.id === pinId)) {
        currentNode.outputs.push({ id: pinId, label: pinName, type: pinType, dataType: pinType === 'exec' ? 'exec' : 'string' });
      }

      if (targetStr.includes('.') && !targetStr.startsWith('(') && !targetStr.startsWith('"') && !targetStr.startsWith('\'')) {
         const parts = targetStr.split('.');
         const targetNodeName = parts[0];
         const targetPinName = parts.slice(1).join('.');
         const targetPinId = `in_${targetPinName}`;
         
         const edgeId = `${currentNode.id}-${pinId}-${targetNodeName}-${targetPinId}`;
         if (!edgeSet.has(edgeId)) {
           edgeSet.add(edgeId);
           gtgEdges.push({
             source: currentNode.id,
             sourceHandle: pinId,
             target: targetNodeName,
             targetHandle: targetPinId
           });
         }
      }
      continue;
    }
  }

  // Note: During forward references, we might emit an edge where the source or target pin wasn't explicitly declared in its own definition.
  // We can scan edges and auto-add missing pins to nodes.
  for (const e of gtgEdges) {
     const srcNode = gtgNodes.find(n => n.id === e.source);
     const tgtNode = gtgNodes.find(n => n.id === e.target);
     
     if (srcNode && !srcNode.outputs.find((p: any) => p.id === e.sourceHandle)) {
        const lbl = e.sourceHandle.replace('out_', '');
        srcNode.outputs.push({ id: e.sourceHandle, label: lbl, type: lbl === 'then' || lbl === 'execute' ? 'exec' : 'data' });
     }
     
     if (tgtNode && !tgtNode.inputs.find((p: any) => p.id === e.targetHandle)) {
        const lbl = e.targetHandle.replace('in_', '');
        tgtNode.inputs.push({ id: e.targetHandle, label: lbl, type: lbl === 'then' || lbl === 'execute' ? 'exec' : 'data' });
     }
  }

  // --- Auto Layout using Dagre ---
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', ranksep: 250, nodesep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of gtgNodes) {
    const height = Math.max(60, (n.inputs.length + n.outputs.length) * 24 + 40);
    g.setNode(n.id, { width: 220, height });
  }

  for (const e of gtgEdges) {
    g.setEdge(e.source, e.target);
  }

  try {
    const useManualLayout = gtgNodes.some(n => n.meta?.hasManualPos);
    if (!useManualLayout) {
      dagre.layout(g);
      for (const n of gtgNodes) {
        const nodeWithPos = g.node(n.id);
        if (nodeWithPos) {
          n.position = { x: nodeWithPos.x, y: nodeWithPos.y };
        }
      }
    }
  } catch (err) {
    console.error("Dagre layout failed:", err);
  }

  return {
    version: '1.0',
    schemaType,
    name: 'Generated by GTG-Script',
    nodes: gtgNodes,
    edges: gtgEdges
  };
}
