# Chương 3 — Đại số tuyến tính: vector, ma trận, biến đổi và trị riêng

> **Câu hỏi lớn của chương:** *Làm thế nào một bức ảnh hay một bảng dữ liệu trở thành "một con số" mà máy xử lý được — và máy "biến đổi" nó như thế nào?*

---

## 1. Mở đầu bằng một tình huống

Một chị chủ một website bán giày nhỏ. Chị muốn gợi ý: *"Người xem đôi này có thể cũng thích đôi kia."* Mỗi đôi giày, chị ghi lại vài đặc điểm: giá tiền (triệu VNĐ), thang điểm thoải mái (1–10), thang điểm thời trang (1–10). Chị viết mỗi đôi thành một dòng số:

```
Đôi A: (1.2, 8, 7)
Đôi B: (1.8, 6, 9)
Đôi C: (1.0, 9, 5)
```

Với ba "dòng số" này, chị tự hỏi: *"Làm sao biết ai giống ai, để nói 'người thích A có thể thích C'?"* Và *"Nếu ai đó thích A và C, tôi tưởng tượng một 'đôi giày trung bình' lý tưởng là gì?"*

Điều chị đang làm mà chưa biết tên — đó chính là **đại số tuyến tính**. Mỗi dòng số là một **vector**. Một công cụ có thể dùng để xây dựng điểm "giống nhau" là **tích vô hướng** — nhưng ý nghĩa điểm số còn tùy cách biểu diễn và thang đo. Còn việc biến một vector thành một dạng khác (ví dụ: chuyển "3 đặc điểm" sang "1 điểm xếp hạng tổng hợp") chính là **ma trận biến đổi**.

Và đây chính là ngôn ngữ của dữ liệu: mọi thứ máy tính "nhìn thấy" — ảnh, văn bản, bảng dữ liệu — trước khi xử lý đều được xếp gọn thành **các vector và ma trận**. Chương này dạy bạn đọc ngôn ngữ đó.

---

## 2. Trực giác trước

**Vector là một danh sách số có trật tự.** "Trật tự" là chìa khóa: `(1.2, 8, 7)` khác `(7, 1.2, 8)`. Vị trí thứ nhất luôn là giá tiền, thứ hai là độ thoải mái, thứ ba là thời trang. Nghĩ vector như *một phiếu đăng ký*: mỗi ô (vị trí) có một ý nghĩa cố định, và giá trị điền vào.

Ta cũng có thể vẽ vector lên giấy. Một vector có 2 thành phần `(x, y)` là một **điểm** (hoặc mũi tên) trong mặt phẳng:
- `(1, 2)` → điểm cách trục đứng 1 và cách trục ngang 2.
- Vẽ được vì có 2 chiều. Vector giày có 3 thành phần → 3 chiều, khó vẽ nhưng ta tưởng tượng là "điểm trong không gian 3D". Dữ liệu thật có hàng trăm, hàng nghìn thành phần → **nhiều chiều**, không vẽ nổi, nhưng toán không bận tâm: các con số vẫn trừ, cộng, nhân y hệt.

**Ma trận là một bảng số.** Nếu bạn có nhiều vector xếp chồng lên nhau, bạn có một ma trận — giống bảng tính của chị chủ giày (mỗi hàng một đôi giày):

```
[, giá , thoải mái , thời trang ]
[ A , 1.2 ,    8   ,     7     ]
[ B , 1.8 ,    6   ,     9     ]
[ C , 1.0 ,    9   ,     5     ]
```

Ma trận = "bảng dữ liệu". Lập trình viên gọi đó là **mảng 2 chiều**; nhà khoa học dữ liệu gọi là **bảng**; người làm học sâu gọi là **tensor bậc 2** (Chương lộ trình ML sẽ dùng từ này). Tất cả là ma trận.

**Phép so sánh "vector = phiếu đăng ký / ma trận = bảng tính":** giúp thấy trật tự và cấu trúc. **Giới hạn:** vector còn mang ý nghĩa *hình học* (điểm/hướng trong không gian) mà phiếu đăng ký không diễn tả được — ta sẽ dùng ý nghĩa hình học khi nói về biến đổi ở mục 6.

---

## 3. Thử giải bằng cách chưa chính thức

**Bài toán của chị chủ giày:** chị muốn so sánh độ "giống nhau" giữa đôi A `(1.2, 8, 7)` và đôi C `(1.0, 9, 5)`. Chưa cần ký hiệu, chị làm bằng **so sánh mắt**:

- Giá: A=1.2, C=1.0 → gần nhau (chênh 0.2).
- Thoải mái: 8 vs 9 → gần nhau (chênh 1).
- Thời trang: 7 vs 5 → chênh 2, hơi xa.

Tổng khoảng cách cảm nhận ≈ nhỏ → chị kết luận: *"A và C khá giống, người thích A có thể thích C."* 

Đây là **cách chưa chính thức**: trực quan, hợp lý, nhưng mơ hồ — "khá giống" là bao nhiêu? Làm sao so máy tính so được? Ta cần một **con số định lượng** cho "độ giống nhau". Và cần một quy trình có thể giao cho máy. Điều đó dẫn ta đến phép toán trung tâm: **tích vô hướng (dot product)**.

---

## 4. Đặt tên cho ý tưởng

- **Vector:** danh sách số có trật tự, thường viết dạng cột `v = (v₁, v₂, …, vₙ)`. Vị trí `v₁`, `v₂`... được gọi là **thành phần** (component). Số thành phần gọi là **chiều** (dimension).
- **Ma trận:** bảng số gồm các **hàng** (row) và **cột** (column), ký hiệu dạng m×n (m hàng, n cột).
- **Tích vô hướng (dot product):** với hai vector cùng chiều `a · b = a₁b₁ + a₂b₂ + …`. Nó cộng dồn sản phẩm từng thành phần tương ứng — cho một **con số**. Trong một số cách biểu diễn, con số ấy được dùng làm điểm "khớp" giữa hai vector; nó phụ thuộc cả độ dài và góc giữa chúng.
- **Nhân ma trận–vector:** ma trận "biến đổi" một vector thành vector mới, theo quy tắc tường minh (mục 6).
- **Biến đổi tuyến tính:** một quy tắc biến vector thành vector, nằm trong nhóm "tuyến tính" (bảo toàn tổng và tỉ lệ). Ma trận là *công cụ viết ra* biến đổi tuyến tính.
- **Vector riêng & trị riêng (eigenvector/eigenvalue):** có những vector khác 0 mà phép biến đổi chỉ nhân với một số — đó là vector riêng; số nhân có dấu ấy là trị riêng (mục 7).

Nắm ý **tích vô hướng** trước, nó là "khối gạch" của mọi thứ sau: ma trận nhân vector chính là "một chuỗi tích vô hướng".

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Viết vector và ma trận bằng ký hiệu

- Vector A của đôi giày: `v_A = (1.2, 8, 7)`. Thành phần thứ 1 = `1.2`.
- Ma trận toàn bộ (3 hàng, 3 cột) — viết `M` là ma trận kích thước **3×3**: mỗi hàng là một vector giày.

**Quy ước quan trọng:** trong nhiều tài liệu (và trong máy học), vector viết dạng **cột**. Nhân ma trận với vector cột tuân theo thứ tự: **ma trận nhân vector**. Ta sẽ dùng quy ước này để khớp với cách lập trình (Chương lộ trình ML dùng `torch.matmul`).

### 5.2 Tích vô hướng từng bước

Cho hai vector `a = (1.2, 8, 7)` và `c = (1.0, 9, 5)`:

**Kí hiệu:** `a · c`

**Quy tắc:** nhân từng thành phần tương ứng rồi cộng dồn:

```
a·c = (1.2×1.0) + (8×9) + (7×5)
    =  1.2      +  72   + 35
    = 108.2
```

**Giải thích ý nghĩa:** con số 108.2 lớn hay nhỏ tùy thuộc thang đo của các thành phần. Khi thành phần nào càng "khớp" (cùng lớn), tích của chúng càng lớn, góp nhiều vào tổng. Vì vậy tích vô hướng **khớp hai vector lại với nhau theo kiểu "cùng lớn thì đóng góp nhiều"**.

**Câu hỏi tiếp theo:** nếu ta nhân một vector lên 10 lần mà giữ nguyên hướng, tích vô hướng cũng tăng 10 lần. Vậy điểm cao hơn có thật sự nghĩa là "giống hơn"? Muốn so sánh hướng, ta cần phân biệt **độ lớn**, **hướng** và hai kiểu chuẩn hóa dưới đây.


### 5.3 Độ lớn và hướng nói hai điều khác nhau

Hãy nhìn vector vận tốc `v=(3,4)` m/s: nước chảy về phía Đông 3 m/s và phía Bắc 4 m/s. **Độ lớn** là tốc độ tổng hợp: `‖v‖₂ = √(3²+4²) = 5` m/s. **Hướng** được mô tả bởi `v/‖v‖₂ = (0.6,0.8)`. Nếu dòng chảy nhanh gấp đôi, vector thành `(6,8)`: độ lớn thành 10, hướng giữ nguyên.

Với vector số thực `v=(v₁,…,vₙ)`, **độ dài Euclid** hay **norm L2** là `‖v‖₂ = √(v₁²+…+vₙ²)`. Khi v khác 0, chia từng thành phần cho độ dài tạo **vector đơn vị** `v̂ = v/‖v‖₂` có độ dài 1.

| Đối tượng | Vector biểu diễn | Độ lớn nói gì? | Hướng nói gì? |
|---|---|---|---|
| Dòng nước | (vận tốc Đông, vận tốc Bắc), cùng đơn vị m/s | Norm L2 là tốc độ | Nước đi về phía nào |
| Giỏ hàng | Tiền dành cho (gạo, thịt, rau), cùng đơn vị nghìn đồng | Norm L2 là một thước đo quy mô; **tổng chi tiêu** là tổng các thành phần, tức norm L1 khi chúng không âm | Cơ cấu chi tiêu: nhân toàn bộ khoản tiền với cùng một số dương giữ nguyên hướng |
| Lượt xem phim | (số phim hành động, lãng mạn, hài) | Phụ thuộc cả lượng xem và cách phân bố; tổng lượt xem là tổng các thành phần | Tỉ lệ giữa các thể loại; dùng làm mô hình đơn giản của gu xem |
| Embedding đã học | Một dãy số do mô hình tạo ra | Ý nghĩa phụ thuộc mô hình và cách huấn luyện; không mặc định là độ chắc chắn | Quan hệ giữa các hướng có thể phản ánh sự tương đồng khi mô hình được huấn luyện phù hợp |

**Giới hạn:** hướng không tự mang nghĩa "thuộc loại gì" cho mọi vector. Ta cần chọn đặc trưng, đơn vị và thang đo phù hợp. Với vector khác 0, các bội **dương** có cùng hướng; bội âm đảo hướng. Vector 0 có độ lớn 0 nhưng không có hướng xác định.

### 5.4 Hai kiểu chuẩn hóa cần phân biệt

- **Đổi thang đo từng đặc trưng:** min–max xử lý *từng cột* trên nhiều mẫu, đưa giá trị trong khoảng quan sát về 0–1. Phép này thay đổi hình học của dữ liệu và có thể đổi góc giữa các vector. Ví dụ A sẽ làm rõ; khi học máy, các min/max phải được tính từ tập huấn luyện rồi dùng lại cho tập khác để tránh rò rỉ dữ liệu.
- **Chuẩn hóa L2 từng vector:** xử lý *từng mẫu khác 0*, chia cho chính độ dài của nó. Phép này bỏ độ lớn, giữ hướng trong hệ tọa độ đang dùng.

Hai phép trả lời hai câu hỏi khác nhau. Min–max không bảo đảm mỗi vector dài 1; L2 không thay thế việc chọn đơn vị hoặc cân thang đo đặc trưng.

### 5.5 Cosine — chỉ so hướng sau khi chọn cách biểu diễn

Với hai vector số thực **cùng chiều và đều khác 0**, ta định nghĩa:

`cosine(a,b) = (a·b) / (‖a‖₂ ‖b‖₂) = â·b̂`.

Kết quả nằm trong [−1,1]: 1 khi cùng hướng, 0 khi vuông góc, −1 khi ngược hướng. Các cách diễn giải "cùng gu" hoặc "cùng nghĩa" cần thêm giả định về cách tạo vector.

**Ví dụ cùng hướng, khác độ lớn:** `a=(3,4)`, `b=(6,8)`. Ta có `a·b=50`, `‖a‖₂=5`, `‖b‖₂=10`, nên cosine bằng 1. Nếu thay b bằng `c=(30,40)`, dot tăng thành 250 nhưng cosine vẫn bằng 1. Dot giữ ảnh hưởng của độ lớn; cosine bỏ ảnh hưởng ấy.

**Phản ví dụ để tự kiểm tra:** `q=(1,0)`, `u=(1,0)`, `w=(2,2)`. Dot cho `q·w=2 > q·u=1`, nhưng cosine cho `cosine(q,w)=1/√2≈0.707 < cosine(q,u)=1`. Vì vậy dot lớn hơn chưa chắc là hướng gần hơn.

**Trường hợp đặc biệt:** nếu một vector bằng 0 thì mẫu số bằng 0, cosine không xác định. Phần mềm có thể đặt một quy ước xử lý, nhưng quy ước đó không biến vector 0 thành vector có hướng.

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Tính một điểm khớp sau khi đổi thang đo từng đặc trưng

**Bài toán:** So sánh độ giống giữa A và C theo con số.

**Bước 1 — Nhận diện khó khăn:** ở phép tính trên, chiều thoải mái đóng góp 72, chiều thời trang 35, còn chiều giá chỉ 1.2. Hai chiều điểm số đang lấn át chiều giá về mặt số học. Nếu đổi giá từ triệu sang nghìn đồng, riêng tích của hai giá lại tăng một triệu lần! Ta chọn đổi từng cột về khoảng 0–1 bằng **min–max** trên ba đôi A, B, C để minh họa một cách cân thang đo.

**Bước 2 — Chuẩn hóa từng cột:** lấy `(giá trị − min) / (max − min)`. Min và max lấy từ cùng bảng dữ liệu cho mọi đôi giày; cột có max=min cần quy ước riêng vì không thể chia cho 0.
- Cột giá: min=1.0, max=1.8 → A giá chuẩn hóa = (1.2−1.0)/(1.8−1.0)=0.25; C = (1.0−1.0)/0.8=0.
- Cột thoải mái: min=6, max=9 → A= (8−6)/3≈0.67; C=(9−6)/3=1.
- Cột thời trang: min=5, max=9 → A=(7−5)/4=0.5; C=(5−5)/4=0.

**Bước 3 — Tính tích vô hướng sau chuẩn hóa:**
`A′·C′ = (1/4)×0 + (2/3)×1 + (1/2)×0 = 2/3 ≈ 0.667`.

**Bước 4 — Giải thích:** 2/3 là **tổng các tích**, chưa phải trung bình hay xác suất thích sản phẩm. Ta đã đổi thang đo đặc trưng nhưng chưa đưa độ dài từng vector về 1. Nếu muốn so sánh hướng trong không gian đã đổi thang, cosine của A′ và C′ là `(2/3) / (√109/12 × 1) = 8/√109 ≈ 0.766`. Chọn dot hay cosine phụ thuộc việc ta có muốn giữ ảnh hưởng của độ lớn hay không.

**Kết luận:** chị chủ giày có một quy tắc xếp hạng ban đầu. Chị vẫn phải kiểm tra với sở thích thật: cách chọn đặc trưng, đổi thang đo và tính điểm đều là giả định của mô hình, không tự bảo đảm gợi ý đúng.

### Ví dụ B — Nhân ma trận với vector

**Bài toán:** Ta muốn "biến" mỗi đôi giày (3 thành phần) thành **1 điểm xếp hạng**. Điểm = 0.5×giá + 2×thoải mái + 3×thời trang. (Giá trị 0.5, 2, 3 là "trọng số" ta chọn.)

**Bước 1 — Viết trọng số thành vector:** `w = (0.5, 2, 3)`.

**Bước 2 — Điểm của mỗi đôi = tích vô hướng của w với vector giày:**
- A: `0.5×1.2 + 2×8 + 3×7 = 0.6 + 16 + 21 = 37.6`.
- C: `0.5×1 + 2×9 + 3×5 = 0.5 + 18 + 15 = 33.5`.

**Bước 3 — Quy tắc "ma trận nhân vector":** gom toàn bộ bằng một phép nhân: ma trận + vector trọng số → vector điểm.

Ý tưởng: phép "áp một quy tắc cho mọi dòng dữ liệu" chính là **ma trận nhân vector** (mỗi hàng của ma trận là một vector dữ liệu, nhân vô hướng với vector hệ số). Máy tính làm việc này cực nhanh — đây là khối lệnh phổ biến nhất trong mọi mô hình ML.

**Bước 4 — Giải thích ký hiệu:** `M · w = result_vector` — "mỗi hàng trong ma trận M, lấy tích vô hướng với w, cho ra một kết quả" → kết quả là vector điểm `(37.6, …, 33.5)`.

### Ví dụ C — Vẽ biến đổi tuyến tính (2D để thấy được)

**Bài toán:** Một vector `(x, y)` bị ma trận `[2 0; 0 1]` biến đổi. Vẽ trước/sau.

**Bước 1 — Quy tắc ma trận 2×2 nhân vector:** `[a b; c d] · (x, y) = (a·x + b·y, c·x + d·y)`.

**Bước 2 — Áp `[2 0; 0 1]`:** `(x, y) → (2x + 0·y, 0·x + 1·y) = (2x, y)`.

**Bước 3 — Diễn giải:** chỉ có thành phần x bị **gấp đôi**, y giữ nguyên. Đây là biến đổi "giãn ngang". Điểm `(1,1)` → `(2,1)`, v.v. Toàn bộ mặt phẳng bị kéo giãn theo phương ngang.

**Bước 4 — Ý nghĩa "tuyến tính":** sau khi giãn, các đường thẳng vẫn thẳng, gốc tọa độ đứng yên. Đó là bản chất biến đổi tuyến tính: *không bẻ cong, không dời gốc*. (Biến đổi "dời gốc" thêm hằng số thì không còn tuyến tính thuần — đó là nhắc nhở ở mục 8.)

**Thử tương tác:** đổi các phần tử ma trận 2×2 để xem cùng vector `(1,1)` bị biến đổi thế nào. Định thức bằng 0 là dấu hiệu phép biến đổi mất ít nhất một chiều.

:::interactive matrix
:::

---

## 7. Trị riêng và vector riêng (nhập môn trực giác)

Ở Ví dụ C, ma trận thực hiện biến đổi. Giờ câu hỏi: *"Có những vector nào mà biến đổi chỉ tương đương với nhân chúng bằng một số?"*

**Câu chuyện nhỏ:** bạn kéo căng một tấm vải in hình mũi tên. Hầu hết mũi tên bị đổi cả hướng lẫn dài. Nhưng một số mũi tên nằm trên trục kéo vẫn ở trên chính đường thẳng ấy qua gốc. Đó là trực giác về **vector riêng**; **trị riêng** cho biết phép nhân có dấu tác động lên vector đó.

**Kí hiệu:** nếu ma trận `A`, vector `v` (khác 0) và số `λ` (lambda) thỏa `A·v = λ·v`, thì `v` là vector riêng, `λ` là trị riêng của A.
- Đọc: *"áp A lên v thì chỉ là nhân v với λ"*. Với trị riêng thực: λ>0 giữ hướng, λ<0 đảo chiều; độ dài nhân **|λ|**. Nếu λ=0, kết quả là vector 0, không còn hướng, dù v ban đầu vẫn phải khác 0.

**Mở rộng từ Ví dụ C:** ma trận `[2 0; 0 1]`. Thử `v = (1, 0)`: `A·v = (2, 0) = 2·v` → v là vector riêng với trị riêng 2 (hướng ngang dãn gấp đôi). `v = (0,1)`: `A·v = (0,1) = 1·v` → trị riêng 1 (hướng dọc giữ nguyên). Trục ngang và trục dọc chính là hai "hướng mũi tên không đổi hướng" của biến đổi này.

**Vì sao hữu ích cho AI:** trong **PCA**, ta trừ trung bình từng đặc trưng để định tâm dữ liệu, rồi xét **ma trận hiệp phương sai**. Vector riêng của ma trận này chỉ các trục biến thiên chính; trị riêng tương ứng cho biết phương sai theo mỗi trục. Giữ các trục có trị riêng lớn giúp tóm tắt dữ liệu bằng ít chiều hơn. Điều này không có nghĩa trị riêng lớn của một ma trận bất kỳ luôn biểu thị nhiều thông tin, và phương sai lớn chưa chắc là thông tin hữu ích cho nhiệm vụ.

---

## 8. Nhìn từ góc độ khoa học máy tính hoặc AI

- **Ảnh là ma trận.** Ảnh xám 28×28 = ma trận 28×28. Ảnh màu 32×32 = 3 ma trận 32×32 (kênh R,G,B, đặt chồng = tensor bậc 3). Khi "máy nhìn ảnh", thật ra máy nhìn các bảng số này.
- **Tất cả dữ liệu thành vector.** Một dòng khách hàng, một ảnh, một email → được biến thành một vector đặc trưng. Cái "vector hóa dữ liệu" (embedding) là việc phổ biến nhất, đặc biệt trong học sâu/Transformer (Chương 5 lộ trình FL/CL: **embedding**).
- **Ma trận là bộ não của mạng nơ-ron.** Trọng số trong mạng nơ-ron được lưu thành ma trận; "truyền dữ liệu qua một tầng" chính là *ma trận nhân vector* rồi cộng hằng số — giống hệt quy tắc ta vừa học. Vì vậy ta nói: *hiểu ma trận nhân vector là hiểu phần lõi của mạng nơ-ron.*
- **Tích vô hướng có thể làm điểm khớp.** Một số hệ đề xuất học vector người dùng và sản phẩm để dot product dự đoán mức ưa thích. Điểm ấy có ý nghĩa nhờ dữ liệu và mục tiêu huấn luyện; không phải mọi hệ đề xuất đều dùng dot product, và dot lớn không tự bảo đảm giống nhau về nghĩa.

---

## 9. Những chỗ dễ nhầm

**Nhầm 1: "Tích vô hướng và phép nhân thường là một."** Không. Phép nhân thường nhân hai số; tích vô hướng nhân **từng cặp thành phần rồi cộng dồn**, kết quả là **một số** (scalar), không phải vector. Ký hiệu `a·b` cần đọc theo ngữ cảnh — trong đại số tuyến tính nó là dot product, không phải "a nhân b" như phép nhân tiểu học khi a,b là số.

**Nhầm 2: "Nhân ma trận là nhân từng số tương ứng."** Sai. Phép nhân ma trận (matrix–matrix) không phải nhân từng phần tử (ta gọi nhân từng phần tử là *Hadamard product*, dùng nhiều trong code nhưng khác). Để hiểu, hãy nhớ *ma trận nhân vector* như ta đã làm: mỗi hàng lấy tích vô hướng với vector. Với nhân hai ma trận, kết quả mỗi ô là tích vô hướng của *một hàng* của ma trận thứ nhất với *một cột* của ma trận thứ hai.

**Nhầm 3: "Ma trận có thể nhân với bất kỳ vector nào."** Không. Số **cột** của ma trận phải bằng số **thành phần** của vector mới nhân được (điều kiện "kích thước khớp"). Thử nhân `[2 0 1; 0 1 1]` (2 hàng, 3 cột) với vector 2 thành phần → bị lỗi. Quy tắc: *hàng×cột phải khớp nhau* (điều mà lập trình gọi "shape mismatch" khi chạy tensor).

**Giới hạn của việc vẽ vector 2D:** dữ liệu thật nhiều chiều không vẽ nổi, nhưng không phải vì chúng "khó" — chỉ là ta hết không gian để hình dung. Mọi phép toán vẫn chạy đúng cho n chiều. Đừng bị giới hạn bởi "không vẽ được".

---

## 10. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: đo độ giống nhau (đề xuất, tìm kiếm), biến đổi/chuẩn hóa dữ liệu, giảm chiều dữ liệu lớn (PCA), hình dung dữ liệu nhiều chiều, hay khi bạn muốn hiểu "mạng nơ-ron đang làm phép gì mỗi tầng".

Nó **không nên áp dụng máy móc** khi: quan hệ giữa dữ liệu *không tuyến tính* (VD nhu cầu bão hòa, hiệu ứng phi tuyến) — lúc đó biến đổi tuyến tính / PCA có thể bỏ sót cấu trúc; hoặc khi bạn quên chuẩn hóa thang đo (tích vô hướng sẽ bị thành phần to nhất lấn át — ta đã thấy ở Ví dụ A) → đừng dùng ngay trên dữ liệu thô nhiều thang đo.

---

## Đọc sâu — chọn thước đo trước khi gọi hai thứ là “giống”

Hai đôi giày có thể gần nhau về giá nhưng khác nhau về phong cách. Không có phép toán nào tự biết người mua quan tâm điều gì. Những công thức ở mục 5 cho ta công cụ; việc chọn đặc trưng và thước đo là một phần của mô hình hóa.

| Câu hỏi đời thực | Phép toán có thể dùng | Điều cần giữ trong đầu |
|---|---|---|
| Tổng tiền trong giỏ là bao nhiêu? | Tổng các khoản tiền không âm, tức norm L1 | Không đồng nhất với độ dài L2 |
| Hai cơ cấu chi tiêu có cùng tỉ lệ? | Cosine sau khi thống nhất đơn vị | Cả hai vector phải khác 0 |
| Áp một cách chấm điểm cho mọi đôi giày? | Ma trận dữ liệu nhân vector trọng số | Số đặc trưng phải khớp số trọng số |

**Đọc thành lời:** `s=Mw` là “với mỗi hàng dữ liệu, nhân từng đặc trưng với trọng số tương ứng rồi cộng để có một điểm”. Nếu M có 2 hàng, 3 cột và w có 3 thành phần, s có 2 thành phần. Chữ s không phải một điểm duy nhất cho cả bảng.

**Tính tay:** hai giỏ `(3,4)` và `(6,8)` nghìn đồng có tổng tiền 7 và 14; độ dài L2 bằng 5 và 10; cosine bằng 1. Ba kết quả cùng đúng vì trả lời ba câu hỏi khác nhau. Với ma trận có hai hàng ấy và trọng số `(1,2)`, điểm là `(3+8,6+16)=(11,22)`.

**Phản ví dụ:** vector `(0,0)` có tích vô hướng bằng 0 với `(3,4)`, nhưng không có góc xác định để gọi là hướng vuông góc trong hình vẽ. Trong ngôn ngữ đại số, người ta vẫn gọi vector 0 là trực giao với mọi vector theo định nghĩa dot bằng 0. Hai cách nói cần được phân biệt.

**Giới hạn:** đổi giá từ triệu sang nghìn làm thay đổi góc trong không gian đặc trưng nếu các chiều khác giữ nguyên. Chuẩn hóa L2 chỉ giữ hướng trong hệ tọa độ đang dùng; nó không sửa hộ lựa chọn đơn vị. Với embedding, hướng có thể hữu ích cho một nhiệm vụ đã huấn luyện nhưng không mặc định biểu thị mọi loại tương đồng ngữ nghĩa.

:::quiz
Hai giỏ tiền (3,4) và (6,8) có cosine bằng 1. Kết luận nào đúng?
A. Chúng có cùng tổng tiền.
B. Chúng có cùng hướng, còn tổng tiền giỏ thứ hai gấp đôi.
C. Norm L2 của mỗi giỏ bằng tổng chi tiêu.
Đáp án: B
Giải thích: Vector thứ hai bằng 2 lần vector thứ nhất; tổng tiền lần lượt 7 và 14, norm L2 lần lượt 5 và 10.
:::

**Tự thử thêm:** chọn ma trận `A=[−2 0; 0 1]` và vector `v=(1,0)`. V có phải vector riêng không? Độ dài và hướng đổi thế nào?

:::goi-y
Tính Av rồi tìm số λ sao cho Av=λv. Độ dài nhân với trị tuyệt đối của λ.
:::

:::loi-giai
Av=(−2,0)=−2v, nên v là vector riêng với trị riêng −2. Độ dài từ 1 thành 2; hướng đảo ngược, còn đường thẳng chứa vector qua gốc giữ nguyên.
:::

---

## 11. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Vector `(x, y, z)` có nghĩa là gì? Kể 3 ví dụ đời thường có thể ghi thành vector 3 thành phần.
2. Tính tích vô hướng: `(1, 2, 3) · (4, 5, 6)`.
3. Giải thích bằng lời: vì sao máy "nhìn ảnh" chính là nhìn các ma trận số?

### Luyện tập (áp dụng vào bài toán mới)
4. Cho ma trận `[3 1; 0 2]` và vector `(1, 1)`. Tính `A·v` bằng quy tắc từng hàng.
5. Chuẩn hóa min–max ba giá trị "thoải mái" `(6, 8, 9)` về 0–1. Xếp kết quả theo đúng thứ tự thành vector 3 thành phần, rồi tính tích vô hướng với vector trọng số `(1, 2, 3)`. Đây là phép luyện tính trên hai vector cùng chiều; không phải điểm gợi ý của riêng một đôi giày.
6. Với ma trận `[1 0; 0 2]`, tìm một vector riêng cùng trị riêng của nó. Giải thích hướng bị kéo dãn gấp đôi là hướng nào.

### Thử thách (liên hệ với máy tính/AI)
7. Một hệ thống đề xuất phim ghi mỗi bộ phim thành vector đặc trưng `(hành động, lãng mạn, hài)`. Phim A `(0.9, 0.1, 0.3)`, phim B `(0.2, 0.8, 0.4)`, phim C `(0.8, 0.2, 0.3)`. Theo quy tắc xếp hạng bằng tích vô hướng trên các vector đã cho, A có điểm khớp cao hơn với B hay C? Giải thích bằng lời và nêu một giới hạn của quy tắc này.
8. Giải thích vì sao "phiếu đăng ký" (so sánh vector) lại **mất thông tin** khi bạn bỏ qua thứ tự các thành phần — và vì sao thứ tự đó cực quan trọng trong data thực.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. VD: tọa độ GPS `(kinh độ, vĩ độ, cao độ)`; giá/điểm/cổ phiếu; một đơn hàng `(giá, số lượng, phí ship)`.
2. `1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32`.
3. Vì mọi ảnh số được lưu thành các bảng số (pixel), và ma trận chính là bảng số đó — máy chỉ đọc số, không "thấy" như mắt người.
4. Hàng1: `3×1 + 1×1 = 4`; hàng2: `0×1 + 2×1 = 2` → `A·v = (4, 2)`.
5. min=6, max=9 → vector `(0, 2/3, 1)`. Cả hai vector đều có 3 thành phần: `0×1 + (2/3)×2 + 1×3 = 13/3 ≈ 4.333`.
6. `v=(0,1)`: `A·v=(0,2)=2·(0,1)` → vector riêng hướng dọc (trục y), trị riêng 2; hướng dọc bị dãn gấp đôi. `v=(1,0)` → trị riêng 1.
7. A·B = `0.9×0.2 + 0.1×0.8 + 0.3×0.4 = 0.18+0.08+0.12 = 0.38`. A·C = `0.9×0.8+0.1×0.2+0.3×0.3 = 0.72+0.02+0.09=0.83`. → C có điểm khớp với A cao hơn theo quy tắc này (0.83 > 0.38). Điều ấy hợp trực giác trong ví dụ, nhưng dot còn phụ thuộc độ dài; cùng thang đo không có nghĩa các vector đã có cùng độ dài.
8. Thứ tự quy định ý nghĩa từng thành phần; đổi chỗ là thay đổi dữ liệu. VD vector giày `(giá, thoải mái, thời trang)` — nếu hoán vị thành `(thời trang, giá, thoải mái)` thì con số 1.2 ngụ ý "thời trang 1.2" → sai mất dữ liệu. Máy không tự biết thứ tự; người phải định nghĩa.
:::

---

## 12. Tóm tắt bằng ngôn ngữ đời thường

1. Dữ liệu (ảnh, giày, phim, email) trước khi vào máy đều được xếp thành **vector** (danh sách số) và **ma trận** (bảng số).
2. **Tích vô hướng** cộng dồn các tích từng thành phần, phụ thuộc cả độ lớn và hướng. **Cosine** chỉ so hướng của hai vector khác 0 trong hệ tọa độ đã chọn.
3. **Ma trận nhân vector** = "áp một quy tắc cho mọi dòng dữ liệu" — chính là phép toán lõi trong mạng nơ-ron.
4. Biến đổi tuyến tính **không bẻ cong, không dời gốc**; ma trận chỉ ra cách biến đổi đó.
5. **Vector riêng** là vector khác 0 mà biến đổi chỉ nhân với một số có dấu — có thể co, giãn, đảo chiều hoặc đưa về 0. Trong PCA, ta xét vector riêng của ma trận hiệp phương sai để tìm các trục biến thiên chính.