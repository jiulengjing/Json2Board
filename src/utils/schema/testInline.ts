import { parseGtgToPayload } from '../gtgParser';
const script = `
[Node: TextureCoordinate] (Coordinate) @(-800, 0)
-> OUT [Data: Output]: Multiply_01.A

[Node: Multiply_01] (Math) @(-500, 0)
<- IN [Data: A]: TextureCoordinate.Output
<- IN [Data: B] = 4.0
-> OUT [Data: Output]: Diffuse1.UVs

[Node: Diffuse1] (Texture) @(-200, 0)
<- IN [Data: UVs]: Multiply_01.Output
-> OUT [Data: RGB]: MaterialResult.Base Color

[Node: MaterialResult] (Root) @(0, 0)
<- IN [Data: Base Color]: Diffuse1.RGB
<- IN [Data: Metallic] = 0.0
<- IN [Data: Roughness] = 0.3
`;
const r = parseGtgToPayload(script, 'material');
const multi = r.nodes.find(n => n.id === 'Multiply_01');
const root = r.nodes.find(n => n.id === 'MaterialResult');
console.log('Multiply_01 inputs:', JSON.stringify(multi?.inputs, null, 2));
console.log('Root inputs:', JSON.stringify(root?.inputs, null, 2));
console.log('Total edges:', r.edges.length);
