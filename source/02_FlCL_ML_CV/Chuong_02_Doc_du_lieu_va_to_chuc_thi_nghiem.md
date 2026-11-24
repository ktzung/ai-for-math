# Chương 1.2 — Đọc dữ liệu & tổ chức thí nghiệm (Giai đoạn 1)

> **Câu hỏi trọng tâm:** *Ảnh nằm ở đâu trong máy, và tôi tổ chức một thí nghiệm như thế nào để sau này có thể tái lập?*

---

## 1. Vị trí trong lộ trình

Ở Chương 1.1 bạn đã cài môi trường và định vị điểm xuất phát. Chương này là bước "làm quen dữ liệu ảnh + thiết lập thói quen tổ chức thí nghiệm" — kỹ năng chỉ đạo hầu hết các chương sau: G2–G4 cần nạp dữ liệu ảnh; G6–G8 mô phỏng client và chuỗi nhiệm vụ đều xoay quanh việc chia/tổ chức dữ liệu.

Nó **chuẩn bị** cho Chương 1.3 (NumPy cho ML) và 1.4 (PyTorch cơ bản), và đặc biệt nhấn mạnh **cấu trúc thư mục thí nghiệm** — thứ bạn sẽ dùng mãi về sau trong G8/G9 khi báo cáo thí nghiệm phải tái lập được.

---

## 2. Kiến thức cần dùng

- Python cơ bản (biến, hàm, vòng lặp) — nếu thiếu, ôn G0.1.
- Cài môi trường đúng (Chương 1.1).
- **Toán:** gần như không — chỉ cần đọc "shape" (kích thước mảng), khái niệm pixel là một con số 0–255.

**Ôn nhanh:** *ảnh trong máy tính* về cơ bản là **một bảng số** (ma trận) — mỗi ô là một pixel. Số 0 = đen, 255 = trắng (ảnh xám). Ảnh màu có 3 kênh (đỏ, lục, lam) → 3 bảng số chồng nhau. Nếu quên, đừng lo, chương này minh họa đầy đủ.

---

## 3. Câu chuyện mở đầu

Tiếp nối Lan ở Chương 1.1: sau khi cài xong môi trường, Lan tải một bộ dữ liệu ảnh công khai (như CIFAR-10 — 60.000 ảnh nhỏ, 10 lớp như "mèo", "thuyền", "xe"). Cô mở thư mục ra: một loạt file `.png` không tên gì rõ ràng, trộn lẫn. Cô tự hỏi:

- "Làm sao nạp hàng chục nghìn ảnh này vào máy một cách có trật tự?"
- "Làm sao biết ảnh này là 'mèo' để có **nhãn** (label) đúng?"
- "Chia thế nào để sau này nói câu 'thí nghiệm của tôi chạy được trên máy khác'?"

Vấn đề của Lan không phải là "thiếu model thông minh" — chỉ là **dữ liệu chưa được tổ chức đúng**. Hầu hết các dự án ML thất bại không phải vì thuật toán khó, mà vì *dữ liệu và thư mục lộn xộn*. Chương này giải quyết chính điều đó.

---

## 4. Câu hỏi trọng tâm

**Làm cách nào để nạp dữ liệu ảnh có cấu trúc, nhìn thấy chúng, và tổ chức một thí nghiệm sao cho sau này chạy lại được?**

---

## 5. Trực giác

Hãy nghĩ về một chiếc **thư viện**. Sách không chất đống vô tổ chức — chúng được xếp theo kệ, theo thể loại, mỗi cuốn có nhãn. Nếu bạn cần "hết sách thể loại X", bạn đi thẳng đến kệ X.

Cho máy học, ta làm y hệt: **sắp ảnh vào các thư mục, mỗi thư mục = một lớp/label.** Đó là cách tổ chức dữ liệu đơn giản và minh bạch nhất:

```
data/
  train/
    cat/
      0001.png
      0002.png
    dog/
      0051.png
  test/
    cat/
      ...
    dog/
      ...
```

Khi cần nạp ảnh `cat`, máy chỉ việc đọc hết thư mục `train/cat`. Nhãn đến từ *tên thư mục* — không cần file metadata phức tạp.

**Phép so sánh "thư viện = cấu trúc thư mục":** giúp nhớ rằng tổ chức tốt làm cho việc tìm kiếm và tái lập dễ dàng. **Giới hạn:** thư viện xếp sách theo chủ đề cứng nhắc; trong ML đôi khi dữ liệu lộn xộn không nằm gọn trong cây thư mục (ảnh từ nhiều nguồn), lúc đó cần metadata/CSV. Đây là lý do ta học cả hai cách.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** một tập ảnh công khai (ta dùng CIFAR-10 hoặc MNIST để chạy nhanh trên CPU).
- **Mô hình:** chưa có (chương này chỉ *nạp và nhìn* dữ liệu, chưa huấn luyện).
- **Client/Server:** chưa — nhưng **chia train/test** ngay bây giờ chính là nền của việc chia client sau này (G6). Tập `train` = "dữ liệu để học", tập `test` = "dữ liệu để kiểm chứng chưa từng thấy".
- **Điều kiện & giả định:** có môi trường Python + torch + torchvision; Internet để tải dữ liệu lần đầu (torchvision tải tự động).
- **Mục tiêu tối ưu:** nạp đúng, xem được ảnh, và có cấu trúc thư mục rõ ràng để tái lập.
- **Thông tin giữ lại:** cấu trúc thư mục dự án + cách nạp dữ liệu — sẽ tái sử dụng mãi.

**Thuật toán tổng quan:**

```
1. Tải dữ liệu (torchvision tự lấy CIFAR-10/MNIST) → nạp bộ train.
2. Xem shape (số ảnh × chiều cao × chiều rộng × kênh).
3. Vẽ một lưới ảnh mẫu (matplotlib) để "thấy" dữ liệu.
4. Thiết lập cấu trúc thư mục thí nghiệm (script + config + kết quả tách biệt).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Nạp bộ dữ liệu (torchvision tự tải).**

```python
import torch
from torchvision import datasets, transforms

transform = transforms.ToTensor()   # từ ảnh (0-255) sang tensor (0-1)
train = datasets.CIFAR10(root="./data", train=True, download=True, transform=transform)
test  = datasets.CIFAR10(root="./data", train=False, download=True, transform=transform)
```

- `root` — thư mục lưu dữ liệu (nếu chưa có, download=True sẽ tải về).
- `train=True/False` — lấy tập train hay test.
- `transform` — cách biến đổi ảnh trước khi dùng; `ToTensor()` đổi giá trị pixel từ số nguyên 0–255 thành số thập phân 0–1 và xếp thành tensor.

*(Cách chạy: trong môi trường ảo có torchvision, Python sẽ tải ~170MB cho CIFAR-10 lần đầu.)*

**Bước 2 — Kiểm tra shape.**

```python
print(train.data.shape)   # (50000, 32, 32, 3)
```

Đọc: 50.000 ảnh, mỗi ảnh 32×32 pixel, 3 kênh màu. Đây là "dữ liệu = mảng số" bạn sẽ thấy đi thấy lại.

**Bước 3 — Vẽ lưới ảnh mẫu .**

```python
import matplotlib.pyplot as plt
import numpy as np

classes = ["plane","car","bird","cat","deer","dog","frog","horse","ship","truck"]
fig, axes = plt.subplots(2, 5, figsize=(10, 4))
for i, ax in enumerate(axes.flat):
    img = train[i][0].permute(1, 2, 0).numpy()   # tensor → ảnh hiển thị
    ax.imshow(img)
    ax.set_title(classes[train[i][1]])
    ax.axis("off")
plt.show()
```

- `train[i][0]` — ảnh thứ i (tensor); `train[i][1]` — nhãn (số 0–9).
- `.permute(1,2,0)` — đổi thứ tự kênh từ (kênh, cao, rộng) về (cao, rộng, kênh) để matplotlib vẽ.
- **Kết quả dự kiến:** một lưới 10 ảnh nhỏ 32×32, hơi mờ nhưng nhìn rõ mèo/xe/thuyền... kèm nhãn tiếng Anh.

**Bước 4 — Thiết lập cấu trúc thư mục thí nghiệm.**

```
my_experiment/
  data/          <- dữ liệu (đã tải ở Bước 1; không đưa vào git)
  scripts/       <- mã (train.py, eval.py, ...)
  config.py      <- cấu hình thí nghiệm (seed, epochs,...)
  results/       <- đầu ra (số liệu, biểu đồ, checkpoint)
  README.md      <- ghi cách chạy lại
```

Quy tắc vàng: **mã, cấu hình, dữ liệu, kết quả — mỗi thứ một chỗ.** Điều này giúp bạn (và người khác) tái lập được kết quả (G9.6). Mỗi lần chạy, bạn lưu `config.py` + `results/` vào từng lần thử để so sánh.

**Lỗi thường gặp:**
- Quên `download=True` ở lần đầu → lỗi "kernel died" / "no data found". Cách đúng: bật download lần đầu.
- `imshow` báo lỗi shape → chưa `.permute(1,2,0)` cho ảnh màu.
- In shape ra `(50000,32,32,3)` nhưng quên rằng thứ tự là (sốảnh, cao, rộng, kênh) — hay nhầm thứ tự.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** bạn chỉ cần 100 ảnh để thử nhanh (đề phòng tải 50.000 ảnh lâu).

**Lấy 100 mẫu đầu:**

```python
from torch.utils.data import Subset
small = Subset(train, range(100))
print(len(small))   # 100
```

- `Subset` — lấy ra một phần con của tập dữ liệu.
- `len(small)` = 100. Đây là cách kiểm soát **quy mô thí nghiệm** — kỹ năng then chốt khi tài nguyên hạn chế.

**Tính tay để kiểm chứng:** mỗi ảnh CIFAR-10 = 32×32×3 = **3072** số. 100 ảnh → 307.200 số. Nếu bạn giữ cả 50.000 ảnh làm tensor float32: 50.000×3072×4 byte ≈ 614MB **đã tính sẵn trong RAM** — khá tốn. Đây là *lý do* ta hay dùng subset nhỏ khi thử nghiệm. (Kiểm tra: 50k×3072 = 153.600.000 số × 4 byte = 614.400.000 byte ≈ 614 MB ✔.)

**Giải thích ký hiệu/code:** `Subset(train, range(100))` — "dữ liệu nguồn là train, lấy các chỉ số từ 0 đến 99". `len` — số phần tử.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ đọc từng file ảnh bằng `PIL` + tự tay gán nhãn, không cần framework.

| Phương diện | Đọc tay từng file | Dùng torchvision Dataset |
|---|---|---|
| Công sức nạp | tự viết đọc ảnh, tự gán nhãn | một dòng, nhãn tự động |
| Chuẩn bị tensor / transform | tự làm | có sẵn |
| Rủi ro sai | cao (nhầm nhãn, sai thứ tự) | thấp (chuẩn hóa) |
| Đánh đổi | không cần cài thêm | phụ thuộc version torch/torchvision |

**Cải thiện:** ít sai, nhanh, chuẩn hóa. **Đánh đổi:** phải tin vào cách `torchvision` đặt thứ tự dữ liệu (là chuẩn công nghiệp nên chấp nhận được); và cần biết bản torchvision (đã ghi ở Chương 1.1) vì API có thể đổi nhỏ giữa phiên bản.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát trực tiếp rằng "ảnh chỉ là một mảng số" và môi trường nạp dữ liệu hoạt động.

Chạy Bước 1–3: tải CIFAR-10, in shape, vẽ lưới ảnh. Ghi nhận:
1. `train.data.shape` in ra bao nhiêu?
2. Giá trị pixel thô vùng tối/vùng sáng trong một ảnh là khoảng bao nhiêu (nhìn qua mảng)?
3. `transform.ToTensor()` thay đổi giá trị pixel từ 0–255 sang 0–1 hay không? *(đo: in `train[0][0].min()` và `.max()`)*

**Ích lợi:** trước khi xây bất kỳ model nào, bạn biết chắc dữ liệu hình dạng ra sao, nằm trong khoảng giá trị nào. Rất nhiều bug ML bắt nguồn từ "dữ liệu nằm ở khoảng giá trị bất ngờ".

---

## 11. Thực hành lập trình

**Môi trường:** venv + numpy + matplotlib + torch + torchvision đã cài (Chương 1.1).

**Cấu trúc:** tạo thư mục `inputs/` rồi file `demo_dataset.py`:

```python
import torch
from torchvision import datasets, transforms
import matplotlib.pyplot as plt

transform = transforms.ToTensor()
train = datasets.CIFAR10(root="./data", train=True, download=True, transform=transform)

print("Shape:", train.data.shape)
print("Pixel min/max sau ToTensor:", float(train[0][0].min()), float(train[0][0].max()))

classes = ["plane","car","bird","cat","deer","dog","frog","horse","ship","truck"]
fig, axes = plt.subplots(1, 4, figsize=(8, 3))
for i, ax in enumerate(axes.flat):
    img = train[i][0].permute(1, 2, 0).numpy()
    ax.imshow(img); ax.set_title(classes[train[i][1]]); ax.axis("off")
plt.show()
```

**Cách chạy:** `python demo_dataset.py`.

**Kết quả dự kiến:** in `Shape: (50000, 32, 32, 3)`, `Pixel min/max ... 0.0 0.99...` (gần 1 do ToTensor), và cửa sổ hiện 4 ảnh.

**Lỗi thường gặp:**
- Không có Internet lần đầu → tải thất bại. Cách đúng: kiểm tra kết nối hoặc dùng dataset đã tải sẵn.
- `ModuleNotFoundError: matplotlib` → `pip install matplotlib`.
- Toàn ảnh đen → pixel toàn 0 (lỗi transform) hoặc `imshow` thiếu kênh.

**Chú thích trung thực:** mã này chạy được trên máy Python thông thường, nhưng chưa được kiểm thử trên từng hệ điều hành / từng phiên bản torchvision. Nếu API `torchvision` thay đổi cú pháp (hiếm), bạn đối chiếu phiên bản đã ghi ở Chương 1.1.

---

## 12. Đánh giá

**Chỉ số:** 3 kiểm chứng — (1) `shape` in đúng kích thước mong đợi `(N, 32, 32, 3)`; (2) giá trị pixel nằm trong [0,1] sau `ToTensor`; (3) vẽ được lưới ảnh với nhãn đúng.

**Vì sao chọn:** "nạp đúng dữ liệu" khó đo bằng một con số duy nhất, nên ta dùng 3 kiểm chứng về *hình dạng* (cấu trúc), *khoảng giá trị* (phạm vi số), và *hiển thị* (con người thấy được). Cả ba đều nói lên "dữ liệu đã sẵn sàng theo đúng định dạng mong đợi".

**Chỉ số này không thể hiện:** chương này không đo được *chất lượng ảnh* hay *độ cân bằng lớp* — đó là việc của các chương sau (G4.6 mất cân bằng lớp, G6.5 non-IID). Chỉ số ở đây chỉ xác nhận "nạp đúng", chứ chưa xác nhận "dữ liệu phù hợp cho bài toán".

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Nạp 50.000 ảnh về máy là cần thiết để bắt đầu." → Không; bạn có thể bắt đầu với `Subset(..., range(100))` và chỉ tải bản `download=True` một lần. Quy mô nhỏ là bạn thân của người mới.
- **Hiểu lầm 2:** "Nhãn nằm trong ảnh." → Sai; nhãn là *siêu dữ liệu tách rời* (tên thư mục hoặc file metadata), không nằm trong pixel. Đừng sửa ảnh để nhét nhãn.
- **Hiểu lầm 3:** "Shape `(50000,32,32,3)` nghĩa là 3 khác gì?" → Đó là 3 kênh màu (R,G,B), không phải 3 chiều không gian. Thứ tự trong tensor có thể là (kênh, cao, rộng) — CIFAR-10 lưu ở cuối tensor là (cao, rộng, kênh); cẩn thận khi viết code.
- **Giới hạn của chương:** chưa xử lý ảnh lớn, ảnh không đồng nhất (thư viện thư mục 1 label cho ảnh nhiều kích thước). Với ảnh thật lộn xộn (từ điện thoại, camera), bạn cần thêm bước resize/rescale — đề cập ở G4.1.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Giải thích bằng lời: vì sao `transform=transforms.ToTensor()` thay đổi pixel từ 0–255 thành 0–1 lại hữu ích cho mô hình học? (Gợi ý: giá trị khoảng cách đều, dễ tính đạo hàm.)
2. Đọc sơ đồ cây thư mục ở mục 5: nếu bạn thêm ảnh "frog" cho test, bạn đặt ở đâu, tên thư mục là gì?

### Luyện tập (sửa đổi / mở rộng)
3. Đổi script để lấy 10 ảnh đầu thay vì 100: sửa `range(...)` như thế nào? Kiểm chứng bằng `len(...)`.
4. In số lượng nhãn khác nhau có trong `train.targets`. (Tính tay xem có bao nhiêu lớp và có cân bằng không trong 100 mẫu đầu?)
5. Tạo thư mục `my_experiment/` theo cấu trúc mục 7 và di chuyển `demo_dataset.py` vào `scripts/`.

### Thử thách (thiết kế / liên hệ)
6. Bạn được giao chuẩn bị dữ liệu cho một thí nghiệm FL (G6) với **3 client**, mỗi client chỉ có ảnh thuộc về một vài lớp (non-IID). Dùng ý tưởng `Subset`, phác thảo (bằng lời/code-pseudocode) cách bạn gán các chỉ số của `train` vào từng client sao cho giữa các client lớp ảnh khác nhau. *(Không cần chạy; chỉ thiết kế.)*
7. Giải thích: vì sao việc "chia train/test" ngay từ đầu lại là nền tảng cho việc "đánh giá khả năng tổng quát" quan trọng trong ML (nối tới G2.3)? Viết vài dòng.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Đưa dữ liệu về khoảng nhỏ, ổn định [0,1] giúp phép đạo hàm/backprop ổn định và tránh số quá lớn. (Đây là chuẩn tiền xử lý — sẽ học rõ ở G3, G4.)
2. Đặt vào `data/test/frog/` — tên thư mục = tên lớp.
3. `range(10)` → `len(small) == 10`.
4. `len(set(train.targets))` → 10 lớp (cho bộ đầy). Với 100 mẫu đầu, đếm tay số lần mỗi nhãn xuất hiện để xem có cân bằng không (thường khá đều trong CIFAR-10; nhưng có thể lệch ở subset nhỏ — chính là cái bẫy non-IID mà G6.5 nói tới).
5. Tạo thư mục, chạy `python scripts/demo_dataset.py` với `root` tham chiếu đúng `./data`.
6. Gợi ý: chia index `[0..49999]` thành 3 phần, mỗi phần giữ lại chỉ các ảnh thuộc một nhóm lớp (VD client0: cat+dog, client1: car+truck, client2: bird+frog). Dùng `Subset(train, chosen_index_list)`. Đảm bảo mỗi client không thấy hết 10 lớp → đúng tinh thần non-IID. *(Sẽ trở thành thực hành đầy đủ ở G6.5.)*
7. Vì ta phải đo mô hình trên dữ liệu *chưa từng thấy* để biết nó tổng quát hay chỉ "thuộc lòng" tập train (overfitting). Tách test riêng từ đầu đảm bảo số liệu đánh giá trung thực. Tham chiếu G2.3.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Ảnh số về cơ bản là một **mảng số** (pixel 0–255 / 0–1); torchvision giúp nạp và chuyển đổi dễ dàng.
2. Dữ liệu nên được **tổ chức theo cây thư mục**, mỗi thư mục = một lớp; nhãn có thể lấy từ tên thư mục.
3. **Tách train/test** ngay từ đầu là nền của đánh giá trung thực; `Subset` giúp kiểm soát quy mô thí nghiệm nhỏ.
4. **Cấu trúc thư mục thí nghiệm** (data/scripts/config/results/README) là thói quen để tái lập được.
5. Trước khi xây mô hình, luôn **kiểm tra shape và khoảng giá trị** của dữ liệu — hầu hết bug ML xuất phát từ đây.

**Tự kiểm tra:**
- `train.data.shape` là gì và từng con số nghĩa gì?
- Làm sao để có nhãn từ cấu trúc thư mục?
- Vì sao `ToTensor()` quan trọng?
- Bạn sẽ chia train/test thế nào, và `Subset` dùng để làm gì?
- Trước khi viết model, bạn cần kiểm tra điều gì về dữ liệu?

---

## 16. Đọc sâu bằng trực giác — ảnh là hàng, nhãn là phiếu dán

Một kho hàng có hai thứ dễ lẫn: món hàng thật và tấm phiếu ghi loại hàng. Khi kiểm kê, bạn phải đếm cả số món lẫn số phiếu, và biết phiếu có thể bị dán sai. Với dữ liệu ảnh, pixel là món hàng còn nhãn là phiếu; bộ nạp dữ liệu chỉ đọc cấu trúc thư mục, không tự kiểm tra phiếu có đúng không.

| Thứ cần đếm | Công thức | Điều dễ nhầm |
|---|---|---|
| Số mẫu | `N = N_train + N_test` | Chỉ đếm một tập rồi tưởng là toàn bộ |
| Số giá trị pixel | `N × H × W × C` | Quên nhân số kênh màu |
| Bộ nhớ tensor | `số giá trị × byte mỗi giá trị` | Nhầm dung lượng file nén với RAM |

**Đọc thành lời:** `bytes = N × H × W × C × b`, trong đó `H,W` là chiều cao/rộng, `C` là số kênh, `b` là số byte mỗi giá trị. Với ảnh màu CIFAR-10, `H=W=32`, `C=3`; `b=1` nếu lưu uint8 và `b=4` nếu chuyển sang float32. Điều dễ đọc sai là lấy dung lượng file PNG/JPEG làm bộ nhớ tensor: file nén nhỏ hơn nhiều so với mảng số đã giải nén trong RAM.

**Tính tay:** 100 ảnh CIFAR-10 có `100×32×32×3=307.200` giá trị pixel. Nếu là float32, cần `307.200×4=1.228.800` byte, tức khoảng 1,23 MB. Nếu giữ cả 50.000 ảnh float32, cần `50.000×3.072×4=614.400.000` byte, tức 614,4 MB; cùng bộ ảnh ở uint8 chỉ cần 153,6 MB.

**Phản ví dụ:** thấy 100 ảnh float32 chiếm khoảng 1,23 MB rồi suy 10.000 ảnh cũng "khoảng 12,3 MB" là đúng, nhưng nếu quên đổi uint8 sang float32 thì sẽ báo thiếu 4 lần. Ngược lại, lấy kích thước một file JPEG nhân với số ảnh cũng sai vì mỗi ảnh nén khác nhau và tensor sau giải nén mới là thứ nằm trong RAM.

**Giới hạn:** công thức trên chỉ tính pixel dense, chưa gồm nhãn, metadata, bộ đệm của `DataLoader` và các bản sao do transform/augmentation. Nhãn lấy từ tên thư mục cũng có thể sai nếu thư mục bị đặt nhầm; cần kiểm tra mẫu và nhãn trước khi huấn luyện.

:::interactive tensor
:::

:::quiz
10.000 ảnh CIFAR-10 (32×32×3) lưu float32, bỏ qua nhãn và metadata, chiếm bao nhiêu MB theo cách tính thập phân?
A. 30,72 MB
B. 122,88 MB
C. 491,52 MB
Đáp án: B
Giải thích: Mỗi ảnh có 3.072 giá trị; float32 dùng 4 byte, nên mỗi ảnh 12.288 byte. Nhân 10.000 được 122.880.000 byte, tức 122,88 MB. 30,72 MB là kết quả nếu quên nhân 4.
:::

**Tự thử thêm:** 1.000 ảnh CIFAR-10 lưu uint8 và float32 lần lượt chiếm bao nhiêu MB? Sau đó cho biết vì sao `Subset` 100 ảnh vẫn có thể tốn thêm bộ nhớ khi transform tạo bản sao.

:::goi-y
Mỗi ảnh vẫn có 3.072 giá trị; chỉ đổi số byte mỗi giá trị giữa 1 và 4. Transform có thể tạo tensor mới cho từng mẫu trong batch.
:::

:::loi-giai
uint8: `1.000×3.072×1=3.072.000` byte ≈ 3,07 MB. float32: `1.000×3.072×4=12.288.000` byte ≈ 12,29 MB. `Subset` chỉ giới hạn chỉ số, không tự nén dữ liệu; transform và batch vẫn cấp phát bộ nhớ cho tensor mới.
:::