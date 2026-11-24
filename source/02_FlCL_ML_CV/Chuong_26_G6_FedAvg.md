# Chương 6.4 — Federated Averaging (FedAvg): phương pháp khởi đầu của học liên kết (Giai đoạn 6)

> **Câu hỏi trọng tâm:** *Cách gộp đơn giản nhất nhưng hiệu quả — trung bình các mô hình client — hoạt động thế nào, và vì sao nó là "chuẩn so sánh" cho mọi phương pháp FL khác?*

---

## 1. Vị trí trong lộ trình

G6.1–3 đã dựng vòng lặp FL. Giờ đến **công thức gộp cụ thể và kinh điển nhất**: **Federated Averaging (FedAvg)** — nền tảng của mọi thí nghiệm FL bạn sẽ viết, và là *baseline* bắt buộc khi so sánh (G9). FedAvg chính là câu trả lời cho "câu chuyện 3 client w=1.0/0.4/0.2" ở G6.1.

---

## 2. Kiến thức cần dùng

- Vòng FL (G6.1–3), local train (G3.7), trung bình có trọng số (G1.3).
- Concept: "client nghịch mo" (G6.5 nhắc sau — FedAvg giả định i.i.d.-nhẹ lúc đầu).

**Ôn nhanh:** `W_i` = model client i sau local train; `n_i` = số mẫu client i. Aggregation = gộp nhiều model thành 1.

---

## 3. Câu chuyện mở đầu

Lan cần viết thí nghiệm FL đầu tiên. Cô tìm hiểu và gặp **FedAvg** — cái tên xuất hiện khắp nơi. Ý tưởng gây ngạc nhiên vì đơn giản: *mỗi client huấn luyện cục bộ, rồi server chỉ lấy trung bình các trọng số*, với "trọng số" theo số lượng mẫu của mỗi client.

Người có kinh nghiệm giải thích: FedAvg là **phương pháp gốc**, từ bài báo "Communication-Efficient Learning of Deep Networks from Decentralized Data" (McMahan et al., 2017) — ý tưởng: client train nhiều epoch cục bộ (thay vì 1 bước) để giảm vòng lặp truyền thông, rồi trung bình. Dù đơn giản, nó là **baseline** mọi thứ so sánh: "có FedAvg không?" Nếu phương pháp của bạn không hơn FedAvg, hãy làm đúng FedAvg trước khi thêm phức tạp.

---

## 4. Câu hỏi trọng tâm

**Công thức FedAvg, vì sao nó là baseline chuẩn, và cách cài chuẩn (gửi Δ hay W, trọng số mẫu, local epochs) là gì?**

---

## 5. Trực giác

**FedAvg = "lấy trung bình có trọng số theo số mẫu".** Mỗi client huấn luyện cục bộ và gửi `W_i` (hoặc Δ_i = W_i − W). Server tính:

```
W_new = (Σᵢ nᵢ · Wᵢ) / (Σᵢ nᵢ)
```

(n_i = số mẫu client i). Client có nhiều mẫu ảnh hưởng hơn — hợp lý vì chúng có "tín hiệu" nhiều hơn.

**Vì sao hoạt động (trực giác):** nếu dữ liệu các client là i.i.d.-nhẹ (chung phân phối), mỗi bản cập nhật gần như hướng đi "đúng chung" đến điểm tối ưu; trung bình chúng xấp xỉ một bước gradient "toàn cục". Đây giống "tạo một lô dữ liệu lớn giả" từ các lô nhỏ cục bộ. Khi dữ liệu **non-IID** mạnh (G6.5), trực giác này đổ vỡ — các client đi hướng khác nhau, trung bình nông dẫn sai — nhưng FedAvg vẫn là chỗ bắt đầu.

**Gửi Δ hay W?** Hai cách tương đương về toán: gửi `W_i` rồi trung bình, hoặc gửi `Δ_i = W_i − W_global` rồi `W' = W + trung_bình(Δ_i)`. Δ và W có cùng số phần tử; nếu cùng mã hóa dense float32 thì **cùng số byte**, dù giá trị Δ nhỏ. Chỉ giảm byte khi có thêm cơ chế như lượng tử hóa, sparsification hoặc mã hóa thích hợp. Secure Aggregation có thể bảo vệ tổng cập nhật theo giao thức cụ thể — ta sẽ làm "gửi Δ".

**Local epochs quan trọng:** mỗi client train nhiều epoch cục bộ → giảm số vòng truyền thông (đây chính là ý tưởng chống "bandwidth" của FedAvg). Nhưng local quá nhiều → client "trôi" xa (client drift, G6.5/G8). Đánh đổi.

**Phép so sánh "lấy ý kiến từng tổ, gộp bằng trọng số người":** trực quan cho cơ chế trung bình. **Giới hạn:** không có gì đảm bảo "trung bình các lời khuyên đúng nhất" khi mỗi tổ nhìn sai phía (non-IID) — FedAvg không phải thuật toán "tự cân bằng phân phối"; nó là baseline. Đừng hỏi FedAvg "phải an toàn trước non-IID"; đó là việc G6.5/G8.

---

## 6. Từ trực giác đến mô hình

- **Server:** giữ `W`, mỗi round chọn client, broadcast, nhận Δ_i, gộp.
- **Client:** `W_i = local_train(W_init, data_i, local_epochs)`; gửi `Δ_i = W_i − W`.
- **Aggregation (FedAvg, gửi Δ, trọng số mẫu):**
  `W ← W + Σᵢ (nᵢ/N) · Δ_i`, với `N = Σᵢ nᵢ`.
- **Đánh giá:** val trên test chuẩn / qua client.

**Thuật toán FedAvg (1 round):**
```
1. Server chọn m client, broadcast W.
2. Mỗi client: W_i ← local_train(W), Δ_i ← W_i − W.
3. Client gửi (nᵢ, Δ_i).
4. Server: W ← W + Σ (nᵢ/N) Δᵢ .
5. Lặp R rounds.
```

---

## 7. Thuật toán từng bước (PyTorch, gửi Δ)

Các hàm dưới đây dùng mô hình CPU với `state_dict` chỉ chứa tensor số thực. Ví dụ Linear/ReLU thỏa điều kiện này; BatchNorm có bộ đếm nguyên cần chính sách riêng, không được trung bình tùy tiện. Mọi client trong round phải bắt đầu từ **cùng snapshot** global.

```python
import copy
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

def local_train_delta(model, dl, epochs=3, lr=0.05):
    base = {k: v.detach().clone() for k, v in model.state_dict().items()}
    if any(not v.is_floating_point() for v in base.values()):
        raise ValueError("Ví dụ này chỉ hỗ trợ state tensor số thực")
    local = copy.deepcopy(model)
    local.train()
    opt = torch.optim.SGD(local.parameters(), lr=lr)
    for _ in range(epochs):
        for xb, yb in dl:
            opt.zero_grad()
            loss = F.cross_entropy(local(xb), yb)
            loss.backward()
            opt.step()
    return {k: v.detach().clone() - base[k]
            for k, v in local.state_dict().items()}

def fedavg_update(model, deltas, counts):
    if not deltas or len(deltas) != len(counts) or any(n <= 0 for n in counts):
        raise ValueError("Cần một số mẫu dương cho mỗi cập nhật client")
    total = sum(counts)
    base = model.state_dict()
    if any(not v.is_floating_point() for v in base.values()):
        raise ValueError("Ví dụ này chỉ hỗ trợ state tensor số thực")
    updated = {}
    for name, value in base.items():
        mean_delta = torch.zeros_like(value)
        for delta, n in zip(deltas, counts):
            mean_delta.add_(delta[name], alpha=n / total)
        updated[name] = value + mean_delta
    model.load_state_dict(updated)  # gán model thật, không chỉ thay một dict tạm
    return model
```

**Đọc vòng round:** `clients` là danh sách `(DataLoader, số_mẫu)`. Dùng danh sách cho cả `deltas` và `counts`; không nhầm dictionary với list. Chỉ gộp sau khi mọi local delta đã tính xong từ model gốc chưa thay đổi.

```python
# Dùng dls và counts được tạo ở mục 11.
# clients = list(zip(dls, counts))
# for rnd in range(15):
#     deltas = [local_train_delta(model, dl) for dl, _ in clients]
#     model = fedavg_update(model, deltas, [n for _, n in clients])
```

**Lỗi thường gặp:** không clone snapshot; client sau bắt đầu từ model đã được client trước sửa; weighted delta đúng nhưng quên `load_state_dict`; gộp W rồi cộng thêm W lần nữa.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** W ban đầu = 2.0 (1 tham số), 2 client: A n=100 → local W_A=2.5 (Δ_A=0.5); B n=300 → W_B=2.2 (Δ_B=0.2).

**Bước 1 — Trọng số:** N=400; w_A=100/400=0.25; w_B=300/400=0.75.

**Bước 2 — Weighted Δ:** `0.25×0.5 + 0.75×0.2 = 0.125 + 0.15 = 0.275`.

**Bước 3 — W mới:** `W' = W + 0.275 = 2.0 + 0.275 = 2.275`.

**Bước 4 — Diễn giải:** client B nhiều mẫu → ảnh hưởng lớn (0.75) → W' nghiêng về W_B. Nếu dùng trung bình đơn `(0.5+0.2)/2=0.35` → W'=2.35 — khác. **Weighted theo mẫu** là FedAvg chuẩn.

**Bước 5 — Hội tụ:** đây mới là phép gộp một round, chưa chứng minh hội tụ. Hành vi nhiều round phụ thuộc loss, learning rate, local epochs và dữ liệu; với non-IID có thể lệch (G6.5).

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "trung bình đơn" các W_i (không theo mẫu).

| Phương diện | Trung bình đơn | FedAvg (weighted) |
|---|---|---|
| Cân theo độ nhiều dữ liệu | không | có (n_i/N) |
| Hợp lý khi client lệch mẫu | kém | hợp lý hơn |
| Với baseline | — | chuẩn để so sánh |
| Đánh đổi | đơn giản | cần truyền n_i |

**Cải thiện:** client nhiều mẫu đóng góp xứng đáng. **Đánh đổi:** cần biết n_i (đôi khi privacy của số mẫu — nhẹ hơn nội dung dữ liệu, thường chấp nhận; có cách ẩn n_i qua secure agg).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát FedAvg hội tụ và so với centralized.

1. Chia dữ liệu thành 3 client (i.i.d.-nhẹ).
2. Chạy (a) centralized 1 model, (b) FL-FedAvg 20 rounds, (c) với client chỉ 1 client (chỉ client nhất= centralized quay lại).
3. So val: FedAvg gần với centralized khi i.i.d.-nhẹ; nếu non-IID mạnh, đội sút hiện ra (mở đầu G6.5).
4. Ghi lại: FedAvg = baseline; so phương pháp khác với FedAvg.

---

## 11. Thực hành lập trình (FedAvg đầy đủ — 2-3 client)

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/fedavg.py`:

```python
# Chạy tiếp sau hai hàm local_train_delta và fedavg_update ở mục 7.
torch.manual_seed(0)
X = torch.randn(300, 8)
y = (X[:, 0] + 0.2 * X[:, 1] > 0).long()
splits = [TensorDataset(X[:120], y[:120]),
          TensorDataset(X[120:210], y[120:210]),
          TensorDataset(X[210:], y[210:])]
dls = [DataLoader(part, batch_size=32, shuffle=True) for part in splits]
counts = [len(part) for part in splits]
model = nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 2))
clients = list(zip(dls, counts))
for rnd in range(15):
    deltas = [local_train_delta(model, dl) for dl, _ in clients]
    fedavg_update(model, deltas, [n for _, n in clients])
model.eval()
with torch.no_grad():
    train_acc = (model(X).argmax(1) == y).float().mean().item()
print("train accuracy:", round(train_acc, 3))
```


**Kết quả cần quan sát:** model được cập nhật qua 15 round và train accuracy tăng trên bài toán giả lập dễ. Đây là **đánh giá trên dữ liệu train**, không phải test độc lập; cần tách test trước khi kết luận khả năng tổng quát hóa. Không coi một mốc accuracy cụ thể là bảo đảm.

**Lỗi thường gặp:** không `lr` trong aggregation (mặc định 1.0 hoặc đưa vào local); clone sai state; làm trung bình trên dữ liệu khác số mẫu (quên weight); cập nhật model gốc thay vì Δ.

**Chú thích trung thực:** dữ liệu i.i.d.-nhẹ (sinh cùng quy tắc) nên FedAvg hội tụ tốt; với non-IID mạnh sẽ lệch (G6.5 làm rõ bằng thí nghiệm cụ thể). Đây là mã mô phỏng chuẩn để bạn hiểu và mở rộng num clients.

---

## 12. Đánh giá

**Chỉ số:** viết FedAvg weight-by-sample (Δ, weighted); so sánh với centralized trên cùng dữ liệu; hiểu "gửi Δ hay W"; biết FedAvg là baseline chuẩn.

**Vì sao chọn:** FedAvg là "hello world" của FL; nắm vững giúp bạn đọc mọi method FL (chúng đều sửa/cải tiến aggregation này) và là baseline bắt buộc khi báo cáo (G9).

**Chỉ số không thể hiện:** không bao gồm non-IID nặng/secure aggregation (G6.5, G6.9); không tối ưu lr/local epochs. Đây là cốt lõi thuật toán.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "FedAvg là 'trung bình vector' đơn thuần, đơn giản đến ngớ ngẩn, chắc không hoạt động." — Nó hoạt động tốt kinh ngạc khi i.i.d.-nhẹ, và là baseline chuẩn. "Đơn giản" không nghĩa "sai" — nhiều method phức tạp chỉ hơn nó cải thiện non-IID.
- **Hiểu lầm 2:** "FedAvg đảm bảo hội tụ cho mọi non-IID." — Không; với non-IID mạnh nó kém/không hội tụ sạch. FedAvg không "giải quyết non-IID"; là điểm xuất phát.
- **Hiểu lầm 3:** "Gửi W hay Δ giống nhau hoàn toàn; gửi cái nào cũng được." — Về toán tương đương nếu gộp đúng, nhưng Δ hữu ích để Secure Aggregation (G6.9), có thể kết hợp nén để giảm byte, và được dùng trong nhiều phương pháp cập nhật. Nên hiểu cả hai.
- **Giới hạn:** FedAvg nhạy với lr/server step & local epochs; không bảo đảm privacy tự thân. Đừng coi FedAvg là "thuật toán tự bảo mật" (G6.9).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Viết công thức FedAvg (weighted theo mẫu). Giải thích n_i, N.
2. Gửi Δ so gửi W — ưu điểm của Δ.
3. FedAvg là "baseline" nghĩa gì trong so sánh (G9)?

### Luyện tập (sửa đổi / mở rộng)
4. Sửa `counts` không đồng đều (VD 200/50/50) và chạy lại — nhận xét model lệch theo client to.
5. Thay đổi `local epochs` (1 vs 10) — so accuracy & độ "trôi" (quan sát).
6. Thêm 1 client tạo thành 4 — chạy vẫn hội tụ không? Ghi nhận.

### Thử thách (thiết kế / liên hệ)
7. So sánh centralized vs FedAvg trên cùng dữ liệu i.i.d.: quantify chênh lệch accuracy (thường nhỏ). Giải thích tại sao FL kém đôi chút.
8. nối non-IID: khi client mỗi nơi chỉ 1 lớp (VD client A chỉ "chó"), FedAvg dễ quên lớp của client nhỏ — giải thích bằng công thức (weighted Σ n_i/N Δ) và đề xuất hướng khắc phục (mở đầu G6.5).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. `W_new = W + Σₓ (nᵢ/N)·Δᵢ`; nᵢ = số mẫu client i; N = tổng số mẫu. Weight theo nᵢ.
2. Δ = Wᵢ − W biểu diễn thay đổi so với cùng snapshot. Dense Δ và W cùng dtype có cùng số byte; giá trị nhỏ chưa giảm băng thông. Gửi Δ cũng không tự bảo mật: server biết W thì suy được Wᵢ; cần giao thức Secure Aggregation/DP phù hợp. Toán tương đương khi gộp đúng.
3. Baseline = "chuẩn tối thiểu để so sánh": mọi method mới phải được chứng minh không thua FedAvg trên cùng setup; báo cáo luôn có cột FedAvg.
4. Client to (200) ảnh hưởng mạnh (weighted), model hòi tụ nghiêng về nó — đúng thiết kế; nếu dữ liệu non-IID, đây là "vấn đề client drift" (G6.5/G8).
5. local epochs 1: nhiều round cần, ít trôi. local 10: mỗi round trôi xa hơn (drift), có thể overfit cục bộ. Đánh đổi — cài local epochs vừa phải.
6. Nhiều client → vẫn chạy (vòng lặp mở rộng), hội tụ tương tự nếu i.i.d.-nhẹ. Nhiều client = thực tế hơn (client sampling G6.6).
7. FedAvg gần centralized khi i.i.d.-nhẹ (chênh nhỏ) vì trung bình gần một bước gradient toàn cục; chênh do: nhiều round/hiệu ứng trung bình, local epochs, không hoàn toàn tương đương centralized. Đúng kỳ vọng — FL đổi chút accuracy lấy privacy/ownership.
8. Nếu client "chó" có ít mẫu, `n_i/N` nhỏ → update của nó bị "dìm" → model toàn cục quên chó. Khắc phục: cân bằng trọng số, regularization client, phát hiện non-IID, agenda thêm (FedProx, bunch...). Đây là trọng tâm G6.5/G8.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **FedAvg**: `W_new = W + Σ (nᵢ/N)·Δᵢ` — trung bình có trọng số theo số mẫu.
2. Gửi **Δ** (không W gốc) — tiết kiệm, hỗ trợ secure agg.
3. **Local epochs** giúp giảm số vòng nhưng dễ "trôi" client (đánh đổi).
4. FedAvg là **baseline chuẩn** — mọi method so sánh với nó (G9).
5. Ưu khi i.i.d.-nhẹ; **non-IID mạnh** làm nó kém — đưa tới G6.5.

**Tự kiểm tra:**
- Viết công thức FedAvg & giải thích trọng số.
- Δ vs W — ưu điểm.
- Khi nào FedAvg hội tụ tốt/không?
- Vì sao FedAvg luôn có trong báo cáo so sánh?

---

## 16. Đọc sâu bằng trực giác — đừng nhầm hai nghĩa của trọng số

Trong FedAvg có “trọng số mô hình” W và “trọng số gộp” α. Cái thứ nhất là điều mô hình học; cái thứ hai quyết định tiếng nói của từng client trong một round. Tách hai từ này giúp tránh sai khi viết code.

| Đối tượng | Ký hiệu | Điều cần nhớ |
|---|---|---|
| Bản quy tắc chung trước khi học | W | Cùng một snapshot gửi cho mọi client |
| Thay đổi client đề xuất | Δi = Wi−W | Không phải model mới Wi |
| Phần đóng góp của client | αi = ni/N | Không phải learning rate |

**Đọc công thức:** `W′=W+Σi αiΔi`: “cộng vào bản chung trung bình các thay đổi, cân theo số mẫu”. Nếu mọi client xuất phát từ cùng W và tổng α bằng 1 thì công thức bằng `Σi αiWi`. Dùng model Wi mà vẫn cộng thêm W sẽ tính thừa.

**Tính tay:** W=2, client A có 100 mẫu và Wi=2.5; B có 300 mẫu và Wi=2.2. Delta lần lượt 0.5 và 0.2, trọng số 1/4 và 3/4. Vì vậy `W′=2+(0.5/4+3×0.2/4)=2.275`. Kiểm theo cách thứ hai: `(100×2.5+300×2.2)/400=2.275`. Hai kết quả phải khớp.

**Thử tương tác:** đổi số mẫu hai client để thấy trọng số gộp và tham số chung thay đổi. Client có nhiều mẫu hơn không chắc có tham số tốt hơn, chỉ có tiếng nói lớn hơn trong phép gộp này.

:::interactive fedavg
:::

**Phản ví dụ:** trung bình không trọng số cho 2.35, khác FedAvg theo mẫu vì B có dữ liệu gấp ba. Nhưng theo mẫu cũng không bảo đảm mọi client được phục vụ ngang nhau; một client rất lớn có thể lấn át mục tiêu của client nhỏ. Còn delta có giá trị nhỏ không đồng nghĩa gói tin nhỏ: một triệu float32 vẫn là 4 MB dù lưu W hay dense Δ.

:::quiz
Hai client có cùng số mẫu, gửi Wi=3 và Wi=5 từ W=2. FedAvg đúng cho W′ bằng bao nhiêu?
A. 6
B. 4
C. 2
Đáp án: B
Giải thích: Trung bình Wi là 4. Tương đương, delta là 1 và 3; W cộng delta trung bình cho 2+2=4, không phải 2+4.
:::

:::goi-y
Hãy giải theo cả Wi và Δi. Nếu hai cách không khớp thì đã trộn model với cập nhật.
:::

:::loi-giai
`(3+5)/2=4`; hoặc `2+((3−2)+(5−2))/2=4`. Trong mã, tạo updated state rồi load vào model; chỉ thay tensor trong dictionary tạm chưa chắc đã cập nhật model thật.
:::
