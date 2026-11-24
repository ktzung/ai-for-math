# Chương 4.1–4.3 — Ảnh số, phân loại ảnh, convolution/padding/stride/pooling (Giai đoạn 4)

> **Câu hỏi trọng tâm:** *Ảnh được máy "nhìn" như mảng số ra sao, và mạng nơ-ron tích chập (CNN) dùng phép chập để trích đặc trưng không gian như thế nào?*

---

## 1. Vị trí trong lộ trình

Đã có deep learning nền (G3). Giai đoạn 4 áp vào **thị giác máy tính (Computer Vision)**: hiểu dữ liệu ảnh và kiến trúc **CNN** (Convolutional Neural Network) — nền của mọi kiến trúc hiện đại về ảnh. Đây là "lãnh thổ" trung tâm của lộ trình (FL/CL-CV), vì mọi chủ đề đích (G6–G8) đều nói về ảnh.

Ta gộp 4.1 (ảnh số, pixel, kênh, tiền xử lý), 4.2 (phân loại ảnh) và 4.3 (convolution/padding/stride/pooling) thành một vì chúng là một dòng: từ "ảnh là số" → "bài toán phân loại ảnh" → "phép tích chập trích đặc trưng". Các chương sau (4.4 CNN kiến trúc, 4.5–4.8) tiếp nối.

---

## 2. Kiến thức cần dùng

- Dữ liệu tensor ảnh (G1.2), deep net (G3), đánh giá (G2.7).

**Ôn nhanh:** ảnh xám = ma trận số (pixel) (G1.2, sách toán C3). Ảnh màu = 3 kênh (R,G,B) chồng nhau = tensor 3 chiều (C,H,W). MLP (G3.3) làm việc trên vector đã dẹt; CNN giữ cấu trúc không gian.

---

## 3. Câu chuyện mở đầu

Lan gặp giới hạn khi áp MLP lên ảnh: ảnh 32×32×3 = 3.072 số, dẹt thành vector, MLP xử lý nhưng **mất thông tin không gian** (pixel kề nhau quan trọng — mép/thành/vùng đối tượng), và tham số khổng lồ (ảnh lớn → overfit). Cô cần một kiến trúc nhận biết "cấu trúc cục bộ" của ảnh và tái sử dụng mẫu ở nhiều chỗ — đó là **CNN** với phép **tích chập (convolution)**.

---

## 4. Câu hỏi trọng tâm

**Phép tích chập (kernel, padding, stride) trích đặc trưng cục bộ thế nào, và pooling làm gì để giảm kích thước? Vì sao CNN hiệu quả và ít tham số hơn MLP trên ảnh?**

---

## 5. Trực giác

**Phép tích chập (convolution) = "một kính lọc quét qua ảnh để nhấn một đặc trưng".** Bạn có ảnh (lưới pixel) và một *bộ lọc nhỏ* (kernel, VD 3×3) — một ma trận trọng số nhỏ. Bạn đặt bộ lọc lên từng vùng 3×3, nhân từng pixel với trọng số, cộng lại, ra một con số mới cho vùng đó. Quét hết ảnh → bạn có một "bản đồ đặc trưng" (feature map).

- **Kernel/bộ lọc thực chất là một phép phát hiện mẫu** (VD phát hiện cạnh dọc, đường ngang, chấm). Khởi đầu ngẫu nhiên, mạng **tự học** các kernel này từ dữ liệu.
- **Nhiều kernel** → nhiều bản đồ đặc trưng (mỗi cái một loại mẫu).

**Padding & stride điều khiển kích thước đầu ra:**
- **Padding:** thêm khung (thường 0) quanh ảnh để kernel quét tới đúng mép, giữ nguyên/điều chỉnh kích thước.
- **Stride:** bước nhảy của kernel khi quét (stride 1 trượt từng pixel; 2 trượt cách hai) → giảm kích thước.

**Pooling:** sau convolution, lấy "tổng hợp" theo vùng (VD `max` lấy giá trị lớn nhất trong 2×2). Giữ lại đặc trưng nổi bật nhưng **giảm kích thước** (giảm tham số, tăng dịch-vị trí ổn định nhẹ). `MaxPool2d` phổ biến.

**Tại sao CNN ít tham số hơn MLP?** MLP nối *mỗi pixel với mỗi neuron* (đầy đủ). CNN dùng **kernel nhỏ dùng chung** (sharing): một kernel 3×3 với 9 trọng số *áp ở mọi vị trí* → rất ít tham số và "học được mẫu cục bộ khắp ảnh". Đây là linh hồn của CNN.

**Phép so sánh "kính lọc quét":** chuẩn. **Giới hạn:** convolution chỉ bắt *cục bộ* một vùng nhỏ; để có bối cảnh toàn ảnh cần nhiều tầng (receptive field lớn dần) — về sau G5 (attention) giải quyết bối cảnh toàn cục khác đi.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** tensor ảnh (N, C, H, W) — C kênh (1 xám / 3 màu), H cao, W rộng.
- **Conv:** `nn.Conv2d(in_channels, out_channels, kernel_size, padding, stride)`.
- **Pooling:** `nn.MaxPool2d(kernel_size=2, stride=2)`.
- **Phân loại ảnh:** CNN (conv+pool nhiều tầng) xuất feature → flatten → `Linear` cuối → logits lớp → CrossEntropy.

**Thuật toán Konv:** quét kernel qua ảnh, tính chập, tạo feature map; nhiều kernel nhiều map; xen pooling; cuối cùng flatten + MLP phân loại.

---

## 7. Thuật toán từng bước

**Bước 1 — Một phép convolution tay trên ảnh 4×4, kernel 2×2.**

Ảnh (cùng 1 kênh):
```
[[1, 0, 2, 3],
 [5, 6, 7, 8],
 [4, 3, 2, 1],
 [0, 9, 8, 7]]
```
Kernel:
```
[[1, 0],
 [0, 1]]
```
**Bước 1a — ô (0,0):** `(1×1)+(0×0)+(5×0)+(6×1) = 1+0+0+6 = 7`.
**Bước 1b — ô (0,1):** kernel qua `[0,2;6,7]` → `0+0+0+7=7`.
**Bước 1c — ô (0,2):** kernel qua `[2,3;7,8]` → `2+8=10`.
**Bước 1d — ô (1,0):** qua `[5,6;4,3]` → `5+3=8`.
**Bước 1e — ô (1,1):** qua `[6,7;3,2]` → `6+2=8`.
**Bước 1f — ô (1,2):** qua `[7,8;2,1]` → `7+1=8`.
**Bước 1g — ô (2,0):** qua `[4,3;0,9]` → `4+9=13`.
**Bước 1h — ô (2,1):** qua `[3,2;9,8]` → `3+8=11`.
**Bước 1i — ô (2,2):** qua `[2,1;8,7]` → `2+7=9`.
**Bước 1j — kích thước đầu ra:** ảnh 4×4, kernel 2×2, stride 1 → `(4-2+1)=3` theo mỗi chiều → **3×3 map**.
```
7   7  10
8   8   8
13 11   9
```
*(Chín ô là chín lần đặt kernel; mỗi ô là một tổng có trọng số trên vùng 2×2 tương ứng.)*

**Bước 2 — Công thức kích thước đầu ra.**

```
out = floor((H + 2·pad − kernel) / stride) + 1
```
Ví dụ H=32, kernel=3, pad=1, stride=1 → `(32+2−3)/1 + 1 = 32` (giữ nguyên). pad=0, stride=2 → `(32−3)/2+1 = 15`.

**Bước 3 — CNN nhỏ trong PyTorch cho CIFAR (32×32×3).**

```python
import torch.nn as nn
cnn = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # 32→16
    nn.Conv2d(16, 32, kernel_size=3, padding=1), nn.ReLU(), nn.MaxPool2d(2), # 16→8
    nn.Flatten(),
    nn.Linear(32*8*8, 128), nn.ReLU(),
    nn.Linear(128, 10),    # 10 lớp
)
```

**Bước 4 — Diễn giải:** conv giảm nông (kích thước), pool giảm không gian, cuối flatten + MLP phân loại. Số tham số nhỏ so với MLP dẹt.

**Lỗi thường gặp:** quên padding → kích thước co nhanh; sai in/out channels; flatten sai shape → tính lại `out` mỗi tầng.

---

## 8. Ví dụ nhỏ có số liệu

**Bài toán:** ảnh 5×5×1, kernel 3×3, stride 2, pad 0 → kích thước output?

**Bước 1 — Áp công thức:** `(5 − 3)/2 + 1 = 1 + 1 = 2` → 2×2.
**Bước 2 — Sao stride 2:** kernel nhảy 2 pixel, ảnh 5 → 2 vị trí theo chiều (5→2). 
**Bước 3 — Padding ảnh hưởng:** thêm pad=1 → `(5+2−3)/2+1=2+1=3` → 3×3. Padding thường giúp giữ độ phân giải.
**Bước 4 — Kết luận thực hành:** ít padding + stride 1 → co nhanh; nhiều pad + stride 1 → giữ nguyên. Thiết kế kiến trúc cần tính toán.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** MLP dẹt ảnh thành vector.

| Phương diện | MLP dẹt ảnh | CNN |
|---|---|---|
| Giữ cấu trúc không gian | mất | giữ (cục bộ) |
| Số tham số (ảnh lớn) | khổng lồ | nhỏ (share kernel) |
| Học đặc trưng cục bộ | khó | tự nhiên |
| Đánh đổi | đơn giản, linh hoạt vị trí quá nhiều | cần thiết kế conv/pool |

**Cải thiện:** hiệu quả, ít tham số, học đúng cấu trúc. **Đánh đổi:** phải tính toán kích thước, chọn kernel/pool.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát CNN học phân loại ảnh tốt hơn MLP (trên MNIST/CIFAR nhỏ).

1. Huấn luyện MLP dẹt vs CNN nhỏ trên cùng subset CIFAR (G1.2). So val accuracy.
2. Vẽ feature map của tầng conv đầu (activate trên vài ảnh) — nhìn kernel phát hiện cạnh/mẫu.
3. Ghi nhận CNN thường đạt cao hơn với ít tham số hơn đáng kể.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + torchvision (+matplotlib).

**Cấu trúc:** `scripts/cnn_mnist.py`:

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, Subset

t = transforms.ToTensor()
train = Subset(datasets.MNIST(root="./data", train=True, download=True, transform=t), range(3000))
test  = Subset(datasets.MNIST(root="./data", train=False, download=True, transform=t), range(500))
tr = DataLoader(train, batch_size=32, shuffle=True)
te = DataLoader(test, batch_size=64)

model = nn.Sequential(
    nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),   # 28→14
    nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # 14→7
    nn.Flatten(), nn.Linear(32*7*7, 64), nn.ReLU(), nn.Linear(64, 10),
)
opt = torch.optim.Adam(model.parameters(), lr=1e-3)

for _ in range(5):
    model.train()
    for xb, yb in tr:
        opt.zero_grad(); F.cross_entropy(model(xb), yb).backward(); opt.step()
model.eval()
with torch.no_grad():
    acc = (model(next(iter(te))[0][:100]).argmax(1) == next(iter(te))[1][:100]).float().mean()
print("acc:", round(acc.item(), 3))
```

**Kết quả dự kiến:** accuracy cao (~0.9) trên 100 ảnh test; lưu ý đây subset nhỏ để chạy nhanh.

**Lỗi thường gặp:** input MNIST 1 kênh → `nn.Conv2d(1, ...)` (không nhầm 3 kênh hình); flatten shape `32*7*7`; CPU tải MNIST chậm lần đầu (download).

**Chú thích trung thực:** chạy nhanh trên CPU; dùng subset nhỏ. Accuracy trên 100 mẫu test; để đánh giá đúng nên dùng test đủ (nhưng tốn hơn) — đây là minh họa.

---

## 12. Đánh giá

**Chỉ số:** CNN đạt accuracy hợp lý (n>random) trên subset; hiểu công thức kích thước output; tính tay được một phép chập ô trên kernel/cách stride/pad.

**Vì sao chọn:** nắm "phép chập" bằng cả tay lẫn code là nền để đọc CNN/G4 và Transformer (G5 — tương tự attention ở góc nào đó).

**Chỉ số không thể hiện:** hiệu năng tối ưu trên dữ liệu thật; chưa phủ augmentation/transfer (G4.5) hay detection/segmentation (G4.7). Đây là nền cơ chế.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Kernel là người chỉ định." — Không; chúng *tự học* từ dữ liệu (khởi tạo ngẫu nhiên, backprop chỉnh). Con người chọn kích thước/số lượng, không nội dung.
- **Hiểu lầm 2:** "Conv giữ 'mọi thông tin'." — Không; nó *trích đặc trưng cục bộ*, có thể bỏ một số chi tiết (mất thông tin là chuyện bình thường và có chủ đích trong CV để khái quát).
- **Hiểu lầm 3:** "CNN 'nhìn' như mắt người." — Không; nó quét kernel và học mẫu pixel; khác hoàn toàn cơ chế thị giác sinh học. Đừng nhân hóa.
- **Giới hạn:** conv cục bộ; bối cảnh toàn ảnh cần nhiều tầng hoặc attention (G5). Kiến trúc deep (ResNet) và transfer (G4.5) sẽ mở rộng.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phép tích chập làm gì; kernel và feature map là gì?
2. Padding và stride ảnh hưởng kích thước output thế nào?
3. Vì sao CNN ít tham số hơn MLP trên ảnh?

### Luyện tập (sửa đổi / mở rộng)
4. Tính out cho ảnh 7×7, kernel 3, pad 0, stride 1; và pad 0/stride 2.
5. Vẽ feature map của conv đầu (truy cập activation) — mô tả bạn thấy gì.
6. Sửa CNN: đổi kernel 3→5 (padding 2) — kích thước có giữ nguyên không? Chạy và xác nhận.

### Thử thách (thiết kế / liên hệ)
7. Trong FL (G6), khi ảnh của các client có phân phối khác nhau (non-IID), các kernel conv của từng client có khả năng "trôi" khác nhau — giải thích và liên hệ client drift / FedAvg.
8. Trong Continual Learning (G7), vì sao đặc trưng conv tầng thấp (edge/pattern chung) thường "giữ được" hơn tầng cao khi học task mới (gợi ý: tầng thấp ít task-specific hơn)? Nối với transfer/reg (G5) và rehearsal (G7).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Kernel quét ảnh, nhân+cộng cục bộ, ra feature map phát hiện mẫu (cạnh...). Kernel = bộ lọc nhỏ tự học.
2. padding thêm biên (giữ kích thước), stride bước nhảy (giảm kích thước). `(H+2p−k)/s + 1`.
3. Kernel chia sẻ (share) qua mọi vị trí → vài chục trọng số (3×3=9) thay vì mỗi pixel nối mọi neuron (đặc trưng đầy đủ).
4. `(7−3)/1+1 = 5`; `(7−3)/2+1 = 3`.
5. Bạn thấy kernel phát hiện cạnh/đốm — bản đồ sáng tối theo mẫu (sẽ thấy "bản đồ hoạt hóa").
6. kernel 5, pad 2, stride 1 → `(7+4−5)/1+1=7` — giữ nguyên ⇒ muốn tăng receptive field mà không nhờ size hãy tăng kernel (và pad tương ứng).
7. Client dữ liệu khác → kernel hội tụ khác, "trôi" theo phân phối client; trung bình kernel trong FedAvg có thể yếu cho một số client. Vì sao ta về shared conv như "liên hệ". G6.
8. Tầng thấp (conv thấp) học đặc trưng chung (cạnh, texture) hữu ích nhiều task → khi học task mới ít bị "đổi" → giữ được hơn; tầng cao (classification) task-specific hơn → hay quên. Vì vậy CL/transfer thường tái sử dụng backbone thấp và fine-tune tầng cao. G5/G7.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Ảnh = tensor (C, H, W); CNN **giữ cấu trúc không gian**, khác MLP dẹt.
2. **Convolution** = kernel quét, nhân+cộng cục bộ, trích đặc trưng; kernel **tự học**.
3. **Padding** giữ/biên, **stride** bước quét (giảm) — điều chỉnh kích thước output.
4. **Pooling** tổng hợp/giảm kích thước → ít tham số, ổn định.
5. CNN ít tham số nhờ **khi chia sẻ kernel**+pool; nền của mọi kiến trúc CV và liên hệ FL/CL non-IID.

**Tự kiểm tra:**
- Phép +ih chập làm gì; kernel tự học hay chỉ định?
- Viết công thức out theo H,padding,stride,kernel.
- Vì sao CNN ít tham số hơn MLP?
- Khi nào dùng padding nhiều?
- Liên hệ kernel "trôi" giữa client trong FL?

---

## 16. Đọc sâu bằng trực giác — convolution là con dấu trượt, pooling là thu nhỏ bản đồ

Muốn tìm họa tiết trên tấm vải dài, ta không cần một bảng tra khổng lồ cho từng vị trí. Chỉ cần một con dấu nhỏ trượt khắp tấm vải và ghi lại chỗ nào khớp. Kernel là con dấu dùng chung; pooling là bước lùi lại để nhìn bức tranh lớn hơn.

| Phép | Làm gì | Tham số học |
|---|---|---|
| Convolution | Trượt kernel, tính tổng tích tại từng vị trí | `(C_in·K·K+1)·C_out` |
| Pooling | Gộp một vùng thành max/trung bình | Không có |
| Fully connected | Nối mọi vị trí với mọi nơ-ron | Rất lớn |

**Đọc thành lời:** đầu ra không gian là `H_out=⌊(H+2P−K)/S⌋+1`, với `H` chiều cao vào, `P` padding mỗi phía, `K` kích thước kernel, `S` stride. Cùng một kernel dùng lại ở mọi vị trí, nên số tham số không phụ thuộc kích thước ảnh. Điều dễ đọc sai là nghĩ convolution "nhìn toàn ảnh"; mỗi lần nó chỉ thấy một cửa sổ `K×K`.

**Tính tay:** ảnh `32×32`, kernel `3×3`, padding `1`, stride `1`: `H_out=(32+2−3)/1+1=32`, giữ nguyên kích thước. Chuyển `3` kênh thành `16` kênh với kernel `3×3` cần `(3×3×3+1)×16=448` tham số. Nếu duỗi ảnh thành vector `3072` rồi nối vào 1000 nơ-ron, riêng lớp đó đã có hơn 3 triệu tham số.

**Phản ví dụ:** thấy mạng CNN ít tham số hơn MLP rồi kết luận nó luôn tốt hơn. Nếu bài toán cần so sánh toàn cục tức thì giữa hai pixel xa nhau, kernel nhỏ phải xếp nhiều lớp mới "nhìn" tới; MLP nối trực tiếp có thể dễ hơn nhưng tốn tham số. Ngược lại, dùng kernel `1×1` chỉ trộn kênh, không trộn không gian, không thể thay convolution `3×3` khi cần họa tiết cục bộ.

**Giới hạn:** convolution giả định họa tiết hữu ích ở mọi vị trí (dịch chuyển tương đương), nhưng không bất biến hoàn toàn với xoay, co giãn hay thay đổi ánh sáng. Padding và stride thay đổi kích thước, có thể làm mất thông tin ở biên. Và trong FL, kernel học từ các client có thể "trôi" khác nhau nếu dữ liệu khác nhau mạnh.

:::interactive conv
:::

:::quiz
Lớp convolution nhận `3` kênh, xuất `16` kênh, kernel `3×3`, có bias. Số tham số là bao nhiêu?
A. 448
B. 432
C. 160
Đáp án: A
Giải thích: mỗi kênh ra có `3×3×3=27` trọng số cộng `1` bias, nhân `16` kênh ra: `(27+1)×16=448`. Chọn B là quên bias; chọn C là bỏ hệ số kernel.
:::

**Tự thử thêm:** lớp tiếp theo nhận `16` kênh, xuất `32` kênh, kernel `3×3`, có bias. Tính số tham số. Sau đó tính đầu ra không gian của ảnh `32×32` với kernel `3×3`, padding `0`, stride `1`.

:::goi-y
Dùng `(C_in·K·K+1)·C_out` và `H_out=(H+2P−K)/S+1`.
:::

:::loi-giai
Tham số: `(16×3×3+1)×32=145×32=4.640`. Đầu ra: `(32+0−3)/1+1=30`, tức `30×30` cho mỗi kênh.
:::