// Dependency-free checks against the shipped script, not copies of its logic.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const vectorSource = fs.readFileSync(path.join(__dirname, 'vector-lesson.js'), 'utf8');
const executable = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.equal(executable.length, 1, 'build has exactly one executable application script');
new vm.Script(executable[0]);
new vm.Script(vectorSource);
assert.ok(!/\/\*__(?:VECTOR_CSS|VECTOR_JS|FLAT|BOOKS|MD_SCRIPTS)__\*\//.test(html), 'no unresolved build markers');
assert.ok(html.includes(vectorSource), 'pilot JS is embedded verbatim for offline use');
assert.ok(html.includes(fs.readFileSync(path.join(__dirname, 'vector-lesson.css'), 'utf8')), 'pilot CSS is embedded');

const math = vm.createContext({});
vm.runInContext(vectorSource, math);
function calculate(a, b, angle) { return vm.runInContext(`VectorLesson.compute(${a},${b},${angle})`, math); }
function near(actual, expected, message) { assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} vs ${expected}`); }
const same = calculate(5, 10, 0);
assert.equal(same.normA, 5);
assert.equal(same.normB, 10);
assert.equal(same.dot, 50);
assert.equal(same.cosine, 1);
near(calculate(1, Math.sqrt(200), 45).dot, 10, 'counterexample dot');
near(calculate(1, Math.sqrt(200), 45).cosine, 1 / Math.sqrt(2), 'counterexample cosine');
near(calculate(5, 10, 90).dot, 0, 'orthogonal dot');
near(calculate(5, 10, 90).cosine, 0, 'orthogonal cosine');
assert.equal(calculate(5, 10, 180).dot, -50);
assert.equal(calculate(5, 10, 180).cosine, -1);
for (const lengths of [[0, 10], [5, 0], [0, 0]]) {
  const result = calculate(...lengths, 73);
  assert.equal(result.dot, 0, 'zero vector has a defined zero dot');
  assert.equal(result.cosine, null, 'zero vector cosine is undefined');
  assert.equal(result.angle, null, 'zero vector angle is undefined');
}
near(calculate(5, 30, 37).dot, 3 * calculate(5, 10, 37).dot, 'positive scaling changes dot');
assert.equal(calculate(5, 30, 37).cosine, calculate(5, 10, 37).cosine, 'positive scaling preserves cosine');

const renderer = template.slice(template.indexOf('function escapeHtml'), template.indexOf('/* ===================== App state'));
vm.runInContext(renderer, math);
const render = markdown => vm.runInContext(`renderMarkdown(${JSON.stringify(markdown)})`, math);
assert.match(render('4. First\n5. Second'), /<ol start="4"><li>First<\/li><li>Second<\/li><\/ol>/);
assert.match(render('7. Seventh\n8. Eighth'), /<ol start="7">/);
assert.match(render('1. One\n2. Two'), /<ol><li>One/);
assert.match(render('```python\nprint("<hello>")\n```'), /&lt;hello&gt;/);

// Small DOM adapter: executes actual event handlers and route/render code.
// Layout, focus trapping, native form validation and SVG appearance are browser QA.
const ids = new Map();
function element(id = '') {
  const classes = new Set();
  const el = {
    id, textContent: '', value: '', disabled: false, dataset: {}, attributes: {}, listeners: {}, children: [],
    classList: { contains: c => classes.has(c), add: c => classes.add(c), remove: c => classes.delete(c), toggle(c, force) { const add = force === undefined ? !classes.has(c) : force; if (add) classes.add(c); else classes.delete(c); return add; } },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    addEventListener(k, handler) { this.listeners[k] = handler; },
    appendChild(child) { this.children.push(child); },
    insertAdjacentHTML() {},
    focus() {}, scrollIntoView() {},
    querySelector(selector) { if (selector.startsWith('#')) return ids.get(selector.slice(1)); if (selector.includes(':checked')) return this.selected || null; return null; },
    querySelectorAll(selector) { return this.collections?.[selector] || []; },
  };
  let markup = '';
  Object.defineProperty(el, 'innerHTML', {
    get: () => markup,
    set(value) {
      markup = value;
      this.children = [];
      this.collections = {};
      if (id !== 'lesson') return;
      for (const [key] of ids) if (key.startsWith('lab-') || key.startsWith('flip')) ids.delete(key);
      for (const match of value.matchAll(/\bid="([^"]+)"/g)) ids.set(match[1], element(match[1]));
      for (const attribute of ['preset', 'section']) {
        this.collections[`[data-${attribute}]`] = [...value.matchAll(new RegExp(`data-${attribute}="([^"]+)"`, 'g'))].map(m => {
          const button = element(); button.dataset[attribute] = m[1]; return button;
        });
      }
    },
  });
  return el;
}
for (const match of html.matchAll(/\bid="([^"]+)"/g)) if (!ids.has(match[1])) ids.set(match[1], element(match[1]));
for (const match of html.matchAll(/<script id="([^"]+)"[^>]*>([\s\S]*?)<\/script>/g)) ids.get(match[1]).textContent = match[2];
const flat = JSON.parse(ids.get('flatData').textContent);
assert.equal(flat.length, 50, 'old numeric routes retain all 50 entries');
assert.equal(flat[3].file, 'Chuong_03_Dai_so_tuyen_tinh_vector_ma_tran.md');
assert.equal(flat[49].file, 'Chuong_39_G9_Bao_cao_tai_lap_du_an_cuoi.md');
const location = { hash: '#/0' };
const windowListeners = {};
const media = { matches: false, addEventListener() {} };
const storage = new Map();
const doc = { getElementById: id => ids.get(id) || null, createElement: () => element(), body: element('body'), addEventListener() {}, title: '' };
const app = vm.createContext({
  document: doc, location,
  history: { pushState(_state, _title, url) { location.hash = url; } },
  window: { matchMedia: () => media, scrollTo() {}, addEventListener(type, listener) { windowListeners[type] = listener; } },
  localStorage: { getItem: k => storage.get(k) ?? null, setItem(k, value) { storage.set(k, value); } },
});
vm.runInContext(executable[0], app);
const run = source => vm.runInContext(source, app);
const click = id => { const el = ids.get(id); assert.ok(el, `element ${id} exists`); assert.equal(el.disabled, false, `${id} is enabled`); el.listeners.click({ preventDefault() {} }); };
assert.equal(ids.get('btnPrev').disabled, true);
assert.equal(ids.get('btnNext').disabled, false);
run('open(3)');
assert.equal(location.hash, '#/3');
assert.equal(ids.get('btnPrev').disabled, false, 'C3 previous button updates after navigation');
assert.match(ids.get('lesson').innerHTML, /<div class="content">/);
assert.match(ids.get('lesson').innerHTML, /<ol start="4">/);
run('open(49)');
assert.equal(ids.get('btnNext').disabled, true, 'last old chapter disables next');
location.hash = '#/1'; windowListeners.popstate();
assert.equal(run('current'), 1, 'browser back updates current lesson');
location.hash = '#/not-a-number'; windowListeners.hashchange();
assert.equal(run('current'), 0, 'invalid hash has a safe fallback');
location.hash = '#/3garbage'; windowListeners.hashchange();
assert.equal(run('readRoute()'), 0, 'numeric prefix is not mistaken for a route');
for (let i = 0; i < 50; i++) { location.hash = '#/' + i; assert.equal(run('readRoute()'), i); }

location.hash = '#/vector-lab'; windowListeners.hashchange();
assert.equal(location.hash, '#/vector-lab');
assert.equal(ids.get('lab-dot').textContent, '50');
assert.equal(ids.get('lab-cosine').textContent, '1');
assert.equal(run('neighbor(-1)'), 3);
assert.equal(run('neighbor(1)'), 4);
const presets = ids.get('lesson').querySelectorAll('[data-preset]');
presets.find(button => button.dataset.preset === 'zero').listeners.click();
assert.equal(ids.get('lab-cosine').textContent, 'Không xác định');
assert.equal(ids.get('lab-angle').disabled, true);
assert.equal(ids.get('lab-dot').textContent, '0');
click('lab-reset');
assert.equal(ids.get('lab-dot').textContent, '50');
assert.equal(ids.get('lab-angle').disabled, false);
ids.get('lab-angle').value = '90';
ids.get('lab-angle').listeners.input({ target: { value: '90' } });
assert.equal(ids.get('lab-dot').textContent, '0');
assert.equal(ids.get('lab-cosine').textContent, '0');
click('btnFlip');
assert.match(ids.get('lesson').innerHTML, /id="flipPrev"/);
assert.equal(ids.get('lab-cosine').textContent, '0', 'widget state survives flip mode');
click('btnFlip');
assert.equal(ids.get('lab-cosine').textContent, '0', 'widget mounts after leaving flip mode');
ids.get('lesson').selected = { value: 'dot' };
ids.get('lab-quiz-form').listeners.submit({ preventDefault() {} });
assert.match(ids.get('lab-feedback').textContent, /Chưa đúng/);
ids.get('lesson').selected = { value: 'cosine' };
ids.get('lab-quiz-form').listeners.submit({ preventDefault() {} });
assert.match(ids.get('lab-feedback').textContent, /^Đúng/);
click('lab-complete');
assert.equal(storage.get('math-vector-read'), '1');
click('btnPrev');
assert.equal(location.hash, '#/3', 'pilot previous returns to C3');
location.hash = '#/vector-lab'; windowListeners.hashchange();
assert.equal(ids.get('lab-complete').attributes['aria-pressed'], 'true', 'read status persists');
click('btnNext');
assert.equal(location.hash, '#/4', 'pilot next advances to C4');
assert.equal(run('normalizeSearch("Độ lớn và hướng")'), 'do lon va huong');
run('renderSidebar("nonexistent-search-token-6c1f")');
assert.match(ids.get('sideNav').innerHTML, /Chưa tìm thấy/);
run('renderSidebar("cosine")');
const c3Button = ids.get('sideNav').children.find(el => el.innerHTML.includes(flat[3].title));
assert.ok(c3Button, 'full-text search finds cosine inside C3');
assert.match(c3Button.innerHTML, /class="num">3<\/span>/, 'search retains chapter number');

// Reading tools on an enriched chapter: TOC, widget, quiz, completion, resume.
run('open(8)');
const chapter8 = ids.get('lesson').innerHTML;
assert.match(chapter8, /class="reading-toc"/, 'chapter has in-article TOC');
assert.match(chapter8, /data-toc="[^"]+"/, 'TOC has navigation buttons');
assert.match(chapter8, /data-experiment="gradient"/, 'gradient widget is rendered');
assert.match(chapter8, /class="learning-quiz"/, 'quiz is rendered');
assert.match(chapter8, /id="readingComplete"/, 'completion control is rendered');
assert.equal(ids.get('readingProgress').textContent, '0');
click('readingComplete');
const savedProgress = JSON.parse(storage.get('math-reader-progress-v1'));
assert.ok(savedProgress.completed['#/8'] > 0, 'completion persists by route');
assert.equal(ids.get('readingProgress').textContent, '1', 'sidebar counter updates');
assert.equal(ids.get('readingComplete').attributes['aria-pressed'], 'true');
assert.equal(ids.get('readingStatus').textContent, 'Đã đánh dấu đã đọc');
run('open(9)');
assert.equal(JSON.parse(storage.get('math-reader-progress-v1')).last.route, '#/9', 'last read chapter saved');
assert.equal(ids.get('readingResume').hidden, true, 'resume hides on the chapter just read');
run("readerProgress.last={route:'#/8',scroll:0,title:flat[8].title,at:1};refreshResume()");
assert.equal(ids.get('readingResume').hidden, false, 'resume returns for a different chapter');
assert.match(ids.get('readingResume').textContent, /Đọc tiếp:/);
click('readingResume');
assert.equal(run('current'), 8, 'resume returns to saved chapter');
assert.equal(location.hash, '#/8');
assert.equal(ids.get('readingComplete').attributes['aria-pressed'], 'true', 'completion survives navigation');
click('readingComplete');
assert.equal(JSON.parse(storage.get('math-reader-progress-v1')).completed['#/8'], undefined, 'completion can be removed');
assert.equal(ids.get('readingProgress').textContent, '0');

const fakeFeedback = { dataset: {}, textContent: '', innerHTML: '' };
const fakeForm = {
  dataset: { answer: 'B' }, selected: { value: 'C' }, listeners: {},
  addEventListener(type, handler) { this.listeners[type] = handler; },
  querySelector(selector) {
    if (selector === '.learning-feedback') return fakeFeedback;
    if (selector.includes(':checked')) return this.selected;
    if (selector === 'template.quiz-explanation') return { innerHTML: 'Vì lý do X.' };
    return null;
  },
};
vm.runInContext('mountQuizzes', app)({ querySelectorAll: selector => selector === 'form.learning-quiz' ? [fakeForm] : [] });
fakeForm.listeners.submit({ preventDefault() {} });
assert.match(fakeFeedback.innerHTML, /Chưa đúng/);
assert.equal(fakeFeedback.dataset.state, 'wrong');
fakeForm.selected = { value: 'B' };
fakeForm.listeners.submit({ preventDefault() {} });
assert.match(fakeFeedback.innerHTML, /^<strong>Đúng/);
assert.equal(fakeFeedback.dataset.state, 'correct');
console.log('PASS: vector math, zero state, reset, quiz, flip remount, progress, renderer, 50 old routes, sample route, search and embedded build.');
console.log('PASS: TOC, widget markup, quiz feedback, chapter completion and resume persistence.');
