const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');

const mdBlocks = html.match(/<script id="md_(\d+)" type="text\/plain">/g) || [];
console.log('md blocks:', mdBlocks.length);
console.log('placeholder __FLAT__ còn?', html.includes('__FLAT__'));
console.log('placeholder __BOOKS__ còn?', html.includes('__BOOKS__'));
console.log('placeholder __MD_SCRIPTS__ còn?', html.includes('__MD_SCRIPTS__'));

function extractJson(idName) {
  const startTag = '<script id="' + idName + '" type="application/json">';
  const a = html.indexOf(startTag);
  if (a < 0) return null;
  const b = a + startTag.length;
  const end = html.indexOf('</script>', b);
  if (end < 0) return null;
  return html.slice(b, end);
}

try {
  const flat = JSON.parse(extractJson('flatData'));
  console.log('flatJson OK, entries:', flat.length);
} catch (e) { console.log('FLAT JSON LỖI:', e.message); }

try {
  const books = JSON.parse(extractJson('booksData'));
  console.log('booksJson OK, books:', books.length, '; chapter mục:', books[0].chapters.length, '/', books[1].chapters.length);
} catch (e) { console.log('BOOKS JSON LỖI:', e.message); }

// kiểm nội dung có </script> thật (có thể phá vỡ DOM)
const bad = html.match(/<script id="md_\d+" type="text\/plain">[\s\S]*?<\/script>/g);
const fakeEnd = bad ? bad.filter(b => /<\\\/script/i.test(b)).length : 0;
console.log('blocks có </script> đã escape (dự kiến bằng số block nếu file chứa) :', fakeEnd);

// kiểm một khối md_0 lấy được (chương đầu sách toán)
const m0 = html.match(/<script id="md_0" type="text\/plain">([\s\S]*?)<\/script>/);
console.log('md_0 có nội dung?', m0 ? m0[1].length : 'KHÔNG', ' chars.');