// Convert chuỗi "HTML-like" của người dùng → { text, styles[] } cho zca-js.
//
// zca-js KHÔNG nhận tag HTML. Nó nhận mảng styles = [{ start, len, st }] với
// st là TextStyle (offset tính theo UTF-16 code unit, khớp cách dùng .length).
//
// Tag hỗ trợ (mở/đóng, cho phép lồng nhau):
//   <b> <strong>   -> Bold
//   <i> <em>       -> Italic
//   <u>            -> Underline
//   <s> <del> <strike> -> StrikeThrough
//   <red> <orange> <yellow> <green> -> màu chữ
//   <small> <big>  -> cỡ chữ
// Tag lạ giữ nguyên như text thường (không phá nội dung).
// Lưu ý: emoji nằm ngoài vùng style nên offset hầu như không lệch; ký tự astral
// hiếm khi nằm trong vùng tô màu — chấp nhận sai số nhỏ ở MVP.

import { TextStyle } from "zca-js";

const TAG_MAP = {
  b: TextStyle.Bold,
  strong: TextStyle.Bold,
  i: TextStyle.Italic,
  em: TextStyle.Italic,
  u: TextStyle.Underline,
  s: TextStyle.StrikeThrough,
  del: TextStyle.StrikeThrough,
  strike: TextStyle.StrikeThrough,
  red: TextStyle.Red,
  orange: TextStyle.Orange,
  yellow: TextStyle.Yellow,
  green: TextStyle.Green,
  small: TextStyle.Small,
  big: TextStyle.Big,
};

const TAG_RE = /^<\s*(\/?)\s*([a-zA-Z]+)\s*>/;

export function htmlToStyles(input) {
  const styles = [];
  const stack = []; // { name, st, start }
  let out = "";
  let i = 0;

  while (i < input.length) {
    if (input[i] === "<") {
      const m = input.slice(i).match(TAG_RE);
      if (m) {
        const closing = m[1] === "/";
        const name = m[2].toLowerCase();
        const st = TAG_MAP[name];
        if (st !== undefined) {
          if (!closing) {
            stack.push({ name, st, start: out.length });
          } else {
            // Đóng phần tử mở gần nhất cùng tên.
            for (let k = stack.length - 1; k >= 0; k--) {
              if (stack[k].name === name) {
                const open = stack.splice(k, 1)[0];
                const len = out.length - open.start;
                if (len > 0) styles.push({ start: open.start, len, st: open.st });
                break;
              }
            }
          }
          i += m[0].length;
          continue;
        }
      }
    }
    out += input[i];
    i++;
  }

  // Tag chưa đóng → tô tới hết chuỗi.
  for (const open of stack) {
    const len = out.length - open.start;
    if (len > 0) styles.push({ start: open.start, len, st: open.st });
  }

  return { text: out, styles };
}
