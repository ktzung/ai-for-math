// build.js — Gói toàn bộ tài liệu markdown vào một app web tự chứa (index.html)
// Cách chạy:  node build.js
// Phong cách ước đoán: theme kem nhạt, sidebar lộ trình, nội dung lesson trung tâm.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'webapp');
const OUT_HTML = path.join(OUT, 'index.html');

// ---------------------------------------------------------------------------
// 1. Thu thập danh sách chương theo thứ tự tự nhiên
// ---------------------------------------------------------------------------
function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => naturalCmp(a, b))
    .map(f => ({ file: f, abs: path.join(dir, f) }));
}

function naturalCmp(a, b) {
  const pa = a.match(/\d+/g) || [];
  const pb = b.match(/\d+/g) || [];
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ? +pa[i] : 0;
    const nb = pb[i] ? +pb[i] : 0;
    if (na !== nb) return na - nb;
  }
  return a.localeCompare(b);
}

// Tách số chương từ tên chuỗi (eg: Chuong_02, Chuong_14, 00_LoTrinh)
function chapterNum(file) {
  const m = file.match(/^(?:Chuong_|)(\d+)/);
  return m ? +m[1] : null;
}

const sachToanDir = path.join(ROOT, '01_Sach_Toan');
const flclDir    = path.join(ROOT, '02_FlCL_ML_CV');

// metadata (title trình bày) lấy từ dòng H1 đầu tiên của mỗi file nếu có, ko thì từ tên file
function readChapter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw;
}

function titleFromContent(raw, fallback) {
  const m = raw.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  return fallback;
}

function buildBook(dir, fullTitle, shortLabel) {
  const files = listMd(dir);
  return {
    fullTitle,
    shortLabel,
    chapters: files.map(f => {
      const raw = readChapter(f.abs);
      const fallback = f.file.replace(/\.md$/, '').replace(/[_-]+/g, ' ');
      return {
        file: f.file,
        num: chapterNum(f.file),
        title: chapterNum(f.file) === 0 ? 'Giới thiệu & lộ trình' : titleFromContent(raw, fallback),
        md: raw,
      };
    }),
  };
}

const books = [
  buildBook(sachToanDir, 'Từ Trực Giác Đến Thuật Toán — Sách toán nền tảng', 'Sách Toán'),
  buildBook(flclDir, 'Học Liên Kết & Học Liên Tục cho Thị Giác Máy Tính — Lộ trình 9 giai đoạn', 'FL / CL · CV'),
];

// ---------------------------------------------------------------------------
// 2. Serialize dữ liệu an toàn vào <script type="text/plain"> (không escape lộn xộn)
// ---------------------------------------------------------------------------
// Ta dùng các khối <script id="md_i" type="text/plain"> và đặt theo thứ tự flat,
// để tránh lỗi do ký tự đặc biệt trong JSON. Sidebar referencing index.
const flat = [];
books.forEach((book, bi) => {
  book.chapters.forEach((ch, ci) => {
    flat.push({ bi, ci, file: ch.file, num: ch.num, title: ch.title });
  });
});

let scripts = '';
flat.forEach((item, i) => {
  const md = books[item.bi].chapters[item.ci].md;
  // Để an toàn với '</script>' trong nội dung, thay thế thành '&lt;/script&gt;' sẽ bị render sai.
  // Cách chuẩn: escape các `</script` thành `<\/script`.
  const safe = md.replace(/<\/script/gi, '<\\/script');
  scripts += `\n<script id="md_${i}" type="text/plain">${safe}</script>`;
});

const flatJson = JSON.stringify(flat);
const booksJson = JSON.stringify(books.map(b => ({ fullTitle: b.fullTitle, shortLabel: b.shortLabel, chapters: b.chapters.map(c => ({ file: c.file, num: c.num, title: c.title })) })));

// ---------------------------------------------------------------------------
// 3. Đọc template
// ---------------------------------------------------------------------------
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

const manifestPath = path.join(OUT, 'audio', 'manifest.json');
const voiceData = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf8') : '{}';

const out = template
  .replace('/*__FLAT__*/', () => flatJson)
  .replace('/*__BOOKS__*/', () => booksJson)
  .replace('/*__MD_SCRIPTS__*/', () => scripts)
  .replace('/*__VOICE_DATA__*/', () => voiceData.replace(/<\/script/gi, '<\\/script'))
  .replace('/*__VECTOR_CSS__*/', () => fs.readFileSync(path.join(__dirname, 'vector-lesson.css'), 'utf8'))
  .replace('/*__VECTOR_JS__*/', () => fs.readFileSync(path.join(__dirname, 'vector-lesson.js'), 'utf8'))
  .replace('/*__LEARNING_CSS__*/', () => fs.readFileSync(path.join(__dirname, 'learning-tools.css'), 'utf8'))
  .replace('/*__LEARNING_JS__*/', () => fs.readFileSync(path.join(__dirname, 'learning-tools.js'), 'utf8'))
  .replace('/*__LAB_UPGRADE_JS__*/', () => fs.readFileSync(path.join(__dirname, 'lab-upgrade.js'), 'utf8'))
  .replace('/*__VOICE_CSS__*/', () => fs.readFileSync(path.join(__dirname, 'voice-player.css'), 'utf8'))
  .replace('/*__VOICE_JS__*/', () => fs.readFileSync(path.join(__dirname, 'voice-player.js'), 'utf8'));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(OUT_HTML, out, 'utf8');
// A direct, offline entry point for the pilot, sharing the same built application.
const pilotHTML = out.replace('/*__INITIAL_ROUTE__*/', () => "if (!location.hash) history.replaceState(null, '', '#/vector-lab');");
fs.writeFileSync(path.join(OUT, 'vector.html'), pilotHTML, 'utf8');
console.log('Đã sinh', OUT_HTML, '—', fs.statSync(OUT_HTML).size, 'bytes,', flat.length, 'chapters');
