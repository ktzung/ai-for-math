# Chương 3.4–3.5 — Hàm mất mát, mini-batch, optimizer và learning rate (Giai đoạn 3)

> **Câu hỏi trọng tâm:** *Khi dữ liệu quá lớn để tính loss một lần, ta "bập-bênh" mini-batch như thế nào — và optimizer (SGD/Adam) + learning rate điều tiết học ra sao?**

---

## 1. Vị trí trong lộ trình

G3.1–3.3 dựng mạng + forward/backward. Giờ xử lý *huấn luyện trên quy mô thật*: không thể đưa toàn bộ dữ liệu vào một bước (tốn bộ nhớ, chậm). Giải pháp: **mini-batch** — huấn luyện từng lô nhỏ. Và dùng **optimizer** (SGD/Adam) + **learning rate** để điều khiển bước đi (mở rộng G2.6).

Nó **nối** từ G2.6 (gradient descent) và **chuẩn bị** cho G4 (CNN train trên dataset ảnh), và FL (G6 — local epochs/batches rất quan trọng trong FedAvg).

---

## 2. Kiến thức cần dùng

- Gradient descent cơ bản (G2.6).
- Mạng nơ-ron forward/backprop (G3.3).
- Vòng lặp huấn luyện (G1.4).

**Ôn nhanh:** `θ ← θ − α·∇L` (G2.6). Trước đây ta dùng *toàn bộ* dữ liệu tính 1 bước (batch gradient). Giờ chia thành các *mini-batch* nhỏ.

---

## 3. Câu chuyện mở đầu

Lan có 50.000 ảnh. Nếu mỗi bước huấn luyện tính loss/gradient trên **toàn bộ 50.000 ảnh** (`batch gradient`), một bước rất chậm và tốn RAM. Cô thử huấn luyện **từng ảnh một** (`stochastic`, SGD thuần) — nhanh nhưng bước rất "nhiễu", loss dao động lạ lùng.

Giữa hai thái cực có **mini-batch**: gom 64 ảnh một lô, tính 1 bước trên lô đó, quét qua hết dữ liệu gọi là một *epoch*. Cô thấy: vừa đủ nhanh, vừa ổn định, và một chút "nhiễu" của từng lô còn giúp thoát hố địa phương (bonus). Cùng lúc, cô đổi `optimizer` (mặc định Adam) và chỉnh `learning rate` — bộ ba quyết định lớn đến chuyện model "có học được không".

---

## 4. Câu hỏi trọng tâm

**Mini-batch giải quyết quy mô dữ liệu thế nào (batch/epoch), và optimizer + learning rate ảnh hưởng tới hội tụ ra sao?**

---

## 5. Trực giác

**Mini-batch = "điều tra từng nhóm" thay vì "điều tra cả nước mỗi bước".** Thay vì xem toàn bộ dữ liệu để quyết định một bước (chậm), ta xem một lô (64 mẫu) — đủ để ước lượng xu hướng chung, nhanh, và ít nhiễu hơn từng mẫu đơn.

- **Batch size (kích thước lô):** số mẫu mỗi bước. 64, 128, 256 thường.
- **Epoch:** một lần quét hết dữ liệu (tất cả mini-batch). Ví dụ 50.000/64 ≈ 782 bước là 1 epoch.
- **Mỗi bước** = forward trên lô → loss lô → backward → cập nhật.

**Optimizer:**
- **SGD:** update cơ bản `θ←θ−α·∇L` (G2.6). Đơn giản, nhưng có thể chậm/oscillate khó chịu.
- **Momentum:** giữ "quán tính" (nhớ hướng cũ), giúp đi thẳng đều, giảm dao động, thoát hố nhỏ.
- **Adam:** kết hợp momentum + tự co giãn learning rate theo magnitude của gradient từng tham số — rất phổ biến, "tự thích nghi" bước đi.

**Learning rate (lr):** như đã học (G2.6) — quá lớn văng, quá nhỏ chậm. Trong thực hành, lr là siêu tham số quan trọng nhất thường chỉnh đầu tiên (G3.7).

**Phép so sánh "điều tra từng nhóm":** trực quan cho mini-batch. **Giới hạn:** ghi chú rằng "nhiễu mini-batch giúp thoát hố địa phương" là trực giác thô, không phải định lý; còn chi tiết SGD vs Adam phức tạp (không cần chứng minh ở đây). Mỗi optimizer có đánh đổi.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** tập mẫu; chia thành các **mini-batch** qua `DataLoader` (G1.4).
- **Model/forward:** như G3.3, nhưng *mỗi lô* chạy forward.
- **Loss:** trung bình loss trong lô (MSE/CE).
- **Optimizer:** SGD / Adam (chọn siêu tham số lr, batch_size qua val).
- **epoch:** quét hết dữ liệu một lần = nhiều bước mini-batch.

**Thuật toán (loop chuẩn):**
```
for epoch in range(E):
    for x_batch, y_batch in dataloader:      # mỗi lô
        opt.zero_grad()
        loss = criterion(model(x_batch), y_batch)
        loss.backward()
        opt.step()
    # cuối epoch: đánh giá val (G2.3)
```

---

## 7. Thuật toán từng bước

**Bước 1 — DataLoader (mini-batch + shuffle).**

```python
from torch.utils.data import DataLoader, TensorDataset
ds = TensorDataset(x_tensor, y_tensor)           # (G1.4)
dl = DataLoader(ds, batch_size=64, shuffle=True)
```

- `batch_size=64` — kích thước lô.
- `shuffle=True` — xáo tráo các mẫu giữa các epoch để model không học theo thứ tự (quan trọng tránh rò rỉ thứ tự, G2.8).

**Bước 2 — SGD.**

```python
opt = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
```
- `momentum` thêm "quán tính" cho hướng cập nhật.

**Bước 3 — Adam.**

```python
opt = torch.optim.Adam(model.parameters(), lr=0.001)
```
- Adam mặc định lr 0.001, thường hoạt động tốt khởi đầu.

**Bước 4 — Điều chỉnh lr.** South: lr quá lớn → loss dao động/phân kỳ; quá nhỏ → hội tụ chậm. Thử phạm vi 1e-3 → 1e-4 cho Adam, 1e-2 → 1e-3 cho SGD (tùy model).

**Lỗi thường gặp:** quên `shuffle`; batch_size quá lớn (hết RAM); quên `zero_grad()` giữa lô (G1.4); lr quá lớn gây NaN/loss âm không đúng.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 10 mẫu, batch_size 4 → cần bao nhiêu bước để hết dữ liệu (1 epoch)?

**Bước 1 — Chia lô:** [0..3], [4..7], [8..9] → **3 bước** (lô cuối 2 mẫu, vẫn ok; DataLoader mặc định còn mẫu lẻ).

**Bước 2 — Số bước/epoch:** `ceil(10/4) = 3`. Sau 3 bước, hết 1 epoch.

**Bước 3 — Với 50.000 ảnh, batch 64:** `ceil(50000/64) = 782` bước mỗi epoch.

**Bước 4 — Diễn giải:** epoch đo "huấn luyện xong một lượt dữ liệu"; batch_size chọn cân giữa tốc độ (lớn → ít bước nhưng cần nhiều RAM) và ổn định gradient (lớn → ít nhiễu hơn). Không có batch_size đúng tuyệt đối; thử nghiệm + val.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** tính gradient trên **toàn bộ dữ liệu** mỗi bước (batch gradient).

| Phương diện | Toàn bộ dữ liệu/lần | Mini-batch |
|---|---|---|
| Tốc độ mỗi bước | chậm, tốn RAM | nhanh, ít RAM |
| Gradient ổn định | rất ổn | hơi nhiễu (đôi khi lợi) |
| Loại "rò tương lai" thứ tự | không liên quan | shuffle quan trọng |
| Đánh đổi | chính xác | chọn batch_size |

**Cải thiện:** khả thi quy mô lớn, nhanh. **Đánh đổi:** nhiễu nhỏ (thường lợi thoát hố); phải chọn batch_size — nếu quá nhỏ → nhiễu lớn, quá lớn → RAM.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát ảnh hưởng batch_size và lr.

1. Cùng model/dữ liệu, chạy với batch_size {1, 16, 128, tất cả}. Quan sát: batch 1 loss dao động nhiều (nhiễu), batch toàn bộ chậm/ổn, mini-batch 16–128 tốt.
2. Chạy Adam/SGD với lr lớn/nhỏ. Ghi nhận khi nào bị phân kỳ (loss tăng) hay quá chậm.
3. Kết luận: batch_size vừa + lr vừa + shuffle là khởi đầu lành.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/batch_lr.py`:

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(0)
x = torch.randn(200, 8)
y = (x[:, 0] > 0).long()

def run(batch_size, lr, opt_name):
    model = nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 2))
    opt = (torch.optim.SGD(model.parameters(), lr=lr) if opt_name=="sgd"
           else torch.optim.Adam(model.parameters(), lr=lr))
    dl = DataLoader(TensorDataset(x, y), batch_size=batch_size, shuffle=True)
    for _ in range(200):
        for xb, yb in dl:
            opt.zero_grad()
            loss = F.cross_entropy(model(xb), yb)
            loss.backward(); opt.step()
    with torch.no_grad():
        acc = (model(x).argmax(1) == y).float().mean().item()
    print(f"bs={batch_size} lr={lr} {opt_name}: acc={acc:.3f}")

run(16, 0.01, "sgd")
run(64, 0.001, "adam")
```

**Kết quả dự kiến:** cả hai hội tụ → accuracy cao (VD 0.9+); các tổ hợp lr/batch khác có thể kém. Hãy thử lr lớn (1.0) để thấy phân kỳ.

**Lỗi thường gặp:** quên shuffle; nhãn `long`; lr lớn gây NaN.

**Chú thích trung thực:** dữ liệu giả đơn giản; mục đích minh họa batch/lr, không tối ưu accuracy thật. Số có thể lệch theo seed.

---

## 12. Đánh giá

**Chỉ số:** model hội tụ (acc cao) với mini-batch vừa + lr hợp lý; hiểu được batch_size/epoch/shuffle; biết SGD vs Adam khác nhau; biết lr phạm vi khởi đầu.

**Vì sao chọn:** đây là "bộ điều khiển" huấn luyện; quyết định model có học được hay không.

**Chỉ số không thể hiện:** không tối ưu siêu tham số thật (dùng val); không phủ learning rate schedule (giảm lr theo epoch) — chương nền.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Batch_size càng lớn càng tốt (giảm nhiễu)." — Không hẳn: lớn cần RAM, và nhiễu nhỏ có thể kém tổng quát (trực giác), cũng có hiện tượng "generalization gap". Mini-batch vừa thường tốt.
- **Hiểu lầm 2:** "Adam là 'mặc định thắng'." — Adam mạnh nhưng không phải lúc nào cũng tốt nhất (có thể kém tổng quát hơn SGD-tuned; không áp cho FL dễ dàng — đọc thêm G6). Chọn optimizer theo tình huống.
- **Hiểu lầm 3:** "Great lr chỉ nhỏ thôi." — Quá nhỏ cũng tệ (chậm). Nên dùng learning rate search (log scale) và theo val loss, không đoán mù.
- **Giới hạn:** các phương pháp hiện đại (learning rate scheduler, warmup, gradient accumulation) không nằm đây; nhưng hiểu batch/lr/optimizer gốc là nền đọc chúng.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt batch size và epoch.
2. SGD vs Adam khác nhau cơ bản (quán tính momentum & tự điều chỉnh lr).
3. Vì sao shuffle quan trọng với mini-batch?

### Luyện tập (sửa đổi / mở rộng)
4. Với 1000 mẫu, batch 128 → mấy bước mỗi epoch? Lô cuối dư mấy mẫu?
5. Chạy `batch_lr.py` thêm lr lớn (1.0): ghi nhận behavior (phân kỳ/NaN).
6. Thử bỏ `shuffle=True` trong DataLoader — với dữ liệu giả có thể vẫn ok, nhưng nêu vì sao nên shuffle.

### Thử thách (thiết kế / liên hệ)
7. Trong FL (G6), mỗi client huấn luyện vài **local epochs** bằng mini-batch với lr riêng. Giải thích: vì sao lr/local epoch lớn của client có thể tăng **client drift** — nối với G2.6.
8. Trong Continual Learning (G7), vì sao "học nhiều epoch trên nhiệm vụ mới" có thể làm *quên nhiệm vụ cũ* mạnh hơn (mnemonica learning rate nhỏ / rehearsal để giảm) — liên hệ batch/epoch bạn vừa học.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Batch size = số mẫu một bước; epoch = quét hết dữ liệu (nhiều bước).
2. SGD chỉ `θ−α·∇L` (+ tùy momentum); Adam thêm momentum và tự co giãn lr theo gradient — thích nghi hơn, hay dùng mặc định.
3. Tránh model học theo thứ tự dữ liệu (rò rỉ thứ tự, G2.8) và giúp các lô đại diện đều hơn.
4. `ceil(1000/128)=8` bước; lô cuối 104 mẫu (1000 − 7×128 = 104).
5. lr lớn → loss tăng/NaN — "phân kỳ" (G2.6). Giảm lr.
6. Nếu dữ liệu theo thứ tự có lớp (mẫu giống kề nhau), lô không đại diện → bias; shuffle tạo phân phối đều. (Với dữ liệu giả i.i.d. thì ok, nhưng kỷ luật shuffle vẫn nên giữ.)
7. Client dùng lr lớn / nhiều local epoch → bước cập nhật mạnh theo phân phối riêng → trọng số lệch xa "mô hình gom chung" → client drift tăng. FedAvg chịu ảnh hưởng. (G6 chuyên sâu.)
8. Học nhiều epoch task mới khiến trọng số "quá khớp" task mới → mất kiến thức cũ nhanh (catastrophic forgetting, G7). Cách giảm: học ít hơn (điều chỉnh epoch/lr nhỏ trên new data) hoặc rehearsal (nhớ mẫu cũ) — nối khái niệm batch/epoch.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Mini-batch** — huấn luyện từng lô nhỏ (batch_size), một lần quét = **epoch**; shuffle quan trọng.
2. Loop chuẩn: cứ mỗi lô → forward → loss → backward → step → zero_grad.
3. **Optimizer:** **SGD** (đơn giản) vs **Adam** (momentum + tự thích nghi) — chọn theo tình huống.
4. **Learning rate** là siêu tham số then chốt; quá lớn phân kỳ, quá nhỏ chậm — chỉnh theo val.
5. Batch/lr/local-epoch liên hệ trực tiếp **client drift** trong FL và **forgetting** trong CL (G6/G7).

**Tự kiểm tra:**
- Batch size là gì, epoch là gì?
- Kể các siêu tham số của optimizer/lr.
- Vì sao shuffle?
- Ảnh hưởng của lr quá lớn?
- Liên hệ batch/lr/local epoch đến FL và CL?

## 16. Đọc sâu bằng trực giác — chia xấp hồ sơ thành từng tập nhỏ

Một người kiểm kê kho có 1.000 hồ sơ và chỉ đủ chỗ trên bàn cho 32 hồ sơ mỗi lượt.
Cô không thể bày cả kho ra một lần, cũng không muốn cầm từng tờ một vì quá lâu.
Cách làm thật là chia thành từng xấp 32 tờ, xử lý xấp này xong mới sang xấp khác,
và ghi lại "đã đi hết kho một lượt" mỗi khi bàn được dọn trống.

| Tình huống | Vai trò của toán | Câu hỏi thực tế |
|---|---|---|
| Chia 1.000 hồ sơ thành xấp 32 tờ | Phép chia lấy trần `ceil(N/B)` | Một lượt cần đặt bao nhiêu xấp lên bàn? |
| Xấp cuối chỉ còn 8 tờ | Số dư của phép chia | Bỏ xấp lẻ hay vẫn xử lý nó? |
| Quét kho 10 lượt | Nhân số bước với số epoch | Tổng cộng bao nhiêu lần cập nhật? |

**Đọc thành lời:** `steps_per_epoch = ceil(N/B)` và `total_steps = ceil(N/B) × E` nghĩa là: lấy tổng số mẫu chia cho kích thước lô, làm tròn lên vì xấp cuối không được bỏ dở, rồi nhân với số epoch. Ở đây `N` là số mẫu, `B` là batch size, `E` là số epoch, và `ceil` là làm tròn lên chứ không phải làm tròn gần nhất. Điều dễ đọc sai là lấy `N/B` rồi bỏ phần lẻ: với 1.000 mẫu và lô 32, phép chia cho 31,25, người vội sẽ nói 31 bước và làm rơi 8 mẫu cuối. Một chỗ dễ sai nữa là quên rằng `drop_last=True` đổi công thức thành `floor(N/B)`, tức là chủ động bỏ 8 mẫu đó ở mọi epoch.

**Tính tay:** Với `N=1.000`, `B=32`, `E=10`, `drop_last=False`: `31 × 32 = 992`, còn dư `1.000 − 992 = 8`, nên `ceil(1.000/32) = 32` bước mỗi epoch. Mười epoch cho `32 × 10 = 320` bước. Trong 320 bước ấy có `31 × 10 = 310` lô đầy 32 mẫu và 10 lô lẻ 8 mẫu; tổng số mẫu đã đi qua là `310 × 32 + 10 × 8 = 9.920 + 80 = 10.000`, đúng bằng `N × E`. Con số 320 đếm số lần `optimizer.step()`, không phải số epoch.

**Phản ví dụ:** Lan thấy val loss dao động nên kết luận "học chưa đủ" và tăng `E` từ 10 lên 30, giữ nguyên `lr=0.1`. Số bước tăng từ 320 lên 960, nhưng mỗi bước vẫn nhảy một quãng quá dài; val loss không giảm mà còn nhảy mạnh hơn, có lúc thành NaN. Sai ở chỗ tăng số bước không sửa được độ dài của mỗi bước. Kết quả đúng: hạ lr và thử vài giá trị theo thang log trước, chỉ tăng epoch khi đường val còn giảm đều.

**Giới hạn:** Các công thức trên đúng khi mỗi epoch duyệt đúng `N` mẫu và `DataLoader` không bỏ mẫu; với `drop_last=True`, sampler tùy biến hoặc dữ liệu streaming thì phải đếm lại. Quan trọng hơn, số bước chỉ là số phép cập nhật, không bảo đảm hội tụ: Adam tự co giãn bước theo từng tham số nhưng vẫn phân kỳ với lr quá lớn, và lô nhỏ hơn không làm gradient "đúng hơn". Cũng không thể suy ra chất lượng mô hình chỉ vì đã chạy đủ 320 bước.

:::interactive batch
:::

:::quiz
Với `N=1.000`, `B=32`, `E=1`, `drop_last=False`, một epoch có bao nhiêu bước và lô cuối chứa bao nhiêu mẫu?
A. 31 bước, lô cuối 32 mẫu
B. 32 bước, lô cuối 8 mẫu
C. 32 bước, lô cuối 32 mẫu
Đáp án: B
Giải thích: `31 × 32 = 992` nên còn 8 mẫu; `ceil(1.000/32) = 32` bước, trong đó bước thứ 32 chỉ có 8 mẫu. Chọn A là bỏ mất lô lẻ; chọn C là quên rằng lô cuối không đầy.
:::

**Tự thử thêm:** Một tập có `N=10.000`, `B=64`, `E=15`. Tính số bước mỗi epoch và tổng số bước khi `drop_last=False`; sau đó tính lại khi `drop_last=True` và cho biết mỗi epoch bỏ đi bao nhiêu mẫu, cả 15 epoch bỏ bao nhiêu.

:::goi-y
`156 × 64 = 9.984`, sát 10.000 nhưng chưa tới. Hãy hỏi phần dư đó được tính thành một bước hay bị cắt, rồi nhân với 15.
:::

:::loi-giai
`drop_last=False`: `ceil(10.000/64) = 157` bước mỗi epoch (156 lô đầy và 1 lô 16 mẫu), tổng `157 × 15 = 2.355` bước. `drop_last=True`: `floor(10.000/64) = 156` bước mỗi epoch, tổng `156 × 15 = 2.340` bước, và mỗi epoch bỏ `10.000 − 9.984 = 16` mẫu, sau 15 epoch bỏ `16 × 15 = 240` mẫu. Chênh lệch 15 bước chính là 15 lô lẻ bị cắt.
:::