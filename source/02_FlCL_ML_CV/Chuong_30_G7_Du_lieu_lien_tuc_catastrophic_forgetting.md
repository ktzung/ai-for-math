# Chương 7.1–7.2 — Dữ liệu đến theo luồng / chuỗi nhiệm vụ, và catastrophic forgetting (Giai đoạn 7)

> **Câu hỏi trọng tâm:** *Khi dữ liệu / nhiệm vụ đến dần theo thời gian, tại sao mô hình "quên" kiến thức cũ — và hiện tượng "quên thảm khốc" là gì?*

---

## 1. Vị trí trong lộ trình

Đã xong FL (G6). Giờ chủ đề đích thứ hai: **Continual Learning (CL)** — mô hình học *theo thời gian*, tiếp nhận dữ liệu/lớp/nhiệm vụ mới mà **không quên** kiến thức cũ. Đây là tình huống thực tế: một robot/phòng khám gặp lớp bệnh mới, hay camera thấy vật thể tương lai mới, liên tục.

Gộp 7.1 (dữ liệu đến theo luồng/chuỗi) và 7.2 (catastrophic forgetting) là khối nền: "vấn đề CL phát sinh từ đâu".

---

## 2. Kiến thức cần dùng

- Non-IID (G6.5), overfit/đánh giá (G2.5/2.3), training loop (G3.7), phân loại ảnh (G4).

**Ôn nhanh:** model học giám sát trên dữ liệu; nếu huấn luyện tiếp trên phân phối mới theo thời gian, trọng số thích ứng để khớp dữ liệu mới → có thể "đẩy đi" kiến thức cũ (vì gradient mới chỉ hướng về mẫu mới).

---

## 3. Câu chuyện mở đầu

Một bệnh viện triển khai AI nhận diện ảnh **da liễu**. Lúc đầu model chỉ nhận 2 bệnh (nám, eczema). Sáu tháng sau, họ thêm nhận diện **u hắc tố** (melanoma) — lớp mới. Họ *tinh chỉnh/thêm* model trên dữ liệu lớp mới (và vài lớp cũ). Kết quả: accuracy **melanoma tăng**, nhưng khi kiểm tra lại trên dữ liệu **nám/eczema cũ** — accuracy **tụt thảm**!

Vì sao? Model, khi huấn luyện trên phân phối mới, **dịch chuyển trọng số** để giỏi lớp mới, làm mất biểu diễn phục vụ lớp cũ. Đây là **catastrophic forgetting** (quên thảm khốc) — vấn đề trung tâm của Continual Learning. Dữ liệu y tế đến theo thời gian (không phải một lúc đủ hết), model phải **học mới mà không quên cũ** — đó là thử thách CL.

---

## 4. Câu hỏi trọng tâm

**Vì sao "huấn luyện tiếp trên dữ liệu mới" gây quên kiến thức cũ — và catastrophic forgetting biểu hiện thế nào / đo bằng gì?**

---

## 5. Trực giác

**Forgetting = "đổ nước vào ly đã đầy".** Một bộ nhớ (trọng số) có sức chứa hữu hạn biểu diễn; khi bạn "nhồi" kiến thức mới (dữ liệu mới) bằng gradient descent, nó *ghi đè* các trọng số vốn phục vụ kiến thức cũ. Khác với con người (có synaptic consolidation), gradient descent chỉ tối ưu trên *dữ liệu hiện tại* → vùng biểu diễn cũ bị "nghiêng".

Cụ thể: trong giai đoạn học lớp mới, loss chỉ "nhìn" dữ liệu lớp mới (hoặc ít lớp cũ). Gradient dồn trọng số để lớp mới chuẩn → những đặc trưng vốn phục vụ lớp cũ bị điều chỉnh lệch → khi test lớp cũ (không có trong giai đoạn vừa rồi), model sai. Đây là "quên thảm khốc" — *catastrophic* vì tụt rất mạnh, không phải hao hụt nhẹ.

**Đo forgetting:** sau khi học mỗi *task mới*, đo lại accuracy trên dữ liệu của **từng task cũ** — rồi so với accuracy ngay sau khi học task đó. Mức giảm giữa hai thời điểm = độ quên. (Bảng accuracy task × phase — G7.6.)

**Phép so sánh "đổ nước vào ly đầy":** trực quan lý do ghi đè. **Giới hạn:** không phải mọi học mới đều ghi đè hoàn toàn — "quên" phụ thuộc architecture, độ chồng lấp task, phương pháp (G7.4); có model "quên ít" nếu thiết kế tốt. Và "forgetting" không đồng nghĩa "suy giảm do phân phối thay đổi" đơn thuần — cần phân biệt (G7.3).

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** chuỗi nhiệm vụ T1, T2, ... (mỗi nhiệm vụ = tập mẫu + nhãn/dữ liệu riêng); dữ liệu các nhiệm vụ không về cùng lúc.
- **Model:** mạng học tuần tự; giai đoạn task t chỉ thấy dữ liệu task t.
- **Đánh giá:** sau task t, đo accuracy của *từng task 1..t* → bảng accuracy(triangular).
- **Forgetting metric (gợi ý):** `F_t = (avg accuracy của tasks cũ "ngay sau task đó") − (accuracy hiện tại của các task đó)` — số dương = đã quên.

**Thuật toán (ví dụ CL tuần tự):**
```
1. Chia data thành chuỗi tasks.
2. Với mỗi task t: train model trên data task t (không/ít thấy task cũ).
3. Sau mỗi phase: đo accuracy tất cả tasks 1..t.
4. So sánh × thời gian → phát hiện forgetting.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Chia thành chuỗi nhiệm vụ.** VD phân loại 10 lớp, chia 5 task, mỗi task 2 lớp mới: T1 {lớp0, lớp1}, T2 {lớp2, lớp3}, ...

**Bước 2 — Huấn luyện tuần tự (naive — không chống forgetting).**

```python
for t in tasks:
    for epoch in few_epochs(task_t):       # chỉ dữ liệu task t (naive)
        train_step(model, task_t)
    acc_after_t[t] = eval_all_tasks(model)  # đo mọi task 1..t
```

**Bước 3 — Đo forgetting.** Sau task cuối, so `acc_after_k` với `acc_after_later`:
- Nếu task 1 accuracy ban đầu 0.9, sau task 5 chỉ còn 0.5 → forgetting mạnh.

**Bước 4 — Minh hoạ (đủ để thấy)**: in bảng accuracy per-task theo phase.

**Lỗi thường gặp:** chỉ đo "task mới nhất" (bỏ tasks cũ) — không thấy quên; không lưu accuracy "ngay sau task đó" (cần baseline để đo quên); dùng chung test set giữa task (phải tách per-task); nhầm forgetting với thay đổi phân phối (G7.3).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 3 task (2 lớp mỗi task), naive training.

| Task đo | Sau T1 | Sau T2 | Sau T3 |
|---|---|---|---|
| Acc T1 | 0.88 | 0.60 | 0.42 |
| Acc T2 | — | 0.85 | 0.66 |
| Acc T3 | — | — | 0.83 |

**Bước 1 — Đọc:** mỗi task acc của mình (đường chéo) cao khi mới học, nhưng **giảm dần qua các task sau** — hàng ngang giảm = forgetting.

**Bước 2 — Ví dụ:** Acc T1 0.88 → 0.60 → 0.42: model quên task 1 dần khi học T2, T3.

**Bước 3 — Forgetting của T1:** `0.88 (sau T1) − 0.42 (sau T3) = 0.46` — quên nặng. Đây là "giá" của naive training theo CL.

**Bước 4 — Kết luận:** cần các phương pháp (G7.4) để khóa bảng này "mờ đi ít hơn" — rehearsa/regularization/architecture.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "gộp hết dữ liệu cũ + mới (không CL)" — nhưng đó là *offline*, không phải CL; ta so với "naive (chỉ học task mới)".

| Phương diện | Naive (chỉ task mới) | CL có phương pháp |
|---|---|---|
| Forgetting | nặng (thảm khốc) | giảm |
| Accuracy task cũ | giảm mạnh | giữ được hơn |
| Đánh đổi | đơn giản | phức tạp/bộ nhớ |

Giải thích: naive đơn giản nhưng phá vỡ task cũ; CL giữ lại (chi phí: replay bộ nhớ / regularization / khởi tạo). G7.4 đi sâu.

*(So với "offline gom hết": offline không bao giờ quên vì thấy hết — nhưng không khả thi khi data mới đến dần không lưu hết, hoặc muốn học mà không cần giữ toàn bộ dữ liệu cũ.)*

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát catastrophic forgetting trực tiếp.

1. Chia dataset 6 lớp thành 3 task (2 lớp/task).
2. Naive training (chỉ task t) → vẽ bảng accuracy per-task (G7.6 format).
3. Nhận diện: task đầu giảm mạnh sau vài task sau.
4. (So sau này với các method G7.4 giảm forgetting.)

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/forgetting_demo.py`:

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(0)
# 4 lớp giả; mỗi task: 2 lớp mới
X = torch.randn(400, 8); y = (X[:,0] > 0).long()*2 + (X[:,1] > 0).long()

def data_of(cls):
    idx = [i for i in range(len(y)) if y[i].item() in cls]
    return TensorDataset(X[idx], y[idx])

tasks = [ [0,1], [2,3] ]          # 2 task
acc_matrix = {}
def make(): return nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 4))
model = make()

def eval_acc(model):
    with torch.no_grad():
        pred = model(X).argmax(1)
        # accuracy riêng từng task (chỉ mẫu thuộc task đó)
        out = {}
        for t, cls in enumerate(tasks):
            idx = [i for i in range(len(y)) if y[i].item() in cls]
            if idx:
                out[f"T{t+1}"] = (pred[idx] == y[idx]).float().mean().item()
        return out

for t, cls in enumerate(tasks):
    dl = DataLoader(data_of(cls), 32, shuffle=True)
    opt = torch.optim.SGD(model.parameters(), lr=0.01)
    for _ in range(8):     # train chỉ task này
        for xb, yb in dl: opt.zero_grad(); F.cross_entropy(model(xb), yb).backward(); opt.step()
    print("after T", t+1, eval_acc(model))
```

**Kết quả dự kiến:** sau T1 — T1 acc cao; sau T2 — T2 cao nhưng T1 giảm (do gradient chỉ task 2). Đây là "quên" naive.

**Lỗi thường gặp:** đánh giá chung (không per-task) giấu quên; nhãn task mới chồng lấp khiến model "không biết task"; dùng chung model 4 classes ngay từ đầu (trong thực tế lớp mới tăng dần — đây là dạng "class-incremental" G7.3).

**Chú thích trung thực:** đây là minh hoạ *naive* trên dữ liệu giả; "lớp mới" mô phỏng bằng nhãn có sẵn. Để đúng class-incremental (thêm nút đầu ra) phức tạp hơn — G7.3. Mục đích: thấy forgetting xuất hiện khi học tiếp.

---

## 12. Đánh giá

**Chỉ số:** hiểu vì sao học tiếp ghi đè kiến thức cũ; đo forgetting (bảng per-task theo phase); nhận diện catastrophic (tụt mạnh task cũ).

**Vì sao chọn:** nhận diện "quên thảm khốc" và biết đo là nền của toàn CL (mọi method đều nhắm giảm số này).

**Chỉ số không thể hiện:** chưa phân loại task/class/domain (G7.3); chưa method chống quên (G7.4). Đây là "triệu chứng" — chẩn đoán.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Học mới luôn làm quên, không tránh được." — Tránh được phần nào bằng method (G7.4); nhưng khó, thường đánh đổi (giữ cũ ↔ học mới). Không phải "chấp nhận".
- **Hiểu lầm 2:** "Forgetting = model 'bị lỗi'." — Không; là hệ quả gradient descent trên dữ liệu mới. Hiểu cơ chế để khắc phục (replay/reg/architecture).
- **Hiểu lầm 3:** "Catastrophic = luôn tệ như nhau cả mọi task." — Mức quên phụ thuộc độ chồng lấp task, architecture, thứ tự; không phải "cố định". Đo bằng bảng mới biết.
- **Giới hạn:** "forgetting" phải phân biệt với "thay đổi phân phối trước-sau" (domain shift, G7.3) — đôi khi accuracy giảm do domain đổi, không phải "quên" theo nghĩa ghi đè. Cần tách bạch (prompt nhấn mạnh).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Vì sao gradient descent trên dữ liệu mới gây quên cũ? (liên hệ G3/G2.6)
2. Catastrophic forgetting biểu hiện trong bảng per-task như thế nào?
3. "Forgetting" khác "suy giảm do domain shift" ở chỗ nào?

### Luyện tập (sửa đổi / mở rộng)
4. Với bảng mục 8, tính forgetting của T2 sau T3.
5. In bảng accuracy per-task (forgetting_demo) và ghi nhận task đầu giảm.

### Thử thách (thiết kế / liên hệ)
6. Thiết kế một "metric forgetting" đơn giản cho lộ trình (dùng accuracy task cũ ngay sau học vs hiện tại) — và nêu giới hạn khi nhóm các task có độ khó khác nhau.
7. Liên hệ FL (G6): khi client học nhiệm vụ mới theo thời gian (data mới đến), vấn đề này chính là "FL + CL" (G8) — phác thảo 1 câu "vì sao kết hợp là tự nhiên".

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Gradient descent chỉ tối ưu loss trên dữ liệu hiện tại; khi tối ưu task mới, các trọng số phục vụ task cũ bị "đẩy" theo hướng có lợi task mới → biểu diễn cũ lệch → sai (quên).
2. Hàng ngang trong bảng accuracy per-task → giảm dần (task cũ accuracy giảm qua các phase sau).
3. Forgetting = biểu diễn ghi đè vì học task mới (nội sinh model training). Domain shift = phân phối dữ liệu đổi theo môi trường (không nhất thiết do "học cái khác"). Cần tách để chọn method.
4. F(T2) = 0.85 (sau T2) − 0.66 (sau T3) = 0.19.
5. Task đầu giảm mạnh (VD T1 sau T1 cao, sau T2 giảm) — minh hoạ forgetting naive.
6. Metric: F = avg(acc-task-cũ ngay-sau-học − acc-task-cũ-hiện-tại). Giới hạn: task khó khác nhau — so sánh trực tiếp sai lệch; nên xem % giảm hoặc baseline riêng.
7. Nếu client trong FL nhận dữ liệu/nhiệm vụ mới theo thời gian, model toàn cục phải học mới (CL) mà vẫn phối hợp (FL) — "Federated Continual Learning" chính là G8.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. CL = mô hình học theo thời gian (dữ liệu/nhiệm vụ đến dần) — tình huống thực tế (y tế, robot, camera).
2. **Catastrophic forgetting**: gradient descent trên dữ liệu mới "ghi đè" biểu diễn cũ → task cũ tụt accuracy thảm.
3. Đo bằng **bảng accuracy per-task theo phase** (đường chéo cao, hàng ngang giảm).
4. Forgetting ≠ domain shift (tách để chọn method).
5. Không "không tránh được" — có method (G7.4) và kết hợp FL → G8.

**Tự kiểm tra:**
- Cơ chế gây quên cũ?
- Cách đọc bảng accuracy per-task để thấy quên.
- Forgetting vs domain shift khác gì?
- Liên hệ CL ↔ FL (G8).

---

## 16. Đọc sâu bằng trực giác — bài kiểm tra cũ phải được giữ lại

Một nhân viên học quy trình mới rất nhanh nhưng mắc lỗi trở lại ở quy trình cũ. Nếu quản lý chỉ kiểm bài mới, sự tiến bộ nhìn có vẻ trọn vẹn. Continual learning cần lịch kiểm tra lại, không chỉ lịch đào tạo.

| Việc học nghề | Trong CL | Cần lưu gì? |
|---|---|---|
| Học quy trình lần đầu | Train task mới | Accuracy ngay sau khi học |
| Kiểm lại việc đã biết | Evaluate task cũ | Test cố định, không đưa vào train |
| So khả năng trước–sau | Suy giảm theo thời gian | Ma trận task × phase |

**Đọc công thức:** `Dj,T=Mj,j−Mj,T`: “lấy điểm task j ngay sau khi học, trừ điểm của chính task ấy sau phase T”. Dương là suy giảm so với đường chéo. Đừng nhầm với BWT, vốn dùng hiệu ngược dấu. Nếu lấy mốc tốt nhất từng đạt thay vì đường chéo, ta đang dùng định nghĩa forgetting khác.

**Tính tay với bảng giả lập:** task 1 đạt 0.88 ngay sau học rồi còn 0.42 ở cuối; suy giảm là 0.46, tức **46 điểm phần trăm**, không phải 46% theo tỉ lệ tương đối. Task 2 từ 0.85 xuống 0.66 mất 19 điểm. Trung bình hai task cũ mất `(0.46+0.19)/2=0.325`, tức 32.5 điểm phần trăm. Accuracy task mới 0.83 không cho thấy khoản mất này.

**Thử tương tác:** hạ điểm nhiệm vụ cũ sau khi học mới và so với điểm trung bình hai nhiệm vụ. Trung bình có thể vẫn cao trong khi nhiệm vụ cũ đã suy giảm mạnh.

:::interactive forgetting
:::

**Phản ví dụ:** nếu task 1 được cải thiện từ 0.70 lên 0.80 khi học thêm task 2, hiệu đường chéo là −0.10. Đó là chuyển giao có lợi, không phải “quên âm” cần lặng lẽ đổi thành 0. Khi thay test hoặc thay tập lớp ứng viên theo phase, phải nêu giao thức vì điểm có thể không còn so trực tiếp.

:::quiz
Accuracy task cũ giảm từ 80% xuống 60%. Mức giảm tuyệt đối là gì?
A. 20 điểm phần trăm
B. 20% tương đối
C. 40 điểm phần trăm
Đáp án: A
Giải thích: 80−60=20 điểm phần trăm. Mức giảm tương đối là (80−60)/80=25%, một đại lượng khác.
:::

:::goi-y
Trước tiên trừ hai phần trăm; chỉ chia cho mốc đầu nếu câu hỏi yêu cầu tỉ lệ giảm tương đối.
:::

:::loi-giai
Hiệu accuracy là 0.20. Trong báo cáo CL nên ghi rõ mốc so sánh, task nào được tính và có lấy trung bình trên task mới hay chỉ task cũ.
:::
