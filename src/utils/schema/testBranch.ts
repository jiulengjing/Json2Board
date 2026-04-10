import { parseT3D } from '../t3dParser';

const testT3D = `
Begin Object Class=/Script/BlueprintGraph.K2Node_IfThenElse Name="K2Node_IfThenElse_0"
   NodePosX=100
   NodePosY=200
   CustomProperties Pin (PinId="E1",PinName="execute",Direction="EGPD_Input",PinType.PinCategory="exec")
   CustomProperties Pin (PinId="C1",PinName="Condition",Direction="EGPD_Input",PinType.PinCategory="bool")
   CustomProperties Pin (PinId="T1",PinName="then",Direction="EGPD_Output",PinType.PinCategory="exec",LinkedTo=(K2Node_CallFunction_0 E2))
   CustomProperties Pin (PinId="F1",PinName="else",Direction="EGPD_Output",PinType.PinCategory="exec",LinkedTo=(K2Node_CallFunction_1 E3))
End Object
`;

const result = parseT3D(testT3D);
console.log("== GENERATED DSL ==");
console.log(result.dsl);
