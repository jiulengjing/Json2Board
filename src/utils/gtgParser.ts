import dagre from 'dagre';
import { JsonPayload } from '../components/BoardEditor';

export function parseGtgToPayload(gtgText: string): JsonPayload {
  const gtgNodes: any[] = [];
  const gtgEdges: any[] = [];
  const edgeSet = new Set<string>();

  if (!gtgText) {
    return { version: '1.0', schemaType: 'blueprint', nodes: [], edges: [] };
  }

  // Split into lines
  const lines = gtgText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let currentNode: any = null;

  for (const line of lines) {
    // 1. Check for node declaration: [Node: NodeName] (Type)
    const nodeMatch = /\[Node:\s*(.+?)\]\s*\((.+?)\)/i.exec(line);
    if (nodeMatch) {
      const nodeName = nodeMatch[1].trim();
      const typeLabel = nodeMatch[2].trim();
      
      let uiType = 'function';
      const tlLower = typeLabel.toLowerCase();
      if (tlLower.includes('event') || tlLower.includes('input')) {
         uiType = 'event';
      } else if (tlLower.includes('pure') || tlLower.includes('variable')) {
         uiType = 'variable';
      } else if (tlLower.includes('macro') || tlLower.includes('ifthenelse') || tlLower.includes('branch')) {
         uiType = 'macro';
      } else if (tlLower.includes('reroute')) {
         uiType = 'reroute';
      }

      currentNode = {
        id: nodeName,
        type: 'blueprint',
        label: nodeName,
        position: { x: 0, y: 0 },
        inputs: [],
        outputs: [],
        meta: { nodeType: uiType, typeLabel }
      };
      gtgNodes.push(currentNode);
      continue;
    }

    if (!currentNode) continue;

    // 2. Check for IN pin: <- IN [Data/Exec: PinName]: SourceNode.SourcePin
    // Example: <- IN [Exec: execute]: GripOrDropObjectClean_1.then
    // Or constant: <- IN [Data: Condition]: false
    const inMatch = /<-\s*IN\s*\[(Data|Exec):\s*(.+?)\]:\s*(.+)/i.exec(line);
    if (inMatch) {
      const pinType = inMatch[1].toLowerCase() === 'exec' ? 'exec' : 'data';
      const pinName = inMatch[2].trim();
      const targetStr = inMatch[3].trim();
      
      const pinId = `in_${pinName}`;
      if (!currentNode.inputs.find((p: any) => p.id === pinId)) {
        currentNode.inputs.push({ id: pinId, label: pinName, type: pinType, dataType: pinType === 'exec' ? 'exec' : 'string' });
      }

      // Check if target is a connection or a literal value
      // A connection usually looks like NodeName.PinName. We'll simply check if it has a dot and isn't enclosed in quotes
      // Wait, T3D defaults can be strings. Usually we just link it if it exists in the graph, but forward refs are possible.
      // So we assume it's a link if it contains a dot and the part before dot doesn't start with ( or " 
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
        // It's a literal value. We could attach it to the pin label for display purposes if we want.
        // E.g. `Condition (false)`
        const existingInput = currentNode.inputs.find((p: any) => p.id === pinId);
        if (existingInput) { existingInput.label = `${pinName} = ${targetStr}`; }
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
    dagre.layout(g);
    for (const n of gtgNodes) {
      const nodeWithPos = g.node(n.id);
      if (nodeWithPos) {
        n.position = { x: nodeWithPos.x, y: nodeWithPos.y };
      }
    }
  } catch (err) {
    console.error("Dagre layout failed:", err);
  }

  return {
    version: '1.0',
    schemaType: 'blueprint',
    name: 'Generated by GTG-Script',
    nodes: gtgNodes,
    edges: gtgEdges
  };
}
