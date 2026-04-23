import fs from 'node:fs/promises';
import path from 'node:path';

const MODEL = 'gpt-4o-mini';
const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');
const OUTPUT_PATH = path.join(ROOT, 'tmp-seeded-barriers.json');

function parseEnv(content) {
  const vars = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

const envContent = await fs.readFile(ENV_PATH, 'utf8');
const envVars = parseEnv(envContent);
const apiKey = envVars.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_OPENAI_API_KEY was not found in .env');
}

const schema = {
  type: 'array',
  minItems: 60,
  maxItems: 60,
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['lat', 'lng', 'type', 'severity', 'address', 'description'],
    properties: {
      lat: { type: 'number' },
      lng: { type: 'number' },
      type: { type: 'string', enum: ['broken_ramp', 'high_curb', 'closed_elevator', 'poor_surface', 'no_ramp'] },
      severity: { type: 'string', enum: ['low', 'medium', 'high'] },
      address: { type: 'string' },
      description: { type: 'string' },
    },
  },
};

const prompt = [
  'Generate exactly 60 realistic barrier reports in Baku, Azerbaijan.',
  'Spread them across districts: Nəsimi, Səbail, Xətai, Binəqədi, Suraxanı, Nizami, Pirəkəşkül.',
  'Use real-looking coordinates in the greater Baku region and vary the locations.',
  'Return only JSON, no markdown.',
  'description must be one concise Azerbaijani sentence.',
].join(' ');

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: MODEL,
    temperature: 0.7,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'seeded_barriers',
        strict: true,
        schema,
      },
    },
    messages: [
      { role: 'system', content: 'You generate structured JSON for accessibility datasets.' },
      { role: 'user', content: prompt },
    ],
  }),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`OpenAI API failed: ${response.status} ${text}`);
}

const data = await response.json();
const content = data?.choices?.[0]?.message?.content;
if (!content) {
  throw new Error('OpenAI response did not include content');
}

const parsed = JSON.parse(content);
if (!Array.isArray(parsed) || parsed.length !== 60) {
  throw new Error(`Expected 60 items, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}`);
}

await fs.writeFile(OUTPUT_PATH, JSON.stringify(parsed, null, 2), 'utf8');
console.log(`Wrote ${parsed.length} barriers to ${OUTPUT_PATH}`);
