import { parseT3D } from '../t3dParser';

const testT3D = `
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_0"
   MaterialExpression=MaterialExpressionTextureSample'"MaterialExpressionTextureSample_0"'
   NodePosX=-800
   NodePosY=100
   CustomProperties Pin (PinId="E5DBDB974FE5C6E6DDE450BFE4F0AC74",PinName="RGB",Direction="EGPD_Output",PinType.PinCategory="mask")
   CustomProperties Pin (PinId="406FEA934E8A5E4E37A6A0B1DF7CE98B",PinName="R",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="red")
End Object

Begin Object Class=/Script/UnrealEd.MaterialGraphNode_Root Name="MaterialGraphNode_Root_0"
   Material=Material'"/Engine/Transient.Material_0"'
   NodePosX=0
   NodePosY=0
   CustomProperties Pin (PinId="C56A",PinName="BaseColor",Direction="EGPD_Input",PinType.PinCategory="materialinput",LinkedTo=(MaterialGraphNode_0 E5DBDB974FE5C6E6DDE450BFE4F0AC74))
   CustomProperties Pin (PinId="XYZ...",PinName="Specular",Direction="EGPD_Input",PinType.PinCategory="materialinput",DefaultValue="0.500000")
End Object

Begin Object Class=/Script/Engine.MaterialExpressionTextureSample Name="MaterialExpressionTextureSample_0"
   Texture=Texture2D'"/Game/Textures/T_Weapon_Set2_BaseColor.T_Weapon_Set2_BaseColor"'
End Object
`;

console.log(parseT3D(testT3D, 'material').dsl);
