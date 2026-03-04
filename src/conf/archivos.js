/**
 * Static archive metadata from the Trayectorias Afro project.
 * Each entry's `archivo_id` matches the DB primary key so the frontend
 * can merge live counts from /api/v2/archivos/.
 *
 * Source: "Archivos afro trayectorias-FINAL-2-26-26.pdf"
 * Compiled by Tatiana Seijas.
 */

export const archivos = [
  // ── Aguascalientes ───────────────────────────────────────────────
  {
    archivo_id: 3,
    nombre: 'Archivo Histórico del Estado de Aguascalientes "Alejandro Topete del Valle"',
    nombre_abreviado: 'AHEA',
    estado: 'Aguascalientes',
    direccion: 'Juan de Montoro 215, Zona Centro, CP 2000 Aguascalientes, Aguascalientes',
    participante: 'Luis Benedicto Juárez Luevano',
    descripcion:
      'El Archivo Histórico del Estado de Aguascalientes, creado por decreto en 1981 y establecido en 1986, resguarda y preserva un vasto acervo documental que constituye una de las fuentes más valiosas para el estudio de la historia regional. Entre sus fondos destaca el Fondo Documental Poder Ejecutivo, dentro del cual se encuentran los Protocolos Notariales, integrados por 326 cajas con 24,219 expedientes, 521 libros de protocolos y 302 libros de apéndices con minutas, que suman aproximadamente 53 metros lineales (de acuerdo con el catálogo de 2023), cuyo documento más antiguo data de 1598.\n\nEste fondo reúne la documentación producida por los escribanos de Aguascalientes a lo largo de distintos periodos históricos; sin embargo, para los fines de este proyecto interesa especialmente la correspondiente a la época virreinal. En este marco, se conservan registros generados tanto en la villa como en el real de minas, así como en haciendas, ranchos, estancias y labores de la jurisdicción. Para el periodo 1653-1816 se han identificado al menos 79 escribanos que fungieron como ministros de fe pública en la elaboración de instrumentos notariales tales como contratos de compraventa, cartas de manumisión, cartas de compra de libertad, permutas, contratos de aprendizaje de oficios, donaciones, empeños, préstamos, poderes especiales, reconocimientos de propiedad, testamentos y otros documentos afines, todos ellos vinculados con personas esclavizadas. En conjunto, este acervo constituye una fuente fundamental para el estudio de la esclavitud urbana, agropecuaria y minera en Aguascalientes, pues permite identificar información detallada sobre el nombre, edad, sexo, origen o procedencia, parentesco, categoría étnico-racial asignada, valor económico en las transacciones de compraventa, causas de manumisión –incluida la compra de la libertad– y las labores desempeñadas, entre otros aspectos.\n\nEn el presente proyecto, la mayoría de los datos procede de contratos de compraventa (1653-1816) y de cartas de manumisión y de compra de libertad (1656-1811).',
    catalogos: [
      '"Guía simple del Archivo Histórico del Estado de Aguascalientes." Gobierno del Estado de Aguascalientes.',
      '"Guía general del Archivo Histórico del Estado de Aguascalientes \'Alejandro Topete del Valle\'." Archivo Histórico del Estado de Aguascalientes.',
    ],
    informes: [],
    enlaces: [
      {
        label: 'Guía simple del AHEA',
        url: 'https://eservicios2.aguascalientes.gob.mx/SEGGOB/DOCSGG/GUIASIMPLEAHEA',
      },
      {
        label: 'Guía general del AHEA',
        url: 'https://eservicios2.aguascalientes.gob.mx/SEGGOB/DOCSGG/DGAR/GUIAGENERALAHEAENE2023.pdf',
      },
    ],
  },

  // ── Colima ───────────────────────────────────────────────────────
  {
    archivo_id: 9,
    nombre: 'Archivo Histórico del Municipio de Colima',
    nombre_abreviado: 'AHMC',
    estado: 'Colima',
    direccion: 'Calle Independencia 79, Centro, CP 28000 Colima, Colima',
    participante: 'María Irma López Razgado',
    descripcion:
      'Sus fondos documentales abarcan desde el año 1534 hasta la actualidad, lo que lo convierte en uno de los archivos más destacados del Occidente de México. Cuenta con un avance de catalogación cercano al 80 % en lo correspondiente a la época virreinal. Asimismo, los documentos del siglo XVI fueron paleografiados por el Dr. José Miguel Romero de Solís.',
    catalogos: [
      'Romero de Solís, José Miguel. Archivo de la Villa de Colima de la Nueva España, siglo XVI. 2 vols. Colima: Archivo Histórico del Municipio de Colima, 2005.',
      'Romero de Solís, José Miguel. Andariegos y pobladores: Nueva España y Nueva Galicia, siglo XVI. Zamora, Michoacán: El Colegio de Michoacán, Archivo Histórico del Municipio de Colima, Universidad de Colima, 2001.',
      'Rendón Garduño, Isolda. "Catálogo de fondo del siglo XVII del Archivo Histórico del Municipio de Colima." Tesis de Licenciatura en Etnohistoria, México, Escuela Nacional de Antropología e Historia, 2002.',
    ],
    informes: [
      'Alvarado Torres, Rosa María. Fondos del siglo XVIII, 1703-1713. Pretextos, textos, y contextos. Colima: Archivo Histórico del Municipio de Colima, 1996.',
      'Alvarado Torres, Rosa María. Fondos del siglo XVIII, 1714-1724. Pretextos, textos, y contextos. Colima: Archivo Histórico del Municipio de Colima, 1996.',
    ],
    enlaces: [
      {
        label: 'Archivo digital',
        url: 'https://casadelarchivo.colima.gob.mx/?archivodigital',
      },
    ],
  },
  {
    archivo_id: 6,
    nombre: 'Archivo Histórico del Estado de Colima',
    nombre_abreviado: 'AHEC',
    estado: 'Colima',
    direccion: 'J. Jesús Carranza S/N, Col. Colima Centro, CP 28000 Colima, Colima',
    participante: 'María Irma López Razgado',
    descripcion:
      'El Fondo Virreinal comprende el periodo de 1536 a 1867. En sus expedientes se resguardan protocolos y escrituras públicas correspondientes a Colima, el suroeste de Michoacán y parte del sur del Reino de la Nueva Galicia. Asimismo, integra documentación procedente de otras dos instituciones novohispanas: la Comandancia de la Segunda División de Milicias del Mar del Sur y la Aduana, con registros que abarcan de 1810 a 1824, así como la Administración de Alcabalas de Colima, cuyos documentos datan de 1816 a 1827.\n\nLos documentos del siglo XVII fueron paleografiados por el historiador Juan Carlos Reyes Garza, los documentos del siglo XVIII por María Irma López Razgado.',
    catalogos: [
      'López Razgado, María Irma. "Catálogos del Archivo Histórico del Estado de Colima (1700-1722)." Archivo Histórico del Estado de Colima, 2024.',
      'Reyes Garza, Juan Carlos. Catálogos del Archivo Histórico del Estado de Colima, editados en disco compacto y alusivos a los Libros de Protocolos, instrumentos públicos de Colima (1600-1628). Colima: Universidad de Colima, 2007.',
      'Silva Moreno, José Luis. Catálogo Fondo Virreinal del Archivo Histórico del Estado de Colima en disco compacto (1536-1867). Colima: ADABI, Archivo Histórico del Estado de Colima, 2010.',
    ],
    informes: [
      'Romero de Solís, José Miguel. Protocolos de escribanos de la Villa de Colima: siglo XVI. Pretextos, textos y contextos. Colima: Archivo Histórico del Municipio de Colima, Centro de Investigaciones Históricas Matías de la Mota Padilla, 1999.',
      'López Razgado, María Irma, and María del Carmen Ochoa Gutiérrez. Archivo Histórico Parroquial de San Felipe de Jesús, "El Beaterio". Libro de Bautismo, siglo XVII. Serie Historia eclesiástica. Colima: Gobierno del Estado de Colima, Sociedad Defensora del Tesoro Artístico de México, 2022.',
    ],
    enlaces: [],
  },

  // ── Jalisco ──────────────────────────────────────────────────────
  {
    archivo_id: 7,
    nombre: 'Archivo de Instrumentos Públicos del Estado de Jalisco',
    nombre_abreviado: 'AIPJ',
    estado: 'Jalisco',
    direccion: 'Avenida fray Antonio Alcalde 1855, Colonia Guadalupana, CP 44260 Guadalajara, Jalisco',
    participante: 'Jorge Delgadillo',
    descripcion:
      'El Archivo de Instrumentos Públicos del Estado de Jalisco se encuentra bajo resguardo en el Archivo General del Estado de Jalisco. Este repositorio preserva los libros de escribanos y notarios que trabajaron en Guadalajara y otros pueblos y ciudades del Estado de Jalisco entre los siglos XVI y XX. Cada libro contiene diferentes tipos de documentos realizados por un notario durante un periodo específico, tales como contratos de compraventa, testamentos, fundaciones de capellanías, cartas de libertad de personas esclavizadas, etc. La mayoría de los documentos utilizados para este proyecto son contratos de compraventa de personas esclavizadas realizadas en Guadalajara.\n\nNotarios consultados para el proyecto Trayectorias Afro: Andrés Venegas, 2 volúmenes (1606-1625); Francisco Guerrero, 1 volumen (1614-1619); Pedro Mancilla, 2 volúmenes (1620-1629); Juan Sedano, 9 volúmenes (1627-1638); Francisco de Orendáin, 7 volúmenes (1629-1638); Diego Pérez de Rivera, 13 volúmenes (1637-1666); Hernando Enríquez del Castillo, 4 volúmenes (1641-1655); Tomás de Orendáin, 4 volúmenes (1652-1674); Nicolás de Covarrubias, 1 volumen (1654-1658); Tomás de Ascoide, 4 volúmenes (1674-1693); José de Tapia Palacios, 2 volúmenes (1678-1735); Diego de Galarreta, 1 volumen (1681-1684); José López Ramírez, 6 volúmenes (1682-1689); José Antonio Calleja, 2 volúmenes (1685-1690); Pedro de Agundiz Zamora, 2 volúmenes (1692-1716); Nicolás del Castillo, 11 volúmenes (1693-1706); Diego de la Sierra y Dueñas, 7 volúmenes (1697-1718); Antonio Morelos, 11 volúmenes (1697-1739).',
    catalogos: [
      'Existe índice de los notarios y escribanos que trabajaron en Guadalajara que puede ser consultado directamente en el archivo.',
    ],
    informes: [
      'González Jaime, Mayra Susana. "El Archivo de Instrumentos Públicos del Estado de Jalisco: enlace entre el gobierno y la función notarial." En Espacios de la memoria. Archivos y bibliotecas de la zona metropolitana de Guadalajara, editado por Marina Mantilla Trolle. Guadalajara: Universidad de Guadalajara, 2021.',
    ],
    enlaces: [],
  },

  // ── México ───────────────────────────────────────────────────────
  {
    archivo_id: 10,
    nombre: 'Archivo General de Notarías de la Ciudad de México, Acervo Histórico',
    nombre_abreviado: 'AHN-CDMX',
    estado: 'México',
    direccion: 'Avenida Juárez 44, Colonia Centro, Alcaldía Cuauhtémoc, CP 06050 Ciudad de México',
    participante: 'Tatiana Seijas',
    descripcion:
      'El Archivo General de Notarías de la Ciudad de México, Acervo Histórico preserva documentación escrita por escribanos en la ciudad de México durante la época virreinal. Los escribanos seguían pautas estrictas sobre que se debía incluir en cada tipo de documentación que procesaban, ya fuese ventas, obligaciones de pago, testamentos, cartas de pago, arrendamientos, y demás. Los datos incluidos en este proyecto provienen primariamente de ventas. Aparte del lugar y fecha de la venta, este tipo de documentación solía incluir el nombre de la persona esclavizada, su edad, su estado matrimonial, su lugar de origen, su profesión, la categoría étnica o racial que le asignaban los esclavizadores, y una referencia a su salud. Al igual, las ventas incluían los nombres del dueño de esclavos y del comprador y el precio. El archivo comprende más de 5,000 volúmenes de documentos relacionados con más de 250 escribanos, y solo una fracción de esta colección ha sido catalogada.',
    catalogos: [
      'Arnold, Linda. "Archivo General de Notarías de la Ciudad de México."',
      'Catálogo de protocolos del Archivo General de Notarías de la ciudad de México. Edición en disco compacto. Vol. II: Juan Pérez de Rivera, escribano público (1582-1631), Juan Pérez de Rivera, escribano de provincia (1611-1617) y Juan Pérez de Rivera Cáceres, escribano público (1632-1651). México: UNAM, 2005.',
      'Catálogo de Protocolos del Archivo General de Notarías de la ciudad de México, Fondo Siglo XVI. En línea. Editado por Ivonne Mijares, Seminario de documentación e historia novohispana. México: UNAM, 2014.',
      'Catálogo de Protocolos del Archivo General de Notarías de la ciudad de México, Colección Siglo XVII. En línea. Editado por Ivonne Mijares, Seminario de documentación e historia novohispana. México: UNAM, 2016.',
      'Bravo Sandoval, Silvia, and Raquel Pineda Mendoza. Catálogos de documentos de arte, Archivo de Notarías de la ciudad de México: protocolos II. México: UNAM, 1996.',
      'Mijares, Ivonne. Catálogo de protocolos del Archivo General de Notarías de la ciudad de México: introducción. México: UNAM, 2002.',
      'Pineda Mendoza, Raquel y Edén Mario Zárate Sánchez, Catálogos de documentos de arte, Archivo de notarías de la ciudad de México: protocolos IV. México: UNAM, 2005.',
      'Pineda Mendoza, Raquel. Catálogos de documentos de arte, Archivo de Notarías de la ciudad de México: protocolos V. México: UNAM, 2015.',
      'Ramírez Montes, Guillermina. Catálogos de documentos de arte en el Archivo de Notarías de la ciudad de México. México: UNAM, 1990.',
      'Ramírez Montes, Guillermina, and Guillermino Luckie. Catálogos de documentos de arte, Archivo de Notarías de la ciudad de México: protocolos I. México: UNAM, 1993.',
      'Zárate Sánchez, Edén Mario. Catálogos de documentos de arte, Archivo de Notarías de la ciudad de México: protocolos III. México: UNAM, 2004.',
      'Zárate Sánchez, Edén Mario. Catálogos de documentos de arte, Archivo de Notarías de la ciudad de México: protocolos VI. México: UNAM, 2015.',
    ],
    informes: [
      'Anthony, Joshua. "Back to the Archives for the First Time: The Archivo General de Notarías de la CDMX." En Research Corner, editado por Gretchen Pierce: H-LatAm, 2022.',
      'Gonzalbo Aizpuru, Pilar. "El Archivo General de Notarías de la ciudad de México." Historia Mexicana 35, no. 4 (1986): 675–88.',
    ],
    enlaces: [
      {
        label: 'Catálogo Linda Arnold',
        url: 'https://filedn.com/l1Kspav0mhThFhPdeUNCHQb/Arnold_Arenet/AGNotarias%20SXVI-XIX/AHNot_index.html',
      },
      {
        label: 'Research Corner — H-LatAm',
        url: 'https://networks.h-net.org/node/23910/blog/research-corner/10350066/blog-back-archives-first-time-archivo-general-de',
      },
    ],
  },
  {
    archivo_id: 8,
    nombre: 'Archivo General de la Nación',
    nombre_abreviado: 'AGN',
    estado: 'México',
    direccion: 'Avenida Ing. Eduardo Molina 113, Penitenciaria, Venustiano Carranza, CP 15280 Ciudad de México',
    participante: 'Julieta Pineda',
    descripcion:
      'El Fondo Jesuitas (064) del Archivo General de la Nación de México resguarda manuscritos de y sobre la orden religiosa de la Compañía de Jesús durante el periodo colonial (1572-1767). Algunos de ellos son de carácter administrativo referente a sus colegios, haciendas, entre otras propiedades que poseyeron en su provincia novohispana. Dentro de esta materia podemos encontrar contratos de compra-venta, cartas poder de compra y venta, obligaciones de pago, cartas de pago, escrituras de donación y trueque de esclavizados y esclavizadas de origen africano.\n\nLa información que se proporciona en este proyecto proviene de dicha documentación elaborada cuando la Compañía de Jesús compró o vendió a hombres y mujeres esclavizadas y en ocasiones también datos sobre las transacciones anteriores a su compra por los jesuitas. El Fondo Jesuitas comprende 282 volúmenes de documentos los cuales a la actualidad no se encuentran digitalizados ni microfilmados.',
    catalogos: [
      'Arnold, Linda. "Catálogos e inventarios de los fondos y series del Archivo General de la Nación, México."',
    ],
    informes: [],
    enlaces: [
      {
        label: 'Información sobre el Fondo Jesuitas',
        url: 'https://archivos.gob.mx/GuiaGeneral/pdf/001/064-Jesuitas.pdf',
      },
      {
        label: 'Guía general de fondos AGN',
        url: 'https://guiageneral.agn.gob.mx/',
      },
      {
        label: 'Catálogos e inventarios — Linda Arnold',
        url: 'https://filedn.com/l1Kspav0mhThFhPdeUNCHQb/Arnold_Arenet/AGNoct2019/A_Index.htm',
      },
    ],
  },

  // ── Oaxaca ───────────────────────────────────────────────────────
  {
    archivo_id: 1,
    nombre: 'Archivo Histórico de Notarías Oaxaca',
    nombre_abreviado: 'AHNO',
    estado: 'Oaxaca',
    direccion: 'Calle Macedonio Alcalá s/n, Centro Cultural Santo Domingo, CP 68000 Oaxaca de Juárez, Oaxaca',
    participante: 'Sabrina Smith',
    descripcion:
      'El Archivo Histórico de Notarías Oaxaca preserva una abundancia de documentación escrita por docenas de escribanos en la ciudad de Antequera durante la época virreinal. La documentación que menciona afrodescendientes esclavizados y libres incluye cartas de compra-venta, cartas de libertad, testamentos, conciertos de aprendizaje, inventarios de bienes, poderes, donaciones, obligaciones de pago, codicilios y ventas de casa, entre otros documentos. Los datos incluidos en este proyecto provienen primariamente de cartas de compra-venta, cartas de libertad, y testamentos. Estos tipos de documentos generalmente incluían la fecha y lugar de la transacción y más detalles sobre personas esclavizadas, como el nombre, edad, género, lugar de origen, oficio, estado matrimonial y la categoría étnica o racial que les asignaban los esclavizadores. Las cartas de compra-venta de Oaxaca también mencionaban información sobre los esclavizadores, como sus nombres, estado matrimonial, oficio y estado de residencia o vecindad. Asimismo, estos documentos incluían detalles sobre las compras anteriores de una persona esclavizada, como la fecha, lugar, nombres del comprador y del vendedor, así como el escribano que certificó la transacción previa.\n\nLa documentación en el AHNO solo se puede consultar de manera presencial. El catálogo de escribanos y la base de datos del archivo también se pueden consultar en persona. Una gran parte del archivo ya ha sido digitalizada, pero los documentos solamente se pueden ver en forma digital en las computadoras del archivo.\n\nPara agendar una cita para consulta, los investigadores pueden enviar un correo electrónico a: AHNOAXACA@GMAIL.COM.',
    catalogos: [],
    informes: [
      'Córdova Aguilar, Maira Cristina. Población de origen africano en Oaxaca colonial (1680-1700). Oaxaca: Secretaría de las Culturas y Artes de Oaxaca, 2012.',
      'Sierra Silva, Pablo Miguel. Mexico, Slavery, Freedom: A Bilingual Documentary History, 1520-1829. Indianapolis: Hackett Publishing, 2024.',
      'Smith, Sabrina. "Slave Trading in Antequera and Interregional Slave Traffic in New Spain, 1680-1710." En From the Galleons to the Highlands: Slave Trade Routes in the Spanish Americas, editado por Alex Borucki, David Eltis and David Wheat, 147-167. Albuquerque: University of New Mexico Press, 2020.',
    ],
    enlaces: [
      {
        label: 'Guía del archivo (ADABI)',
        url: 'https://guiadearchivos.adabi.org.mx/items/show/3423',
      },
    ],
  },
  {
    archivo_id: 5,
    nombre: 'Archivo Histórico del Poder Judicial del Estado de Oaxaca',
    nombre_abreviado: 'AHPJEO',
    estado: 'Oaxaca',
    direccion: 'Los Pinos esquina Av. Canteras S/N, Agencia Municipal Santa María Ixcotel, CP 71244 Santa Lucía del Camino, Oaxaca',
    participante: 'Maira Cristina Córdova Aguilar',
    descripcion:
      'El Archivo Histórico está conformado por aproximadamente 950 metros lineales de documentación, organizados en 27 secciones documentales y más de 200,000 expedientes, con piezas que datan de 1545 a 1949. Se estima que su acervo asciende a 253,642 expedientes, de los cuales se han organizado, catalogado y/o inventariado 169,657 documentos. Los expedientes resguardados en este archivo proceden de los órganos jurisdiccionales establecidos durante la época virreinal, como alcaldías mayores y subdelegaciones, así como del periodo independiente. El acervo incluye la Colección de Manuscritos Coloniales, compuesta por 305 expedientes pertenecientes a las secciones de Teposcolula y Villa Alta, que contienen 900 textos escritos en lenguas mixteca, zapoteca, náhuatl y chocholteca, y abarcan un periodo comprendido entre 1551 y 1824. En 2018, esta colección fue declarada Memoria del Mundo de México por el Comité UNESCO-México.\n\nEl archivo estuvo ubicado en la calle Miguel Hidalgo núm. 1106, hasta que en diciembre de 2020 fue trasladado a las instalaciones del Archivo General del Estado de Oaxaca, donde actualmente se encuentra bajo resguardo.',
    catalogos: [
      'Ballesteros César, Claudia, ed. Los documentos de San Francisco Cajonos: Archivo Histórico Judicial de Oaxaca. 2 ed. Oaxaca: H. Tribunal Superior de Justicia del Estado de Oaxaca; Amigos del IAGO y del CFMAB, 2018.',
      'Terán Flores, Anel Josefina, and Israel Garrido Esquivel, eds. Catálogo de exposición: mapas, planos e ilustraciones, siglo XVI-XIX. Archivo Histórico Judicial de Oaxaca. Oaxaca: Dirección de Archivo, Bibliotecas y Boletín Judicial; H. Tribunal Superior de Justicia del Estado de Oaxaca, 2012.',
    ],
    informes: [
      'Córdova Aguilar, Maira Cristina. "El clero regular y secular de Oaxaca: Comercio, propiedad y manumisión de personas esclavizadas (1563–1827)." Anuario de Estudios Americanos 82, no. 2 (2025): 1162-1198.',
    ],
    enlaces: [
      {
        label: 'Catálogo de mapas y planos (PDF)',
        url: 'https://archivohistoricojudicialoaxaca.wordpress.com/wp-content/uploads/2014/05/catc3a1logo-ilustraciones.pdf',
      },
    ],
  },

  // ── Puebla ───────────────────────────────────────────────────────
  {
    archivo_id: 2,
    nombre: 'Archivo General de Notarías del Estado de Puebla',
    nombre_abreviado: 'AGNEP',
    estado: 'Puebla',
    direccion: 'Calle 20 Sur 902, Colonia Azcarate, CP 72501 Puebla, Puebla',
    participante: 'Pablo Miguel Sierra Silva',
    descripcion:
      'El Archivo General de Notarías del Estado de Puebla custodia los testamentos, poderes, cartas de libertad, obligaciones, compra-ventas y testamentos que pasaron ante notarios en la ciudad de Puebla y pueblos aledaños de mediados del siglo XVI hasta el XIX. Los protocolos de la ciudad están organizados en seis oficinas notariales, que a su vez se organizan por caja en orden cronológico. En total son cerca de 900 cajas de material histórico. La Notaría 4 conserva la serie de protocolos más completa de la ciudad, 298 cajas con instrumentos notariales del periodo 1562 a 1864. La Notaría 3 conserva los documentos más antiguos del archivo, comenzando con los protocolos del año 1537.\n\nPara la primera fase del proyecto de Trayectorias Afro se incorporó una muestra quinquenal de las cartas de compra-venta de la Notaría 3 de 1590 a 1640. Esta muestra únicamente representa el 20% de las ventas de personas esclavizadas en la Notaría 3. Sierra Silva (2024) incluye varias transcripciones de documentos del AGNEP – en lo referente a la vida cotidiana de afrodescendientes y asiáticos – en su colección de fuentes primarias.',
    catalogos: [
      'Boyd-Bowman, Peter. Índice y extractos del Archivo de Protocolos de Puebla de los Ángeles, México (1538-1556). Microfiche. Madison: Hispanic Seminary of Medieval Studies, 1988.',
      'Boyd-Bowman, Peter. "Negro Slaves in Colonial Mexico." The Americas 26, no. 2 (1969): 134–151.',
    ],
    informes: [
      'Lara Tenorio, Blanca. Esclavitud en Puebla y Tepeaca, 1545-1639. Cuadernos de los Centros Puebla-Tlaxcala. México: INAH, 1976.',
      'Lara Tenorio, Blanca y Carlos Paredes Martínez. "La población negra en los valles centrales de Puebla: Orígenes y desarrollo hasta 1681." En Presencia africana en México, 19–77. México: CONACULTA, 1994.',
      'Rodríguez Ortiz, Guillermo Alberto. "El lado afro de la Puebla de los Ángeles. Un acercamiento al estudio sobre la presencia africana, 1595–1710." Benemérita Universidad Autónoma de Puebla, 2015.',
      'Sierra Silva, Pablo Miguel. Urban Slavery in Colonial Mexico: Puebla de los Ángeles, 1531-1706. Cambridge: Cambridge University Press, 2018.',
      'Sierra Silva, Pablo Miguel. Mexico, Slavery, Freedom: A Bilingual Documentary History, 1520-1829. Indianapolis: Hackett Publishing, 2024.',
    ],
    enlaces: [],
  },

  // ── Veracruz ─────────────────────────────────────────────────────
  {
    archivo_id: 4,
    nombre: 'Archivo Notarial de Xalapa',
    nombre_abreviado: 'ANX',
    estado: 'Veracruz',
    direccion: 'Unidad de Servicios Bibliotecarios y de Información (USBI), Universidad Veracruzana, Xalapa, Avenida de las Culturas Veracruzanas no. 1, Zona Universitaria, CP 91090 Xalapa, Veracruz',
    participante: 'Alvaro Alcántara López, Lizbeth Martínez Martínez',
    descripcion:
      'El Archivo Notarial de Xalapa resguarda documentación generada por los escribanos y notarios de la villa y, más tarde, ciudad de Xalapa, desde finales del siglo XVI hasta el siglo XIX. Este acervo reúne protocolos notariales que registran actos jurídicos esenciales para la vida social, económica y administrativa de la región. Tales documentos incluyen testamentos, dotes, cartas de poder, registros de mercancías, transacciones de bienes raíces y ganados, capitulaciones matrimoniales, cartas de coartación (cuando la persona esclavizada pagaba al esclavista el valor establecido a su persona), contratos de compra-venta de personas esclavizadas, permutas o canjes, cartas de ahorro/manumisión o arrendamientos de personas esclavizadas. Los datos incluidos en este proyecto relativos a Xalapa provienen de documentación variada, que consignan información relevante para reconstruir las trayectorias de vida de personas esclavizadas, tales como su nombre, género, edad, lugares de procedencia, sitios de embarque o etnónimos, lo mismo que su ocupación u oficio. De igual manera se consignan detalles del estado de salud, características físicas, vínculos familiares o sociales, así como propiedades o actividades económicas de personas africanas y afrodescendientes.\n\nPara el ingreso de la información notarial de Xalapa a la Base de Datos ha sido de enorme utilidad y guía la obra compilada por Fernando Winfield Capitaine (1984). Vale la pena también destacar los muy útiles y completos resúmenes de la documentación notarial de este archivo, mismos que pueden consultarse en línea. De igual manera, ha resultado muy valiosa la colaboración directa de integrantes del equipo de investigación de la USBI Xalapa, en la paleografía de varios documentos de la época colonial. Sus nombres y el crédito correspondiente se consignan cuando se han utilizado datos provenientes de su trabajo paleográfico.\n\nA inicios de 2026, la Universidad Veracruzana lanzó una nueva versión de su página web, donde además de los ya mencionados resúmenes, pueden consultarse cientos de documentos notariales digitalizados, lo mismo de Xalapa, que de las vecinas ciudades veracruzanas de Córdoba y Orizaba.',
    catalogos: [
      'Blázquez Domínguez, Carmen, and Alfonsa Sequera Victoriano, eds. Catálogo e índices del Archivo Notarial de Xalapa: 1800-1820. Xalapa: Universidad Veracruzana; CIESAS-Golfo, 2013.',
      'Hernández, Fernando, and Gerardo Antonio Galindo Peláez, eds. Catálogo del Archivo Notarial de Xalapa: 1725-1749. Xalapa: Universidad Veracruzana, 2010.',
      'Marín Ávila, Aristeo, and Julieta Arcos Chigo, eds. Catálogo del Archivo notarial de Xalapa, 1775-1799. Xalapa: Universidad Veracruzana, 2010.',
      'Sequera Victoriano, Alfonsa, and Cruz Victoria Villegas Valencia, eds. Catálogo e índices del Archivo Notarial de Xalapa: siglo XVIII. Xalapa: Universidad Veracruzana, 2009.',
      'Sequera Victoriano, Alfonsa, and Adriana Naveda Chávez, eds. El Archivo notarial de Xalapa, fuentes para la historia regional (1700-1724). Xalapa: Universidad Veracruzana, 2010.',
      'Villegas Valencia, Cruz Victoria, Nohemí García Chimal, Aristeo Marín Ávila, and Aarón David Hernández Contreras, eds. Catálogo e índices del Archivo Notarial de Xalapa: 1821-1840. Xalapa: Universidad Veracruzana, 2019.',
      'Villegas Valencia, Cruz Victoria, Nohemí García Chimal, Aristeo Marín Ávila, and Aarón David Hernández Contreras, eds. Catálogo e índices del Archivo Notarial de Xalapa: 1841-1850. Xalapa: Universidad Veracruzana, 2024.',
      'Villegas Valencia, Cruz Victoria, and Adriana Naveda Chávez, eds. Catálogo de los archivos notariales de Xalapa, 1750-1774. Xalapa: Universidad Veracruzana, 2010.',
      'Winfield Capitaine, Fernando. Esclavos en el Archivo Notarial de Xalapa, Veracruz, 1668-1699. Xalapa: Universidad Veracruzana, Museo de Antropología, 1984.',
      'Winfield Capitaine, Fernando, ed. Esclavos en el Archivo Notarial de Xalapa, Veracruz, 1700-1800. Xalapa: Universidad Veracruzana; Museo de Antropología, 1984.',
      'Winfield Capitaine, Fernando, ed. Archivo Notarial de Xalapa: índice general 1700-1800, Colección pensamiento y palabra de Veracruz. Xalapa: Universidad Veracruzana; Gobierno del Estado de Veracruz, 1998.',
    ],
    informes: [
      'García Bustamante, Miguel. "El esclavo negro y el desarrollo económico de Veracruz durante el siglo XVII." UNAM, 1987.',
      'Naveda Chávez-Hita, Adriana. Esclavos negros en las haciendas azucareras de Córdoba, Veracruz, 1690-1830. Xalapa: Universidad Veracruzana, 1987.',
      'Proctor, Frank T., III. "Damned Notions of Liberty": Slavery, Culture, and Power in Colonial Mexico. Albuquerque: University of New Mexico, 2010.',
      'Terrazas Williams, Danielle. "Polonia de Ribas, mulata y dueña de esclavos: una historia alternativa, Xalapa, siglo XVII." Ulúa: Revista de historia, sociedad y cultura 19, no. 1 (2012): 41-60.',
      'Terrazas Williams, Danielle. The Capital of Free Women: Race, Legitimacy, and Liberty in Colonial Mexico. New Haven: Yale University Press, 2022.',
      'Winfield Capitaine, Fernando. Esclavos y libertos. Xalapa: Editora del Gobierno del Estado de Veracruz, 2009.',
    ],
    enlaces: [
      {
        label: 'Archivo Notarial de Xalapa — Universidad Veracruzana',
        url: 'https://fciuv.uv.mx/index.php/archivo-notarial-de-xalapa',
      },
    ],
  },
  {
    archivo_id: null,
    nombre: 'Archivos Notariales de Orizaba y Córdoba',
    nombre_abreviado: 'ANO / ANC',
    estado: 'Veracruz',
    direccion: 'Unidad de Servicios Bibliotecarios y de Información (USBI), Universidad Veracruzana, Xalapa, Avenida de las Culturas Veracruzanas no. 1, Zona Universitaria, CP 91090 Xalapa, Veracruz',
    participante: 'Alvaro Alcántara López, Lizbeth Martínez Martínez',
    descripcion:
      'El Archivo Notarial de Orizaba y el Archivo Notarial de Córdoba se encuentran bajo resguardo de la Universidad Veracruzana. El archivo de Orizaba contiene documentación de los siglos XVI al XIX, mientras que el de Córdoba contiene documentación de los siglos XVII al XX. Para el tipo de documentación contenida en estos acervos, véase la descripción de los documentos del Archivo Notarial de Xalapa.\n\nDichos fondos documentales pueden consultarse físicamente en la Unidad de Servicios Bibliotecarios de la Universidad Veracruzana (USBI) de la ciudad de Xalapa. De manera alternativa, los índices, resúmenes y una porción significativa de documentos digitalizados se encuentran en el nuevo portal lanzado por la Universidad Veracruzana a inicios de 2026.',
    catalogos: [
      'Reyes García, Cayetano. "Índice y extractos del Archivo Notarial de Orizaba." Historia Mexicana 16, no. 4 (1967): 588-602.',
      'Villegas Valencia, Cruz Victoria, Nohemí García Chimal, Aristeo Marín Ávila, and Aarón David Hernández Contreras, eds. Catálogo e índices del Archivo Notarial de Córdoba: siglo XVIII. Xalapa: Universidad Veracruzana, 2018.',
    ],
    informes: [],
    enlaces: [
      {
        label: 'Archivo Notarial de Córdoba — Universidad Veracruzana',
        url: 'https://fciuv.uv.mx/index.php/archivo-notarial-de-cordoba',
      },
      {
        label: 'Archivo Notarial de Orizaba — Universidad Veracruzana',
        url: 'https://fciuv.uv.mx/index.php/archivo-notarial-de-orizaba',
      },
      {
        label: 'Portal FCI — Universidad Veracruzana',
        url: 'https://fciuv.uv.mx',
      },
    ],
  },

  // ── Zacatecas ────────────────────────────────────────────────────
  {
    archivo_id: 11,
    nombre: 'Archivo Histórico del Estado de Zacatecas "Jesús Medrano Ávalos"',
    nombre_abreviado: 'AHEZ',
    estado: 'Zacatecas',
    direccion: 'Lomas del Calvario 105, Mexicapan, CP 98015 Zacatecas, Zacatecas',
    participante: 'Luis Benedicto Juárez Luevano',
    descripcion:
      'El Archivo Histórico del Estado de Zacatecas, que en la actualidad forma parte del Archivo General del Estado de Zacatecas, tiene su origen en 1991, tras haber pasado por distintos espacios de resguardo, como el Palacio de Gobierno, el Museo Virreinal de Guadalupe y el Congreso local, entre otros.\n\nEntre la vasta documentación resguardada y preservada en sus 23 fondos y colecciones, destaca el Fondo Notarías, dividido en 3 secciones, entre las cuales reviste especial interés la correspondiente al periodo colonial (1608-1820). En esta sección se han identificado 42 escribanos activos en la ciudad de Zacatecas durante el periodo virreinal novohispano; para el lapso 1608-1688 se han identificado 9 de ellos, quienes fungieron como ministros de fe pública en la elaboración de documentos tales como contratos de compraventa, cartas de manumisión, cartas de compra de libertad, contratos de aprendizaje de oficios, hipotecas, donaciones, testamentos y otros documentos afines, todos ellos vinculados con personas esclavizadas. Para este periodo colonial se contabilizan 494 piezas documentales, aunque el fondo no se encuentra completamente inventariado, por lo que aún queda trabajo archivístico por realizar. Este acervo constituye una fuente invaluable para el estudio de la esclavitud en la zona minera y su entorno, pues permite identificar datos como el nombre, edad, sexo, origen o procedencia, parentesco, categoría étnico-racial asignada, valor económico en las transacciones de compraventa, las distintas causas de manumisión –incluida la compra de la libertad– y las labores desempeñadas, entre otros aspectos.\n\nEn el presente proyecto, la mayoría de los datos procede de contratos de compraventa (1608-1688) y de cartas de manumisión y de compra de libertad (1650-1687).',
    catalogos: [
      '"Guía general del Archivo General del Estado de Zacatecas." Dirección del Archivo Histórico.',
      'Enciso Contreras, José, and Alicia Susana Palacios Alvarado, eds. Catálogo de los protocolos de Juan García Picón, escribano del siglo XVIII, en el Archivo Histórico del Estado de Zacatecas 1734-1755. 2 vols., Cuadernos de la Judicatura. Zacatecas: Tribunal Superior de Justicia del Estado de Zacatecas, 2003.',
      'Holcombe Isunza, Jaime, ed. Guía de protocolos de Felipe de Espinosa, escribano público y de Cabildo (1653-1680). Editado por Cristina Morales Miramontes. 2 vols. Zacatecas: Archivo del Estado de Zacatecas, 1998.',
    ],
    informes: [],
    enlaces: [
      {
        label: 'Guía general del acervo histórico',
        url: 'https://archivogeneral.zacatecas.gob.mx/wp-content/uploads/2021/10/Guia-general-del-acervo-historico.pdf',
      },
    ],
  },
];

/**
 * Unique states in document order, for grouping in the UI.
 */
export const estados = [...new Set(archivos.map(a => a.estado))];

/** Attribution line from the original PDF */
export const elaboracion = {
  text: 'Elaboración de Tatiana Seijas',
  url: 'https://history.rutgers.edu/people/faculty/details/1066-seijas-tatiana',
};
