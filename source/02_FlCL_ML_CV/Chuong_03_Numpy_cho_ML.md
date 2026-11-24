# Chương 1.3 — NumPy cho ML (Giai đoạn 1)

> **Câu hỏi trọng tâm:** *Làm thế nào để thao tác nhanh và đúng trên các mảng số của dữ liệu — trước khi bất kỳ model nào chạy?*

---

## 1. Vị trí trong lộ trình

Ở Chương 1.2 ta đã *nạp* dữ liệu (ảnh thành tensor). Ở đây ta học **NumPy** — công cụ thao tác mảng số, là "nền" mà PyTorch dựa trên. NumPy xuất hiện trong mọi bước: chuẩn hóa dữ liệu (dataset), tính metric, so sánh kết quả FL (trung bình client), xử lý ảnh.

Chương này **nối** từ Chương 1.2 (dữ liệu đã sẵn) và **chuẩn bị** cho Chương 1.4 (PyTorch — tensor có cú pháp gần giống NumPy) và mọi giai đoạn sau (G2–G9). Kỹ năng ở đây là "bàn tay" để làm mọi thí nghiệm sau này.

---

## 2. Kiến thức cần dùng

- Python cơ bản (biến, hàm, for) — G0.1 nếu thiếu.
- NumPy đã cài (Chương 1.1) và biết cách nhập.
- **Toán:** ý tưởng Chương 3 sách toán — mảng 2 chiều = ma trận, thao tác "từng phần tử". Không cần đạo hàm ở đây.

**Ôn nhanh:** mảng NumPy là "bảng số nhiều chiều" với khái niệm **shape** (hình dạng — số phần tử mỗi chiều) và operation **element-wise** (phép toán tự áp cho từng phần tử). Giống tensor ta gặp ở Chương 1.2.

---

## 3. Câu chuyện mở đầu

Lan cần chuẩn bị dữ liệu để phân loại ảnh. Cô có một mảng pixel thô: các giá trị 0–255, lộn xộn. Cô biết model học tốt hơn khi dữ liệu "chuẩn hóa" về khoảng 0–1 hay trung bình ~0, và cô cần cắt giảm một phần dữ liệu lỗi (NaN) cùng một chút "thống kê" nhanh (max, min, trung bình).

Nếu cô dùng Python thuần (`for` lồng nhau) để duyệt từng pixel, sẽ chậm khủng khiếp với 50.000 ảnh. Cô cần một cách *nhanh, gọn, khó sai* để thao tác trên toàn bộ mảng số cùng một lúc — đó là **mảng véc-tơ hóa trong NumPy**.

---

## 4. Câu hỏi trọng tâm

**Làm cách nào để thao tác nhanh và đúng trên toàn bộ mảng số — chuẩn hóa, lọc, thống kê, reshape — mà không dùng vòng lặp chậm?**

---

## 5. Trực giác

Trong Python thường, muốn "mỗi phần tử cộng 1" bạn viết vòng `for`. Với 1 triệu phần tử, vòng lặp chạy 1 triệu lần — chậm.

**NumPy "vectơ hóa":** bạn nói một lệnh duy nhất "cộng 1 cho cả mảng". NumPy chạy phép đó ở mức máy (C/trình biên dịch), nhanh hơn Python vòng lặp *hàng chục→hàng trăm lần*. Bạn không viết "cho từng cái một" — bạn viết "cho tất cả một lần".

Hãy nghĩ: Python `for` giống gọi người chuyển từng viên gạch; vòng lặp C/NumPy giống cẩu/nâng một tấn gạch cùng lúc. **Vectơ hóa = "làm tất cả cùng lúc"**, vừa nhanh vừa ít lỗi (không duyệt nhầm index).

**Phép so sánh "cẩu gạch vs chuyển từng viên":** trực quan. **Giới hạn:** không phải mọi phép toán đều vectơ hóa được ngây ngô (một số cần thuật toán vòng lặp); và "nghiệp vụ" phức tạp có thể đòi vẫn dùng vòng lặp nhưng ở mức ít nhất. Nhưng phần lớn thao tác dữ liệu ML — chuẩn hóa, thống kê, filter, tính metric — vectơ hóa được và nên làm.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** mảng ảnh pixel (VD shape `(N, 32, 32, 3)` như CIFAR-10) hoặc bảng đặc trưng `(N, D)`.
- **Mô hình:** chưa có (chương công cụ).
- **Mục tiêu tối ưu:** thao tác mảng chính xác, nhanh, rõ — để dữ liệu sạch cho G1.4 (PyTorch) và G2 (ML).
- **Điều kiện:** NumPy cài đúng; hiểu shape.

**Thuật toán tổng quan:**
```
1. Tạo/có mảng (từ dữ liệu hoặc np.arange/np.random).
2. Xem .shape, .dtype.
3. Chuẩn hóa: trừ trung bình, chia độ lệch chuẩn (hoặc min-max).
4. Thống kê: min/max/mean(std) → np.mean, np.std, np.max, np.min, np.sum.
5. Lọc/lấy con: slicing, boolean mask.
6. Reshape/transpose để đưa về dạng model cần.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Tạo mảng & xem shape.**

```python
import numpy as np
a = np.array([[1, 2, 3], [4, 5, 6]])   # mảng 2x3
print(a.shape)       # (2, 3)
print(a.dtype)       # int64
b = np.arange(6)     # [0 1 2 3 4 5]
c = np.random.rand(3, 3)  # 3x3 số ngẫu nhiên [0,1)
```

- `np.array(...)` — tạo mảng từ danh sách.
- `a.shape` — bộ số "hình dạng" (số hàng, cột).
- `np.arange` — dãy số (giống range nhưng ra mảng).
- `np.random.rand` — mảng ngẫu nhiên (dùng để khởi tạo trọng số sau này).

**Bước 2 — Thao tác element-wise (vectơ hóa).**

```python
x = np.array([1.0, 2.0, 3.0])
print(x + 1)     # [2. 3. 4.]
print(x * 2)     # [2. 4. 6.]
print(x ** 2)    # [1. 4. 9.]
```

Mỗi phép tự áp "từng phần tử" — không cần vòng lặp. Đây là cốt lõi của vectơ hóa.

**Bước 3 — Thống kê nhanh.**

```python
d = np.array([3.0, 1.0, 2.0, 10.0])
print(d.mean())    # 4.0
print(d.std())     # ~3.39
print(d.max(), d.min())   # 10.0 1.0
print(d.sum())     # 16.0
```

**Bước 4 — Boolean mask (lọc điều kiện).**

```python
idx = d > 2          # [True False False True]
print(d[d > 2])      # [3. 10.]  — chỉ giữ phần tử thỏa
print((d > 2).sum()) # 2  — đếm số phần tử thỏa
```

Mask là cách "lọc dữ liệu theo điều kiện" mà không vòng lặp. Rất hữu ích khi khảo sát dữ liệu / phân tích lỗi ở G4.8.

**Bước 5 — Reshape & transpose (đưa về dạng model cần).**

```python
img = np.arange(6).reshape(2, 3)   # 6 số → 2 hàng 3 cột
print(img.T)       # chuyển vị (hoán đổi chiều) — 3x2
```

- `reshape(2,3)` — sắp lại dữ liệu theo shape mong muốn (tổng số phần tử phải khớp).
- `.T` — chuyển vị, hoán đổi hàng/cột. Quan trọng khi sửa thứ tự chiều (trong PyTorch/ảnh ta cũng gặp `permute`, Chương 1.2).

**Bước 6 — Chuẩn hóa dữ liệu (liên kết G4.1).**

```python
pix = np.array([0., 128., 255.])
# min-max về 0..1
norm = (pix - pix.min()) / (pix.max() - pix.min())   # [0. 0.5 1.]
# z-score (trừ trung bình, chia độ lệch chuẩn)
z = (pix - pix.mean()) / pix.std()
```

- **Min-max:** co giãn về khoảng [0,1] — hữu ích khi giữ tỉ lệ.
- **Z-score:** trung bình 0, độ lệch 1 — hữu ích khi muốn bỏ ảnh hưởng thang đo trước khi model học (nối với Chương 3/5 sách toán về các con số tóm tắt).

**Lỗi thường gặp:**
- `shape mismatch` — thao tác giữa hai mảng kích thước không khớp; kiểm tra `.shape`.
- `.reshape` lỗi "size must match product" — tổng phần tử sai; tính đúng.
- Quên `.mean()` viết ra mảng không như mong muốn (nên in ra để kiểm).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** bạn có 4 giá trị pixel `[10, 20, 30, 40]` và muốn chuẩn hóa min-max rồi kiểm tra tay.

**Bước 1 — Tính min-max:** `min=10, max=40` → `(x−10)/(40−10) = (x−10)/30`.

**Bước 2 — Từng giá trị:**
- 10 → `(10−10)/30 = 0`
- 20 → `10/30 ≈ 0.333`
- 30 → `20/30 ≈ 0.667`
- 40 → `30/30 = 1`

→ kết quả `[0., 0.333, 0.667, 1.]`.

**Bước 3 — Kiểm chứng bằng NumPy:** `(arr - arr.min())/(arr.max()-arr.min())` cho đúng mảng trên. *(Thói quen: tính tay một mảng nhỏ rồi đối chiếu với code — tránh bug khó tìm.)*

**Bước 4 — Giải thích:** vec-tơ hóa làm phép chuẩn hóa một dòng, chính xác, áp cho bất kỳ mảng bao nhiêu phần tử.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** viết vòng `for` để duyệt từng phần tử.

| Phương diện | Vòng lặp Python | NumPy vectơ hóa |
|---|---|---|
| Tốc độ (mảng lớn) | rất chậm (triệu lần lặp) | nhanh (chạy mức C) |
| Dễ đọc | dài, lồng nhiều | ngắn, rõ |
| Ít lỗi | dễ quên index | ít sai |
| Đánh đổi | không cần biết thêm | cần hiểu `.shape`, mask |

**Cải thiện:** nhanh, gọn, chuẩn cho dữ liệu lớn. **Đánh đổi:** phải nắm hình dạng mảng & cách chọn slice/mask; sai `shape` là lỗi phổ biến của người mới.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát hiệu quả vectơ hóa và tự tin thao tác mảng.

Chạy đo tốc độ trên mảng 1.000.000 phần tử:

```python
import time
n = 1_000_000
big = np.arange(n, dtype=np.float64)
# cách NumPy
t0 = time.time(); _ = big + 1; dt_numpy = time.time() - t0
# cách Python vòng lặp
lst = list(big)
t0 = time.time(); res = [v + 1 for v in lst]; dt_py = time.time() - t0
print("numpy:", round(dt_numpy, 4), "s | python:", round(dt_py, 4), "s")
```

**Kết quả dự kiến:** thời gian Python vượt trội hơn nhiều (chậm hơn hàng chục lần trở lên). Ghi nhận: thực hiện thao tác dữ liệu bằng NumPy vectơ hóa thay vì vòng lặp.

**Chú thích trung thực:** tốc độ phụ thuộc máy; con số in có thể khác, nhưng *thứ tự* (NumPy nhanh hơn vòng lặp Python) luôn đúng trên dữ liệu lớn.

---

## 11. Thực hành lập trình

**Môi trường:** venv + numpy đã cài.

**Cấu trúc:** tạo `session/` — file `vectors.py`:

```python
import numpy as np

# 1. Tạo mảng
x = np.array([10., 20., 30., 40.])
print("shape:", x.shape)

# 2. Chuẩn hóa min-max
x_norm = (x - x.min()) / (x.max() - x.min())
print("normalized:", x_norm)

# 3. Thống kê
d = np.array([3., 1., 2., 10.])
print("mean:", d.mean(), "std:", round(d.std(), 2))

# 4. Boolean mask
print(">2:", d[d > 2])

# 5. Reshape
m = np.arange(6).reshape(2, 3)
print("reshaped:\n", m)
```

**Cách chạy:** `python vectors.py`.

**Kết quả dự kiến:** in shape (4,), normalized [0. 0.333 0.667 1.], mean 4.0 std 3.39, `>2` → [3. 10.], reshaped 2x3.

**Lỗi thường gặp:**
- `NameError: np not defined` → thiếu `import numpy as np`.
- `ValueError` ở reshape → số phần tử không khớp.
- `float`/`int` mismatch khi chia → dùng `dtype=float` hoặc `.astype(float)` nếu cần.

---

## 12. Đánh giá

**Chỉ số:** tất cả 5 đoạn in ra đúng giá trị mong đợi (chuẩn hóa đúng, thống kê đúng, mask đúng, reshape đúng shape).

**Vì sao chọn:** mỗi phép toán đều có kết quả *xác định, kiểm tra tay được* — vậy cách tốt nhất để đo là đối chiếu từng kết quả với tính toán tay. Đây chính là "kiểm tra tính đúng đắn bằng số liệu nhỏ" — thói quen dùng xuyên suốt lộ trình.

**Chỉ số không thể hiện:** chưa kiểm tra *hiệu năng trên dữ liệu thật*, chưa đo việc "chọn dữ liệu đúng cho bài toán". Chương này chỉ xác nhận "thao tác đúng cú pháp"; chất lượng xử lý dữ liệu (chuẩn hóa có nên dùng z-score hay min-max) phụ thuộc bài toán — đề cập ở G4.1.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "NumPy y hệt danh sách Python." — Không. Mảng NumPy đồng nhất kiểu, số chiều cố định, và phép toán vectơ hóa; list Python linh hoạt hơn nhưng chậm hơn cho số học. Dùng mảng cho dữ liệu số, list cho danh sách linh hoạt.
- **Hiểu lầm 2:** "`a + 1` là lỗi vì nhầm `a` là list." — Với mảng NumPy, `a + 1` hợp lệ (vectơ hóa); với list, nó nối phần tử. Nhầm giữa hai kiểu là lỗi máy móc phổ biến. Kiểm tra `type(a)`.
- **Hiểu lầm 3:** "`reshape` tự biết ý bạn." — Không, bạn phải cho shape đủ và khớp tổng phần tử; nếu không, lỗi. `-1` cho phép NumPy đoán một chiều (VD `.reshape(-1, 3)`), nhưng phải rõ ý.
- **Giới hạn:** NumPy chạy mảng trong RAM; dữ liệu quá lớn (hàng chục GB) cần xử lý theo khối hoặc công cụ khác. Ở lộ trình này dữ liệu nhỏ nên không cần lo; nhưng biết giới hạn bộ nhớ từ sớm là tốt.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Giải thích bằng lời: "vectơ hóa" nghĩa là gì, và vì sao nhanh hơn vòng lặp Python.
2. `np.arange(10).reshape(2, 5)` in ra mảng gì? (Ghi shape.)
3. `x = np.array([1., 2., 3.])`; `x + 2` và `x * 3` cho ra gì?

### Luyện tập (sửa đổi / mở rộng)
4. Chuẩn hóa z-score mảng `[2, 3, 4]` (tay, rồi code). Ghi kết quả.
5. Từ mảng `d = np.array([5., 2., 9., 1., 7.])`, tạo mảng chỉ giữ các giá trị nhỏ hơn hoặc bằng 5. In kết quả.
6. Tạo mảng ngẫu nhiên 3x4, in `.shape` và `.reshape(-1)`. Giải thích `-1`.
7. Tính tổng các phần tử của một mảng [1,2,3,4] bằng `np.sum`, đối chiếu với `sum([1,2,3,4])`.

### Thử thách (thiết kế / liên hệ)
8. Giải thích bằng lời: trước khi đưa ảnh vào model, vì sao thường chuẩn hóa pixel về [0,1] hay z-score — nối với khái niệm "thang đo ảnh hưởng đến tính toán" (Chương 3 sách toán). Gợi ý: tích vô hướng bị thành phần to nhất lấn át.
9. Bạn có 2 mảng đặc trưng từ 2 client (trong FL mô phỏng): client1 `[1,2,3]`, client2 `[7,8,9]`. Dùng NumPy, viết cách tính "trung bình của 2 client từng chiều" (tức trung bình từng phần tử). *(Đây là bước đơn giản của Federated Averaging — liên hệ G6.4.)*

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Làm phép trên toàn bộ mảng cùng lúc (mức máy), không duyệt từng phần tử bằng vòng lặp → nhanh, ít lỗi.
2. `[[0 1 2 3 4],[5 6 7 8 9]]`, shape (2,5).
3. `x+2=[3. 4. 5.]`; `x*3=[3. 6. 9.]` (element-wise).
4. mean=3, std=√( (1+0+1)/3 )≈0.816 → z: 1.224, 0, −1.224.
5. `d[d <= 5]` → `[5. 2. 1.]`.
6. shape (3,4); `.reshape(-1)` → mảng 1 chiều 12 phần tử (dẹp mọi chiều). `-1` = "đoán sao cho khớp tổng".
7. Cả hai đều = 10 (int). `np.sum([1,2,3,4]) = 10`.
8. Vì tích vô hướng/học bị "thang đo lớn" lấn át (như C3: thành phần 0–255 trội hơn 0–1). Chuẩn hóa để mọi chiều "đứng cùng tỉ lệ", model học cân bằng hơn. Min-max về [0,1], z-score về mean=0/std=1.
9. `(np.array([1,2,3]) + np.array([7,8,9])) / 2` → `[4. 5. 6.]`. Đây là bước trung bình cộng theo chiều (element-wise) — nền của FedAvg (G6.4), chỉ là bình quân nhiều client hơn.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **NumPy** thao tác mảng số nhanh và chuẩn; dùng phép toán **element-wise/vectơ hóa** thay vòng lặp.
2. **`.shape`** là người bạn — kiểm tra hình dạng trước khi thao tác; `reshape` cần khớp tổng phần tử.
3. Thống kê nhanh (`mean/std/max/min/sum`) và **boolean mask** (`arr[cond]`) giúp khảo sát lọc dữ liệu.
4. **Chuẩn hóa** (min-max / z-score) quan trọng để model học cân bằng — dựa trên hiểu biết thang đo.
5. Kiểm tra code bằng **số liệu nhỏ tính tay** — thói quen dùng mọi lúc.

**Tự kiểm tra:**
- `a.shape` cho gì, và vì sao luôn kiểm tra trước khi thao tác?
- `a + 1` với NumPy khác với list như thế nào?
- Cách chuẩn hóa min-max và z-score khác nhau thế nào, khi nào dùng cái nào?
- Làm sao để "cộng trung bình 2 client theo chiều" bằng NumPy? (Liên hệ FedAvg.)
- Vì sao phải tính tay vài số rồi đối chiếu với code?

---

## 16. Đọc sâu bằng trực giác — shape là hợp đồng trước khi tính

Xếp ghế trong một hội trường: hàng ghế và số ghế mỗi hàng phải khớp với tấm vé trước khi khán giả vào. Phép nhân ma trận cũng vậy; nếu chiều trong của hai mảng không khớp, phép tính không có nghĩa. NumPy có thể báo lỗi, nhưng một số phép như broadcasting lại chạy mà không báo — nguy hiểm hơn.

| Phép | Shape đầu vào | Shape đầu ra |
|---|---|---|
| Nhân ma trận `A @ B` | `(m,n)` và `(n,p)` | `(m,p)` |
| Cộng véctơ cùng shape | `(m,n)` và `(m,n)` | `(m,n)` |
| Giảm theo trục `axis=0` | `(m,n)` | `(n,)` |
| Broadcasting `(3,1)+(1,4)` | `(3,1)` và `(1,4)` | `(3,4)` |

**Đọc thành lời:** `(m,n) @ (n,p) = (m,p)` nghĩa là "chiều thứ hai của A phải bằng chiều thứ nhất của B"; kết quả giữ chiều ngoài của A và chiều ngoài của B. Với `mean(axis=0)`, bạn cộng theo hàng rồi chia, nên kết quả còn một giá trị cho mỗi cột; `axis=1` làm ngược lại. Điều dễ đọc sai là nghĩ `axis` là "chiều bị giữ lại" thay vì "chiều bị gộp".

**Tính tay:** `A=[[1,2],[3,4]]`, `B=[[5],[6]]`. Khi đó `A@B` có shape `(2,1)`: hàng đầu `1×5+2×6=17`, hàng sau `3×5+4×6=39`, nên kết quả `[[17],[39]]`. Với `M=[[1,2],[3,4]]`, `M.mean(axis=0)=[2,3]` còn `M.mean(axis=1)=[1.5,3.5]`.

**Phản ví dụ:** bạn có ma trận đặc trưng `(100, 3)` và muốn trung bình theo từng đặc trưng, nhưng viết `axis=1`. Kết quả vẫn ra 100 số và code vẫn chạy, nên tưởng đúng; thực ra đó là trung bình từng mẫu, không phải từng cột. Tương tự, `(3,1)+(1,4)` cho `(3,4)` nhờ broadcasting, dù hai mảng không cùng shape — hãy kiểm tra shape trước khi tin kết quả.

**Giới hạn:** broadcasting hữu ích nhưng có thể che lỗi thiết kế; `A*B` là nhân từng phần tử, khác `A@B`. NumPy không biết ý nghĩa vật lý của trục, nên tên biến và comment phải nói rõ trục nào là mẫu, trục nào là đặc trưng.

:::interactive shape
:::

:::quiz
`A` có shape `(2,3)`, `B` có shape `(3,4)`. `A @ B` có shape nào?
A. `(2,4)`
B. `(3,3)`
C. `(2,3)`
Đáp án: A
Giải thích: Chiều trong `3` khớp nhau và bị gộp; kết quả giữ `2` từ A và `4` từ B, nên shape là `(2,4)`.
:::

**Tự thử thêm:** với `M=[[1,2],[3,4]]`, tính `M.mean(axis=0)` và `M.mean(axis=1)`. Sau đó giải thích kết quả nào phù hợp khi mỗi hàng là một client và mỗi cột là một đặc trưng.

:::goi-y
`axis=0` gộp các hàng, giữ lại một giá trị cho mỗi cột; `axis=1` gộp các cột, giữ lại một giá trị cho mỗi hàng.
:::

:::loi-giai
`axis=0` cho `[2,3]` (trung bình từng cột trên hai client); `axis=1` cho `[1.5,3.5]` (trung bình các đặc trưng trong từng client). Muốn trung bình theo client cho từng đặc trưng, dùng `axis=0`.
:::