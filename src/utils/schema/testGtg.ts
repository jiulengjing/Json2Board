import { parseGtgToPayload } from '../gtgParser';

const testScript = `
[Node: MaterialResult] (Root) @(16, 144) {/Script/UnrealEd.MaterialGraphNode_Root}
<- IN [Data: Base Color]: MaterialGraphNode_16.RGB
<- IN [Data: Metallic]: MaterialGraphNode_1.Output
<- IN [Data: Specular]: 0.5
<- IN [Data: Roughness]: MaterialGraphNode_17.R
<- IN [Data: Emissive Color]: (R=0.000000,G=0.000000,B=0.000000,A=0.000000)
<- IN [Data: Opacity]: 1.0
<- IN [Data: Opacity Mask]: 1.0
<- IN [Data: Normal]: MaterialGraphNode_18.RGB
<- IN [Data: Tangent]: 1.0,0.0,0.0
<- IN [Data: Subsurface Color]: (R=1.000000,G=1.000000,B=1.000000,A=0.000000)
<- IN [Data: Ambient Occlusion]: 1.0
<- IN [Data: Refraction (Disabled)]: 1.0
<- IN [Data: Surface Thickness]: 0.01

[Node: MaterialGraphNode_1] (Function) @(-224, 192) {/Script/UnrealEd.MaterialGraphNode}
-> OUT [Data: Output]: MaterialResult.Metallic

[Node: MaterialGraphNode_5] (Function) @(-1056, 144) {/Script/UnrealEd.MaterialGraphNode}
-> OUT [Data: Output]: MaterialGraphNode_12.A

[Node: MaterialGraphNode_12] (Function) @(-816, 144) {/Script/UnrealEd.MaterialGraphNode}
<- IN [Data: A]: MaterialGraphNode_5.Output
<- IN [Data: B]: MaterialGraphNode_13.Output
-> OUT [Data: Output]: MaterialGraphNode_15.A
-> OUT [Data: Output]: MaterialGraphNode_16.UVs
-> OUT [Data: Output]: MaterialGraphNode_18.UVs

[Node: MaterialGraphNode_13] (Function) @(-992, 256) {/Script/UnrealEd.MaterialGraphNode}
-> OUT [Data: Output]: MaterialGraphNode_12.B

[Node: MaterialGraphNode_14] (Function) @(-896, 719) {/Script/UnrealEd.MaterialGraphNode}
-> OUT [Data: Output]: MaterialGraphNode_15.B

[Node: MaterialGraphNode_15] (Function) @(-640, 689) {/Script/UnrealEd.MaterialGraphNode}
<- IN [Data: A]: MaterialGraphNode_12.Output
<- IN [Data: B]: MaterialGraphNode_14.Output
-> OUT [Data: Output]: MaterialGraphNode_17.UVs

[Node: MaterialGraphNode_16] (Function) @(-496, 128) {/Script/UnrealEd.MaterialGraphNode}
<- IN [Data: UVs]: MaterialGraphNode_12.Output
-> OUT [Data: RGB]: MaterialResult.Base Color

[Node: MaterialGraphNode_17] (Function) @(-496, 672) {/Script/UnrealEd.MaterialGraphNode}
<- IN [Data: UVs]: MaterialGraphNode_15.Output
-> OUT [Data: R]: MaterialResult.Roughness

[Node: MaterialGraphNode_18] (Function) @(-496, 400) {/Script/UnrealEd.MaterialGraphNode}
<- IN [Data: UVs]: MaterialGraphNode_12.Output
-> OUT [Data: RGB]: MaterialResult.Normal
`;

try {
  const parsed = parseGtgToPayload(testScript, 'material');
  console.log(JSON.stringify(parsed.nodes, null, 2));
} catch (e) {
  console.log(e);
}
