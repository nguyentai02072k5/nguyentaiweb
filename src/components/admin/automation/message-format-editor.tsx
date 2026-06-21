'use client';

// Soạn nội dung tin nhắn: toolbar bọc tag format, chèn biến động, xem trước.
// Tag khớp parser worker (html-to-styles.js): b/i/u/s + red/orange/yellow/green + big/small.

import { useRef } from 'react';
import { FLOW_VARIABLES } from '@/lib/automation/flow-types';

const TOOLS: { tag: string; label: string; css?: React.CSSProperties }[] = [
  { tag: 'b', label: 'B', css: { fontWeight: 700 } },
  { tag: 'i', label: 'I', css: { fontStyle: 'italic' } },
  { tag: 'u', label: 'U', css: { textDecoration: 'underline' } },
  { tag: 's', label: 'S', css: { textDecoration: 'line-through' } },
  { tag: 'red', label: 'Đỏ', css: { color: '#db342e' } },
  { tag: 'orange', label: 'Cam', css: { color: '#f27806' } },
  { tag: 'yellow', label: 'Vàng', css: { color: '#b8860b' } },
  { tag: 'green', label: 'Lục', css: { color: '#15a85f' } },
  { tag: 'big', label: 'To' },
  { tag: 'small', label: 'Nhỏ' },
];

const OPEN: Record<string, string> = {
  b: '<strong>', i: '<em>', u: '<u>', s: '<s>',
  red: '<span style="color:#db342e">', orange: '<span style="color:#f27806">',
  yellow: '<span style="color:#b8860b">', green: '<span style="color:#15a85f">',
  big: '<span style="font-size:1.25em">', small: '<span style="font-size:0.85em">',
};
const CLOSE: Record<string, string> = {
  b: '</strong>', i: '</em>', u: '</u>', s: '</s>',
  red: '</span>', orange: '</span>', yellow: '</span>', green: '</span>',
  big: '</span>', small: '</span>',
};

function esc(c: string) {
  return c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c;
}

// Render preview an toàn: escape mọi ký tự, chỉ tag biết mới thành markup.
function renderPreview(input: string): string {
  let out = '';
  let i = 0;
  const re = /^<\s*(\/?)\s*([a-zA-Z]+)\s*>/;
  while (i < input.length) {
    const ch = input[i];
    if (ch === '<') {
      const m = input.slice(i).match(re);
      if (m && OPEN[m[2].toLowerCase()]) {
        const name = m[2].toLowerCase();
        out += m[1] === '/' ? CLOSE[name] : OPEN[name];
        i += m[0].length;
        continue;
      }
    }
    if (ch === '\n') out += '<br/>';
    else if (input.slice(i).match(/^\{\{\s*[\w.]+\s*\}\}/)) {
      const v = input.slice(i).match(/^\{\{\s*([\w.]+)\s*\}\}/)!;
      out += `<span style="background:#dbeafe;color:#1d4ed8;border-radius:4px;padding:0 4px">${v[1]}</span>`;
      i += v[0].length;
      continue;
    } else out += esc(ch);
    i++;
  }
  return out;
}

export function MessageFormatEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(tag: string) {
    const ta = ref.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = value.slice(s, e) || 'chữ';
    const next = value.slice(0, s) + `<${tag}>${sel}</${tag}>` + value.slice(e);
    onChange(next);
  }

  function insertVar(key: string) {
    const ta = ref.current;
    const pos = ta?.selectionStart ?? value.length;
    onChange(value.slice(0, pos) + `{{${key}}}` + value.slice(pos));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.tag}
            type="button"
            onClick={() => wrap(t.tag)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-100"
            style={t.css}
          >
            {t.label}
          </button>
        ))}
        <span className="mx-1 w-px self-stretch bg-gray-200" />
        {FLOW_VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => insertVar(v.key)}
            className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
            title={v.label}
          >
            {`{{${v.key}}}`}
          </button>
        ))}
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm"
        placeholder="Nội dung tin nhắn... bôi đen chữ rồi bấm nút format ở trên."
      />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
        <div className="mb-1 text-xs font-medium text-gray-400">Xem trước</div>
        <div dangerouslySetInnerHTML={{ __html: renderPreview(value) }} />
      </div>
    </div>
  );
}
