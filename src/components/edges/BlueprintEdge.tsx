import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function BlueprintEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.15, // Higher tension UE5 style bezier
  });

  const strokeColor = style.stroke || '#888888';

  return (
    <>
      {/* 1. Outer Bloom / Glow (Large, low opacity) */}
      <path
        id={id + '_glow'}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={6}
        strokeOpacity={0.12}
        style={{ filter: 'blur(3px)' }}
      />
      {/* 2. Secondary Glow (Closer, slightly more opacity) */}
      <path
        id={id + '_inner_glow'}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={4}
        strokeOpacity={0.25}
      />
      {/* 3. Main Edge Path */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2.8,
          strokeLinecap: 'round',
        }} 
      />
      {/* 4. Top Highlight (Very thin, white-ish, simulates core light) */}
      <path
        id={id + '_center_highlight'}
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth={0.8}
        strokeOpacity={0.15}
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
