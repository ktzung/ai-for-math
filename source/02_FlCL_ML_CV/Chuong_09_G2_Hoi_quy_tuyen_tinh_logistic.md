# Chương 2.4 — Hồi quy tuyến tính & hồi quy logistic (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Làm sao học ra một "cỗ máy dự đoán" — cho số liên tục (hồi quy) và cho xác suất/loại (logistic) — từ dữ liệu?*

---

## 1. Vị trí trong lộ trình

Đến đây ta có: khái niệm giám sát (G2.1), ngôn ngữ dữ liệu+loss (G2.2), chia tập (G2.3), vòng lặp huấn luyện (G1.4). Giờ đi **hai mô hình cơ bản đầu tiên**: hồi quy tuyến tính (dự đoán số) và hồi quy logistic (dự đoán xác suất/loại). Đây là "bước đệm" hoàn hảo lên học sâu (G3): mạng nơ-ron chỉ là hồi quy/logistic nhiều tầng.

Nó **nối** từ G2.2 (loss) và **chuẩn bị** cho G2.5 (overfit), G3 (nơ-ron), và mọi mô hình sau.

---

## 2. Kiến thức cần dùng

- Vòng lặp PyTorch (G1.4), chia train/val/test (G2.3).
- Math: mô hình tuyến tính `y=a·x+b` (Chương 2 sách toán), gradient descent (Chương 8 sách toán), sigmoid/xác suất (Chương 5 sách toán).

**Ôn nhanh:** mô hình tuyến tính = "đầu ra = tốc độ × đầu vào + khởi đầu" (`y = w·x + b`). Loss = cách đo sai (G2.2). Gradient descent = bước đi giảm loss (G1.4).

---

## 3. Câu chuyện mở đầu

Kho giao nhận muốn dự đoán **thời gian giao** từ quãng đường (hồi quy) — và dự đoán **đơn có trễ không** (phân loại 2 lớp). Lan nhận hai yêu cầu:

1. "Cho biết quãng đường d (km), ước tính thời gian t (phút)?" — **hồi quy**: đầu ra là *số liên tục*.
2. "Đơn này có khả năng đến trễ không?" — **phân loại**: đầu ra là *xác suất* (có/không).

Cô thử dùng cùng một "mặt phẳng tuyến tính" `w·x+b` cho cả hai, nhưng nhận ra: với hồi quy đầu ra tự do (số), với phân loại cô cần đầu ra **nén vào [0,1]** để đọc là xác suất. Hai mô hình này — tuyến tính và logistic — là nền tảng để sau này xây mạng.

---

## 4. Câu hỏi trọng tâm

**Hai mô hình tuyến tính-lô-gít khác nhau thế nào ở đầu ra và loss, và vì sao logistic biến "điểm tuyến tính" thành "xác suất"?**

---

## 5. Trực giác

**Hồi quy tuyến tính = "vẽ đường thẳng qua các điểm".** Bạn có điểm (d, t) thực tế; bạn vẽ một đường `t = w·d + b` qua chúng "vừa nhất có thể". "Vừa nhất" = đường có tổng bình phương sai số nhỏ nhất (MSE, Chương 8 sách toán). Đầu ra là *một số* (phút, giá, nhiệt độ).

**Hồi quy logistic = "nén một điểm tuyến tính về xác suất 0–1".** Bạn dựng một "điểm số" tuyến tính `w·x+b`, nhưng điểm số này thoải mái (có thể âm, rất lớn). Bạn *nén* nó qua hàm **sigmoid** để rơi về giữa 0 và 1, đọc là xác suất. Ngưỡng (VD 0.5) quyết định "có/không".

**Tại sao cần sigmoid?** Nếu bạn cứ dùng điểm số thô làm "xác suất", nó có thể ra 3 hoặc −2 — không phải xác suất hợp lệ. Sigmoid "uốn" đường về [0,1], và quan trọng là đủ trơn để gradient descent hoạt động. **(Giới hạn gây hiểu lầm:** sigmoid không "nghĩ", nó chỉ là một hàm nén toán học; và "xác suất ra" chỉ có nghĩa nếu dữ liệu phân bố hợp lý — ta coi như xác suất thực hành.)

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu (hồi quy):** `(x_i, y_i)`, y số liên tục (thời gian).
- **Dữ liệu (logistic):** `(x_i, y_i)`, y ∈ {0,1} (không trễ/trễ).
- **Mô hình hồi quy:** `ŷ = w·x + b` (đầu ra số).
- **Mô hình logistic:** `ŷ_prob = sigmoid(w·x + b)` (đầu ra xác suất). `sigmoid(z) = 1/(1+e^(−z))`.
- **Loss:**
  - hồi quy: MSE `(ŷ−y)²`.
  - logistic: Binary Cross-Entropy (CE, G2.2).
- **Học:** gradient descent giảm loss (G1.4).

**Thuật toán chung cả hai:**
```
1. Forward: tính dự đoán (hồi quy: w·x+b; logistic: sigmoid(w·x+b)).
2. Loss: MSE hoặc BCE.
3. backward + step (G1.4), lặp nhiều epoch.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Hồi quy tuyến tính 1 đặc trưng.**

```python
import torch, torch.nn as nn
x = torch.tensor([[1.],[2.],[3.],[4.]])
y = torch.tensor([[3.],[5.],[7.],[9.]])   # quy luật ẩn y=2x+1
model = nn.Linear(1, 1)
loss_fn = nn.MSELoss()
opt = torch.optim.SGD(model.parameters(), lr=0.02)
for _ in range(300):
    opt.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward(); opt.step()
print(model.weight.item(), model.bias.item())  # → ~2, ~1
```

- `nn.Linear(1,1)` = w, b. `MSE` = loss hồi quy. Model tự học ra `w≈2, b≈1`.

**Bước 2 — Hồi quy logistic 1 đặc trưng.**

```python
x = torch.tensor([[1.],[2.],[3.],[4.],[5.],[6.]])
y = torch.tensor([0., 0., 0., 1., 1., 1.])     # ngưỡng phân cách
model = nn.Linear(1, 1)
loss_fn = nn.BCEWithLogitsLoss()   # BCE áp lên logits (điểm số thô)
opt = torch.optim.SGD(model.parameters(), lr=0.1)
for _ in range(500):
    opt.zero_grad()
    logits = model(x).squeeze()
    loss = loss_fn(logits, y)
    loss.backward(); opt.step()
```

- `BCEWithLogitsLoss` nhận *logits* (điểm thô `w·x+b`) và bên trong áp sigmoid. Khớp G2.2 nhưng dùng "with logits" để ổn định số.
- Khi đánh giá: `prob = torch.sigmoid(logits)`; ngưỡng 0.5 → lớp.

**Bước 3 — Diễn giải đầu ra logistic:** `prob` nằm [0,1]; >0.5 gán lớp 1 (trễ), còn lại 0. Càng gần 0 hoặc 1 → tự tin hơn.

**Lỗi thường gặp:** dùng MSE cho logistic (tệ); quên `.squeeze()` để khớp shape; nhầm `BCEWithLogitsLoss` (logits) vs `BCELoss` (prob) — phải đổi đầu vào tương ứng.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống (hand-crafted):** logistic 1 mẫu: x=3, nhãn y=1, model khởi tạo w=0.5, b=0, lr=0.5.

**Bước 1 — Logit:** `z = w·x+b = 0.5×3+0 = 1.5`.

**Bước 2 — Sigmoid (xác suất):** `p = 1/(1+e^(−1.5)) ≈ 1/(1+0.223) ≈ 0.818`.

**Bước 3 — BCE loss:** `−[y·ln(p)] = −ln(0.818) ≈ 0.201`.

**Bước 4 — Gradient (với BCE+sigmoid, đẹp):** gradient theo w ≈ `(p−y)·x = (0.818−1)×3 = −0.546`. Update `w ← 0.5 − 0.5×(−0.546) = 0.5 + 0.273 = 0.773`.

**Bước 5 — Giải thích:** w tăng (vì cần làm logit lớn hơn → p gần 1 với y=1). Sau nhiều bước, w đủ lớn để `sigmoid(w·3)≈1` → xác suất cao xảy ra nhãn 1. Toàn bộ PyTorch autograd làm bước 3–4 tự động; tay tính để hiểu ý nghĩa.

*(Điểm dễ nhầm: gradient đơn giản `(p−y)x` đúng cho BCE+sigmoid; với MSE thì khác — chọn loss theo bài toán.)*

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** dùng ngưỡng tay ("d<5 → không trễ") như G2.1.

| Phương diện | Ngưỡng tay | Học logistic |
|---|---|---|
| Tự tìm ranh giới | do người đặt | học từ dữ liệu |
| Đầu ra xác suất | không | có (sigmoid) |
| Đa đặc trưng | khó | tự nhiên (w·x) |
| Đánh đổi | minh bạch | cần đánh giá + val/test |

**Cải thiện:** tự động, ra xác suất, mở rộng nhiều đặc trưng. **Đánh đổi:** mất tính giải thích tuyệt đối; phải đánh giá kỹ (G2.5/2.7) thay vì tin "máy tự tìm".

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát hai mô hình học đúng quy luật.

1. Hồi quy: tạo `y=2x+1` (như mục 7), chạy, xác nhận `w≈2, b≈1`.
2. Logistic: tạo nhãn tách theo ngưỡng x≈3.5 (nhiễu nhỏ), kiểm `sigmoid` tại những x lớn → gần 1; x nhỏ → gần 0.
3. Nhiễu: thêm nhiễu nhỏ vào y; quan sát model vẫn bắt xu hướng (không ép qua từng điểm) — nền tảng chống overfit (G2.5).

**Ghi nhận:** model không "thuộc từng điểm" mà tìm *xu hướng* — đúng tinh thần học quy luật.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/lin_vs_log.py` (gộp hai mô hình):

```python
import torch, torch.nn as nn, torch.nn.functional as F

# --- hồi quy ---
xr = torch.tensor([[1.],[2.],[3.],[4.]])
yr = 2*xr + 1
mr = nn.Linear(1,1); opt = torch.optim.SGD(mr.parameters(), lr=0.02)
for _ in range(300):
    opt.zero_grad(); F.mse_loss(mr(xr), yr).backward(); opt.step()
print("reg:", round(mr.weight.item(),2), round(mr.bias.item(),2))

# --- logistic ---
xl = torch.tensor([[1.],[2.],[3.],[4.],[5.],[6.]])
yl = torch.tensor([0.,0.,0.,1.,1.,1.])
ml = nn.Linear(1,1); opt = torch.optim.SGD(ml.parameters(), lr=0.1)
for _ in range(500):
    opt.zero_grad(); F.binary_cross_entropy_with_logits(ml(xl).squeeze(), yl).backward(); opt.step()
with torch.no_grad():
    print("log prob at x=1,3,6:", torch.sigmoid(ml(torch.tensor([[1.],[3.],[6.]]))).squeeze().tolist())
```

**Kết quả dự kiến:** hồi quy `w≈2, b≈1`; logistic p tại x=1 nhỏ, x=6 lớn (gần ngưỡng).

**Lỗi thường gặp:** sai hàm loss (MSE cho logistic); shape cho BCE (`squeeze`); quên `.no_grad()` khi đánh giá.

**Chú thích trung thực:** dữ liệu đơn giản, không nhiễu, minh họa cơ chế — không phải đánh giá trên dữ liệu thật.

---

## 12. Đánh giá

**Chỉ số:** hồi quy học ra đúng `w,b` (so với quy luật biết trước); logistic cho xác suất tăng đúng hướng theo x; loss giảm qua epoch.

**Vì sao chọn:** quy luật biết trước cho ta *ground truth* để xác nhận model học đúng thuật toán (giống G1.4). Chỉ số rõ: khớp tham số và hướng xác suất.

**Chỉ số không thể hiện:** chất lượng trên dữ liệu thật (nhiễu, nhiều đặc trưng) không được chứng minh — cần val/test và chỉ số G2.7. Đây là minh họa cơ chế, không phải đánh giá model thực dụng.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Logistic là 'hồi quy cho vừa phân loại'." — Thực chất nó là *phân loại* được đóng khung là "dự đoán xác suất". Tên "logistic regression" gây hiểu lầm; nó đầu ra xác suất 0–1, không ra số liên tục.
- **Hiểu lầm 2:** "Xác suất logistic là 'xác suất thật tuyệt đối'." — Nó phụ thuộc: model tuyến tính vẫn hạn chế (chỉ tách bằng mặt phẳng/phân phối giả định). Nếu dữ liệu không chia tuyến tính, "xác suất" đó không chuẩn. Là xác suất của *mô hình đang dùng*, chưa phải chân lý.
- **Hiểu lầm 3:** "Sigmoid 'tự' tạo ranh giới tốt." — Không; nó chỉ là hàm nén. Ranh giới do `w` học được. Nếu dữ liệu không tách được bằng đường/plane, logistic thất bại (cần nơ-ron phi tuyến, G3).
- **Giới hạn:** model tuyến tính giới hạn đường/plane; nhiều bài toán thật cần phi tuyến → G3.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt đầu ra của hồi quy (số) và logistic (0–1/xác suất).
2. `sigmoid(z)` làm gì và tại sao cho z rất lớn/dương về gần 1?
3. Với logistic, ngưỡng 0.5 dùng để làm gì?

### Luyện tập (sửa đổi / mở rộng)
4. Thêm nhiễu vào dữ liệu hồi quy (`yr = 2*xr+1 + 0.3*randn`), chạy, nhận xét w,b có còn gần 2,1 không.
5. Đổi dữ liệu logistic `x` thành 1 đặc trưng khác thang (×10). Chạy; với lr nhỏ, hội tụ chậm? Giải thích vì sao (cần chuẩn hóa G1.3 hoặc giảm lr).
6. Với logistic, thử `prob` tại x giữa ranh giới — gần 0.5 (không chắc) — giải thích.

### Thử thách (thiết kế / liên hệ)
7. Giải thích: vì sao "chỉ dùng MSE cho mọi thứ" là tệ, và khi nào nên dùng BCE với logistic. (nối G2.2)
8. (FL liên hệ) Mỗi client có dữ liệu nhãn của riêng họ; hồi quy logistic mỗi client sẽ hội tụ khác nhau. Giải thích khái niệm "client drift" (trôi client) và vì sao trung bình tham số client có thể khác model trung tâm trên dữ liệu gom sạch. *(mở đầu G6.)*

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Hồi quy ra số liên tục; logistic ra xác suất [0,1].
2. `sigmoid(z)=1/(1+e^−z)`: z→+∞ thì e^−z→0, p→1; z→−∞ thì p→0; z=0 thì 0.5. Nén mọi điểm thô về (0,1).
3. Quyết định lớp: p≥0.5 → lớp 1 (trễ), còn lại 0. Ngưỡng có thể thay đổi theo chi phí sai (G2.7).
4. Vẫn gần 2,1 nhưng méo chút do nhiễu — model tìm xu hướng, không ép qua điểm (khớp ý G2.5 tại sao không overfit chút nhiễu).
5. Với x lớn (×10), logit `w·x` lớn → sigmoid bão hòa → gradient nhỏ → hội tụ chậm. Cần chuẩn hóa đặc trưng (G1.3) hoặc lr nhỏ.
6. Tại ranh giới, p≈0.5 nghĩa model "không chắc" — hữu ích khi muốn độ không chắc chắn (chứ không chỉ lớp).
7. MSE phạt lệch tuyệt đối, không tối ưu xác suất cho phân loại; BCE khớp với sigmoid, gradient tốt, tối đa khả năng nhãn đúng. Chọn loss theo loại đầu ra.
8. Vì mỗi client học trên phân phối riêng, tham số hội tụ về điểm khác nhau ("client drift"); trung bình cộng tham số (FedAvg) có thể lệch khỏi mô hình tối ưu trên dữ liệu gom chung vì bề mặt loss không phải "lồi trung bình". Đây là cốt lõi khó khăn của FL — sẽ học G6.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Hồi quy tuyến tính** → đầu ra số (thời gian, giá); dùng **MSE**.
2. **Hồi quy logistic** → đầu ra xác suất [0,1] qua **sigmoid**; dùng Binary Cross-Entropy; dùng cho phân loại 2 lớp.
3. Cả hai đều là `w·x+b`, chỉ khác "hàm nén đầu ra" + loss.
4. Sigmoid nén điểm số thô về (0,1), đủ trơn cho gradient descent.
5. Đây là "bước đệm" của mạng nơ-ron (G3 = nhiều lớp linear/logistic + activation phi tuyến).

**Tự kiểm tra:**
- Khi nào dùng MSE, khi nào dùng BCE?
- `sigmoid` biến logit thành gì, và ngưỡng dùng thế nào?
- Vì sao logistic vẫn bị giới hạn với dữ liệu không tách tuyến tính?
- Nêu một kết nối giữa bài toán phân loại logistic và khó khăn của FL (client drift).

---

## 16. Đọc sâu bằng trực giác — sigmoid là chiếc cầu từ điểm số sang xác suất

Một bác sĩ không nói "bệnh nhân được 3,7 điểm nguy cơ" mà cần một con số diễn giải được: 20% hay 80%. Hồi quy tuyến tính cho điểm số vô hạn; logistic bọc điểm số đó qua sigmoid để ra xác suất trong khoảng 0–1.

| Thành phần | Ý nghĩa | Điều dễ nhầm |
|---|---|---|
| Logit `z=w·x+b` | Điểm bằng chứng thô, có thể âm/dương | Tưởng `z` đã là xác suất |
| `p=σ(z)` | Xác suất dự đoán lớp 1 | Tưởng `p` tuyến tính theo `x` |
| Ngưỡng | Cắt `p` thành nhãn 0/1 | Mặc định 0,5 trong mọi bài toán |

**Đọc thành lời:** `σ(z)=1/(1+e^{−z})` nhận mọi số thực và trả về số trong `(0,1)`. Khi `z=0`, xác suất là 0,5; `z` càng dương thì `p` càng gần 1; `z` càng âm thì `p` càng gần 0. Điều dễ đọc sai là coi ngưỡng 0,5 là chân lý; ngưỡng phải chọn theo chi phí bỏ sót và báo nhầm.

**Tính tay:** `σ(0)=1/(1+1)=0,5`. Với `z=2`, `e^{−2}≈0,1353`, nên `σ(2)=1/1,1353≈0,881`. Với `z=−2` thì `σ(−2)≈0,119`; hai giá trị đối xứng qua 0,5. Điểm quyết định vẫn là dấu và độ lớn của `w·x+b`, không phải xác suất tự thân.

**Phản ví dụ:** dùng hồi quy tuyến tính cho nhãn 0/1 có thể dự đoán `−0,4` hoặc `1,3`, không diễn giải được là xác suất. Ngược lại, thấy `p=0,52` rồi kết luận "chắc chắn lớp 1" là bỏ qua rằng mô hình chỉ hơn ngưỡng 0,02; độ bất định còn lớn và ngưỡng khác có thể đổi nhãn.

**Giới hạn:** logistic vẫn chỉ tạo biên quyết định tuyến tính trong không gian đặc trưng. Dữ liệu hình chữ X, vòng tròn bao vòng tròn hay tương tác phi tuyến cần đặc trưng mới hoặc mô hình phi tuyến. Xác suất cũng chưa chắc được hiệu chỉnh: điểm số xếp hạng tốt không bảo đảm `p=0,8` đúng 80% trường hợp.

:::interactive sigmoid
:::

:::quiz
Với logit `z=2`, xác suất `σ(z)` xấp xỉ bao nhiêu?
A. 0,881
B. 0,500
C. 0,119
Đáp án: A
Giải thích: `σ(2)=1/(1+e^{−2})≈1/1,1353≈0,881`. Chọn B là giá trị tại `z=0`; chọn C là `σ(−2)`, nhầm dấu.
:::

**Tự thử thêm:** giải phương trình `σ(z)=0,75` để tìm logit tương ứng. Sau đó cho biết đổi ngưỡng từ 0,5 xuống 0,3 sẽ làm tăng hay giảm số dự đoán lớp 1, và đánh đổi gì.

:::goi-y
Từ `p=1/(1+e^{−z})`, suy ra `e^{−z}=(1−p)/p`, rồi lấy log tự nhiên. Ngưỡng thấp hơn nghĩa là dễ gán lớp 1 hơn.
:::

:::loi-giai
Với `p=0,75`, `(1−p)/p=1/3`, nên `e^{−z}=1/3` và `z=ln3≈1,099`. Hạ ngưỡng xuống 0,3 làm tăng dự đoán lớp 1: giảm bỏ sót nhưng tăng báo nhầm; lựa chọn phụ thuộc chi phí hai loại lỗi.
:::