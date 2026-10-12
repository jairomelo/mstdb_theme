/**
 * Static archive metadata from the Trayectorias Afro project.
 * Each entry's `archivo_id` matches the DB primary key so the frontend
 * can merge live counts from /api/v2/archivos/.
 *
 * Long-form prose (`descripcion`, `enlaces[].label`, `elaboracion.text`) ships
 * as `_es`/`_en` pairs: the Spanish field is the source of truth and the English
 * is resolved at render time via `pickLocale`/`localizeArchivo`. Proper data
 * (names, addresses, participants, `estado`, and bibliographic citations in
 * `catalogos`/`informes`) is never translated.
 *
 * Source: "Archivos afro trayectorias-FINAL-2-26-26.pdf"
 * Compiled by Tatiana Seijas.
 */

import { getLocale } from '$lib/paraglide/runtime.js';

/**
 * Pick a locale-specific string, falling back to Spanish when English is absent.
 * Pass `locale` explicitly from components (see Archivos page) so prose
 * re-renders after hydration, when it may differ from the prerendered baseLocale.
 */
export function pickLocale(es, en, locale = getLocale()) {
	return locale === 'en' && en ? en : es;
}

export const archivos = [
	// ── Aguascalientes ───────────────────────────────────────────────
	{
		archivo_id: 3,
		nombre: 'Archivo Histórico del Estado de Aguascalientes "Alejandro Topete del Valle"',
		nombre_abreviado: 'AHEA',
		estado: 'Aguascalientes',
		direccion: 'Juan de Montoro 215, Zona Centro, CP 2000 Aguascalientes, Aguascalientes',
		participante: 'Luis Benedicto Juárez Luevano',
		descripcion_es:
			'El Archivo Histórico del Estado de Aguascalientes, creado por decreto en 1981 y establecido en 1986, resguarda y preserva un vasto acervo documental que constituye una de las fuentes más valiosas para el estudio de la historia regional. Entre sus fondos destaca el Fondo Documental Poder Ejecutivo, dentro del cual se encuentran los Protocolos Notariales, integrados por 326 cajas con 24,219 expedientes, 521 libros de protocolos y 302 libros de apéndices con minutas, que suman aproximadamente 53 metros lineales (de acuerdo con el catálogo de 2023), cuyo documento más antiguo data de 1598.\n\nEste fondo reúne la documentación producida por los escribanos de Aguascalientes a lo largo de distintos periodos históricos; sin embargo, para los fines de este proyecto interesa especialmente la correspondiente a la época virreinal. En este marco, se conservan registros generados tanto en la villa como en el real de minas, así como en haciendas, ranchos, estancias y labores de la jurisdicción. Para el periodo 1653-1816 se han identificado al menos 79 escribanos que fungieron como ministros de fe pública en la elaboración de instrumentos notariales tales como contratos de compraventa, cartas de manumisión, cartas de compra de libertad, permutas, contratos de aprendizaje de oficios, donaciones, empeños, préstamos, poderes especiales, reconocimientos de propiedad, testamentos y otros documentos afines, todos ellos vinculados con personas esclavizadas. En conjunto, este acervo constituye una fuente fundamental para el estudio de la esclavitud urbana, agropecuaria y minera en Aguascalientes, pues permite identificar información detallada sobre el nombre, edad, sexo, origen o procedencia, parentesco, categoría étnico-racial asignada, valor económico en las transacciones de compraventa, causas de manumisión –incluida la compra de la libertad– y las labores desempeñadas, entre otros aspectos.\n\nEn el presente proyecto, la mayoría de los datos procede de contratos de compraventa (1653-1816) y de cartas de manumisión y de compra de libertad (1656-1811).',
		descripcion_en:
			'The Archivo Histórico del Estado de Aguascalientes, created by decree in 1981 and established in 1986, safeguards and preserves a vast documentary collection that constitutes one of the most valuable sources for the study of regional history. Among its holdings, the Fondo Documental Poder Ejecutivo stands out, containing the Notarial Protocols: 326 boxes with 24,219 files, 521 protocol books, and 302 books of appendices with minutes, totaling approximately 53 linear meters (according to the 2023 catalog), whose oldest document dates from 1598.\n\nThis collection brings together the documentation produced by the notaries of Aguascalientes across different historical periods; however, for the purposes of this project the material from the viceregal era is of particular interest. In this context, it preserves records generated both in the town and in the mining district, as well as on haciendas, ranches, estancias, and farmlands within the jurisdiction. For the period 1653–1816, at least 79 notaries have been identified who served as ministers of public faith in drawing up notarial instruments such as sales contracts, manumission letters, letters of purchase of freedom, exchanges, apprenticeship contracts, donations, pledges, loans, special powers of attorney, property acknowledgments, wills, and other related documents, all of them connected to enslaved people. Taken together, this collection constitutes a fundamental source for the study of urban, agricultural, and mining slavery in Aguascalientes, since it allows for the identification of detailed information on name, age, sex, origin or provenance, kinship, assigned ethnic-racial category, economic value in sale transactions, grounds for manumission—including the purchase of freedom—and the work performed, among other aspects.\n\nIn the present project, most of the data comes from sales contracts (1653–1816) and from manumission and purchase-of-freedom letters (1656–1811).',
		catalogos: [
			'"Guía simple del Archivo Histórico del Estado de Aguascalientes." Gobierno del Estado de Aguascalientes.',
			'"Guía general del Archivo Histórico del Estado de Aguascalientes \'Alejandro Topete del Valle\'." Archivo Histórico del Estado de Aguascalientes.'
		],
		informes: [],
		enlaces: [
			{
				label_es: 'Guía simple del AHEA',
				label_en: 'AHEA Simple Guide',
				url: 'https://eservicios2.aguascalientes.gob.mx/SEGGOB/DOCSGG/GUIASIMPLEAHEA'
			},
			{
				label_es: 'Guía general del AHEA',
				label_en: 'AHEA General Guide',
				url: 'https://eservicios2.aguascalientes.gob.mx/SEGGOB/DOCSGG/DGAR/GUIAGENERALAHEAENE2023.pdf'
			}
		]
	},

	// ── Colima ───────────────────────────────────────────────────────
	{
		archivo_id: 9,
		nombre: 'Archivo Histórico del Municipio de Colima',
		nombre_abreviado: 'AHMC',
		estado: 'Colima',
		direccion: 'Calle Independencia 79, Centro, CP 28000 Colima, Colima',
		participante: 'María Irma López Razgado',
		descripcion_es:
			'Sus fondos documentales abarcan desde el año 1534 hasta la actualidad, lo que lo convierte en uno de los archivos más destacados del Occidente de México. Cuenta con un avance de catalogación cercano al 80 % en lo correspondiente a la época virreinal. Asimismo, los documentos del siglo XVI fueron paleografiados por el Dr. José Miguel Romero de Solís.',
		descripcion_en:
			'Its documentary holdings span from 1534 to the present, making it one of the most notable archives in western Mexico. It reports a cataloging progress of close to 80% for the viceregal period. Likewise, the sixteenth-century documents were paleographed by Dr. José Miguel Romero de Solís.',
		catalogos: [
			'Romero de Solís, José Miguel. Archivo de la Villa de Colima de la Nueva España, siglo XVI. 2 vols. Colima: Archivo Histórico del Municipio de Colima, 2005.',
			'Romero de Solís, José Miguel. Andariegos y pobladores: Nueva España y Nueva Galicia, siglo XVI. Zamora, Michoacán: El Colegio de Michoacán, Archivo Histórico del Municipio de Colima, Universidad de Colima, 2001.',
			'Rendón Garduño, Isolda. "Catálogo de fondo del siglo XVII del Archivo Histórico del Municipio de Colima." Tesis de Licenciatura en Etnohistoria, México, Escuela Nacional de Antropología e Historia, 2002.'
		],
		informes: [
			'Alvarado Torres, Rosa María. Fondos del siglo XVIII, 1703-1713. Pretextos, textos, y contextos. Colima: Archivo Histórico del Municipio de Colima, 1996.',
			'Alvarado Torres, Rosa María. Fondos del siglo XVIII, 1714-1724. Pretextos, textos, y contextos. Colima: Archivo Histórico del Municipio de Colima, 1996.'
		],
		enlaces: [
			{
				label_es: 'Archivo digital',
				label_en: 'Digital archive',
				url: 'https://casadelarchivo.colima.gob.mx/?archivodigital'
			}
		]
	},
	{
		archivo_id: 6,
		nombre: 'Archivo Histórico del Estado de Colima',
		nombre_abreviado: 'AHEC',
		estado: 'Colima',
		direccion: 'J. Jesús Carranza S/N, Col. Colima Centro, CP 28000 Colima, Colima',
		participante: 'María Irma López Razgado',
		descripcion_es:
			'El Fondo Virreinal comprende el periodo de 1536 a 1867. En sus expedientes se resguardan protocolos y escrituras públicas correspondientes a Colima, el suroeste de Michoacán y parte del sur del Reino de la Nueva Galicia. Asimismo, integra documentación procedente de otras dos instituciones novohispanas: la Comandancia de la Segunda División de Milicias del Mar del Sur y la Aduana, con registros que abarcan de 1810 a 1824, así como la Administración de Alcabalas de Colima, cuyos documentos datan de 1816 a 1827.\n\nLos documentos del siglo XVII fueron paleografiados por el historiador Juan Carlos Reyes Garza, los documentos del siglo XVIII por María Irma López Razgado.',
		descripcion_en:
			'The Fondo Virreinal covers the period from 1536 to 1867. Its files safeguard protocols and public deeds corresponding to Colima, southwestern Michoacán, and part of the south of the Kingdom of New Galicia. It also integrates documentation from two other Novo-Hispanic institutions: the Commandancy of the Second Division of Militias of the South Sea and the Customs House, with records spanning 1810 to 1824, as well as the Alcabala Administration of Colima, whose documents date from 1816 to 1827.\n\nThe seventeenth-century documents were paleographed by the historian Juan Carlos Reyes Garza, and the eighteenth-century documents by María Irma López Razgado.',
		catalogos: [
			'López Razgado, María Irma. "Catálogos del Archivo Histórico del Estado de Colima (1700-1722)." Archivo Histórico del Estado de Colima, 2024.',
			'Reyes Garza, Juan Carlos. Catálogos del Archivo Histórico del Estado de Colima, editados en disco compacto y alusivos a los Libros de Protocolos, instrumentos públicos de Colima (1600-1628). Colima: Universidad de Colima, 2007.',
			'Silva Moreno, José Luis. Catálogo Fondo Virreinal del Archivo Histórico del Estado de Colima en disco compacto (1536-1867). Colima: ADABI, Archivo Histórico del Estado de Colima, 2010.'
		],
		informes: [
			'Romero de Solís, José Miguel. Protocolos de escribanos de la Villa de Colima: siglo XVI. Pretextos, textos y contextos. Colima: Archivo Histórico del Municipio de Colima, Centro de Investigaciones Históricas Matías de la Mota Padilla, 1999.',
			'López Razgado, María Irma, and María del Carmen Ochoa Gutiérrez. Archivo Histórico Parroquial de San Felipe de Jesús, "El Beaterio". Libro de Bautismo, siglo XVII. Serie Historia eclesiástica. Colima: Gobierno del Estado de Colima, Sociedad Defensora del Tesoro Artístico de México, 2022.'
		],
		enlaces: []
	},

	// ── Jalisco ──────────────────────────────────────────────────────
	{
		archivo_id: 7,
		nombre: 'Archivo de Instrumentos Públicos del Estado de Jalisco',
		nombre_abreviado: 'AIPJ',
		estado: 'Jalisco',
		direccion:
			'Avenida fray Antonio Alcalde 1855, Colonia Guadalupana, CP 44260 Guadalajara, Jalisco',
		participante: 'Jorge Delgadillo',
		descripcion_es:
			'El Archivo de Instrumentos Públicos del Estado de Jalisco se encuentra bajo resguardo en el Archivo General del Estado de Jalisco. Este repositorio preserva los libros de escribanos y notarios que trabajaron en Guadalajara y otros pueblos y ciudades del Estado de Jalisco entre los siglos XVI y XX. Cada libro contiene diferentes tipos de documentos realizados por un notario durante un periodo específico, tales como contratos de compraventa, testamentos, fundaciones de capellanías, cartas de libertad de personas esclavizadas, etc. La mayoría de los documentos utilizados para este proyecto son contratos de compraventa de personas esclavizadas realizadas en Guadalajara.\n\nNotarios consultados para el proyecto Trayectorias Afro: Andrés Venegas, 2 volúmenes (1606-1625); Francisco Guerrero, 1 volumen (1614-1619); Pedro Mancilla, 2 volúmenes (1620-1629); Juan Sedano, 9 volúmenes (1627-1638); Francisco de Orendáin, 7 volúmenes (1629-1638); Diego Pérez de Rivera, 13 volúmenes (1637-1666); Hernando Enríquez del Castillo, 4 volúmenes (1641-1655); Tomás de Orendáin, 4 volúmenes (1652-1674); Nicolás de Covarrubias, 1 volumen (1654-1658); Tomás de Ascoide, 4 volúmenes (1674-1693); José de Tapia Palacios, 2 volúmenes (1678-1735); Diego de Galarreta, 1 volumen (1681-1684); José López Ramírez, 6 volúmenes (1682-1689); José Antonio Calleja, 2 volúmenes (1685-1690); Pedro de Agundiz Zamora, 2 volúmenes (1692-1716); Nicolás del Castillo, 11 volúmenes (1693-1706); Diego de la Sierra y Dueñas, 7 volúmenes (1697-1718); Antonio Morelos, 11 volúmenes (1697-1739).',
		descripcion_en:
			'The Archivo de Instrumentos Públicos del Estado de Jalisco is held in custody at the Archivo General del Estado de Jalisco. This repository preserves the books of scribes and notaries who worked in Guadalajara and other towns and cities of the State of Jalisco between the sixteenth and twentieth centuries. Each book contains different types of documents drawn up by a notary during a specific period, such as sales contracts, wills, foundations of chaplaincies, freedom letters for enslaved people, and so on. Most of the documents used for this project are sales contracts for enslaved people made in Guadalajara.\n\nNotaries consulted for the Trayectorias Afro project: Andrés Venegas, 2 volumes (1606–1625); Francisco Guerrero, 1 volume (1614–1619); Pedro Mancilla, 2 volumes (1620–1629); Juan Sedano, 9 volumes (1627–1638); Francisco de Orendáin, 7 volumes (1629–1638); Diego Pérez de Rivera, 13 volumes (1637–1666); Hernando Enríquez del Castillo, 4 volumes (1641–1655); Tomás de Orendáin, 4 volumes (1652–1674); Nicolás de Covarrubias, 1 volume (1654–1658); Tomás de Ascoide, 4 volumes (1674–1693); José de Tapia Palacios, 2 volumes (1678–1735); Diego de Galarreta, 1 volume (1681–1684); José López Ramírez, 6 volumes (1682–1689); José Antonio Calleja, 2 volumes (1685–1690); Pedro de Agundiz Zamora, 2 volumes (1692–1716); Nicolás del Castillo, 11 volumes (1693–1706); Diego de la Sierra y Dueñas, 7 volumes (1697–1718); Antonio Morelos, 11 volumes (1697–1739).',
		catalogos: [
			'Existe índice de los notarios y escribanos que trabajaron en Guadalajara que puede ser consultado directamente en el archivo.'
		],
		informes: [
			'González Jaime, Mayra Susana. "El Archivo de Instrumentos Públicos del Estado de Jalisco: enlace entre el gobierno y la función notarial." En Espacios de la memoria. Archivos y bibliotecas de la zona metropolitana de Guadalajara, editado por Marina Mantilla Trolle. Guadalajara: Universidad de Guadalajara, 2021.'
		],
		enlaces: []
	},

	// ── México ───────────────────────────────────────────────────────
	{
		archivo_id: 10,
		nombre: 'Archivo General de Notarías de la Ciudad de México, Acervo Histórico',
		nombre_abreviado: 'AHN-CDMX',
		estado: 'México',
		direccion: 'Avenida Juárez 44, Colonia Centro, Alcaldía Cuauhtémoc, CP 06050 Ciudad de México',
		participante: 'Tatiana Seijas',
		descripcion_es:
			'El Archivo General de Notarías de la Ciudad de México, Acervo Histórico preserva documentación escrita por escribanos en la ciudad de México durante la época virreinal. Los escribanos seguían pautas estrictas sobre que se debía incluir en cada tipo de documentación que procesaban, ya fuese ventas, obligaciones de pago, testamentos, cartas de pago, arrendamientos, y demás. Los datos incluidos en este proyecto provienen primariamente de ventas. Aparte del lugar y fecha de la venta, este tipo de documentación solía incluir el nombre de la persona esclavizada, su edad, su estado matrimonial, su lugar de origen, su profesión, la categoría étnica o racial que le asignaban los esclavizadores, y una referencia a su salud. Al igual, las ventas incluían los nombres del dueño de esclavos y del comprador y el precio. El archivo comprende más de 5,000 volúmenes de documentos relacionados con más de 250 escribanos, y solo una fracción de esta colección ha sido catalogada.',
		descripcion_en:
			'The Archivo General de Notarías de la Ciudad de México, Acervo Histórico preserves documentation written by notaries in Mexico City during the viceregal era. Notaries followed strict guidelines on what had to be included in each type of documentation they processed, whether sales, payment obligations, wills, payment letters, leases, and others. The data included in this project come primarily from sales. Apart from the place and date of the sale, this type of documentation usually included the name of the enslaved person, their age, marital status, place of origin, profession, the ethnic or racial category assigned to them by the enslavers, and a reference to their health. Likewise, the sales included the names of the slave owner and the buyer and the price. The archive comprises more than 5,000 volumes of documents related to more than 250 notaries, and only a fraction of this collection has been cataloged.',
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
			'Zárate Sánchez, Edén Mario. Catálogos de documentos de arte, Archivo de Notarías de la ciudad de México: protocolos VI. México: UNAM, 2015.'
		],
		informes: [
			'Anthony, Joshua. "Back to the Archives for the First Time: The Archivo General de Notarías de la CDMX." En Research Corner, editado por Gretchen Pierce: H-LatAm, 2022.',
			'Gonzalbo Aizpuru, Pilar. "El Archivo General de Notarías de la ciudad de México." Historia Mexicana 35, no. 4 (1986): 675–88.'
		],
		enlaces: [
			{
				label_es: 'Catálogo Linda Arnold',
				label_en: 'Linda Arnold Catalog',
				url: 'https://filedn.com/l1Kspav0mhThFhPdeUNCHQb/Arnold_Arenet/AGNotarias%20SXVI-XIX/AHNot_index.html'
			},
			{
				label_es: 'Research Corner — H-LatAm',
				label_en: 'Research Corner — H-LatAm',
				url: 'https://networks.h-net.org/node/23910/blog/research-corner/10350066/blog-back-archives-first-time-archivo-general-de'
			}
		]
	},
	{
		archivo_id: 8,
		nombre: 'Archivo General de la Nación',
		nombre_abreviado: 'AGN',
		estado: 'México',
		direccion:
			'Avenida Ing. Eduardo Molina 113, Penitenciaria, Venustiano Carranza, CP 15280 Ciudad de México',
		participante: 'Julieta Pineda',
		descripcion_es:
			'El Fondo Jesuitas (064) del Archivo General de la Nación de México resguarda manuscritos de y sobre la orden religiosa de la Compañía de Jesús durante el periodo colonial (1572-1767). Algunos de ellos son de carácter administrativo referente a sus colegios, haciendas, entre otras propiedades que poseyeron en su provincia novohispana. Dentro de esta materia podemos encontrar contratos de compra-venta, cartas poder de compra y venta, obligaciones de pago, cartas de pago, escrituras de donación y trueque de esclavizados y esclavizadas de origen africano.\n\nLa información que se proporciona en este proyecto proviene de dicha documentación elaborada cuando la Compañía de Jesús compró o vendió a hombres y mujeres esclavizadas y en ocasiones también datos sobre las transacciones anteriores a su compra por los jesuitas. El Fondo Jesuitas comprende 282 volúmenes de documentos los cuales a la actualidad no se encuentran digitalizados ni microfilmados.',
		descripcion_en:
			'The Fondo Jesuitas (064) of the Archivo General de la Nación de México preserves manuscripts by and about the religious order of the Society of Jesus during the colonial period (1572–1767). Some of them are administrative in nature, concerning their colleges, haciendas, and other properties they owned in their Novo-Hispanic province. Within this material we can find sales contracts, powers of attorney for purchase and sale, payment obligations, payment letters, deeds of donation, and barter of enslaved men and women of African origin.\n\nThe information provided in this project comes from such documentation drawn up when the Society of Jesus bought or sold enslaved men and women, and sometimes also data on transactions prior to their purchase by the Jesuits. The Fondo Jesuitas comprises 282 volumes of documents, which to date have not been digitized or microfilmed.',
		catalogos: [
			'Arnold, Linda. "Catálogos e inventarios de los fondos y series del Archivo General de la Nación, México."'
		],
		informes: [],
		enlaces: [
			{
				label_es: 'Información sobre el Fondo Jesuitas',
				label_en: 'Information about the Fondo Jesuitas',
				url: 'https://archivos.gob.mx/GuiaGeneral/pdf/001/064-Jesuitas.pdf'
			},
			{
				label_es: 'Guía general de fondos AGN',
				label_en: 'AGN General Holdings Guide',
				url: 'https://guiageneral.agn.gob.mx/'
			},
			{
				label_es: 'Catálogos e inventarios — Linda Arnold',
				label_en: 'Catalogs and Inventories — Linda Arnold',
				url: 'https://filedn.com/l1Kspav0mhThFhPdeUNCHQb/Arnold_Arenet/AGNoct2019/A_Index.htm'
			}
		]
	},

	// ── Oaxaca ───────────────────────────────────────────────────────
	{
		archivo_id: 1,
		nombre: 'Archivo Histórico de Notarías Oaxaca',
		nombre_abreviado: 'AHNO',
		estado: 'Oaxaca',
		direccion:
			'Calle Macedonio Alcalá s/n, Centro Cultural Santo Domingo, CP 68000 Oaxaca de Juárez, Oaxaca',
		participante: 'Sabrina Smith',
		descripcion_es:
			'El Archivo Histórico de Notarías Oaxaca preserva una abundancia de documentación escrita por docenas de escribanos en la ciudad de Antequera durante la época virreinal. La documentación que menciona afrodescendientes esclavizados y libres incluye cartas de compra-venta, cartas de libertad, testamentos, conciertos de aprendizaje, inventarios de bienes, poderes, donaciones, obligaciones de pago, codicilios y ventas de casa, entre otros documentos. Los datos incluidos en este proyecto provienen primariamente de cartas de compra-venta, cartas de libertad, y testamentos. Estos tipos de documentos generalmente incluían la fecha y lugar de la transacción y más detalles sobre personas esclavizadas, como el nombre, edad, género, lugar de origen, oficio, estado matrimonial y la categoría étnica o racial que les asignaban los esclavizadores. Las cartas de compra-venta de Oaxaca también mencionaban información sobre los esclavizadores, como sus nombres, estado matrimonial, oficio y estado de residencia o vecindad. Asimismo, estos documentos incluían detalles sobre las compras anteriores de una persona esclavizada, como la fecha, lugar, nombres del comprador y del vendedor, así como el escribano que certificó la transacción previa.\n\nLa documentación en el AHNO solo se puede consultar de manera presencial. El catálogo de escribanos y la base de datos del archivo también se pueden consultar en persona. Una gran parte del archivo ya ha sido digitalizada, pero los documentos solamente se pueden ver en forma digital en las computadoras del archivo.\n\nPara agendar una cita para consulta, los investigadores pueden enviar un correo electrónico a: AHNOAXACA@GMAIL.COM.',
		descripcion_en:
			"The Archivo Histórico de Notarías Oaxaca preserves an abundance of documentation written by dozens of notaries in the city of Antequera during the viceregal era. The documentation that mentions enslaved and free Afro-descendants includes sales letters, freedom letters, wills, apprenticeship agreements, inventories of goods, powers of attorney, donations, payment obligations, codicils, and house sales, among other documents. The data included in this project come primarily from sales letters, freedom letters, and wills. These types of documents generally included the date and place of the transaction and more details about enslaved people, such as name, age, gender, place of origin, trade, marital status, and the ethnic or racial category assigned to them by the enslavers. The sales letters from Oaxaca also mentioned information about the enslavers, such as their names, marital status, trade, and state of residence or neighbor status. Likewise, these documents included details about the previous purchases of an enslaved person, such as the date, place, names of the buyer and the seller, as well as the notary who certified the prior transaction.\n\nThe documentation in the AHNO can only be consulted in person. The catalog of notaries and the archive's database can also be consulted in person. A large part of the archive has already been digitized, but the documents can only be viewed digitally on the archive's computers.\n\nTo schedule an appointment for consultation, researchers can send an email to: AHNOAXACA@GMAIL.COM.",
		catalogos: [],
		informes: [
			'Córdova Aguilar, Maira Cristina. Población de origen africano en Oaxaca colonial (1680-1700). Oaxaca: Secretaría de las Culturas y Artes de Oaxaca, 2012.',
			'Sierra Silva, Pablo Miguel. Mexico, Slavery, Freedom: A Bilingual Documentary History, 1520-1829. Indianapolis: Hackett Publishing, 2024.',
			'Smith, Sabrina. "Slave Trading in Antequera and Interregional Slave Traffic in New Spain, 1680-1710." En From the Galleons to the Highlands: Slave Trade Routes in the Spanish Americas, editado por Alex Borucki, David Eltis and David Wheat, 147-167. Albuquerque: University of New Mexico Press, 2020.'
		],
		enlaces: [
			{
				label_es: 'Guía del archivo (ADABI)',
				label_en: 'Archive Guide (ADABI)',
				url: 'https://guiadearchivos.adabi.org.mx/items/show/3423'
			}
		]
	},
	{
		archivo_id: 5,
		nombre: 'Archivo Histórico del Poder Judicial del Estado de Oaxaca',
		nombre_abreviado: 'AHPJEO',
		estado: 'Oaxaca',
		direccion:
			'Los Pinos esquina Av. Canteras S/N, Agencia Municipal Santa María Ixcotel, CP 71244 Santa Lucía del Camino, Oaxaca',
		participante: 'Maira Cristina Córdova Aguilar',
		descripcion_es:
			'El Archivo Histórico está conformado por aproximadamente 950 metros lineales de documentación, organizados en 27 secciones documentales y más de 200,000 expedientes, con piezas que datan de 1545 a 1949. Se estima que su acervo asciende a 253,642 expedientes, de los cuales se han organizado, catalogado y/o inventariado 169,657 documentos. Los expedientes resguardados en este archivo proceden de los órganos jurisdiccionales establecidos durante la época virreinal, como alcaldías mayores y subdelegaciones, así como del periodo independiente. El acervo incluye la Colección de Manuscritos Coloniales, compuesta por 305 expedientes pertenecientes a las secciones de Teposcolula y Villa Alta, que contienen 900 textos escritos en lenguas mixteca, zapoteca, náhuatl y chocholteca, y abarcan un periodo comprendido entre 1551 y 1824. En 2018, esta colección fue declarada Memoria del Mundo de México por el Comité UNESCO-México.\n\nEl archivo estuvo ubicado en la calle Miguel Hidalgo núm. 1106, hasta que en diciembre de 2020 fue trasladado a las instalaciones del Archivo General del Estado de Oaxaca, donde actualmente se encuentra bajo resguardo.',
		descripcion_en:
			'The Archivo Histórico is made up of approximately 950 linear meters of documentation, organized into 27 documentary sections and more than 200,000 files, with items dating from 1545 to 1949. Its holdings are estimated at 253,642 files, of which 169,657 documents have been organized, cataloged, and/or inventoried. The files safeguarded in this archive come from the jurisdictional bodies established during the viceregal era, such as major mayoralties and subdelegations, as well as from the independent period. The holdings include the Colección de Manuscritos Coloniales, made up of 305 files belonging to the Teposcolula and Villa Alta sections, which contain 900 texts written in the Mixtec, Zapotec, Nahuatl, and Chocholtec languages, and span a period between 1551 and 1824. In 2018, this collection was declared Memory of the World of Mexico by the UNESCO-Mexico Committee.\n\nThe archive was located at Calle Miguel Hidalgo no. 1106 until December 2020, when it was moved to the facilities of the Archivo General del Estado de Oaxaca, where it is currently held in custody.',
		catalogos: [
			'Ballesteros César, Claudia, ed. Los documentos de San Francisco Cajonos: Archivo Histórico Judicial de Oaxaca. 2 ed. Oaxaca: H. Tribunal Superior de Justicia del Estado de Oaxaca; Amigos del IAGO y del CFMAB, 2018.',
			'Terán Flores, Anel Josefina, and Israel Garrido Esquivel, eds. Catálogo de exposición: mapas, planos e ilustraciones, siglo XVI-XIX. Archivo Histórico Judicial de Oaxaca. Oaxaca: Dirección de Archivo, Bibliotecas y Boletín Judicial; H. Tribunal Superior de Justicia del Estado de Oaxaca, 2012.'
		],
		informes: [
			'Córdova Aguilar, Maira Cristina. "El clero regular y secular de Oaxaca: Comercio, propiedad y manumisión de personas esclavizadas (1563–1827)." Anuario de Estudios Americanos 82, no. 2 (2025): 1162-1198.'
		],
		enlaces: [
			{
				label_es: 'Catálogo de mapas y planos (PDF)',
				label_en: 'Catalog of Maps and Plans (PDF)',
				url: 'https://archivohistoricojudicialoaxaca.wordpress.com/wp-content/uploads/2014/05/catc3a1logo-ilustraciones.pdf'
			}
		]
	},

	// ── Puebla ───────────────────────────────────────────────────────
	{
		archivo_id: 2,
		nombre: 'Archivo General de Notarías del Estado de Puebla',
		nombre_abreviado: 'AGNEP',
		estado: 'Puebla',
		direccion: 'Calle 20 Sur 902, Colonia Azcarate, CP 72501 Puebla, Puebla',
		participante: 'Pablo Miguel Sierra Silva',
		descripcion_es:
			'El Archivo General de Notarías del Estado de Puebla custodia los testamentos, poderes, cartas de libertad, obligaciones, compra-ventas y testamentos que pasaron ante notarios en la ciudad de Puebla y pueblos aledaños de mediados del siglo XVI hasta el XIX. Los protocolos de la ciudad están organizados en seis oficinas notariales, que a su vez se organizan por caja en orden cronológico. En total son cerca de 900 cajas de material histórico. La Notaría 4 conserva la serie de protocolos más completa de la ciudad, 298 cajas con instrumentos notariales del periodo 1562 a 1864. La Notaría 3 conserva los documentos más antiguos del archivo, comenzando con los protocolos del año 1537.\n\nPara la primera fase del proyecto de Trayectorias Afro se incorporó una muestra quinquenal de las cartas de compra-venta de la Notaría 3 de 1590 a 1640. Esta muestra únicamente representa el 20% de las ventas de personas esclavizadas en la Notaría 3. Sierra Silva (2024) incluye varias transcripciones de documentos del AGNEP – en lo referente a la vida cotidiana de afrodescendientes y asiáticos – en su colección de fuentes primarias.',
		descripcion_en:
			"The Archivo General de Notarías del Estado de Puebla safeguards the wills, powers of attorney, freedom letters, obligations, sales, and wills that passed before notaries in the city of Puebla and neighboring towns from the mid-sixteenth to the nineteenth century. The city's protocols are organized into six notarial offices, which are in turn organized by box in chronological order. In total there are about 900 boxes of historical material. Notaría 4 preserves the most complete series of protocols in the city, 298 boxes with notarial instruments from the period 1562 to 1864. Notaría 3 preserves the oldest documents in the archive, beginning with the protocols of 1537.\n\nFor the first phase of the Trayectorias Afro project, a five-year sample of sales letters from Notaría 3 from 1590 to 1640 was incorporated. This sample represents only 20% of the sales of enslaved people in Notaría 3. Sierra Silva (2024) includes several transcriptions of AGNEP documents—concerning the daily life of Afro-descendants and Asians—in his collection of primary sources.",
		catalogos: [
			'Boyd-Bowman, Peter. Índice y extractos del Archivo de Protocolos de Puebla de los Ángeles, México (1538-1556). Microfiche. Madison: Hispanic Seminary of Medieval Studies, 1988.',
			'Boyd-Bowman, Peter. "Negro Slaves in Colonial Mexico." The Americas 26, no. 2 (1969): 134–151.'
		],
		informes: [
			'Lara Tenorio, Blanca. Esclavitud en Puebla y Tepeaca, 1545-1639. Cuadernos de los Centros Puebla-Tlaxcala. México: INAH, 1976.',
			'Lara Tenorio, Blanca y Carlos Paredes Martínez. "La población negra en los valles centrales de Puebla: Orígenes y desarrollo hasta 1681." En Presencia africana en México, 19–77. México: CONACULTA, 1994.',
			'Rodríguez Ortiz, Guillermo Alberto. "El lado afro de la Puebla de los Ángeles. Un acercamiento al estudio sobre la presencia africana, 1595–1710." Benemérita Universidad Autónoma de Puebla, 2015.',
			'Sierra Silva, Pablo Miguel. Urban Slavery in Colonial Mexico: Puebla de los Ángeles, 1531-1706. Cambridge: Cambridge University Press, 2018.',
			'Sierra Silva, Pablo Miguel. Mexico, Slavery, Freedom: A Bilingual Documentary History, 1520-1829. Indianapolis: Hackett Publishing, 2024.'
		],
		enlaces: []
	},

	// ── Veracruz ─────────────────────────────────────────────────────
	{
		archivo_id: 4,
		nombre: 'Archivo Notarial de Xalapa',
		nombre_abreviado: 'ANX',
		estado: 'Veracruz',
		direccion:
			'Unidad de Servicios Bibliotecarios y de Información (USBI), Universidad Veracruzana, Xalapa, Avenida de las Culturas Veracruzanas no. 1, Zona Universitaria, CP 91090 Xalapa, Veracruz',
		participante: 'Alvaro Alcántara López, Lizbeth Martínez Martínez',
		descripcion_es:
			'El Archivo Notarial de Xalapa resguarda documentación generada por los escribanos y notarios de la villa y, más tarde, ciudad de Xalapa, desde finales del siglo XVI hasta el siglo XIX. Este acervo reúne protocolos notariales que registran actos jurídicos esenciales para la vida social, económica y administrativa de la región. Tales documentos incluyen testamentos, dotes, cartas de poder, registros de mercancías, transacciones de bienes raíces y ganados, capitulaciones matrimoniales, cartas de coartación (cuando la persona esclavizada pagaba al esclavista el valor establecido a su persona), contratos de compra-venta de personas esclavizadas, permutas o canjes, cartas de ahorro/manumisión o arrendamientos de personas esclavizadas. Los datos incluidos en este proyecto relativos a Xalapa provienen de documentación variada, que consignan información relevante para reconstruir las trayectorias de vida de personas esclavizadas, tales como su nombre, género, edad, lugares de procedencia, sitios de embarque o etnónimos, lo mismo que su ocupación u oficio. De igual manera se consignan detalles del estado de salud, características físicas, vínculos familiares o sociales, así como propiedades o actividades económicas de personas africanas y afrodescendientes.\n\nPara el ingreso de la información notarial de Xalapa a la Base de Datos ha sido de enorme utilidad y guía la obra compilada por Fernando Winfield Capitaine (1984). Vale la pena también destacar los muy útiles y completos resúmenes de la documentación notarial de este archivo, mismos que pueden consultarse en línea. De igual manera, ha resultado muy valiosa la colaboración directa de integrantes del equipo de investigación de la USBI Xalapa, en la paleografía de varios documentos de la época colonial. Sus nombres y el crédito correspondiente se consignan cuando se han utilizado datos provenientes de su trabajo paleográfico.\n\nA inicios de 2026, la Universidad Veracruzana lanzó una nueva versión de su página web, donde además de los ya mencionados resúmenes, pueden consultarse cientos de documentos notariales digitalizados, lo mismo de Xalapa, que de las vecinas ciudades veracruzanas de Córdoba y Orizaba.',
		descripcion_en:
			"The Archivo Notarial de Xalapa safeguards documentation generated by the notaries of the town and, later, city of Xalapa, from the late sixteenth to the nineteenth century. This collection brings together notarial protocols that record legal acts essential to the social, economic, and administrative life of the region. Such documents include wills, dowries, powers of attorney, records of merchandise, transactions of real estate and livestock, marriage settlements, coartación letters (when the enslaved person paid the enslaver the established value of their person), sales contracts for enslaved people, exchanges or barters, savings/manumission letters, or leases of enslaved people. The data included in this project concerning Xalapa come from varied documentation, which records information relevant to reconstructing the life trajectories of enslaved people, such as their name, gender, age, places of provenance, ports of embarkation or ethnonyms, as well as their occupation or trade. Details of health status, physical characteristics, family or social ties, as well as properties or economic activities of African and Afro-descendant people are likewise recorded.\n\nFor entering Xalapa's notarial information into the Database, the work compiled by Fernando Winfield Capitaine (1984) has been of enormous usefulness and guidance. It is also worth highlighting the very useful and complete summaries of this archive's notarial documentation, which can be consulted online. Likewise, the direct collaboration of members of the USBI Xalapa research team in the paleography of several colonial-era documents has been very valuable. Their names and the corresponding credit are recorded when data from their paleographic work has been used.\n\nIn early 2026, the Universidad Veracruzana launched a new version of its website, where in addition to the aforementioned summaries, hundreds of digitized notarial documents can be consulted, from Xalapa as well as from the neighboring Veracruz cities of Córdoba and Orizaba.",
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
			'Winfield Capitaine, Fernando, ed. Archivo Notarial de Xalapa: índice general 1700-1800, Colección pensamiento y palabra de Veracruz. Xalapa: Universidad Veracruzana; Gobierno del Estado de Veracruz, 1998.'
		],
		informes: [
			'García Bustamante, Miguel. "El esclavo negro y el desarrollo económico de Veracruz durante el siglo XVII." UNAM, 1987.',
			'Naveda Chávez-Hita, Adriana. Esclavos negros en las haciendas azucareras de Córdoba, Veracruz, 1690-1830. Xalapa: Universidad Veracruzana, 1987.',
			'Proctor, Frank T., III. "Damned Notions of Liberty": Slavery, Culture, and Power in Colonial Mexico. Albuquerque: University of New Mexico, 2010.',
			'Terrazas Williams, Danielle. "Polonia de Ribas, mulata y dueña de esclavos: una historia alternativa, Xalapa, siglo XVII." Ulúa: Revista de historia, sociedad y cultura 19, no. 1 (2012): 41-60.',
			'Terrazas Williams, Danielle. The Capital of Free Women: Race, Legitimacy, and Liberty in Colonial Mexico. New Haven: Yale University Press, 2022.',
			'Winfield Capitaine, Fernando. Esclavos y libertos. Xalapa: Editora del Gobierno del Estado de Veracruz, 2009.'
		],
		enlaces: [
			{
				label_es: 'Archivo Notarial de Xalapa — Universidad Veracruzana',
				label_en: 'Archivo Notarial de Xalapa — Universidad Veracruzana',
				url: 'https://fciuv.uv.mx/index.php/archivo-notarial-de-xalapa'
			}
		]
	},
	{
		archivo_id: null,
		nombre: 'Archivos Notariales de Orizaba y Córdoba',
		nombre_abreviado: 'ANO / ANC',
		estado: 'Veracruz',
		direccion:
			'Unidad de Servicios Bibliotecarios y de Información (USBI), Universidad Veracruzana, Xalapa, Avenida de las Culturas Veracruzanas no. 1, Zona Universitaria, CP 91090 Xalapa, Veracruz',
		participante: 'Alvaro Alcántara López, Lizbeth Martínez Martínez',
		descripcion_es:
			'El Archivo Notarial de Orizaba y el Archivo Notarial de Córdoba se encuentran bajo resguardo de la Universidad Veracruzana. El archivo de Orizaba contiene documentación de los siglos XVI al XIX, mientras que el de Córdoba contiene documentación de los siglos XVII al XX. Para el tipo de documentación contenida en estos acervos, véase la descripción de los documentos del Archivo Notarial de Xalapa.\n\nDichos fondos documentales pueden consultarse físicamente en la Unidad de Servicios Bibliotecarios de la Universidad Veracruzana (USBI) de la ciudad de Xalapa. De manera alternativa, los índices, resúmenes y una porción significativa de documentos digitalizados se encuentran en el nuevo portal lanzado por la Universidad Veracruzana a inicios de 2026.',
		descripcion_en:
			'The Archivo Notarial de Orizaba and the Archivo Notarial de Córdoba are held in custody by the Universidad Veracruzana. The Orizaba archive contains documentation from the sixteenth to the nineteenth centuries, while the Córdoba archive contains documentation from the seventeenth to the twentieth centuries. For the type of documentation contained in these collections, see the description of the documents of the Archivo Notarial de Xalapa.\n\nThese documentary holdings can be consulted physically at the Unidad de Servicios Bibliotecarios de la Universidad Veracruzana (USBI) in the city of Xalapa. Alternatively, the indexes, summaries, and a significant portion of digitized documents are available on the new portal launched by the Universidad Veracruzana in early 2026.',
		catalogos: [
			'Reyes García, Cayetano. "Índice y extractos del Archivo Notarial de Orizaba." Historia Mexicana 16, no. 4 (1967): 588-602.',
			'Villegas Valencia, Cruz Victoria, Nohemí García Chimal, Aristeo Marín Ávila, and Aarón David Hernández Contreras, eds. Catálogo e índices del Archivo Notarial de Córdoba: siglo XVIII. Xalapa: Universidad Veracruzana, 2018.'
		],
		informes: [],
		enlaces: [
			{
				label_es: 'Archivo Notarial de Córdoba — Universidad Veracruzana',
				label_en: 'Archivo Notarial de Córdoba — Universidad Veracruzana',
				url: 'https://fciuv.uv.mx/index.php/archivo-notarial-de-cordoba'
			},
			{
				label_es: 'Archivo Notarial de Orizaba — Universidad Veracruzana',
				label_en: 'Archivo Notarial de Orizaba — Universidad Veracruzana',
				url: 'https://fciuv.uv.mx/index.php/archivo-notarial-de-orizaba'
			},
			{
				label_es: 'Portal FCI — Universidad Veracruzana',
				label_en: 'Portal FCI — Universidad Veracruzana',
				url: 'https://fciuv.uv.mx'
			}
		]
	},

	// ── Zacatecas ────────────────────────────────────────────────────
	{
		archivo_id: 11,
		nombre: 'Archivo Histórico del Estado de Zacatecas "Jesús Medrano Ávalos"',
		nombre_abreviado: 'AHEZ',
		estado: 'Zacatecas',
		direccion: 'Lomas del Calvario 105, Mexicapan, CP 98015 Zacatecas, Zacatecas',
		participante: 'Luis Benedicto Juárez Luevano',
		descripcion_es:
			'El Archivo Histórico del Estado de Zacatecas, que en la actualidad forma parte del Archivo General del Estado de Zacatecas, tiene su origen en 1991, tras haber pasado por distintos espacios de resguardo, como el Palacio de Gobierno, el Museo Virreinal de Guadalupe y el Congreso local, entre otros.\n\nEntre la vasta documentación resguardada y preservada en sus 23 fondos y colecciones, destaca el Fondo Notarías, dividido en 3 secciones, entre las cuales reviste especial interés la correspondiente al periodo colonial (1608-1820). En esta sección se han identificado 42 escribanos activos en la ciudad de Zacatecas durante el periodo virreinal novohispano; para el lapso 1608-1688 se han identificado 9 de ellos, quienes fungieron como ministros de fe pública en la elaboración de documentos tales como contratos de compraventa, cartas de manumisión, cartas de compra de libertad, contratos de aprendizaje de oficios, hipotecas, donaciones, testamentos y otros documentos afines, todos ellos vinculados con personas esclavizadas. Para este periodo colonial se contabilizan 494 piezas documentales, aunque el fondo no se encuentra completamente inventariado, por lo que aún queda trabajo archivístico por realizar. Este acervo constituye una fuente invaluable para el estudio de la esclavitud en la zona minera y su entorno, pues permite identificar datos como el nombre, edad, sexo, origen o procedencia, parentesco, categoría étnico-racial asignada, valor económico en las transacciones de compraventa, las distintas causas de manumisión –incluida la compra de la libertad– y las labores desempeñadas, entre otros aspectos.\n\nEn el presente proyecto, la mayoría de los datos procede de contratos de compraventa (1608-1688) y de cartas de manumisión y de compra de libertad (1650-1687).',
		descripcion_en:
			'The Archivo Histórico del Estado de Zacatecas, which today forms part of the Archivo General del Estado de Zacatecas, originated in 1991, after passing through different storage spaces, such as the Government Palace, the Museo Virreinal de Guadalupe, and the local Congress, among others.\n\nAmong the vast documentation safeguarded and preserved in its 23 collections and holdings, the Fondo Notarías stands out, divided into 3 sections, among which the one corresponding to the colonial period (1608–1820) is of special interest. In this section, 42 notaries active in the city of Zacatecas during the Novo-Hispanic viceregal period have been identified; for the span 1608–1688, 9 of them have been identified, who served as ministers of public faith in drawing up documents such as sales contracts, manumission letters, purchase-of-freedom letters, apprenticeship contracts, mortgages, donations, wills, and other related documents, all of them connected to enslaved people. For this colonial period, 494 documentary items are counted, although the holding is not completely inventoried, so archival work remains to be done. This collection constitutes an invaluable source for the study of slavery in the mining zone and its surroundings, since it allows for the identification of data such as name, age, sex, origin or provenance, kinship, assigned ethnic-racial category, economic value in sale transactions, the different grounds for manumission—including the purchase of freedom—and the work performed, among other aspects.\n\nIn the present project, most of the data comes from sales contracts (1608–1688) and from manumission and purchase-of-freedom letters (1650–1687).',
		catalogos: [
			'"Guía general del Archivo General del Estado de Zacatecas." Dirección del Archivo Histórico.',
			'Enciso Contreras, José, and Alicia Susana Palacios Alvarado, eds. Catálogo de los protocolos de Juan García Picón, escribano del siglo XVIII, en el Archivo Histórico del Estado de Zacatecas 1734-1755. 2 vols., Cuadernos de la Judicatura. Zacatecas: Tribunal Superior de Justicia del Estado de Zacatecas, 2003.',
			'Holcombe Isunza, Jaime, ed. Guía de protocolos de Felipe de Espinosa, escribano público y de Cabildo (1653-1680). Editado por Cristina Morales Miramontes. 2 vols. Zacatecas: Archivo del Estado de Zacatecas, 1998.'
		],
		informes: [],
		enlaces: [
			{
				label_es: 'Guía general del acervo histórico',
				label_en: 'General Guide to the Historical Holdings',
				url: 'https://archivogeneral.zacatecas.gob.mx/wp-content/uploads/2021/10/Guia-general-del-acervo-historico.pdf'
			}
		]
	}
];

/**
 * Unique states in document order, for grouping in the UI.
 */
export const estados = [...new Set(archivos.map((a) => a.estado))];

/** Attribution line from the original PDF */
export const elaboracion = {
	text_es: 'Elaboración de Tatiana Seijas',
	text_en: 'Compiled by Tatiana Seijas',
	url: 'https://history.rutgers.edu/people/faculty/details/1066-seijas-tatiana'
};

/** Resolve an archive entry's prose fields to the given locale. */
export function localizeArchivo(a, locale = getLocale()) {
	return {
		...a,
		descripcion: pickLocale(a.descripcion_es, a.descripcion_en, locale),
		enlaces: a.enlaces.map((e) => ({ ...e, label: pickLocale(e.label_es, e.label_en, locale) }))
	};
}
