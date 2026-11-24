// Chẩn đoán sidebar: tái tạo renderSidebar với data thật, in các nút sinh ra
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

function extract(idName) {
  const start = '<script id="' + idName + '" type="application/json">';
  const a = html.indexOf(start); const b = a + start.length;
  const e = html.indexOf('</script>', b);
  return JSON.parse(html.slice(b, e));
}
const flat = extract('flatData');
const books = extract('booksData');

// stub DOM cực đơn giản, đủ để renderSidebar chạy
function makeEl(){
  const el = { innerHTML:'', children:[], className:'', addEventListener(){}, };
  el.insertAdjacentHTML = (p, h) => { el.innerHTML += h; el.children.push(h); };
  el.appendChild = (child) => { el.children.push(child); };
  return el;
}
global.document = {
  getElementById: (id) => {
    const el = makeEl();
    if (id==='flatData' || id==='booksData' || id==='md_0') el.textContent = id==='md_0' ? '### placeholder' : (id==='flatData'?JSON.stringify(flat):JSON.stringify(books));
    return el;
  },
  createElement: () => makeEl(),
};
global.window = {};
global.history = { replaceState(){} };
global.location = { hash: '' };

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// tái tạo component state
let current = 2; // giả sử đang mở chương 2
const sideNav = makeEl(); sideNav.children = [];
const searchInput = { value:'', };
function chapterLabel(item){ return item.num===null?'Giới thiệu / Mục lục':'Chương '+String(item.num).replace(/^0+/,''); }
function renderSidebar(filter){
  sideNav.innerHTML='';
  sideNav.children = [];
  books.forEach((book, bi)=>{
    let shown = [];
    book.chapters.forEach((c, ci)=>{
      const fit = flat.findIndex(f=>f.bi===bi && f.ci===ci);
      shown.push({idx:fit, num:c.num, title:c.title, show: !filter || c.title.toLowerCase().includes(filter)});
    });
    const labelHtml = `<div class="book-label ${bi>0?'top':''}">${escapeHtml(book.shortLabel)}</div>`;
    sideNav.insertAdjacentHTML('beforeend', labelHtml);
    shown.forEach(s=>{
      if(!s.show) return;
      const btn = makeEl();
      btn.className='chapter'+(current===s.idx?' active':'');
      btn.innerHTML = `<span class=num>${chapterLabel(s)}</span><span class=t>${s.title}</span>`;
      sideNav.appendChild(btn);
    });
  });
  const list = sideNav.children.filter(c => typeof c === 'string' ? !c.includes('book-label') : c.className && c.className.includes('chapter'));
  const texts = (sideNav.innerHTML.match(/<span class=[^>]*>[^<]*<\/span>/g)||[]);
  console.log('Tổng children (string/nút):', sideNav.children.length);
  console.log('Số nút chapter:', list.length);
  // in từng nút
  list.forEach((b, i) => console.log(`  [${i}] ${b.className} :: ${b.innerHTML.replace(/<[^>]+>/g,' | ')}`));
}
renderSidebar('');