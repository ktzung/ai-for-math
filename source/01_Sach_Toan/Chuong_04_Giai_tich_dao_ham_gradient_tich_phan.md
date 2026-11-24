# Chương 4 — Giải tích: hàm, độ dốc, đạo hàm, tích phân và gradient

> **Câu hỏi lớn của chương:** *Làm sao biết một giá trị đang "đi lên hay đi xuống", nhanh đến mức nào — và làm sao dò ra điểm "đẹp nhất" giữa một địa hình gồ ghề?*

---

## 1. Mở đầu bằng một tình huống

Một anh làm app cho hãng taxi muốn đặt giá cước *hợp lý nhất*. Nếu giá quá cao → ít người đặt. Giá quá thấp → lỗ. Anh vẽ mối quan hệ trong đầu: trục ngang là **giá cước**, trục đứng là **tổng lợi nhuận**. Khi giá tăng dần, lợi nhuận tăng rồi **đạt một đỉnh**, sau đó tụt vì ít khách.

Anh tự hỏi: *"Làm thế nào máy tính tìm ra cái đỉnh đó, mà không cần thử cả triệu mức giá?"*

Câu trả lời nằm ở **đạo hàm** — công cụ đo "hướng và mức độ đi lên/xuống" của một đường cong từng điểm. Hiểu đạo hàm, bạn sẽ hiểu được *gradient descent*, thứ mà toàn bộ học sâu dùng để "tự điều chỉnh" mỗi bước (Chương 8 của sách này đưa gradient descent trọn vẹn).

Chương này cũng giới thiệu **tích phân** — phép "cộng dồn những lát cắt mỏng" — và **gradient** — bản nâng cấp của đạo hàm khi có nhiều biến. Cả ba cùng nhau là la bàn của mọi tối ưu hóa.

---

## 2. Trực giác trước

**Đạo hàm là độ dốc tại một điểm.**

Bạn đã quen độ dốc của *đường thẳng*: đường "lên 2, chạy 1" có độ dốc = 2. Nhưng đường cong không có một độ dốc duy nhất — nó *đổi dốc* từng chỗ. Đạo hàm trả lời: *"Tại đúng điểm này, đường dốc bao nhiêu?"*

Hãy hình dung bạn lái xe trên một ngọn đồi. Bạn nhìn đồng hồ tốc độ theo chiều dọc: nếu đang lên dốc dựng đứng, "độ dốc" lớn và dương; bằng trên đỉnh, độ dốc = 0 (chuẩn bị đổi chiều); xuống dốc, độ dốc âm. **Đạo hàm tại một điểm chính là "độ dốc của ngọn đồi tại đúng chỗ bánh xe đang đè".**

**Ý nghĩa** cho tối ưu hóa: nếu bạn muốn **lên đỉnh** (tối đa), bạn đi theo hướng độ dốc dương; muốn **xuống đáy** (tối thiểu) bạn đi ngược. Máy tính "tối ưu hóa" đơn giản là: *nhìn độ dốc tại chỗ mình đứng, bước một bước nhỏ theo hướng làm mình tiến gần đích hơn, lặp lại.*

**Phép so sánh "đạo hàm = độ dốc ngọn đồi":** trực quan và đúng cho 1 biến. **Giới hạn:** đồi có 2 chiều (ngang, dọc) còn dữ liệu thật có hàng nghìn chiều — khi đó "độ dốc" thành **gradient** (một vector hướng dốc nhất), và "đỉnh/đáy" thành cực trị trong không gian nhiều chiều. Khái niệm vẫn vậy, chỉ thêm chiều.

---

## 3. Thử giải bằng cách chưa chính thức

Anh taxi không biết đạo hàm, nhưng anh có thể *thử* bằng cách:

1. Đặt mức giá A → thấy lợi nhuận đang tăng khi tăng giá.
2. Tăng giá lên A+1 → lợi nhuận vẫn tăng → mình còn "dưới đỉnh".
3. Cứ tăng mãi đến khi đặt mức giá B thì lợi nhuận *bắt đầu giảm* → quá đỉnh rồi.
4. Quay lại "vùng lân cận đỉnh" và thử bước nhỏ để tìm chính xác.

Đây chính là **thử dò theo độ dốc** — hợp lý, tự nhiên, nhưng chậm và mơ hồ ("bắt đầu giảm" là khi nào? bước nên lớn hay nhỏ?). Đạo hàm thay *thử mù* này bằng **một con số chính xác tại từng điểm**: nó báo hướng (đi lên/đi xuống) và mức độ (dốc bao nhiêu), để ta bước một cách thông minh. Đó chính là cách gradient descent "tinh" hơn cách dò tay.

---

## 4. Đặt tên cho ý tưởng

- **Đạo hàm (derivative):** độ dốc tức thời của hàm tại một điểm. Ký hiệu `f'(x)` đọc "f phẩy của x", hoặc `df/dx` đọc "d-f trên d-x" — nghĩa là "tốc độ f thay đổi khi x thay đổi". Đó là mức tăng của f khi ta *tăng x một chút xíu*.
- **Hệ số góc tức thời:** đạo hàm tại điểm = giá trị của "độ dốc" ở đó. Dương = đang lên, âm = đang xuống, bằng 0 = bằng phẳng (có thể là đỉnh/đáy).
- **Cực trị (extremum):** điểm mà hàm đạt giá trị lớn nhất (cực đại) hoặc nhỏ nhất (cực tiểu). Tại đó đạo hàm thường bằng 0.
- **Gradient (khi nhiều biến):** vector chứa tất cả các đạo hàm riêng theo từng biến. Nó *chỉ hướng dốc nhất* trên "địa hình" nhiều chiều. Ký hiệu `∇f` (đọc "nabla f").
- **Tích phân (integral):** cộng dồn vô số lát cắt cực mỏng; về mặt hình học là **diện tích dưới đường cong**. Ký hiệu `∫ f(x) dx`.
- **Quy tắc dây chuyền (chain rule):** cách lấy đạo hàm khi hàm này bọc hàm kia; nền của backpropagation (Chương 3 lộ trình ML).

Ba cái cần nắm vững: **đạo hàm (1 biến) → gradient (nhiều biến) → dây chuyền (khi hàm lồng nhau)**. Chúng là ba khối gạch của mọi thuật toán học sâu.

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Đạo hàm của hàm bậc hai

Anh taxi dùng hàm lợi nhuận giả lập: `P(g) = −2g² + 40g` với `g` là giá cước (chục nghìn), `P` là lợi nhuận (triệu đồng). (Dấu `−2g²` làm đường cong ngửa xuống → có đỉnh.)

**Đọc ký hiệu:**
- `P` = lợi nhuận.
- `g` = giá cước.
- `−2g²` = thành phần làm cong xuống (nếu giá quá cao, lợi nhuận oặt).
- `+40g` = thành phần tuyến tính (giá tăng thì lợi nhuận tăng).

**Quy tắc đạo hàm căn bản** (chỉ cần vận dụng, không cần chứng minh):
- Đạo hàm của `b·g²` là `2·b·g`.
- Đạo hàm của `c·g` là `c`.
- Đạo hàm của hằng số là `0`.

Áp dụng:
- Đạo hàm của `−2g²` = `−2 × 2g = −4g`.
- Đạo hàm của `+40g` = `+40`.
- Vậy `P'(g) = −4g + 40`.

**Giải thích từng phần:** `−4g` chịu trách nhiệm "kéo lợi nhuận xuống khi giá cao"; `+40` là mức lợi nhuận tăng thêm nền tảng khi tăng giá. Đạo hàm nói cho ta: *khi tăng g thêm một chút, lợi nhuận đổi bao nhiêu*.

### 5.2 Gradient (nhiều biến)

Hàm hai biến `L(a, b) = (a − 3)² + (b − 1)²`. Đây là "thước đo sai số" nhỏ nhất khi a=3, b=1 (Chương 8 sẽ thấy dạng này hoài).

- **Đạo hàm riêng theo a:** giữ b cố định, lấy đạo hàm theo a. Của `(a−3)²` là `2(a−3)`; phần `(b−1)²` không chứa a nên = 0. → `∂L/∂a = 2(a−3)`.
- **Đạo hàm riêng theo b:** tương tự, `∂L/∂b = 2(b−1)`.
- **Gradient:** `∇L = (∂L/∂a, ∂L/∂b) = (2(a−3), 2(b−1))`.

**Diễn giải:** gradient là một *vector* chỉ "hướng mà hàm tăng nhanh nhất" tại điểm đang đứng. Nếu bạn muốn *giảm* L (giảm sai số), bạn đi *ngược* gradient: từng bước nhỏ theo `−∇L`. Đó chính là gradient descent.

Ví dụ tại `(a,b) = (4, 2)`: `∇L = (2(1), 2(1)) = (2, 2)`. Hàm đang tăng nhanh nhất theo hướng (2,2); để giảm, ta lùi về phía (3,1) — đúng chỗ làm L nhỏ nhất. Số 2 nói cho ta "bước nên đẩy mạnh đến đâu".

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Tìm đỉnh lợi nhuận của anh taxi

**Bài toán:** `P(g) = −2g² + 40g`. Đỉnh lợi nhuận ở mức giá nào?

**Bước 1 — Tìm đạo hàm:** `P'(g) = −4g + 40` (đã làm ở trên).

**Bước 2 — Tìm nơi đạo hàm bằng 0 (đỉnh/đáy):** giải `P'(g) = 0`:
`−4g + 40 = 0 → 4g = 40 → g = 10`.

**Bước 3 — Kiểm tra đây là đỉnh (cực đại), không phải đáy:** vì hệ số `−2` của `g²` âm, đường cong ngửa xuống → tại g=10 là **cực đại** (đỉnh). (Nếu hệ số dương, đó là đáy.)

**Bước 4 — Tính lợi nhuận tại đỉnh:** `P(10) = −2(100) + 40(10) = −200 + 400 = 200`.

**Bước 5 — Giải thích:** mức giá tối ưu ≈ 10 (chục nghìn = 100.000 VNĐ), lợi nhuận đỉnh = 200 triệu. Đạo hàm giúp máy tính tìm đỉnh **bằng cách tính, không phải thử từng mức giá** — nhanh gấp khối lần so với dò tay ở mục 3.

*(Kiểm tra hợp lý: tại g=9, P=−162+360=198 <200; tại g=11, P=−242+440=198 <200 → đúng là đỉnh.)*

### Ví dụ B — Quy tắc dây chuyền (backprop trực giác)

**Bài toán:** Hàm lồng nhau `h(x) = (2x + 1)²`. Đạo hàm theo x?

**Bước 1 — Tách "bên trong" và "bên ngoài":**
- `u = 2x + 1` (phần trong).
- `h = u²` (phần ngoài).

**Bước 2 — Dây chuyền:** `h'(x) = (đạo hàm phần ngoài theo u) × (đạo hàm u theo x)`.
- Đạo hàm u² theo u = `2u`.
- Đạo hàm của `2x+1` theo x = `2`.

**Bước 3 — Nhân lại rồi thay u:** `h'(x) = 2u × 2 = 4u = 4(2x + 1)`.

**Bước 4 — Kiểm tra số:** thử x=1: trực tiếp, `h(1) = 9`; tại x=1.1, `h(1.1) = (3.2)²=10.24`, chênh 1.24 ứng với delta x=0.1 → `h' ≈ 1.24/0.1 = 12.4`; công thức `4(2×1+1)=12` gần đúng. ✔

**Bước 5 — Vì sao quan trọng:** một mạng nơ-ron là một **chuỗi hàm lồng nhau** (tầng này bọc tầng kia). Muốn biết "thay đổi trọng số ở tầng sâu ảnh hưởng lỗi ở đầu ra thế nào", ta dùng dây chuyền — đây chính là cơ chế **lan truyền ngược (backpropagation)**, lõi của học sâu. Nắm ví dụ B này là nắm trực giác cốt lõi.

### Ví dụ C — Tích phân như "cộng dồn lát cắt"

**Bài toán:** Ước tính quãng đường đi được khi tốc độ thay đổi.

**Bước 1 — Tình huống:** xe chạy với tốc độ v(t)=3 km/h đầu giờ, rồi tăng dần 2 km/h mỗi giờ → `v(t) = 2t + 3` (t: giờ).

**Bước 2 — Nếu tốc độ cố định:** quãng đường trong 2h = tốc độ × 2. Nhưng tốc độ đổi, nên "tốc độ × thời gian" từng khoảng một:

**Bước 3 — Chia lát mỏng:** chia 0→2giờ thành 4 khoảng 0.5h, lấy tốc độ đại diện mỗi khoảng rồi cộng "tốc độ×0.5":
- 0–0.5h: v≈3 → 3×0.5=1.5 km
- 0.5–1h: v≈4 → 4×0.5=2.0 km
- 1–1.5h: v≈5 → 5×0.5=2.5 km
- 1.5–2h: v≈6 → 6×0.5=3.0 km
- Tổng ≈ 9 km.

**Bước 4 — Khi lát cực mỏng:** tổng này về chính xác bằng **diện tích dưới đường v(t)** nằm giữa t=0 và t=2. Đó là **tích phân**: `∫₀² (2t+3) dt`. (Giá trị chính xác tính được = 10 km — chia đủ mỏng thì tổng trên tiến về 10.)

**Bước 5 — Giải thích:** tích phân = phép toàn "gom vô hạn lát nhỏ lại thành một tổng". Nó xuất hiện khi ta cần "cộng dồn" đại lượng thay đổi liên tục: quãng đường từ tốc độ, diện tích từ đường cong, tuổi thọ/khối lượng từ hàm mật độ (xác suất, Chương 5).

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

**Gradient descent — cách máy "học".** Nhớ anh taxi: hàm `P(g)` là "thước đo cần tối ưu". Trong học máy, thước đo ấy gọi là **hàm mất mát (loss)** — ví dụ lỗi dự đoán trên dữ liệu. Mô hình có nhiều tham số (a, b, ... mà ta gọi là **trọng số**). Thuật toán:

1. Tính **gradient** của loss theo mọi trọng số (dùng dây chuyền/backprop).
2. Bước nhỏ *ngược* gradient (vì ta muốn *giảm* lỗi).
3. Lặp lại rất nhiều lần.

Mỗi "bước nhỏ" này là đạo hàm đang sống: ta vừa thấy nó ở quy tắc gradient `∇L`. Chương 8 sẽ đưa toàn bộ (dù ở mức trực giác + 1 biến → nhiều biến). Còn gradient descent gọi tên trọn vẹn ở đó.

**Backpropagation** dùng dây chuyền (Ví dụ B) để "đưa thông tin lỗi từ đầu ra ngược về từng trọng số". Không có nó, không có mạng nơ-ron học được.

**Tích phân** xuất hiện trong xác suất (diện tích = xác suất, Chương 5), trong các hàm mất mát liên tục, và tín hiệu/ảnh (nén, filter). Hiểu "tích phân = cộng dồn lát cắt" giúp bạn đọc được các công thức xác suất và tín hiệu sau này.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Đạo hàm bằng 0 nghĩa là đây là điểm tốt nhất (đỉnh/đáy)."** Không hẳn. Đạo hàm = 0 chỉ là *điểm dừng* — có thể là **cực đại**, **cực tiểu**, hoặc **điểm yên** (nơi bằng phẳng nhưng không phải đỉnh/đáy). Phải kiểm tra bản chất (dấu quanh đó, hoặc đạo hàm bậc hai). Đừng vội kết luận từ một con số.

**Nhầm 2: "Đạo hàm và gradient là một."** Trong 1 biến thì giống nhau về ý. Nhưng với nhiều biến, *gradient* là **vector** chứa mọi đạo hàm riêng, *chỉ hướng dốc nhất*. Nhầm dẫn đến sai khi tối ưu nhiều chiều (dữ liệu thật luôn nhiều chiều).

**Nhầm 3: "Tích phân là 'diện tích', đạo hàm là 'độ dốc' — hai thứ không liên quan."** Thực ra chúng là *phép ngược nhau* (định lý cơ bản của giải tích): lấy đạo hàm của tích phân lại ra nguyên hàm, và ngược lại. Tích phân = "gom đạo hàm lại". Nhớ mối liên hệ "độ dốc ↔ diện tích" thay vì coi chúng là hai vũ trụ riêng.

**Giới hạn của phép so sánh "đạo hàm = độ dốc đồi":** đồi chỉ 2D dễ hình dung; dữ liệu ML hàng nghìn chiều, "đi lên/đi xuống" thành khái niệm vector hóa, và *cực trị toàn cục* (đỉnh thật giữa nhiều đỉnh) khó tìm hơn cực trị địa phương (một đỉnh gần đó). Đừng mang "một đồi, một đỉnh" vào không gian nhiều chiều.

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: tối ưu hóa (tìm giá, mức, tham số đẹp nhất), đo tốc độ thay đổi (dự báo, xu hướng), tính "cộng dồn" (diện tích, quãng đường, xác suất), hoặc hiểu học sâu (backprop, gradient descent). Hầu như mọi thuật toán ML đều "chạy trên đạo hàm".

Nó **không nên áp dụng máy móc** khi: hàm không trơn (nhảy bậc, luồng rời rạc) thì đạo hàm không tồn tại đúng nghĩa — lúc đó dùng phương pháp rời rạc; hoặc khi bạn chỉ cần một phép xấp xỉ tay (đừng bắt buộc phải "lấy đạo hàm" cho mọi thứ). Và: *một cực trị địa phương tìm thấy bằng gradient descent chưa chắc là toàn cục* — đừng khẳng định "chắc chắn tốt nhất".

---

## Đọc sâu — đạo hàm là tốc độ thay đổi, không phải lượng thay đổi

Khi nhìn đồng hồ tốc độ, bạn biết xe đang chạy nhanh đến đâu tại thời điểm ấy. Bạn chưa biết đã đi bao xa trong cả hành trình. Đạo hàm và tích phân phân chia đúng hai nhiệm vụ đó; gradient mở rộng câu hỏi tốc độ thay đổi sang nhiều đầu vào.

| Cảnh đời thực | Đại lượng tức thời | Đại lượng tích lũy |
|---|---|---|
| Xe đang di chuyển | Vận tốc tại một thời điểm | Độ dời từ tích phân vận tốc có dấu |
| Bể đang được bơm nước | Lưu lượng lít/phút | Thể tích nước thêm vào |
| Mô hình đang thay một trọng số | Đạo hàm loss theo trọng số tại chỗ đang xét | Thay đổi loss qua một bước hữu hạn cần kiểm tra |

**Đọc thành lời:** `f′(x)=limₕ→₀ [f(x+h)−f(x)]/h` là “lấy mức đổi đầu ra chia cho mức đổi đầu vào, rồi xét giới hạn khi bước đầu vào tiến về 0”. Không thay h=0 trực tiếp vào phân số. Nếu f đo mét và x đo giây, đạo hàm có đơn vị mét/giây. Công thức `Δf≈f′(x)Δx` là xấp xỉ địa phương, không phải đẳng thức cho mọi bước.

**Tính tay:** với `f(x)=x²`, ở x=2 có f′(2)=4. Tăng x thêm 0.1, dự đoán tuyến tính cho mức tăng khoảng `4×0.1=0.4`. Giá trị thật tăng `2.1²−2²=0.41`; chênh 0.01 là phần bị bỏ qua. Tăng h từ 0.1 lên 1 thì dự đoán tăng 4, thực tế tăng 5: bước càng lớn, sai số xấp xỉ có thể càng rõ.

**Phản ví dụ:** f′(0)=0 với `f(x)=x³`, nhưng 0 không phải cực đại hay cực tiểu; hàm vẫn tăng khi đi qua 0. Và tích phân vận tốc âm không phải diện tích hình học dương: nếu vận tốc là 2 m/s trong 1 giây rồi −2 m/s trong 1 giây, độ dời là 0 m nhưng quãng đường là 4 m. Muốn tính quãng đường, tích phân độ lớn vận tốc.

**Giới hạn:** gradient là hướng tăng nhanh nhất khi so những dịch chuyển có cùng độ dài Euclid và hàm khả vi. Nó cung cấp thông tin địa phương; một bước lớn ngược gradient vẫn có thể làm loss tăng. Ở điểm không khả vi như đỉnh nhọn của |x|, đạo hàm thông thường không tồn tại, nhưng các phương pháp dùng dưới gradient vẫn có thể tối ưu; không phải mọi hàm không trơn đều phải chuyển sang bài toán rời rạc.

:::interactive derivative
:::

:::quiz
Với f(x)=x², từ x=2 tăng thêm 0.1 thì thay đổi thật của f bằng bao nhiêu?
A. 0.4, luôn chính xác vì f′(2)=4.
B. 4.1.
C. 0.41; 0.4 chỉ là xấp xỉ tuyến tính.
Đáp án: C
Giải thích: 2.1²−2²=0.41, còn f′(2)×0.1=0.4 là dự đoán địa phương.
:::

**Tự thử thêm:** bể nhận lưu lượng `q(t)=2t+1` lít/phút trong 0–2 phút. Tính lượng nước thêm bằng diện tích hình thang.

:::goi-y
Tốc độ đầu và cuối là 1 và 5 lít/phút. Vì lưu lượng biến thiên tuyến tính, lấy trung bình hai đầu rồi nhân thời gian.
:::

:::loi-giai
Lượng thêm=(1+5)/2×2=6 lít. Cũng có thể tính tích phân: [t²+t] từ 0 đến 2 bằng 6. Đơn vị lưu lượng nhân thời gian trở lại lít.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Giải thích bằng lời: đạo hàm tại một điểm của đường cong nói gì về ngọn đồi tại đó? Giá trị dương/âm/0 lần lượt nghĩa gì?
2. Tính đạo hàm của `f(x) = 3x² + 2x`.
3. Tại điểm có đạo hàm = 0, hàm đang lên, xuống hay bằng phẳng? Có chắc đó là đỉnh không?

### Luyện tập (áp dụng vào bài toán mới)
4. Cho `L(a,b) = (a−5)² + (b−2)²`. Viết gradient `∇L`. Tại `(a,b)=(6,3)`, gradient bằng bao nhiêu? Về phía nào để giảm L?
5. Tìm đỉnh của `P(g) = −g² + 60g` (tương tự Ví dụ A). Giá trị `g` tối ưu và lợi nhuận đỉnh.
6. Dùng dây chuyền tính đạo hàm của `h(x) = (x + 3)³` (gợi ý: u = x+3; đạo hàm u³ theo u = 3u²).

### Thử thách (liên hệ với máy tính/AI)
7. Một mô hình dự đoán ghía cước: trọng số `w` duy nhất, hàm mất mát `Loss(w) = (w − 2)²`. Đạo hàm là `2(w−2)`. Bạn đang ở `w=0`. Giải thích bằng lời + con số: gradient tại đó là mấy, hướng bạn phải bước để giảm loss, và vì sao đi *ngược* gradient. Mô phỏng 2 bước với learning rate 0.5.
8. Giải thích vì sao dây chuyền (Ví dụ B) chính là "cách lỗi lan ngược" trong mạng nhiều tầng. Viết 3–5 câu.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Dương = đi lên, âm = đi xuống, 0 = bằng phẳng (chỗ "chuyển hướng" — chưa chắc đỉnh).
2. `f'(x) = 6x + 2`.
3. Bằng phẳng nhất thời; chưa chắc đỉnh, có thể điểm yên. Cần kiểm tra thêm.
4. `∇L = (2(a−5), 2(b−2))`; tại (6,3) = (2,2). Để giảm L, bước ngược → về phía (5,2) (điểm làm L=0, bé nhất).
5. `P'(g) = −2g+60=0 → g=30; P(30)=−900+1800=900` → giá 30, lợi nhuận 900.
6. `3(x+3)² × 1 = 3(x+3)²`.
7. `w=0 → ∇ = 2(0−2) = −4`. Gradient âm: hàm đang giảm khi tăng w (đi xuống) → để giảm loss, đi *ngược* (dương): `w_new = w − 0.5×∇ = 0 − 0.5×(−4) = 2` → Bước 1: w=2; gradient tại 2 = 0 (dừng, đã đạt đúng cực tiểu loss=0). Đây là gradient descent một bước thành công với lr 0.5. Lưu ý nếu lr quá lớn (VD 2): `w=0−2×(−4)=8`, tụt xa → minh họa lý do cần lr hợp lý.
8. Gợi ý: mỗi tầng là hàm lồng tầng trước; lỗi ở đầu ra cần "lan về" tầng trước qua đạo hàm từng lớp; dây chuyền cho phép truyền ngược lỗi đó, từng lớp một — chính là backpropagation.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. **Đạo hàm** = độ dốc tức thời của đường cong tại một điểm — báo hướng đi lên/xuống và nhanh chậm.
2. **Gradient** = bản nhiều chiều của đạo hàm, chỉ *hướng dốc nhất* trên địa hình nhiều biến.
3. Máy "tối ưu hóa" bằng cách **bước ngược gradient** từng bước nhỏ để giảm sai số — đó là gradient descent.
4. **Dây chuyền** giúp tính đạo hàm của hàm lồng nhau — chính là cách lỗi lan ngược trong mạng nơ-ron (backprop).
5. **Tích phân** = "cộng dồn vô hạn lát mỏng" (diện tích, quãng đường, xác suất) — phép ngược của đạo hàm.