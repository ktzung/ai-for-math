# Chương 1.4 — PyTorch cơ bản (Giai đoạn 1)

> **Câu hỏi trọng tâm:** *Tensor là gì, và làm sao viết một "vòng huấn luyện" PyTorch đầu tiên — dự đoán, tính lỗi, lan truyền ngược, cập nhật?*

---

## 1. Vị trí trong lộ trình

Ta đã học NumPy (1.3 — mảng số) và đọc dữ liệu (1.2). **PyTorch** là framework học sâu mà cả lộ trình này dùng: tensor (giống NumPy nhưng có **tự động đạo hàm**), và bộ công cụ Dataset/Dataloader + Optimizer. Giai đoạn 2–3 (ML, học sâu) sẽ xây trên nền này, và G6–G8 (FL/CL) vận hành thêm vòng lặp.

Chương này **nối** từ NumPy và **chuẩn bị** cho G2 (học máy) và G3 (học sâu). Kỹ năng cốt lõi: **viết được một vòng huấn luyện từ đầu** (mà không cần `fit()` magic), để hiểu luồng dữ liệu thay vì chỉ gọi API.

---

## 2. Kiến thức cần dùng

- NumPy cơ bản (1.3) — tensor có cú pháp gần giống.
- Math: đạo hàm/gradient (Chương 4 sách toán) — PyTorch *tự* tính bằng autograd, bạn chỉ cần hiểu ý nghĩa.
- Python cơ bản.

**Ôn nhanh:** "lan truyền ngược (backprop)" = tính đạo hàm của loss theo từng trọng số, bằng quy tắc dây chuyền (Chương 4 sách toán). PyTorch làm việc này tự động qua cơ chế **autograd**; bạn chỉ cần 3 lệnh: xây mô hình, gọi loss, gọi `.backward()` + optimizer step.

---

## 3. Câu chuyện mở đầu

Lan muốn phân loại ảnh mèo/chó nhưng muốn *hiểu được* mình đang làm gì — cô sợ trở thành người "chỉ bấm nút". Cô tìm cách đào vào: "một mạng nơ-ron thực sự huấn luyện ra sao?" Cô thấy ai cũng viết nhiều dòng `torch` và nghĩ phức tạp.

Sự thật: một vòng huấn luyện PyTorch cơ bản chỉ ~10 dòng — với 5 bước lặp đi lặp lại: **dự đoán → tính lỗi → backward → optimizer step → zero grad**. Hiểu 5 bước này là hiểu "trái tim" của mọi thí nghiệm học sâu về sau. Cô cũng cần phân biệt `torch.Tensor` (mảng tự đạo hàm) với `np.ndarray` (khi cần qua lại giữa hai thế giới).

---

## 4. Câu hỏi trọng tâm

**Tensor trong PyTorch khác gì NumPy, và vòng huấn luyện 5 bước gồm những gì?**

---

## 5. Trực giác

**Tensor ≈ "NumPy có trang bị chân đạo hàm tự động".** Một `torch.Tensor` với `requires_grad=True` theo dõi phép tính, để sau đó gọi `.backward()` là có ngay **gradient** (đạo hàm) theo mọi biến — không cần tự viết công thức đạo hàm. Đây chính là "máy tính đạo hàm tự động" cho nghiệp vụ gradient descent.

**Vòng huấn luyện như "rèn dao mỗi ngày":** mỗi vòng (epoch):
1. **Đẩy dữ liệu qua mô hình** → ra dự đoán (forward).
2. **Tính lỗi** (loss) so với nhãn đúng.
3. **`.backward()`** → đo độ dốc (gradient) của loss theo từng trọng số.
4. **optimizer.step()** → chỉnh trọng số theo hướng giảm lỗi (gradient descent, Chương 8 sách toán).
5. **optimizer.zero_grad()`** → xóa gradient cũ trước vòng mới (đừng cộng dồn sai).

Lặp lại. Đây là 5 bước bạn sẽ thấy ở khắp nơi.

**Phép so sánh "rèn dao":** mỗi lần lặp một chút chỉnh sửa hướng đúng. **Giới hạn:** dao rèn theo mẫu cố định; mô hình có thể overfit (nhớ quá) — cần test/val (G2, Chương 8 sách toán). "Chỉnh mỗi ngày" cũng gợi ý tiến bộ đơn điệu — thực tế loss thị trường dao động; quan trọng là xu hướng.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** ví dụ nhỏ tự tạo — 1 đặc trưng x, nhãn y = 2x+1 (khớp Chương 2 sách toán). Đủ nhỏ để tính tay kiểm chứng.
- **Mô hình:** một tầng tuyến tính `y = w·x + b` (một neuron). Chính là "mô hình tuyến tính" ta đã học.
- **Optimizer:** Stochastic Gradient Descent (SGD) — gradient descent có learning rate.
- **Mục tiêu:** hiểu vòng lặp, không phải độ chính xác cao.

**Thuật toán:**

```
1. Torch tensor từ dữ liệu (float).
2. nn.Linear(1,1) tạo tầng tuyến tính (chứa w, b).
3. Chọn loss = MSE, optimizer = SGD(model.parameters(), lr=0.05).
4. Lặp epoch:
   a. y_pred = model(x)
   b. loss = MSE(y_pred, y)
   c. loss.backward()
   d. optimizer.step()
   e. optimizer.zero_grad()
5. In loss mỗi vài epoch → giảm dần.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Tạo dữ liệu tensor.**

```python
import torch
x = torch.tensor([[1.0], [2.0], [3.0], [4.0]])
y = 2 * x + 1        # quy luật ẩn để học
print(x.shape, y.shape)   # (4,1) (4,1)
```

Tensor ảnh (2 chiều mỗi mẫu) vì `Linear` mong đầu vào `(N, features)`.

**Bước 2 — Dựng mô hình.**

```python
import torch.nn as nn
model = nn.Linear(1, 1)     # đầu vào 1 chiều → đầu ra 1 chiều
print(list(model.parameters()))  # w (trọng số) và b (bias) khởi tạo
```

`nn.Linear(1,1)` chứa 2 tham số: `w` (weight) và `b` (bias) — đúng "núm vặn" cần học.

**Bước 3 — Hàm mất mát & optimizer.**

```python
loss_fn = nn.MSELoss()          # lỗi bình phương trung bình
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)  # gradient descent
```

`optimizer.step()` chỉnh theo gradient, `lr` là learning rate (Chương 8 sách toán).

**Bước 4 — Vòng huấn luyện.**

```python
for epoch in range(200):
    y_pred = model(x)              # 1. forward
    loss = loss_fn(y_pred, y)      # 2. loss
    optimizer.zero_grad()          # xóa gradient cũ
    loss.backward()                # 3. tính gradient
    optimizer.step()               # 4. cập nhật w,b
    if epoch % 40 == 0:
        print(epoch, round(loss.item(), 4))
```

`loss.item()` — lấy con số (float) ra để in. Quan sát loss giảm dần.

**Bước 5 — Kiểm tra kết quả.** Sau khi xong, `print(model.weight, model.bias)` — `w≈2`, `b≈1` (đúng quy luật y=2x+1).

**Lỗi thường gặp:**
- Thiếu `.float()` khi dữ liệu int → model Neo expects float; đổi dtype.
- Quên `zero_grad()` → gradient cộng dồn sai giữa các vòng → loss quái lạ.
- `loss.item()` hoặc so sánh trên tensor có `requires_grad` → dùng `.item()`/`.detach()` cho số thuần.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** mô hình `y = w·x` (bỏ bias cho đơn giản), 1 mẫu (x=2, y=5), khởi tạo w=1, lr=0.1. Tính tay 1 bước.

**Bước 1 — Forward:** `ŷ = w·x = 1×2 = 2`.

**Bước 2 — Loss (MSE):** `(ŷ − y)² = (2−5)² = 9`.

**Bước 3 — Gradient:** đạo hàm MSE theo w: `dL/dw = 2(ŷ−y)·x = 2(2−5)×2 = 2×(−3)×2 = −12`.

**Bước 4 — Update:** `w ← w − lr·grad = 1 − 0.1×(−12) = 1 + 1.2 = 2.2`.

**Bước 5 — Giải thích:** w tăng từ 1 lên 2.2 vì gradient âm (tăng w làm giảm loss) — đúng tinh thần gradient descent hướng về y=5. PyTorch autograd làm *toàn bộ* Bước 3–4 tự động qua `.backward()` + `step()`; bạn chỉ cần hiểu ý nghĩa từng bước.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** tự tay viết đạo hàm (như Chương 8 sách toán làm bằng tay trên hàm nhỏ).

| Phương diện | Tự viết đạo hàm tay | PyTorch autograd |
|---|---|---|
| Công sức | phải tính dây chuyền mỗi model | tự động qua backward |
| Độ tổng quát | chỉ làm được cho model nhỏ | model hàng triệu tham số |
| Khả năng sai | cao (nhầm công thức) | thấp |
| Đánh đổi | hiểu sâu cơ chế | phải quen API, phụ thuộc framework |

**Cải thiện:** mở rộng lên model lớn, ít sai. **Đánh đổi:** nếu chỉ dùng autograd mà không hiểu "gradient là gì", bạn khó chẩn đoán lỗi — nên làm vài lần bằng tay (như Ví dụ nhỏ trên) để hiểu trước khi "tin framework".

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát trực tiếp quy luật được học khi dữ liệu đơn giản.

Chạy vòng lặp Bước 4 trên `y=2x+1`, in loss mỗi 40 epoch. Ghi nhận:
1. Loss giảm dần về gần 0 sau ~200 epoch?
2. `w` và `b` hội tụ về 2 và 1?
3. Nếu thay `lr=0.5` (lớn hơn 10 lần), behavior thế nào? (Có thể dao động/phân kỳ → minh họa learning rate, Chương 8 sách toán.)

**Giảm lr:** nếu loss dừng cao, giảm lr xuống 0.01 và tăng epoch; nếu dao động, giảm lr. Điều chỉnh lr là nghiệp vụ chính yếu trong mọi thí nghiệm.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch (Chương 1.1).

**Cấu trúc:** `my_experiment/scripts/train_linreg.py` (thư mục theo Chương 1.2).

```python
import torch
import torch.nn as nn

# Dữ liệu (đủ nhỏ)
x = torch.tensor([[1.0], [2.0], [3.0], [4.0]])
y = 2 * x + 1

model = nn.Linear(1, 1)
loss_fn = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(200):
    optimizer.zero_grad()
    y_pred = model(x)
    loss = loss_fn(y_pred, y)
    loss.backward()
    optimizer.step()
    if epoch % 40 == 0:
        print(epoch, round(loss.item(), 4))

print("w ≈", model.weight.item(), "| b ≈", model.bias.item())
```

**Cách chạy:** `python scripts/train_linreg.py` (từ `my_experiment/`).

**Kết quả dự kiến:** loss giảm dần (VD 6.x → 0.x), cuối `w≈2.0`, `b≈1.0`.

**Lỗi thường gặp:** như mục 7: thiếu `.float()`; quên `zero_grad()`; dùng `model.weight` (tensor) mà so sánh số → dùng `.item()`.

**Chú thích trung thực:** chạy được trên máy Python thông thường (CPU). Kết quả số có thể chênh vài phần nghìn do khởi tạo ngẫu nhiên và version; chỉ cần cụm `w≈2, b≈1` và loss giảm là đạt.

---

## 12. Đánh giá

**Chỉ số:** (1) loss giảm dần về ~0 trên dữ liệu huấn luyện; (2) `w` tiến về 2, `b` về 1 (quy luật đã biết); (3) vòng lặp chạy không lỗi.

**Vì sao chọn:** dữ liệu có quy luật *đã biết trước* (y=2x+1) nên ta có **ground truth** để kiểm chứng — chỉ số rõ ràng: model phải "học ra" đúng tham số. Trong thí nghiệm thật (ảnh), không có quy luật biết trước, ta mới dựa vào loss trên val/test (G2.7).

**Chỉ số không thể hiện:** dataset này quá đơn giản, không chứng minh mô hình tổng quát hay chống overfit. Đây chỉ minh họa vòng lặp, không phải đánh giá model tốt trên dữ liệu thật.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "`nn.Linear` 'thông minh', phải khai báo gì đó." — Không, nó chỉ là `y = Wx + b` (tầng tuyến tính) với 2 tham số cần học. "Thông minh" không có; làm đúng phép biến đổi + autocam đạo hàm.
- **Hiểu lầm 2:** "`.backward()` tự làm việc 'training'." — Nó chỉ *tính gradient*; còn việc *cập nhật* trọng số do `optimizer.step()` làm. Thiếu `step()` thì trọng số không đổi. Phân biệt rõ 2 lệnh.
- **Hiểu lầm 3:** "Không cần `zero_grad()`." — Phải gọi; nếu không, gradient của vòng này *cộng dồn* với vòng trước → cập nhật sai. Đây là bug "kinh điển" mà nhiều người mắc.
- **Giới hạn:** chương này cho *một neuron* (tuyến tính). Mạng thật (G3) nhiều tầng + activation; vòng lặp vẫn y hệt, chỉ nhiều khối hơn. Đừng nhầm "hiểu vòng lặp 1 neuron" là "hiểu toàn bộ mạng nơ-ron" — đó là bước tiếp theo (G3).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt `torch.Tensor` và `np.ndarray` — điểm khác then chốt (autograd) và vì sao ML dùng tensor.
2. Kể theo thứ tự đúng 5 bước của vòng huấn luyện.
3. Trong ví dụ nhỏ mục 8: gradient theo w là âm hay dương? Vì sao update làm w tăng?

### Luyện tập (sửa đổi / mở rộng)
4. Đổi dataset thành `y = 3x + 0.5`. Chạy lại; ghi nhận w, b hội tụ về mấy. (Sửa 1 dòng.)
5. Kiểm thử lr: chạy với `lr=0.5` và `lr=0.001`, so sánh đường loss (dùng print mỗi 40). Giải thích bằng lời.
6. Viết lại vòng lặp gom đúng thứ tự: đảm bảo `zero_grad()` đặt trước `backward()`. Tại sao?

### Thử thách (thiết kế / liên hệ)
7. Mở rộng mô hình 1 neuron thành 2 "đặc trưng" đầu vào: `y = 2x1 + 3x2 + 1`. Tạo dữ liệu, đổi `nn.Linear(2,1)`, và dự đoán xem w1, w2, b hội tụ về bao nhiêu. Chạy và kiểm chứng.
8. Giải thích bằng lời: vì sao cần làm "vài lần tính gradient bằng tay" trước khi tin autograd — và liên hệ thói quen "tính tay số nhỏ" (Chương 1.3, 1.2) xuyên suốt lộ trình.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Tensor có `requires_grad` + autograd tự đạo hàm + chạy GPU; ndarray không tự đạo hàm/cpu. ML cần autograd để gradient descent → dùng tensor.
2. (1) forward, (2) loss, (3) backward (gradient), (4) step (cập nhật), (5) zero_grad — rồi lặp.
3. Gradient = −12 (âm). Update `w ← w − lr×(−12)` nên `− lr × âm` = tăng w → về phía giảm loss.
4. Sau khi chạy, w≈3, b≈0.5.
5. lr=0.5: loss có thể dao động/phân kỳ (bước quá lớn, nhảy qua đáy). lr=0.001: giảm rất chậm, chưa hội tụ trong 200 epoch. Bài học: lr cân đối (Chương 8 sách toán).
6. Vì gradient phải tính trên giá trị *mới*, không bị cộng tích lũy vòng trước. `zero_grad()` trước `backward()` mỗi vòng.
7. `nn.Linear(2,1)`, dữ liệu `x` shape (N,2). w về `[~2, ~3]`, b ~1. (Model học đúng 3 trọng số.)
8. Vì autograd "che giấu" công thức gradient; nếu không hiểu gradient nghĩa gì, khó chẩn đoán khi loss không giảm. Tính tay vài lần (như mục 8) tạo trực giác "gradient = độ dốc, step đi ngược" — nền để tin (và kiểm) framework khôn ngoan. Đây là yêu cầu phương pháp của lộ trình: không hoàn toàn uỷ thác cho tool.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Tensor** = NumPy + autograd (tự đạo hàm); dùng cho gradient descent.
2. Vòng huấn luyện **5 bước**: forward → loss → backward → step → zero_grad, lặp lại.
3. `nn.Linear` = `Wx + b` (2 tham số để học); `loss_fn` + `optimizer` phối hợp hạ loss.
4. **Learning rate** quyết định bước đi; quá lớn dao động/phân kỳ, quá nhỏ chậm.
5. Luôn **tính tay vài bước** trước khi tin autograd/framework — hiểu cơ chế mới chẩn đoán được.

**Tự kiểm tra:**
- Tensor khác ndarray ở điểm nào?
- Kể đúng thứ tự 5 bước vòng lặp.
- `backward()` làm gì, `step()` làm gì — khác nhau thế nào?
- Vì sao cần `zero_grad()` mỗi vòng?
- Khi loss không giảm, bạn kiểm tra điều gì đầu tiên (lr? dữ liệu? zero_grad?)?

---

## 16. Đọc sâu bằng trực giác — ba lệnh, ba nhiệm vụ khác nhau

Một cái cân điện tử có nút đo, nút lưu và nút đặt lại về 0. Bấm đo mà quên đặt lại, lần cân sau sẽ cộng dồn cả vật cũ. Vòng huấn luyện PyTorch cũng có ba thao tác dễ bị gộp làm một: `backward()` đo gradient, `step()` chỉnh tham số, `zero_grad()` xóa bộ đo về 0.

| Lệnh | Nhiệm vụ | Nếu bỏ hoặc làm sai |
|---|---|---|
| `loss.backward()` | Tính gradient của loss theo tham số | Không có gradient để cập nhật |
| `optimizer.step()` | Dùng gradient để đổi `w,b` | Tham số đứng yên dù đã tính gradient |
| `optimizer.zero_grad()` | Xóa gradient tích lũy | Gradient các bước cộng dồn, bước đi sai |

**Đọc thành lời:** với một mẫu và mô hình `ŷ=wx`, loss `L=(ŷ−y)²`, gradient là `dL/dw=2(ŷ−y)x`. Ba lệnh trên không thay thế nhau: `backward()` chỉ ghi gradient vào `w.grad`; `step()` đọc `w.grad` để cập nhật; `zero_grad()` đặt `w.grad` về 0 trước vòng sau. Điều dễ đọc sai là tưởng `backward()` đã huấn luyện xong, hoặc tưởng `zero_grad()` là tùy chọn.

**Tính tay:** mẫu `x=2`, `y=5`, khởi tạo `w=1`, `lr=0,1`. Bước 1: `ŷ=2`, loss `9`, gradient `2(2−5)×2=−12`, nên `w=1−0,1×(−12)=2,2`. Bước 2: `ŷ=4,4`, loss `(4,4−5)²=0,36`, gradient `2(4,4−5)×2=−2,4`, nên `w=2,2−0,1×(−2,4)=2,44`. Hai bước đưa `w` từ 1 lên 2,44, tiến gần 2,5 (nghiệm của `wx=5`).

**Phản ví dụ:** quên `zero_grad()` ở bước 2. Gradient cũ `−12` vẫn nằm trong `w.grad`, gradient mới `−2,4` cộng vào thành `−14,4`; `step()` cho `w=2,2−0,1×(−14,4)=3,64`, vượt xa nghiệm và làm loss tăng. Code không báo lỗi, nên đây là lỗi âm thầm khó thấy.

**Giới hạn:** autograd tính đúng đạo hàm của những phép bạn đã viết, không bảo đảm dữ liệu đúng, loss phù hợp hay mô hình sẽ tổng quát. `.item()` chỉ lấy số ra khỏi tensor; nếu cần dừng gradient cho một nhánh, phải dùng `.detach()` có chủ đích.

:::interactive torch
:::

:::quiz
Một vòng huấn luyện quên `optimizer.zero_grad()`. Điều gì xảy ra ở vòng sau?
A. Gradient được thay mới hoàn toàn nên không ảnh hưởng.
B. Gradient mới cộng dồn vào gradient cũ, làm bước cập nhật sai.
C. `optimizer.step()` tự xóa gradient trước khi cập nhật.
Đáp án: B
Giải thích: PyTorch tích lũy gradient trong `.grad` cho đến khi được xóa. Bỏ `zero_grad()` khiến gradient nhiều vòng cộng lại, thường làm bước đi quá lớn.
:::

**Tự thử thêm:** tiếp tục ví dụ trên với bước 3: `w=2,44`, vẫn `x=2`, `y=5`, `lr=0,1`. Tính `ŷ`, loss, gradient và `w` mới.

:::goi-y
`ŷ=2,44×2=4,88`; loss là bình phương độ lệch còn lại; gradient vẫn dùng công thức `2(ŷ−y)x`.
:::

:::loi-giai
`ŷ=4,88`; loss `(4,88−5)²=0,0144`; gradient `2(4,88−5)×2=−0,48`; `w=2,44+0,048=2,488`. Các bước tiếp tục tiến về 2,5, mỗi lần vượt nhẹ rồi thu hẹp.
:::