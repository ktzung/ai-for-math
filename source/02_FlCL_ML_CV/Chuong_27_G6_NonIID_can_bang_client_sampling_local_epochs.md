# Chương 6.5–6.6 — Dữ liệu non-IID, mất cân bằng client, client sampling, local epochs & số vòng truyền thông (Giai đoạn 6)

> **Câu hỏi trọng tâm:** *Vì sao FedAvg "đổ vỡ" khi các client có dữ liệu khác nhau (non-IID)? Và với nhiều client thực tế, ta chọn ai tham gia (sampling), huấn luyện cục bộ bao nhiêu (local epochs), và bao nhiêu vòng thì đủ?*

---

## 1. Vị trí trong lộ trình

FedAvg (G6.4) hoạt động tốt khi dữ liệu i.i.d.-nhẹ. Giờ đối mặt với **thực tế**: dữ liệu từ các client hầu như không i.i.d. (non-IID) và mất cân bằng — chính là rào cản lớn nhất của FL. Đồng thời xử lý các **siêu tham số vận hành** (client sampling, local epochs, số round). Đây là nền để đọc mọi cải tiến (G8) và đánh giá.

---

## 2. Kiến thức cần dùng

- FedAvg (G6.4), i.i.d./non-IID (G1.2, G2.3), mất cân bằng lớp (G4.6).

**Ôn nhanh:** non-IID = phân phối dữ liệu khác nhau giữa các nguồn; không thể mô tả bằng một phân phối chung. i.i.d. = cùng phân phối, độc lập.

---

## 3. Câu chuyện mở đầu

Lan chạy FedAvg hai thí nghiệm:
- **Thí nghiệm A:** chia dữ liệu ngẫu nhiên thành 3 client (i.i.d.-nhẹ) → FedAvg gần bằng centralized. 
- **Thí nghiệm B:** chia theo "loại thiết bị" — client điện thoại chỉ có ảnh chụp ngoài trời, client cũ chỉ ảnh trong nhà, client ít dữ liệu gần như chỉ một lớp → **accuracy tụt mạnh**, có client gần như bị "bỏ".

Lan hiểu: dữ liệu thực tế của các bên tham gia **không i.i.d.** (non-IID) và **mất cân bằng** — và đây là nguyên do khiến "trung bình" (FedAvg) không đủ. Cô cũng cần quyết định vận hành: với 100 client, không thể mỗi round cho tất cả 100 chạy (tốn băng thông, client có thể offline) → **chọn mẫu (client sampling)**; mỗi client nên chạy **bao nhiêu local epochs** để cân bằng tiến bộ vs trôi; cần **bao nhiêu round** để hội tụ.

---

## 4. Câu hỏi trọng tâm

**Non-IID/mất cân bằng làm FedAvg kém thế nào (và đánh giá ra sao), và client sampling + local epochs + số round được chọn như thế nào?**

---

## 5. Trực giác

**Non-IID = "mỗi nhóm nhìn một mảnh của bức tranh, và mảnh đó khác nhau".**

Nếu dữ liệu là i.i.d., mỗi client gần như có "mẫu đại diện của toàn cảnh", nên trung bình các update hợp lý. Nhưng non-IID: client A chỉ thấy "ảnh ngoài trời chó", client B chỉ "ảnh trong nhà mèo"... Mỗi client đi hướng *riêng biệt*, các update trung bình lại có thể "giằng co", model toàn cục làm trung bình sai cả hai → **client drift** (trôi client). Chi tiết (sách math, G2.6): mỗi client tối ưu loss cục bộ khác nhau; trung bình tham số không bằng tham số tối ưu của loss gom chung.

**Mất cân bằng (imbalance) giữa client:** client to (nhiều mẫu) → `n_i/N` lớn → áp đảo (FedAvg). Client nhỏ → ít ảnh hưởng → có thể bị "quên". Liên hệ class imbalance (G4.6) nhưng *giữa các client*, không chỉ giữa lớp.

**Client sampling:** với nhiều client, mỗi round chọn một **tập con ngẫu nhiên** (VD 10/100) tham gia — giảm băng thông, đối phó client offline, và tăng đa dạng. FedAvg chuẩn dùng "chọn mẫu" (không cần mọi client mọi round).

**Local epochs:** số vòng huấn luyện cục bộ mỗi client mỗi round. Nhiều → đỡ round (ít truyền thông) nhưng trôi xa (drift) + quá khớp cục bộ. Ít → ổn định hơn nhưng nhiều vòng. Cân giữa hiệu quả truyền thông và độ ổn định.

**Số round:** số vòng lặp gộp. Cần đủ để hội tụ như chẩn đoán bằng đường cong val toàn cục (G3.7); quá ít → chưa học, quá nhiều → lãng phí/lệch (local overfit). Chọn bằng val, không mù.

**Phép so sánh "mỗi lớp học đề thi khác nhau (non-IID), giảng viên tổng hợp bằng trung bình điểm":** trực quan cho vì sao non-IID lệch. **Giới hạn:** thực tế còn nhiều kiểu non-IID (label shift, domain shift, quantity skew, feature shift); không có "một công thức" khắc phục; và client sampling có phân phối xác suất ảnh hưởng kết quả. Đừng đơn giản hóa thành chỉ "một vấn đề".

---

## 6. Từ trực giác đến mô hình

- **Kiểu non-IID thường gặp:** label distribution skew (nhãn khác nhau giữa client), quantity skew (số lượng lệch), domain shift (miền ảnh khác — VD ngoài trời/in nhà). 
- **Ảnh hưởng FedAvg:** mỗi client tối ưu local loss khác nhau → update trung bình lệch global optimum → client drift.
- **Đo non-IID:** so phân phối label/feature giữa client; monitor accuracy client cụ thể/confusion (G4.6).
- **Siêu tham số:** `sampling_frac` (tỉ lệ client tham gia), `local_epochs` (E), `rounds` (R).
- **Quyết định:** balance accuracy/bandwidth/robustness.

**Thuật toán khảo sát vận hành:**
```
1. Chọn tỉ lệ client tham gia (VD 0.2) mỗi round (sampling).
2. Đặt local_epochs E (VD 1-5 khởi đầu).
3. Chạy R rounds; theo dõi val toàn cục mỗi round (G3.7).
4. Điều chỉnh E/sampling/R theo val; dừng khi hội tụ.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Tạo dữ liệu non-IID (label skew) trong mô phỏng.**

```python
# chia dataset thành client, mỗi client chỉ giữ vài lớp (label skew)
# (dùng Subset theo lớp — G1.2; ví dụ client0: lớp 0,1; client1: lớp 2,3...)
```

**Bước 2 — Client sampling (mỗi round chọn tập con).**

```python
import random
client_ids = list(range(10))
participate = random.sample(client_ids, int(0.5 * len(client_ids)))  # 5/10
```

Nhưng lưu ý: sampling ngẫu nhiên mỗi round giúp đa dạng; có thể dùng distribution theo năng lực client (nâng cao).

**Bước 3 — Local epochs kiểm soát.**

```python
E = 2   # mỗi client local-train 2 epochs/round
```
So sánh E=1 vs E=5 theo val/drift (mục Thí nghiệm).

**Bước 4 — Số round / điều kiện dừng.** Chạy nhiều round, vẽ val loss/acc toàn cục; dừng khi val ổn định (G3.7).

**Lỗi thường gặp:** giả định dữ liệu i.i.d. (không khảo sát non-IID); bỏ sampling (yêu cầu mọi client mọi round — tốn/không thực tế); local epochs quá nhiều gây drift; đặt rounds mù (phải theo val).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 2 client non-IID, mỗi client "xoá" ngẫu nhiên vài lớp:

**Bước 1 — Setup (label skew):** client A chỉ có lớp 0,1; client B lớp 2,3; không client nào thấy cả 4.

**Bước 2 — FedAvg chạy:** mỗi round, model cục bộ tối ưu riêng. Trong round đầu, A học tốt lớp 0,1 (overfit local), B học lớp 2,3. Trung bình "lớp lẫn".

**Bước 3 — Đo:** per-client accuracy — A tốt lớp 0,1 nhưng kém 2,3; B ngược. Model toàn cục trung bình có thể "nửa vời" cả hai (không giỏi lớp nào) nếu label skew cực.

**Bước 4 — Diễn giải:** đây là client drift/trùm non-IID. Khắc phục (đọc G8): cân bằng client, regularization (FedProx), một phần đồng bộ, sample đa dạng... — nhưng *chẩn đoán* bằng per-client val là bước đầu.

**Bước 5 — Quan sát vận hành:** với sampling 0.5, mỗi client tham gia ~1/2 rounds — chậm hơn chút nhưng đỡ bandwidth; với E=1 drift nhẹ, E hơn drift mạnh. Dùng val để đặt.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** FedAvg với mọi client, i.i.d.-giả định, E cố định tùy ý, không sampling.

| Phương diện | FedAvg đơn giản | + Khảo sát non-IID & sampling/E |
|---|---|---|
| Non-IID | bỏ qua → drift | chẩn đoán & điều chỉnh |
| Client thực (nhiều/offline) | mọi client mọi round | sampling linh hoạt |
| Truyền thông | nhiều | ít (sampling, E) |
| Đánh đổi | đơn giản | cần khảo sát + đánh giá |

**Cải thiện:** thực tế hơn, ít bandwidth, ổn định non-IID. **Đánh đổi:** phức tạp hơn (chọn sampling/E), phải đánh giá nhiều hơn.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát non-IID phá FedAvg & ảnh hưởng E/sampling.

1. Chia dữ liệu label-skew (mỗi client chỉ 2 lớp) → FedAvg acc thấp hơn i.i.d.
2. Thay đổi `E` ∈ {1, 3, 10}: in val + độ trôi (per-client). Ghi nhận E lớn → drift.
3. Thay đổi `sampling_frac` ∈ {0.3, 1.0}: val & bandwidth. Ghi nhận.
4. Kết luận: khảo sát chứ không mặc định; theo val.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/noniid_demo.py` (phác — tạo non-IID + loop):

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import TensorDataset, DataLoader
import random

torch.manual_seed(0); random.seed(0)
# dữ liệu 4 lớp giả; client chỉ giữ 1 label (label skew)
X = torch.randn(400, 8); y = (X[:, 0] > 0).long() * 2 + (X[:, 1] > 0).long()  # 4 lớp

def pick(keep_labels):
    idx = [i for i in range(len(y)) if y[i] in keep_labels]
    return X[idx], y[idx]

clients = [pick([0,1]), pick([2,3]), pick([0,3])]   # non-IID (thiếu lớp)
counts = [len(c[0]) for c in clients]

def make(): return nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 4))
model = make()

def local_delta(x, yy, base, E=3):
    m = make(); m.load_state_dict({k: v.clone() for k, v in base.items()})
    opt = torch.optim.SGD(m.parameters(), lr=0.01)
    dl = DataLoader(TensorDataset(x, yy), batch_size=32, shuffle=True)
    for _ in range(E):
        for xb, yb in dl: opt.zero_grad(); F.cross_entropy(m(xb), yb).backward(); opt.step()
    st = m.state_dict()
    return {k: st[k] - base[k] for k in base}

for rnd in range(12):
    base = {k: v.detach().clone() for k, v in model.state_dict().items()}
    N = sum(counts)
    with torch.no_grad():
        sd = model.state_dict()
        for k in sd:
            sd[k] = base[k]   # reset để cộng Δ
            for (x, yy), n in zip(clients, counts):
                d = local_delta(x, yy, base)          # (tính lại delta — hơi tốn; gộp)
                sd[k] = sd[k] + (n / N) * (base[k] + ... )  # ❗ để học — đọc code đầy đủ
# (chú ý: đoạn này cần điều chỉnh — đây là khung; đừng chạy nguyên xi)
```

**Ghi chú quan trọng:** đoạn mã trên là *khung minh họa* có lỗi cố ý (cộng delta sai — bạn phải sửa thành FedAvg đúng như G6.4). Mục đích: *thấy non-IID khiến việc gộp khó*. Hãy viết lại đúng FedAvg (G6.4) rồi thêm label-skew để so i.i.d vs non-IID. **Đừng chạy bản trên nguyên xi** — sửa theo G6.4.

**Cách đúng: dùng FedAvg ở G6.4, chỉ thay cách chia dữ liệu (label-skew) và thêm `participants` sampling / vòng lặp đo val.** Đây là chỉ dẫn để bạn tự gắn kết, không phải script "chạy ngay".

**Chú thích trung thực:** tôi cố tình để khung có lỗi để bạn tự sửa theo FedAvg (G6.4) — buộc bạn hiểu aggregation, không copy mù. Trong tài liệu này, đọc G6.4 để có FedAvg đúng.

---

## 12. Đánh giá

**Chỉ số:** so được FedAvg on i.i.d vs non-IID (non-IID thấp hơn); chẩn đoán per-client accuracy/confusion; điều chỉnh E/sampling và biết lý do; biết round dừng theo val.

**Vì sao chọn:** non-IID là "bệnh" trung tâm của FL (gặp lại G8); nắm cơ chế + cách đo là then chốt đọc research.

**Chỉ số không thể hiện:** không phủ mọi kỹ thuật khắc phục (FedProx, cải regularization, cluster...) — G8. Chương này là "chẩn đoán + vận hành cơ bản".

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Non-IID = chỉ 'mất cân bằng số lượng'." — Không; gồm nhiều kiểu: label skew (khác lớp), domain shift (khác miền ảnh), feature shift, quantity skew... Mỗi kiểu ảnh hưởng khác. Đừng gộp.
- **Hiểu lầm 2:** "FedAvg không dùng được khi non-IID." — Không hẳn; với non-IID nhẹ vẫn dùng được (baseline), chỉ kém hơn centralized; non-IID nặng mới cần cải tiến (G8). Không nói "vứt FedAvg".
- **Hiểu lầm 3:** "Mọi client phải tham gia mọi round thì mới đúng." — FedAvg chuẩn dùng *client sampling*; bắt mọi client là không thực tế và có thể giảm đa dạng. Sampling là tính năng, không phải lỗi.
- **Giới hạn:** "chọn client sampling thế nào" (ngẫu nhiên, theo năng lực, bias) nâng cao; đánh giá "round_count tối ưu" phụ thuộc data — luôn theo val, không có số cứng.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Kể 3 kiểu non-IID và ví dụ.
2. Vì sao non-IID gây client drift trong FedAvg (liên hệ G2.6)?
3. Client sampling là gì, lợi ích?

### Luyện tập (sửa đổi / mở rộng)
4. Với 8 client, sampling 0.25 → mỗi round bao nhiêu client? Nếu client nào đó 4 round liên tiếp không được chọn thì sao?
5. Thay đổi E (1 vs 10) trên thí nghiệm non-IID — quan sát drift/per-client.

### Thử thách (thiết kế / liên hệ)
6. Thiết kế một metric "mức non-IID" đơn giản (VD: đo sự khác phân phối label giữa client) — và một cách báo cáo FL theo non-IID (nối G9: khi nào kết luận).
7. Nối G8: đề xuất 2 hướng khắc phục non-IID (regularization, cân bằng client) và lý do — mở cho G8.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Label distribution skew (nhãn khác); quantity skew (số mẫu khác); domain shift (miền ảnh/môi trường khác).
2. Mỗi client tối ưu loss cục bộ theo phân phối riêng (G2.6), đi hướng khác; trung bình Δ không tương đương tối ưu của loss gom → weight global lệch ("client drift").
3. Chọn tập con client tham gia mỗi round → giảm bandwidth/xử lý offline/tăng đa dạng.
4. ×0.25×8 = 2 client/round. Nếu 1 client 4 round không chọn → ít đóng góp; nhưng ngẫu nhiên vẫn công bằng dài hạn; nếu dữ liệu client đó quan trọng, tăng sampling hoặc ưu tiên (nâng cao).
5. E lớn → client trôi xa (overfit local), non-IID làm trầm trọng; val toàn cục giảm. E ngỏ nhỏ → ổn nhưng nhiều round. Cân bằng.
6. E.g., đo `KL divergence` giữa phân phối label/x̄ của client vs tổng; hoặc đơn giản đếm "client chỉ có k lớp/T lớp". Báo cáo FL nên ghi rõ cách chia non-IID (seed, skew) để tái lập (G1.5, G9).
7. (a) Regularization (phạt client trôi xa model toàn cục — FedProx) giữ update gần, giảm drift. (b) Cân bằng trọng số / điều chỉnh client tham gia để client nhỏ không bị bỏ. Hai hướng nền của G8.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Non-IID** (label/domain/quantity skew) là rào cản lớn của FL, gây **client drift**.
2. Đo/dự đoán non-IID bằng **per-client accuracy, phân phối label, confusion** (không chỉ accuracy trung bình).
3. **Client sampling** — mỗi round chọn tập con client (giảm bandwidth, offline).
4. **Local epochs E** — cân bandwidth/ổn định; lớn dễ drift.
5. **Số round** — chọn theo val toàn cục, không mù; các cải tiến (FedProx...) sẽ xuất phát từ đây (G8).

**Tự kiểm tra:**
- 3 kiểu non-IID?
- Vì sao non-IID phá FedAvg?
- Client sampling lợi gì?
- E lớn có hại thế nào?
- Đo/cải thiện non-IID — nối G8.

---

## 16. Đọc sâu bằng trực giác — đông người chưa chắc đủ góc nhìn

Một chuỗi cửa hàng có chi nhánh lớn bán chủ yếu áo khoác và chi nhánh nhỏ bán đồ mùa hè. Sự khác nhau vừa nằm ở số hóa đơn, vừa nằm ở loại hàng. Tăng số mẫu không tự làm hai phân phối trở nên giống nhau.

| Khác biệt đời thực | Tên trong FL | Phép kiểm đơn giản |
|---|---|---|
| Cửa hàng lớn có nhiều hóa đơn | Quantity skew | Đếm mẫu theo client |
| Mỗi nơi bán chủ yếu một nhóm hàng | Label skew | Bảng tần suất lớp theo client |
| Cùng hàng nhưng camera khác nhau | Domain shift | Kiểm đặc trưng và lỗi theo miền |

**Đọc công thức:** `Acc_micro=Σi niAcci/Σi ni`, còn `Acc_macro=(Σi Acci)/m`: “micro cân theo mẫu; macro cho mỗi client một tiếng nói bằng nhau”. Hai số đo hai mục tiêu; macro không có nghĩa phép gộp model cũng buộc phải cân đều.

**Tính tay:** client A có 800 ảnh test, accuracy 90%; B có 200 ảnh, accuracy 50%. Micro là `(720+100)/1000=82%`; macro là `(90+50)/2=70%`. Báo 82% một mình có thể che việc B chỉ đúng một nửa. Nếu mỗi round chọn ngẫu nhiên 1 trong 5 client với xác suất bằng nhau, sau 10 round một client tham gia kỳ vọng 2 lần, không bảo đảm đúng 2 lần.

**Phản ví dụ:** báo micro 82% rồi kết luận cả hai client đều ổn. Client B chỉ đạt 50%, nên con số gộp che đúng nhóm yếu. Muốn thấy chênh lệch phải đọc thêm macro hoặc accuracy từng client.

**Giới hạn:** tăng local epoch có thể giảm số round cần thiết nhưng cũng làm update xa điểm chung hơn. Không thể kết luận non-IID luôn làm FedAvg thất bại: độ khó phụ thuộc loại lệch, loss, mô hình và lịch học. Cũng không thể kết luận chọn nhiều client tự khắc sửa label skew; có thể toàn bộ client được chọn vẫn thiếu một lớp.

:::interactive noniid
:::

:::quiz
Hai client đạt 90% trên 800 mẫu và 50% trên 200 mẫu. Client-macro accuracy là bao nhiêu?
A. 82%
B. 90%
C. 70%
Đáp án: C
Giải thích: Macro cân hai client bằng nhau: (90+50)/2=70%. 82% là sample-micro accuracy.
:::

:::goi-y
Từ “macro theo client” yêu cầu chia tổng hai accuracy cho hai, bất kể mỗi nơi có bao nhiêu mẫu.
:::

:::loi-giai
Macro=70%; micro=82%. Đọc cả hai, cộng thêm độ chính xác client yếu nhất, giúp phân biệt cải thiện cho nhiều mẫu với cải thiện cho nhiều bên tham gia.
:::
