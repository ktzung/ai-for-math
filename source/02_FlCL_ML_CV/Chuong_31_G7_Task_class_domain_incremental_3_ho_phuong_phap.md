# Chương 7.3–7.4 — Task / Class / Domain-incremental, và ba họ phương pháp CL: rehearsal, regularization, kiến trúc (Giai đoạn 7)

> **Câu hỏi trọng tâm:** *Có ba "cấu hình" khác nhau của CL (task, class, domain) — và ba gia đình phương pháp (rehearsal, regularization, architecture) giảm forgetting theo cơ chế nào?*

---

## 1. Vị trí trong lộ trình

Đã hiểu vì sao quên (G7.1–2). Giờ định nghĩa **các biến thể cấu hình** (task/class/domain-incremental — thường bị nhầm) và **ba họ phương pháp** giảm forgetting. Đây là phần "bản đồ trị liệu" của CL, và là nền để đọc mọi paper CL (chúng thuộc một trong ba họ).

---

## 2. Kiến thức cần dùng

- Forgetting (G7.2), đánh giá (G2.7), end-task ngữ cảnh, FL non-IID (G6.5).

**Ôn nhanh:** "task" trong CL = một khối dữ liệu/nhiệm vụ đến một lúc (có id/ngữ cảnh); "class" = các lớp nhãn; "domain" = miền dữ liệu.

---

## 3. Câu chuyện mở đầu

Lan bắt gặp các paper CL dùng thuật ngữ khó phân biệt: *task-incremental*, *class-incremental*, *domain-incremental*. Cô và đồng nghiệp đã từng nhầm — và nhầm dẫn đến đo sai, báo cáo sai accuracy. Cô tìm ra: khác nhau ở *chuyện gì thay đổi giữa các giai đoạn* và *mô hình có được "biết" task đang xử lý khi test không*:

- **Task-incremental (TIL):** đến task mới thì *ngữ cảnh/task id* được biết khi test → model chỉ cần phân đúng trong một task (head per-task). Dễ nhất.
- **Class-incremental (CIL):** các lớp mới thêm dần, và **khi test không biết task** → model phải phân biệt trên *toàn bộ lớp đã gặp*. Khó nhất.
- **Domain-incremental (DIL):** cùng nhãn/task nhưng *miền dữ liệu* đổi (sáng/tối, thiết bị khác) → học miền mới không mất nhãn.

Cô cũng đọc được **ba họ phương pháp** (frameworks) giảm forgetting, mỗi họ một cơ chế:
- **Rehearsal (tái phát dữ liệu):** giữ một phần mẫu cũ (replay buffer) rồi "ôn lại" khi học mới — nhớ cũ bằng cách nhìn lại.
- **Regularization (điều tiết):** thêm phạt để trọng số/biểu diễn cũ không đổi nhiều khi học mới (gần giống FedProx trong FL, G8).
- **Kiến trúc (architecture):** tách vùng tham số cho từng task (hoặc thêm head/module) để task mới không ghi đè vùng cũ.

---

## 4. Câu hỏi trọng tâm

**Ba cấu hình TIL/CIL/DIL khác nhau thế nào (và vì sao độ khó khác), và ba họ phương pháp (rehearsal, regularization, architecture) giảm forgetting ra sao?**

---

## 5. Trực giác

**Ba cấu hình — cái gì đổi, model có biết task không:**
- **TIL:** cái đổi = tập nhãn mới; test **biết** task (VD biết trước "đây ảnh task 2") → chỉ phân biệt các lớp *trong task đó* → nhẹ (vì giảm được không gian nhãn).
- **CIL:** cái đổi = lớp mới thêm; test **không biết** task → phải phân giữa *tất cả lớp đã gặp* → khó (head mở rộng), dễ "trộn lớp cũ-mới".
- **DIL:** cái đổi = miền dữ liệu (phân phối thay đổi) nhưng nhãn giữ nguyên → model học miền mới không mất khả năng miền cũ.

Độ khó leo: TIL < DIL < CIL (thường nghĩ vậy — CIL khó nhất vì không có task boundary ở test). Nhầm lẫn giữa 3 loại dẫn đo sai.

**Ba họ phương pháp — cơ chế "nhớ":**
- **Rehearsal:** giữ bộ đệm mẫu cũ (bộ nhớ giới hạn), mỗi lần học mới chen vài mẫu cũ vào → model "thấy lại" dữ liệu cũ rải rác. Trực quan: như ôn lại bài cũ trong lúc học bài mới. (Chi phí: bộ nhớ; vấn đề privacy khi giữ mẫu — FL/CL kết hợp G8.)
- **Regularization:** thêm vào loss một khoản phạt giữ việc trọng số/biểu diễn không rời xa giá trị cũ hoặc giữ importance các tham số nền (VD EWC: phạt nặng tham số quan trọng cũ). Không cần lưu mẫu, nhưng tinh chỉnh/khớp khó và có thể không đủ mạnh.
- **Kiến trúc (architecture):** phân tách tham số — thêm head per-task (task-conditional), thêm module mới cho task mới, mask tham số (packnet/PGNN...). Tránh ghi đè nhưng model lớn dần và cần biết task (phù hợp TIL).

**Phép so sánh ba họ: rehearsal = "ôn lại bài cũ"; regularization = "đừng tẩy giấy ghi quan trọng"; architecture = "thêm ngăn kéo mới, không đụng ngăn cũ":** trực quan. **Giới hạn:** các họ không loại trừ (có method kết hợp); mỗi họ có đánh đổi (bộ nhớ/privacy; điều chỉnh khó; model to/biết task). Không có "họ thắng tuyệt đối" — tùy setup (CIL vs TIL) và ràng buộc.

---

## 6. Từ trực giác đến mô hình

- **Cấu hình:**
  - TIL: model có (đầu vào task id / head per-task); nhãn đầy đủ trong task.
  - CIL: model không biết task; `num_classes` tăng dần.
  - DIL: miền đổi, nhãn giữ.
- **Phương pháp:**
  - Rehearsal: buffer + mix mẫu cũ.
  - Regularization: phạt (`EWC`: Fisher-khối lượng; hoặc L2 gần giá trị cũ).
  - Architecture: head/add module per task.

**Thuật toán (minh hoạ replay — rehearsal):**
```
Mỗi task mới:
1. Học trên dữ liệu mới + nhiều mẫu từ buffer cũ (replay).
2. Cập nhật buffer (giữ mẫu đại diện — random/herding).
3. Đánh giá mọi task (đo forgetting, G7.2).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Nắm cấu hình (chọn đúng để đo).** Trước khi làm thí nghiệm phải rõ: TIL (biết task khi test) hay CIL (không biết)? Điều này quyết định cách đánh giá (G7.6).

**Bước 2 — Rehearsal cơ bản (replay buffer).**

```python
# buffer: giữ N mẫu ngẫu nhiên của các task trước
def train_with_replay(model, task_dl, buffer, opt, epochs):
    for _ in range(epochs):
        for xb, yb in task_dl:               # dữ liệu task mới
            train_step(model, xb, yb, opt)
        if len(buffer) > 0:
            for xb, yb in sample(buffer, batch):     # ôn mẫu cũ
                train_step(model, xb, yb, opt)
```

**Bước 3 — Regularization cơ bản (phạt rời xa giá trị cũ sau mỗi task).**

```python
# sau khi xong task cũ, lưu theta_star và importance
# loss += lambda * sum(importance_i * (theta_i - theta_star_i)^2)   (EWC-like)
```

**Bước 4 — Architecture cơ bản (xem khái niệm):** thêm head mới cho task mới (TIL) hoặc mask tham số — không triển khai đầy đủ ở đây.

**Lỗi thường gặp:** nhầm cấu hình (đánh giá CIL như TIL nâng accuracy ảo); buffer quá ít → replay yếu; regularization quá mạnh → không học mới (over-regularization dưới-khớp task mới); architecture cần biết task mà quên giả định.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 3 họ trên cùng tập 3 task, đo "final avg accuracy" + "forgetting":

| Phương pháp | Accuracy (avg cuối) | Forgetting | Note |
|---|---|---|---|
| Naive | 0.45 | 0.35 | quên nặng |
| Regularization (EWC) | 0.62 | 0.18 | giữ cũ hơn |
| Rehearsal (buffer 500) | 0.70 | 0.08 | nhớ tốt (giá bộ nhớ) |
| Rehearsal (buffer 50) | 0.60 | 0.20 | bộ nhớ ít → yếu |
| Architecture (head per-task, TIL) | 0.78 | 0.03 | mạnh nhưng cần task id/biết task |

**Bước 1 — Đọc:** rehearsal/architecture giữ tốt (forgetting thấp) nhưng giá (bộ nhớ/privacy / task id). Regularization trung bình. Naive tệ.

**Bước 2 — Không "thắng tuyệt đối":** architecture cao nhất nhưng TIL-only (cần task), không dùng được CIL "không biết task". Rehearsal tốt nhưng cần giữ mẫu (vấn đề privacy/quy mô). Chọn theo ràng buộc.

**Bước 3 — Bài học:** bảng minh hoạ đánh đổi; đọc paper CL phải để ý họ + cấu hình (họ đạt số ấn tượng vì TIL).

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** naive (chỉ học task mới).

| Phương diện | Naive | Rehearsal | Reg | Arch |
|---|---|---|---|---|
| Forgetting | cao | thấp | vừa | rất thấp |
| Bộ nhớ mẫu cũ | không | có (buffer) | không | không |
| Điều chỉnh/khớp | — | dễ | khó (chọn lambda) | dễ (module mới) |
| Cần biết task (test) | — | không | không | **thường có** (TIL) |
| Đánh đổi | đơn giản | bộ nhớ/privacy | điều chỉnh | model to + task id |

**Kết luận:** mỗi họ đánh đổi khác; không "họ nào hơn hết" — chọn theo cấu hình & ràng buộc.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** so sánh naive vs rehearsal vs (sơ bộ) regularization trên cùng data.

1. Naive: như G7.2.
2. Rehearsal: thêm buffer 200 mẫu ngẫu nhiên → đo forgetting giảm.
3. Regularization: phạt L2 về giá trị cũ → đo.
4. Bảng 3 cột (naive/replay/reg) × (avg-acc, forgetting) — quan sát nào giữ cũ tốt hơn.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/rehearsal_demo.py` (phác — thêm buffer):

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(0)
X = torch.randn(400, 8); y = (X[:,0] > 0).long()*2 + (X[:,1] > 0).long()
def data_of(cls):
    idx = [i for i in range(len(y)) if y[i].item() in cls]
    return X[idx], y[idx]
tasks = [ [0,1], [2,3] ]
def make(): return nn.Sequential(nn.Linear(8,32), nn.ReLU(), nn.Linear(32,4))

buffer_x, buffer_y = torch.empty(0), torch.empty(0)
def train_with_replay(model, x_new, y_new, buffer_x, buffer_y, buffer_cap=60, epochs=8):
    opt = torch.optim.SGD(model.parameters(), lr=0.01)
    bx, by = None, None
    if len(buffer_x) > 0:
        bx, by = buffer_x, buffer_y
    for _ in range(epochs):
        dl = DataLoader(TensorDataset(x_new, y_new), 32, shuffle=True)
        for xb, yb in dl:
            opt.zero_grad(); F.cross_entropy(model(xb), yb).backward(); opt.step()
        if bx is not None:                 # replay mẫu cũ
            rl = DataLoader(TensorDataset(bx, by), 32, shuffle=True)
            for xb, yb in rl:
                opt.zero_grad(); F.cross_entropy(model(xb), yb).backward(); opt.step()
    return buffer_x, buffer_y

model = make(); bx, by = buffer_x, buffer_y
for t, cls in enumerate(tasks):
    x_new, y_new = data_of(cls)
    # thêm dữ liệu task này vào buffer (giữ ngẫu nhiên buffer_cap)
    bx = torch.cat([bx, x_new])[:40]; by = torch.cat([by, y_new])[:40]
    model = make(); model.load_state_dict(...)  # (khung — sửa cho đúng)
    bx, by = train_with_replay(model, x_new, y_new, bx, by)
# đánh giá per task (so với naive) — làm đầy đủ
```

**Chú thích thật:** khung trên để *định hướng* (tôi bỏ một vài chi tiết state_dict/quán lý buffer để bạn hoàn thiện đúng theo G7.2). Hãy viết đúng: copy model giữa task, giữ buffer, đo bảng per-task (G7.2) so naive. Mục tiêu: thấy replay giảm forgetting. Không chạy nguyên xi khung.

**Đánh giá đúng:** vẽ bảng accuracy per-task (G7.6) cho naive vs rehearsal → replay giữ task cũ cao hơn.

---

## 12. Đánh giá

**Chỉ số:** phân biệt đúng TIL/CIL/DIL (cái gì đổi + có biết task khi test không); thuộc 3 họ phương pháp + cơ chế + đánh đổi; thiết kế thí nghiệm đúng cấu hình (không nhầm nâng accuracy).

**Vì sao chọn:** nhầm cấu hình = kết luận sai (báo accuracy cao ảo trong TIL khi đáng lẽ CIL khó) — đúng yêu cầu prompt tách khái niệm hay bị nhầm.

**Chỉ số không thể hiện:** chi tiết từng method (EWC, SIN, packnet...) — nền đủ đọc; còn "nhớ lâu với CL" tinh tế (task boundary, forgetting, forward/backward transfer) sẽ sâu ở G7.6.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "TIL == CIL." — Khác cốt lõi: TIL biết task khi test (head per-task), CIL không (phân toàn bộ lớp). Đo nhầm giữa hai cái → sai kết luận (class-incremental khó hơn nhiều).
- **Hiểu lầm 2:** "Rehearsal luôn tốt nhất." — Với bộ nhớ/privacy thì không (phải giữ mẫu — vi phạm khi FL privacy); và buffer quá nhỏ yếu. Không "thắng tuyệt đối".
- **Hiểu lầm 3:** "Architecture không đáng kể, cứ thêm head." — Thêm head phù hợp TIL nhưng CIL (không biết task) không dùng được; và model phình to. Có đánh đổi.
- **Giới hạn:** "họ" là khung, method hiện đại kết hợp (replay + reg, G8); và "cấu hình" có biến thể (task-agnostic CL). Chương này là nền đọc research chính xác.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Sự khác TIL/CIL/DIL (cái gì đổi + có biết task khi test không).
2. Ba họ phương pháp + cơ chế giữ cũ.
3. Vì sao CIL khó nhất (giả định phổ biến)?

### Luyện tập (sửa đổi / mở rộng)
4. Với 6 lớp đến thành 3 task (2 lớp/task): nếu test không biết task → cấu hình nào? Nếu biết → cấu hình nào?
5. Từ bảng mục 8: chọn họ/tinh cho bài "ảnh bệnh da liễu, lớp mới thêm, test không biết task" (CIL) — giải thích chọn.

### Thử thách (thiết kế / liên hệ)
6. Trong FL+CL (G8): client nhận nhiệm vụ mới theo thời gian nhưng *không thể chia sẻ mẫu* (privacy) → rehearsal khó; thiết kế hướng nào khả thi (regularization? global-backbone? moả mẫu tại client giữ locally)?
7. Nối G8: đề xuất cách kết hợp 3 cấu hình với FL (client non-IID + nhiệm vụ mới = vừa non-IID vừa CL) — phác thảo.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. TIL: lớp mới + biết task lúc test (head per-task). CIL: lớp mới + không biết task (phân toàn bộ nhãn). DIL: miền đổi, nhãn giữ. Khác ở "cái gì đổi" và "có task id khi test".
2. Rehearsal: giữ mẫu cũ + ôn (nhớ bằng nhìn lại). Regularization: phạt trọng số/biểu diễn không đổi (nhớ bằng giữ tham số). Architecture: tách tham số/module per task (nhớ bằng vùng riêng).
3. CIL không có "task boundary" ở test → model phải phân biệt mọi lớp tích lũy, head mở rộng, hay nhầm lớp cũ-mới; ngoài ra khi thêm lớp mới mất cân bằng (G4.6). → khó nhất.
4. Không biết task → CIL. Biết → TIL. (Cùng dữ liệu, cấu hình khác độ khó.)
5. Đây là CIL (lớp bệnh mới thêm, chẩn đoán không biết trước task). Chọn rehearsa (nếu giữ vài mẫu đã khử nhận diện) hoặc regularization (không giữ mẫu — an toàn privacy); Architecture khó vì CIL. Đánh đổi — chọn theo giới hạn privacy/bộ nhớ.
6. Không chia sẻ mẫu → rehearsal toàn FL khó; hướng: (a) regularization/global-backbone giữ (FedProx-like + CL regularizer), (b) mỗi client giữ buffer *cục bộ* (replay tại client, không chia sẻ — ra khỏi mô hình privacy), (c) kiến trúc tách (nếu task-boundary khả dụng). G8.
7. FL-non-IID (client khác nhau) + CL (task đến dần) → vừa cần chống client drift vừa chống forgetting. Hướng: gộp global backbone + per-client replay/regularization, đồng bộ method CL trong gộp. Đây đúng là "Federated Continual Learning" — chi tiết G8.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **TIL / CIL / DIL** khác ở "cái gì đổi" và "có biết task khi test" — CIL thường khó nhất.
2. Ba họ: **rehearsal** (ô ké mẫu cũ), **regularization** (giữ tham số), **architecture** (tách tham số).
3. Không họ nào thắng tuyệt đối — chọn theo cấu hình & ràng buộc (privacy, bộ nhớ, task id).
4. Nhầm cấu hình → đo/báo cáo sai (suppress accuracy ảo TIL vs CIL).
5. Nhân tố này cần khi đi FL+CL (G8) — rehearsal khó vì privacy, cần kết hợp.

**Tự kiểm tra:**
- Phân biệt TIL/CIL/DIL.
- Cơ chế 3 họ phương pháp + đánh đổi.
- Vì sao CIL khó.
- Chọn họ/hình cho bài CIL có privacy → nối G8.

---

## 16. Đọc sâu bằng trực giác — đề thi cho biết môn hay không?

Có hai kỳ thi: một kỳ ghi rõ “toán” hoặc “văn” rồi yêu cầu chọn trong hai đáp án; kỳ kia trộn tất cả đáp án mà không báo môn. Cùng bộ kiến thức nhưng lượng thông tin lúc thi khác nhau làm hai bài toán không thể so bằng một con số trần.

| Câu chuyện kỳ thi | Cấu hình CL | Thông tin ở test |
|---|---|---|
| Biết trước môn thi | Task-incremental | Có task id hoặc thông tin tương đương |
| Tất cả đáp án cùng cạnh tranh | Class-incremental | Không được dùng task id để chọn head |
| Cùng môn, đổi phông chữ/giấy | Domain-incremental | Nhãn giữ, miền dữ liệu thay đổi |

**Đọc quy tắc quyết định:** `ŷ=argmaxc∈C logitsc`: “chọn lớp có điểm lớn nhất trong tập ứng viên C”. C là các lớp của task đang biết trong TIL, nhưng là tất cả lớp đã gặp trong CIL. Thay C chính là thay bài đánh giá, không phải tối ưu code vô hại.

**Tính tay:** task 1 gồm mèo/chó, task 2 gồm xe/xe tải. Một ảnh mèo cho logits `(2,1,3,0)`. Nếu biết task 1, chỉ so 2 với 1 nên dự đoán mèo, đúng. Nếu CIL so cả bốn lớp, điểm 3 làm dự đoán xe, sai. Vì vậy accuracy TIL cao không chứng minh đã giải được nhầm lẫn lớp cũ–mới của CIL.

**Phản ví dụ:** thấy model đạt 90% trong TIL rồi báo “đã giải CIL 90%”. Ví dụ logits `(2,1,3,0)` cho thấy chỉ cần bỏ task id, cùng model dự đoán sai lớp cũ; con số TIL không chuyển sang CIL nếu thông tin lúc test khác.

**Giới hạn:** không có thứ tự độ khó TIL < DIL < CIL đúng cho mọi dữ liệu và giao thức. Replay, regularization và mở rộng kiến trúc cũng không tương ứng một–một với ba cấu hình; cần xem phương pháp thật có cần task id, lưu mẫu hoặc tăng tham số không. Đánh đổi phải xét dưới cùng điều kiện test.

:::interactive incremental
:::

:::quiz
Model dùng task id đúng để chọn head lúc test, dù người dùng thật không có task id. Có thể báo đó là kết quả CIL chuẩn không?
A. Có, vì vẫn dùng cùng ảnh
B. Không, đã dùng thêm thông tin của TIL
C. Có, nếu accuracy trên 90%
Đáp án: B
Giải thích: Task id làm hẹp tập lớp ứng viên. CIL yêu cầu phân biệt các lớp đã gặp mà không được cung cấp thông tin này.
:::

:::goi-y
Hỏi xem hệ thống thật có biết nên dùng head nào trước khi dự đoán hay không.
:::

:::loi-giai
Ví dụ logits cho đúng trong TIL nhưng sai trong CIL. Muốn so hai phương pháp phải cố định cả dữ liệu lẫn thông tin được cấp lúc test, không chỉ cố định model size.
:::
