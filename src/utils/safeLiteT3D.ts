/**
 * Safe LiteT3D Universal Compressor
 * ===================================
 * Compresses raw UE5 T3D text (Blueprint, Material, Niagara, etc.)
 * into a minimal but 100% topology-preserving "Lite-T3D" format.
 *
 * Key rules:
 *  - Drop all Guid / Editor-position / UI-state lines (standalone metadata)
 *  - Drop disconnected input pins entirely (their values live in the node body)
 *  - Strip noise fields IN-PLACE on kept pins — PinId & LinkedTo UUIDs are untouched
 *  - Strip ExportPath from Begin Object headers
 *  - Retain all logic-carrying lines verbatim
 */
export function convertToSafeLiteT3D(rawText: string): string {
  const lines = rawText.split('\n');
  const safeLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#')) continue;

    // ── Pin Handler (MUST come first) ──────────────────────────────────────
    // Pin lines contain "PersistentGuid=" which would false-positive on any
    // Guid= blacklist if checked first.
    if (trimmedLine.startsWith('CustomProperties Pin (')) {
      const isConnected = trimmedLine.includes('LinkedTo=(');
      const isOutput    = trimmedLine.includes('Direction="EGPD_Output"');

      // Drop disconnected input pins — their DefaultValue lives in the node body
      if (!isConnected && !isOutput) continue;

      // Strip noise IN-PLACE; never rebuild so PinId & LinkedTo UUIDs stay verbatim
      const safe = trimmedLine
        .replace(/,?PinType\.PinSubCategory="[^"]*"/g, '')
        .replace(/,?PinType\.PinSubCategoryObject=[^,)]+/g, '')
        .replace(/,?PinType\.PinSubCategoryMemberReference=\([^)]*\)/g, '')
        .replace(/,?PinType\.PinValueType=\([^)]*\)/g, '')
        .replace(/,?PinType\.ContainerType=[^,)]+/g, '')
        .replace(/,?PinType\.bIsReference=\w+/g, '')
        .replace(/,?PinType\.bIsConst=\w+/g, '')
        .replace(/,?PinType\.bIsWeakPointer=\w+/g, '')
        .replace(/,?PinType\.bIsUObjectWrapper=\w+/g, '')
        .replace(/,?PinType\.bSerializeAsSinglePrecisionFloat=\w+/g, '')
        .replace(/,?PersistentGuid=[0-9A-Fa-f]+/g, '')
        .replace(/,?bHidden=\w+/g, '')
        .replace(/,?bNotConnectable=\w+/g, '')
        .replace(/,?bDefaultValueIsReadOnly=\w+/g, '')
        .replace(/,?bDefaultValueIsIgnored=\w+/g, '')
        .replace(/,?bAdvancedView=\w+/g, '')
        .replace(/,?bOrphanedPin=\w+/g, '')
        .replace(/,?PinFriendlyName=NSLOCTEXT\([^)]+\)/g, '')
        .replace(/,?DefaultValue="[^"]*"/g, '')
        .replace(/,\s*\)$/, ')');

      safeLines.push('   ' + safe);
      continue;
    }

    // ── Standalone Metadata Blacklist ───────────────────────────────────────
    // Use startsWith to avoid false-positive matches inside complex property lines.
    if (
      trimmedLine.startsWith('NodeGuid=') ||
      trimmedLine.startsWith('MemberGuid=') ||
      trimmedLine.startsWith('MaterialExpressionGuid=') ||
      trimmedLine.startsWith('ExpressionGUID=') ||
      trimmedLine.startsWith('ParameterId=') ||
      trimmedLine.startsWith('Material="/Script/') ||
      trimmedLine.includes('bCanRenameNode=') ||
      trimmedLine.includes('bCommentBubbleVisible=') ||
      trimmedLine.startsWith('MaterialExpressionEditorX=') ||
      trimmedLine.startsWith('MaterialExpressionEditorY=')
    ) {
      continue;
    }

    // ── Begin Object Header Stripping ───────────────────────────────────────
    if (trimmedLine.startsWith('Begin Object')) {
      safeLines.push(line.replace(/\s+ExportPath="[^"]+"/, '').trimEnd());
      continue;
    }

    // ── Shorten absolute asset reference paths ──────────────────────────────
    if (trimmedLine.includes('MemberParent=') || trimmedLine.startsWith('Texture=')) {
      safeLines.push(line.replace(/"[^"]*\/([^/"]+)"/g, '"$1"').replace(/'[^']*\/([^/']+)'/g, "'$1'"));
      continue;
    }

    // ── Retain everything else verbatim ─────────────────────────────────────
    safeLines.push(line);
  }

  return safeLines.join('\n');
}
