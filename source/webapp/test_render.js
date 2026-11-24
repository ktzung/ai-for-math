// Test nhanh logic renderer (bản sao gọn của renderMarkdown trong template.html)
const fs = require('fs');
const raw = fs.readFileSync(__dirname + '/template.html', 'utf8');
// trích hàm renderMarkdown bằng cách bắt đầu từ "function escapeHtml" đến "/* ===================== App state"
const start = raw.indexOf('function escapeHtml');
const end = raw.indexOf('/* ===================== App state =====================');
let code = raw.slice(start, end);
code = code.replace(/module\.exports[\s\S]*$/, '');
// gom hàm: gán vào global trước, rồi export
eval(code + '\n;globalThis.renderMarkdown = renderMarkdown;');

const sample = `
# Chương 1 — Tư duy toán

> Câu hỏi lớn: *công thức "khô khan" thì thầm gì?*

## 2. Trực giác trước

Một **vector** là *danh sách* số có \`x\`, \`y\`.

- Mục A
- Mục B

1. Bước một
2. Bước hai

| Ký hiệu | Đọc là | Nghĩa |
|---|---|---|
| \`Σ\` | xích-ma | cộng dồn |
| \`→\` | ánh xạ | đưa ra |

\`\`\`python
for i in range(3):
    print(i)
\`\`\`

\`\`\`
[ A ] -> [ B ]
    \\\\
     -> [ C ]
\`\`\`

---

Kết thúc.
`;
const html = renderMarkdown(sample);
console.log(html.slice(0, 900));
console.log('\n...\n[LENGTH]', html.length);

// các danh hiệu cần có
const checks = [
  [/<h1\b/, 'heading 1'],
  [/<h2\b/, 'heading 2'],
  [/<blockquote>/, 'block quote'],
  [/<strong>/, 'bold'],
  [/<em>/, 'italic'],
  [/<code>Σ<\/code>/, 'inline code'],
  [/<ul>/, 'ul'],
  [/<ol>/, 'ol'],
  [/<table>/, 'table'],
  [/<pre>/, 'code fence/ascii'],
  [/<hr>/, 'hr'],
];
checks.forEach(([pattern, name]) => {
  console.log((pattern.test(html) ? 'OK  ' : 'FAIL') + '  ' + name);
});