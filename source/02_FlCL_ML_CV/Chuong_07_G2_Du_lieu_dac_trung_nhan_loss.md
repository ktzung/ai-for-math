# Chương 2.2 — Dữ liệu, đặc trưng, nhãn, dự đoán và hàm mất mát (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Trước khi bất kỳ mô hình nào chạy, ta cần nói rõ: dữ liệu trông ra sao, "đúng/sai" được đo thế nào, và mô hình đang tối ưu cái gì?*

---

## 1. Vị trí trong lộ trình

Ở G2.1 ta đã đặt khung giám sát. Giờ đi vào **ngôn ngữ chung** của mọi mô hình giám sát: `dữ liệu → đặc trưng + nhãn → mô hình dự đoán → hàm mất mát`. Nắm 4 khái niệm này là đủ để đọc được gần hết "mẫu số chung" của tài liệu ML.

Nó **nối** từ G1 (nạp dữ liệu, NumPy) và G2.1 (giám sát), **chuẩn bị** cho G2.3–G2.8 và toàn bộ G3–G8 (mọi mô hình đều nói bằng ngôn ngữ này).

---

## 2. Kiến thức cần dùng

- Nạp dữ liệu (1.2), mảng (1.3), vòng lặp PyTorch (1.4).
- Math: hàm mất mát, mô hình hóa (Chương 2 sách toán), xác suất nhẹ (Chương 5).

**Ôn nhanh:** "mô hình hóa" = biến tình huống thành quan hệ hàm; "hàm mất mát" = cách đo sai (Chương 8 sách toán). Ở đây ta đặt tên đúng các thành phần dữ liệu.

---

## 3. Câu chuyện mở đầu

Lan có một bộ dữ liệu ảnh để phân loại "mèo vs chó". Trước khi chạy model, cô bị mọi người hỏi những câu cơ bản mà cô nghĩ "hiển nhiên":

- "Mỗi ảnh bạn biểu diễn bằng gì? (đặc trưng)"
- "Nhãn ở đâu ra, có gán tự động hay thủ công?"
- "Mô hình 'đúng' nghĩa là gì — bạn đo bằng gì?"

Lan nhận ra: nếu không trả lời tròn các câu này, mọi con số accuracy sau này đều "hiển nhiên nhưng mơ hồ". Chương này giúp cô — và bạn — đặt đúng ngôn ngữ: **đặc trưng, nhãn, dự đoán, mất mát** — bốn viên gạch nền của mọi bài toán giám sát.

---

## 4. Câu hỏi trọng tâm

**Bốn thành phần (dữ liệu → đặc trưng + nhãn → dự đoán → loss) là gì, và chúng quyết định mô hình "đúng" thế nào?**

---

## 5. Trực giác

Hình dung chấm điểm một bài kiểm tra:

- **Dữ liệu (data):** tập các bài làm.
- **Đặc trưng (feature):** các *thuộc tính tách riêng* ta đọc ra từ mỗi bài để đánh giá (độ dài, độ rõ, số lỗi chính tả...). Với ảnh: độ sáng trung bình, cạnh, sắc... — mỗi đặc trưng là một phân tích rút gọn.
- **Nhãn (label):** đáp án đúng (điểm) — do người chấm (con người) gán.
- **Dự đoán (prediction):** điểm mô hình "đoán".
- **Hàm mất mát (loss):** thước đo "dự đoán lệch đáp án bao xa" — ví dụ *bình phương độ lệch* (Chương 8 sách toán).

Khi ta nói "mô hình học", nghĩa là **điều chỉnh tham số để giảm loss** — cho dự đoán sát nhãn hơn. Vậy **cách chọn đặc trưng và cách chọn loss quyết định "thế nào là đúng"** trước khi model tồn tại.

**Phép so sánh "chấm điểm bài kiểm tra":** tự nhiên. **Giới hạn:** bài kiểm tra con người hiểu ngữ nghĩa; đặc trưng tự động của máy (pixel, độ sáng) không "hiểu" nội dung—chúng chỉ là phép trích số. Và việc so khớp (feature → label) khó hơn con người chấm; ML phần lớn là đi tìm quan hệ này từ dữ liệu.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** tập `(x, y)` — mỗi mẫu có vector đặc trưng `x` (VD vector pixel) và nhãn `y`.
- **Đặc trưng gán nhãn:** nhãn gán thủ công (ánh xạ tên thư mục → số, như 1.2) hoặc tự động. Chọn đặc trưng tốt ảnh hưởng lớn khả năng học.
- **Mô hình:** hàm `f(x; θ)` với `θ` = tham số → ra dự đoán `ŷ`.
- **Loss:** `L(ŷ, y)` đo độ sai.
- **Mục tiêu:** tìm `θ` làm trung bình loss nhỏ nhất (Chương 8 sách toán).

**Thuật toán (quan niệm data→loss):**
```
1. Xác định dữ liệu & gán nhãn.
2. Biểu diễn mỗi mẫu bằng đặc trưng (vector).
3. Chọn mô hình + cách đo loss.
4. Huấn luyện để giảm loss (G1.4).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Biểu diễn đặc trưng.** Ảnh xám 2×2 → dẹt thành vector 4 số (pixel). Mỗi pixel là một đặc trưng.

```python
img = torch.tensor([[128., 200.], [90., 40.]])
flat = img.reshape(-1)      # [128., 200., 90., 40.]
```

- Vector đặc trưng = "danh sách số mô tả mẫu".

**Bước 2 — Gán nhãn.** Nhãn là số nguyên (0=chó,1=mèo) hoặc "one-hot" vector. Tên thư mục → số (như 1.2).

**Bước 3 — Dự đoán của mô hình.** `ŷ = model(x)` — số hoặc xác suất (G2.4).

**Bước 4 — Hàm mất mát.** Chọn theo loại bài toán:
- Hồi quy (y số): **MSE** `(ŷ−y)²` (Chương 1, 8 sách toán).
- Phân loại (y rời rạc): thường **cross-entropy** — đo "xác suất dự đoán đúng nhãn thật là bao nhiêu" (xem Ví dụ).

**Bước 5 — Giảm loss bằng gradient descent** (vòng lặp G1.4).

**Lỗi thường gặp:** dùng MSE cho phân loại (thay vì cross-entropy) → model khó hội tụ; quên chia train/val (sẽ nói khi G2.3); đặc trưng chưa chuẩn hóa (G1.3) → loss bị lấn át thang đo.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** phân loại nhị phân 1 mẫu. Mô hình ra "xác suất mèo" `ŷ=0.7`, nhãn thật `y=1` (là mèo).

**Bước 1 — "Đúng" theo cross-entropy:**
`loss = −[y·ln(ŷ) + (1−y)·ln(1−ŷ)]`
Hệ thập phân: `= −[1·ln(0.7) + 0] = −ln(0.7) ≈ 0.357`.

**Bước 2 — Diễn giải:** khi mô hình tự tin đúng (ŷ gần 1 với y=1), loss nhỏ. Nếu mô hình tự tin sai (ŷ=0.3 khi y=1), `−ln(0.3)≈1.2` — loss lớn.

**Bước 3 — Mục tiêu:** giảm cross-entropy = "mô hình càng ngày càng gán xác suất cao cho nhãn đúng" — khớp trực giác xác suất (Chương 5 sách toán).

**Bước 4 — So sánh với MSE:** MSE phạt độ lệch tuyệt đối; cross-entropy phạt "xác suất sai" theo log — phù hợp hơn cho phân loại vì trực tiếp tối đa khả năng nhãn đúng.

**Bước 5 — Giải thích ký hiệu:** `ln` = log tự nhiên; dấu trừ phía trước làm "phần thưởng xác suất" thành "mất mát dương cần giảm".

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** dùng "độ lệch" một số đơn `(ŷ−y)` (không bình phương/log).

| Phương diện | Độ lệch đơn | MSE / Cross-entropy |
|---|---|---|
| Có luôn dương không | không (âm/dương) | có (phạt lệch 2 chiều) |
| Phạt nặng sai lớn | không | MSE bình phương; CE log |
| Phù hợp phân loại | không | CE |
| Đánh đổi | đơn giản nhất | phải chọn đúng loại |

**Cải thiện:** chuẩn cho tối ưu hóa (đủ dương, gradient ổn). **Đánh đổi:** cần biết khi nào dùng MSE vs CE — chọn sai làm model khó học.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát "loss phản ánh độ đúng của dự đoán".

Tay tính loss cho 3 mô hình phân loại (nhãn y=1):
- Model A: ŷ=0.9 → CE = −ln(0.9) ≈ 0.105
- Model B: ŷ=0.5 → CE = −ln(0.5) ≈ 0.693
- Model C: ŷ=0.1 → CE = −ln(0.1) ≈ 2.303

**Ghi nhận:** mô hình tự tin đúng hơn (A) có loss nhỏ. Hệ thống xếp hạng loss A < B < C đúng thứ tự "đúng-sai". Đây là nền: *loss thấp hơn = dự đoán khớp hơn* (với nhãn), nhưng (quan trọng) chỉ đúng trên dữ liệu đo — cần val/test (G2.3).

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/loss_demo.py`:

```python
import torch
import torch.nn.functional as F

# phân loại nhị phân, nhãn thật = 1
y = torch.tensor([1.0])
yhat_a = torch.tensor([0.9])
yhat_b = torch.tensor([0.5])
yhat_c = torch.tensor([0.1])

for name, p in [("A", yhat_a), ("B", yhat_b), ("C", yhat_c)]:
    loss = F.binary_cross_entropy(p, y)   # cross-entropy nhị phân
    print(name, round(loss.item(), 3))
```

**Kết quả dự kiến:** A≈0.105, B≈0.693, C≈2.303 — khớp tính tay.

**Lỗi thường gặp:** `binary_cross_entropy` đòi xác suất ∈ (0,1) — nếu đầu ra không phải xác suất (dùng logits), phải dùng `binary_cross_entropy_with_logits` (G2.4/G3). Đừng dùng sai API.

**Chú thích trung thực:** giá trị log tự nhiên; chương này dùng pyTorch để minh họa loss, không phải để bỏ qua hiểu khái niệm. Đối chiếu luôn với tính tay.

---

## 12. Đánh giá

**Chỉ số:** loss tính tay (mục Thí nghiệm) và code đối chiếu trùng (A<B<C và xấp xỉ giá trị); hiểu nói được "loss thấp = khớp hơn trên dữ liệu đo".

**Vì sao chọn:** ở chương khái niệm về "cách đo đúng", chỉ số là *hiểu và khớp giữa tay-code*, không phải hiệu năng model.

**Chỉ số không thể hiện:** chưa nói "loss thấp trên data có nghĩa model giỏi trong thực tế" — vì chưa chia test (G2.3) và chưa chống overfit (G2.5). Một loss nhỏ trên *tập huấn luyện* chưa chứng minh gì về tổng quát.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Loss càng thấp, model càng tốt trên mọi thứ." — Chỉ đúng trên dữ liệu mà loss đo. Trên dữ liệu mới (test) có thể overfit (G2.5). Loss là thước đo *trên một tập dữ liệu*, không phải chân lý phổ quát.
- **Hiểu lầm 2:** "Nhãn luôn đúng." — Nhãn do con người gán, có thể nhiễu/sai (mislabel). Nhãn xấu → mô hình "học sai" dù loss thấp. Luôn nghi ngờ chất lượng nhãn (G4 phân tích lỗi).
- **Hiểu lầm 3:** "MSE dùng được cho phân loại." — Kỹ thuật dùng được nhưng không tối ưu; cross-entropy khớp xác suất + gradient tốt hơn. Chọn đúng loss theo loại bài toán là kỹ năng.
- **Giới hạn:** "đặc trưng tốt" và "loss tốt" mang tính thiết kế + thử nghiệm; không có công thức phổ quát. Đừng nghĩ "chọn đặc trưng" là bước tự động duy nhất; biểu diễn dữ liệu là cả một nghệ thuật (sẽ gặp ở G4 khi làm CV).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt: dữ liệu, đặc trưng, nhãn, dự đoán, loss — cho ví dụ ảnh mèo.
2. Với hồi quy, nên dùng MSE hay cross-entropy? Vì sao?
3. Tính tay cross-entropy khi `y=1, ŷ=0.8`.

### Luyện tập (sửa đổi / mở rộng)
4. Mở rộng loss_demo: thêm model ŷ=0.6, tính và so sánh.
5. Chuyển sang y=0 (nhãn "không phải mèo"), tính CE cho ŷ=0.1, 0.5, 0.9 — đợi kết quả nào nhỏ nhất? Giải thích khi y=0, ŷ nên gần 0 để loss nhỏ.

### Thử thách (thiết kế / liên hệ)
6. Thiết kế "đặc trưng" cho một thiết bị IoT đo độ ẩm: bạn sẽ biểu diễn dữ liệu gì (tối thiểu 3 đặc trưng) và nếu phân loại "cần tưới / không" thì nhãn từ đâu?
7. Giải thích: vì sao trong FL (G6), việc *mỗi client có nhãn khác nhau/thiếu nhãn* làm bài toán giám sát trên client khác đi — và loss nên được đo thế nào ở cấp độ tổng hợp (gợi ý: trung bình loss theo client).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Dữ liệu = các ảnh; đặc trưng = pixel/vector đặc trưng; nhãn = "mèo/chó"; dự đoán = output mô hình; loss = cách đo lệch dự đoán–nhãn.
2. MSE, vì y là số liên tục, đo độ lệch bình phương hợp lý; CE dành cho xác suất/phân loại.
3. `−ln(0.8) = 0.223` (y=1 nên chỉ giữ `ln(ŷ)`).
4. ŷ=0.6 → `−ln(0.6)=0.511`, nằm giữa B và A.
5. Với y=0: `loss=−ln(1−ŷ)`. ŷ=0.1→−ln(0.9)=0.105 (nhỏ nhất); ŷ=0.5→0.693; ŷ=0.9→2.303. Khi y=0, ŷ tiến về 0 làm loss nhỏ → khớp "dự đoán sai nhãn 1 thì bị phạt".
6. Ví dụ đặc trưng: (a) giá trị độ ẩm hiện tại, (b) trung bình 24h, (c) xu hướng đạo hàm (Tốc độ khô). Nhãn "cần tưới" gán bởi chuyên gia hoặc ngưỡng quy đổi (người quyết định) — nói rõ nguồn nhãn.
7. Nếu client thiếu nhãn, không thể giám sát đầy đủ; loss tại client tính trên số mẫu có nhãn. Ở cấp tổng hợp, FedAvg thường trung bình cập nhật theo trọng số số mẫu; loss đo chung nên cân theo "số mẫu/lớp" để không bị client to lấn. Liên hệ non-IID (G6.5).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Bốn viên gạch: **đặc trưng** (biểu diễn mẫu), **nhãn** (đáp án), **dự đoán** (output mô hình), **loss** (cách đo sai).
2. Loss phụ thuộc bài toán: **MSE** cho hồi quy, **cross-entropy** cho phân loại.
3. "Học" = giảm loss; loss thấp hơn = dự đoán khớp hơn *trên dữ liệu đo*.
4. Chất lượng nhãn và cách chọn đặc trưng ảnh hưởng trực tiếp kết quả — đừng coi nhẹ.
5. Loss thấp trên train chưa chứng minh tổng quát — cần val/test (G2.3) và chống overfit (G2.5).

**Tự kiểm tra:**
- Với phân loại nhị phân y=1, ta dùng công thức loss nào, và ŷ bao nhiêu là "tốt"?
- Vì sao nên dùng cross-entropy thay vì MSE khi phân loại?
- Đặc trưng và nhãn cần được làm rõ trước khi huấn luyện thế nào?

---

## 16. Đọc sâu bằng trực giác — loss là bản hợp đồng về cái cần giảm

Một huấn luyện viên muốn giảm "độ mệt" của học viên phải định nghĩa mệt bằng nhịp tim, quãng đường hay thời gian hồi phục. Chọn thước đo nào là chọn điều gì được tối ưu. Với mô hình, đặc trưng quyết định nó nhìn thấy gì, nhãn quyết định đáp án đúng, còn loss quyết định "sai" nghĩa là gì.

| Thành phần | Vai trò | Điều dễ nhầm |
|---|---|---|
| Đặc trưng `x` | Các số mô tả mẫu | Tưởng pixel thô đã là biểu diễn tốt |
| Nhãn `y` | Đáp án do con người gán | Tưởng nhãn luôn đúng và nhất quán |
| Loss `L(ŷ,y)` | Thước đo sai lệch cần giảm | Dùng một loss cho mọi loại bài toán |

**Đọc thành lời:** với hồi quy, MSE là `L=(1/N)Σ(ŷᵢ−yᵢ)²`: lấy sai lệch từng mẫu, bình phương để phạt hai chiều và làm sai lớn nặng hơn, rồi lấy trung bình. Với phân loại, cross-entropy là `−[y ln ŷ+(1−y)ln(1−ŷ)]` cho nhị phân, đo mô hình gán bao nhiêu xác suất cho nhãn đúng. Điều dễ đọc sai là nghĩ hai loss chỉ khác đơn vị; chúng phạt những loại sai khác nhau.

**Tính tay:** với `y=[2,4,6]` và dự đoán `[2,5,5]`, sai lệch là `0,1,−1`; bình phương `0,1,1`; MSE `(0+1+1)/3≈0,667`. Nếu một đặc trưng có thang 0–255 còn đặc trưng kia 0–1, sai lệch ở đặc trưng lớn sẽ chi phối MSE dù nó không quan trọng hơn; chuẩn hóa trước khi học giúp loss so sánh công bằng hơn.

**Phản ví dụ:** thấy MSE giảm từ 10 xuống 2 rồi kết luận mô hình "hiểu dữ liệu". MSE giảm có thể chỉ vì mô hình học đoán gần giá trị trung bình, hoặc vì một đặc trưng thang lớn bị kéo về 0; nó chưa cho biết dự đoán đúng trên mẫu mới. Cần validation/test và kiểm tra lỗi theo nhóm.

**Giới hạn:** loss chỉ là đại diện cho mục tiêu thật. Nhãn nhiễu làm loss thấp vẫn có thể là học sai; đặc trưng thiếu thông tin thì loss thấp trên train cũng không cứu được test. Và loss thấp không nói gì về chi phí tính toán, độ bền hay công bằng giữa các nhóm.

:::interactive loss
:::

:::quiz
Với `y=[1,3]` và dự đoán `ŷ=[2,5]`, MSE bằng bao nhiêu?
A. 2,5
B. 5
C. 1,5
Đáp án: A
Giải thích: Sai lệch là `1` và `2`; bình phương được `1` và `4`; trung bình `(1+4)/2=2,5`. Chọn B là quên chia cho số mẫu; chọn C là lấy trung bình sai lệch tuyệt đối, không bình phương.
:::

**Tự thử thêm:** với nhãn `y=1`, mô hình dự đoán xác suất `ŷ=0,8`. Tính cross-entropy nhị phân. Sau đó tính lại với `y=0` nhưng vẫn `ŷ=0,8` và giải thích vì sao loss lớn hơn.

:::goi-y
Với `y=1`, số hạng thứ hai biến mất; với `y=0`, số hạng thứ nhất biến mất. Dùng `ln(0,8)` và `ln(0,2)`.
:::

:::loi-giai
`y=1`: `−ln(0,8)≈0,223`. `y=0`: `−ln(0,2)≈1,609`. Cùng một dự đoán 0,8 nhưng sai nhãn bị phạt nặng hơn vì mô hình đã gán xác suất thấp cho đáp án đúng.
:::