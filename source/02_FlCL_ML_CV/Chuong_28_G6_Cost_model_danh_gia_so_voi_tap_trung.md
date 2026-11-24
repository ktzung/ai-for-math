# Chương 6.7–6.8 — Chi phí truyền thông/tài nguyên và đánh giá FL so với huấn luyện tập trung (Giai đoạn 6)

> **Câu hỏi trọng tâm:** *Ngoài accuracy, FL còn "trả giá" bằng băng thông, thời gian và tài nguyên — làm sao đo và so sánh FL với tập trung một cách công bằng?*

---

## 1. Vị trí trong lộ trình

Đã hiểu non-IID, FedAvg, sampling (G6.4–6). Giờ mở rộng sang **thước đo thành công của FL**: không chỉ accuracy, mà là **chi phí truyền thông / thời gian / tài nguyên** (đây là "đánh đổi" đặc trưng của FL), và **cách so sánh công bằng với huấn luyện tập trung** (baseline). Đây là kỹ năng đánh giá để đọc nghiên cứu (G9) và chọn phương pháp (G8).

---

## 2. Kiến thức cần dùng

- FedAvg (G6.4), non-IID (G6.5), đánh giá (G2.3, G2.7), train/val (G2.3).

**Ôn nhanh:** FL đánh đổi gom-dữ-liệu để lấy privacy/ownership — nhưng "nó có tốt hơn không" phải đo cả accuracy lẫn cost. Baseline = centralized (gom hết).

---

## 3. Câu chuyện mở đầu

Lan so sánh FedAvg với centralized: FedAvg đạt accuracy thấp hơn một chút. Người hướng dẫn hỏi: *"Vậy so sánh đó có 'công bằng' không? Bạn có tính số vòng truyền thông? Băng thông mỗi client? Thời gian một round? FedAvg 'chậm' vì bandwidth, không phải vì compute."*

Lan học: đánh giá FL phải kèm **cost model** — communication cost (số bytes/giao tiếp), number of rounds, total time, và tài nguyên client (CPU, bộ nhớ). Và so với centralized phải *chỉ rõ giả định* (cùng data, cùng seed, cùng tài nguyên). Nếu chỉ so accuracy, bạn bỏ lỡ bức tranh: FL thường "trả thêm bandwidth/time để đổi privacy", và cost đó quyết định có "đáng" hay không.

---

## 4. Câu hỏi trọng tâm

**Cost model của FL (truyền thông, thời gian, tài nguyên) là gì, và đánh giá FL vs centralized phải đo/report những gì để công bằng?**

---

## 5. Trực giác

**Cost = "cái giá để vận hành FL" ngoài accuracy.** Ba trục chính:
- **Communication cost:** mỗi round server↔client gửi model. Với m model trọng số × bytes × số client × số round → chi phí băng thông. Đây là "tài nguyên khan" đặc trưng FL (vừ lý do tồn tại FL ở G6.1: mạng).
- **Time / wall-clock:** FL không "1 epoch nhanh" như centralized; mỗi round mất thời gian client chạy cục bộ (chậm nhất client quyết định — straggler) + giao tiếp. Cần đo tổng thời gian.
- **Resource (compute/memory):** tính toán client (nhỏ/thiết bị biên), tải model (bộ nhớ). Thường hạn chế hơn server trung tâm.

**Accuracy–cost trade-off:** FedAvg có thể giảm accuracy so với centralized, nhưng "đổi" được privacy/ownership. Vấn đề là *đo cost đúng* để biết đáng hay không.

**Đánh giá công bằng vs centralized:**
- **Centralized baseline:** huấn luyện trên *toàn bộ dữ liệu gom* (mẫu đủ) — điểm tham chiếu lý thuyết (thường cao nhất).
- FL không bằng được trên accuracy (không đủ data tập trung, non-IID), nhưng đó là do *điều kiện ràng buộc* (không gom được). So sánh cần: cùng dữ liệu / cùng seed / cùng quy mô / cùng setup đánh giá (G2.3).
- **Granularity:** báo accuracy theo FL, và nếu "đáng" phải kể cost — mục tiêu "đủ tốt với cost chấp nhận", không nhất thiết "bằng centralized".

**Phép so sánh "giải bài toán mà phải giao bài cho từng học sinh xem làm riêng (thay vì chép chung) — nhanh hơn ai thấy hết nhưng tự làm":** trực quan cho trade-off (mất chút thời gian/độ chính xác để giữ riêng). **Giới hạn:** cost-model FL có nhiều chi tiết (sample rate ảnh hưởng rounds, compression, stragglers); không có "số công thức cost phổ quát" — bạn tự định nghĩa metric phù hợp vấn đề. Đừng chỉ dùng "số round" làm thước đo thay.

---

## 6. Từ trực giác đến mô hình

- **Cost components (báo cáo):**
  - `#rounds`, `#communicated_bytes` (≈ model_size × #clients × #participation).
  - `wall_time` (thời gian thực), client resource (CPU/mem).
  - `local epochs`, `sampling frac` (đã biết G6.6 — affect cost).
- **Accuracy metrics:** val/test accuracy trên test chuẩn phù hợp; per-client (G6.5) khi non-IID.
- **Baseline:** centralized trên cùng dữ liệu (gom); bình thường hóa so sánh cùng seed/tài nguyên.

**Thuật toán (báo cáo đánh giá FL trung thực):**
```
1. Chạy centralized (gom hết) → baseline accuracy & cost.
2. Chạy FL (FedAvg...) → accuracy & ghi cost (#round, bytes, time).
3. So cùng seed/data/target junks; ghi per-client accuracy khi non-IID.
4. Report "accuracy đạt được với cost bao nhiêu" — không chỉ accuracy.
5. Thảo luận: cost trade-off có đáng không trong bài toán (privacy/ownership).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Đo communicated bytes (băng thông).**

```python
# trong bản FL của bạn (G6.4), đếm:
# số parameters model × float bytes × số client tham gia × số round
model_bytes = sum(p.numel() for p in model.parameters()) * 4   # float32
total_comm = model_bytes * num_clients_participating * rounds
print("comm bytes ~", total_comm)
```

**Bước 2 — Đo wall time (thời gian).**

```python
import time
t0 = time.time()
# chạy FL loop
t_fl = time.time() - t0
```

- Cần tách phần "client chậm nhất" (straggler) nếu mô phỏng — ghi thời gian thực mỗi client/round.

**Bước 3 — Đo resource client.** Ghi batch size, epochs, bộ nhớ model — vì thiết bị biên hạn chế.

**Bước 4 — Bảng báo cáo.**

| Setup | Val accuracy | #Rounds | Comm (MB) | Wall time |
|---|---|---|---|---|
| Centralized | 0.93 | 1 (ép) | toàn-dữ-liệu | X |
| FedAvg i.i.d. | 0.92 | 40 | Y | Z |

**Bước 5 — Đánh giá công bằng:** thiết lập giống nhau (seed, epoch, data), so cả accuracy lẫn cost.

**Lỗi thường gặp:** chỉ so accuracy bỏ cost; quên seed để tái lập (G1.5); centralized "tốn" không được tính (phải gom data lookup mất) — ghi điều kiện; per-client accuracy bị che khi non-IID (chỉ trung bình).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** model 1 triệu tham số (4 MB nếu float32, tức 32 bit = 4 byte mỗi tham số). FL 20 rounds, mỗi round 5 client tham gia; centralized train trên data gom hết.

**Bước 1 — Comm cost FL:** `1e6 params × 4B = 4MB` mỗi client mỗi round. Nếu mỗi round 5 client (gửi Δ): `20 rounds × 5 client × 4 MB = 400 MB` **upload**. Nếu mỗi round còn gửi đầy đủ model tới từng client bằng unicast, download cũng 400 MB, tổng hai chiều là **800 MB**, chưa tính metadata, retry hay giao thức bảo mật. Tương đương tải nhiều ảnh nếu data lớn hơn — nhưng *ít hơn* tải toàn bộ data về trung tâm nếu data rất lớn.

**Bước 2 — So:** centralized phải gom data (tốn bandwidth tải data, có thể không đúng privacy). FL tốn `400 MB` riêng chiều upload model nhưng data không rời client — trade-off rõ.

**Bước 3 — Wall time:** mỗi round chờ client chậm (straggler) + communication latency. Cần ghi tổng thời gian thực, không phải "epoch" ảo.

**Bước 4 — Báo cáo:** accuracy FL 0.90 (non-IID nhẹ) vs centralized 0.93, nhưng centralized không khả thi (privacy). Kết luận: "đủ tốt với cost chấp nhận" — đây là cách đọc đúng.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ so accuracy, chỉ ghi "số round".

| Phương diện | Chỉ accuracy / #round | Cost model đầy đủ |
|---|---|---|
| Băng thông | không biết | ghi bytes |
| Thời gian thực | không | wall time/straggler |
| Tài nguyên client | không | resource |
| Tính công bằng | thiếu | đầy đủ (cùng setup) |
| Đánh đổi | nhanh, dễ "màu mỡ" | mất thời gian đo |

**Cải thiện:** đánh giá trung thực, quyết định "đáng không" đúng. **Đánh đổi:** cần đo & ghi (chút công) — bắt buộc để tái lập/rale (G9).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát trade-off accuracy–cost.

1. Chạy centralized (gom hết) vs FedAvg (20 rounds).
2. Ghi: accuracy (val), #round, comm bytes (số tham số × 4 × client × round), wall time.
3. Thay đổi `sampling_frac` giảm → comm giảm, accuracy có giảm không? Ghi nhận.
4. Vẽ 2 đường (accuracy vs #round) cho centralized(1 điểm) và FL.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/fl_cost_report.py` (phát triển từ G6.4 — thêm đo cost):

```python
import torch, torch.nn as nn, torch.nn.functional as F, time
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(0)
X = torch.randn(300, 8); y = (X[:,0] + 0.2*X[:,1] > 0).long()
splits = [TensorDataset(X[:120],y[:120]), TensorDataset(X[120:210],y[120:210]), TensorDataset(X[210:],y[210:])]
dls = [DataLoader(s,32,shuffle=True) for s in splits]; counts=[120,90,90]

def make(): return nn.Sequential(nn.Linear(8,32), nn.ReLU(), nn.Linear(32,2))
model = make()

def local_delta(dl, base, E=3):
    m = make(); m.load_state_dict({k:v.clone() for k,v in base.items()})
    opt = torch.optim.SGD(m.parameters(), lr=0.01)
    for _ in range(E):
        for xb,yb in dl: opt.zero_grad(); F.cross_entropy(m(xb),yb).backward(); opt.step()
    st = m.state_dict(); return {k: st[k]-base[k] for k in base}

n_params = sum(p.numel() for p in model.parameters()); b_per_client = n_params*4
t0=time.time(); R=15
for _ in range(R):
    base={k:v.detach().clone() for k,v in model.state_dict().items()}
    ds=[local_delta(dl, base) for dl in dls]; N=sum(counts)
    with torch.no_grad():
        sd=model.state_dict()
        for k in sd:
            sd[k]=base[k]
            for (dl,n),d in zip(dls,counts): sd[k]=sd[k]+ (n/N)*d[k]
print("acc:", round((model(X).argmax(1)==y).float().mean().item(),3))
print("comm MB:", round(R*3*b_per_client/1e6,1))      # 3 clients mỗi round
print("wall time s:", round(time.time()-t0,2))
```

**Kết quả dự kiến:** in accuracy + comm MB + wall time — báo cáo cost đầy đủ.

**Lỗi thường gặp:** quên đếm `n_params`; bỏ wall time; ghi cost không ghi seed. Bản trên chạy được, tiếp tục so với centralized để có table.

**Chú thích trung thực:** model ảnh 2 lớp đơn giản, comm nhỏ; mục đích là *cấu trúc* đo cost (bytes/time), không phải con số meaningful trong production. So centralized (G6.4 thí nghiệm) để thấy trade-off.

---

## 12. Đánh giá

**Chỉ số:** ghi cost model (bytes, wall time, resource) bên cạnh accuracy; so centralized/fedAvg theo đúng setup; đọc "đủ tốt với cost chấp nhận"; hiểu non-IID cần per-client accuracy.

**Vì sao chọn:** FL thực dụng = accuracy + cost + điều kiện. Đây là "kỹ năng báo cáo FL" mà G9 (đọc/báo research) trông cậy.

**Chỉ số không thể hiện:** không phủ compression/quantization/model-size-reduction (nâng cao G8); không chuẩn hóa "FL vs centralized" theo mọi cách (RAG/straggler) — nền.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "FL 'tệ hơn' centralized chỉ vì accuracy thấp." — Sai cách đo: FL đổi accuracy ít lấy privacy/ownership/khả năng không gom data. So sánh phải kèm cost + điều kiện, mới hiểu "tại sao đáng dùng".
- **Hiểu lầm 2:** "'#rounds thấp' = FL rẻ." — Chưa chắc; phụ thuộc băng thông mỗi round, straggler, resource. Đo bytes & wall time, không chỉ round.
- **Hiểu lầm 3:** "So sánh chỉ cần cùng accuracy, không cần cùng seed/setup." — Sai; không cùng setup → không tái lập → không công bằng (G1.5, G2.3). Luôn ghi seed, tỉ lệ chia, model, epochs.
- **Giới hạn:** cost model có vùng xám (compression, network topology) — không có công thức duy nhất; tự định nghĩa phù hợp. Và "đáng không" là quyết định miền (privacy có giá trị bao nhiêu?) — không phải thuần công thức.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Ba loại cost của FL.
2. Vì sao "số round" không đủ để đo cost?
3. Centralized baseline dùng để làm gì trong so sánh.

### Luyện tập (sửa đổi / mở rộng)
4. Model 2 triệu params, 10 client/round, 50 rounds → comm bytes? (float32).
5. Trong fl_cost_report: giảm sampling (2 client/round) — comm thay đổi, accuracy? Ghi nhận trade-off.
6. So fl_cost_report với centralized (G6.4) và nêu bảng so sánh (acc, rounds, bytes, time).

### Thử thách (thiết kế / liên hệ)
7. Một buổi nghiên cứu báo cáo "FL accuracy 0.90, centralized 0.93" nhưng không ghi cost. Bạn cần hỏi thêm dữ liệu gì (min 3 câu) — nối G9.
8. Thảo luận: khi nào "FL đáng" hơn centralized dù accuracy thấp hơn (gợi ý: khi data không thể gom — privacy/pháp lý/ownership; chi phí gom lớn hơn cost FL).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Communication (bytes), wall-time/timeliness, resource client (compute/memory). 
2. Vì cost thực phụ thuộc băng thông mỗi round, số client tham gia, straggler, thời gian local train — round chưa nói lên bytes/time.
3. Điểm tham chiếu lý thuyết (gom toàn bộ data, thường accuracy cao nhất) để đo "FL đổi bao nhiêu accuracy lấy privacy".
4. `2e6×4B = 8MB/client/round × 10 × 50 = 4000 MB ≈ 4 GB`.
5. Sampling thấp → comm giảm, nhưng mỗi client tham gia dày hơn/chóng hơn → accuracy có thể giảm hoặc cần nhiều round. Ghi nhận trade-off (G6.6).
6. Centralized: acc cao hơn, không comm bytes (nhưng "gom data" cost không được tính), thời gian nhỏ. FedAvg: acc hơi thấp, comm MB, thời gian. Bảng rõ trade-off.
7. Hỏi: (a) seed/tỉ lệ chia/độ non-IID; (b) số round/client sampling/local epochs; (c) bytes truyền & wall time; (d) per-client accuracy (không chỉ mean); (e) tài nguyên client. (G9.)
8. FL đáng khi dữ liệu không thể gom (pháp lý/privacy/ownership) dù accuracy thấp hơn; hoặc chi phí gom (bandwidth data, latency) lớn hơn cost FL; hoặc cần model chạy tại biên. Đây là quyết định miền, không chỉ con số accuracy.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Cost FL gồm **communication (bytes), wall-time, tài nguyên client** — cần đo bên cạnh accuracy.
2. **So sánh centralized** là baseline, nhưng phải kèm cost + setup (seed, non-IID, sampling) mới công bằng.
3. "Số round" không đủ; đo **bytes & thời gian**.
4. FL thường "đổi chút accuracy lấy privacy/ownership" — đáng hay không tùy miền.
5. Kỹ năng này là nền để đọc/báo research FL (G9) và chọn phương pháp (G8).

**Tự kiểm tra:**
- 3 loại cost? 
- Vì sao không chỉ so accuracy?
- Bảng báo cáo FL nên có cột gì.
- Khi nào FL đáng dùng dù accuracy thấp hơn?

---

## 16. Đọc sâu bằng trực giác — đọc hóa đơn truyền thông hai chiều

Giao một tài liệu cho năm người rồi nhận năm bản đã sửa tạo mười lần chuyển tài liệu, không phải năm. Chi phí FL cũng vậy: upload cập nhật và download model là hai mục khác nhau trên hóa đơn.

| Hoạt động | Đại lượng | Dễ quên điều gì? |
|---|---|---|
| Server gửi bản chung | Download bytes | Gửi riêng hay multicast |
| Client gửi đề xuất | Upload bytes | Dense delta vẫn đủ số phần tử |
| Chờ hoàn thành một round | Wall-clock | Client chậm, độ trễ và retry |

**Đọc công thức:** `B≈R·m·(Sdown+Sup)`: “số round nhân số client tham gia mỗi round nhân tổng byte tải xuống và tải lên mỗi client”. Công thức giả định mọi lượt tham gia truyền đủ kích thước này; chưa tính metadata, mã hóa, truyền lại và lượt tham gia thay đổi.

**Tính tay:** model một triệu tham số float32 chiếm 4.000.000 byte, tức 4 MB thập phân; 32 bit bằng 4 byte. Với 20 round, mỗi round 5 client, download và upload đều 4 MB thì tổng là `20×5×8=800 MB`. Chỉ upload là 400 MB. Nếu chỉ head 10.000 tham số được trao đổi, mỗi chiều 0.04 MB và phần trao đổi head là 8 MB; vẫn phải tính lần tải backbone đầu tiên nếu có.

**Thử tương tác:** thay kích thước model, số client mỗi vòng và số vòng để đọc hóa đơn hai chiều. Công thức chưa tính header, retry, multicast và chênh lệch băng thông.

:::interactive cost
:::

**Phản ví dụ:** một phương pháp cần 10 round nhưng mỗi round 20 client có thể gửi nhiều byte hơn phương pháp 20 round với 5 client. Ít round không tự đồng nghĩa ít dữ liệu truyền. Tương tự, cùng byte chưa chắc cùng thời gian vì băng thông client khác nhau. Hãy ghi rõ MB thập phân hay MiB nhị phân để người khác kiểm lại phép tính.

:::quiz
Mỗi lượt client tải xuống 4 MB và tải lên 4 MB; có 100 lượt tham gia tổng cộng. Tổng hai chiều là bao nhiêu?
A. 400 MB
B. 800 MB
C. 8 MB
Đáp án: B
Giải thích: Mỗi lượt tốn 8 MB hai chiều, nhân 100 bằng 800 MB. 400 MB mới tính một chiều.
:::

:::goi-y
Đơn vị “lượt tham gia” đã gộp số round và số client, nên không nhân chúng thêm lần nữa.
:::

:::loi-giai
`100×(4+4)=800 MB`. Báo riêng upload/download rồi mới cộng; khi giao thức thay đổi, người đọc biết chính xác phần nào đã giảm.
:::
