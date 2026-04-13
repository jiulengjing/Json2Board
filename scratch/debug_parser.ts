import { parseT3D } from './src/utils/t3dParser';

const testT3D = `
Begin Object Class=/Script/BlueprintGraph.K2Node_Event Name="K2Node_Event_0"
   EventReference=(MemberParent="/Script/CoreUObject.Class'/Script/Engine.Actor'",MemberName="ReceiveBeginPlay")
   NodePosX=-200
   NodePosY=100
   CustomProperties Pin (PinId=E1,PinName="OutputDelegate",Direction="EGPD_Output",PinType.PinCategory="delegate")
   CustomProperties Pin (PinId=E2,PinName="then",Direction="EGPD_Output",PinType.PinCategory="exec",LinkedTo=(K2Node_CallFunction_0 execute,))
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_0"
   FunctionReference=(MemberParent="/Script/CoreUObject.Class'/Script/Engine.KismetSystemLibrary'",MemberName="K2_SetTimerDelegate")
   NodePosX=200
   NodePosY=100
   CustomProperties Pin (PinId=P1,PinName="execute",PinType.PinCategory="exec",LinkedTo=(K2Node_Event_0 then,))
   CustomProperties Pin (PinId=P2,PinName="Time",PinType.PinCategory="float",DefaultValue="1.0")
   CustomProperties Pin (PinId=P3,PinName="bLooping",PinType.PinCategory="bool",DefaultValue="True")
End Object
Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_1"
   FunctionReference=(MemberParent="/Script/CoreUObject.Class'/Script/Engine.KismetMathLibrary'",MemberName="Multiply_FloatFloat")
   NodePosX=200
   NodePosY=300
   CustomProperties Pin (PinId=P4,PinName="A",PinType.PinCategory="float")
   CustomProperties Pin (PinId=P5,PinName="B",PinType.PinCategory="float")
   CustomProperties Pin (PinId=P6,PinName="ReturnValue",Direction="EGPD_Output",PinType.PinCategory="float")
End Object
`;

const { payload } = parseT3D(testT3D);
console.log(JSON.stringify(payload, null, 2));
