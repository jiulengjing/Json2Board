function generateRandomGuid(): string {
  return crypto.randomUUID().replace(/-/g, '').toUpperCase();
}

/**
 * Expands a token-efficient Material Lite-T3D snippet back into rigorous UE5 T3D.
 * 
 * Critical difference from Blueprints:
 * Material nodes require an outer MaterialGraphNode wrapper.
 */
export function restoreMaterialT3D(liteT3d: string): string {
  const blocks = liteT3d.split('Begin Object');
  const restoredLines: string[] = [];

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    // Detect if this is already an expanded MaterialGraphNode (e.g. from pasted raw T3D)
    if (block.includes('Class=/Script/UnrealEd.MaterialGraphNode')) {
        restoredLines.push('Begin Object ' + block);
        continue;
    }

    const classMatch = /Class=([^\s]+)/.exec(block);
    const nameMatch = /Name="([^"]+)"/.exec(block);

    if (!classMatch || !nameMatch) {
      restoredLines.push('Begin Object ' + block);
      continue;
    }

    const className = classMatch[1];
    const nodeName = nameMatch[1];

    const outerNodeName = `MaterialGraphNode_${generateRandomGuid().substring(0, 4)}`;
    
    // Parse the inner body to extract custom properties and code
    const lines = block.split('\n');
    const customPins: string[] = [];
    const coreProperties: string[] = [];
    let isMath = false;

    let posX = 0;
    let posY = 0;

    for (let line of lines) {
       let t = line.trim();
       if (!t || t.startsWith('Class=') || t.startsWith('End Object')) continue;

       if (t.startsWith('CustomProperties Pin')) {
          // If the AI forgot a trailing comma, ensure it (Unreal needs it)
          if (!t.endsWith(',')) {
              if (t.endsWith(')')) {
                  t = t.substring(0, t.length - 1) + ',)';
              }
          }
          // Inject a persistent GUID for every pin
          const pinId = generateRandomGuid();
          const cleanPin = t.replace('CustomProperties Pin (', `CustomProperties Pin (PinId=${pinId},persistentGuid=${pinId},`);
          customPins.push(cleanPin);
       } else if (t.startsWith('NodePosX=')) {
          posX = parseInt(t.split('=')[1], 10);
       } else if (t.startsWith('NodePosY=')) {
          posY = parseInt(t.split('=')[1], 10);
       } else {
          // Inner properties like Code="", Texture="", Constant=""
          if (t.includes('Add') || t.includes('Multiply')) isMath = true;
          coreProperties.push(t);
       }
    }

    // Wrap in Outer Object
    restoredLines.push(`Begin Object Class=/Script/UnrealEd.MaterialGraphNode Name="${outerNodeName}"`);
    
    // Create Inner Object
    const innerClassName = className.includes('.') ? className : `/Script/Engine.${className}`;
    restoredLines.push(`   Begin Object Class=${innerClassName} Name="${nodeName}"`);
    restoredLines.push(`   End Object`);

    // Define Inner Object body
    restoredLines.push(`   Begin Object Name="${nodeName}"`);
    for (const p of coreProperties) {
       restoredLines.push(`      ${p}`);
    }
    restoredLines.push(`      MaterialExpressionEditorX=${posX}`);
    restoredLines.push(`      MaterialExpressionEditorY=${posY}`);
    restoredLines.push(`      MaterialExpressionGuid=${generateRandomGuid()}`);
    restoredLines.push(`   End Object`);

    restoredLines.push(`   MaterialExpression="${innerClassName}'${nodeName}'"`);
    restoredLines.push(`   NodePosX=${posX}`);
    restoredLines.push(`   NodePosY=${posY}`);
    restoredLines.push(`   NodeGuid=${generateRandomGuid()}`);
    
    // Add Pins
    for (const pin of customPins) {
       restoredLines.push(`   ${pin}`);
    }

    restoredLines.push('End Object\n');
  }

  return restoredLines.join('\n');
}
