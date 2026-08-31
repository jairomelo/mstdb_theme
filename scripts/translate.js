/*
How to use

# ─────────────────────────────────────────────────────────────
# 1. Custom OpenAI-Compatible Gateway / Provider
# ─────────────────────────────────────────────────────────────
# Export your gateway URL, API token, and model name:
export AI_PROVIDER_URL="https://your-gateway-url.edu/v1"
export AI_API_TOKEN="your_provider_api_token"
export AI_MODEL="your-model-name" # e.g., "claude-3-5-sonnet", "gpt-4o-mini", "llama-3-70b"

# Run translation
npm run translate

# Run verification & refinement
npm run translate:verify

# ─────────────────────────────────────────────────────────────
# 2. Local Ollama (Default fallback when no gateway is configured)
# ─────────────────────────────────────────────────────────────
# Standard translation with local Qwen2.5 (3B)
npm run translate

# Verification pass with local Llama 3 (8B)
npm run translate:verify

# Or specify a different local Ollama model
export OLLAMA_MODEL="llama3.2:latest"
npm run translate
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths relative to this script
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.resolve(__dirname, '../messages');
const ES_PATH = path.join(MESSAGES_DIR, 'es.json');
const EN_PATH = path.join(MESSAGES_DIR, 'en.json');

const TRANSLATION_SYSTEM_PROMPT = `
You are a precise translation assistant for the "Trayectorias Afro" (Afro-Trajectories) digital humanities project.
This platform maps historical movements, social networks, and biographical profiles of enslaved and free Afro-descendant individuals in the Americas.

Translate the Spanish values in the provided JSON object into natural, professional English.

CRITICAL RULES:
1. Output MUST be a valid JSON object matching the EXACT same keys.
2. DO NOT leave Spanish words untranslated unless they are untranslatable proper nouns or organization names (e.g., "Trayectorias Afro", "Memorica México", "Fundación Neogranadina").
3. Historical and Domain Glossary:
   - "Personas Esclavizadas" -> "Enslaved People"
   - "Personas No Esclavizadas" -> "Non-Enslaved People"
   - "Lugares" -> "Places"
   - "Corporaciones" -> "Corporate Entities" / "Institutions"
   - "Documentos" -> "Documents"
   - "Agradecimientos" -> "Acknowledgements"
   - "Financiamiento" -> "Funding"
   - "Sobre Nosotros" / "Sobre el Proyecto" -> "About Us" / "About the Project"
   - "Proyectos Hermanos" -> "Sister Projects" / "Related Projects"
   - "Búsqueda exacta" -> "Exact search"
   - "Entrar" -> "Log in" or "Sign in"
   - "Cerrar sesión" -> "Log out"
   - "Panel de control" -> "Control Panel"
4. Preserve variables enclosed in curly braces verbatim, e.g. {name}, {count}.
5. Maintain exact casing, formatting, and markdown tags of the source values.

EXAMPLE:
Input:
{
  "item_1": "Personas Esclavizadas",
  "item_2": "Lugares",
  "item_3": "Bienvenido/a, {name}"
}
Output:
{
  "item_1": "Enslaved People",
  "item_2": "Places",
  "item_3": "Welcome, {name}"
}
`;

const VERIFICATION_SYSTEM_PROMPT = `
You are an expert bilingual editor and quality reviewer for the "Trayectorias Afro" digital humanities project.
You will receive a JSON object where each key contains:
{
  "spanish": "original Spanish source text",
  "english_draft": "current English draft"
}

Your task is to review each draft and produce a final, polished English translation.

CRITICAL RULES:
1. Output MUST be a FLAT JSON object mapping each key directly to its final English translation string:
   { "key_name": "Final Corrected English Text" }
   DO NOT return nested objects.
   DO NOT include explanations, comments, or notes like "Translation note:". Return ONLY the translation text.
2. Fix untranslated Spanish remnants:
   - "Lugares" -> "Places"
   - "Personas Esclavizadas" -> "Enslaved People"
   - "Personas No Esclavizadas" -> "Non-Enslaved People"
   - "Agradecimientos" -> "Acknowledgements"
   - "Proyectos Hermanos" -> "Sister Projects"
   - "Visualizaciones" -> "Visualizations"
3. Improve awkward or overly literal phrasing into natural, fluent scholarly English.
4. Keep recognized proper names in their standard form (e.g., "Trayectorias Afro", "Memorica México").
5. Preserve variables enclosed in curly braces verbatim, e.g. {name}, {count}.

EXAMPLE:
Input:
{
  "key_1": { "spanish": "Personas Esclavizadas", "english_draft": "Personas Esclavizadas" },
  "key_2": { "spanish": "Proyectos Hermanos", "english_draft": "Siblings' Projects" },
  "key_3": { "spanish": "{count} registros", "english_draft": "{count} records" }
}
Output:
{
  "key_1": "Enslaved People",
  "key_2": "Sister Projects",
  "key_3": "{count} records"
}
`;

function chunkObject(obj, size) {
	const entries = Object.entries(obj);
	const chunks = [];
	for (let i = 0; i < entries.length; i += size) {
		const chunk = Object.fromEntries(entries.slice(i, i + size));
		chunks.push(chunk);
	}
	return chunks;
}

function extractStringValue(val, fallback) {
	if (typeof val === 'string') {
		return val.trim();
	}
	if (typeof val === 'object' && val !== null) {
		if (typeof val.english_draft === 'string') return val.english_draft.trim();
		if (typeof val.translation === 'string') return val.translation.trim();
		if (typeof val.english === 'string') return val.english.trim();
		if (typeof val.text === 'string') return val.text.trim();
	}
	return typeof fallback === 'string' ? fallback.trim() : '';
}

function parseJsonResponse(content) {
	if (typeof content !== 'string') return {};
	const cleaned = content.trim();
	try {
		return JSON.parse(cleaned);
	} catch (e) {
		const match = cleaned.match(/\{[\s\S]*\}/);
		if (match) {
			return JSON.parse(match[0]);
		}
		throw e;
	}
}

function normalizeChatCompletionsUrl(rawUrl) {
	if (!rawUrl) return 'https://api.openai.com/v1/chat/completions';
	let url = rawUrl.trim().replace(/\/+$/, '');
	if (url.endsWith('/chat/completions')) {
		return url;
	}
	if (url.endsWith('/v1')) {
		return `${url}/chat/completions`;
	}
	return `${url}/v1/chat/completions`;
}

function getProviderConfig(isVerifyMode) {
	const providerUrl =
		process.env.AI_PROVIDER_URL ||
		process.env.PROVIDER_URL ||
		process.env.OPENAI_BASE_URL ||
		process.env.OPENAI_API_BASE;

	const apiToken =
		process.env.AI_API_TOKEN ||
		process.env.PROVIDER_API_TOKEN ||
		process.env.AI_API_KEY ||
		process.env.OPENAI_API_KEY;

	const hasGatewayConfig = Boolean(providerUrl || apiToken);

	if (hasGatewayConfig) {
		const model =
			process.env.AI_MODEL ||
			process.env.PROVIDER_MODEL ||
			process.env.MODEL ||
			process.env.TRANSLATION_MODEL ||
			process.env.OPENAI_MODEL ||
			'gpt-4o-mini';

		return {
			type: 'gateway',
			providerUrl: normalizeChatCompletionsUrl(providerUrl),
			apiToken,
			model,
			defaultBatchSize: 5
		};
	}

	// Default to local Ollama
	const model = process.env.OLLAMA_MODEL || (isVerifyMode ? 'llama3:8b' : 'qwen2.5:3b');

	return {
		type: 'ollama',
		host: process.env.OLLAMA_HOST || 'http://localhost:11434',
		model,
		defaultBatchSize: 3
	};
}

async function main() {
	const isVerifyMode = process.argv.includes('--verify');
	const config = getProviderConfig(isVerifyMode);

	// 1. Read files
	const esContent = await fs.readFile(ES_PATH, 'utf-8');
	const esData = JSON.parse(esContent);

	let enData = {};
	try {
		const enContent = await fs.readFile(EN_PATH, 'utf-8');
		const rawEnData = JSON.parse(enContent);
		for (const [k, v] of Object.entries(rawEnData)) {
			enData[k] = extractStringValue(v, v);
		}
	} catch (e) {
		console.log('ℹ️ en.json does not exist or is invalid. Creating a new one.');
	}

	const batchSize = Math.max(
		1,
		parseInt(process.env.BATCH_SIZE || String(config.defaultBatchSize), 10)
	);

	if (isVerifyMode) {
		await runVerificationMode({ esData, enData, config, batchSize });
	} else {
		await runTranslationMode({ esData, enData, config, batchSize });
	}
}

async function runTranslationMode({ esData, enData, config, batchSize }) {
	const keysToTranslate = {};
	for (const [key, value] of Object.entries(esData)) {
		if (key.startsWith('$')) continue;
		if (enData[key] === undefined) {
			keysToTranslate[key] = value;
		}
	}

	const missingCount = Object.keys(keysToTranslate).length;
	if (missingCount === 0) {
		console.log('✅ All Spanish keys already have translations in en.json.');
		console.log(
			'💡 Tip: Run `npm run translate:verify` to audit and refine existing translations.'
		);
		return;
	}

	const chunks = chunkObject(keysToTranslate, batchSize);

	console.log(`\n🔍 Found ${missingCount} keys that need translation to English.`);
	console.log(
		`🤖 Mode: Standard Translation | Provider: ${config.type.toUpperCase()} | Model: ${config.model}`
	);
	if (config.type === 'gateway') {
		console.log(`🌐 Gateway URL: ${config.providerUrl}`);
	}
	console.log(`📦 Processing in ${chunks.length} batch(es) of up to ${batchSize} key(s) each...\n`);

	let translatedCount = 0;
	let currentEnData = { ...enData };

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const chunkKeys = Object.keys(chunk);
		process.stdout.write(
			`⏳ [Batch ${i + 1}/${chunks.length}] Translating ${chunkKeys.length} key(s)... `
		);

		let translatedChunk = {};
		try {
			translatedChunk = await executeRequest({
				systemPrompt: TRANSLATION_SYSTEM_PROMPT,
				userPrompt: `Translate this Spanish JSON object to English: ${JSON.stringify(chunk)}`,
				config
			});
		} catch (batchError) {
			console.log(`\n⚠️ Batch error: ${batchError.message}. Retrying key-by-key...`);
			for (const [k, v] of Object.entries(chunk)) {
				try {
					const singleResult = await executeRequest({
						systemPrompt: TRANSLATION_SYSTEM_PROMPT,
						userPrompt: `Translate this Spanish JSON object to English: ${JSON.stringify({ [k]: v })}`,
						config
					});
					translatedChunk[k] = extractStringValue(singleResult[k], v);
				} catch (singleErr) {
					console.error(`❌ Could not translate key "${k}": ${singleErr.message}`);
					translatedChunk[k] = v;
				}
			}
		}

		for (const [key, value] of Object.entries(chunk)) {
			currentEnData[key] = extractStringValue(translatedChunk[key], value);
		}

		translatedCount += chunkKeys.length;
		await saveMergedEnFile(esData, currentEnData);
		console.log(`✅ Saved! (${translatedCount}/${missingCount} keys done)`);
	}

	console.log('\n🎉 Translation complete! messages/en.json is fully updated and synced.');
}

async function runVerificationMode({ esData, enData, config, batchSize }) {
	const keysToVerify = {};
	for (const [key, spanishVal] of Object.entries(esData)) {
		if (key.startsWith('$')) continue;
		if (enData[key] !== undefined) {
			keysToVerify[key] = {
				spanish: spanishVal,
				english_draft: extractStringValue(enData[key], spanishVal)
			};
		}
	}

	const totalKeys = Object.keys(keysToVerify).length;
	if (totalKeys === 0) {
		console.log('ℹ️ No existing translations found to verify in en.json.');
		return;
	}

	const chunks = chunkObject(keysToVerify, batchSize);

	console.log(`\n🔎 Starting Verification & Refinement pass on ${totalKeys} keys.`);
	console.log(
		`🤖 Mode: Verification & Critique | Provider: ${config.type.toUpperCase()} | Model: ${config.model}`
	);
	if (config.type === 'gateway') {
		console.log(`🌐 Gateway URL: ${config.providerUrl}`);
	}
	console.log(`📦 Processing in ${chunks.length} batch(es) of up to ${batchSize} key(s) each...\n`);

	let verifiedCount = 0;
	let currentEnData = { ...enData };

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const chunkKeys = Object.keys(chunk);
		process.stdout.write(
			`⏳ [Verify Batch ${i + 1}/${chunks.length}] Auditing ${chunkKeys.length} key(s)... `
		);

		let refinedChunk = {};
		try {
			refinedChunk = await executeRequest({
				systemPrompt: VERIFICATION_SYSTEM_PROMPT,
				userPrompt: `Review and correct these translation drafts: ${JSON.stringify(chunk)}`,
				config
			});
		} catch (batchError) {
			console.log(`\n⚠️ Verification batch error: ${batchError.message}. Retrying individually...`);
			for (const [k, v] of Object.entries(chunk)) {
				try {
					const singleResult = await executeRequest({
						systemPrompt: VERIFICATION_SYSTEM_PROMPT,
						userPrompt: `Review and correct this translation draft: ${JSON.stringify({ [k]: v })}`,
						config
					});
					refinedChunk[k] = extractStringValue(singleResult[k], v.english_draft);
				} catch (singleErr) {
					refinedChunk[k] = v.english_draft;
				}
			}
		}

		for (const [key, val] of Object.entries(chunk)) {
			currentEnData[key] = extractStringValue(refinedChunk[key], val.english_draft);
		}

		verifiedCount += chunkKeys.length;
		await saveMergedEnFile(esData, currentEnData);
		console.log(`✅ Verified & Saved! (${verifiedCount}/${totalKeys} keys audited)`);
	}

	console.log('\n🎉 Verification & Refinement complete! All translations have been polished.');
}

async function executeRequest({ systemPrompt, userPrompt, config }) {
	if (config.type === 'gateway') {
		return await translateWithGateway({
			systemPrompt,
			userPrompt,
			providerUrl: config.providerUrl,
			apiToken: config.apiToken,
			model: config.model
		});
	} else {
		return await translateWithOllama({
			systemPrompt,
			userPrompt,
			host: config.host,
			model: config.model
		});
	}
}

async function saveMergedEnFile(esData, currentEnData) {
	const orderedEnData = {};
	if (esData['$schema']) {
		orderedEnData['$schema'] = esData['$schema'];
	}
	for (const key of Object.keys(esData)) {
		if (key.startsWith('$')) continue;
		if (currentEnData[key] !== undefined) {
			orderedEnData[key] = extractStringValue(currentEnData[key], esData[key]);
		}
	}
	await fs.writeFile(EN_PATH, JSON.stringify(orderedEnData, null, 2), 'utf-8');
}

async function translateWithGateway({ systemPrompt, userPrompt, providerUrl, apiToken, model }) {
	const headers = {
		'Content-Type': 'application/json'
	};

	if (apiToken) {
		headers['Authorization'] = `Bearer ${apiToken}`;
	}
	if (process.env.HTTP_REFERER) {
		headers['HTTP-Referer'] = process.env.HTTP_REFERER;
	}
	if (process.env.X_TITLE) {
		headers['X-Title'] = process.env.X_TITLE;
	}

	const body = {
		model,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userPrompt }
		],
		temperature: 0.1
	};

	if (process.env.NO_JSON_MODE !== 'true') {
		body.response_format = { type: 'json_object' };
	}

	const response = await fetch(providerUrl, {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`AI Provider API error (${response.status}): ${errorText}`);
	}

	const result = await response.json();
	const content = result.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error(`Invalid response structure from AI Provider: ${JSON.stringify(result)}`);
	}
	return parseJsonResponse(content);
}

async function translateWithOllama({ systemPrompt, userPrompt, host, model }) {
	try {
		const response = await fetch(`${host}/api/chat`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt }
				],
				stream: false,
				format: 'json',
				options: {
					temperature: 0.1
				}
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Ollama API returned status ${response.status}: ${errorText}`);
		}

		const result = await response.json();
		const content = result.message.content;
		return parseJsonResponse(content);
	} catch (error) {
		console.error(`\n❌ Error connecting to Ollama at ${host}.`);
		console.error(`Please verify that:`);
		console.error(`  1. Ollama is running (try running 'ollama list' in your terminal).`);
		console.error(`  2. You have pulled the model (run 'ollama pull ${model}').\n`);
		throw error;
	}
}

main().catch((err) => {
	console.error('❌ Script failed:', err);
	process.exit(1);
});
