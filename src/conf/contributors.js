/**
 * Contributor roster for the About page.
 *
 * Prose fields (`role`, `bio`, `additionalInfo`) ship as `_es`/`_en` pairs and
 * are resolved at render time via `pickLocale`/`localizeContributor`. Proper
 * data (names, institutions, URLs) is never translated.
 */

import { getLocale } from '$lib/paraglide/runtime.js';

/**
 * Pick a locale-specific string, falling back to Spanish when English is absent.
 * Pass `locale` explicitly from components (see About page) so `{@html}` prose
 * re-renders after hydration, when it may differ from the prerendered baseLocale.
 */
export function pickLocale(es, en, locale = getLocale()) {
	return locale === 'en' && en ? en : es;
}

export const contributors = {
	coordinators: [
		{
			name: 'Alvaro Alcántara',
			institution: 'Centro INAH Veracruz',
			institutionurl: 'https://www.inah.gob.mx/',
			role_es: 'Coordinador',
			role_en: 'Coordinator'
		},
		{
			name: 'Alex Borucki',
			institution: 'Universidad de California, Irvine',
			institutionurl: 'https://www.ucirvine.edu/',
			additionalInfo_es:
				"<a href='https://www.slavevoyages.org/' target='_blank'>Consorcio de SlaveVoyages</a>",
			additionalInfo_en:
				"<a href='https://www.slavevoyages.org/' target='_blank'>SlaveVoyages Consortium</a>",
			role_es: 'Coordinador',
			role_en: 'Coordinator'
		},
		{
			name: 'Gabriela Iturralde',
			institution: 'INAH, Ciudad de México',
			institutionurl: 'https://www.inah.gob.mx/',
			additionalInfo_es: 'Programa de Investigación Afrodescendientes y Diversidad Cultural',
			additionalInfo_en: 'Afro-descendant and Cultural Diversity Research Program',
			role_es: 'Coordinadora',
			role_en: 'Coordinator'
		},
		{
			name: 'Sabrina Smith',
			institution: 'Universidad de California, Merced',
			institutionurl: 'https://www.ucmerced.edu/',
			role_es: 'Coordinadora',
			role_en: 'Coordinator'
		}
	],
	collaborators: [
		{
			name: 'Gabriela Iturralde Nieto',
			institution: 'INAH, Ciudad de México',
			bio_es:
				'Antropóloga social, trabaja como investigadora en el Programa Nacional de Investigación Afrodescendientes y Diversidad Cultural del INAH. Es coordinadora del Diplomado virtual Racismo y Xenofobia vistos desde México que imparte el Seminario Universitario Interdisciplinario sobre Racismo y Xenofobia Desde 2008 es profesora de asignatura en Colegio de Estudios Latinoamericanos de la Facultad de Filosofía y Letras de la UNAM y es docente en la Maestria de Derechos Humanos de los Grupos Vulnerables en la Universidad Andina Simón Bolívar en Bolivia y en el Certificado de Estudios Afrolatinoamericanos del Instituto de Investigaciones sobre Afro-Latinoamérica (Alari) de la Universidad de Harvard. Sus temas de interés académico son los derechos de las poblaciones afrodescendientes, las movilizaciones políticas-identitarias, las dinámicas de alterización social en las sociedades contemporáneas, los procesos de racialización y las luchas antirracistas afrodescendientes, los usos sociales del patrimonio cultural. Es miembro del Seminario Universitario Interdisciplinario sobre Racismo y Xenofobia de la UNAM, del Observatorio de Justicia para Afrodescendientes en América Latina y de la organización Afrodescendencias en México: investigación e Incidencia A.C.',
			bio_en:
				"Social anthropologist, she works as a researcher in the INAH's National Research Program on Afro-descendants and Cultural Diversity. She coordinates the virtual diploma course Racism and Xenophobia Seen from Mexico, offered by the University Seminar on Racism and Xenophobia. Since 2008 she has been an adjunct professor at the College of Latin American Studies of the Faculty of Philosophy and Letters of UNAM, and teaches in the Master's program in Human Rights of Vulnerable Groups at the Universidad Andina Simón Bolívar in Bolivia and in the Certificate in Afro-Latin American Studies of the Institute for Afro-Latin America Research (Alari) at Harvard University. Her academic interests are the rights of Afro-descendant populations, political-identity mobilizations, the dynamics of social othering in contemporary societies, processes of racialization and Afro-descendant anti-racist struggles, and the social uses of cultural heritage. She is a member of the University Seminar on Racism and Xenophobia of UNAM, of the Observatory of Justice for Afro-descendants in Latin America, and of the organization Afrodescendencias en México: investigación e Incidencia A.C."
		},
		{
			name: 'Álvaro de Jesús Alcántara López',
			institution: 'Centro INAH Veracruz',
			bio_es:
				'Historiador y sonero. Doctor en Historia de México por la Universidad Nacional Autónoma de México. Realizó una Estancia Posdoctoral en el Centro de Investigaciones y Estudios Superiores en Antropología Social (CIESAS), Ciudad de México. Se desempeña como investigador Titular “C”, en el Centro INAH Veracruz. Trabaja asuntos relacionados con la historia social y económica del periodo colonial novohispano; pasado y presente de poblaciones afrodescendientes; historiografía y construcción social del espacio, así como al estudio de los complejos culturales festivo-musicales.\nIntegra el núcleo académico de la Maestría en Estudios de Espacio, territorio y Paisaje, de la UV, además de su labor como docente por más de 23 años como profesor en Licenciatura y Posgrado en la UNAM, la ENAH o la Universidad Veracruzana.\nForma parte de los grupos de investigación: 1) La circulación de afrodescendientes esclavizados y libres en la Nueva España: Un Taller de Humanidades Digitales; y 2) GATPAC, Conexiones Globales Atlántico-Pacífico.\nEs coordinador del micrositio “Memorias Afromexicanas” https://memoricamexico.gob.mx/es/memorica/Memorias_afromexicanas , en el portal digital MEMÓRICA, México Haz Memoria.\nEs editor de la revista La Manta y La Raya. Universos Sonoros en Diálogo www.lamantaylaraya.org\nRealiza la serie “rezumba y suena la memoria” en el canal de Youtube Entre verde y seco https://www.youtube.com/@entreverdeyseco6551 , un espacio en que también se dan a conocer investigaciones relacionadas con las personas y comunidades afromexicanas y afrodescendientes del presente y del pasado de México.\nSus trabajos pueden encontrarse en https://inah.academia.edu/AlvaroAlcantara',
			bio_en:
				'Historian and sonero. He holds a doctorate in Mexican History from the Universidad Nacional Autónoma de México. He completed a postdoctoral residency at the Centro de Investigaciones y Estudios Superiores en Antropología Social (CIESAS), Mexico City. He serves as a Titular "C" researcher at the Centro INAH Veracruz. He works on issues related to the social and economic history of the Novo-Hispanic colonial period; the past and present of Afro-descendant populations; historiography and the social construction of space; and the study of festive-musical cultural complexes.\nHe is part of the academic core of the Master\'s program in Studies of Space, Territory, and Landscape at the UV, in addition to more than 23 years as a lecturer and graduate professor at UNAM, ENAH, and the Universidad Veracruzana.\nHe is part of the research groups: 1) The Circulation of Enslaved and Free Afro-descendants in New Spain: A Digital Humanities Workshop; and 2) GATPAC, Global Atlantic-Pacific Connections.\nHe coordinates the microsite "Memorias Afromexicanas" https://memoricamexico.gob.mx/es/memorica/Memorias_afromexicanas , on the digital portal MEMÓRICA, México Haz Memoria.\nHe is editor of the journal La Manta y La Raya. Universos Sonoros en Diálogo www.lamantaylaraya.org\nHe produces the series "rezumba y suena la memoria" on the YouTube channel Entre verde y seco https://www.youtube.com/@entreverdeyseco6551 , a space where research related to Afro-Mexican and Afro-descendant people and communities of Mexico\'s present and past is also presented.\nHis works can be found at https://inah.academia.edu/AlvaroAlcantara'
		},
		{
			name: 'Maira Cristina Córdova',
			institution: 'UNAM',
			bio_es:
				'Licenciada en Ciencias Humanas, Universidad Iberoamericana, Maestra, y Doctora en Historia por la Universidad Nacional Autónoma de México. Ha sido coordinadora y docente de talleres, cursos y diplomados de especialización sobre Estudios Afroamericanos en la Universidad Nacional Autónoma de México y en el Instituto Nacional de Antropología e Historia. Es miembro del Sistema Nacional de Investigadores.',
			bio_en:
				"She holds a bachelor's degree in Human Sciences from the Universidad Iberoamericana, and a master's and doctorate in History from the Universidad Nacional Autónoma de México. She has been a coordinator and instructor of workshops, courses, and specialized diploma programs on Afro-American Studies at the Universidad Nacional Autónoma de México and the Instituto Nacional de Antropología e Historia. She is a member of the National System of Researchers."
		},
		{
			name: 'Jorge E. Delgadillo Núñez',
			institution: 'Universidad de Vanderbilt',
			bio_es:
				'Doctor en Historia por la Universidad de Vanderbilt. Sus investigaciones se centran en la historia de las poblaciones afrodescendientes de Guadalajara y la región occidente de México entre los siglos XVI y XIX. Sus trabajos han sido publicados en inglés y en español por <i>Slavery & Abolition</i>, <i>The Americas</i>, e <i>Historia Mexicana</i>.',
			bio_en:
				'He holds a doctorate in History from Vanderbilt University. His research focuses on the history of Afro-descendant populations of Guadalajara and western Mexico between the sixteenth and nineteenth centuries. His works have been published in English and Spanish by <i>Slavery & Abolition</i>, <i>The Americas</i>, and <i>Historia Mexicana</i>.'
		},
		{
			name: 'Luis Benedicto Juárez Luévano',
			institution: 'Universidad de Hamburgo',
			bio_es:
				'Desde sus primeras investigaciones se ha especializado en el estudio de la historia regional, esclavitud, afrodescendencia y migración en los actuales estados mexicanos de Aguascalientes, Zacatecas y parte de Jalisco (anterior Reino de la Nueva Galicia). Ha colaborado en proyectos de índole académico, pedagógico, documental y de edición en países como Alemania, México y Chile. Actualmente y como parte del doctorado en Historia Media y Moderna (Universidad de Hamburgo) desarrolla una investigación documental sobre la acelerada disminución de la esclavitud y la transición de la fuerza de trabajo en la que propone como la región minero-agropecuaria zacatecana (siglos XVII-XVIII). Estudió las maestrías en Estudios Americanos (Universidad de Sevilla), en Historia (Universidad de Chile) y Ética Social y Desarrollo Humano (Universidad Jesuita Alberto Hurtado); así también la licenciatura en Historia (Universidad Nacional Autónoma de México y Universidad de Chile).',
			bio_en:
				"Since his earliest research he has specialized in the study of regional history, slavery, Afro-descendance, and migration in the present-day Mexican states of Aguascalientes, Zacatecas, and part of Jalisco (formerly the Kingdom of New Galicia). He has collaborated on academic, pedagogical, documentary, and editorial projects in countries such as Germany, Mexico, and Chile. Currently, as part of his doctorate in Medieval and Modern History (Universität Hamburg), he is conducting documentary research on the accelerated decline of slavery and the transition of the labor force in what he proposes as the Zacatecan mining-agricultural region (seventeenth–eighteenth centuries). He studied master's degrees in American Studies (Universidad de Sevilla), in History (Universidad de Chile), and in Social Ethics and Human Development (Universidad Jesuita Alberto Hurtado); as well as a bachelor's degree in History (Universidad Nacional Autónoma de México and Universidad de Chile)."
		},
		{
			name: 'María Irma López',
			institution: 'Instituto Nacional de Antropología e Historia',
			bio_es:
				'María Irma López Razgado es investigadora del Instituto Nacional de Antropología e Historia (INAH), especializada en el estudio de la población afrodescendiente en Colima durante el siglo XVIII, utilizando fuentes primarias de archivos locales. Pertenece al Seminario Permanente de Estudios Africanos y Afrodescendientes en México, coordinado por la Dra. María Elisa Velázquez. En 2024, su trabajo fue seleccionado para su publicación, contribuyendo con un capítulo sobre Joseph Fuentes, un mulato libertino en la Colima del siglo XVIII, en el libro Trayectorias de vida de afrodescendientes en la historia de México, coordinado por Gabriela Iturralde Nieto.\nAdemás, ha publicado obras como Colima: tras las huellas africanas y su diversidad cultural (2024), que explora la influencia africana en la región, y María de Iniesta y el auge de los Trapiches de Azúcar en Colima (siglos XVII-XVIII) (2024), donde analiza la historia económica, social y el mestizaje en Colima. En 2023, su libro Colima, el latido de sus años, coordinado junto con el Dr. José Miguel Romero de Solís, fue seleccionado para conmemorar los 500 años de la fundación de Colima, además ella contribuyó con un capítulo sobre: Siglo XVIII: Transformación y mestizaje multicultural.\nComo parte del proyecto Trayectorias Afromexicanas: La circulación de afrodescendientes esclavizados y libres en la Nueva España, López Razgado seleccionó protocolos históricos donde la paleografía del siglo XVI fue realizada por el Dr. José Miguel Romero de Solís, reconocido experto en este periodo. En el caso del siglo XVII, la transcripción y estudio de los documentos fue realizada por el Mtro. Juan Carlos Reyes Garza, quien se especializó en esta etapa histórica. Finalmente, para el siglo XVIII, la documentación y transcripción fueron llevadas a cabo por López Razgado, quien revisó y transcribió los archivos de manera detallada, carpeta por carpeta y foja por foja.',
			bio_en:
				'María Irma López Razgado is a researcher at the Instituto Nacional de Antropología e Historia (INAH), specialized in the study of the Afro-descendant population in Colima during the eighteenth century, using primary sources from local archives. She belongs to the Permanent Seminar on African and Afro-descendant Studies in Mexico, coordinated by Dr. María Elisa Velázquez. In 2024, her work was selected for publication, contributing a chapter about Joseph Fuentes, a libertine mulatto in eighteenth-century Colima, in the book Trayectorias de vida de afrodescendientes en la historia de México, coordinated by Gabriela Iturralde Nieto.\nShe has also published works such as Colima: tras las huellas africanas y su diversidad cultural (2024), which explores African influence in the region, and María de Iniesta y el auge de los Trapiches de Azúcar en Colima (siglos XVII-XVIII) (2024), where she analyzes the economic and social history and mestizaje in Colima. In 2023, her book Colima, el latido de sus años, co-coordinated with Dr. José Miguel Romero de Solís, was selected to commemorate the 500th anniversary of the founding of Colima; she also contributed a chapter on: Eighteenth Century: Transformation and Multicultural Mestizaje.\nAs part of the project Trayectorias Afromexicanas: La circulación de afrodescendientes esclavizados y libres en la Nueva España, López Razgado selected historical protocols in which the sixteenth-century paleography was carried out by Dr. José Miguel Romero de Solís, a recognized expert in this period. For the seventeenth century, the transcription and study of the documents were carried out by Mtro. Juan Carlos Reyes Garza, who specialized in this historical stage. Finally, for the eighteenth century, the documentation and transcription were carried out by López Razgado, who reviewed and transcribed the archives in detail, folder by folder and folio by folio.'
		},
		{
			name: 'Julieta Pineda',
			institution: '',
			bio_es:
				'Doctora en Historia por El Colegio de Michoacán. Ha sido profesora de asignatura en la Universidad Autónoma de la Ciudad de México y postdoctorante SECIHTI en el Centro de Estudios Históricos de El Colegio de México. Sus líneas de investigación giran entorno al estudio de individuos y poblaciones de origen africano, Historia Social de la Compañía de Jesús y análisis de la relación entre Iglesia, religión y esclavitud durante los siglos XVI-XVIII en México.',
			bio_en:
				'She holds a doctorate in History from El Colegio de Michoacán. She has been an adjunct professor at the Universidad Autónoma de la Ciudad de México and a SECIHTI postdoctoral fellow at the Center for Historical Studies of El Colegio de México. Her lines of research revolve around the study of individuals and populations of African origin, the Social History of the Society of Jesus, and analysis of the relationship between Church, religion, and slavery during the sixteenth to eighteenth centuries in Mexico.'
		},
		{
			name: 'Pablo Miguel Sierra Silva',
			institution: 'Universidad de Rochester',
			bio_es:
				'Es doctor y maestro en Historia por la Universidad de California-Los Angeles (UCLA). Actualmente se desempeña como profesor asociado en la Facultad de Historia de la Universidad de Rochester. Fue editor y traductor de la colección de fuentes primarias <i>Mexico, Slavery, Freedom: A Bilingual Documentary History, 1520-1829</i>, publicado por la editorial Hackett Publishing en 2024. Su primer libro, <i>Urban Slavery in Colonial Mexico: Puebla de los Ángeles, 1531-1706</i>, se publicó en 2018 por Cambridge University Press. Entre sus trabajos recientes se encuentran “Culto, color y convivencia: Las cofradías de pardos y morenos en Puebla de los Ángeles, siglo XVII” y “Afro-Mexican Women in Saint-Domingue.” En la actualidad, desarrolla un libro sobre el ataque bucanero-esclavista de 1683 contra el puerto de Veracruz y sus consecuencias para la historia afrodescendiente de México, Haití, República Dominicana, y Carolina del Sur. ',
			bio_en:
				'He holds a doctorate and master\'s degree in History from the University of California-Los Angeles (UCLA). He currently serves as an associate professor in the Department of History at the University of Rochester. He was editor and translator of the primary source collection <i>Mexico, Slavery, Freedom: A Bilingual Documentary History, 1520-1829</i>, published by Hackett Publishing in 2024. His first book, <i>Urban Slavery in Colonial Mexico: Puebla de los Ángeles, 1531-1706</i>, was published in 2018 by Cambridge University Press. Among his recent works are "Culto, color y convivencia: Las cofradías de pardos y morenos en Puebla de los Ángeles, siglo XVII" and "Afro-Mexican Women in Saint-Domingue." He is currently developing a book on the 1683 buccaneer-slaver attack on the port of Veracruz and its consequences for the Afro-descendant history of Mexico, Haiti, the Dominican Republic, and South Carolina. '
		},
		{
			name: 'Tatiana Seijas',
			institution: 'Rutgers University',
			bio_es:
				'Es profesora asociada en el Departamento de Historia de la Universidad de Rutgers. Dos libros suyos cubren temas relacionadas con el proyecto: <i>Asian Slaves in Colonial Mexico</i> (CUP 2014) y <i>As If She Were Free: A Collective Biography of Women and Emancipation in the Americas</i> (CUP 2020). La información hasta hoy incluida sobre personas que vivieron en la ciudad de México durante el siglo XVII deriva de documentación consultada en el Archivo General de Notarías en 2006 y 2007.  \n\n<a href=https://history.rutgers.edu/people/faculty/details/56-professors/1066-seijas-tatiana>Perfil en Rutgers</a>\n\n',
			bio_en:
				'She is an associate professor in the Department of History at Rutgers University. Two of her books cover topics related to the project: <i>Asian Slaves in Colonial Mexico</i> (CUP 2014) and <i>As If She Were Free: A Collective Biography of Women and Emancipation in the Americas</i> (CUP 2020). The information included to date about people who lived in Mexico City during the seventeenth century derives from documentation consulted at the Archivo General de Notarías in 2006 and 2007.  \n\n<a href=https://history.rutgers.edu/people/faculty/details/56-professors/1066-seijas-tatiana>Rutgers Profile</a>\n\n'
		},
		{
			name: 'Sabrina Smith',
			institution: 'Universidad de California, Merced',
			bio_es:
				'Es profesora asistente en el Departamento de Historia y Estudios Críticos de Raza y Étnia de la Universidad de California, Merced. Recibió su licenciatura en la Universidad de California en Santa Bárbara y su maestría y doctorado en Historia en la Universidad de California en Los Ángeles. Su trabajo académico, incluyendo su próximo libro, <i>Beyond Captivity and Freedom: African Descended Women and Men in Colonial Oaxaca</i>, se enfoca en las experiencias de las poblaciones libres y esclavizadas en Antequera, la capital provincial de Oaxaca. Sus proyectos académicos se han publicado en las revistas <i>The Americas</i> y la <i>Hispanic American Historical Review</i>, además de en varios volúmenes editados. Como codirectora principal del proyecto, <i>Trayectorias afrodescendientes</i>, ha asesorado y colaborado con los siguientes estudiantes de la Universidad de California en Merced para llenar la base de datos, utilizando registros notariales de Oaxaca: Virginia Mateo, Daniel López, Kimberly Barillas y Dayana Llamas Méndez.',
			bio_en:
				"She is an assistant professor in the Department of History and Critical Race and Ethnic Studies at the University of California, Merced. She received her bachelor's degree from the University of California, Santa Barbara, and her master's and doctorate in History from the University of California, Los Angeles. Her academic work, including her forthcoming book, <i>Beyond Captivity and Freedom: African Descended Women and Men in Colonial Oaxaca</i>, focuses on the experiences of free and enslaved populations in Antequera, the provincial capital of Oaxaca. Her academic projects have been published in the journals <i>The Americas</i> and the <i>Hispanic American Historical Review</i>, as well as in several edited volumes. As a lead co-director of the project, <i>Trayectorias afrodescendientes</i>, she has advised and collaborated with the following students from the University of California, Merced to populate the database, using notarial records from Oaxaca: Virginia Mateo, Daniel López, Kimberly Barillas, and Dayana Llamas Méndez."
		}
	],
	researchAssistants: [
		{
			name: 'Berenice Tepozano',
			institution: 'Universidad de California, Irvine',
			institutionurl: 'https://www.humanities.uci.edu/students/berenice-tepozano',
			role_es: 'Ayudante de Investigación',
			role_en: 'Research Assistant'
		},
		{
			name: 'Camila Sanhueza',
			institution: 'Universidad de California, Irvine',
			institutionurl: '',
			role_es: 'Ayudante de Investigación',
			role_en: 'Research Assistant'
		},
		{
			name: 'Arielle D. Steimer-Barragan',
			institution: 'Universidad de California, Irvine',
			institutionurl: '',
			role_es: 'Ayudante de Investigación',
			role_en: 'Research Assistant'
		},
		{
			name: 'Carlo Acevedo Malo',
			institution: 'Universidad de California, Merced',
			institutionurl: '',
			role_es: 'Ayudante de Investigación',
			role_en: 'Research Assistant'
		},
		{
			name: 'Thomas Paniagua',
			institution: 'Universidad de California, Merced',
			institutionurl: '',
			role_es: 'Ayudante de Investigación',
			role_en: 'Research Assistant'
		},
		{
			name: 'Yulissa Torres',
			institution: 'Universidad de California, Merced',
			institutionurl: '',
			role_es: 'Ayudante de Investigación',
			role_en: 'Research Assistant'
		}
	],
	developers: [
		{
			name: 'Jairo A. Melo Flórez, PhD',
			institution: 'Digital Humanities Research Facilitator, UCSB Library',
			institutionurl: 'https://www.library.ucsb.edu/staff/jairo-melo-florez',
			role_es:
				'Responsable del diseño y la evolución de la infraestructura de investigación de TrayectoriasAfro. Lidera el desarrollo de sistemas de recolección estructurada y el diseño del modelo de datos relacional. Actualmente, coordina la implementación de inteligencia artificial agéntica para la innovación en procesos de enriquecimiento, curaduría y preservación de datos históricos.',
			role_en:
				"Responsible for the design and evolution of TrayectoriasAfro's research infrastructure. Leads the development of structured data-collection systems and the design of the relational data model. Currently coordinates the implementation of agentic artificial intelligence for innovation in the enrichment, curation, and preservation of historical data."
		}
	]
};

/** Resolve a contributor's prose fields to the given locale. */
export function localizeContributor(c, locale = getLocale()) {
	return {
		...c,
		role: c.role_es !== undefined ? pickLocale(c.role_es, c.role_en, locale) : undefined,
		bio: c.bio_es !== undefined ? pickLocale(c.bio_es, c.bio_en, locale) : undefined,
		additionalInfo:
			c.additionalInfo_es !== undefined
				? pickLocale(c.additionalInfo_es, c.additionalInfo_en, locale)
				: undefined
	};
}
