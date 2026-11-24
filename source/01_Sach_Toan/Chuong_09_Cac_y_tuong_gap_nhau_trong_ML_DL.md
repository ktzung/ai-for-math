# Chương 9 — Các ý tưởng toán học gặp nhau trong học máy và học sâu

> **Câu hỏi lớn của chương:** *Ba trụ cột (đại số tuyến tính, giải tích, xác suất) thực sự phối hợp ra sao trong một mạng nơ-ron — và cái gì làm nên một "vòng huấn luyện"?*

---

## 1. Mở đầu bằng một tình huống

Trong suốt cuốn sách, ta đã gặp từng mảnh: đồ thị (Chương 7) vẽ mạng xã hội, ma trận (Chương 3) để biến đổi dữ liệu, gradient descent (Chương 8) để tối ưu, xác suất (Chương 5) để dự đoán. Giờ một câu hỏi quan trọng cuối cùng:

> *Rồi chúng nối với nhau như thế nào để tạo ra thứ thực sự gọi là "máy học" — ví dụ một mạng nơ-ron nhận diện ảnh "mèo" vs "chó", hay dự đoán khách còn ở lại bên app bao lâu?*

Đừng sợ cụm từ "mạng nơ-ron" (Chương lộ trình FL/CL đi sâu). Ở mức trực giác, một mạng nơ-ron chỉ là **một "cỗ máy" rất lớn gồm rất nhiều biến đổi tuyến tính (ma trận) xếp chồng, ngắt quãng bằng các hàm phi tuyến**, và được "chỉnh" bằng gradient descent. Chương này *tổng kết* — cho bạn thấy toàn bộ các ý tưởng đã học đứng vào đúng vị trí của chúng trong một hệ thống duy nhất.

---

## 2. Trực giác trước

Hãy lắp ráp chiếc xe đạp. Mỗi bộ phận (bánh, khung, phanh) đã học riêng ở các chương trước; giờ ta lắp lại để nó chạy. Máy học cũng vậy — ít nhất **3 bộ phận cốt lõi**:

1. **Biểu diễn dữ liệu** — đại số tuyến tính (Chương 3): mọi dữ liệu (ảnh, văn bản, bảng) thành vector/ma trận số.
2. **Mô hình & đo lỗi** — mô hình hóa + xác suất (Chương 2, 5): một hàm `f` biến đầu vào thành dự đoán; và hàm mất mát để đo "sai bao nhiêu".
3. **Học tham số** — giải tích + tối ưu (Chương 4, 8): dùng gradient descent để chỉnh `f` cho khớp dữ liệu.

Khi ba mảnh khớp, ta có **học máy**. Và khi mô hình `f` là một mạng nơ-ron (nhiều tầng ma trận), đó là **học sâu**.

**Phép so sánh "lắp xe đạp":** các đơn vị độc lập khi ghép lại tạo thành hệ thống chạy. **Giới hạn:** xe đạp lắp một lần là xong và đứng yên; mạng nơ-ron *thay đổi liên tục* trong lúc học (mỗi bước lại chỉnh trọng số) — nó không "hoàn thành" mà "hội tụ".

---

## 3. Thử giải bằng cách chưa chính thức

**Bài toán nhỏ:** nhận diện "ảnh là mèo hay chó". Chưa dùng công thức, hãy lắp ghép bằng lời:

1. **Biểu diễn:** ảnh → một bảng số (ma trận pixel) → "duỗi dài" thành một vector rất dài.
2. **Mô hình:** ta đặt một "cỗ máy" — nếu ta đẩy một vector ảnh vào, nó trả ra một con số (cao = mèo, thấp = chó). Cỗ máy đó có hàng nghìn con số bên trong (trọng số).
3. **Đo lỗi:** nếu nó trả ra 0.2 nhưng thực tế là mèo (nên ~1), ta tính "lỗi".
4. **Học:** nhìn hướng lỗi, chỉnh từng con số bên trong *một chút* theo hướng giảm lỗi (gradient descent). Lặp hàng nghìn ảnh.

Sau nhiều lần lặp, cỗ máy dần dự đoán đúng. Không có gì "thông minh thần bí" — chỉ là **nhiều biến đổi tuyến tính được chỉnh bằng gradient descent để khớp dữ liệu**.

---

## 4. Đặt tên cho ý tưởng

- **Learning (học):** quá trình điều chỉnh tham số (trọng số) để giảm hàm mất mát.
- **Mạng nơ-ron (neural network):** một mô hình — chuỗi các biến đổi ma trận + hàm phi tuyến (activation) xếp tầng.
- **Hàm kích hoạt (activation):** hàm phi tuyến chèn giữa các tầng (ReLU, sigmoid, tanh) — thứ làm mạng "không chỉ là ma trận tuyến tính" (nếu không, chồng ma trận vẫn là ma trận tuyến tính, hoàn toàn không học được phi tuyến).
- **Vòng huấn luyện (training loop):** chuỗi lặp: dự đoán → tính loss → lan truyền ngược (backprop) để lấy gradient → cập nhật trọng số.
- **Backpropagation (lan truyền ngược):** dùng quy tắc dây chuyền (Chương 4) để tính gradient của loss theo từng tầng.
- **Test / validation:** phần dữ liệu tách riêng để đo khả năng tổng quát (Chương 8 — đừng tin loss train).

Hai "mảnh ghép" cuối này (activation + training loop) làm cho ba trụ cột trở thành một hệ thống học được.

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Ba trụ cột trong một bức tranh

```
Biểu diễn:  dữ liệu → vector  → (ma trận W_1) → phi tuyến (ReLU) → (ma trận W_2) → dự đoán ŷ
                (C3)                                   (C4)                        (C2/C5)
Đo lỗi:     loss = (1/n)Σ (ŷ − y)²      ← xác suất + mô hình hóa (C2, C5)
Học:        W ← W − α·∇loss              ← gradient descent + dây chuyền (C4, C8)
```

- `W₁, W₂` — các ma trận trọng số (chỗ chứa "núm vặn").
- `ReLU` — một hàm phi tuyến phổ biến (đọc "Rectified Linear Unit"): giữ số dương, biến số âm về 0.
- `ŷ` — kết quả dự đoán (đọc "y mũ").
- loss — theo nghĩa xác suất (Chương 5) có thể là "khả năng dự đoán đúng" (log-likelihood), khiến "giảm loss" và "tăng khả năng" là hai chiều của một thứ.

### 5.2 Mapping: chương nào → vai trò nào

| Chương | Vai trò trong ML |
|---|---|
| C2 Mô hình hóa | thiết kế hàm `f` dự đoán, hàm mất mát |
| C3 Đại số tuyến tính | biểu diễn dữ liệu, trọng số là ma trận, tích vô hướng đo khớp |
| C4 Giải tích | gradient, dây chuyền → backprop |
| C5 Xác suất | đầu ra là xác suất, loss ≈ khả năng, diễn giải không chắc chắn |
| C8 Tối ưu | gradient descent cập nhật trọng số |
| C7 Đồ thị | (tùy) GNN, mạng, topo trao đổi |

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — "Một-lớp" (mô hình rất đơn giản) đầy đủ vòng lặp

**Bài toán:** Có 3 mẫu (điểm dự đoán `x` → nhãn `y`): (1, 2), (2, 4), (3, 6). Ta dùng mô hình `ŷ = w·x` (chỉ 1 tham số). Mục tiêu: chọn `w`.

**Bước 1 — Mô hình hóa & loss (C2):** `loss = (1/3)[ (w·1−2)² + (w·2−4)² + (w·3−6)² ]`.

**Bước 2 — Đạo hàm theo w (C4):** mỗi hạng tử dạng `(w·x − y)²` → đạo hàm `2(w·x−y)·x`. Vậy:
`loss' = (2/3)[ (w−2)·1 + (w·2−4)·2 + (w·3−6)·3 ]`.

**Bước 3 — Khởi tạo `w=0`, `α=0.1`:**
- `loss'(0) = (2/3)[ (−2)·1 + (−4)·2 + (−6)·3 ] = (2/3)[−2 −8 −18] = (2/3)(−28) = −18.67`.
- Update: `w ← 0 − 0.1×(−18.67) = 1.867`.

**Bước 4 — Lặp:**
- `loss'(1.867)` tính ra giá trị âm/nhỏ hơn → `w` tăng dần.
- Sau vài bước, `w` tiến về gần `2` (vì `y=2x`) — **học được quy luật từ dữ liệu**.

**Bước 5 — Kết luận:** mô hình một tham số học đúng quy luật `y≈2x` nhờ gộp ba trụ cột: biểu diễn số, đạo hàm, cập nhật gradient. Với mạng nhiều lớp, mỗi "tầng" là một lớp như **ma trận nhân vector** (C3), và backprop là dây chuyền qua các tầng (C4).

### Ví dụ B — Tại sao cần hàm phi tuyến (activation)?

**Bài toán:** một mạng hai tầng `ŷ = W₂(W₁·x)` — nếu không có activation ở giữa.

**Bước 1 — Nhìn bản chất:** mỗi ma trận là biến đổi tuyến tính. Tích của hai biến đổi tuyến tính **vẫn là một biến đổi tuyến tính** (Chương 3: chồng ma trận vẫn ra ma trận).

**Bước 2 — Hệ quả:** mạng hai tầng *không có phi tuyến* chẳng học đường cong nào tốt hơn một tầng tuyến tính — mọi thứ sụp về tuyến tính.

**Bước 3 — Vai trò activation:** chèn `ReLU`, `sigmoid`... giữa các tầng phá vỡ tính tuyến tính → mạng biểu diễn được các hàm phức tạp, cong, lồi (như "đường phân chia không thẳng" để tách mèo/chó).

**Bước 4 — Diễn giải:** activation là điểm ta "rời khỏi" thế giới tuyến tính của Chương 3 để bước vào thế giới phi tuyến mà dữ liệu thực cần.

### Ví dụ C — Đọc đường cong huấn luyện (kết nối Chương 8 & 5)

**Bài toán:** sau mỗi "epoch" (một lượt qua toàn dữ liệu), ta ghi loss trên **train** và trên **validation**.

**Bước 1 — Vẽ một đường cho mỗi tập:** `train_loss` và `val_loss` theo epoch.

**Bước 2 — Đọc tín hiệu:**
- Cả hai giảm dần và gần nhau → học tốt, tổng quát.
- `train_loss` giảm nhưng `val_loss` bắt đầu tăng → **overfit**: model thuộc lòng train, bắt đầu sai trên dữ liệu mới (Chương 8, G2.5).
- Cả hai ngang bằng cao → **underfit**: model quá đơn giản, chưa học được quy luật.

**Bước 3 — Hành động:** nếu overfit → regularization, giảm độ phức tạp, tăng dữ liệu hoặc dừng sớm (early stopping). Nếu underfit → tăng năng lực mô hình.

**Bước 4 — Diễn giải:** biết "đọc hình" này giúp bạn chẩn đoán model — một kỹ năng thực hành mọi người làm ML phải giỏi. (Sẽ đi sâu ở lộ trình FL/CL, Giai đoạn 3.)

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

**Toàn bộ lộ trình từ Chương 1 đến đây là "một vòng huấn luyện" thu nhỏ:**

```
for epoch in range(n):
    đẩy dữ liệu qua mạng (forward)
    tính loss
    backprop để lấy gradient theo mọi trọng số
    cập nhật trọng số bằng gradient descent
```

Ba trụ cột đứng trong vòng này đúng như bảng ở mục 5.2. Giờ bạn đã đọc được vòng lặp này bằng lời, không cần mã — và có đủ nền để khi gặp code thật (tensor, optimizer, dataloader) bạn không bị "choáng từ vựng".

**"Học máy" không phải "máy suy nghĩ như người"** — nó là "máy điều chỉnh tham số để giảm lỗi theo dữ liệu". Không có phép màu; có logic toán. Cảnh giác với những cuốn sách bán "máy suy nghĩ", thay vì đúng trọng tâm "cơ chế học từ dữ liệu".

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Mạng nơ-ron 'suy nghĩ' như não người nhiều tầng."** Không nên phóng đại. Mạng nơ-ron vay thuật ngữ "neuron" nhưng hoạt động hoàn toàn khác sinh học. Đây là ẩn dụ lỏng lẻo; học sâu = chuỗi biến đổi ma trận + phi tuyến + tối ưu — hữu ích về mặt kỹ thuật, không phải mô tả não bộ.

**Nhầm 2: "Mạng càng to càng tốt, tự khắc giỏi."** Không tự nhiên như vậy. Tham số nhiều cần dữ liệu đủ; nếu thiếu dữ liệu → overfit (val loss tăng). Độ phức tạp phải cân với lượng dữ liệu — không có "miễn phí".

**Nhầm 3: "Loss bằng 0 trên train = hàm hoàn hảo."** Chỉ báo overfit (Chương 8). Phải xem **val loss/test loss**. Đây là bẫy mà người mới hay mắc — tin số liệu train làm thước đo thật.

**Nhầm 4: "Activation (như ReLU) khó hiểu, cần thuộc công thức."** Không. Trực giác của ReLU đơn giản: *số dương giữ nguyên, số âm về 0*. Vai trò: thêm phi tuyến. Đừng sợ; hiểu cái gì nó làm quan trọng hơn thuộc công thức.

**Giới hạn của "lắp xe đạp" (mục 2):** xe lắp xong tĩnh; mạng nơ-ron thay đổi trong lúc học và việc "hội tụ" không đảm bảo tối ưu (Chương 8). Và ẩn dụ "bộ phận khớp nhau" gợi ý dễ lắp — thực tế chọn architecture/hyperparameter là nghệ thuật đòi nhiều thử nghiệm (sẽ nói đầy đủ ở lộ trình FL/CL).

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: nhìn "bức tranh toàn cảnh" của một dự án ML; đọc một vòng huấn luyện mà không sợ; chẩn đoán model bằng đường cong loss; giao tiếp với người làm dữ liệu/bảo mật/kinh doanh về "mô hình đang làm gì".

Nó **không --** nên ép để *thiết kế mạng từ đầu* ngay (cần lộ trình chi tiết, thực hành); ---thay thế cần thiết thử nghiệm thực tế; và không nên bỏ qua **đánh giá test** để tin lời khẳng định "model rất chuẩn".

Nếu bạn muốn đi tiếp thật sự vào học máy/học sâu bài bản (kỹ thuật, mã, đánh giá), hướng đến bộ tài liệu lộ trình *Federated & Continual Learning for Computer Vision* — chương đó đưa bạn từ nền tảng lên dự án thực tế, chính là sự tiếp nối tự nhiên của cuốn sách này.

---

## Đọc sâu — theo dấu một con số qua cả vòng học

Đại số tuyến tính, giải tích và tối ưu không phải ba bài toán tách rời khi mô hình đang học. Chúng cùng xử lý một dự đoán: biểu diễn đầu vào, so với nhãn, tính đạo hàm rồi đổi tham số. Ta có thể theo dấu từng số trước khi dùng mạng hàng triệu trọng số.

| Giai đoạn đời thực | Công cụ toán | Sản phẩm của bước |
|---|---|---|
| Ước lượng thời gian từ quãng đường | Hàm số và đặc trưng | Dự đoán có cùng đơn vị với nhãn |
| Đánh giá một dự đoán sai bao xa | Hàm mất mát | Một số đo lỗi theo mục tiêu đã chọn |
| Điều chỉnh quy tắc lần sau | Dây chuyền và gradient descent | Tham số mới; sau đó cần đánh giá lại |

**Đọc thành lời:** với `ŷ=wx`, `L=(ŷ−y)²`, ta có `dL/dw=2(ŷ−y)x`. Đọc là “mức thay đổi lỗi theo trọng số bằng hai lần sai số nhân với đầu vào”. Thừa số x đến từ dây chuyền: thay w một chút thì dự đoán thay nhanh x lần. Đầu ra dự đoán và loss không phải cùng một đại lượng; loss còn phụ thuộc nhãn y.

**Tính tay:** lấy một mẫu x=2, y=6, khởi tạo w=1. Dự đoán là 2, sai số −4, loss 16. Đạo hàm theo w là `2×(−4)×2=−16`. Dùng α=0.1, w mới là `1−0.1×(−16)=2.6`; dự đoán mới 5.2, loss mới `(5.2−6)²=0.64`. Ta đã quan sát một bước giảm lỗi, không cần giả vờ đã chứng minh mô hình tổng quát tốt.

**Phản ví dụ:** nếu bỏ thừa số x vì chỉ nhớ “đạo hàm của bình phương”, gradient sẽ thành −8; đó không phải gradient theo w. Nếu ghép nhiều tầng tuyến tính mà không có activation, kết quả vẫn là tuyến tính; có bias thì kết quả là affine. Nhiều tầng như thế không tự tạo được mọi quan hệ phi tuyến, dù có nhiều tham số hơn.

**Thử tương tác:** với dự đoán `ŷ = wx + b` tại `x = 2`, đổi w và b để tách ảnh hưởng của từng tham số lên sai số. Đây là một mẫu, chưa phải loss trung bình trên dữ liệu.

:::interactive linear
:::

**Giới hạn:** loss bằng 0 trên một mẫu chỉ cho biết đã khớp mẫu đó. Không có bằng chứng rằng quy luật y=3x đúng ở mọi x hoặc với nhóm dữ liệu mới. Loss cũng không phải “xác suất dự đoán đúng”: một số loss được xây từ **âm log-likelihood**, nên giảm loss tương ứng tăng likelihood dưới một mô hình xác suất cụ thể. MSE cần thêm giả định nhiễu Gaussian mới có cách diễn giải âm log-likelihood tương ứng, tới hệ số và hằng số.

:::quiz
Với x=2, y=6, w=1 và L=(wx−y)², gradient theo w là bao nhiêu?
A. −4.
B. −8.
C. −16.
Đáp án: C
Giải thích: Dùng dây chuyền: 2(wx−y)x=2(2−6)×2=−16; không được bỏ đạo hàm của wx theo w.
:::

**Tự thử thêm:** x=1, y=3, w=1; dùng cùng loss bình phương và α=0.25. Tính một bước rồi nêu kết luận có thể rút ra.

:::goi-y
Tính dự đoán, loss, gradient theo đúng thứ tự. Sau update phải tính lại loss bằng tham số mới.
:::

:::loi-giai
Dự đoán đầu=1, loss=4, gradient=2(1−3)×1=−4. w mới=2, dự đoán mới=2, loss=1. Kết luận: bước này giảm loss trên mẫu đang xét; chưa kết luận được sai số trên dữ liệu chưa thấy.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Ba "trụ cột" (đại số tuyến tính, giải tích, xác suất) lần lượt đóng vai gì trong một mô hình học? Kể bằng lời.
2. Kể tên ít nhất 2 nơi trong "vòng huấn luyện" có gradient/đạo hàm.
3. ReLU (phi tuyến) làm gì và vì sao cần?

### Luyện tập (áp dụng vào bài toán mới)
4. Với mô hình `ŷ = w·x` và dữ liệu (1, 3), (2, 5). Viết loss MSE và lấy đạo hàm theo w (đừng giải; chỉ viết). Gợi ý khởi tạo w=0, bước 1-2 bước với α nhỏ.
5. Nhìn vào hai đường cong: (a) train_loss ↓, val_loss ↑; (b) cả hai ↓ và sát nhau. Diễn giải từng trường hợp.
6. Giải thích vì sao hai tầng tuyến tính không có activation "sụp" về tuyến tính.

### Thử thách (liên hệ với máy tính/AI)
7. Nêu 2 cách giảm overfit (thấy ở val loss tăng) theo ngôn ngữ của các chương đã học (nghĩ về Chương 5 phương sai, Chương 8 regularization, dữ liệu).
8. Một đồng nghiệp nói "model đạt 100% accuracy trên train, nên chắc chắn đúng." Viết phản hồi ngắn giải thích vì sao 100% train chưa đủ kết luận, kèm việc cần kiểm tra gì.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Đại số tuyến tính: biểu diễn dữ liệu & trọng số thành vector/ma trận. Giải tích: gradient/dây chuyền cho backprop. Xác suất: loss như khả năng; đầu ra là xác suất; diễn giải không chắc chắn.
2. (i) Tính `∂loss/∂w` khi backward. (ii) `∇loss` trong update `w ← w − α·∇loss`. (iii) dây chuyền qua từng tầng.
3. Giữ số dương, số âm → 0; thêm phi tuyến để mạng không "sụp" về tuyến tính, biểu diễn hàm phức tạp hơn.
4. `loss = (1/2)[(w−3)²+(2w−5)²]`. `loss' = (1/2)[2(w−3)·1 + 2(2w−5)·2] = (w−3)+2(2w−5) = (w−3)+(4w−10) = 5w−13`. Tại w=0 → −13; α=0.1 → w=1.3; v.v.
5. (a) overfit: model khớp train nhưng sai dữ liệu mới. (b) học tốt và tổng quát.
6. Biến đổi tuyến tính hợp thành vẫn tuyến tính (tích ma trận vẫn ma trận); không phi tuyến thì mô hình không biểu diễn được đường phân chia cong.
7. (a) Dùng regularization (thêm phạt lên trọng số) để giảm độ phức tạp/giảm phương sai (C5/C8). (b) Tăng dữ liệu (augmentation) hoặc giảm năng lực mô hình, hoặc dừng sớm khi val loss bắt đầu tăng.
8. Phản hồi: 100% train có thể chỉ là overfit (thuộc lòng train). Cần kiểm tra `test/val loss & accuracy` — dữ liệu chưa từng thấy. Nếu test thấp hơn rõ, đó không phải model "đúng".
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. Một mô hình học = **biểu diễn dữ liệu** (ma trận) + **model đo lỗi** (loss) + **học tham số** (gradient descent) — ba trụ cột từ các chương trước hợp lại.
2. **Mạng nơ-ron** là nhiều biến đổi ma trận xếp chồng, ngắt bằng **activation** (phi tuyến) để học được thứ không tuyến tính.
3. Máy "học" là **chạy vòng lặp**: dự đoán → tính loss → backprop lấy gradient → cập nhật trọng số.
4. Đọc **đường cong train/val loss** để biết mô hình đang underfit, tốt, hay overfit.
5. Đừng tin **loss/accuracy trên train** một mình; và đừng coi mạng nơ-ron như "não người" — hãy hiểu nó là một cỗ máy điều chỉnh tham số.