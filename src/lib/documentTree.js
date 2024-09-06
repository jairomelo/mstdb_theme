export function generateDocumentTree(documento) {
  const archiveElements = ['archivo', 'fondo', 'subfondo', 'serie', 'subserie'];
  const treeElements = [];

  // Iterate over archive elements
  for (const element of archiveElements) {
    if (documento[element]) {
      treeElements.push({
        name: element === 'archivo' ? documento[element].nombre : documento[element],
        icon: element === 'archivo' ? 'bi-archive' : 'bi-folder2',
        children: []
      });
    }
  }

  // Add special elements
  const udcName = `${documento.tipo_udc || 'Unidad Documental'}${documento.unidad_documental_compuesta ? `. ${documento.unidad_documental_compuesta}` : ''}`;
  treeElements.push({
    name: udcName,
    icon: 'bi-folder2',
    children: []
  });

  if (documento.folio_inicial) {
    const folioName = documento.folio_inicial === documento.folio_final
      ? `Folio: ${documento.folio_inicial}`
      : `Folios: ${documento.folio_inicial} - ${documento.folio_final}`;
    treeElements.push({
      name: folioName,
      icon: 'bi-file-earmark-richtext',
      children: []
    });
  }

  // Create the tree structure
  for (let i = treeElements.length - 1; i > 0; i--) {
    treeElements[i - 1].children.push(treeElements[i]);
  }

  return [treeElements[0]];
}