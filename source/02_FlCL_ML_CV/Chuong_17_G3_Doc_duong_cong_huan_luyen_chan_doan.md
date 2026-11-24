# Chương 3.7 — Đọc đường cong huấn luyện & chẩn đoán các trường hợp model không học (Giai đoạn 3)

> **Câu hỏi trọng tâm:** *Khi loss không giảm như mong đợi, làm sao đọc "đường cong" để xác định đúng nguyên nhân — thay vì đoán mò?*

---

## 1. Vị trí trong lộ trình

Đã có mạng, optimizer, chuẩn hóa. Giờ là kỹ năng tổng hợp của G3: **biết đọc đồ thị loss/accuracy quá trình huấn luyện** và **chẩn đoán** "model không học / học kém". Đây là "bác sĩ chuẩn đoán" của mọi thí nghiệm về sau (G4–G9), và cực kỳ quan trọng trong FL/CL khi phải đọc nhiều đường cong từ nhiều client/task.

Nó **nối** toàn G1–G3 (loop, loss, overfit, lr) và **chuẩn bị** cho mọi giai đoạn còn lại.

---

## 2. Kiến thức cần dùng

- Loop huấn luyện (G1.4), overfit/bias–variance (G2.5), lr (G3.5), chuẩn hóa/norm (G3.6).

**Ôn nhanh:** đọc 2 đường: `train_loss` và `val_loss` theo epoch (G2.3). Các "dấu hiệu bệnh lý": val tăng khi train giảm = overfit; cả hai cao = underfit.

---

## 3. Câu chuyện mở đầu

Mô hình của Lan không cải thiện. Cô kiểu "mò" đổi lung tung lr, thêm tầng — không có hệ thống. Một người có kinh nghiệm hỏi: *"Đường cong val_loss của bạn trông thế nào? Loss giảm mà val tăng là dấu overfit. Loss bằng phẳng cao là dấu underfit. Loss NaN là lr to. Loss giảm rất chậm góc dốc phẳng là lr nhỏ."*

Lan nhận ra: **đồ thị loss/accuracy là "điện tâm đồ" của mô hình.** Mỗi hình dạng kể một câu chuyện cụ thể; đọc đúng sẽ biết hành động (tăng dữ liệu, giảm lr, tăng model, thêm drop, fix bug). Chương này lập "bảng triệu chứng" để bạn chẩn đoán có hệ thống, không mồm mò.

---

## 4. Câu hỏi trọng tâm

**Các dạng đường cong loss/accuracy báo hiệu tình trạng gì, và quy trình chẩn đoán "model không học" chuẩn là gì?**

---

## 5. Trực giác

Hãy nghĩ việc ghi lại nhiệt độ khi điều trị bệnh. Nếu nhiệt độ không giảm, bác sĩ nhìn toàn bộ diễn biến (đường cong) để biết: sốt cao hãm bằng phẳng (thuốc không hiệu quả?), thụt xuống rồi lại nhửi (tái phát?), xuống quá nhanh rồi tệ đi (thuốc sai?). Tương tự, **loss theo epoch là "hồ sơ nhiệt độ" của quá trình huấn luyện** — đọc biểu đồ thay vì chỉ nhìn con số cuối.

**Các "triệu chứng" kinh điển (train/val):**
1. **loss NaN / tăng vọt** → lr quá lớn (phân kỳ, G3.5), hoặc dữ liệu/khởi tạo lỗi.
2. **loss bằng phẳng cao (cả train & val)** → **underfit** (G2.5): model quá nhỏ hoặc khởi tạo không phù hợp, cần nhiều năng lực hoặc lr phù hợp.
3. **train giảm, val tăng** → **overfit** (G2.5): cần regularization/data/dừng sớm.
4. **cả hai giảm chậm, góc phẳng** → lr quá nhỏ (bước nhỏ, chậm hội tụ).
5. **loss giảm rồi "nước rút" phẳng** → lr lớn vừa nhưng cần scheduler/giảm lr về cuối, hoặc reached thung lũng (cực tiểu địa phương).
6. **val cao hẳn train từ đầu** → có thể rò rỉ data pipeline chia tập (G2.3/G2.8) hoặc sự khác biệt phân phối train–val.

**Phép so sánh "hồ sơ nhiệt độ":** trực quan. **Giới hạn:** không phải mọi trường hợp đều lọt một "hộp" đơn; nhiều tình trạng chồng nhau. Nhưng bảng triệu chứng cho hướng kiểm đầu tiên rất mạnh.

---

## 6. Từ trực giác đến mô hình

- **Tín hiệu:** dãy `train_loss`, `val_loss`, `train_acc`, `val_acc` theo epoch.
- **Mô hình** (mô hình chẩn đoán): đối chiếu hình dạng với bảng triệu chứng.
- **Hành động:** thay đổi lr / năng lực model / regularization / dữ liệu / khắc phục bug.
- **Mục tiêu:** biến "mò" thành "đoán có căn cứ + kiểm".

**Thuật toán chẩn đoán:**
```
1. In loss & acc train/val mỗi epoch (không chỉ cuối).
2. Nhìn 3 đặc trưng: (a) loss có giảm? (b) chênh train-val? (c) giảm nhanh/chậm?
3. Ghép với bảng triệu chứng → giả thuyết.
4. Sửa một biến/số lần, quan sát lại.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Thiết lập log đầy đủ.** In `train_loss`, `val_loss`, `train_acc`, `val_acc` mỗi epoch (không chỉ cuối) để nhìn hình dạng.

**Bước 2 — Hai đường chính: loss và accuracy.** Loss biến thiên mượt hơn (thường dùng để đọc hội tụ); accuracy trực quan hơn nhưng nhẹ răng (đồng). Đọc cả hai.

**Bước 3 — Phân loại hành vi.** Dùng bảng:
- Không giảm chút nào + NaN → lr to / dữ liệu lỗi.
- Flatten cao → underfit → tăng năng lực (rộng/sâu/more features), chuẩn hóa dữ liệu tốt.
- Train giảm, val tăng → overfit → thêm regularize/drop, tăng dữ liệu, dừng sớm.
- Giảm chậm phẳng → lr nhỏ → tăng lr (hoặc dùng scheduler).

**Bước 4 — Kiểm một lần mỗi thay đổi.** Thay đổi một điều mỗi lần, quan sát val, không đổi nhiều cùng lúc (tránh không biết cái nào làm hiệu quả).

**Lỗi thường gặp:** chỉ in loss cuối epoch (bỏ sót hình dạng sớm); không in val (chỉ nhìn train — bỏ qua overfit); đổi quá nhiều thứ cùng lúc và không rõ nguyên nhân.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** chuỗi val_loss theo epoch:

```
epoch 1: 2.00
epoch 5: 1.20
epoch 10: 0.85
epoch 15: 0.70
epoch 20: 0.65   ← val thấp nhất
epoch 25: 0.68   ← bắt đầu tăng
epoch 30: 0.74   ← tăng rõ
```

**Bước 1 — Đọc:** val giảm tới epoch ~20 rồi tăng → giống **overfit** (cần xác nhận train_loss tiếp tục giảm).

**Bước 2 — Kết luận:** sau epoch 20, model "thuộc lòng" train → dừng sớm tại ~20, hoặc thêm regularization để ep-va-lách thêm.

**Bước 3 — Contrast với underfit:** nếu val ổn định cao ~1.9 từ đầu → underfit → tăng năng lực.

**Bước 4 — Nối FL:** trong FL, bạn theo dõi nhiều đường (từng client + trung bình); một client val tăng có thể báo hiệu drift/overfit cục bộ — sẽ gặp G6.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ nhìn loss cuối cùng (con số) để đánh giá.

| Phương diện | Chỉ loss cuối | Đọc toàn đường cong |
|---|---|---|
| Phát hiện overfit | muộn/khó | rõ qua val tăng ở sau |
| Biết lr sai | không | NaN/đường phẳng |
| Biết dừng sớm | không | chỗ val cực tiểu |
| Đánh đổi | đơn giản | cần log đủ mỗi epoch |

**Cải thiện:** chẩn đoán đúng, biết dừng sớm. **Đánh đổi:** cần in/log mỗi epoch (chút chi phí, đáng).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** tạo và quan sát 3 dạng bệnh lý.

1. **Underfit:** cố ý dùng model quá nhỏ trên dữ liệu phức tạp → quan sát val cao bằng phẳng.
2. **Overfit:** dùng model lớn trên dữ liệu ít, huấn luyện lâu → val giảm rồi tăng.
3. **lr lớn:** đặt lr quá to → loss NaN/tăng.
Vẽ cả 3, dán-label và đối chiếu bảng triệu chứng.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch (+ matplotlib để vẽ).

**Cấu trúc:** `scripts/curves_demo.py` — log & vẽ train/val loss:

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

torch.manual_seed(0)
x = torch.randn(400, 8); y = (x[:,0] + 0.5*x[:,1] - 0.2*x[:,2] > 0).long()
tr = TensorDataset(x[:300], y[:300]); va = TensorDataset(x[300:], y[300:])
trl = DataLoader(tr, batch_size=32, shuffle=True); val = DataLoader(va, batch_size=64)

model = nn.Sequential(nn.Linear(8, 8), nn.ReLU(), nn.Linear(8, 2))
opt = torch.optim.Adam(model.parameters(), lr=0.01)
tr_loss, va_loss = [], []
for ep in range(120):
    model.train(); t = 0.; n = 0
    for xb, yb in trl:
        opt.zero_grad(); l = F.cross_entropy(model(xb), yb); l.backward(); opt.step()
        t += l.item()*yb.size(0); n += yb.size(0)
    tr_loss.append(t/n)
    model.eval(); v=0.; nv=0
    with torch.no_grad():
        for xb, yb in val:
            v += F.cross_entropy(model(xb), yb).item()*yb.size(0); nv += yb.size(0)
    va_loss.append(v/nv)

plt.plot(tr_loss, label="train"); plt.plot(va_loss, label="val"); plt.legend(); plt.show()
```

**Kết quả dự kiến:** thấy đường train giảm, val giảm rồi có thể tăng nhẹ (overfit nhẹ). Đây là "điện tâm đồ" để đọc.

**Lỗi thường gặp:** quên model.eval()/no_grad khi tính val; quên .item() gây tensor leak.

**Chú thích trung thực:** dữ liệu đơn giản → overfit không cực đoan; mục đích tạo kỹ năng đọc, không phải buộc thấy bệnh nặng. Để thấy overfit rõ, dùng model rộng/dữ liệu ít.

---

## 12. Đánh giá

**Chỉ số:** biết lập log train/val mỗi epoch; đọc đúng 3+ dạng (underfit/overfit/lr to); đưa ra hành động đúng cho từng dạng; hiểu val là "la bàn".

**Vì sao chọn:** kỹ năng "đọc và hành động" quyết định năng suất thí nghiệm — không lãng phí thời mò.

**Chỉ số không thể hiện:** không phủ toàn bộ quá trình debug (data bug, architecture bug); những cái đó thuộc G2.8/G4. Chương này là "bảng triệu chứng" nền.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Loss train cao là model tệ." — Phải xem mối quan hệ train–val; high-cả-hai = underfit; low-train/high-val = overfit. Chỉ một con không kết luận.
- **Hiểu lầm 2:** "Val tăng là luôn overfit." — Có thể do rò rỉ pipeline, do val quá nhỏ (dao động), hoặc lr quá to (val dao động loạn). Phân biệt bằng: val "tăng dần đều sau ổn định" (overfit) vs "dao động mạnh" (val nhỏ/lr to). Xem cả hình dạng.
- **Hiểu lầm 3:** "Đường loss giảm nhanh = model tốt." — Chưa chắc; có thể vẫn overfit nặng. Giảm trên train nhanh nhưng val tăng — xem val.
- **Giới hạn:** có những hiện tượng (double descent, loss spikes khi lr scheduler, non-monotonic) phức tạp hơn; chương này cho nền vững. Trong FL/CL, "đọc nhiều đường + chẩn đoán theo client/task" là chủ đề G6/G7.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Mỗi hình dạng sau báo hiệu gì: (a) train giảm val tăng; (b) cả hai cao bằng phẳng; (c) loss NaN sớm; (d) giảm chậm phẳng?
2. Vì sao phải in loss mỗi epoch (không chỉ cuối)?

### Luyện tập (sửa đổi / mở rộng)
3. Trong curves_demo, đổi model thành `nn.Linear(8,2)` (không ReLU) → quan sát underfit trên dữ liệu phi tuyến nhẹ. Ghi nhận.
4. Đổi lr=1.0 → thấy NaN/loạn. Ghi nhận dấu hiệu.
5. Tăng dữ liệu gấp 3 lần → val ổn định hơn? Giải thích.

### Thử thách (thiết kế / liên hệ)
6. Trong FL, bạn thấy: client A val tốt, client B val tăng dần qua các round. Giải thích có thể do gì (nối G6: non-IID, client drift) và cách kiểm.
7. Trong CL (G7), vì sao "chỉ nhìn accuracy task mới" là thiếu — bạn nên vẽ đường gì để thấy forgetting của task cũ theo thời gian?

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. (a) overfit; (b) underfit; (c) lr quá to/dữ liệu lỗi (phân kỳ); (d) lr nhỏ (hội tụ chậm).
2. Để nhìn "hình dạng" diễn biến — phát hiện overfit/val tăng/dừng sớm mà con số cuối không lộ ra.
3. Linear đơn → không học phi tuyến → val cao bằng phẳng (underfit). So với MLP có ReLU.
4. lr lớn → loss NaN/tăng vọt — phân kỳ (G3.5).
5. Nhiều dữ liệu → giảm overfit (G2.5), val ổn hơn, bắt quy luật tốt.
6. Client B phân phối khác (non-IID) hoặc model trôi theo hướng có lợi client khác → client B bắt đầu overfit/sai. Kiểm bằng xem accuracy/confusion theo từng client, so filt với toàn cục. (G6.)
7. Chỉ accuracy task mới có thể cao trong khi task cũ "mất" (forgetting). Cần vẽ accuracy/backward-transfer của *từng task* theo thời gian (sau mỗi task học mới) — bạn sẽ thấy đường task cũ giảm → forgetting. Đây là cách đánh giá CL (G7.6).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Đồ thị **train/val loss theo epoch** là "điện tâm đồ" của model — nhìn hình dạng, không chỉ con số cuối.
2. **NaN/loạn** → lr to; **flatten cao** → underfit; **train giảm/val tăng** → overfit; **giảm chậm** → lr nhỏ.
3. Quan sát **val** là la bàn (không dùng train để kết luận).
4. Chỉ đổi **một biến mỗi lần** khi chẩn đoán, quan sát val.
5. Trong FL/CL, đọc **nhiều đường theo client/task** (drift, forgetting) — mở đầu G6/G7.

**Tự kiểm tra:**
- Kể 4 "triệu chứng" trên đường cong và hành động tương ứng.
- Vì sao in loss mỗi epoch?
- Khi model không giảm, kiểm thứ tự nào (lr → underfit → bug)?
- Liên hệ đọc đường cong để thấy forgetting trong CL.

## 16. Đọc sâu bằng trực giác — hai đồng hồ đo trong cùng một căn phòng

Một người thợ đặt hai nhiệt kế ở hai góc xưởng rồi so số đọc mỗi buổi sáng.
Nếu chiếc này luôn cao hơn chiếc kia 0,4 độ, anh chưa kết luận là xưởng đang nóng lên; anh xem hai kim cùng đi lên hay một kim đứng yên.
Đường train và val cũng là hai đồng hồ như vậy: điều đáng đọc là chênh lệch và hướng đi của chúng theo thời gian, không phải một con số ở epoch cuối.

| Tình huống | Vai trò của toán | Câu hỏi thực tế |
|---|---|---|
| Đồng hồ đặt trên bàn làm việc | Train loss đo trên dữ liệu đã thấy | Đường này còn giảm vì học hay vì thuộc bài? |
| Đồng hồ ngoài hành lang | Val loss đo trên dữ liệu chưa thấy | Đường này đổi hướng ở epoch nào? |
| Chênh lệch hai kim | Hiệu `val − train` và xu hướng của hiệu | Khoảng cách đang nới ra hay thu lại? |

**Đọc thành lời:** `gap = L_val − L_train` là khoảng cách giữa hai đường; `gap` dương nghĩa là mô hình làm tốt hơn trên dữ liệu đã thấy, nhưng bản thân dấu dương không phải bằng chứng overfit. Điều dễ đọc sai là quên hai đường được đo trong hai chế độ khác nhau: `train` chạy khi Dropout còn bật và BatchNorm dùng thống kê lô, còn `val` chạy ở `eval()` với Dropout tắt và running statistics. Vì thế một phần của `gap` đến từ cách đo, không từ mô hình. Cũng dễ sai khi so sánh `gap` giữa các lần chạy có batch size khác nhau, vì độ nhiễu của train loss đổi theo batch.

**Tính tay:** Ở epoch 10, `L_train = 0,10` và `L_val = 0,50`, nên `gap = 0,40` và `L_val / L_train = 5`. Sang epoch 11, `L_train = 0,08`, `L_val = 0,62`: `gap = 0,54`, tỉ lệ `7,75`. Cả hiệu và tỉ lệ đều nới ra, đó mới là dấu hiệu đáng lo. Ngược lại, một mô hình có `L_train = 0,72`, `L_val = 0,76` chỉ lệch `0,04` nhưng cả hai đều cao: `gap` nhỏ ở đây là dấu underfit, không phải "tổng quát tốt".

**Phản ví dụ:** Ba epoch cuối cho `val = 0,52; 0,55; 0,51` trong khi `train` giảm đều, và bạn kết luận ngay là overfit rồi cắt bớt mô hình. Sai vì biên độ dao động chỉ 0,04, không đơn điệu, rất có thể do `lr = 0,5` đang nhảy qua lại quanh cực tiểu hoặc do tập val nhỏ. Kết quả đúng: hạ lr, chạy lại vài seed rồi vẽ đường trung bình; chỉ khi val tăng đơn điệu qua nhiều epoch trong lúc train vẫn giảm mới kết luận overfit.

**Giới hạn:** Một đường cong của một seed không đủ để chẩn đoán; val nhỏ làm nhiễu, và chọn epoch theo val rồi báo chính val đó là con số lạc quan — cần test riêng. Đường loss cũng không nói nguyên nhân: val tăng có thể do phân phối val khác, do nhãn val sai, hoặc do lr, chứ không chỉ do overfit. Kết luận "mô hình tốt" không được bảo đảm bởi bất kỳ hình dạng đẹp nào của hai đường.

:::interactive curves
:::

:::quiz
Một epoch có `L_train = 0,12` và `L_val = 0,48`. Khoảng cách `val − train` bằng bao nhiêu?
A. 0,36
B. 0,40
C. 4,0
Đáp án: A
Giải thích: `0,48 − 0,12 = 0,36`. Tỉ lệ `0,48/0,12 = 4` là một đại lượng khác; không được lấy tỉ lệ thay cho hiệu.
:::

**Tự thử thêm:** Ba epoch liên tiếp có `train = [0,40; 0,38; 0,37]` và `val = [0,60; 0,64; 0,58]`. Tính `gap` từng epoch và `gap` trung bình, rồi cho biết dữ liệu này đã đủ kết luận overfit chưa.

:::goi-y
Hãy tính ba hiệu riêng lẻ trước, rồi tự hỏi dãy hiệu đó có tăng đơn điệu không. Một epoch val giảm xuống giữa hai epoch tăng làm thay đổi cách đọc.
:::

:::loi-giai
`gap` lần lượt là `0,60 − 0,40 = 0,20`; `0,64 − 0,38 = 0,26`; `0,58 − 0,37 = 0,21`. Trung bình `(0,20 + 0,26 + 0,21)/3 ≈ 0,223`. Dãy này nới ra rồi thu lại, không đơn điệu, nên chưa đủ kết luận overfit; cần thêm epoch, thêm seed và kiểm lr trước khi đổi kích thước mô hình.
:::