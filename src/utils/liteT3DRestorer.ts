/**
 * liteT3DRestorer.ts
 * Expands a Lite-T3D string back into a valid full UE5 T3D string ready for paste.
 */

/** Generate a random UE-style GUID (32 hex uppercase, no dashes for NodeGuid format) */
function generateGuid(): string {
  const hex = () => Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
  return `${hex()}${hex()}${hex()}${hex()}`;
}

/** The full boilerplate appended to every CustomProperties Pin */
const PIN_BOILERPLATE_SUFFIX = (persistentGuid: string, bHidden: boolean): string =>
  `PersistentGuid=${persistentGuid},` +
  `bHidden=${bHidden ? 'True' : 'False'},` +
  `bNotConnectable=False,` +
  `bDefaultValueIsReadOnly=False,` +
  `bDefaultValueIsIgnored=False,` +
  `bAdvancedView=False,` +
  `bOrphanedPin=False,`;

/** The full PinType boilerplate based on category */
function buildPinTypeSuffix(pinTypeProps: Map<string, string>): string {
  // Extract what we know
  const cat = pinTypeProps.get('PinCategory') ?? 'object';
  const subCat = pinTypeProps.get('PinSubCategory') ?? '';
  const subCatObj = pinTypeProps.get('PinSubCategoryObject') ?? 'None';
  const isRef = pinTypeProps.get('bIsReference') ?? 'False';

  return [
    `PinType.PinCategory="${cat}"`,
    `PinType.PinSubCategory="${subCat}"`,
    `PinType.PinSubCategoryObject=${subCatObj === 'None' ? 'None' : '"' + subCatObj + '"'}`,
    `PinType.PinSubCategoryMemberReference=()`,
    `PinType.PinValueType=()`,
    `PinType.ContainerType=None`,
    `PinType.bIsReference=${isRef}`,
    `PinType.bIsConst=False`,
    `PinType.bIsWeakPointer=False`,
    `PinType.bIsUObjectWrapper=False`,
    `PinType.bSerializeAsSinglePrecisionFloat=False`,
  ].join(',');
}

/** Parse a single CustomProperties Pin (...) chunk and expand it */
function expandPin(chunk: string): string {
  // chunk is the content inside "CustomProperties Pin (...)"
  // We need to extract known fields and inject the rest

  const get = (pat: RegExp) => pat.exec(chunk)?.[1] ?? null;

  const pinId = get(/PinId=([0-9A-Za-z\-]+)/) ?? generateGuid();
  const pinName = get(/PinName="([^"]*)"/) ?? '';
  const direction = /Direction="EGPD_Output"/.test(chunk) ? 'EGPD_Output' : null;

  // PinType fields - extract from Lite-T3D
  const pinCat = get(/PinType\.PinCategory="([^"]*)"/)
    ?? get(/PinCategory="([^"]*)"/) ?? 'object';
  const pinSubCat = get(/PinType\.PinSubCategory="([^"]*)"/)
    ?? get(/PinSubCategory="([^"]*)"/) ?? '';
  const pinObjMatch = get(/PinType\.PinSubCategoryObject="([^"]*)"/)
    ?? get(/PinSubCategoryObject="([^"]*)"/) ?? 'None';
  const bIsRef = get(/PinType\.bIsReference=(True|False)/) ?? 'False';

  const pinTypeMap = new Map<string, string>();
  pinTypeMap.set('PinCategory', pinCat);
  pinTypeMap.set('PinSubCategory', pinSubCat);
  pinTypeMap.set('PinSubCategoryObject', pinObjMatch);
  pinTypeMap.set('bIsReference', bIsRef);

  // PinFriendlyName
  const friendlyRaw = get(/PinFriendlyName=(NSLOCTEXT\([^)]*\)|"[^"]*")/);
  const pinFriendlyPart = friendlyRaw ? `PinFriendlyName=${friendlyRaw},` : '';

  // LinkedTo
  const linkedTo = get(/LinkedTo=\(([^)]+)\)/);
  const linkedToPart = linkedTo ? `LinkedTo=(${linkedTo}),` : '';

  // DefaultValue
  const defaultValue = get(/DefaultValue="([^"]*)"/);
  const defaultPart = defaultValue !== null ? `DefaultValue="${defaultValue}",` : '';

  // bHidden: detect self/WorldContextObject pins as hidden
  const isHidden = /bHidden=True/.test(chunk) ||
    pinName === 'self' || pinName === 'WorldContextObject';

  const persistentGuid = generateGuid();
  const dirPart = direction ? `Direction="${direction}",` : '';

  const fullPinType = buildPinTypeSuffix(pinTypeMap);
  const boilerplate = PIN_BOILERPLATE_SUFFIX(persistentGuid, isHidden);

  return (
    `(PinId=${pinId},` +
    `PinName="${pinName}",` +
    pinFriendlyPart +
    dirPart +
    fullPinType + ',' +
    defaultPart +
    linkedToPart +
    boilerplate +
    `)`
  );
}

/** Main restore function: expand Lite-T3D to Full T3D */
export function restoreT3D(liteT3D: string): string {
  const output: string[] = [];

  // Split into "Begin Object...End Object" blocks
  const blockRegex = /Begin Object([\s\S]*?)End Object/g;
  let match;

  while ((match = blockRegex.exec(liteT3D)) !== null) {
    const blockContent = match[1];

    // Extract Class and Name from the header line
    const headerLine = 'Begin Object' + blockContent.split('\n')[0];
    const className = /Class=([^\s]+)/.exec(headerLine)?.[1] ?? '';
    const objName = /Name="([^"]+)"/.exec(headerLine)?.[1] ?? '';

    // Remove ExportPath if present
    const cleanHeader = `Begin Object Class=${className} Name="${objName}"`;

    // Generate NodeGuid
    const nodeGuid = generateGuid();

    const bodyLines: string[] = [];

    // Process all lines except the header
    const lines = blockContent.split('\n').slice(1); // skip first (header fields)
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'End Object') continue;

      if (trimmed.startsWith('CustomProperties Pin (')) {
        // Extract inner content
        const pinChunk = trimmed.replace(/^CustomProperties Pin \(/, '').replace(/\)$/, '');
        const expanded = expandPin(pinChunk);
        bodyLines.push(`   CustomProperties Pin ${expanded}`);
      } else if (trimmed.startsWith('NodeGuid=') || trimmed.startsWith('PersistentGuid=')) {
        // Skip old GUIDs - we'll inject fresh ones
        continue;
      } else {
        bodyLines.push('   ' + trimmed);
      }
    }

    bodyLines.push(`   NodeGuid=${nodeGuid}`);

    output.push(cleanHeader);
    output.push(...bodyLines);
    output.push('End Object');
    output.push('');
  }

  return output.join('\n').trim();
}
