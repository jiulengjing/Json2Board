import { parseT3D } from '../t3dParser';

const testT3D = `
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_0"
   Begin Object Class=/Script/Engine.MaterialExpressionTextureSample Name="MaterialExpressionTextureSample_0"
   End Object
   Begin Object Name="MaterialExpressionTextureSample_0"
      Texture=Texture2D'"/Game/TestTex.TestTex"'
   End Object
   MaterialExpression=MaterialExpressionTextureSample'"MaterialExpressionTextureSample_0"'
   NodePosX=-500
   NodePosY=0
   CustomProperties Pin (PinId="E5DBDB974FE5C6E6DDE450BFE4F0AC74",PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "RGB", "RGB"),Direction="EGPD_Output",PinType.PinCategory="mask")
End Object

Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_1"
   Begin Object Class=/Script/Engine.MaterialExpressionAdd Name="MaterialExpressionAdd_0"
   End Object
   MaterialExpression=MaterialExpressionAdd'"MaterialExpressionAdd_0"'
   NodePosX=-200
   NodePosY=100
   CustomProperties Pin (PinId="A1",PinName="A",Direction="EGPD_Input",PinType.PinCategory="optional",LinkedTo=(MaterialGraphNode_0 E5DBDB974FE5C6E6DDE450BFE4F0AC74))
   CustomProperties Pin (PinId="B1",PinName="B",Direction="EGPD_Input",PinType.PinCategory="optional")
   CustomProperties Pin (PinId="O1",PinName="Output",Direction="EGPD_Output",PinType.PinCategory="optional")
End Object

Begin Object Class=/Script/UnrealEd.MaterialGraphNode_Root Name="MaterialGraphNode_Root_0"
   NodePosX=0
   NodePosY=0
   CustomProperties Pin (PinId="BC",PinName="BaseColor",Direction="EGPD_Input",PinType.PinCategory="materialinput",LinkedTo=(MaterialGraphNode_1 O1))
   CustomProperties Pin (PinId="SP",PinName="Specular",Direction="EGPD_Input",PinType.PinCategory="materialinput",DefaultValue="0.500000")
End Object
`;
try {
  console.log(parseT3D(testT3D, 'material').dsl);
} catch (e) {
  console.log(e);
}
