/**
 * One-off: trích markup <body> của mooly-landing.html VERBATIM (bỏ <script> — sẽ
 * reimplement trong landing-interactions.tsx). Output: src/app/landing/landing-markup.ts.
 * Inject qua dangerouslySetInnerHTML → giữ 100% fidelity, né convert HTML→JSX.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('mooly-landing.html', 'utf8');
const m = html.match(/<body>([\s\S]*?)<\/body>/);
if (!m) { console.error('no <body>'); process.exit(1); }
let body = m[1];
// Bỏ mọi <script>...</script> (logic chuyển sang React client component).
body = body.replace(/<script>[\s\S]*?<\/script>/g, '');
// Bỏ comment HTML cho gọn.
body = body.replace(/<!--[\s\S]*?-->/g, '');
body = body.trim();

const escaped = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const ts = `/* AUTO-GENERATED từ mooly-landing.html <body> (đã bỏ <script>).\n   Markup VERBATIM — inject qua dangerouslySetInnerHTML để pixel-match.\n   Chỉnh nguồn HTML rồi chạy lại extract-landing-markup-transform.mjs. */\nexport const LANDING_HTML = \`${escaped}\`;\n`;
writeFileSync('src/app/landing/landing-markup.ts', ts);
console.log('markup bytes:', body.length);
console.log('has <script>?', /<script/.test(body));
console.log('has leadForm?', /id="leadForm"/.test(body));
console.log('has mqTrack?', /id="mqTrack"/.test(body));
console.log('sections:', (body.match(/<section/g) || []).length);
