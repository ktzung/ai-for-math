# Chương 2 — Số, tỉ lệ, hàm và mô hình hóa

> **Câu hỏi lớn của chương:** *Làm sao biến câu chuyện "giao hàng chậm" thành một công thức dự đoán?*

---

## 1. Mở đầu bằng một tình huống

Một cô chủ quán cà phê nhỏ. Buổi sáng, cô ướm thử: *"Hôm nay cần pha bao nhiêu ca phin cho kịp buổi sáng đông khách?"*

Cô có nhiều năm kinh nghiệm, nên cô trả lời bằng trực giác: *"Cứ khoảng 3 ca cho mỗi 10 khách."* Nói xong cô đong đúng 15 ca phin khi có 50 khách dự kiến.

Giờ hãy nhìn điều cô vừa làm dưới con mắt toán. Cô đã dựng một **mô hình**: một mối quan hệ "nếu có X khách thì cần Y ca phin". Mối quan hệ này cô ghi trong đầu bằng tiếng Việt ("cứ 3 ca cho 10 khách"), chứ không bằng công thức. Nhưng nó vẫn là **một hàm số** — chỉ là chưa được viết ra.

Câu chuyện này không chỉ về cà phê. Nó là bản in thu nhỏ của cách con người (và máy tính) dự đoán mọi thứ: **quan sát một quy luật từ thực tế, rồi dùng nó để đoán điều chưa xảy ra.** Trong chương này, bạn sẽ biến những câu nói trực giác kiểu "cứ 3 ca cho 10 khách" thành thứ ngôn ngữ chính xác hơn — và thấy vì sao máy tính cần ngôn ngữ đó.

---

## 2. Trực giác trước

Nếu ta nói roi *"cứ 3 ca cho 10 khách"*, ta thực sự đang nói gì?

- Với **10 khách** → 3 ca.
- Với **20 khách** → 6 ca (gấp đôi).
- Với **30 khách** → 9 ca (gấp ba).

Để ý: **tỉ lệ không đổi**. 3 ca / 10 khách luôn bằng 0.3 ca mỗi khách, dù nhìn theo quy mô nào. Đây chính là linh hồn của tỉ lệ: *mối quan hệ "càng nhiều thì càng nhiều, và giá trị trên một đơn vị thì không đổi."*

Cái bảng nhỏ trên (10→3, 20→6, 30→9) là một **hàm số ẩn**: nếu bạn hỏi "với 25 khách thì bao nhiêu ca?", bảng chưa có dòng 25. Nhưng quy luật thì có. Hàm số là *cách để trả lời cho bất kỳ số khách nào*, không chỉ những số đã ghi trong bảng.

Hãy nghĩ hàm số như **một công thức nấu ăn linh hoạt**. Công thức ghi: *"mỗi 1 khách → 0.3 ca"*. Muốn biết cho 25 khách? Nhân: 25 × 0.3 = 7.5 ca. Không cần một bảng riêng cho 25. Công thức (hàm) của cô chủ quán nhận "số khách" vào và trả ra "số ca phin".

**Phép so sánh "hàm = công thức nấu ăn"** rất hữu ích vì nó nhấn mạnh: hàm có *đầu vào* (nguyên liệu/số khách), có *quy tắc* (cách làm), có *đầu ra* (món ăn/số ca). Nhưng nó có **giới hạn**: công thức nấu ăn thường gồm nhiều bước rời rạc, còn hàm toán thường đặc tả bằng một phép tính gọn (nhân, cộng, mũ...). Và công thức nấu ăn cho phép "nêm nếm đại khái", còn hàm toán đòi chính xác.

---

## 3. Thử giải bằng cách chưa chính thức

Trở lại câu hỏi thực tế: **nếu có 25 khách, cô chủ cần bao nhiêu ca phin?**

Cô có thể giải (chưa cần ký hiệu, chỉ bằng suy luận "quy tắc ba"):

- Quy luật: 10 khách → 3 ca.
- 25 khách = 2.5 lần của 10 khách.
- Vậy ca phin = 2.5 × 3 = **7.5 ca**.

Để ý cách ta suy luận: ta tìm **hệ số nhân** ("gấp 2.5 lần") rồi áp cho đầu ra. Đây là cách suy nghĩ tự nhiên mà ai cũng làm được trước khi học ký hiệu. Nó chính là phép mô hình hóa — nhưng còn "thoải mái", chưa chặt chẽ.

Vấn đề nảy sinh khi tình huống phức tạp hơn. Giả sử quy luật không phải "cứ 10 khách thì 3 ca", mà là *"cứ 10 khách đến trước 8 giờ sáng thì cần thêm 1 ca để chuẩn bị"* — hóa ra có phí khởi động. Bây giờ "quy tắc ba" thuần túy không còn đủ. Ta cần một ngôn ngữ linh hoạt hơn để mô tả *có* yếu tố cố định + yếu tố tỉ lệ. Ký hiệu hàm sẽ giúp — đây là lúc "từ câu chuyện đến ký hiệu" trả tiền.

---

## 4. Đặt tên cho ý tưởng

- **Tỉ lệ (ratio):** mối quan hệ so sánh hai đại lượng, thường ghi "a trên b", ví dụ 3 ca / 10 khách.
- **Tốc độ thay đổi (rate):** mức đổi của đầu ra khi đầu vào tăng thêm **một** đơn vị. Với cô chủ quán: cứ thêm 1 khách → thêm 0.3 ca. Đó là tốc độ thay đổi = 0.3 ca/khách.
- **Hàm số (function):** quy tắc biến đầu vào thành đầu ra, **luôn nhất quán** — cùng đầu vào cho cùng đầu ra.
- **Mô hình hóa (modeling):** biến một tình huống đời thường thành hàm/toán, bằng cách gọi tên đại lượng và viết quan hệ giữa chúng.
- **Mô hình tuyến tính (linear model):** dạng `y = a·x + b`. Chữ "a" là *độ dốc* (tốc độ thay đổi), chữ "b" là *giá trị khởi đầu khi x = 0*.

Hai khái niệm trọng tâm cần nắm chắc:

1. **Biến phụ thuộc và biến độc lập.** Trong `y = a·x + b`: `x` là *đầu vào* (số khách) — bạn "tự chọn"; `y` là *đầu ra* (số ca) — nó "phụ thuộc" vào x. Người ta gọi x là **biến độc lập**, y là **biến phụ thuộc**. Nhớ câu: *"y mắc nợ x"*.

2. **Tiệt tuyến tính ≠ tỉ lệ thuần.** Một mô hình dạng `y = a·x` (phải qua gốc 0) là "tỉ lệ thuần". Còn `y = a·x + b` với b ≠ 0 có thêm *giá trị khởi động* — ta gọi chung là *tuyến tính*. Chương này sẽ đi qua cả hai và chỉ rõ khác biệt (mục 8).

---

## 5. Từ câu chuyện đến ký hiệu

Giờ ghi lại quán cà phê bằng ký hiệu, từng bước:

1. **Đặt tên cho biến:**
   - `x` = số khách.
   - `y` = số ca phin cần.

2. **Viết quan hệ:** "cứ 10 khách thì 3 ca" → mỗi khách cần `0.3` ca → `y = 0.3·x`.

3. **Giải thích từng ký hiệu:**
   - `y` = số ca phin cần (đầu ra).
   - `0.3` = số ca mỗi khách (tỉ lệ/tốc độ) — con số này *xuất phát từ dữ liệu thực tế*.
   - `x` = số khách (đầu vào).
   - dấu `·` = phép nhân (kéo theo việc "nhân theo tỉ lệ").

4. **Thêm yếu tố phí khởi động (làm giàu mô hình):** giả sử pha nồi cà đầu tiên luôn cần 2 ca dù ít khách. Mô hình mới:
   `y = 0.3·x + 2`
   - `2` = *giá trị khởi đầu* khi x = 0 (sinh viên đọc tài liệu: đây chính là "hằng số" hay "intercept" — mục 8 phân biệt).
   - Kiểm tra: x = 0 khách → y = 2 ca (nồi nền). x = 10 khách → y = 3 + 2 = 5 ca.

**Điểm nhấn:** ta đã *dịch câu nói đời thường* thành công thức mà không nhập nhằng. Khi thấy `y = a·x + b` trong bất kỳ tài liệu nào, hãy nhớ bản dịch: *"đầu ra bằng (tốc độ thay đổi nhân đầu vào) cộng (giá trị khởi đầu)."*

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Thời gian giao hàng (mô hình tuyến tính)

**Bài toán:** Một app giao hàng dự đoán thời gian `t` (phút) từ quãng đường `d` (km). Rút ra từ dữ liệu: cứ mỗi 1 km mất 2 phút, và mỗi đơn luôn có 5 phút "chuẩn bị đơn".

**Bước 1 — Nhận diện biến:** x (đầu vào) là quãng đường `d`; y (đầu ra) là thời gian `t`.

**Bước 2 — Đọc "mất 2 phút/km":** tốc độ thay đổi = 2 phút/km → hệ số nhân = 2.

**Bước 3 — Đọc "luôn có 5 phút chuẩn bị":** giá trị khởi đầu = 5.

**Bước 4 — Viết mô hình:** `t = 2·d + 5`.

**Bước 5 — Giải thích ký hiệu:** `t` = thời gian (phút); `2` = 2 phút mỗi km; `d` = số km; `+5` = phú chuẩn bị cố định.

**Bước 6 — Dùng cho câu hỏi cụ thể:** quãng đường d = 4 km → `t = 2×4 + 5 = 8 + 5 = 13` phút.

**Bước 7 — Kiểm tra tính hợp lý:** 4 km chạy 8 phút là hợp lý (~30 km/h), cộng 5 phút chuẩn bị → 13 phút "nghe đúng". *(Luôn làm bước kiểm tra này.)*

### Ví dụ B — Giá tiền có thể không tuyến tính (nhận diện giới hạn)

**Bài toán:** Giá taxi: "mở cửa 20k + 12k mỗi km". Và một gói "khuyến mãi: cước mõi km giảm dần 5% khi đi xa". Hỏi mô hình tuyến tính còn đúng không?

**Bước 1 — Mô hình "mở cửa + per km":** `price = 12·km + 20` — **tuyến tính**, dễ vẽ.

**Bước 2 — Mô hình "giảm dần 5%":** mỗi km thêm lại ở mức thấp hơn → *tốc độ thay đổi không còn cố định*. Mô hình tuyến tính **không diễn tả được** hiện tượng cong dần này (cần loại hàm phi tuyến — Chương 4 sẽ gặp).

**Bước 3 — Kết luận:** nhận biết khi nào mô hình tuyến tính là xấp xỉ tốt (đoạn ngắn, biến thiên ít) và khi nào nó "bẻ cong" thực tế. Tuyến tính là *chỗ bắt đầu*, không phải *chân lý phổ quát*.

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

**Hồi quy tuyến tính — bước khởi đầu của học máy.** Con số `0.3` trong mô hình cà phê không phải ngẫu nhiên: nó được "rút ra từ dữ liệu". Đó chính là việc máy học làm ở dạng đơn giản nhất:

- Ta thu thập nhiều cặp (số khách, số ca phin đã dùng).
- Ta vẽ chúng lên đồ thị thành nhiều chấm.
- Máy tìm một đường thẳng `y = a·x + b` đi "gần" các chấm nhất — bằng cách chọn `a` và `b` tối ưu.

Các giá trị `a` (độ dốc) và `b` (khởi đầu) mà máy chọn được gọi là **tham số** hay **trọng số**. Khi bạn nghe "mô hình đang học", về bản chất là *nó đang điều chỉnh các con số như a, b để đường khớp dữ liệu hơn*. (Chương 4 sẽ chỉ cách đo "khớp" bằng đạo hàm; Chương 8 chỉ cách tự điều chỉnh bằng gradient descent.)

**Một bước khái niệm quan trọng cho lập trình:** hàm toán `t = 2·d + 5` gần như y hệt một **hàm trong code**:

```python
def du_doan_thoi_gian(d):
    return 2 * d + 5
```

Toán và lập trình dùng chung khái niệm "hàm" — một là ký hiệu, một là code. Khi bạn viết hàm trong Python, bạn đang *lập trình hóa* một mô hình.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Tuyến tính = lượng hai đại lượng bằng nhau."** Không. Tuyến tính chỉ nói *tốc độ thay đổi cố định* — đầu ra tăng thêm một lượng không đổi khi đầu vào tăng một đơn vị. Nó không nói đầu ra bằng đầu vào. `y = 2x + 5` là tuyến tính nhưng `y ≠ x`.

**Nhầm 2: "Có thêm hằng số b thì vẫn coi là 'tỉ lệ thuần'."** Không nhất thiết. **Tỉ lệ thuần** là dạng `y = a·x` (b=0, đường qua gốc 0). Còn **tuyến tính** là `y = a·x + b` với b có thể khác 0. Phân biệt: các tờ khuyến mãi hay gộp hai thứ này; trong toán, chúng khác nhau ở "giá trị khi x = 0".

**Nhầm 3: "Mô hình tuyến tính áp dụng được mãi, với mọi dữ liệu."** Sai — đây là *mô hình*, tức là *xấp xỉ có giả định*. Khi thực tế cong (Ví dụ B), mô hình tuyến tính sai dần khi x đi xa phạm vi dữ liệu. Đọc: *"đúng trong khoảng dữ liệu đã thấy, chưa chắc đúng ngoài đó."* — và tuyệt đối không "ngoại suy mù" ra xa dữ liệu.

**Giới hạn của phép so sánh "công thức nấu ăn"** (mục 2): công thức nấu ăn cho phép "gần đúng", điều chỉnh theo khẩu vị; mô hình toán đòi *phép tính chính xác* và *giả định rõ*. Hàm toán không "nêm" được.

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn có dạng quan hệ "càng nhiều input → càng nhiều output, với mức tăng đều":
- Kinh doanh: chi phí = (chi phí biến đổi × số lượng) + chi phí cố định.
- Giao thông: thời gian = (tốc độ trung bình × quãng đường) + thời gian chuẩn bị.
- Y tế: liều dự kiến theo cân nặng, v.v.
- ML: là bước đệm trực tiếp cho hồi quy tuyến tính (Chương 2/8 trong lộ trình ML).

Nó **không nên áp dụng máy móc** khi quan hệ *cong* hoặc *ngắt quãng*: tăng trưởng dân số, sự lan truyền virus (tăng theo cấp số), chi phí giao hàng có ngưỡng miễn phí. Nếu nghi dữ liệu cong và bạn cứ ép một đường thẳng, bạn sẽ dự đoán sai. Dấu hiệu nhận biết: nhìn đồ thị có "cong" không. *(Chương 4 giới thiệu các hàm phi tuyến như bậc hai, hàm mũ.)*

---

## Đọc sâu — tỉ lệ thay đổi khác với tỉ lệ của tổng

Mô hình giao hàng `t(d)=2d+5` kể hai câu chuyện: cần 5 phút chuẩn bị ngay cả khi đường rất ngắn, rồi mỗi km cộng thêm 2 phút. Ta hãy giữ cả hai ý khi đọc “tuyến tính”. Trong hồi quy, người ta thường gọi dạng này là tuyến tính theo tham số; trong đại số tuyến tính, phép biến đổi có hằng số cộng khác 0 được gọi chính xác hơn là affine.

| Cảnh đời thực | Đại lượng thay đổi | Đại lượng cố định hoặc giới hạn |
|---|---|---|
| Giao một đơn hàng | 2 phút cho mỗi km | 5 phút chuẩn bị |
| Đặt cà phê cho một nhóm | 0.3 ca cho mỗi khách theo mô hình | Ca nguyên có thể cần làm tròn lên |
| Taxi có phí mở cửa | Tiền tăng theo quãng đường ở từng khoảng giá | Phí ban đầu, bậc giá và phụ phí |

**Đọc thành lời:** `Δt/Δd=2 phút/km` là “khi thêm một đoạn đường, thời gian tăng trung bình 2 phút trên mỗi km trong mô hình này”. Với hàm trên, `t/d=2+5/d` khi d>0; đây là thời gian **toàn bộ** chia cho quãng đường, không phải độ dốc. Hệ số 2 không mang đơn vị “phút” đơn thuần; nhân với km mới ra phút.

**Tính tay:** đi 3 km cho dự đoán `2×3+5=11` phút. Đi 6 km cho `2×6+5=17` phút. Quãng đường tăng gấp đôi nhưng thời gian chỉ tăng từ 11 lên 17, vì 5 phút chuẩn bị chỉ tính một lần. Thời gian tăng thêm là 6 phút cho 3 km tăng thêm, nên độ dốc vẫn bằng 2.

**Phản ví dụ:** lấy dự đoán 11 phút rồi nhân đôi thành 22 phút đã vô tình tính phí chuẩn bị hai lần. Quy tắc nhân đôi đầu vào rồi nhân đôi đầu ra chỉ đúng với tỉ lệ thuần `t(d)=ad`, không đúng nói chung khi có phần cộng b. Cùng một đồ thị thẳng không có nghĩa là cùng một quan hệ tỉ lệ.

**Giới hạn mô hình:** hệ số được ước lượng ở các chuyến 1–10 km không tự bảo đảm đúng với chuyến 200 km hoặc giờ kẹt xe. Nếu hai chuyến cùng d nhưng thời gian khác nhau, hàm vẫn cho cùng **dự đoán**, còn thực tế có nhiễu và biến chưa đưa vào. Ta có thể thêm giờ xuất phát làm đầu vào; không cần kết luận hàm số “bị sai định nghĩa”.

:::interactive ratio
:::

:::quiz
Theo t(d)=2d+5 phút, tăng quãng đường từ 3 lên 6 km làm thời gian tăng bao nhiêu?
A. 6 phút.
B. 11 phút.
C. 22 phút.
Đáp án: A
Giải thích: t(6)−t(3)=17−11=6; phần chuẩn bị 5 phút không đổi.
:::

**Tự thử thêm:** một dịch vụ thu `C(k)=8k+12` nghìn đồng cho k km. So sánh phí 2 km và 4 km, rồi giải thích vì sao không gấp đôi.

:::goi-y
Tính từng đầu ra riêng. So 2C(2) với C(4) và tìm phần bị đếm hai lần.
:::

:::loi-giai
C(2)=28, C(4)=44 nghìn đồng. Hai lần C(2)=56, cao hơn 12 vì đếm phí cố định hai lần. Chi phí tăng thêm cho 2 km là 16 nghìn đồng.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Phân biệt bằng lời "tỉ lệ thuần `y = 3x`" và "tuyến tính `y = 3x + 2`". Ở x = 0, mỗi mô hình cho y bằng bao nhiêu?
2. Trong `t = 2d + 5`, đâu là tốc độ thay đổi, đâu là giá trị khởi đầu? Nếu đơn có "5 phút chuẩn bị" bị xóa bỏ, công thức đổi thế nào?

### Luyện tập (áp dụng vào bài toán mới)
3. Một cửa hàng quần áo: giá phí chuyển kho cố định 30k + 5k mỗi món. Viết mô hình `cost = a·số_món + b` và tính chi phí cho 12 món.
4. Một xe "cứ 5 phút chờ thì thêm 1 km phát sinh trong phép tính" (sai — chờ không tốn km nhưng tốn phút). Hỏi: mô hình cho phí thời gian chờ nên là gì để *phản ánh* việc chờ tốn thời gian? (Gợi ý: tốc độ thay đổi của "thời gian chờ" theo "phút chờ" là rất trực tiếp.)

### Thử thách (liên hệ với máy tính/AI)
5. Cho 3 điểm dữ liệu: (1 khách → 3.2 ca), (10 khách → 5.0 ca), (20 khách → 8.1 ca). Vẽ phác thảo bằng lời xem chúng có gần một đường thẳng không. Nếu bạn phải chọn `a` và `b` cho `y = a·x + b` sao cho đường "gần" các chấm, bằng trực giác bạn ưu tiên giá trị nào cho a và b? *(Gợi ý: trung bình "ca mỗi khách" giữa các cặp, và điểm cắt trục y hợp lý.)*
6. Viết (bằng lời, chưa cần code) vì sao mô hình "cứ 3 ca cho 10 khách" lại là một hàm — và việc thêm hằng số `+2` làm nó *không còn* là "tỉ lệ thuần" như thế nào.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Tỉ lệ thuần: qua gốc, x=0→y=0. Tuyến tính: có khởi đầu, x=0→y=2. Chúng cùng *tốc độ* 3 nhưng khác *điểm xuất phát*.
2. Tốc độ = 2 (phút/km); khởi đầu = 5. Xóa chuẩn bị → `t = 2d`.
3. `cost = 5·số_món + 30`; với 12 món → `5×12 + 30 = 90` (nghìn).
4. Thời gian chờ mỗi phút tốn 1 phút → mô hình `total = thời_gian_chạy + phút_chờ` — nhận ra "phí chờ" là *cộng biến* theo thời gian chờ, có thể gắn hệ số 1. (Đừng nhầm km với phút — đơn vị phải khớp.)
5. Gợi ý: "ca mỗi khách" giữa (1→3.2) là 3.2; giữa (10→5.0) là 0.5/khách... — điểm dữ liệu không nằm trên 1 đường; a gần 0.25–0.3, b gần 2 (đường "xuyên qua" các chấm, không nhất thiết qua từng chấm). Điểm chính: không ép qua từng điểm, mà tìm đường "dân sự" nhất — là ý tưởng hồi quy (Chương 8 ML).
6. Vì nó là quy tắc biến `x` (số khách) thành `y` (số ca) một cách nhất quán — đúng định nghĩa hàm. Thêm `+2` làm điểm cắt trục y thành 2 (khác gốc 0) → không còn "tỉ lệ thuần" dạng `y=a·x` nữa.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. Không cần máy, ta vẫn dựng "mô hình" bằng trực giác — như cô chủ quán với "3 ca cho 10 khách".
2. Hàm số là *công thức dự đoán*: nhét đầu vào vào, ra đầu ra — cùng đầu vào luôn ra cùng đầu ra.
3. Mô hình tuyến tính có dạng "đầu ra = tốc độ × đầu vào + giá trị khởi đầu" (`y = a·x + b`).
4. Phân biệt "tỉ lệ thuần" (qua gốc 0) với "tuyến tính" (có hằng số khởi đầu); và phân biệt *mô hình* với *thực tế* — mô hình chỉ là xấp xỉ có giới hạn.
5. Khi máy "học", đơn giản nhất là nó *chọn con số a và b cho vừa dữ liệu* — đó là hồi quy tuyến tính, cửa ngõ vào học máy.