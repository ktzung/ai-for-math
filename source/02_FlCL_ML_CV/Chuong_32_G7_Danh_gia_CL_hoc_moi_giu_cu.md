# Chương 7.5–7.6 — Học lớp mới / thích nghi miền, và đánh giá CL: khả năng học mới vs giữ kiến thức cũ (Giai đoạn 7)

> **Câu hỏi trọng tâm:** *CL có hai mục tiêu (học mới + giữ cũ) — vậy đánh giá phải đo cả hai thế nào, qua "forward/backward transfer" và các chỉ số chuẩn?*

---

## 1. Vị trí trong lộ trình

Đã biết forgetting và 3 họ method (G7.2–4). Giờ phần **đánh giá CL** — cực kỳ quan trọng vì chỉ số sai sẽ báo cáo sai. CL có hai mục tiêu *đối lập nhau* (học task mới ↔ không quên task cũ); không thể đo bằng 1 con số. Chương này dạy bảng đánh giá chuẩn, forward/backward transfer, và ứng dụng cho "học lớp mới / thích nghi miền".

---

## 2. Kiến thức cần dùng

- Bảng accuracy per-task (G7.2), TIL/CIL/DIL (G7.3), train/val (G2.3), chỉ số (G2.7).

**Ôn nhanh:** CL ≠ bài toán 1 lần; đo *theo thời gian* (sau mỗi task). "Học mới" = accuracy trên task vừa học; "giữ cũ" = accuracy các task trước không rơi.

---

## 3. Câu chuyện mở đầu

Lan đọc paper CL và thấy người ta báo cáo "accuracy 0.85". Tưởng tốt, nhưng người khác chỉ ra: *"Con số nào? Cuối routes hay trung bình? Họ có tính forward/backward transfer không? Nếu chỉ 'accuracy trên task cuối' thì bỏ qua việc quên task đầu."* 

Cô học: đánh giá CL dùng một **bảng tam giác** accuracy (task × phase) (G7.2), và các chỉ số tổng hợp:
- **Average accuracy (A):** trung bình accuracy của **tất cả task đã gặp** tại thời điểm cuối — gồm cả khả năng giữ cũ + học mới.
- **Backward transfer (BWT, "forgetting"):** mức giảm accuracy của *task cũ* sau khi học các task sau. Đo forgetting.
- **Forward transfer (FWT):** mức học task mới "nhờ" những task trước (khó đo; hoặc so với tập nhớ).

Muốn báo cáo trung thực phải ghi rõ **cấu hình** (TIL/CIL/DIL — G7.3), cách chia, và **cả A lẫn backward transfer** — không một con số.

---

## 4. Câu hỏi trọng tâm

**Bảng đánh giá CL / average accuracy / backward (forgetting) transfer được tính ra sao — và vì sao phải đo cả "học mới" lẫn "giữ cũ"?**

---

## 5. Trực giác

**CL đánh giá có "góc nhìn thời gian".** Không phải một kỳ thi, mà là chuỗi kỳ thi: sau mỗi task mới, ta xem *tất cả* task từ đầu đến giờ. Bảng tam giác (`acc[task][phase]`) ghi lại: hàng = task bị đo, cột = phase (sau task nào).

- **Average accuracy (A):** trung bình cột **cuối** (toàn bộ hàng task đã gặp tại phase cuối). Gồm cả cái học được (đường chéo) và cái giữ được (hàng cũ).
- **Giảm so với ngay sau khi học:** lấy accuracy task cũ ngay sau khi học trừ accuracy hiện tại; dương là suy giảm. **Backward transfer (BWT)** dùng hiệu ngược lại, hiện tại trừ ngay sau khi học; âm là tác động ngược bất lợi. Không gọi hai dấu đối nhau bằng cùng một tên. Forgetting theo đỉnh lịch sử còn là một định nghĩa khác, nêu ở phần bổ sung cuối chương.
- **Forward transfer (FWT):** lợi ích task mới kế thừa từ cũ — khó đo, thường so với "training mỗi task từ đầu". (Không phổ biến bằng BWT.)

**Hai mục tiêu đối lập:** học mới mạnh (regularization yếu/không nén) có thể làm quên cũ nhiều; giữ cũ quá mạnh thì không học được mới. Đánh giá cả hai (A + forgetting) để thấy phương pháp nằm đâu trên đường trade-off — không phải "một con số".

**Phép so sánh "bảng điểm tích lũy qua học kỳ (không chỉ kỳ cuối), chú ý cả môn cũ":** trực quan cho "đo theo thời gian + giữ cũ". **Giới hạn:** A và BWT không hoàn hảo (nhạy độ khó task, thứ tự); có nhiều biến thể (AvgForgetting, Δ, "average per task"). Khóa hoc đọc paper phải xem *định nghĩa* của từng chỉ số, không so bừa giữa 2 paper.

---

## 6. Từ trực giác đến mô hình

- **Bảng:** `M[t][p]` = accuracy task t đo tại phase p (p ≥ t).
- **A (cuối):** trung bình `M[t][T]` với t=1..T (tất cả task đã gặp ở phase cuối).
- **Giảm so với đường chéo:** `M[t][t] − M[t][T]` trên task cũ t<T. **BWT:** `M[t][T] − M[t][t]`; lấy trung bình trên t<T. Nếu dùng forgetting theo đỉnh thì thay `M[t][t]` bằng `max_{p=t..T−1} M[t][p]`.
- **Cấu hình & nền tảng:** ghi rõ TIL/CIL/DIL; tỉ lệ chia; seed (G1.5).

**Thuật toán (đánh giá CL):**
```
1. Sau mỗi task t, đo accuracy mọi task 1..t (cùng test cố định per task).
2. Điền bảng M[t][p].
3. Tính A (avg cột cuối), forgetting (hàng cũ giảm).
4. Báo cả A + forgetting; không một con số.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Đo accuracy mọi task tại mỗi phase (không chỉ task mới).**

```python
acc_matrix = {}          # acc_matrix[t][p]
for phase, cls in enumerate(tasks):
    train_model_on(task_cls)          # (với method CL — naive/replay...)
    for t in range(0, phase+1):
        acc_matrix[t][phase] = eval_on(task_t)     # đo mọi task đã gặp
```

**Bước 2 — Vẽ/in bảng M[t][p] (triangular).**

```
         phase →  T1    T2    T3
task T1         0.88  0.60  0.42
task T2             —   0.85  0.66
task T3             —     —   0.83
```

**Bước 3 — Tính A và forgetting.**

```python
T = len(tasks)
last_acc = [acc_matrix[t][T-1] for t in range(T)]          # cột cuối
A = sum(last_acc) / T
forgetting = []
for t in range(T-1):                                        # task trừ task cuối
    forgetting.append(acc_matrix[t][t] - acc_matrix[t][T-1])
avg_forgetting = sum(forgetting) / len(forgetting)
print("A", round(A,3), "| forgetting", round(avg_forgetting,3))
```

**Bước 4 — Diễn giải:** A cao + forgetting thấp = phương pháp cân (học mới lẫn giữ cũ). A cao nhưng forgetting cao = chỉ đẹp vì task cuối.

**Lỗi thường gặp:** chỉ báo accuracy task cuối → giấu quên; không chia hàng/cột đúng (phase ≥ task); quên ghi cấu hình (TIL/CIL — mà thay đổi độ khó báo cáo); không seed/repeat → số nhiễu.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** bảng 3 task (ở mục 7).

**Bước 1 — A (cuối):** `A = (0.42 + 0.66 + 0.83)/3 = 1.91/3 ≈ 0.637`.

**Bước 2 — Forgetting:** T1: `0.88−0.42=0.46`; T2: `0.85−0.66=0.19`; avg `(0.46+0.19)/2 = 0.325`.

**Bước 3 — Đọc:** A chỉ 0.637 vì task đầu quên nhiều (forgetting 0.325). Nếu chỉ khoe "accuracy task cuối 0.83", ta giấu việc task đầu mất. Báo `A=0.637, forgetting=0.325` là trung thực.

**Bước 4 — So 2 method:** Method X A=0.70 forgetting=0.05 (tốt); Method Y A=0.72 forgetting=0.28 (task cuối giỏi nhưng quên cũ). Đọc bảng CẢ A lẫn forgetting mới chọn đúng.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ báo "accuracy cuối" hoặc "accuracy task mới nhất".

| Phương diện | Chỉ accuracy cuối | Bảng + A + forgetting |
|---|---|---|
| Thấy quên cũ | không | rõ (hàng giảm) |
| So 2 method công bằng | khó | A+forgetting |
| Báo cáo trung thực | có thể giấu | đầy đủ |
| Đánh đổi | nhanh | cần đo mọi task mỗi phase |

**Cải thiện:** trung thực, so sánh đúng. **Đánh đổi:** đo tất cả task mỗi phase (chút chi phí, bắt buộc để CL có nghĩa).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** tự tính A + forgetting đúng.

1. Chạy method CL (naive + replay) trên 3 task.
2. Điền bảng M[t][p].
3. Tính A và forgetting; so naive vs replay.
4. Ghi nhận: replay có A cao hơn hoặc forgetting thấp hơn (tùy method).

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/cl_eval.py` (kế thừa G7.2, thêm bảng + chỉ số):

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

def eval_task(model, cls):
    x, yy = data_of(cls)
    with torch.no_grad():
        return (model(x).argmax(1) == yy).float().mean().item()

model = make()
M = {}                                    # M[task][phase]
for phase, cls in enumerate(tasks):
    x, yy = data_of(cls)
    dl = DataLoader(TensorDataset(x, yy), 32, shuffle=True)
    opt = torch.optim.SGD(model.parameters(), lr=0.01)
    for _ in range(8):
        for xb, yb in dl: opt.zero_grad(); F.cross_entropy(model(xb), yb).backward(); opt.step()
    for t in range(phase+1):
        M.setdefault(t, {})[phase] = eval_task(model, tasks[t])

T = len(tasks)
A = sum(M[t][T-1] for t in range(T)) / T
forg = [M[t][t] - M[t][T-1] for t in range(T-1)]
print("A:", round(A,3), "| forgetting:", round(sum(forg)/len(forg),3) if forg else 0)
print("M:", M)
```

**Kết quả dự kiến:** in A (thấp vì naive quên), forgetting (dương), bảng M — minh hoạ đánh giá CL đúng.

**Lỗi thường gặp:** `M.setdefault` phải đúng phase/task; `M[t][t]` & `M[t][T-1]` index đúng; bảng không triangular khi quên nhánh.

**Chú thích trung thực:** dữ liệu giả 2 task, naive đơn giản; mục đích là quy trình tính A/forgetting chính xác, không phải đạt số cao. Để đúng class-incremental (thêm nút) phức tạp hơn — G7.3 đã nói.

---

## 12. Đánh giá

**Chỉ số:** điền đúng bảng M[t][p]; tính A và forgetting từ bảng; báo cả hai (không 1 con số); biết forward transfer khái niệm; ghi cấu hình (TIL/CIL) khi báo.

**Vì sao chọn:** đây là "ngôn ngữ" đọc/viết paper CL; không nắm sẽ đọc sai kết quả (SL nói G9).

**Chỉ số không thể hiện:** không phủ biến thể chỉ số phức tạp (Δ, normalized); không đo thứ tự ảnh hưởng/celuật. Chương này chuẩn khung đọc.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Accuracy cao = CL tốt." — Phải xem task nào; accuracy task cuối giấu forgetting. Báo A + forgetting.
- **Hiểu lầm 2:** "Forgetting = 0 là tốt nhất." — Chưa chắc: regularize quá mạnh giữ cũ tuyệt nhưng không học mới được (A thấp). CL cân 2 mục tiêu; đừng chỉ tối thiểu hóa forgetting.
- **Hiểu lầm 3:** "A và forgetting so được bừa giữa 2 paper." — Chưa: khác cấu hình (TIL/CIL), khác cách chia/seed → sai khi so. Luôn so cùng setup (G9).
- **Giới hạn:** A/forgetting nhạy "độ khó task" — task khó bị phạt; và "forward transfer" khó đảo — không phổ biến. Đây là khung chuẩn nhưng paper có biến thể.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Bảng M[t][p] nghĩa gì; sao phải đo mọi task mỗi phase?
2. Compute A từ bảng mục 8. Forgetting trung bình?
3. Vì sao "accuracy task cuối" không đủ?

### Luyện tập (sửa đổi / mở rộng)
4. Thêm 1 task nữa (3 task) vào cl_eval; verify bảng 3×3 và tính A/forgetting.
5. So naive vs replay trên bảng A/forgetting — phân tích.

### Thử thách (thiết kế / liên hệ)
6. Trong FL+CL (G8), "đánh giá CL" còn giao với "đánh giá theo client" (G6.5). Phác: khó đến đâu khi phải đo bảng M per-client trong FL.
7. Đề xuất cách báo cáo CL tuân thủ "reproducible" (G1.5, G9): liệt kê để tái lập (seed, cấu hình, chia tasks, chỉ số).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. M[t][p] = accuracy task t đo tại phase p (p≥t). Đo mọi task mỗi phase để thấy forgetting theo thời gian (hàng giảm).
2. A = (0.42+0.66+0.83)/3 = 0.637. Forgetting = trung bình (0.46, 0.19) = 0.325.
3. Accuracy task cuối giấu việc task cũ đã quên; báo tổng thể (A) + mất bao nhiêu (forgetting) mới trung thực.
4. Bảng 3×3; A & forgetting tính như trên với T=3; verify M triangular (p≥t).
5. Replay thường A cao hơn hoặc forgetting thấp hơn naive (giữ cũ); giải thích bằng bảng hàng ít giảm.
6. Khó: phải đo cả "task" lẫn "client" — bảng 2 chiều phức tạp (task × phase × client), client không có test chung (G6.8). Cần thiết kế "client-test riêng"/proxy. G8.
7. Báo cáo nên ghi: seed; cấu hình (TIL/CIL/DIL); cách chia tasks (số task, lớp/task, thứ tự); tập test per-task cố định; chỉ số (A, forgetting, per-task bảng); method + hyperparameter; cost. Tất cả cho tái lập (G1.5/G9).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. CL đánh giá bằng **bảng M[t][p]** (task × phase).
2. **A (average accuracy cuối)** — học mới + giữ cũ; **forgetting (backward transfer)** — mất bao nhiêu task cũ.
3. Báo cáo **cả A + forgetting**, không "accuracy task cuối".
4. **Forward transfer** = lợi task mới từ cũ (khái niệm).
5. Báo kèm **cấu hình (TIL/CIL/DIL) + seed + cách chia** (để tái lập, G9); và nền cho đánh giá FL+CL (G8).

**Tự kiểm tra:**
- Cách tính A & forgetting từ bảng.
- Vì sao "accuracy task cuối" giấu quên.
- Khi nào số A "đẹp" mà vẫn tệ?
- Liên hệ bảng M trong đánh giá FL+CL.

---

## 16. Đọc sâu bằng trực giác — đặt đúng dấu cho trí nhớ

Một học viên có thể giỏi hơn ở bài cũ sau khi học bài mới. Vì thế “tác động ngược” không chỉ có mất mát. Ta cần một chỉ số có dấu và một định nghĩa rõ cho mức quên, thay vì dùng hai tên cho cùng một hiệu.

| Câu hỏi | Chỉ số | Mốc so sánh |
|---|---|---|
| Cuối cùng làm tốt mọi task đến đâu? | Average accuracy A | Trung bình accuracy hiện tại |
| Học tiếp làm lợi/hại bài cũ thế nào? | BWT | Hiện tại trừ ngay sau khi học |
| Đã mất bao nhiêu so với mức từng đạt? | Forgetting theo đỉnh F | Đỉnh lịch sử trừ hiện tại |

**Đọc công thức:** `BWT=(Σj<T (Mj,T−Mj,j))/(T−1)`: “trên các task cũ, trừ điểm lúc vừa học khỏi điểm hiện tại, rồi lấy trung bình”. BWT âm là tác động ngược bất lợi. Một định nghĩa phổ biến khác là `F=(Σj<T (maxp=j..T−1 Mj,p−Mj,T))/(T−1)`; hãy ghi quy ước nếu chặn số âm ở 0. T=1 chưa có task cũ nên BWT/F trung bình này chưa xác định.

**Tính tay:** task 1 đi từ 0.70 lên 0.90 rồi xuống 0.80; task 2 từ 0.85 xuống 0.75; task 3 mới đạt 0.95. A cuối là `(0.80+0.75+0.95)/3≈0.8333`. BWT bằng `((0.80−0.70)+(0.75−0.85))/2=0`. Nhưng forgetting theo đỉnh bằng `((0.90−0.80)+(0.85−0.75))/2=0.10`.

**Phản ví dụ:** BWT bằng 0 không có nghĩa không task nào suy giảm; lợi ở task này có thể bù hại ở task khác. Bảng theo task giữ lại thông tin ấy. A cao cũng có thể do task cuối rất dễ; cần đọc đường chéo và từng hàng.

:::interactive clmetrics
:::

:::quiz
Với task cũ đạt 0.70 ngay sau học, từng lên 0.90 rồi cuối còn 0.80, forgetting theo đỉnh là bao nhiêu?
A. −0.10
B. 0.10
C. 0.20
Đáp án: B
Giải thích: Đỉnh trước cuối là 0.90, hiện tại 0.80, hiệu bằng 0.10. BWT so với đường chéo lại bằng +0.10.
:::

:::goi-y
Khoanh mốc “tốt nhất trước phase cuối”, đừng tự thay nó bằng điểm ngay sau học.
:::

:::loi-giai
Forgetting theo đỉnh là 10 điểm phần trăm. Hai định nghĩa có thể cùng số trị tuyệt đối nhưng khác ý nghĩa; luôn viết công thức và trục ma trận trong báo cáo.
:::
