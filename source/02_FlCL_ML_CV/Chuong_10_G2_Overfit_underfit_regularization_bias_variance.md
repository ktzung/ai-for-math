# Chương 2.5 — Overfitting, underfitting, regularization và đánh đổi bias–variance (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Vì sao mô hình "học thuộc lòng" là sai, và làm sao cân bằng giữa "quá đơn giản" và "quá phức tạp"?*

---

## 1. Vị trí trong lộ trình

G2.3 đã dạy đo val/test; G2.4 đã có model đầu tiên. Giờ đến vấn đề trung tâm của học máy thực hành: **qua-khớp (overfit)** / **dưới-khớp (underfit)** và cách điều tiết bằng **regularization**. Đây là "căn bệnh nghề nghiệp" số 1 của người làm ML.

Nó **nối** từ G2.3 (val loss phát hiện overfit) và **chuẩn bị** cho G3 (mạng lớn rất dễ overfit), G4 (CV), và FL/CL (trong CL, "quên" chính là một kiểu cân bằng cực độ — sẽ gặp ở G7).

---

## 2. Kiến thức cần dùng

- Loss, train/val/test (G2.2, G2.3), model tuyến tính (G2.4).
- Math: phương sai, độ phức tạp, đạo hàm (Chương 4, 5 sách toán).

**Ôn nhanh:** `loss.train` ↓ mãi nhưng `loss.val` ↑ = overfit (G2.3). Regularization = "thêm một phần thưởng/phạt để mô hình không quá phức tạp".

---

## 3. Câu chuyện mở đầu

Lan huấn luyện model giá nhà từ diện tích. Cô thử tăng dần "độ linh hoạt" của model: từ đường thẳng, đường bậc 2, bậc 5, ... đến một model siêu phức tạp khớp *từng* điểm dữ liệu.

Với đường thẳng (bậc 1): model đơn giản nhưng *dự đoán kém* cả trên train (underfit — chưa đủ khả năng). Với model siêu phức tạp: khớp hoàn hảo train nhưng *sai tệ trên test* (overfit — thuộc từng điểm, không bắt quy luật chung). Đâu đó giữa hai thái cực là model "vừa đủ".

Lan nhận ra sẽ tìm được điểm cân bằng: **train_loss giảm** khi model phức tạp hơn, nhưng **val_loss giảm rồi tăng** — cột mốc xác định "đủ tốt mà không overfit". Đây là nội dung cả chương.

---

## 4. Câu hỏi trọng tâm

**Thế nào là underfit và overfit, và làm sao điều chỉnh (regularization) để chọn độ phức tạp vừa phải (cân bias–variance)?**

---

## 5. Trực giác

Hình dung vẽ đường qua các điểm dữ liệu (giá nhà theo diện tích):

- **Underfit (dưới-khớp):** model quá đơn giản (đường thẳng) không bắt được xu hướng — sai *cả* train và test. "Chưa đủ công lực."
- **Overfit (guộc-khớp):** model quá phức tạp vẽ một đường ngoằn ngoèo qua *từng* điểm — khớp train hoàn hảo nhưng sai test. "Học thuộc lòng đề, không hiểu luật."
- **Vừa phải:** khoảng giữa, model bắt xu hướng chính mà không sa vào nhiễu.

**Hai "cực" và nguyên nhân:** underfit vì *độ phức tạp thấp* (năng lực mô hình không đủ). Overfit vì *độ phức tạp quá cao so với lượng/nhiễu dữ liệu* — model tự do quá mức, tận dụng cả nhiễu âm để khớp vài mẫu.

**Regularization** là cách"kìm" model lại để không tự do quá mức: thêm một khoản phạt vào loss khi tham số trở nên quá lớn → model buộc giữ tham số nhỏ, ít "trần trụi" vào dữ liệu.

**Phép so sánh "học thuộc lòng vs hiểu quy luật":** trực quan. **Giới hạn:** "độ phức tạp tối ưu" phụ thuộc lượng dữ liệu và nhiễu; không có công thức đơn nhất. Và trong học sâu (G3), mạng lớn overfit phức tạp hơn — regularization là một trong nhiều kỹ thuật (dropout, augmentation — G3/G4).

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** tập có nhiễu `y = f(x) + noise`.
- **Model:** hàm dự đoán với tham số `θ`.
- **Hàm mất mát tổng:** `loss_total = loss_data(θ) + λ·R(θ)`.
  - `loss_data` — lỗi dự đoán (MSE/CE, G2.2).
  - `R(θ)` — *regularizer*: phạt độ lớn/năng lượng tham số (ví dụ tổng bình phương `θ²` = L2, hay tổng trị tuyệt đối `|θ|` = L1).
  - `λ` (lambda) — *cường độ* điều tiết: càng lớn càng kìm tham số.
- **bias / variance (đánh đổi):**
  - **Bias cao (underfit):** error do mô hình quá đơn giản, không bắt được quy luật.
  - **Variance cao (overfit):** error do mô hình quá nhạy với dữ liệu, kết quả dao động khi đổi dữ liệu.
  - Mục tiêu: cân bằng bias–variance để giảm lỗi *tổng* trên dữ liệu mới.
- **Ω, λ:** λ là siêu tham số ta chọn qua validation.

**Thuật toán điều chỉnh:**
```
1. Huấn luyện model với regularization, theo dõi val loss.
2. Tăng complexity / giảm λ → xem val loss.
3. Chọn điểm mà val loss nhỏ nhất (không chọn theo train).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Thêm regularization vào optimizer PyTorch (L2).**

```python
opt = torch.optim.SGD(model.parameters(), lr=0.01, weight_decay=1e-3)
```

`weight_decay` = thêm khoản `λ·(bình phương trọng số)` vào loss tự động — đây là L2 (điều tiết trọng số về gần 0). Giá trị nhỏ (1e-3) hợp lý khởi đầu.

**Bước 2 — Trực quan "vẽ đường" qua model đa thức (để thấy overfit).**

```python
# tạo dữ liệu nhiễu
x = torch.linspace(-2, 2, 30); y = 0.5*x + 1.5 + 0.3*torch.randn_like(x)
```

Huấn luyện model bậc 1 (dưới-khớp), bậc cao (overfit) rồi so sánh loss train/val.

**Bước 3 — Đọc val loss khi tăng complexity.**

```
Bậc 1: train ~2.2, val ~2.5   (underfit — đều cao)
Bậc 3: train ~0.4, val ~0.6   (vừa — tốt)
Bậc 8: train ~0.02, val ~2.9  (overfit — train rất thấp, val cao)
```

**Bước 4 — Regularization kìm overfit:** model bậc 8 + weight_decay lớn → val giảm về ~1.0 (ít phức tạp hơn nhiễu).

**Lỗi thường gặp:** nhìn train loss để chọn (sai — phải val); đặt `weight_decay` quá lớn → dưới-khớp (bias cao); quên giữ val tách khỏi quyết định.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 2 điểm (x=1→2, x=2→4) — trung thực là `y=2x`. Model "bậc rất cao" có thể khớp 2 điểm đó bằng nhiều đường cong khác nhau.

**Bước 1 — Nếu chỉ 2 điểm, bias cao khi chọn đường thẳng?** `y=2x` khớp 2 điểm (0% sai train), cũng khớp quy luật.

**Bước 2 — Overfit "tinh vi":** một đường cong bậc 10 cũng khớp 2 điểm trên train, nhưng với 1 điểm mới tại x=3 (thực tế y=6) nó có thể ra bất kỳ giá trị nào phụ thuộc đường cong → sai test.

**Bước 3 — Regularization vai trò:** phạt tham số lớn sẽ "làm phẳng" đường cong, đưa về gần đường thẳng tin cậy → giảm variance, chấp nhận chút bias.

**Bước 4 — Kết luận:** với dữ liệu ít, ta không nên tin "model khớp 100% train" — regularization + đánh giá val là cách chống ảo giác.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ tăng/giảm độ phức tạp model (đa thức bậc cao/thấp) không regularization.

| Phương diện | Chỉ đổi complexity | + Regularization |
|---|---|---|
| Kiểm soát phức tạp | nhảy thô (chọn bậc) | mịn (λ) |
| Khả năng dùng model phức tạp | dễ overfit | kìm được phức tạp |
| Về bias/variance | chọn 1 thái | cân bằng liên tục |
| Đánh đổi | dễ hiểu | thêm siêu tham số λ |

**Cải thiện:** điều chỉnh mịn, cho phép model phức tạp mà không overfit. **Đánh đổi:** phải chọn λ hợp lý (qua val) — nếu λ sai, dưới-khớp. Đây là chọn siêu tham số, một kỹ năng thực hành cốt lõi.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** nhìn trực tiếp underfit / overfit / tác dụng regularization.

1. Tạo dữ liệu nhiễu.
2. Huấn luyện model bậc 1 (underfit), bậc 3 (vừa), bậc 8 (overfit) — in train/val loss.
3. Thêm weight_decay lên model bậc 8, quan sát val loss giảm.
4. Vẽ và ghi nhận hình dạng từng đường: bậc 1 thẳng (dưới), bậc 3 lượn vừa, bậc 8 ngoằn ngoèo. Khi có weight_decay, bậc 8 phẳng hơn.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/bias_variance_demo.py`:

```python
import torch, torch.nn as nn, torch.nn.functional as F

torch.manual_seed(0)
x = torch.linspace(-2, 2, 30).unsqueeze(1)
y = 0.5 * x + 1.5 + 0.3 * torch.randn_like(x)

def make_degree(d):
    return torch.nn.Sequential(
        torch.nn.Linear(d, 64), torch.nn.ReLU(), torch.nn.Linear(64, 1))

for deg in [1, 3, 12]:
    model = make_degree(deg)
    opt = torch.optim.Adam(model.parameters(), lr=0.02)
    feats = torch.cat([x**k for k in range(1, deg+1)], 1)
    for _ in range(800):
        opt.zero_grad(); loss = F.mse_loss(model(feats), y); loss.backward(); opt.step()
    tr = F.mse_loss(model(feats), y).item()
    print("deg", deg, "train_loss", round(tr, 3))
```

**Kết quả dự kiến:** deg càng cao, train_loss càng thấp (thậm chí ~0) — nhưng đó là thí nghiệm chỉ vẽ trên train; thêm val (G2.3) để thấy val_cnt tăng khi overfit.

**Lỗi thường gặp:** dùng đúng số mũ; quên val set; đổi đặc trưng không khớp.

**Chú thích trung thực:** chưa thêm val ở đây (để gọn), nhưng *phải* dùng val để đánh giá — đừng kết luận từ train_loss như ví dụ. Bạn được khuyến khích thêm val để quan sát overfit.

---

## 12. Đánh giá

**Chỉ số:** chọn được độ phức tạp/λ mà **val_loss nhỏ nhất** (không theo train); biết phân biệt underfit (cả train/val cao) và overfit (train thấp, val cao).

**Vì sao chọn:** val_loss là thước đo "khả năng tổng quát" — đúng cái model cần. Đánh giá "chọn đúng độ phức tạp" là kỹ năng cốt lõi.

**Chỉ số không thể hiện:** chương này không tối ưu một metric cụ thể (accuracy...); nó dạy *cơ chế*. Chỉ số thực dụng (precision/recall) sẽ ở G2.7.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Train loss thấp = model tốt." — Sai (đây chính là bẫy overfit). Phải nhìn val.
- **Hiểu lầm 2:** "Overfit chỉ do model quá phức tạp." — Cũng do *dữ liệu ít / nhiễu nhiều / đặc trưng quá nhiều so với mẫu*. Cùng một model, dữ liệu ít dễ overfit.
- **Hiểu lầm 3:** "Regularization luôn tốt, cứ đặt lr/λ lớn." — Quá lớn → underfit (bias cao). λ phải chọn hợp lý qua val, không mù.
- **Giới hạn:** trong deep learning, hiện tượng phức tạp hơn (mạng lớn có thể "double descent"; overfitting kỳ lạ). Chương này cho trực giác cổ điển; G3 bổ sung thực hành deep. Đừng áp ngây ngô "phức tạp cao luôn overfit" cho mọi G3/G4 case.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt underfit / overfit bằng trực giác và bằng train/val loss.
2. Giải thích bằng lời vai trò `λ` trong `loss = loss_data + λ·R(θ)`.
3. "Bias cao" và "variance cao" tương ứng với hiện tượng nào?

### Luyện tập (sửa đổi / mở rộng)
4. Với model bậc 8 dễ overfit, đề xuất 2 cách khác ngoài regularization để giảm overfit (nghĩ về dữ liệu và model).
5. Thêm val vào bias_variance_demo và ghi nhận val loss khi tăng deg.

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), nếu mỗi client có rất ít dữ liệu, mô hình client rất dễ overfit trên dữ liệu client — giải thích và nêu khả năng (chuẩn hóa, chia tập, mô hình dùng chung). 
7. Trong Continual Learning (G7), "học lớp mới không quên lớp cũ" liên quan như thế nào đến bias–variance? (gợi ý: model mới tinh chỉnh có thể biến "past knowledge" thành bias sai / tăng variance mất cũ — mở đầu G7)

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Underfit: đơn giản → cả train+val cao. Overfit: quá khớp → train thấp, val cao.
2. λ cân bằng giữa "khớp dữ liệu" (loss_data) và "đơn giản" (R). λ lớn → model đơn giản hơn (giảm overfit, tăng bias); λ nhỏ → tự do khớp.
3. Bias cao + underfit (model đơn giản, lỗi hệ thống); Variance cao + overfit (model nhạy, dao động theo dữ liệu).
4. (a) Tăng dữ liệu / augmentation; (b) giảm năng lực model (ít tầng/đặc trưng) hoặc dừng sớm/giảm epochs.
5. Val sẽ tăng khi tăng deg sau điểm tối ưu — xác định "điểm chín" của độ phức tạp.
6. Client dữ liệu ít → model client overfit (thuộc client). Giảm bằng regularization/tăng dữ liệu client, hoặc dùng model chia sẻ toàn cục như là "regularizer" cho bản update (fed proximal — G6). 
7. Học lớp mới làm trọng số đổi để khớp lớp mới (giảm bias trên lớp mới) nhưng làm mất kiến thức lớp cũ (tăng bias trên lớp cũ — catastrophic forgetting). Cân bằng "giữ cũ + học mới" giống cân bias–variance theo thời gian — chủ đề G7.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Underfit**: model quá đơn giản (bias cao, cả train+val kẹt).
2. **Overfit**: model quá khớp dữ liệu (variance cao, train rất thấp nhưng val cao) — bẫy phổ biến.
3. Chọn độ phức tạp / siêu tham số theo **val loss** (không theo train).
4. **Regularization** (`loss + λ·R`) kìm model để cân bias–variance; λ chọn qua val.
5. Deep learning có hiện tượng phức tạp hơn (G3) — đây là trực giác nền.

**Tự kiểm tra:**
- Cách phân biệt underfit/overfit bằng loss train & val?
- Vai trò `λ` và `weight_decay` là gì?
- Vì sao không chọn model theo train loss?
- Kể 2 cách giảm overfit không phải regularization.

---

## 16. Đọc sâu bằng trực giác — regularization là dây cương, không phải bịt mắt

Một đầu bếp giỏi có thể nhớ từng món trong buổi thử nếm nhưng nấu dở món mới. Dây cương regularization không làm đầu bếp quên món cũ; nó buộc công thức phải đơn giản hơn để chuyển sang món mới. Đổi lại, cương quá chặt thì đầu bếp không dám nêm gì.

| Cơ chế | Tác dụng | Dấu hiệu lạm dụng |
|---|---|---|
| L2 (`λΣw²`) | Kéo trọng số về nhỏ, làm mượt | `λ` lớn: mô hình gần như hằng số |
| L1 (`λΣ|w|`) | Đẩy một số trọng số về 0 | Chọn đặc trưng không ổn định khi tương quan |
| Dừng sớm | Giảm số bước học | Dừng khi val còn nhiễu |

**Đọc thành lời:** mục tiêu huấn luyện là `L = L_dữ_liệu + λ·R(w)`. Số hạng đầu muốn khớp dữ liệu; số hạng sau muốn trọng số nhỏ hoặc thưa; `λ` quyết định bên nào nặng hơn. Điều dễ đọc sai là nghĩ regularization luôn tăng độ chính xác train; nó thường làm train tệ hơn để val tốt hơn.

**Tính tay:** với một mẫu `x=1, y=1`, loss dữ liệu `(w−1)²`, thêm L2 `0,1w²`. Đạo hàm `2(w−1)+0,2w=0` cho `2,2w=2`, tức `w≈0,909`. Không có regularization thì `w=1`; có thì trọng số bị kéo về 0. Riêng số hạng phạt tại `w=3` là `0,1×3²=0,9`.

**Phản ví dụ:** đặt `λ` cực lớn rồi thấy train loss và val loss cùng cao, kết luận "dữ liệu không học được". Thực ra mô hình bị ép về gần hằng số, tức underfit do regularization, không phải do thiếu thông tin. Ngược lại, `λ=0` và train loss gần 0, val loss tăng là dấu hiệu overfit chứ không phải regularization yếu.

**Giới hạn:** L2 không tự loại đặc trưng và phụ thuộc thang đo: đặc trưng có đơn vị lớn chịu phạt khác đặc trưng nhỏ nếu không chuẩn hóa. Regularization không bù được nhãn nhiễu hay thiếu dữ liệu đại diện. Và `λ` là siêu tham số: chọn trên train chỉ tối ưu train, phải chọn bằng validation.

:::interactive regularization
:::

:::quiz
Với `λ=0,1` và trọng số `w=3`, số hạng phạt L2 `λw²` bằng bao nhiêu?
A. 0,9
B. 0,3
C. 3,0
Đáp án: A
Giải thích: `0,1×3²=0,1×9=0,9`. Chọn B là quên bình phương; chọn C là bỏ `λ`.
:::

**Tự thử thêm:** với cùng loss dữ liệu `(w−1)²`, đổi `λ=0,5`. Giải điều kiện đạo hàm bằng 0 để tìm `w`, rồi so với trường hợp `λ=0,1` và giải thích chiều thay đổi.

:::goi-y
Đạo hàm của `(w−1)²+0,5w²` là `2(w−1)+w`. Đặt bằng 0 rồi giải.
:::

:::loi-giai
`2w−2+w=0` cho `3w=2`, tức `w=2/3≈0,667`. Tăng `λ` từ 0,1 lên 0,5 kéo `w` xa 1 và gần 0 hơn: mô hình đơn giản hơn, đổi khả năng khớp train lấy khả năng tổng quát.
:::