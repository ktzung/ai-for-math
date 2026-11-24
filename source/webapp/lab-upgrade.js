/* Năm lab flagship nâng cấp: ngưỡng, attention, FedAvg, quên, DP.
   Phần này mở rộng LearningTools bằng hook calculate/describe/plot/bind. */
(function () {
  const D = LearningTools.definitions;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const num = value => Number.isFinite(value)
    ? Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 3 })
    : 'Không xác định';
  const pct = value => Number.isFinite(value) ? num(100 * value) + '%' : 'Không xác định';
  const safe = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const svg = (content, description, width, height) =>
    `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe(description)}">${content}</svg>`;
  const heat = value => {
    const v = clamp(value, 0, 1);
    return `hsl(${Math.round(36 - 30 * v)} 58% ${Math.round(94 - 42 * v)}%)`;
  };
  const pointInView = (svgEl, event, width, height) => {
    const rect = svgEl.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / (rect.width || 1) * width,
      y: (event.clientY - rect.top) / (rect.height || 1) * height,
    };
  };

  Object.assign(D, {
    metrics: {
      title: 'Kéo ngưỡng, thấy precision–recall đánh đổi',
      prompt: 'Kéo vạch ngưỡng trên biểu đồ. Hai nhóm điểm nguy cơ chồng lấn; hạ ngưỡng bắt thêm ca dương nhưng cũng thêm báo nhầm.',
      controls: [
        ['threshold', 'Ngưỡng quyết định', 0, 100, 1, 50],
        ['separation', 'Mức tách hai nhóm', 0, 3, 0.1, 1.5],
        ['prevalence', 'Tỉ lệ ca dương (%)', 5, 50, 1, 20],
      ],
      prediction: {
        question: 'Hạ ngưỡng để báo dương nhiều hơn thường làm gì với recall và precision?',
        options: [['recall-up', 'Recall tăng, precision thường giảm'], ['both-up', 'Cả hai cùng tăng'], ['same', 'Cả hai không đổi']],
        correct: 'recall-up',
        explain: 'Hạ ngưỡng nhận thêm nhiều ca vào lớp dương: bắt được thêm ca bệnh (recall tăng) nhưng cũng thêm báo nhầm (precision thường giảm). Đây là đánh đổi, không phải lỗi cài đặt.',
      },
      challenge: {
        goal: 'Đặt ngưỡng để recall ≥ 0,80 và precision ≥ 0,70 cùng lúc.',
        check: (_p, r) => r.recall >= 0.8 && r.precision >= 0.7,
      },
      errors: [
        { label: 'Ngưỡng quá thấp', params: { threshold: 5 }, explain: 'Gần như mọi ca bị báo dương: recall cao nhưng precision sụp vì có rất nhiều FP. Accuracy có thể vẫn trông ổn nếu lớp âm đông.' },
        { label: 'Ngưỡng quá cao', params: { threshold: 95 }, explain: 'Hầu như không báo dương: precision có thể đẹp nhưng recall gần 0, bỏ sót phần lớn ca bệnh. Một chỉ số đẹp không đủ.' },
        { label: 'Lớp dương rất hiếm', params: { prevalence: 5, separation: 0.4, threshold: 50 }, explain: 'Khi lớp dương hiếm, accuracy cao có thể chỉ nhờ đoán âm. Phải đọc confusion matrix và recall của lớp cần phát hiện.' },
      ],
      calculate(p) {
        const n = 200, positives = Math.max(1, Math.round(n * p.prevalence / 100)), negatives = n - positives;
        const posScores = [], negScores = [];
        for (let i = 0; i < positives; i++) posScores.push(clamp(Math.round(45 + p.separation * 14 + 22 * Math.sin(i * 2.399963)), 0, 100));
        for (let i = 0; i < negatives; i++) negScores.push(clamp(Math.round(45 - p.separation * 14 + 22 * Math.sin(i * 1.618034 + 1)), 0, 100));
        const threshold = Math.round(p.threshold);
        let tp = 0, fp = 0, fn = 0, tn = 0;
        posScores.forEach(score => score >= threshold ? tp++ : fn++);
        negScores.forEach(score => score >= threshold ? fp++ : tn++);
        const precision = tp + fp ? tp / (tp + fp) : null;
        const recall = tp + fn ? tp / (tp + fn) : null;
        const accuracy = (tp + tn) / n;
        const f1 = 2 * tp + fp + fn ? 2 * tp / (2 * tp + fp + fn) : null;
        return { threshold, tp, fp, fn, tn, positives, negatives, precision, recall, accuracy, f1, posScores, negScores };
      },
      describe(p, r) {
        return [
          [['TP / FP', `${r.tp} / ${r.fp}`], ['FN / TN', `${r.fn} / ${r.tn}`], ['Precision', pct(r.precision)], ['Recall', pct(r.recall)], ['Accuracy', pct(r.accuracy)], ['F1', pct(r.f1)]],
          `Ngưỡng ${r.threshold}: ${r.tp} ca dương được bắt, ${r.fp} báo nhầm, ${r.fn} bỏ sót. Precision = TP/(TP+FP); recall = TP/(TP+FN). Hạ ngưỡng thường đổi recall lấy precision; accuracy một mình không cho biết đang bỏ sót ai.`,
        ];
      },
      plot(p, r, ghost) {
        const W = 420, H = 360, x0 = 34, x1 = 342, y0 = 42, y1 = 206;
        const bin = values => { const out = Array(10).fill(0); values.forEach(v => out[Math.min(9, Math.floor(v / 10))]++); return out; };
        const pos = bin(r.posScores), neg = bin(r.negScores), max = Math.max(1, ...pos, ...neg), width = (x1 - x0) / 10;
        const bars = (values, color) => values.map((count, i) => {
          const h = count / max * (y1 - y0), x = x0 + i * width, y = y1 - h;
          return `<rect x="${x + 1}" y="${y}" width="${Math.max(1, width - 2)}" height="${h}" fill="${color}" opacity=".72"><title>Điểm ${i * 10}–${i * 10 + 9}: ${count} ca</title></rect>`;
        }).join('');
        const tx = x0 + (x1 - x0) * r.threshold / 100;
        const gx = ghost ? x0 + (x1 - x0) * ghost.threshold / 100 : null;
        const cell = (x, y, w, h, label, value, color) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="#fff" stroke-width="2"/><text x="${x + 10}" y="${y + 18}" font-size="11" fill="#544b40">${label}</text><text x="${x + w - 10}" y="${y + 18}" text-anchor="end" font-size="14" font-weight="700" fill="#332d26">${value}</text>`;
        return svg(`
          <text x="14" y="20" font-size="12" fill="#6f675d">Phân bố điểm nguy cơ · 200 ca · kéo vạch ngưỡng</text>
          <line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#a89c8b"/>
          <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="#a89c8b"/>
          ${bars(neg, '#1f6f5f')}${bars(pos, '#ad542f')}
          ${gx != null ? `<line x1="${gx}" y1="${y0}" x2="${gx}" y2="${y1}" stroke="#9a8f82" stroke-dasharray="4 3"/>` : ''}
          <line x1="${tx}" y1="${y0}" x2="${tx}" y2="${y1}" stroke="#9e7a31" stroke-width="2"/>
          <circle data-handle="threshold" cx="${tx}" cy="${y0}" r="9" fill="#9e7a31" stroke="#fff" stroke-width="2.5" style="cursor:grab"/>
          <text x="${x0}" y="${H - 122}" font-size="10" fill="#6f675d">0</text><text x="${x1 - 14}" y="${H - 122}" font-size="10" fill="#6f675d">100</text>
          <rect x="14" y="222" width="10" height="10" fill="#1f6f5f" opacity=".72"/><text x="29" y="231" font-size="10" fill="#6f675d">âm thật</text>
          <rect x="90" y="222" width="10" height="10" fill="#ad542f" opacity=".72"/><text x="105" y="231" font-size="10" fill="#6f675d">dương thật</text>
          <text x="14" y="252" font-size="12" fill="#6f675d">Ma trận nhầm lẫn tại ngưỡng ${r.threshold}</text>
          ${cell(14, 264, 190, 30, 'TP · bắt đúng', r.tp, '#dfe9dd')}${cell(204, 264, 190, 30, 'FN · bỏ sót', r.fn, '#f3e3da')}
          ${cell(14, 294, 190, 30, 'FP · báo nhầm', r.fp, '#f3e3da')}${cell(204, 294, 190, 30, 'TN · đúng', r.tn, '#dfe9dd')}
          <text x="14" y="344" font-size="11" fill="#6f675d">precision ${pct(r.precision)} · recall ${pct(r.recall)} · accuracy ${pct(r.accuracy)}</text>
        `, 'Phân bố điểm nguy cơ, ngưỡng quyết định và confusion matrix', W, H);
      },
      bind({ visual, params, update, noteInteraction }) {
        let active = false;
        const move = event => {
          const svgEl = visual.querySelector('svg');
          if (!svgEl) return;
          const p = pointInView(svgEl, event, 420, 360);
          if (p.x < 34 || p.x > 342) return;
          params.threshold = Math.round(clamp((p.x - 34) / 308 * 100, 0, 100));
          update();
        };
        visual.addEventListener('pointerdown', event => {
          const handle = event.target.closest && event.target.closest('[data-handle="threshold"]');
          if (!handle) return;
          active = true; noteInteraction(); event.preventDefault(); move(event);
        });
        window.addEventListener('pointermove', event => { if (active) move(event); });
        window.addEventListener('pointerup', () => { active = false; });
        visual.addEventListener('keydown', event => {
          if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
          noteInteraction(); event.preventDefault();
          params.threshold = clamp(params.threshold + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 5 : 1), 0, 100);
          update();
        });
      },
    },

    attention: {
      title: 'Softmax biến điểm thô thành trọng số tương đối',
      prompt: 'Hai query, hai key. Đổi dot thô, nhiệt độ và bật mask để thấy cùng một raw dot 0 vẫn có thể nhận trọng số dương — và mask đổi toàn bộ phân bổ.',
      controls: [
        ['s1', 'Raw dot với key 1', -8, 8, 0.5, 1],
        ['s2', 'Raw dot với key 2', -8, 8, 0.5, 0],
        ['dk', 'Số chiều key dₖ', 1, 64, 1, 2],
        ['temp', 'Nhiệt độ T', 0.1, 2, 0.1, 1],
        { key: 'mask', label: 'Mask causal cho query đầu', type: 'toggle', value: false },
      ],
      prediction: {
        question: 'Raw dot với key 2 bằng 0 sau khi chia √dₖ. Trọng số softmax của key 2 sẽ thế nào?',
        options: [['positive', 'Có thể vẫn lớn hơn 0'], ['zero', 'Luôn bằng 0'], ['one', 'Luôn bằng 1']],
        correct: 'positive',
        explain: 'Softmax so sánh các logit, không biến điểm 0 thành trọng số 0. Nếu key 1 có logit nhỏ hơn, key 2 vẫn có thể nhận trọng số dương.',
      },
      challenge: {
        goal: 'Làm hai trọng số của query đầu gần nhau: mỗi trọng số nằm trong khoảng 0,45–0,55 và mask tắt.',
        check: (p, r) => !p.mask && r.rows[0].every(value => value >= 0.45 && value <= 0.55),
      },
      errors: [
        { label: 'Nhiệt độ quá thấp', params: { temp: 0.1 }, explain: 'Chia cho T rất nhỏ làm logit phóng đại; softmax bão hòa gần 0/1. Trọng số gần như chọn một key dù raw dot chỉ hơn kém nhẹ.' },
        { label: 'Bật mask nhưng quên', params: { mask: true }, explain: 'Mask causal chặn key tương lai ở query đầu: trọng số key 2 bằng 0 do mask, không phải vì raw dot bằng 0. Cần phân biệt mask với softmax.' },
        { label: 'Tưởng dot 0 là không chú ý', params: { s1: -1, s2: 0 }, explain: 'Key 2 có raw dot 0 vẫn nhận trọng số dương vì key 1 còn thấp hơn. Softmax chuẩn hóa tương đối trong hàng.' },
      ],
      calculate(p) {
        const scale = Math.sqrt(Math.max(1, p.dk)) * Math.max(0.01, p.temp);
        const logits = [p.s1 / scale, p.s2 / scale];
        const softmax = values => {
          const max = Math.max(...values), exps = values.map(value => Math.exp(value - max)), total = exps.reduce((a, b) => a + b, 0);
          return exps.map(value => value / total);
        };
        const base = softmax(logits);
        const first = p.mask ? [1, 0] : base;
        const second = softmax([logits[1], logits[0]]);
        const rows = [first, second];
        const entropy = row => {
          const value = -row.reduce((sum, item) => sum + (item > 0 ? item * Math.log(item) : 0), 0);
          return Math.abs(value) < 1e-12 ? 0 : value;
        };
        return { l1: logits[0], l2: logits[1], a: first[0], b: first[1], rows, entropy1: entropy(first), entropy2: entropy(second) };
      },
      describe(p, r) {
        const row = values => `(${pct(values[0])}; ${pct(values[1])})`;
        return [
          [['Logit sau scaling', `(${num(r.l1)}; ${num(r.l2)})`], ['Query 1', row(r.rows[0])], ['Query 2', row(r.rows[1])], ['Entropy query 1', num(r.entropy1)]],
          `Mỗi hàng softmax có tổng 1. ${p.mask ? 'Mask causal đặt trọng số key 2 của query 1 bằng 0 bằng mask, không phải bằng raw dot.' : 'Không mask: cả hai key đều có thể nhận trọng số dương.'} Raw dot 0 chỉ là một logit; trọng số phụ thuộc các logit còn lại và nhiệt độ T.`,
        ];
      },
      plot(p, r, ghost) {
        const W = 360, H = 300, labels = ['key 1', 'key 2'], rowLabels = ['query 1', 'query 2'];
        const cells = r.rows.map((row, i) => row.map((value, j) => {
          const x = 96 + j * 104, y = 74 + i * 84;
          return `<rect x="${x}" y="${y}" width="100" height="80" rx="5" fill="${heat(value)}" stroke="#fff" stroke-width="2"><title>${rowLabels[i]} → ${labels[j]}: ${pct(value)}</title></rect><text x="${x + 50}" y="${y + 46}" text-anchor="middle" font-size="18" font-weight="700" fill="#332d26">${pct(value)}</text>`;
        }).join('')).join('');
        const ghostNote = ghost && ghost.rows ? ` · trước đó query 1 = (${pct(ghost.rows[0][0])}; ${pct(ghost.rows[0][1])})` : '';
        return svg(`
          <text x="14" y="20" font-size="12" fill="#6f675d">Trọng số attention theo hàng · T = ${num(p.temp)} · ${p.mask ? 'có mask' : 'không mask'}</text>
          <text x="146" y="52" text-anchor="middle" font-size="11" fill="#6f675d">key 1</text><text x="250" y="52" text-anchor="middle" font-size="11" fill="#6f675d">key 2</text>
          <text x="18" y="120" font-size="11" fill="#6f675d">query 1</text><text x="18" y="204" font-size="11" fill="#6f675d">query 2</text>
          ${cells}
          <text x="14" y="266" font-size="11" fill="#6f675d">Đậm hơn = trọng số lớn hơn. Mỗi hàng cộng lại bằng 1.</text>
          <text x="14" y="284" font-size="10" fill="#8d8274">${safe(ghostNote)}</text>
        `, 'Heatmap trọng số attention cho hai query và hai key', W, H);
      },
    },

    fedavg: {
      title: 'Gộp có trọng số theo số mẫu, không phải bình quân đều',
      prompt: 'Kéo hai điểm tham số local trên trục số. Xem trọng số theo số mẫu kéo điểm gộp về phía client nào; bật non-IID để nhớ rằng công thức gộp không sửa được dữ liệu lệch.',
      controls: [
        ['na', 'Số mẫu client A', 0, 1000, 10, 100],
        ['nb', 'Số mẫu client B', 0, 1000, 10, 300],
        ['wa', 'Tham số sau local train · A', -5, 5, 0.1, 2.5],
        ['wb', 'Tham số sau local train · B', -5, 5, 0.1, 2.2],
        { key: 'noniid', label: 'Dữ liệu client lệch nhau (non-IID)', type: 'toggle', value: false },
      ],
      prediction: {
        question: 'Client A có 100 mẫu, client B có 300 mẫu. Trong FedAvg theo số mẫu, tiếng nói của B so với A là:',
        options: [['three', 'Gấp ba lần'], ['equal', 'Bằng nhau'], ['third', 'Một phần ba']],
        correct: 'three',
        explain: 'Trọng số tỉ lệ với số mẫu: 300/400 so với 100/400, tức B có trọng số gấp ba A. Điều này không nói B có mô hình local tốt hơn.',
      },
      challenge: {
        goal: 'Đặt số mẫu để client B chiếm ít nhất 80% trọng số gộp.',
        check: (_p, r) => r.alphaB >= 0.8,
      },
      errors: [
        { label: 'Bình quân đều hai client', params: { na: 100, nb: 300, wa: 2.5, wb: 2.2 }, explain: 'Trung bình đều cho 2,35; FedAvg theo mẫu cho 2,275. Bỏ trọng số mẫu là đổi công thức, không phải một lựa chọn trung lập.' },
        { label: 'Client không có mẫu', params: { na: 0, nb: 300 }, explain: 'Client 0 mẫu không được đóng góp trọng số. Nếu code chia cho tổng mẫu mà không kiểm tra, cần xử lý trường hợp tổng bằng 0.' },
        { label: 'Non-IID nhưng tin công thức', params: { noniid: true, na: 100, nb: 900, wa: 3.8, wb: -2.5 }, explain: 'Công thức gộp vẫn đúng số học, nhưng tham số local đến từ dữ liệu lệch. Weighted average không bảo đảm mô hình chung tốt cho mọi client.' },
      ],
      calculate(p) {
        const n = p.na + p.nb, alphaA = n ? p.na / n : null, alphaB = n ? p.nb / n : null;
        const average = n ? (p.na * p.wa + p.nb * p.wb) / n : null;
        return { n, alphaA, alphaB, average, unweighted: (p.wa + p.wb) / 2, wa: p.wa, wb: p.wb, noniid: p.noniid };
      },
      describe(p, r) {
        return [
          [['Trọng số A', pct(r.alphaA)], ['Trọng số B', pct(r.alphaB)], ['FedAvg', num(r.average)], ['Bình quân đều', num(r.unweighted)]],
          r.n ? `w = (${p.na} × ${num(p.wa)} + ${p.nb} × ${num(p.wb)}) / ${r.n} = ${num(r.average)}. Bình quân đều sẽ cho ${num(r.unweighted)}; chênh lệch ${num(r.average - r.unweighted)}. ${p.noniid ? 'Non-IID làm các tham số local khác nhau, nhưng không đổi công thức gộp theo mẫu.' : 'Cùng dữ liệu IID, trọng số theo mẫu vẫn là lựa chọn mặc định của FedAvg.'}` : 'Tổng số mẫu bằng 0: không thực hiện phép gộp. Client không có mẫu không đóng góp trọng số.',
        ];
      },
      plot(p, r, ghost) {
        const W = 420, H = 330, x0 = 42, x1 = 380;
        const x = value => x0 + (value + 5) / 10 * (x1 - x0);
        const total = Math.max(1, p.na + p.nb), wa = p.na / total * (x1 - x0), wb = p.nb / total * (x1 - x0);
        const handleAttr = handle => handle ? ` data-handle="${handle}"` : '';
        const marker = (value, y, color, label, handle, shape) => shape === 'diamond'
          ? `<polygon${handleAttr(handle)} points="${x(value)},${y - 10} ${x(value) + 10},${y} ${x(value)},${y + 10} ${x(value) - 10},${y}" fill="${color}" stroke="#fff" stroke-width="2" style="cursor:grab"><title>${safe(label)}</title></polygon>`
          : `<circle${handleAttr(handle)} cx="${x(value)}" cy="${y}" r="9" fill="${color}" stroke="#fff" stroke-width="2.5" style="cursor:grab"><title>${safe(label)}</title></circle>`;
        const ghostNote = ghost ? `<text x="14" y="318" font-size="10" fill="#8d8274">Mốc A: FedAvg ${num(ghost.average)} · bình quân đều ${num(ghost.unweighted)}</text>` : '';
        return svg(`
          <text x="14" y="20" font-size="12" fill="#6f675d">Mẫu dữ liệu tại hai client</text>
          <rect x="${x0}" y="34" width="${wa}" height="26" fill="#1f6f5f" opacity=".72"><title>Client A: ${p.na} mẫu</title></rect>
          <rect x="${x0 + wa}" y="34" width="${wb}" height="26" fill="#ad542f" opacity=".72"><title>Client B: ${p.nb} mẫu</title></rect>
          <text x="${x0 + 6}" y="52" font-size="10" fill="#fff">A · ${p.na}</text><text x="${x0 + wa + 6}" y="52" font-size="10" fill="#fff">B · ${p.nb}</text>
          <line x1="${x0}" y1="112" x2="${x1}" y2="112" stroke="#a89c8b"/><line x1="${x0}" y1="172" x2="${x1}" y2="172" stroke="#a89c8b"/>
          <text x="${x0}" y="104" font-size="10" fill="#6f675d">−5</text><text x="${x1 - 10}" y="104" font-size="10" fill="#6f675d">5</text>
          ${marker(r.wa, 112, '#1f6f5f', 'Tham số local A', 'fedavg-a')}
          ${marker(r.wb, 172, '#ad542f', 'Tham số local B', 'fedavg-b')}
          <text x="${x(r.wa) + 14}" y="108" font-size="11" fill="#1f6f5f">A = ${num(r.wa)}</text>
          <text x="${x(r.wb) + 14}" y="168" font-size="11" fill="#ad542f">B = ${num(r.wb)}</text>
          <line x1="${x0}" y1="234" x2="${x1}" y2="234" stroke="#a89c8b"/>
          ${r.average != null ? marker(r.average, 234, '#9e7a31', 'FedAvg có trọng số', null, 'diamond') : ''}
          ${r.average != null ? `<text x="${x(r.average) + 14}" y="230" font-size="11" fill="#9e7a31">FedAvg = ${num(r.average)}</text>` : ''}
          <circle cx="${x(r.unweighted)}" cy="234" r="7" fill="#fff" stroke="#6f675d" stroke-width="2"/><text x="${x(r.unweighted) - 52}" y="258" font-size="10" fill="#6f675d">bình quân đều ${num(r.unweighted)}</text>
          <text x="14" y="286" font-size="10" fill="#6f675d">Kéo điểm A hoặc B trên trục để thay tham số local.</text>
          ${ghostNote}
        `, 'Trục số tham số local A, B, trung bình FedAvg và bình quân đều', W, H);
      },
      bind({ visual, params, update, noteInteraction }) {
        let active = null;
        const move = event => {
          const svgEl = visual.querySelector('svg');
          if (!svgEl) return;
          const p = pointInView(svgEl, event, 420, 330);
          if (p.x < 42 || p.x > 380) return;
          const value = Math.round(clamp((p.x - 42) / 338 * 10 - 5, -5, 5) * 10) / 10;
          if (active === 'a') params.wa = value; else params.wb = value;
          update();
        };
        visual.addEventListener('pointerdown', event => {
          const handle = event.target.closest && event.target.closest('[data-handle]');
          if (!handle || !/fedavg-/.test(handle.dataset.handle)) return;
          active = handle.dataset.handle === 'fedavg-a' ? 'a' : 'b';
          noteInteraction(); event.preventDefault(); move(event);
        });
        window.addEventListener('pointermove', event => { if (active) move(event); });
        window.addEventListener('pointerup', () => { active = null; });
      },
    },

    forgetting: {
      title: 'Forgetting nằm ở task cũ, không nằm ở điểm trung bình',
      prompt: 'Đổi điểm task cũ trước/sau và thêm replay. Theo dõi mức quên trên task cũ; điểm trung bình có thể che mất một cú rơi lớn.',
      controls: [
        ['before', 'Task cũ · trước (%)', 0, 100, 1, 90],
        ['old', 'Task cũ · sau, không replay (%)', 0, 100, 1, 65],
        ['fresh', 'Task mới · sau (%)', 0, 100, 1, 85],
        ['replay', 'Tỉ lệ replay (%)', 0, 100, 5, 0],
      ],
      prediction: {
        question: 'Thêm replay phục hồi một phần điểm task cũ. Forgetting đo được sẽ thay đổi thế nào?',
        options: [['down', 'Giảm'], ['up', 'Tăng'], ['same', 'Không đổi']],
        correct: 'down',
        explain: 'Forgetting = điểm trước − điểm sau trên task cũ. Nếu replay nâng điểm sau, khoảng giảm nhỏ lại; điểm task mới không thay thế phép đo trên task cũ.',
      },
      challenge: {
        goal: 'Đưa forgetting xuống ≤ 10 điểm % trong khi dùng replay ≤ 30%.',
        check: (p, r) => r.drop <= 10 && p.replay <= 30,
      },
      errors: [
        { label: 'Trung bình đẹp, quên nặng', params: { before: 90, old: 40, fresh: 95, replay: 0 }, explain: 'Trung bình hai task 67,5% nghe tạm được, nhưng task cũ rơi 50 điểm. Một con số trung bình không thay thế việc đo từng task.' },
        { label: 'Replay quá ít', params: { before: 90, old: 55, fresh: 90, replay: 10 }, explain: 'Replay 10% chỉ phục hồi một phần; forgetting vẫn còn lớn. Replay buffer nhỏ không phải bảo hiểm tuyệt đối.' },
        { label: 'Chỉ nhìn task mới', params: { before: 90, old: 30, fresh: 98, replay: 0 }, explain: 'Task mới 98% rất tốt nhưng task cũ mất 60 điểm. Plasticity cao có thể đi cùng stability thấp; phải báo cả hai.' },
      ],
      calculate(p) {
        const replay = clamp(p.replay, 0, 100) / 100;
        const effectiveOld = clamp(p.old + (p.before - p.old) * replay, 0, 100);
        return { effectiveOld, drop: p.before - effectiveOld, average: (effectiveOld + p.fresh) / 2, retention: p.before ? effectiveOld / p.before : null, recovery: effectiveOld - p.old };
      },
      describe(p, r) {
        return [
          [['Task cũ sau replay', num(r.effectiveOld) + '%'], ['Forgetting', num(r.drop) + ' điểm %'], ['Retention', pct(r.retention)], ['Trung bình hai task', num(r.average) + '%']],
          `Forgetting = ${p.before} − ${num(r.effectiveOld)} = ${num(r.drop)} điểm %. Replay ${p.replay}% phục hồi ${num(r.recovery)} điểm trên task cũ. ${r.drop > 15 ? 'Mức quên còn lớn; đường trung bình có thể che mất.' : 'Mức quên đã giảm, nhưng vẫn cần đọc cả điểm task mới và chi phí bộ nhớ.'}`,
        ];
      },
      plot(p, r, ghost) {
        const W = 420, H = 330, x0 = 38, x1 = 390;
        const x = value => x0 + value / 100 * (x1 - x0);
        const row = (y, label, value, color) => `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#d8d0c2"/><text x="14" y="${y + 4}" font-size="10" fill="#6f675d">${label}</text><circle cx="${x(value)}" cy="${y}" r="8" fill="${color}" stroke="#fff" stroke-width="2"/><text x="${clamp(x(value) + 12, 120, 350)}" y="${y - 10}" font-size="10" fill="${color}">${num(value)}%</text>`;
        const ghostLine = ghost ? `<line x1="${x(ghost.effectiveOld)}" y1="70" x2="${x(ghost.effectiveOld)}" y2="168" stroke="#9a8f82" stroke-dasharray="4 3"/>` : '';
        return svg(`
          <text x="14" y="22" font-size="12" fill="#6f675d">Dòng thời gian đánh giá hai task</text>
          ${row(82, 'cũ · trước', p.before, '#7a8b63')}
          ${row(122, 'cũ · sau', r.effectiveOld, '#1f6f5f')}
          ${row(162, 'mới · sau', p.fresh, '#ad542f')}
          ${ghostLine}
          <path d="M${x(r.effectiveOld)} 94 V110" stroke="#ad542f" stroke-width="2" marker-end="url(#arrow-forgetting)"/><defs><marker id="arrow-forgetting" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="#ad542f"/></marker></defs>
          <text x="${x(r.effectiveOld) + 8}" y="108" font-size="10" fill="#ad542f">quên ${num(r.drop)}</text>
          <text x="14" y="206" font-size="12" fill="#6f675d">Bảng điểm theo task</text>
          <rect x="14" y="218" width="190" height="28" fill="#eef2e9" stroke="#fff"/><text x="22" y="237" font-size="11">Task cũ trước · ${p.before}%</text>
          <rect x="204" y="218" width="190" height="28" fill="#dfe9dd" stroke="#fff"/><text x="212" y="237" font-size="11">Task cũ sau · ${num(r.effectiveOld)}%</text>
          <rect x="14" y="246" width="190" height="28" fill="#faf8f3" stroke="#fff"/><text x="22" y="265" font-size="11">Task mới · ${p.fresh}%</text>
          <rect x="204" y="246" width="190" height="28" fill="#f3e3da" stroke="#fff"/><text x="212" y="265" font-size="11">Forgetting · ${num(r.drop)} điểm</text>
          <text x="14" y="300" font-size="11" fill="#6f675d">Replay ${p.replay}% · phục hồi ${num(r.recovery)} điểm · retention ${pct(r.retention)}</text>
        `, 'Dòng thời gian điểm task cũ và task mới cùng bảng forgetting', W, H);
      },
    },

    dp: {
      title: 'Đường đánh đổi privacy–utility của nhiễu DP',
      prompt: 'Kéo điểm ε trên đường utility. Giảm ε để riêng tư hơn: σ tăng, nhiễu mỗi client tăng và utility giảm. Đổi clipping và số vòng để thấy ngân sách cộng dồn.',
      controls: [
        ['epsilon', 'Epsilon ε mỗi vòng', 0.1, 10, 0.1, 1],
        ['clip', 'Ngưỡng clipping C', 0.1, 5, 0.1, 1],
        ['clients', 'Số client', 10, 1000, 10, 100],
        ['rounds', 'Số vòng huấn luyện', 1, 50, 1, 1],
      ],
      prediction: {
        question: 'Giảm ε để riêng tư hơn thường làm nhiễu và utility thay đổi thế nào?',
        options: [['noise-up', 'Nhiễu tăng, utility giảm'], ['noise-down', 'Nhiễu giảm, utility tăng'], ['same', 'Không đổi']],
        correct: 'noise-up',
        explain: 'ε nhỏ hơn đòi hỏi nhiễu lớn hơn để che tín hiệu. Nhiễu tăng làm ước lượng kém chính xác hơn, tức utility thường giảm. Đây là đánh đổi, không phải lỗi cài đặt.',
      },
      challenge: {
        goal: 'Chọn ε sao cho σ ≤ 2 và utility ≥ 40.',
        check: (_p, r) => r.sigma <= 2 && r.utility >= 40,
      },
      errors: [
        { label: 'ε quá lớn', params: { epsilon: 10 }, explain: 'ε lớn cho σ nhỏ và utility cao, nhưng bảo vệ yếu hơn. “Ít nhiễu” không đồng nghĩa “riêng tư tốt”.' },
        { label: 'ε quá nhỏ', params: { epsilon: 0.1 }, explain: 'σ rất lớn, nhiễu lấn tín hiệu; utility gần như mất. Riêng tư mạnh có chi phí hữu ích.' },
        { label: 'Bỏ qua ngân sách nhiều vòng', params: { epsilon: 1, rounds: 50 }, explain: 'Mỗi vòng tiêu một phần ngân sách. Nhìn ε một vòng rồi bỏ qua 50 vòng là đánh giá privacy quá lạc quan.' },
      ],
      calculate(p) {
        const sigma = p.clip * Math.sqrt(2 * Math.log(1.25 / 1e-5)) / Math.max(0.01, p.epsilon);
        return {
          sigma,
          utility: 100 / (1 + sigma),
          noisePerClient: sigma / Math.sqrt(Math.max(1, p.clients)),
          budget: p.epsilon * p.rounds,
          epsilon: p.epsilon,
          rounds: p.rounds,
        };
      },
      describe(p, r) {
        return [
          [['Độ lớn nhiễu σ', num(r.sigma)], ['Utility', num(r.utility)], ['Nhiễu mỗi client', num(r.noisePerClient)], ['Ngân sách ε × vòng', num(r.budget)]],
          `ε = ${num(p.epsilon)}, C = ${num(p.clip)} cho σ ≈ ${num(r.sigma)}. ${p.rounds > 1 ? `Với ${p.rounds} vòng, ngân sách xấp xỉ ${num(r.budget)} nếu cộng đơn giản; cần kiểm toán composition chặt hơn.` : 'Một vòng huấn luyện. Tăng số vòng sẽ tiêu thêm ngân sách riêng tư.'} Đây là ước lượng Gaussian mechanism, không phải kiểm toán DP đầy đủ.`,
        ];
      },
      plot(p, r, ghost) {
        const W = 420, H = 330, lx0 = 30, lx1 = 250, gy0 = 220, gy1 = 44;
        const logMin = -1, logMax = 1;
        const ex = epsilon => lx0 + (Math.log10(epsilon) - logMin) / (logMax - logMin) * (lx1 - lx0);
        const points = [];
        for (let i = 0; i <= 40; i++) {
          const epsilon = Math.pow(10, logMin + (logMax - logMin) * i / 40);
          const sigma = p.clip * Math.sqrt(2 * Math.log(1.25 / 1e-5)) / Math.max(0.01, epsilon);
          const utility = 100 / (1 + sigma);
          points.push([ex(epsilon), gy0 - utility / 100 * (gy0 - gy1)]);
        }
        const path = points.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
        const cx = ex(r.epsilon), cy = gy0 - r.utility / 100 * (gy0 - gy1);
        const bx0 = 272, bx1 = 398, by0 = 44, by1 = 220, mid = (bx0 + bx1) / 2, spread = clamp(r.sigma * 10, 8, 56);
        const bell = [];
        for (let i = 0; i <= 40; i++) {
          const z = -3 + 6 * i / 40;
          bell.push([mid + z * spread, by1 - Math.exp(-z * z / 2) * (by1 - by0) * 0.85]);
        }
        const bellPath = bell.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
        const ghostLine = ghost ? `<line x1="${ex(ghost.epsilon)}" y1="${gy1}" x2="${ex(ghost.epsilon)}" y2="${gy0}" stroke="#9a8f82" stroke-dasharray="4 3"/>` : '';
        return svg(`
          <text x="14" y="20" font-size="12" fill="#6f675d">Utility theo ε (thang log) · kéo điểm ε</text>
          <line x1="${lx0}" y1="${gy0}" x2="${lx1}" y2="${gy0}" stroke="#a89c8b"/><line x1="${lx0}" y1="${gy0}" x2="${lx0}" y2="${gy1}" stroke="#a89c8b"/>
          <path d="${path}" fill="none" stroke="#1f6f5f" stroke-width="3"/>
          ${ghostLine}
          <circle data-handle="epsilon" cx="${cx}" cy="${cy}" r="9" fill="#ad542f" stroke="#fff" stroke-width="2.5" style="cursor:grab"><title>ε = ${num(r.epsilon)}</title></circle>
          <text x="${lx0}" y="${H - 96}" font-size="10" fill="#6f675d">ε = 0,1</text><text x="${lx1 - 20}" y="${H - 96}" font-size="10" fill="#6f675d">ε = 10</text>
          <text x="${lx0}" y="${gy0 + 16}" font-size="10" fill="#6f675d">Utility ${num(r.utility)} · σ ${num(r.sigma)}</text>
          <text x="${bx0 + 4}" y="20" font-size="12" fill="#6f675d">Phân bố nhiễu</text>
          <line x1="${bx0}" y1="${by1}" x2="${bx1}" y2="${by1}" stroke="#a89c8b"/>
          <path d="${bellPath}" fill="none" stroke="#9e7a31" stroke-width="3"/>
          <text x="${bx0 + 4}" y="${by1 + 16}" font-size="10" fill="#6f675d">0 · σ ${num(r.sigma)}</text>
          <text x="14" y="${H - 66}" font-size="11" fill="#6f675d">Nhiễu mỗi client ${num(r.noisePerClient)} · ngân sách ${num(r.budget)} sau ${p.rounds} vòng</text>
          <text x="14" y="${H - 48}" font-size="10" fill="#8d8274">Giảm ε làm đường utility đi xuống; tăng clipping cũng làm σ tăng.</text>
        `, 'Đường utility theo epsilon và phân bố nhiễu Gaussian', W, H);
      },
      bind({ visual, params, update, noteInteraction }) {
        let active = false;
        const move = event => {
          const svgEl = visual.querySelector('svg');
          if (!svgEl) return;
          const p = pointInView(svgEl, event, 420, 330);
          if (p.x < 30 || p.x > 250) return;
          const ratio = clamp((p.x - 30) / 220, 0, 1);
          params.epsilon = Math.round(Math.pow(10, -1 + ratio * 2) * 10) / 10;
          update();
        };
        visual.addEventListener('pointerdown', event => {
          const handle = event.target.closest && event.target.closest('[data-handle="epsilon"]');
          if (!handle) return;
          active = true; noteInteraction(); event.preventDefault(); move(event);
        });
        window.addEventListener('pointermove', event => { if (active) move(event); });
        window.addEventListener('pointerup', () => { active = false; });
      },
    },
  });
Object.assign(D.matrix, {
    challenge: {
      goal: 'Chọn ma trận có |det A| ≥ 2 và giữ ảnh của vector v trong góc phần tư thứ nhất (x > 0, y > 0).',
      check: (_p, r) => Math.abs(r.det) >= 2 && r.x > 0 && r.y > 0,
    },
    errors: [
      { label: 'Ma trận suy biến', params: { a: 1, b: 2, c: 2, d: 4 }, explain: 'det = 1×4 − 2×2 = 0. Mặt phẳng bị ép thành một đường, không còn phép nghịch đảo; diện tích ảnh bằng 0.' },
      { label: 'Lật hướng', params: { a: -1, b: 0, c: 0, d: 1 }, explain: 'det = −1: diện tích giữ nguyên nhưng hướng bị lật. Dấu định thức mang thông tin định hướng, không chỉ độ lớn.' },
      { label: 'Kéo giãn một trục', params: { a: 2, b: 0, c: 0, d: 0.5 }, explain: 'det = 1 nên diện tích không đổi, nhưng hình bị kéo dài theo một trục và bẹt theo trục kia. Diện tích một mình không mô tả hết phép biến đổi.' },
    ],
  });
  Object.assign(D.gradient, {
    challenge: {
      goal: 'Với η ≤ 0,30, chạy các bước để loss hiện tại < 0,10.',
      check: (p, r) => p.rate <= 0.3 && r.loss < 0.1,
    },
    errors: [
      { label: 'η = 1 · dao động', params: { x: 0, rate: 1 }, explain: 'Với f(x) = (x−3)², η = 1 nhảy từ 0 sang 6 rồi về 0: loss không giảm đều. Đây là biên ổn định, không phải tốc độ học tốt.' },
      { label: 'η > 1 · phân kỳ', params: { x: 0, rate: 1.2 }, explain: 'Hệ số cập nhật vượt 1 làm mỗi bước đi xa nghiệm hơn; loss tăng và có thể tràn khỏi khung. Learning rate lớn không đồng nghĩa học nhanh hơn.' },
      { label: 'Điểm xuất phát xa', params: { x: 8, rate: 0.1 }, explain: 'Gradient lớn ở xa nghiệm tạo bước nhảy lớn; quỹ đạo vẫn đi về phía 3 nhưng cần nhiều bước hơn. Vị trí đầu và tốc độ học tương tác với nhau.' },
    ],
  });
  Object.assign(D.conv, {
    challenge: {
      goal: 'Với ảnh 8×8, chọn kernel 3, padding 1, stride 1 để feature map giữ kích thước 8×8.',
      check: p => p.size === 8 && p.kernel === 3 && p.padding === 1 && p.stride === 1,
    },
    errors: [
      { label: 'Không padding', params: { size: 8, kernel: 3, padding: 0, stride: 1 }, explain: 'out = (8 + 0 − 3)/1 + 1 = 6: không padding làm feature map nhỏ đi sau mỗi lớp. Đây là lý do mạng sâu cần padding hoặc thiết kế giảm kích thước có chủ đích.' },
      { label: 'Stride 2', params: { size: 8, kernel: 3, padding: 0, stride: 2 }, explain: 'out = floor((8 − 3)/2) + 1 = 3: stride 2 giảm mạnh độ phân giải. Stride là phép giảm mẫu, không chỉ là tốc độ.' },
      { label: 'Kernel lớn', params: { size: 8, kernel: 5, padding: 0, stride: 1 }, explain: 'out = (8 − 5) + 1 = 4: kernel lớn hơn làm mất nhiều biên hơn. Cần padding nếu muốn giữ kích thước.' },
    ],
  });
})();