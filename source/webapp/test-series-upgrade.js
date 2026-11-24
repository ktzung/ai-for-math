// Kiểm tra toàn chuỗi: cú pháp khối, quiz, widget, renderer có neo đề mục,
// và bản build tự chứa. Không thay thế QA trình duyệt cho tương tác.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(__dirname, 'template.html');
const LEARNING = path.join(__dirname, 'learning-tools.js');
const LAB_UPGRADE = path.join(__dirname, 'lab-upgrade.js');
const MATH_DIR = path.join(ROOT, '01_Sach_Toan');
const FLCL_DIR = path.join(ROOT, '02_FlCL_ML_CV');
const LEGAL = new Set(['goi-y', 'loi-giai', 'quiz', 'interactive']);

function chapterFiles(dir) {
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
    .map(name => ({ name, raw: fs.readFileSync(path.join(dir, name), 'utf8') }));
}
const chapters = [...chapterFiles(MATH_DIR), ...chapterFiles(FLCL_DIR)];
assert.equal(chapters.length, 50, 'hai mục lục + 48 chương');

const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;
for (const chapter of chapters) {
  assert.ok(!CJK.test(chapter.raw), `${chapter.name}: không lẫn ký tự CJK`);
}

function scanBlocks(raw) {
  const lines = raw.split(/\r?\n/);
  const blocks = [];
  const errors = [];
  let open = null;
  lines.forEach((line, index) => {
    const text = line.trim();
    if (!text.startsWith(':::')) return;
    if (text === ':::') {
      if (!open) errors.push(`dòng ${index + 1}: đóng khối nhưng chưa mở`);
      else {
        blocks.push({ type: open.type, arg: open.arg, content: lines.slice(open.line + 1, index) });
        open = null;
      }
      return;
    }
    const match = text.match(/^:::([a-z-]+)(?:\s+([a-z-]+))?$/);
    if (!match) { errors.push(`dòng ${index + 1}: cú pháp khối lạ`); return; }
    if (!LEGAL.has(match[1])) { errors.push(`dòng ${index + 1}: khối không hỗ trợ ${match[1]}`); return; }
    if (open) errors.push(`dòng ${index + 1}: khối ${open.type} chưa đóng trước ${match[1]}`);
    open = { type: match[1], arg: match[2] || null, line: index };
  });
  if (open) errors.push(`khối ${open.type} ở dòng ${open.line + 1} chưa đóng`);
  return { blocks, errors };
}

function parseQuiz(lines) {
  const nonEmpty = lines.map(line => line.trim()).filter(Boolean);
  const choices = nonEmpty.filter(line => /^[ABC]\.\s+/.test(line));
  const answers = nonEmpty.filter(line => /^Đáp án:\s*[ABC]$/.test(line));
  const explanations = nonEmpty.filter(line => /^Giải thích:\s*\S/.test(line));
  const question = nonEmpty.find(line => !/^[ABC]\.\s+/.test(line) && !/^Đáp án:/.test(line) && !/^Giải thích:/.test(line));
  return { question, choices, answers, explanations };
}

const perChapter = [];
let quizTotal = 0;
let detailTotal = 0;
let interactiveTotal = 0;
const interactiveTypes = new Set();
for (const chapter of chapters) {
  const { blocks, errors } = scanBlocks(chapter.raw);
  assert.deepEqual(errors, [], `${chapter.name}: khối Markdown cân đối`);
  for (const block of blocks) {
    if (block.type === 'quiz') {
      quizTotal++;
      const quiz = parseQuiz(block.content);
      assert.ok(quiz.question, `${chapter.name}: quiz có câu hỏi`);
      assert.equal(quiz.choices.length, 3, `${chapter.name}: quiz có đúng ba lựa chọn`);
      assert.deepEqual(quiz.choices.map(line => line[0]), ['A', 'B', 'C'], `${chapter.name}: lựa chọn A–C theo thứ tự`);
      assert.equal(quiz.answers.length, 1, `${chapter.name}: quiz có đúng một dòng đáp án`);
      assert.equal(quiz.explanations.length, 1, `${chapter.name}: quiz có giải thích`);
      const answer = quiz.answers[0].slice(-1);
      assert.ok(quiz.choices.some(line => line.startsWith(answer + '.')), `${chapter.name}: đáp án trỏ tới lựa chọn có thật`);
      assert.ok(quiz.choices.every(line => line.slice(3).trim()), `${chapter.name}: không có lựa chọn rỗng`);
    }
    if (block.type === 'goi-y' || block.type === 'loi-giai') {
      detailTotal++;
      assert.ok(block.content.join('\n').trim(), `${chapter.name}: khối ${block.type} có nội dung`);
    }
    if (block.type === 'interactive') {
      interactiveTotal++;
      assert.ok(block.arg, `${chapter.name}: khối tương tác có tên widget`);
      interactiveTypes.add(block.arg);
    }
  }
  perChapter.push({ name: chapter.name, blocks });
}

assert.equal(quizTotal, 48, '48 câu tự kiểm tra, mỗi chương một câu');
assert.equal(interactiveTotal, 48, '48 widget được gắn');
assert.equal(interactiveTypes.size, 48, 'mỗi chương một widget riêng, không lặp');

// Toàn bộ 48 chương giáo trình (trừ hai tệp mục lục) phải có phần đọc sâu.
const enriched = chapters.filter(chapter => /^Chuong_\d+_/.test(chapter.name));
assert.equal(enriched.length, 48, '48 chương đã có phần đọc sâu');
for (const chapter of enriched) {
  const types = new Set(perChapter.find(item => item.name === chapter.name).blocks.map(block => block.type));
  for (const required of ['quiz', 'goi-y', 'loi-giai', 'interactive']) {
    assert.ok(types.has(required), `${chapter.name}: có khối ${required}`);
  }
  assert.equal(perChapter.find(item => item.name === chapter.name).blocks.filter(block => block.type === 'interactive').length, 1, `${chapter.name}: đúng một lab tương tác`);
  assert.match(chapter.raw, /Đọc sâu/, `${chapter.name}: có phần đọc sâu`);
  for (const phrase of ['Tính tay', 'Phản ví dụ', 'Giới hạn']) {
    assert.match(chapter.raw, new RegExp(phrase), `${chapter.name}: đọc sâu có ${phrase}`);
  }
  assert.match(chapter.raw, /\*\*Đọc [^*]+:\*\*/, `${chapter.name}: có câu đọc công thức/quy tắc`);
  assert.match(chapter.raw, /^\|.*\|$/m, `${chapter.name}: đọc sâu có bảng tình huống`);
}

// Renderer thật, không dùng bản sao logic.
const template = fs.readFileSync(TEMPLATE, 'utf8');
const rendererSource = template.slice(template.indexOf('function escapeHtml'), template.indexOf('/* ===================== App state'));
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(LEARNING, 'utf8'), context);
vm.runInContext(fs.readFileSync(LAB_UPGRADE, 'utf8'), context);
vm.runInContext(rendererSource, context);
const definitions = JSON.parse(vm.runInContext('JSON.stringify(LearningTools.definitions)', context));
assert.deepEqual([...interactiveTypes].sort(), Object.keys(definitions).sort(), 'mọi widget có định nghĩa và mọi định nghĩa được dùng');
for (const chapter of chapters) {
  vm.runInContext('resetHeadingIds()', context);
  const html = vm.runInContext(`renderMarkdown(${JSON.stringify(chapter.raw)})`, context);
  const blocks = perChapter.find(item => item.name === chapter.name).blocks;
  const count = type => (html.match(new RegExp(`class="learning-${type}"`, 'g')) || []).length;
  assert.equal(count('quiz'), blocks.filter(block => block.type === 'quiz').length, `${chapter.name}: render đủ quiz`);
  assert.equal(count('detail'), blocks.filter(block => block.type === 'goi-y' || block.type === 'loi-giai').length, `${chapter.name}: render đủ gợi ý/lời giải`);
  assert.equal(count('experiment'), blocks.filter(block => block.type === 'interactive').length, `${chapter.name}: render đủ widget`);
  assert.ok(!html.replace(/<code>[\s\S]*?<\/code>/g, '').includes(':::'), `${chapter.name}: không còn dấu khối thô`);
  assert.ok(!html.includes('learning-warning'), `${chapter.name}: không có cảnh báo khối hỏng`);
  const ids = [...html.matchAll(/<h[1-4]\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${chapter.name}: id đề mục không trùng`);
  const headings = (html.match(/<h[23]\b[^>]*\bid="/g) || []).length;
  const toc = vm.runInContext(`collectToc(${JSON.stringify(html)})`, context);
  assert.equal(toc.length, headings, `${chapter.name}: mục lục thu đủ h2/h3 có neo`);
}
const c3 = chapters.find(chapter => chapter.name.startsWith('Chuong_03_'));
const c3html = vm.runInContext(`renderMarkdown(${JSON.stringify(c3.raw)})`, context);
const tocHTML = vm.runInContext(`readingToolsHTML(collectToc(${JSON.stringify(c3html)}),{book:'Sách Toán',minutes:7})`, context);
assert.match(tocHTML, /data-toc="[^"]+"/, 'mục lục có nút điều hướng');
assert.match(tocHTML, /Mục lục trong bài · \d+ mục/, 'mục lục hiển thị số mục');
assert.match(rendererSource, /<ol'\+\(firstNumber===1\?'':' start="'\+firstNumber/ , 'giữ số bắt đầu danh sách');

// Các phép tính widget mặc định.
const parameters = type => JSON.parse(vm.runInContext(`JSON.stringify(LearningTools.defaults(${JSON.stringify(type)}))`, context));
const calculate = (type, params) => vm.runInContext(`LearningTools.calculate(${JSON.stringify(type)},${JSON.stringify(params)})`, context);
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} vs ${expected}`);
for (const type of Object.keys(definitions)) {
  const result = calculate(type, parameters(type));
  assert.ok(result && typeof result === 'object', `${type}: tính được kết quả mặc định`);
  const markup = vm.runInContext(`LearningTools.html(${JSON.stringify(type)})`, context);
  assert.ok(markup.includes(`data-experiment="${type}"`), `${type}: sinh đúng khung lab`);
  for (const control of definitions[type].controls) {
    const key = Array.isArray(control) ? control[0] : control.key;
    assert.ok(markup.includes(`data-param="${key}"`), `${type}: có điều khiển ${key}`);
  }
  assert.ok(!markup.includes('undefined'), `${type}: markup không lộ undefined`);
  const rendered = JSON.parse(vm.runInContext(`JSON.stringify((() => {
    const p=${JSON.stringify(parameters(type))};
    const r=LearningTools.calculate(${JSON.stringify(type)},p);
    const d=LearningTools.describe(${JSON.stringify(type)},p,r,0);
    return {values:d[0],observation:d[1],svg:LearningTools.plot(${JSON.stringify(type)},p,r)};
  })())`, context));
  assert.ok(rendered.values.length >= 2, `${type}: có ít nhất hai dòng kết quả`);
  assert.ok(rendered.values.every(([, value]) => value !== undefined && value !== null), `${type}: kết quả có giá trị`);
  assert.ok(rendered.observation && rendered.observation.length > 40, `${type}: có quan sát giải thích`);
  assert.match(rendered.svg, /<svg[\s\S]*<\/svg>/, `${type}: có hình SVG`);
  assert.ok(!/undefined|NaN/.test(rendered.svg), `${type}: hình không lộ undefined/NaN`);
}

// Sáu lab trọng tâm phải có prediction gate, đúng đáp án, và trạng thái kéo ẩn.
const predictions = {matrix:'double',gradient:'closer',metrics:'recall-up',conv:'eight',attention:'positive',fedavg:'three'};
for (const [type,correct] of Object.entries(predictions)) {
  const prediction = definitions[type].prediction;
  assert.ok(prediction, `${type}: có prediction`);
  assert.equal(prediction.correct, correct, `${type}: đáp án prediction đúng`);
  assert.equal(prediction.options.length, 3, `${type}: prediction có ba lựa chọn`);
  assert.ok(prediction.explain.length > 30, `${type}: prediction có giải thích`);
  const hit = JSON.parse(vm.runInContext(`JSON.stringify(LearningTools.predictionResult(${JSON.stringify(type)},${JSON.stringify(correct)}))`, context));
  assert.equal(hit.correct, true, `${type}: chấm đúng đáp án`);
  const miss = JSON.parse(vm.runInContext(`JSON.stringify(LearningTools.predictionResult(${JSON.stringify(type)},'khong-dung'))`, context));
  assert.equal(miss.correct, false, `${type}: chấm sai đáp án`);
  assert.ok(miss.answer.length > 0, `${type}: hiện đáp án đúng khi chọn sai`);
  assert.ok(vm.runInContext(`LearningTools.html(${JSON.stringify(type)})`, context).includes('data-stage hidden'), `${type}: stage bị ẩn trước khi dự đoán`);
}
const flagship = ['matrix','gradient','metrics','conv','attention','fedavg','forgetting','dp'];
for (const type of flagship) {
  assert.ok(definitions[type].challenge, `${type}: có thử thách thao tác`);
  assert.ok(definitions[type].errors.length >= 2, `${type}: có bảo tàng lỗi`);
}
assert.equal(JSON.parse(vm.runInContext("JSON.stringify(LearningTools.defaults('matrix'))", context)).vx, 1, 'matrix: có vx mặc định');
assert.equal(JSON.parse(vm.runInContext("JSON.stringify(LearningTools.defaults('matrix'))", context)).vy, 1, 'matrix: có vy mặc định');
const convDefaults = JSON.parse(vm.runInContext("JSON.stringify(LearningTools.defaults('conv'))", context));
assert.deepEqual([convDefaults.kx, convDefaults.ky], [0, 0], 'conv: cửa sổ kernel bắt đầu ở góc');
const convResult = calculate('conv', convDefaults);
const convOut = Math.floor((convDefaults.size + 2 * convDefaults.padding - convDefaults.kernel) / convDefaults.stride) + 1;
assert.equal(convResult.out, convOut, 'conv: cạnh feature map đúng công thức');
assert.equal(convResult.map.length, convOut, 'conv: bản đồ đúng số hàng');
assert.equal(convResult.maps.length, convDefaults.channels, 'conv: đủ số kênh cho volume 3D');
assert.equal(convResult.params, (convDefaults.kernel ** 2 + 1) * convDefaults.channels, 'conv: tham số tính theo một kênh vào');
const matrixResult = calculate('matrix', JSON.parse(vm.runInContext("JSON.stringify(LearningTools.defaults('matrix'))", context)));
near(matrixResult.area, 1.55, 'matrix: |det| mặc định');
assert.equal(matrixResult.eigen.length, 2, 'matrix: có hai phương thực');
const diagonal = JSON.parse(vm.runInContext("JSON.stringify(LearningTools.calculate('matrix',{a:2,b:0,c:0,d:1,vx:1,vy:1}))", context));
assert.deepEqual(diagonal.eigen.map(e => [Math.abs(Math.round(e.ex)), Math.abs(Math.round(e.ey))]).sort(), [[0,1],[1,0]], 'matrix: eigenvector của ma trận chéo là hai trục');
assert.ok(vm.runInContext("LearningTools.plot('matrix',LearningTools.defaults('matrix'),LearningTools.calculate('matrix',LearningTools.defaults('matrix')))", context).includes('data-handle="vector"'), 'matrix: có điểm kéo vector');
assert.ok(vm.runInContext("LearningTools.plot('gradient',LearningTools.defaults('gradient'),LearningTools.calculate('gradient',LearningTools.defaults('gradient')))", context).includes('data-handle="gradient"'), 'gradient: có điểm kéo trên đường cong');
assert.ok(vm.runInContext("LearningTools.plot('conv',LearningTools.defaults('conv'),LearningTools.calculate('conv',LearningTools.defaults('conv')))", context).includes('data-volume="3d"'), 'conv: có volume 3D');

const c18 = chapters.find(chapter => chapter.name.startsWith('Chuong_18_'));
assert.ok(c18, 'có chương 18');
assert.ok(!/tính lại tay/i.test(c18.raw), 'C18: không còn chỗ giữ chỗ tính tay');
assert.match(c18.raw, /7\s+7\s+10/, 'C18: hàng đầu của feature map đúng');
assert.match(c18.raw, /8\s+8\s+8/, 'C18: hàng giữa của feature map đúng');
assert.match(c18.raw, /13\s+11\s+9/, 'C18: hàng cuối của feature map đúng');
near(calculate('fedavg', parameters('fedavg')).average, 2.275, 'FedAvg mặc định');
near(calculate('attention', parameters('attention')).a, 1 / (1 + Math.exp(-1 / Math.SQRT2)), 'attention mặc định');
near(calculate('gradient', parameters('gradient')).next, 0.6, 'gradient mặc định');
near(calculate('metrics', parameters('metrics')).f1, 0.8732394366197183, 'F1 mặc định theo ngưỡng 50');
near(calculate('bayes', parameters('bayes')).posterior, 90 / 585, 'Bayes mặc định');
const split = calculate('split', parameters('split'));
assert.deepEqual([split.train, split.validation, split.test], [700, 150, 150], 'chia ba tập mặc định');
const cost = calculate('cost', parameters('cost'));
assert.deepEqual([cost.roundMB, cost.totalGB], [200, 20], 'chi phí mặc định');

// Bản build: đủ 50 khối, không còn placeholder, nhúng CSS/JS.
for (const name of ['index.html', 'vector.html']) {
  const built = fs.readFileSync(path.join(__dirname, name), 'utf8');
  assert.equal((built.match(/<script id="md_\d+" type="text\/plain">/g) || []).length, 50, `${name}: đủ 50 khối nội dung`);
  assert.ok(!/\/\*__(?!INITIAL_ROUTE__)[A-Z_]+__\*\//.test(built), `${name}: không còn placeholder build`);
  if (name === 'vector.html') assert.ok(!built.includes('__INITIAL_ROUTE__'), 'vector.html đã đặt tuyến ban đầu');
  assert.equal((built.match(/<script>([\s\S]*?)<\/script>/g) || []).length, 1, `${name}: một script ứng dụng`);
  assert.ok(built.includes('const LearningTools'), `${name}: nhúng learning-tools.js`);
  assert.ok(built.includes('.learning-experiment'), `${name}: nhúng learning-tools.css`);
  assert.ok(built.includes('const VectorLesson'), `${name}: nhúng bài mẫu vector`);
  assert.equal((built.match(/^:::interactive/gm) || []).length, 48, `${name}: đủ 48 widget`);
  new vm.Script([...built.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
}

console.log(`PASS: 50 mục, ${quizTotal} quiz, ${detailTotal} khối gợi ý/lời giải, ${interactiveTotal} widget, renderer có id/mục lục, build tự chứa.`);
