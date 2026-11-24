# Chương 8 — Tối ưu hóa: hàm mục tiêu, ràng buộc và gradient descent

> **Câu hỏi lớn của chương:** *Làm sao máy tính tìm được lời giải "tốt nhất" giữa một địa hình mênh mông — mà không phải mò hết mọi ngóc ngách?*

---

## 1. Mở đầu bằng một tình huống

Nhớ anh làm app taxi ở Chương 4 — anh vừa chọn được *"giá tối ưu"* bằng cách tìm đỉnh của hàm lợi nhuận. Giờ mở rộng: app của anh muốn mô hình dự đoán thời gian giao hàng. Mô hình đơn giản có hai "núm vặn": `a` (phút mỗi km) và `b` (phút chuẩn bị cố định). Anh có hàng nghìn đơn đã giao với số liệu thực tế.

Anh muốn chọn `a` và `b` sao cho mô hình `thời_gian = a·km + b` **dự đoán khớp thực tế nhất có thể**. Nhưng với hai núm vặn (chưa kể khi mô hình lớn có hàng triệu núm), anh không thể "thử tay" hết. Máy phải **tự động tìm** hai con số tối ưu.

Đó chính là **tối ưu hóa** — và công cụ trung tâm của máy học: **gradient descent**. Toàn bộ cuốn sách từ Chương 2–5 đều dẫn về đây: mô hình hóa (C2), đạo hàm/gradient (C4), xác suất/kỳ vọng (C5). Giờ chúng hợp lại thành một thuật toán duy nhất.

---

## 2. Trực giác trước

**Tối ưu hóa = "đi trong địa hình sai số để tìm chỗ nhỏ nhất".**

Hãy tưởng tượng bạn bị bịt mắt đứng trên một *ngọn đồi gồ ghề* (trục ngang là các giá trị của núm vặn, trục đứng là "độ sai"). Bạn muốn xuống **đáy thung lũng** (nơi sai số nhỏ nhất). Bạn không nhìn thấy cả địa hình, chỉ cảm được độ dốc dưới chân. Chiến lược tối ưu: **dò theo hướng dốc xuống** — bước một bước nhỏ theo hướng dốc nhất, rồi lại dò tiếp, lặp lại.

- Nếu bước quá **nhỏ** → lâu tới đáy.
- Nếu bước quá **lớn** → nhảy qua khỏi đáy, chạy quanh quẩn, thậm chí leo sang quả đồi khác.

Đây chính là **gradient descent**: gradient (Chương 4) cho biết *hướng dốc nhất*; "bước nhỏ" được điều khiển bởi một con số gọi **learning rate**; và việc lặp lại thật nhiều lần là **minibatch/epoch** trong học máy.

**Phép so sánh "gradient descent = người bịt mắt dò dốc":** chính xác cho trực giác. **Giới hạn:** người bịt mắt chỉ dò theo độ dốc cục bộ; nếu địa hình có *nhiều thung lũng* (cực tiểu địa phương), anh ta có thể kết thúc ở một thung lũng nhỏ mà không phải thung lũng sâu nhất (cực tiểu toàn cục). Với mô hình lớn, "dò từ vài điểm xuất phát" hay "thêm nhiễu" là cách ứng phó — nhưng điều đó vượt khung sách này; đây là *nguyên nhân* tại sao tối ưu ML khó.

---

## 3. Thử giải bằng cách chưa chính thức

**Anh taxi, lai rai bằng tay:** trước khi viết thuật toán, anh thử:

1. Đoán `a=1`, `b=1`. Áp cho vài đơn, tính sai số.
2. Thấy sai số "hơi lớn khi km nhiều" → tăng `a`, giữ nguyên `b`.
3. Thấy sai số "lệch khi km ít" → chỉnh `b`.
4. Lặp đi lặp lại, dần khớp.

Đây là **gradient descent thủ công**: mỗi vòng, anh nhìn "sai đang theo hướng nào rồi" để chỉnh `a` và `b` "một chút". Cách này chậm, thủ công, và chỉ rõ khi có 2 núm. Các bước `a` và `b` điều chỉnh này chính là **gradient** — anh vô tình tính "độ dốc của sai số theo a và b" rồi bước ngược theo nó. Giờ đây ta *tự động hóa đúng điều đó*.

---

## 4. Đặt tên cho ý tưởng

- **Hàm mục tiêu (objective function):** hàm ta muốn làm bé (hoặc lớn) nhất. Trong ML, để bé nhất gọi là **hàm mất mát (loss)**; để lớn nhất gọi là *mục tiêu*/*reward*. Tất cả chỉ là "cái cần tối ưu".
- **Tham số (parameters)/trọng số (weights):** các núm vặn của mô hình (a, b, hoặc hàng triệu con số) ta chỉnh.
- **Learning rate (α, đọc "alpha"):** kích thước mỗi bước đi — hệ số nhân cho gradient. Bước lớn/nhỏ đều có rủi ro.
- **Gradient descent:** lặp: `tham_số ← tham_số − α · gradient(loss)`. Nghĩa là: "trừ một chút theo hướng độ dốc xuống".
- **Cực trị địa phương / toàn cục (local/global optimum):** thung lũng gần đó vs thung lũng sâu nhất toàn địa hình.
- **Ràng buộc (constraint):** điều kiện ngoài giới hạn vùng hợp lệ của lời giải (VD a phải ≥ 0 vì thời gian không thể âm; hoặc thời gian cố định như 0 ≤ x ≤ 1).
- **Hội tụ (convergence):** khi lời giải dần dừng thay đổi, đạt đến (gần) cực trị.

Khái niệm trung tâm: **đi theo ngược gradient để giảm loss** — với learning rate kiểm soát bước đi, và lặp lại.

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Xây hàm mất mát từ dữ liệu

Anh taxi có dữ liệu các đơn: với đơn thứ i, biết `km_i` và thời gian thực tế `t_i`. Mô hình dự đoán `t̂_i = a·km_i + b` (kí hiệu `t̂` đọc "t mũ" = giá trị ước lượng).

**Sai số cho một đơn:** `(t̂_i − t_i)²` — bình phương (Chương 1 đã đọc công thức này) để mọi lệch đều dương và phạt mạnh lệch lớn.

**Hàm mất mát toàn bộ (mean squared error, MSE):**

```
loss(a,b) = (1/n) · Σⁱ (a·km_i + b − t_i)²
```

**Đọc từng phần:**
- `(1/n)` — trung bình, để số không phụ thuộc số lượng mẫu (n so sánh được giữa cài 100 hay 1000 mẫu).
- `Σⁱ` — cộng dồn trên mọi đơn.
- `(a·km_i + b − t_i)` — chênh lệch dự đoán so với thực tế.
- `²` — bình phương.

**Mục tiêu:** chọn `a`, `b` làm loss nhỏ nhất.

### 5.2 Gradient của loss theo tham số (khái quát)

Với mỗi tham số, ta tính đạo hàm riêng của loss theo nó (Chương 4 dây chuyền). Gradient là "máy chỉ hướng dốc". Update:

```
a ← a − α · ∂loss/∂a
b ← b − α · ∂loss/∂b
```

**Giải thích:** nếu `∂loss/∂a > 0`, tăng `a` làm loss tăng → phải giảm `a`; dấu trừ trong update tự đưa ta đi hướng giảm. `α` kiểm soát bước.

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Gradient descent 1 tham số (minh họa đầy đủ)

**Bài toán:** `loss(w) = (w − 3)²`, bắt đầu `w = 0`, learning rate `α = 0.1`. Thực hiện vài bước.

**Bước 1 — Đạo hàm:** `loss'(w) = 2(w − 3)`.

**Bước 2 — w=0:** `loss' = 2(0−3) = −6`. Update: `w ← 0 − 0.1×(−6) = 0.6`.

**Bước 3 — w=0.6:** `loss' = 2(0.6−3) = −4.8`. Update: `w ← 0.6 − 0.1×(−4.8) = 0.6 + 0.48 = 1.08`.

**Bước 4 — w=1.08:** `loss' = 2(1.08−3)= −3.84`. Update: `w ← 1.08 + 0.384 = 1.464`.

**Bước 5 — Quan sát hội tụ:** w tiến dần về 3 (điểm loss nhỏ nhất), mỗi bước nhỏ hơn. Sau nhiều bước → w≈3. Đây là gradient descent hoạt động: **giảm loss từng bước, hội tụ về đáy**.

*(Thử thay α=2.5: bước 1 `w=0−2.5×(−6)=15` → nhảy xa, rồi dao động mạnh. Đây là lý do chọn α hợp lý.)*

### Ví dụ B — Gradient descent 2 tham số (mô hình anh taxi)

**Bài toán:** mô hình `t̂ = a·km + b`, hai tham số.

**Bước 1 — Với 2 tham số, gradient là vector:** `∇loss = (∂loss/∂a, ∂loss/∂b)`. Update cả hai cùng lúc:

```
a ← a − α · ∂loss/∂a
b ← b − α · ∂loss/∂b
```

**Bước 2 — Ý nghĩa:** mỗi vòng, máy dò "nên tăng a hay giảm a?", "nên tăng b hay giảm b?" theo dấu gradient một chút, lặp đến khi gradient gần 0 (điểm dừng).

**Bước 3 — Kết thúc:** khi gradient đủ nhỏ, `a`, `b` gần như không đổi → đạt (gần) cực trị loss. Đó là `a` và `b` tối ưu cho dữ liệu — khớp số liệu giao hàng tốt nhất có thể với mô hình tuyến tính này.

**Lưu ý đặt tên:** đây là chỗ vốn được gọi *learning* trong ML — "mô hình học tham số" chính xác là "chạy gradient descent để tối ưu loss".

### Ví dụ C — Ràng buộc (constraint)

**Bài toán:** muốn ép `a ≥ 0` (thời gian không thể TUYỆN đối là bước quá khứ / đường dài hơn thời gian ngắn hơn — thực tế `a` phải dương). Phải xử lý ràng buộc.

**Bước 1 — Nhận diện ràng buộc:** giới hạn vùng hợp lệ của lời giải.

**Bước 2 — Cách xử lý đơn giản:** sau mỗi update, "kẹp" tham số về phạm vi cho phép (clip): nếu a < 0, ép a=0.

**Bước 3 — Giải thích khái niệm ràng buộc nói chung:** không phải lúc nào cũng đơn giản; nhiều bài toán tối ưu có ràng buộc phức tạp (tổng các trọng số = 1, giá trị nguyên...). Ta chỉ giới thiệu ý "giới hạn vùng tìm kiếm" — đủ để biết tồn tại và khi cần tìm hiểu thêm.

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

- **Gradient descent là "cơ chế học" của gần như mọi mô hình học sâu.** Khi bạn nghe "mạng nơ-ron được huấn luyện", bản chất là chạy gradient descent (và biến thể) trên hàng triệu tham số theo hàm loss. Ta thấy lõi đó ở đây với hàm 1 → 2 biến; với mạng lớn chỉ là nhiều biến hơn và dùng dây chuyền để tính gradient (backprop, Chương 4).
- **Các biến thể phổ biến** (chỉ kể, biết tên): SGD (mỗi bước trên một mẫu/lô), momentum, Adam — đều là gradient descent được "làm mượt" về bước đi và learning rate. Không cần chứng minh, chỉ biết chúng bắt nguồn từ đây.
- **Mini-batch:** thay vì tính loss trên *toàn bộ* dữ liệu (đắt), ML tính trên một *lô nhỏ* mỗi bước — vẫn đi theo xu hướng chung nhưng rẻ hơn và có độ "nhiễu" giúp thoát cực tiểu địa phương. Đây là lý do ta gặp khái niệm "batch/epoch" khi đọc tài liệu.
- **Lý do tối ưu ML "khó":** địa hình loss nhiều chiều có cực tiểu địa phương, và bề mặt không trơn. Gradient descent có thể dừng ở thung lũng con. Đây là ranh giới giữa "tối ưu toán học lý tưởng" (Chương sách) và "thực hành ML" (dùng nhiều khởi tạo, nhiễu, Adam). Nhận diện giới hạn này để không phóng đại.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Gradient descent luôn tìm được cực tiểu toàn cục."** Sai. Đối với hàm lồi đơn giản thì hội tụ toàn cục; với địa hình nhiều thung lũng, nó có thể dừng ở cực tiểu **địa phương**. Đừng khẳng định "chắc chắn tối ưu nhất" khi chỉ chạy gradient descent một lần từ một điểm khởi tạo.

**Nhầm 2: "Learning rate càng lớn càng nhanh, nên cứ đặt lớn."** Sai. Quá lớn → "nhảy qua đáy", dao động hoặc phân kỳ (văng đi). Quá nhỏ → hội tụ chậm. Đây là siêu tham số cần cân đối và thử nghiệm. (Ví dụ A đã cho thấy α=2.5 hỏng.)

**Nhầm 3: "Loss bằng 0 thì mô hình hoàn hảo."** Chưa chắc. Loss cực nhỏ trên *dữ liệu huấn luyện* có thể là **overfitting** — mô hình thuộc lòng dữ liệu cũ nhưng sai dữ liệu mới (Chương lộ trình FL/CL G2.5). Phải đo trên **tập test** (dữ liệu chưa từng thấy) mới tin. Một con loss nhỏ trên train chưa nói gì về tổng quát.

**Nhầm 4: "Tối ưu hóa = chỉ tìm 'đáy'."** Tối ưu hóa tổng quát còn gồm tìm **lớn nhất** (lợi nhuận, reward), xử lý **ràng buộc**, và các vấn đề nhiều mục tiêu. Gradient descent chỉ là một công cụ cho một kiểu. Đừng đồng nhất công cụ với toàn bộ lĩnh vực.

**Giới hạn của "người bịt mắt dò dốc":** người đó chỉ dò trong "thung lũng gần nhất"; với mô hình thật hàng triệu chiều, khái niệm "đáy" không còn trực quan và việc hội tụ khó đảm bảo. Phép so sánh tệ ở chỗ số chiều; nhưng ý "lặp, đi ngược dốc" vẫn đúng.

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: huấn luyện mô hình (điều chỉnh tham số để giảm lỗi), tối ưu hóa tham số hệ thống (giá, cấu hình), đọc tài liệu ML (mọi nơi nhắc "train", "optimizer", "loss"), hoặc hiểu vì sao model không hội tụ (khi đó cần kiểm tra learning rate/khởi tạo).

Nó **không nên áp dụng máy móc** khi: hàm không trơn/dùng định nghĩa rời rạc (không có gradient) — dùng tối ưu rời rạc; khi chỉ cần cực trị toàn cục chắc chắn (bài toán lồi) mà bạn lại dùng heuristic; và khi loss quá nhỏ trên train do overfit — đừng "ép" optimizer làm mất tính tổng quát.

---

## Đọc sâu — độ dốc chỉ đường, bước chân quyết định có xuống được hay không

Trong ví dụ đi xuống đồi, biết hướng xuống chưa đủ: một bước quá dài có thể vượt qua đáy sang sườn cao bên kia. Gradient descent kết hợp thông tin địa phương của đạo hàm với lựa chọn độ dài bước. Không có một learning rate “nhỏ” tuyệt đối cho mọi hàm; nó phải được xét so với độ cong và thang đo.

| Tình huống | Vai trò của toán | Câu hỏi thực tế |
|---|---|---|
| Chỉnh hệ số thời gian giao hàng | Tham số w là núm vặn | Loss đổi thế nào khi tăng w một chút? |
| Chọn độ mạnh một lần chỉnh | Learning rate α nhân gradient | Bước có vượt xa vùng xấp xỉ địa phương không? |
| Ép thời gian tăng theo quãng đường | Ràng buộc hệ số a≥0 | Đây là giả định phù hợp dữ liệu nào? |

**Đọc thành lời:** `wₖ₊₁=wₖ−αL′(wₖ)` là “lấy tham số hiện tại trừ learning rate nhân độ dốc tại chính tham số hiện tại”. Không tính đạo hàm ở giá trị vừa cập nhật cho nửa còn lại của cùng một bước nhiều tham số. Với gradient descent chuẩn, các thành phần được cập nhật đồng thời từ cùng trạng thái cũ.

**Tính tay:** dùng `L(w)=(w−3)²`, w₀=0 và α=0.1. Độ dốc đầu là −6 nên w₁=0.6, loss từ 9 xuống 5.76. Độ dốc tiếp là −4.8 nên w₂=1.08, loss còn 3.6864. Khoảng cách đến đáy nhân 0.8 sau mỗi bước: `wₖ₊₁−3=(1−2α)(wₖ−3)`.

**Phản ví dụ:** giữ hàm nhưng chọn α=1, từ 0 ta nhảy tới 6 rồi quay lại 0. Loss vẫn là 9, không giảm dù luôn trừ gradient. Với hàm cụ thể này, mọi điểm bắt đầu hội tụ tới 3 nếu 0<α<1; α=0.5 đến đáy trong một bước, còn α>1 làm sai lệch tăng trừ khi đã đứng đúng đáy. Điều kiện ấy không được bê nguyên sang mọi hàm khác.

**Thử tương tác:** chọn điểm bắt đầu và learning rate, dự đoán đường đi trước khi bấm “Đi một bước gradient”. Đổi η qua 1 để thấy điều kiện hội tụ của ví dụ này.

:::interactive gradient
:::

**Giới hạn:** gradient gần 0 có thể là cực tiểu, cực đại hoặc điểm yên của một hàm tổng quát. Một hàm lồi khả vi cho ta bảo đảm mạnh hơn; loss MSE theo hệ số tuyến tính là lồi, nhưng nghiệm có thể không duy nhất nếu dữ liệu thiếu thông tin. Còn loss huấn luyện giảm không tự bảo đảm dự đoán ngoài mẫu tốt hơn: cần validation và kiểm tra rò rỉ dữ liệu.

:::quiz
Với L(w)=(w−3)², w bắt đầu bằng 0 và α=1, điều gì xảy ra?
A. Hội tụ ngay về 3.
B. Dao động 0↔6, loss giữ bằng 9.
C. Mỗi bước loss luôn giảm một nửa.
Đáp án: B
Giải thích: Đạo hàm tại 0 là −6 nên tới 6; tại 6 là 6 nên trở lại 0. Learning rate này không tạo hội tụ.
:::

**Tự thử thêm:** vẫn hàm trên nhưng α=0.25. Tính hai bước đầu và loss sau mỗi bước.

:::goi-y
Mỗi bước dùng L′(w)=2(w−3). So độ lệch w−3 trước và sau bước.
:::

:::loi-giai
w₁=0−0.25×(−6)=1.5, L=2.25. w₂=1.5−0.25×(−3)=2.25, L=0.5625. Độ lệch đến 3 giảm một nửa; loss, là bình phương độ lệch, giảm còn một phần tư mỗi bước.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Giải thích: "đi ngược gradient" nghĩa là gì bằng lời? Vì sao để giảm loss ta đi ngược chứ không đi xuôi?
2. Learning rate làm gì? Hai rủi ro của bước quá nhỏ và quá lớn.
3. Phân biệt "cực tiểu địa phương" và "toàn cục".

### Luyện tập (áp dụng vào bài toán mới)
4. Cho `loss(w)=(w−4)²`, `w=2`, `α=0.2`. Thực hiện đúng 2 bước gradient descent, ghi lại w qua mỗi bước.
5. Mô hình `t̂=a·km+b`, có nhận xét: loss giảm chậm. Kể 2 việc bạn thử (về α hay khởi tạo) và vì sao.
6. Một hàm hai biến `loss(a,b)=(a−1)²+2(b−2)²`. gradient tại (0,0) là gì? *(dùng đạo hàm riêng)*. Update 1 bước với α=0.1.

### Thử thách (liên hệ với máy tính/AI)
7. Giải thích bằng lời: vì sao "loss trên tập test" quan trọng hơn "loss trên tập train" — và vì sao chỉ tối ưu train dễ dẫn overfitting.
8. Một mô hình có loss rất nhỏ trên train nhưng cao trên test. Theo học thuyết của chương này và Chương 5, nêu 2 khả năng nguyên nhân và 1 cách kiểm chứng.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Gradient chỉ *hướng dốc lên*. Muốn xuống đáy (loss nhỏ) ta đi ngược → trừ gradient. Nếu đi xuôi, loss tăng — trái mục tiêu.
2. Learning rate = kích thước bước. Nhỏ → chậm hội tụ; lớn → nhảy qua đáy, dao động/phân kỳ.
3. Địa phương: thung lũng gần nhất, có thể không sâu nhất. Toàn cục: cực trị nhỏ nhất trên toàn địa hình.
4. `w=2: loss'=2(2−4)=−4; w←2−0.2×(−4)=2.8`. `w=2.8: loss'=2(2.8−4)=−2.4; w←2.8−0.2×(−2.4)=2.8+0.48=3.28`. → 2 bước: w=2.8 rồi 3.28, tiến về 4.
5. (a) Tăng α một chút (bước lớn hơn, nhanh hơn) — nhưng thử cẩn thận để không nhảy qua đáy. (b) Khởi tạo khác (chạy lại từ w khác). Có thể dùng momentum/Adam (biến thể) — đều là gradient descent cải tiến bước đi.
6. `∂loss/∂a = 2(a−1)`, tại a=0 → −2; `∂loss/∂b = 4(b−2)`, tại b=0 → −8. Gradient = (−2, −8). Update: `a←0−0.1×(−2)=0.2`; `b←0−0.1×(−8)=0.8`. → (0.2, 0.8), tiến về (1,2).
7. Train loss đo khả năng "khớp dữ liệu cũ"; test loss đo khả năng tổng quát (dữ liệu mới). Nếu chỉ tối ưu train, model có thể "thuộc lòng" âm nhiễu → overfit → sai trên dữ liệu mới. Dùng test (chưa thấy) để đánh giá thật.
8. Nguyên nhân: (1) overfitting (model quá phức tạp/train quá lâu); (2) rò rỉ/lệch phân phối train-test (data leakage, G2.8). Kiểm chứng: thử regularization, drop khởi tạo, tăng dữ liệu, hoặc kiểm tra phân phối train/test — và quan sát đường cong loss trên validation trong quá trình train.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. **Tối ưu hóa** = tìm "cái tốt nhất" (nhỏ nhất/lớn nhất) cho hàm mục tiêu (loss, lợi nhuận).
2. **Gradient descent** = "người bịt mắt dò dốc": lặp bước nhỏ theo ngược hướng dốc nhất đến khi xuống đáy.
3. **Learning rate** điều khiển bước đi — quá nhỏ chậm, quá lớn văng — cần cân đối.
4. Máy "học" chính là **chạy gradient descent để giảm loss** theo dữ liệu — gần như mọi mô hình ML/DL đều làm vậy.
5. Đừng chỉ tin **loss trên tập train** — phải đo **loss trên tập test** để tránh overfitting; và đừng nghĩ gradient descent luôn tìm được "tốt nhất toàn cầu".