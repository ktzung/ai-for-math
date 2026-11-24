/* Own implementation: no code or content copied from Math4AI. */
const VectorLesson = (() => {
  const state = { lengthA:5, lengthB:10, angle:0 };
  const baseAngle = Math.atan2(4,3);
  const presets = {
    same:{lengthA:5,lengthB:10,angle:0},
    perpendicular:{lengthA:5,lengthB:10,angle:90},
    opposite:{lengthA:5,lengthB:10,angle:180},
    zero:{lengthA:5,lengthB:0,angle:0},
  };
  const pretty = n => (Math.abs(n)<1e-9?0:n).toLocaleString('vi-VN',{maximumFractionDigits:3});
  function compute(a,b,angle){
    const defined = a>0 && b>0;
    const cosine = defined ? Math.cos(angle*Math.PI/180) : null;
    return {normA:a,normB:b,dot:a*b*Math.cos(angle*Math.PI/180),cosine,angle:defined?angle:null};
  }
  function html(){return `
  <div class="vector-lesson">
    <header>
      <p class="eyebrow">Bài mẫu · Đại số tuyến tính</p>
      <h1>Cùng hướng,<br>khác độ lớn.</h1>
      <p class="lede">Hai giỏ hàng mua cùng tỉ lệ nhưng khác số tiền. Chúng giống nhau ở đâu? Một cách đọc vector bằng chuyện đời thường, hình vẽ và vài con số.</p>
      <p class="reading-meta">Khoảng 12 phút · Chỉ cần biết cộng, nhân và căn bậc hai</p>
    </header>
    <nav class="lab-nav" aria-label="Mục lục bài vector">
      <button data-section="lab-life">Từ đời thực</button><button data-section="lab-symbols">Đọc công thức</button><button data-section="lab-explore">Thử bằng tay</button><button data-section="lab-check">Tự kiểm tra</button>
    </nav>
    <section id="lab-life" tabindex="-1">
      <h2>Một danh sách số, hai câu hỏi</h2>
      <p>An chi <strong>30 nghìn cho gạo, 40 nghìn cho rau</strong>. Bình chi 60 nghìn và 80 nghìn. Ta viết hai giỏ hàng theo cùng thứ tự <em>(gạo, rau)</em>, đơn vị 10 nghìn đồng:</p>
      <div class="lab-equation"><span class="lab-a">a = (3, 4)</span> &nbsp; và &nbsp; <span class="lab-b">b = (6, 8) = 2a</span><small>Giỏ Bình gấp đôi giỏ An ở từng khoản. Cơ cấu chi tiêu giống nhau.</small></div>
      <div class="lab-question"><strong>Hãy tách hai câu hỏi.</strong><p>“Quy mô bao nhiêu?” nhìn vào độ lớn. “Các thành phần cân đối ra sao?” nhìn vào hướng, sau khi đã chọn hệ tọa độ và thang đo phù hợp.</p></div>
      <div class="lab-table-wrap" role="region" aria-label="Ví dụ độ lớn và hướng trong đời thực" tabindex="0"><table class="lab-table"><thead><tr><th scope="col">Đối tượng</th><th scope="col">Vector ghi gì?</th><th scope="col">Độ lớn gợi điều gì?</th><th scope="col">Hướng gợi điều gì?</th></tr></thead><tbody>
      <tr><td>Dòng nước</td><td>(vận tốc Đông, vận tốc Bắc), m/s</td><td>Chuẩn L2 là tốc độ dòng nước.</td><td>Nước chảy về phía nào.</td></tr>
      <tr><td>Giỏ hàng</td><td>(tiền gạo, tiền rau), cùng đơn vị</td><td>L2 phản ánh quy mô; tổng tiền là tổng các khoản, tức L1 khi chúng không âm.</td><td>Cơ cấu chi tiêu. Cùng tỉ lệ dương thì cùng hướng.</td></tr>
      <tr><td>Lịch sử xem phim</td><td>(lượt xem hành động, lượt xem hài)</td><td>Phản ánh quy mô hoạt động; tổng lượt xem là L1.</td><td>Tỉ lệ xem giữa các thể loại.</td></tr>
      <tr><td>Embedding</td><td>Một danh sách số do mô hình học</td><td>Ý nghĩa tùy mô hình; không tự đồng nghĩa độ chắc chắn.</td><td>Có thể so sánh bằng cosine khi cách huấn luyện và bài toán phù hợp.</td></tr>
      </tbody></table></div>
      <p class="lab-note"><strong>Giới hạn của ví dụ:</strong> hướng là khái niệm hình học. Việc gọi nó là “gu”, “cơ cấu” hay “ngữ nghĩa” phụ thuộc cách mã hóa dữ liệu. Vector 0 không có hướng.</p>
    </section>
    <section id="lab-symbols" tabindex="-1">
      <h2>Đọc công thức như đọc một câu</h2>
      <p>Với vector thực <strong>v = (v₁, …, vₙ)</strong>, ta dùng độ dài Euclid, còn gọi là <strong>chuẩn L2</strong>:</p>
      <div class="lab-equation">‖v‖<sub>2</sub> = √(v₁² + ⋯ + vₙ²)<small>“Bình phương từng thành phần, cộng lại, rồi lấy căn.” Đây là định lý Pythagoras mở rộng.</small></div>
      <p>Hai vector cùng số chiều có tích vô hướng:</p>
      <div class="lab-equation">a · b = a₁b₁ + ⋯ + aₙbₙ<small>“Nhân từng cặp thành phần tương ứng, rồi cộng.” Kết quả là một số.</small></div>
      <p>Với hai vector <strong>khác 0</strong>, công thức sau nối cách tính số với hình học:</p>
      <div class="lab-equation">a · b = ‖a‖<sub>2</sub> ‖b‖<sub>2</sub> cos θ<small>“Tích vô hướng bằng tích hai độ dài, nhân với cosin của góc xen giữa.”</small></div>
      <div class="lab-equation">cos θ = <span class="lab-fraction"><span>a · b</span><span>‖a‖<sub>2</sub> ‖b‖<sub>2</sub></span><small>Chia đi hai độ dài để chỉ còn mức tương đồng về hướng. Cosine nằm trong [−1, 1].</small></div>
      <div class="lab-worked"><span class="step">01</span><div><h3>Tính độ dài của hai giỏ hàng</h3><p>‖a‖₂ = √(3² + 4²) = <strong>5</strong>; ‖b‖₂ = √(6² + 8²) = <strong>10</strong>.<br>Tổng tiền lần lượt là 3 + 4 = <strong>7</strong> và 6 + 8 = <strong>14</strong> đơn vị. Tổng tiền và độ dài L2 là hai đại lượng khác nhau.</p></div></div>
      <div class="lab-worked"><span class="step">02</span><div><h3>Tính độ khớp theo tích vô hướng</h3><p>a · b = 3 × 6 + 4 × 8 = <strong>50</strong>. Điểm này phụ thuộc cả quy mô lẫn hướng.</p></div></div>
      <div class="lab-worked"><span class="step">03</span><div><h3>Tách ảnh hưởng của quy mô</h3><p>cos θ = 50 / (5 × 10) = <strong>1</strong>, nên θ = <strong>0°</strong>. Hai giỏ hàng cùng hướng; Bình mua gấp đôi nhưng giữ nguyên tỉ lệ.</p></div></div>
    </section>
    <section id="lab-explore" tabindex="-1">
      <h2>Đổi một thứ. Quan sát thứ còn lại.</h2>
      <p><strong>Dự đoán trước:</strong> giữ góc bằng 0°, tăng độ dài b. Tích vô hướng có tăng không? Cosine có tăng theo không?</p>
      <div class="lab-workbench">
        <div class="lab-workbench-head"><h3>Góc, độ dài và độ tương đồng</h3><button class="lab-btn" id="lab-reset">Đặt lại</button></div>
        <div class="lab-presets" aria-label="Tình huống thử"><button class="lab-btn" data-preset="same">Cùng hướng</button><button class="lab-btn" data-preset="perpendicular">Vuông góc</button><button class="lab-btn" data-preset="opposite">Ngược hướng</button><button class="lab-btn" data-preset="zero">Vector 0</button></div>
        <div class="lab-body">
          <figure class="lab-plot"><svg id="lab-svg" viewBox="0 0 400 370" role="img" aria-labelledby="lab-svg-title lab-svg-desc"><title id="lab-svg-title">Hai vector và góc xen giữa</title><desc id="lab-svg-desc">Vector a nét liền xanh và b nét đứt đất nung cùng xuất phát từ gốc tọa độ. Điều khiển bên cạnh thay đổi hình và số liệu.</desc></svg><figcaption>Cùng một tỉ lệ trục. Vùng vẽ tự thu phóng để chứa cả hai vector.</figcaption></figure>
          <div>
            <p class="lab-coordinate" id="lab-coordinates"></p>
            <div class="lab-control"><label for="lab-length-a">Độ dài a <output id="lab-value-a" for="lab-length-a"></output></label><input id="lab-length-a" type="range" min="0" max="15" step="0.5" value="5"><div class="range-ends"><span>0</span><span>15</span></div></div>
            <div class="lab-control"><label for="lab-length-b">Độ dài b <output id="lab-value-b" for="lab-length-b"></output></label><input id="lab-length-b" type="range" min="0" max="15" step="0.5" value="10"><div class="range-ends"><span>0</span><span>15</span></div></div>
            <div class="lab-control"><label for="lab-angle">Góc xen giữa θ <output id="lab-value-angle" for="lab-angle"></output></label><input id="lab-angle" type="range" min="0" max="180" step="1" value="0"><div class="range-ends"><span>0°</span><span>180°</span></div></div>
          </div>
        </div>
        <dl class="lab-values"><div><dt>Độ dài ‖a‖₂</dt><dd id="lab-norm-a"></dd></div><div><dt>Độ dài ‖b‖₂</dt><dd id="lab-norm-b"></dd></div><div><dt>Tích vô hướng a · b</dt><dd id="lab-dot"></dd></div><div><dt>Cosine</dt><dd id="lab-cosine"></dd></div></dl>
        <div class="lab-observation" role="status" aria-live="polite" aria-atomic="true"><p id="lab-observation"></p></div>
      </div>
      <p>Thử tiếp: chọn <strong>Vuông góc</strong> rồi tăng độ dài b. Tích vô hướng vẫn bằng 0. Chọn <strong>Vector 0</strong>: dot bằng 0 nhưng góc và cosine không xác định.</p>
    </section>
    <section>
      <h2>Điểm lớn hơn, chưa chắc cùng hướng hơn</h2>
      <p>Giữ a = (1, 0). So sánh b = (10, 10) và c = (1, 0):</p>
      <div class="lab-table-wrap"><table class="lab-table"><thead><tr><th scope="col">So với a</th><th scope="col">Tích vô hướng</th><th scope="col">Cosine</th><th scope="col">Góc</th></tr></thead><tbody><tr><td>b = (10, 10)</td><td>10</td><td>1/√2 ≈ 0,707</td><td>45°</td></tr><tr><td>c = (1, 0)</td><td>1</td><td>1</td><td>0°</td></tr></tbody></table></div>
      <p><strong>b có dot lớn hơn vì dài hơn; c có hướng giống a hơn.</strong> Chọn chỉ số nào phụ thuộc điều ta muốn so sánh. Độ lớn có ích thì giữ lại; chỉ muốn so hướng thì có thể xét cosine.</p>
      <p class="lab-note">Các chiều phải có ý nghĩa và thang đo phù hợp. Đổi riêng đơn vị của một chiều có thể làm cả góc và cosine thay đổi. Cosine không tự giải quyết khác biệt đơn vị giữa các đặc trưng.</p>
    </section>
    <section>
      <h2>Ba cách “chuẩn hóa”, ba việc khác nhau</h2>
      <p><strong>Min–max theo cột</strong> đổi thang đo từng đặc trưng dựa trên min/max của tập dữ liệu dùng để fit. Nó thường làm đổi cả hướng lẫn độ dài. Cột có max = min cần quy ước xử lý riêng.</p>
      <p><strong>Chia cho norm L2</strong> biến một vector khác 0 thành vector đơn vị: v̂ = v / ‖v‖₂. Phép này giữ hướng. Dot của hai vector đã chuẩn hóa L2 chính là cosine của chúng.</p>
      <p><strong>LayerNorm</strong> trừ trung bình các thành phần, chia cho căn phương sai cộng ε, rồi thường áp dụng scale và bias học được. Nó có thể đổi hướng; không tương đương chuẩn hóa L2.</p>
      <h3>Liên hệ AI vừa đủ</h3>
      <p>Trong tìm kiếm embedding, cosine có thể giúp xếp hạng biểu diễn theo hướng. Có mô hình dùng dot hoặc khoảng cách Euclid. Ý nghĩa của norm và chất lượng chỉ số phải kiểm tra theo mô hình và dữ liệu cụ thể.</p>
      <details class="lab-source"><summary>Nguồn và đọc tiếp</summary><p>Công thức LayerNorm: <a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html" target="_blank" rel="noopener noreferrer">tài liệu PyTorch</a>. Tham khảo tổ chức bài học: <a href="https://github.com/shankarpandala/math4ai" target="_blank" rel="noopener noreferrer">Math4AI</a>. Nội dung và minh họa bài mẫu được viết riêng cho bộ tài liệu này.</p></details>
    </section>
    <section id="lab-check" tabindex="-1">
      <h2>Thử giải thích lại bằng lời</h2>
      <form id="lab-quiz-form"><fieldset class="lab-quiz"><legend>Một câu kiểm tra nhanh</legend><p>Với mọi cặp a và b khác 0, ta thay b bằng 3b. Đại lượng nào luôn giữ nguyên?</p><label><input type="radio" name="lab-answer" value="dot" required>Tích vô hướng a · b</label><label><input type="radio" name="lab-answer" value="cosine">Cosine giữa a và b</label><label><input type="radio" name="lab-answer" value="length">Độ dài của b</label><button class="lab-btn" type="submit">Kiểm tra câu trả lời</button><p class="lab-feedback" id="lab-feedback" role="status" aria-live="polite"></p></fieldset></form>
      <div class="lab-exercise"><h3>Bài 1 · Cùng hướng có nghĩa gì?</h3><p>Hai giỏ hàng (2, 6) và (5, 15) có cùng hướng không? Tổng tiền có bằng nhau không?</p><details><summary>Mở gợi ý</summary><p>Tìm một số dương k sao cho vector thứ hai bằng k lần vector thứ nhất.</p></details><details><summary>Mở lời giải</summary><p>(5, 15) = 2,5 × (2, 6), nên cùng hướng và cosine bằng 1. Tổng tiền lần lượt là 8 và 20 đơn vị; quy mô khác nhau.</p></details></div>
      <div class="lab-exercise"><h3>Bài 2 · Dấu của tích vô hướng</h3><p>a = (1, 0), b = (−2, 0). Tính dot, cosine và góc. Độ dài có thể âm không?</p><details><summary>Mở gợi ý</summary><p>Độ dài dùng căn tổng bình phương; dấu âm trong tọa độ không làm độ dài âm.</p></details><details><summary>Mở lời giải</summary><p>Dot = −2, hai độ dài là 1 và 2, cosine = −1, góc = 180°. Hai vector ngược hướng. Độ dài luôn không âm.</p></details></div>
      <div class="lab-exercise"><h3>Bài 3 · Trường hợp dễ bỏ sót</h3><p>Một vector là (0, 0). Có thể kết luận nó vuông góc với (3, 4) vì dot bằng 0 không?</p><details><summary>Mở gợi ý</summary><p>Thử thay vào mẫu số trong công thức cosine. Phân biệt tích vô hướng bằng 0 với một góc hình học xác định.</p></details><details><summary>Mở lời giải</summary><p>Dot bằng 0, nhưng mẫu số cosine bằng 0 nên góc không xác định. Trong đại số, vector 0 được gọi là trực giao với mọi vector theo định nghĩa dot bằng 0; không được diễn giải thành góc 90° có thể vẽ.</p></details></div>
      <div class="lab-complete"><h3>Một ý để mang theo</h3><p><strong>Dot nhìn cả độ lớn và hướng. Cosine so hướng sau khi chia đi độ lớn.</strong> Cách diễn giải đời thực luôn phụ thuộc cách biểu diễn dữ liệu.</p><button class="lab-btn" id="lab-complete" aria-pressed="false">Đánh dấu đã đọc</button><p id="lab-complete-note" class="reading-meta">Đánh dấu được lưu trên trình duyệt này; anh vẫn có thể quay lại thử bất kỳ lúc nào.</p></div>
    </section>
  </div>`;}

  function drawSVG(svg){
    const la=state.lengthA,lb=state.lengthB,t=state.angle*Math.PI/180;
    const scale=135/Math.max(la,lb,5),ox=205,oy=190;
    const point=(length,angle)=>[ox+length*Math.cos(angle)*scale,oy-length*Math.sin(angle)*scale];
    const a=point(la,baseAngle),b=point(lb,baseAngle+t);
    const f=x=>Number(x.toFixed(3));
    const line=(end,color,dashed,id)=>`<line x1="${ox}" y1="${oy}" x2="${f(end[0])}" y2="${f(end[1])}" stroke="${color}" stroke-width="${dashed?3:4}" ${dashed?'stroke-dasharray="8 5"':''} marker-end="url(#${id})"/>`;
    let grid='';
    for(let v=-150;v<=150;v+=30) grid+=`<path d="M ${ox+v} 30 V 340 M 45 ${oy+v} H 365" stroke="#e6e0d4" stroke-width="1"/>`;
    const radius=32,end=point(radius/scale,baseAngle+t),start=point(radius/scale,baseAngle);
    const arc=la&&lb&&state.angle>0?`<path d="M ${f(start[0])} ${f(start[1])} A ${radius} ${radius} 0 0 0 ${f(end[0])} ${f(end[1])}" fill="none" stroke="#8b6b34" stroke-width="2"/><text x="${f(ox+52*Math.cos(baseAngle+t/2))}" y="${f(oy-52*Math.sin(baseAngle+t/2))}" fill="#6f5328" font-size="14" text-anchor="middle">θ</text>`:'';
    svg.innerHTML=`<title id="lab-svg-title">Vector a và b: ${la&&lb?state.angle+' độ':'góc không xác định'}</title><desc id="lab-svg-desc">a dài ${la}; b dài ${lb}. a là nét liền xanh; b là nét đứt đất nung.</desc><defs><marker id="lab-arrow-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1f6f5f"/></marker><marker id="lab-arrow-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ad542f"/></marker></defs>${grid}<path d="M 35 ${oy} H 375 M ${ox} 20 V 345" stroke="#b6ad9e" stroke-width="1.5"/><text x="377" y="${oy-8}" fill="#6f675d" font-size="13">x</text><text x="${ox+9}" y="24" fill="#6f675d" font-size="13">y</text>${arc}${la?line(a,'#1f6f5f',false,'lab-arrow-a'):''}${lb?line(b,'#ad542f',true,'lab-arrow-b'):''}<circle cx="${ox}" cy="${oy}" r="4" fill="#332d26"/><text x="${ox+8}" y="${oy+18}" fill="#6f675d" font-size="13">O</text>${la?`<text x="${f(a[0]+10)}" y="${f(a[1]+16)}" fill="#1f6f5f" font-size="17" font-weight="700">a</text>`:''}${lb?`<text x="${f(b[0]-12)}" y="${f(b[1]-10)}" fill="#ad542f" font-size="17" font-weight="700">b</text>`:''}`;
  }
  function mount(root){
    const byId=id=>root.querySelector('#'+id);
    function update(){
      const r=compute(state.lengthA,state.lengthB,state.angle);
      byId('lab-length-a').value=state.lengthA;byId('lab-length-b').value=state.lengthB;byId('lab-angle').value=state.angle;
      byId('lab-value-a').textContent=pretty(r.normA);byId('lab-value-b').textContent=pretty(r.normB);
      byId('lab-value-angle').textContent=r.angle===null?'Không xác định':state.angle+'°';
      byId('lab-angle').disabled=r.angle===null;
      byId('lab-norm-a').textContent=pretty(r.normA);byId('lab-norm-b').textContent=pretty(r.normB);byId('lab-dot').textContent=pretty(r.dot);
      byId('lab-cosine').textContent=r.cosine===null?'Không xác định':pretty(r.cosine);byId('lab-cosine').classList.toggle('is-undefined',r.cosine===null);
      const a=[state.lengthA*.6,state.lengthA*.8],b=[state.lengthB*Math.cos(baseAngle+state.angle*Math.PI/180),state.lengthB*Math.sin(baseAngle+state.angle*Math.PI/180)];
      byId('lab-coordinates').innerHTML=`<span class="lab-a">a = (${pretty(a[0])}; ${pretty(a[1])})</span><br><span class="lab-b">b = (${pretty(b[0])}; ${pretty(b[1])})</span>`;
      let observation;
      if(r.cosine===null) observation='Có vector 0: dot vẫn bằng 0, nhưng góc và cosine không xác định. Tăng cả hai độ dài lên trên 0 để so hướng.';
      else if(state.angle===0) observation='Cùng hướng: cosine = 1. Thay đổi độ dài làm dot thay đổi, còn cosine giữ nguyên. Hãy thử kéo độ dài b.';
      else if(state.angle===90) observation='Vuông góc: cosine = 0 và dot = 0 dù hai độ dài đều lớn hơn 0. Tăng độ dài vẫn không làm dot khác 0.';
      else if(state.angle===180) observation='Ngược hướng: cosine = −1. Dot âm; tăng độ dài làm dot âm hơn, còn độ dài vẫn không âm.';
      else observation=`Góc ${state.angle}°: cosine ${pretty(r.cosine)}. Với hai độ dài cố định, góc tăng từ 0° đến 180° thì dot giảm từ dương qua 0 đến âm.`;
      byId('lab-observation').textContent=observation;
      root.querySelectorAll('[data-preset]').forEach(button=>{const p=presets[button.dataset.preset];button.setAttribute('aria-pressed',String(p.lengthA===state.lengthA&&p.lengthB===state.lengthB&&p.angle===state.angle));});
      drawSVG(byId('lab-svg'));
    }
    [['lab-length-a','lengthA'],['lab-length-b','lengthB'],['lab-angle','angle']].forEach(([id,key])=>byId(id).addEventListener('input',e=>{state[key]=Number(e.target.value);update();}));
    root.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{Object.assign(state,presets[button.dataset.preset]);update();}));
    byId('lab-reset').addEventListener('click',()=>{Object.assign(state,presets.same);update();});
    root.querySelectorAll('[data-section]').forEach(button=>button.addEventListener('click',()=>{const target=byId(button.dataset.section);target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});target.focus({preventScroll:true});}));
    byId('lab-quiz-form').addEventListener('submit',event=>{event.preventDefault();const chosen=root.querySelector('input[name="lab-answer"]:checked');if(!chosen)return;byId('lab-feedback').textContent=chosen.value==='cosine'?'Đúng. Nhân với 3 giữ hướng: cosine luôn không đổi. Độ dài b và dot đều nhân 3 (dot bằng 0 thì vẫn là 0).':'Chưa đúng. Độ dài b nhân 3; dot cũng nhân 3 nên chỉ giữ nguyên khi vốn bằng 0. Với mọi cặp vector khác 0, cosine luôn giữ nguyên vì 3 là số dương. Hãy thử lại.';});
    const complete=byId('lab-complete');let completed=false;
    try{completed=localStorage.getItem('math-vector-read')==='1';}catch{}
    function showComplete(){complete.setAttribute('aria-pressed',String(completed));complete.textContent=completed?'Đã đọc · Bỏ đánh dấu':'Đánh dấu đã đọc';}
    complete.addEventListener('click',()=>{completed=!completed;try{localStorage.setItem('math-vector-read',completed?'1':'0');}catch{byId('lab-complete-note').textContent='Trình duyệt không cho lưu. Đánh dấu chỉ giữ trong lần mở này.';}showComplete();});
    showComplete();update();
  }
  return {html,mount,compute};
})();
