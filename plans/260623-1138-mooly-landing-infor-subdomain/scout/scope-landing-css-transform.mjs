/**
 * One-off: trích <style> từ mooly-landing.html, prefix #mooly-lp cho mọi selector
 * (flat — chạy mọi browser, không dùng CSS nesting). Bỏ qua @keyframes inner.
 * Output: src/app/landing/landing-styles.ts (export const LANDING_CSS).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SCOPE = '#mooly-lp';
const html = readFileSync('mooly-landing.html', 'utf8');
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if (!m) { console.error('no <style>'); process.exit(1); }
// Strip CSS comments (tránh dấu phẩy/braces trong comment phá parser; comment vô hại khi bỏ).
const css = m[1].replace(/\/\*[\s\S]*?\*\//g, '');

let i = 0;
function readBalanced() { // đọc tới khi đóng } cân bằng (depth về 0), trả nội dung (không gồm } cuối)
  let depth = 1, s = '';
  while (i < css.length) {
    const c = css[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; return s; } }
    s += c; i++;
  }
  return s;
}
function prefixSelector(sel) {
  return sel.split(',').map((raw) => {
    const p = raw.trim();
    if (!p) return raw;
    if (p === '*') return `${SCOPE} *`;
    if (p === ':root' || p === 'html' || p === 'body') return SCOPE;
    if (p.startsWith(SCOPE)) return p;
    return `${SCOPE} ${p}`;
  }).join(',');
}
function parse(insideAtMedia) {
  let buf = '', out = '';
  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') {
      const sel = buf.trim(); buf = ''; i++;
      if (/^@(keyframes|font-face|page)/.test(sel)) {
        const body = readBalanced();
        out += `${sel}{${body}}`;
      } else if (/^@(media|supports)/.test(sel)) {
        i; // already past {
        out += `${sel}{${parse(true)}}`;
      } else {
        const decl = readBalanced();
        out += `${prefixSelector(sel)}{${decl}}`;
      }
    } else if (ch === '}') {
      i++;
      if (buf.trim()) out += buf;
      return out; // kết thúc khối @media
    } else { buf += ch; i++; }
  }
  if (buf.trim()) out += buf;
  return out;
}
const scoped = parse(false).trim();
const escaped = scoped.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const ts = `/* AUTO-GENERATED từ mooly-landing.html <style>, đã prefix ${SCOPE}.\n   Đừng sửa tay — chỉnh nguồn HTML rồi chạy lại scope-landing-css-transform.mjs.\n   CSS giữ NGUYÊN văn (keyframes/vars/@media) — chỉ thêm scope để né globals. */\nexport const LANDING_CSS = \`${escaped}\`;\n`;
writeFileSync('src/app/landing/landing-styles.ts', ts);
console.log('rules scoped. output bytes:', ts.length);
console.log('--- HEAD ---\n' + scoped.slice(0, 500));
console.log('--- TAIL ---\n' + scoped.slice(-400));
