// Driver for the markdown-render-speed entry: reads every case from
// /input/cases.json (or MAKEFUN_INPUT_DIR), renders each one alone with
// parse() from parse.js, and writes /output/html.json (or MAKEFUN_OUTPUT_DIR)
// as a JSON array of the HTML strings, one per case and in the cases' order.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from './parse.js';

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const raw = readFileSync(join(inputDir, 'cases.json'), 'utf8');
const cases = JSON.parse(raw);
const html = new Array(cases.length);
for (let i = 0; i < cases.length; i++) html[i] = parse(cases[i].markdown);
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'html.json'), JSON.stringify(html));
