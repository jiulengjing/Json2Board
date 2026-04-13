import { useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  MarkerType,
  SelectionMode
} from '@xyflow/react';
import BlueprintNode from './nodes/BlueprintNode';
import MaterialNode from './nodes/MaterialNode';
import NiagaraNode from './nodes/NiagaraNode';
import BlueprintEdge from './edges/BlueprintEdge';
import { SchemaType, NodeData, getPinColors } from '../themes';

// -- We need JsonPayload interface here --
export interface JsonNode {
  id: string; type: string; label: string;
  position: { x: number; y: number };
  inputs: any[]; outputs: any[];
  meta?: Record<string, unknown>;
}
export interface JsonEdge {
  source: string; sourceHandle: string;
  target: string; targetHandle: string;
}
export interface JsonPayload {
  version: string;
  schemaType?: SchemaType;
  name?: string;
  nodes: JsonNode[];
  edges: JsonEdge[];
}

const NODE_TYPES = {
  blueprint: BlueprintNode,
  material: MaterialNode,
  niagara: NiagaraNode
};

const EDGE_TYPES = {
  blueprint: BlueprintEdge
};

function getNodeTypes(st: SchemaType) {
  return NODE_TYPES;
}

function getFlowNodeType(st: SchemaType) {
  return st || 'blueprint';
}

function BoardActions({ onEdit, onUpload, onDownload }: { onEdit?: () => void; onUpload?: () => void; onDownload?: () => void }) {
  const btns = [
    { icon: '📝', label: '编辑', action: onEdit },
    { icon: '📂', label: '打开', action: onUpload },
    { icon: '⬇', label: '下载', action: onDownload },
  ].filter(b => b.action);
  
  if (btns.length === 0) return null;

  return (
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: 4, background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(12px)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', padding: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
      {btns.map(({ icon, label, action }) => (
        <button key={label} onClick={action} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          title={label}>
          <span>{icon}</span><span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function BoardEditor({
  payload, onEdit, onUpload, onDownload,
}: {
  payload: JsonPayload;
  onEdit?: () => void;
  onUpload?: () => void; 
  onDownload?: () => void;
}) {
  const schemaType: SchemaType = payload.schemaType ?? 'blueprint';
  const flowType = getFlowNodeType(schemaType);
  const pinColors = getPinColors(schemaType);
  const execColor = schemaType === 'niagara' ? '#ff8040' : '#ffffff';
  const edgeType  = 'blueprint'; 

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const flowNodes: Node<NodeData>[] = payload.nodes.map(n => ({
      id: n.id, type: flowType, position: n.position || { x: 0, y: 0 },
      data: { nodeType: (n.meta?.nodeType as string) || 'function', label: n.label || n.id, inputs: n.inputs || [], outputs: n.outputs || [], meta: n.meta },
    }));

    const flowEdges: Edge[] = payload.edges.map((e, i) => {
      const srcNode = payload.nodes.find(node => node.id === e.source);
      const pin = srcNode?.outputs?.find(p => p.id === e.sourceHandle);
      const pt  = pin?.type || 'data';
      const dt  = (pin?.dataType as string || '').toLowerCase();
      
      // Detailed mapping for common UE5 categories
      let col = pt === 'exec' ? execColor : (dt ? (pinColors[dt] || pinColors[dt.replace('bool', 'boolean')] || pinColors[dt.replace('int', 'integer')] || '#9e9e9e') : '#9e9e9e');
      
      if (schemaType === 'material' && pin?.label) {
        const lbl = pin.label.toUpperCase();
        if (lbl === 'R') col = '#ff3333';
        else if (lbl === 'G') col = '#33ff33';
        else if (lbl === 'B') col = '#33aaee';
        else if (lbl === 'A') col = '#888888';
        else if (lbl === 'RGB' || lbl === 'RGBA') col = '#ffffff';
      }
      
      const isExec = pt === 'exec';
      return {
        id: `e-${i}-${e.source}-${e.target}`,
        source: e.source, sourceHandle: e.sourceHandle,
        target: e.target, targetHandle: e.targetHandle,
        type: edgeType,
        style: { stroke: col, strokeWidth: 2.8, opacity: 1 },
        markerEnd: isExec ? { type: MarkerType.ArrowClosed, color: col, width: 14, height: 14 } : undefined,
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [payload, setNodes, setEdges, flowType, execColor, pinColors, edgeType, schemaType]);

  const bgColor = '#1b1b1b';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: bgColor }}>
      <ReactFlow nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES} edgeTypes={EDGE_TYPES}
        fitView colorMode="dark"
        panOnDrag={[1, 2]} selectionOnDrag selectionMode={SelectionMode.Partial}
        panOnScroll={false} onContextMenu={e => e.preventDefault()}
        minZoom={0.05} maxZoom={4} defaultEdgeOptions={{ type: edgeType }}>
        
        {/* Subtle Dots for Depth */}
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} style={{ opacity: 0.05 }} color="#ffffff" />
        
        <Controls showInteractive={false} />
      </ReactFlow>
      
      <BoardActions onEdit={onEdit} onUpload={onUpload} onDownload={onDownload} />
    </div>
  );
}
