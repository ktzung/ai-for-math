# Chương 3.6 — Khởi tạo trọng số, chuẩn hóa và regularization (Giai đoạn 3)

> **Câu hỏi trọng tâm:** *Ngoài loss/lr, còn những "công tắc" nào quyết định mạng có học trơn tru không — khởi tạo, batch/layer norm, dropout?*

---

## 1. Vị trí trong lộ trình

G3.4–3.5 đã chạy mạng với mini-batch/lr. Nhưng mạng sâu dễ gặp các vấn đề âm thầm: khởi tạo xấu → không học; gradient vanishing/exploding; overfit (G2.5). Chương này cung cấp **kỹ thuật ổn định & chống overfit** cho deep net.

Nó **nối** từ G2.5 (regularization nói chung) và G3 (deep net), **chuẩn bị** cho G4 (CNN — batch norm, dropout rất phổ biến) và G5 (Transformer — layer norm đóng vai trò then chốt).

---

## 2. Kiến thức cần dùng

- Overfit/regularization (G2.5).
- Deep net forward/backward (G3.3), mini-batch (G3.4).

**Ôn nhanh:** regularization = phạt độ phức tạp (G2.5: `λ·R(θ)`). Gradient vanishing = đạo hàm ở tầng sâu nhỏ dần khi xuyên qua nhiều tầng → tầng sâu không học.

---

## 3. Câu chuyện mở đầu

Lan tăng số tầng mạng để học vấn đề phức tạp. Kết quả: loss **không giảm** — mạng "chết". Cô rà: khởi tạo trọng số ban đầu quá xấu khiến các neuron bão hòa (đạo hàm ~0 → không học). Cô học được rằng khởi tạo có chuẩn (Xavier/Kaiming), và dùng thêm **batch normalization**(nuôi những tầng với dữ liệu chuẩn hóa giữa chừng) để quá trình ổn định; đồng thời thêm **dropout** để chống overfit khi mạng lớn. Một loạt "công tắc kỹ thuật" đã đưa mạng từ "chết" sang "học được".

---

## 4. Câu hỏi trọng tâm

**Khởi tạo, batch/layer norm và dropout là gì, và chúng ổn định / điều tiết việc học của mạng sâu thế nào?**

---

## 5. Trực giác

**Khởi tạo = "điểm xuất phát của người bịt mắt" (G2.6).** Nếu bạn bắt đầu ở một chỗ rất dốc/bão hòa, gradient nhỏ → không tiến. Nếu khởi tạo quá to/nhỏ, activation "ngập" hoặc "chết". Có các cách khởi tạo chuẩn (Xavier/Kaiming) giữ phương sai của biểu diễn ổn định qua các tầng → gradient truyền tốt hơn.

**Batch Norm (chuẩn hóa theo lô):** giữa các tầng, chuẩn hóa activation về trung bình 0/phương sai 1 *trong từng lô* (rồi cho học lại bằng scale/shift). Giống "cân lại bằng giữa các tầng" — giúp quá trình ổn định, giảm nhạy cảm khởi tạo/lr, và thường tăng tốc hội tụ. *(Layer Norm làm tương tự nhưng chuẩn hóa theo từng mẫu thay vì toàn lô — quan trọng trong Transformer, G5.)*

**Dropout:** ngẫu nhiên "tắt" một phần neuron trong mỗi bước huấn luyện → mạng không dựa quá vào một vài neuron → *giảm overfit* (giống "học theo nhiều mô hình con"). Khi đánh giá, tắt dropout.

**Phép so sánh "khởi tạo = điểm xuất phát; norm = cân bằng giữa các khâu; dropout = không để một người gánh hết":** đều trực quan. **Giới hạn:** norm/dropout không "tự động làm mọi thứ" — chúng có siêu tham số và tương tác phức tạp với lr/architecture; không nên tin vào "phép màu kỹ thuật", mà phải theo dõi val.

---

## 6. Từ trực giác đến mô hình

- **Khởi tạo:** quy định phương sai ban đầu của `W` (VD `nn.Linear` mặc định Kaiming trong PyTorch). Khi khởi tạo thủ công, dùng `nn.init.kaiming_normal_` / `xavier_uniform_` tùy activation.
- **Chuẩn hóa:** `nn.BatchNorm1d/2d`, `nn.LayerNorm` — chuẩn hóa trong forward.
- **Regularization/điều tiết:** `nn.Dropout(0.5)` — tắt neuron; `weight_decay` (L2, G2.5).
- **Tác động:** ổn định gradient, giảm overfit, tăng hội tụ.

**Thuật toán (sử dụng các công tắc):**
```
1. Chọn khởi tạo hợp lý (mặc định PyTorch thường đủ).
2. Xen BatchNorm/LayerNorm khi cần (đặc biệt mạng sâu).
3. Thêm Dropout (vùng last layer, khi mạng lớn/overfit).
4. Nếu overfit: tăng dropout/weight_decay; nếu chậm hội tụ: kiểm khởi tạo/lr/norm.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Mạng với khởi tạo chuẩn + norm + dropout.**

```python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(8, 64),
    nn.BatchNorm1d(64),      # chuẩn hóa theo lô
    nn.ReLU(),
    nn.Dropout(0.3),         # .tắt 30% neuron lúc train
    nn.Linear(64, 2),
)
```

- `BatchNorm1d` chuẩn hóa theo từng lô (đại trà cho MLP).
- `Dropout(0.3)` tắt ngẫu nhiên 30% — *chỉ lúc huấn luyện*, lúc eval PyTorch tự tắt.

**Bước 2 — Khởi tạo thủ công (khi cần kiểm soát).**

```python
def init_weights(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
model.apply(init_weights)
```

**Bước 3 — Theo dõi hiệu quả.** So sánh val loss/acc khi có/không norm/dropout/khởi tạo. Quan sát: mạng sâu thường học tốt hơn có norm; large net overfit thì dropout giúp.

**Lỗi thường gặp:** quên model.eval() -> Dropout/BatchNorm dùng sai ở đánh giá (tắt dropout, dùng running stats của BN); dropout quá mạnh → underfit; BN trên batch quá nhỏ (1/2) kém ổn định.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** mạng sâu 10 tầng ReLU, khởi tạo kém (phương sai to). Số liệu activation:

**Bước 1 — Khởi tạo xấu:** trọng số quá to → sau vài tầng, `W·x` rất lớn → ReLU bão hòa / các giá trị phình to → `∇L` (dây chuyền) tiến 0 hoặc bùng (vanishing/exploding).

**Bước 2 — BatchNorm:** chuẩn hóa activation về 0/1 giữa các tầng → các tầng sau nhận dữ liệu "đúng cỡ", gradient truyền ổn hơn → mạng học được.

**Bước 3 — Dropout (giảm overfit):** với mạng 64→32→2 trên dữ liệu ít, thêm Dropout(0.5) → val accuracy tăng (giảm overfit, tương tự G2.5 nhưng đặc trưng cho mạng).

**Bước 4 — Kết luận:** đây là "công tắc" ổn định/điều tiết; không phải lúc nào cũng cần, phải theo dõi val.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** mạng sâu không norm, không dropout, khởi tạo mặc định bất kỳ.

| Phương diện | Không kỹ thuật | Có norm/dropout/khởi tạo |
|---|---|---|
| Hội tụ mạng sâu | khó (vanishing) | ổn định hơn |
| Overfit mạng lớn | dễ | giảm (dropout) |
| Nhạy cảm lr/khởi tạo | cao | thấp hơn ít |
| Đánh đổi | đơn giản | thêm siêu tham số, cần val |

**Cải thiện:** learnable/sâu ổn, ít overfit. **Đánh đổi:** nhiều siêu tham số (dropout rate, epsilon), cần đánh giá — không vì có dropout/norm mà bỏ theo dõi val.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát 2 công tắc.

1. **Khởi tạo:** mạng 10 tầng, khởi tạo to (std lớn) vs Kaiming. So loss/val sau vài epoch: khởi tạo to dễ "chết"/không học.
2. **Dropout:** mạng lớn trên dữ liệu nhỏ; có vs không Dropout(0.5). Quan sát val accuracy (dropout giảm overfit).
3. Ghi nhận bằng số liệu nhỏ, minh họa rõ vai trò.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/stabilize_demo.py`:

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader

torch.manual_seed(0)
x = torch.randn(300, 8); y = (x[:,0] + 0.5*x[:,1] > 0).long()

def make(use_norm=True, use_dropout=False):
    layers = [nn.Linear(8, 64)]
    if use_norm: layers.append(nn.BatchNorm1d(64))
    layers += [nn.ReLU()]
    if use_dropout: layers.append(nn.Dropout(0.5))
    layers += [nn.Linear(64, 2)]
    return nn.Sequential(*layers)

def run(model):
    opt = torch.optim.Adam(model.parameters(), lr=0.01)
    dl = DataLoader(list(zip(x, y)), batch_size=32, shuffle=True)
    for _ in range(120):
        model.train()
        for xb, yb in dl:
            opt.zero_grad()
            loss = F.cross_entropy(model(xb), yb)
            loss.backward(); opt.step()
    model.eval()
    with torch.no_grad():
        return (model(x).argmax(1) == y).float().mean().item()

print("no norm/dropout:", round(run(make(False, False)), 3))
print("with norm:", round(run(make(True, False)), 3))
# dropout giảm overfit — trên dữ liệu giả này ít khác, dùng để thấy dòng chạy
```

**Kết quả dự kiến:** đều accuracy cao (dữ liệu dễ); điểm minh họa là *chạy được* norm/dropout và hiểu ý nghĩa — để thấy rõ lợi ích cần mạng sâu hơn + dữ liệu nhiễu (mở rộng thí nghiệm).

**Lỗi thường gặp:** quên `model.train()`/`eval()` khi dropout/BN; BatchNorm với batch size 1 lỗi; import.

**Chú thích trung thực:** trên dữ liệu đơn giản không thấy rõ khác biệt — bằng chứng thực sự cần mạng sâu/ví dụ thực. Đây để làm quen API; mục đích hiểu khái niệm.

---

## 12. Đánh giá

**Chỉ số:** biết khi nào cần khởi tạo/norm/dropout; dùng đúng API (train/eval mode); hiểu norm ổn định deep net và dropout giảm overfit.

**Vì sao chọn:** khả năng "cứu mạng không học" bằng các công tắc này là kỹ năng thực hành trung thực — khác với tưởng rằng mọi bug do lr.

**Chỉ số không thể hiện:** không chứng minh tối ưu hóa tuyệt đối; mỗi công tắc có đánh đổi và tương tác — không có công thức chung.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Dropout và BatchNorm luôn cần." — Không; thêm vô tội vạ có thể hại (dưới-khớp, ổn định giả). Dùng có chủ đích theo tình huống.
- **Hiểu lầm 2:** "BatchNorm ổn định hơn thì bỏ qua val." — Nhầm; vẫn phải đánh giá val; norm không "tự giải quyết" overfit.
- **Hiểu lầm 3:** "Khởi tạo to giúp nhanh hơn." — Ngược lại, to dễ bão hòa/vanishing. Dùng khởi tạo chuẩn phù hợp activation.
- **Giới hạn:** còn nhiều kỹ thuật (group norm, label smoothing, gradient clip) không đưa; chương này nền cho G4/G5. Và "đúng công tắc" phụ thuộc architecture/dữ liệu, không có lời giải phổ quát.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Khởi tạo kém có thể gây gì cho mạng sâu? Cho ví dụ.
2. BatchNorm vs LayerNorm: chuẩn hóa theo gì?
3. Dropout giảm overfit bằng cách nào?

### Luyện tập (sửa đổi / mở rộng)
4. Thêm `nn.Dropout(0.8)` (quá cao) vào mạng — quan sát thay đổi val (dưới-khớp?). Giải thích.
5. Thử mạng 8 tầng, khởi tạo to (std=2.0) vs Kaiming. So hội tụ.

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), BatchNorm có vấn đề gì khi mỗi client có phân phối/batch nhỏ khác nhau? (gợi ý: running stats toàn cục lệch). Vì sao nhiều FL ops đổi sang GroupNorm/LayerNorm?
7. Trong CL (G7) / mô hình nền tảng (G5), vì sao BatchNorm running stats thường "đóng băng"/thay bằng LayerNorm khi fine-tune? (nối chuẩn hóa với phân phối thay đổi.)

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Khởi tạo to/không hợp → activation bão hòa hoặc vanishing/exploding gradient → mạng "chết"/không học (G3.3).
2. BatchNorm chuẩn hóa theo *fromng lô* (mean/std lô); LayerNorm chuẩn hóa theo *từng mẫu* (mean/std trên features) — không phụ thuộc batch size.
3. Ngẫu nhiên tắt neuron → mạng không dựa vào vài neuron đặc thù → biểu diễn "phân bố hơn", giảm overfit (giống ensemble nhiều mô hình con).
4. Dropout 0.8 rất mạnh → mạng "kém năng lực" lúc train → dưới-khớp; val giảm. Cần rate vừa (0.2–0.5).
5. Khởi tạo to (std 2.0) hoặc dẫn mất hội tụ/NaN; Kaiming học tốt → vì sao khởi tạo ảnh hưởng gradient truyền.
6. BatchNorm dùng running stats toàn cục; khi client non-IID, phân phối thay đổi → stats lệch, hoạt động kém. Nhiều FL dùng GroupNorm/LayerNorm (không phụ thuộc phân phối lô) để stable giữa client. G6/G8.
7. Khi fine-tune trên phân phối mới, BatchNorm running stats sẽ "trôi" theo dữ liệu mới, hại nhau với mô hình nền tảng giữ biểu diễn cũ. Nhiều nơi đóng băng BN hoặc dùng LayerNorm — liên quan chuẩn hóa + phân phối thay đổi (G5/G7).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Khởi tạo chuẩn** (Kaiming/Xavier) ổn định gradient — tránh mạng "chết".
2. **BatchNorm / LayerNorm** chuẩn hóa giữa các tầng — giúp ổn định, hội tụ tốt; BatchNorm theo lô, LayerNorm theo mẫu.
3. **Dropout** tắt ngẫu nhiên neuron → giảm overfit (kèm `weight_decay` L2).
4. Nhớ `model.train()`/`model.eval()` để các công tắc hoạt động đúng.
5. Các công tắc này quan trọng đặc biệt nghịch cảnh **FL (non-IID) và CL (phân phối đổi)** — được bàn tiếp ở G6/G7.

**Tự kiểm tra:**
- Khởi tạo gây vanishing gradient thế nào?
- BatchNorm và LayerNorm khác nhau gì?
- Dropout giảm overfit bằng cơ chế nào?
- Vì sao BatchNorm gây khó trong FL non-IID?

## 16. Đọc sâu bằng trực giác — chỉnh thang đo trước khi cộng số

Một kỹ thuật viên nhận hai bảng số đo từ hai máy khác nhau: một máy ghi bằng mét, máy kia bằng milimét.
Trước khi so sánh hay tính trung bình, cô phải đưa chúng về cùng thang đo, nếu không số lớn sẽ lấn át số nhỏ một cách vô nghĩa.
Chuẩn hóa trong mạng nơ-ron làm đúng việc ấy ở mỗi tầng, còn khởi tạo và weight decay quyết định thang đo ban đầu và mức phình được phép.

| Tình huống | Vai trò của toán | Câu hỏi thực tế |
|---|---|---|
| Hai lần đọc lệch đơn vị | Chuẩn hóa theo lô: trừ trung bình, chia độ lệch chuẩn | Lấy thống kê từ đâu khi đánh giá một mẫu? |
| Mỗi mẫu có thang riêng | Chuẩn hóa theo đặc trưng của từng mẫu | Chuẩn hóa theo hàng hay theo cột? |
| Không cho số đo phình vô hạn | Phạt `λ‖θ‖²` trong hàm mất mát | Phạt tham số có thay được việc chuẩn hóa? |

**Đọc thành lời:** `x̂ = (x − μ_B) / sqrt(σ_B² + ε)` rồi `y = γ·x̂ + β` nghĩa là: lấy từng activation, trừ trung bình của lô, chia cho độ lệch chuẩn của lô (có thêm `ε` để không chia cho 0), sau đó nhân với `γ` và cộng `β` — hai tham số học được. Điều dễ đọc sai là tưởng đầu ra BatchNorm luôn có trung bình 0 và độ lệch 1: chỉ `x̂` mới như vậy, còn `y` có trung bình `β` và độ lệch `|γ|`. Một chỗ khác dễ sai là quên `μ_B`, `σ_B²` lấy theo lô khi huấn luyện nhưng lấy từ running statistics khi `model.eval()`, nên cùng một ảnh có thể cho đầu ra khác nhau giữa hai chế độ.

**Tính tay:** Lô có bốn activation `[1, 3, 5, 7]`. Trung bình `μ = 16/4 = 4`; phương sai `σ² = ((−3)² + (−1)² + 1² + 3²)/4 = 20/4 = 5`; độ lệch chuẩn `σ ≈ 2,236`. Vậy `x̂ ≈ [−1,342; −0,447; 0,447; 1,342]`. Với `γ=2`, `β=1`: `y ≈ [−1,683; 0,106; 1,894; 3,683]`, có trung bình đúng bằng `β = 1` và độ lệch chuẩn đúng bằng `γ = 2`.

**Phản ví dụ:** Một bạn đọc rằng LayerNorm "chuẩn hóa" và weight decay cũng "chuẩn hóa trọng số", nên bỏ weight decay khi đã có LayerNorm. Sai ở chỗ hai phép tác động lên hai đại lượng khác nhau: LayerNorm chỉnh thống kê của activation theo từng mẫu và không thêm số hạng nào vào loss; weight decay cộng `λ‖θ‖²` vào loss để kéo trọng số về nhỏ, không đụng tới thống kê activation. Kết quả đúng: giữ cả hai như hai công tắc độc lập, và chọn `λ` bằng validation chứ không suy từ việc đã có norm.

**Giới hạn:** BatchNorm cần lô đủ lớn; với lô 1 hoặc 2, phương sai ước lượng rất nhiễu. Trong FL non-IID, mỗi client có thống kê lô khác nhau nên running statistics gộp lại có thể không đại diện cho client nào — đó là lý do nhiều thiết kế FL chuyển sang GroupNorm hoặc LayerNorm. Chuẩn hóa không sửa được mất cân bằng lớp, không thay được dữ liệu tốt, và không bảo đảm accuracy tăng; nó chỉ làm việc tối ưu bớt nhạy với thang đo.

:::interactive normalize
:::

:::quiz
Một tầng BatchNorm có `γ=3`, `β=−1`. Trung bình đầu ra của tầng trên một lô là bao nhiêu?
A. 0
B. −1
C. 3
Đáp án: B
Giải thích: BatchNorm đưa `x̂` về trung bình 0, sau đó `y = γ·x̂ + β` có trung bình `β = −1`. `γ` chỉ đổi độ lệch chuẩn thành 3, không đổi trung bình.
:::

**Tự thử thêm:** Một mẫu có ba đặc trưng `[0, 2, 4]` được đưa qua LayerNorm với `γ=2`, `β=1`. Tính `μ`, `σ²`, các giá trị `x̂` và đầu ra `y`; kiểm lại trung bình và độ lệch chuẩn của `y`.

:::goi-y
LayerNorm lấy trung bình trên ba đặc trưng của chính mẫu đó, không lấy trên các mẫu khác trong lô. Phương sai chia cho 3 vì có ba phần tử.
:::

:::loi-giai
`μ = (0+2+4)/3 = 2`; `σ² = ((−2)² + 0² + 2²)/3 = 8/3 ≈ 2,667`; `σ ≈ 1,633`. Suy ra `x̂ ≈ [−1,225; 0; 1,225]` và `y = 2·x̂ + 1 ≈ [−1,449; 1; 3,449]`. Trung bình của `y` là 1, độ lệch chuẩn là 2, đúng bằng `β` và `γ`.
:::