import { parseT3D } from '../t3dParser';

const t3d = `Begin Object Class=/Script/UnrealEd.MaterialGraphNode_Root Name="MaterialGraphNode_Root_0" ExportPath=""
   Material="/Script/UnrealEd.PreviewMaterial'/Engine/Transient.M_Blade_HeroSword12'"
   NodePosX=16
   NodePosY=144
   NodeGuid=2A321774426C20AD5A92699D071CBD29
   CustomProperties Pin (PinId=C7EBEFF649D7DA77C766E6A982B9DE32,PinName="Base Color",PinType.PinCategory="materialinput",PinType.PinSubCategory="rgba",DefaultValue="(R=0.501961,G=0.501961,B=0.501961,A=1.000000)",LinkedTo=(MaterialGraphNode_16 47A607ED4A620E3CFC4607BA9699F367,),bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=FBF97271463ABE7323374286B2596B8E,PinName="Metallic",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="0.0",LinkedTo=(MaterialGraphNode_1 017CCBC34DFDAAC682E5C5B913848C47,),bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=A67501D9443A8A0D2AC48E87577B71E7,PinName="Specular",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="0.5",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=BFC3855A4B6421A20C17A099018A3F85,PinName="Roughness",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="0.5",LinkedTo=(MaterialGraphNode_17 F5B94FA24DB26CC2E5B19187DD8E843E,),bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=016E2B0D420FE0CB78D94B8E008659B5,PinName="Anisotropy",PinType.PinCategory="materialinput",PinType.PinSubCategory="",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=D69BA5444A0C846195BD80BB92E7AB86,PinName="Emissive Color",PinType.PinCategory="materialinput",PinType.PinSubCategory="rgba",DefaultValue="(R=0.000000,G=0.000000,B=0.000000,A=0.000000)",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=3F8F8541437E7A0AA3F0DDAD58EB4A9F,PinName="Opacity",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="1.0",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=33DD574148E3ECBDE8A86A9C0542EA8B,PinName="Opacity Mask",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="1.0",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=88D71B6B4F3B93B217258F96D78589EB,PinName="Normal",PinType.PinCategory="materialinput",PinType.PinSubCategory="rgb",DefaultValue="0.0,0.0,0.0",LinkedTo=(MaterialGraphNode_18 8A28DE084FF1681E32B9C884E1F75FE0,),bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=BE48C8BC4348320790D5EBACC47BF0AC,PinName="Tangent",PinType.PinCategory="materialinput",PinType.PinSubCategory="rgb",DefaultValue="1.0,0.0,0.0",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=3266EC484BA81FBCE44668B204E93BC8,PinName="World Position Offset",PinType.PinCategory="materialinput",PinType.PinSubCategory="",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=157D71304A0BF8E9F1D7F1A7D7F62639,PinName="Subsurface Color",PinType.PinCategory="materialinput",PinType.PinSubCategory="rgba",DefaultValue="(R=1.000000,G=1.000000,B=1.000000,A=0.000000)",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=DB9BC73E4FC2EAEE2658688090DF08FE,PinName="Custom Data 0",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="1.0",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=24B0FD784F1A8785A83C7FB6701B315E,PinName="Custom Data 1",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="0.1",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=0EF9BA4247718CE25166ED8F725E30F7,PinName="Ambient Occlusion",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="1.0",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=E527A0714870E392E31ABD8591D27BD3,PinName="Refraction (Disabled)",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="1.0",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=2967F64D4EE0B34DC778C7AD8CC8780F,PinName="Customized UV0",PinType.PinCategory="materialinput",PinType.PinSubCategory="rg",DefaultValue="(X=0.0,Y=0.0)",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=A2D990F1467DF230A010A4988688A8C5,PinName="Pixel Depth Offset",PinType.PinCategory="materialinput",PinType.PinSubCategory="",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=8C121EA048F86607A030A4A674810385,PinName="Shading Model",PinType.PinCategory="materialinput",PinType.PinSubCategory="",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=977AC4544B509561834B9781227DB629,PinName="Surface Thickness",PinType.PinCategory="materialinput",PinType.PinSubCategory="red",DefaultValue="0.01",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=6B546A804251BCBCFFBC5F9144D9C662,PinName="Displacement",PinType.PinCategory="materialinput",PinType.PinSubCategory="",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_1" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionConstant Name="MaterialExpressionConstant_3" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionConstant_3" ExportPath=""
      R=1.000000
      MaterialExpressionEditorX=-224
      MaterialExpressionEditorY=192
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionConstant'MaterialExpressionConstant_3'"
   NodePosX=-224
   NodePosY=192
   CustomProperties Pin (PinId=C36C0AB24DC3409A02D4129ECAE1AA6D,PinName="Value",PinType.PinCategory="optional",DefaultValue="1.0",bHidden=False,bNotConnectable=True,bAdvancedView=False,)
   CustomProperties Pin (PinId=017CCBC34DFDAAC682E5C5B913848C47,PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " "),Direction="EGPD_Output",PinType.PinCategory="",LinkedTo=(MaterialGraphNode_Root_0 FBF97271463ABE7323374286B2596B8E,),bHidden=False,bNotConnectable=False,bAdvancedView=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_5" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionTextureCoordinate Name="MaterialExpressionTextureCoordinate_0" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionTextureCoordinate_0" ExportPath=""
      UTiling=4.000000
      VTiling=4.000000
      MaterialExpressionEditorX=-1056
      MaterialExpressionEditorY=144
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionTextureCoordinate'MaterialExpressionTextureCoordinate_0'"
   NodePosX=-1056
   NodePosY=144
   CustomProperties Pin (PinId=3FE4CF534F9930893E4486886131AA75,PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " "),Direction="EGPD_Output",LinkedTo=(MaterialGraphNode_12 609D2CD94F397BAEBB8036A0C1B121A4,),bHidden=False,bNotConnectable=False,bAdvancedView=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_12" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionAdd Name="MaterialExpressionAdd_0" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionAdd_0" ExportPath=""
      MaterialExpressionEditorX=-816
      MaterialExpressionEditorY=144
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionAdd'MaterialExpressionAdd_0'"
   NodePosX=-816
   NodePosY=144
   CustomProperties Pin (PinId=609D2CD94F397BAEBB8036A0C1B121A4,PinName="A",DefaultValue="0.0",LinkedTo=(MaterialGraphNode_5 3FE4CF534F9930893E4486886131AA75,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=253F17EC4B4D81B4EAEB808DD097DA6B,PinName="B",DefaultValue="1.0",LinkedTo=(MaterialGraphNode_13 49FEF14F49AAF469288E6FAE48131882,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=D2BF162141C53FABFDE9C3B7905CE10F,PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " "),Direction="EGPD_Output",LinkedTo=(MaterialGraphNode_15 09A297A74CFC9077AF995F88F29DFA1D,MaterialGraphNode_16 206722F64C84DC2D8F99AE9D6CF465C4,MaterialGraphNode_18 5BD1114848CA4B89CA5B908D4B5F045D,),bHidden=False,bNotConnectable=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_13" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionConstant2Vector Name="MaterialExpressionConstant2Vector_0" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionConstant2Vector_0" ExportPath=""
      G=-2.000000
      MaterialExpressionEditorX=-992
      MaterialExpressionEditorY=256
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionConstant2Vector'MaterialExpressionConstant2Vector_0'"
   NodePosX=-992
   NodePosY=256
   CustomProperties Pin (PinId=F53C9C8947A9B4C387B3FD850D9CEF4A,PinName="X",DefaultValue="0.0",bHidden=False,bNotConnectable=True,)
   CustomProperties Pin (PinId=3087F61B407EA481E5CA6A9C48D23894,PinName="Y",DefaultValue="-2.0",bHidden=False,bNotConnectable=True,)
   CustomProperties Pin (PinId=49FEF14F49AAF469288E6FAE48131882,PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " "),Direction="EGPD_Output",PinType.PinCategory="mask",LinkedTo=(MaterialGraphNode_12 253F17EC4B4D81B4EAEB808DD097DA6B,),bHidden=False,bNotConnectable=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_14" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionConstant2Vector Name="MaterialExpressionConstant2Vector_3" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionConstant2Vector_3" ExportPath=""
      G=-1.000000
      MaterialExpressionEditorX=-896
      MaterialExpressionEditorY=719
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionConstant2Vector'MaterialExpressionConstant2Vector_3'"
   NodePosX=-896
   NodePosY=719
   CustomProperties Pin (PinId=A71171B94D84CB4990DFBEBE2B684096,PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " "),Direction="EGPD_Output",PinType.PinCategory="mask",LinkedTo=(MaterialGraphNode_15 D1379A8946DA337E149370BE91EA345E,),bHidden=False,bNotConnectable=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_15" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionAdd Name="MaterialExpressionAdd_3" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionAdd_3" ExportPath=""
      MaterialExpressionEditorX=-640
      MaterialExpressionEditorY=689
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionAdd'MaterialExpressionAdd_3'"
   NodePosX=-640
   NodePosY=689
   CustomProperties Pin (PinId=09A297A74CFC9077AF995F88F29DFA1D,PinName="A",DefaultValue="0.0",LinkedTo=(MaterialGraphNode_12 D2BF162141C53FABFDE9C3B7905CE10F,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=D1379A8946DA337E149370BE91EA345E,PinName="B",DefaultValue="1.0",LinkedTo=(MaterialGraphNode_14 A71171B94D84CB4990DFBEBE2B684096,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=DC00597E49C08210C570E59C9AD5868F,PinName="Output",PinFriendlyName=NSLOCTEXT("MaterialGraphNode", "Space", " "),Direction="EGPD_Output",LinkedTo=(MaterialGraphNode_17 DF9527D0432BD41AEEE2038AACF27BEF,),bHidden=False,bNotConnectable=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_16" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionTextureSampleParameter2D Name="MaterialExpressionTextureSampleParameter2D_0" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionTextureSampleParameter2D_0" ExportPath=""
      ParameterName="Diffuse1"
      Texture="/Script/Engine.Texture2D'/Game/VRE/Grippables/Weapons/Melee/Blade_HeroSword11/T_Blade_HeroSword_011_D.T_Blade_HeroSword_011_D'"
      MaterialExpressionEditorX=-496
      MaterialExpressionEditorY=128
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionTextureSampleParameter2D'MaterialExpressionTextureSampleParameter2D_0'"
   NodePosX=-496
   NodePosY=128
   CustomProperties Pin (PinId=206722F64C84DC2D8F99AE9D6CF465C4,PinName="UVs",DefaultValue="0",LinkedTo=(MaterialGraphNode_12 D2BF162141C53FABFDE9C3B7905CE10F,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=A73F4CA24AEB6A6D2A2269937E28D19D,PinName="Apply View MipBias",PinType.PinCategory="optional",bHidden=False,bNotConnectable=False,bAdvancedView=False,)
   CustomProperties Pin (PinId=B681719B4BDDC85C0D60A3BCAC85F006,PinName="MipValueMode",DefaultValue="None (use computed mip level)",bHidden=False,bNotConnectable=True,bAdvancedView=True,)
   CustomProperties Pin (PinId=47A607ED4A620E3CFC4607BA9699F367,PinName="RGB",Direction="EGPD_Output",PinType.PinCategory="mask",LinkedTo=(MaterialGraphNode_Root_0 C7EBEFF649D7DA77C766E6A982B9DE32,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=9BD4832A4B382B9B46BD6EA9A7C93298,PinName="R",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="red",bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=504081BB451AD35FF57637AF853D3A07,PinName="G",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="green",bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=985FD1A84810229F26C1F39EF0F40C91,PinName="B",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="blue",bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=5DA14023488316D18529EC84A0A27A20,PinName="A",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="alpha",bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=DA4E1D954A8DDAB4E58FB4914B00375B,PinName="RGBA",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="rgba",bHidden=False,bNotConnectable=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_17" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionTextureSampleParameter2D Name="MaterialExpressionTextureSampleParameter2D_1" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionTextureSampleParameter2D_1" ExportPath=""
      ParameterName="Diffuse2"
      Texture="/Script/Engine.Texture2D'/Game/VRE/Grippables/Weapons/Melee/Blade_HeroSword11/T_Blade_HeroSword_012_D.T_Blade_HeroSword_012_D'"
      MaterialExpressionEditorX=-496
      MaterialExpressionEditorY=672
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionTextureSampleParameter2D'MaterialExpressionTextureSampleParameter2D_1'"
   NodePosX=-496
   NodePosY=672
   CustomProperties Pin (PinId=DF9527D0432BD41AEEE2038AACF27BEF,PinName="UVs",DefaultValue="0",LinkedTo=(MaterialGraphNode_15 DC00597E49C08210C570E59C9AD5868F,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=F5B94FA24DB26CC2E5B19187DD8E843E,PinName="R",Direction="EGPD_Output",PinType.PinCategory="mask",PinType.PinSubCategory="red",LinkedTo=(MaterialGraphNode_Root_0 BFC3855A4B6421A20C17A099018A3F85,),bHidden=False,bNotConnectable=False,)
End Object
Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="MaterialGraphNode_18" ExportPath=""
   Begin Object Class=/Script/Engine.MaterialExpressionTextureSampleParameter2D Name="MaterialExpressionTextureSampleParameter2D_2" ExportPath=""
   End Object
   Begin Object Name="MaterialExpressionTextureSampleParameter2D_2" ExportPath=""
      ParameterName="Normal1"
      Texture="/Script/Engine.Texture2D'/Game/VRE/Grippables/Weapons/Melee/Blade_HeroSword11/T_Blade_HeroSword_011_N.T_Blade_HeroSword_011_N'"
      MaterialExpressionEditorX=-496
      MaterialExpressionEditorY=400
   End Object
   MaterialExpression="/Script/Engine.MaterialExpressionTextureSampleParameter2D'MaterialExpressionTextureSampleParameter2D_2'"
   NodePosX=-496
   NodePosY=400
   CustomProperties Pin (PinId=5BD1114848CA4B89CA5B908D4B5F045D,PinName="UVs",DefaultValue="0",LinkedTo=(MaterialGraphNode_12 D2BF162141C53FABFDE9C3B7905CE10F,),bHidden=False,bNotConnectable=False,)
   CustomProperties Pin (PinId=8A28DE084FF1681E32B9C884E1F75FE0,PinName="RGB",Direction="EGPD_Output",PinType.PinCategory="mask",LinkedTo=(MaterialGraphNode_Root_0 88D71B6B4F3B93B217258F96D78589EB,),bHidden=False,bNotConnectable=False,)
End Object`;

const result = parseT3D(t3d, 'material');
const rootNode = result.payload.nodes[0];
console.log('Root node inputs:');
console.log(JSON.stringify(rootNode.inputs, null, 2));
