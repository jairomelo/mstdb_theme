import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths relative to this script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.resolve(__dirname, '../messages');
const ES_PATH = path.join(MESSAGES_DIR, 'es.json');
const EN_PATH = path.join(MESSAGES_DIR, 'en.json');

async function main() {
	const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
	if (!apiKey) {
		console.error(
			'❌ Error: Please set either OPENAI_API_KEY or GEMINI_API_KEY environment variable.'
		);
		process.exit(1);
	}

	// 1. Read files
	const esContent = await fs.readFile(ES_PATH, 'utf-8');
	const esData = JSON.parse(esContent);

	let enData = {};
	try {
		const enContent = await fs.readFile(EN_PATH, 'utf-8');
		enData = JSON.parse(enContent);
	} catch (e) {
		console.log('ℹ️ en.json does not exist or is invalid. Creating a new one.');
	}

	// 2. Find missing keys
	const keysToTranslate = {};
	for (const [key, value] of Object.entries(esData)) {
		if (enData[key] === undefined) {
			keysToTranslate[key] = value;
		}
	}

	const missingCount = Object.keys(keysToTranslate).length;
	if (missingCount === 0) {
		console.log('✅ All Spanish keys already have translations in en.json.');
		return;
	}

	console.log(`\n🔍 Found ${missingCount} keys that need translation to English.`);

	// 3. Perform API request
	console.log('🤖 Sending translation request to AI...');

	let translatedData = {};
	if (process.env.OPENAI_API_KEY) {
		translatedData = await translateWithOpenAI(keysToTranslate);
	} else if (process.env.GEMINI_API_KEY) {
		translatedData = await translateWithGemini(keysToTranslate);
	}

	// 4. Merge and write
	const mergedEnData = { ...enData };
	for (const [key, value] of Object.entries(esData)) {
		// Keep existing translations, add new ones, fallback to Spanish if translation failed
		mergedEnData[key] = enData[key] || translatedData[key] || value;
	}

	// Format keys in same order as es.json
	const orderedEnData = {};
	for (const key of Object.keys(esData)) {
		orderedEnData[key] = mergedEnData[key];
	}

	await fs.writeFile(EN_PATH, JSON.stringify(orderedEnData, null, 2), 'utf-8');
	console.log('🎉 Translation complete! messages/en.json has been updated.');
}

async function translateWithOpenAI(keys) {
	const url = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';
	const model = process.env.TRANSLATION_MODEL || 'gpt-4o-mini';

	const systemPrompt = `
You are a precise translation assistant for the "Trayectorias Afro" (Afro-Trajectories) digital humanities project.
This platform maps historical movements, social networks, and biographical profiles of enslaved and free Afro-descendant individuals in the Americas.

Translate the Spanish values in the provided JSON object to English.
CRITICAL RULES:
1. Output MUST be a valid JSON object matching the same keys.
2. Preserve variables in curly braces verbatim, e.g. {name}, {count}.
3. Handle historical terminology with high accuracy (e.g., "personas esclavizadas" -> "enslaved people").
4. Maintain exact casing, formatting, and markdown tags of the source values.
`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: JSON.stringify(keys) }
			],
			temperature: 0.1
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
	}

	const result = await response.json();
	const content = result.choices[0].message.content;
	return JSON.parse(content);
}

async function translateWithGemini(keys) {
	const model = process.env.TRANSLATION_MODEL || 'gemini-1.5-flash';
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

	const systemPrompt = `
You are a precise translation assistant for the "Trayectorias Afro" (Afro-Trajectories) digital humanities project.
This platform maps historical movements, social networks, and biographical profiles of enslaved and free Afro-descendant individuals in the Americas.

Translate the Spanish values in the provided JSON object to English.
CRITICAL RULES:
1. Output MUST be a valid JSON object matching the same keys.
2. Preserve variables in curly braces verbatim, e.g. {name}, {count}.
3. Handle historical terminology with high accuracy (e.g., "personas esclavizadas" -> "enslaved people").
4. Maintain exact casing, formatting, and markdown tags of the source values.
`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			contents: [
				{
					parts: [
						{ text: systemPrompt },
						{ text: `Translate this Spanish JSON: ${JSON.stringify(keys)}` }
					]
				}
			],
			generationConfig: {
				responseMimeType: 'application/json'
			}
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
	}

	const result = await response.json();
	const contentText = result.candidates[0].content.parts[0].text;
	return JSON.parse(contentText);
}

main().catch((err) => {
	console.error('❌ Translation script failed:', err);
	process.exit(1);
});
