function convertToLiteT3D(rawT3D) {
    const lines = rawT3D.split('\n');
    const liteLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmedLine = line.trim();

        // 1. Process Pins separately
        if (trimmedLine.startsWith('CustomProperties Pin')) {
            // Extract key attributes
            const pinIdMatch = line.match(/PinId=([A-Z0-9]+)/);
            const pinNameMatch = line.match(/PinName="([^"]+)"/);
            const categoryMatch = line.match(/PinType\.PinCategory="([^"]+)"/);
            const subCategoryMatch = line.match(/PinType\.PinSubCategoryObject="([^"]+)"/);
            const linkedToMatch = line.match(/LinkedTo=\(([^)]+)\)/);
            const directionMatch = line.match(/Direction="([^"]+)"/);
            const defaultValueMatch = line.match(/DefaultValue="([^"]+)"/);

            // Rebuild minimal Pin
            let litePinArr = [];
            if (pinIdMatch) litePinArr.push(`PinId=${pinIdMatch[1]}`);
            if (pinNameMatch) litePinArr.push(`PinName="${pinNameMatch[1]}"`);
            if (directionMatch && directionMatch[1] === "EGPD_Output") litePinArr.push(`Direction="EGPD_Output"`);
            
            // Category & SubCategory (Type info)
            if (categoryMatch) {
              litePinArr.push(`PinType.PinCategory="${categoryMatch[1]}"`);
            }
            if (subCategoryMatch && subCategoryMatch[1] !== "None") {
              // Extract short name from path if possible
              const parts = subCategoryMatch[1].split('.');
              const lastPart = parts.pop().replace(/'/g, '').replace(/"/g, '');
              litePinArr.push(`PinType.PinSubCategoryObject="${lastPart}"`);
            }

            if (linkedToMatch) litePinArr.push(`LinkedTo=(${linkedToMatch[1]})`);
            if (defaultValueMatch) litePinArr.push(`DefaultValue="${defaultValueMatch[1]}"`);
            
            liteLines.push(`   CustomProperties Pin (${litePinArr.join(',')})`);
            continue;
        }

        // 2. Filter out unwanted lines (GUIDs, Material references, etc.)
        if (
            trimmedLine.includes('Guid=') || 
            trimmedLine.includes('PersistentGuid') ||
            trimmedLine.startsWith('Material=') ||
            trimmedLine.startsWith('MaterialExpressionEditor') ||
            trimmedLine.startsWith('bCanRenameNode') ||
            trimmedLine.startsWith('ErrorType=')
        ) {
            continue;
        }

        // 3. Optimize Begin Object (remove ExportPath)
        if (trimmedLine.startsWith('Begin Object')) {
            line = line.replace(/ ExportPath="[^"]+"/g, '');
            liteLines.push(line);
            continue;
        }

        // 4. Keep other meaningful lines (NodePosX/Y, FunctionReference, etc.)
        if (trimmedLine.length > 0) {
            liteLines.push(line);
        }
    }

    return liteLines.join('\n');
}

const sample = `Begin Object Class=/Script/BlueprintGraph.K2Node_CallFunction Name="K2Node_CallFunction_3" ExportPath="/Script/BlueprintGraph.K2Node_CallFunction'/Game/VRE/Grippables/Weapons/Guns/GunBase.GunBase:EventGraph.K2Node_CallFunction_3'"
   FunctionReference=(MemberParent="/Script/CoreUObject.Class'/Script/Engine.KismetSystemLibrary'",MemberName="K2_ClearAndInvalidateTimerHandle")
   NodePosX=4048
   NodePosY=192
   NodeGuid=C85CDC61424F53F5A252669020C7EA23
   CustomProperties Pin (PinId=9B8447BA4377B29DD8542FB469F2FA16,PinName="execute",PinType.PinCategory="exec",PinType.PinSubCategory="",PinType.PinSubCategoryObject=None,PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False,LinkedTo=(K2Node_IfThenElse_4 3275C57B4D2DBCC1E2E552BBDD5BFFDA,),PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=False,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,)
   CustomProperties Pin (PinId=D137BA4547A4D297F44ACA88B9163A1D,PinName="then",Direction="EGPD_Output",PinType.PinCategory="exec",PinType.PinSubCategory="",PinType.PinSubCategoryObject=None,PinType.PinSubCategoryMemberReference=(),PinType.PinValueType=(),PinType.ContainerType=None,PinType.bIsReference=False,PinType.bIsConst=False,PinType.bIsWeakPointer=False,PinType.bIsUObjectWrapper=False,PinType.bSerializeAsSinglePrecisionFloat=False,PersistentGuid=00000000000000000000000000000000,bHidden=False,bNotConnectable=False,bDefaultValueIsReadOnly=False,bDefaultValueIsIgnored=False,bAdvancedView=False,bOrphanedPin=False,)
End Object`;

console.log(convertToLiteT3D(sample));
