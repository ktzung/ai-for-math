# Chương 6.1–6.3 — Bài toán client–server, FL khác huấn luyện phân tán, và vòng truyền thông (Giai đoạn 6)

> **Câu hỏi trọng tâm:** *Tại sao không gom mọi dữ liệu về một máy để huấn luyện — và khi đó ta tổ chức "học cùng nhau mà không thấy dữ liệu nhau" bằng vòng truyền thông như thế nào?*

---

## 1. Vị trí trong lộ trình

Đây là giai đoạn trọng tâm thứ nhất. Sau nền (G1–G4) và mô hình nền tảng (G5), ta bước vào **Federated Learning (FL)**: nhiều bên cùng huấn luyện một mô hình mà **không gom dữ liệu về một nơi**. Đây chính là "nhiều bệnh viện cùng học không chia sẻ ảnh bệnh nhân" trong mô tả prompt.

Gộp 6.1–6.3 vì chúng là khối "định nghĩa và vòng lặp": tại sao không gom dữ liệu → FL ≠ distributed training → vòng lặp client-server tổ chức việc học.

---

## 2. Kiến thức cần dùng

- Huấn luyện model (G1.4, G3.7), mini-batch/epoch (G3.4), non-IID (đã nhắc G1.2/G2.3).

**Ôn nhanh:** "huấn luyện" = gradient descent giảm loss trên dữ liệu (G2.6). "i.i.d." = dữ liệu cùng phân phối, chia ngẫu nhiên; "non-IID" = phân phối khác nhau giữa các nguồn.

---

## 3. Câu chuyện mở đầu

Năm bệnh viện cùng muốn huấn luyện một mô hình nhận diện sinh thiết chụp hiển vi. Nếu ai cũng có 5.000 ảnh, việc đầu tiên ta nghĩ là *gom tất cả 25.000 ảnh về một máy chủ* rồi huấn luyện — gọi là **huấn luyện tập trung**. Nhưng điều này không cho phép: vì **quyền riêng tư** (ảnh bệnh nhân, luật pháp), và vì **bandwidth/băng thông** (tải 25.000 ảnh tốn), và vì muốn **mỗi nơi giữ dữ liệu của mình**.

Cả 5 bệnh viện liên kết để cùng học mà không trao đổi ảnh. Mỗi nơi **chỉ gửi "cập nhật mô hình"**, không gửi dữ liệu. Tổ chức họ dùng là **Federated Learning** — một "server" trung tâm điều phối các "client" (bệnh viện), qua nhiều vòng truyền thông, mỗi vòng client huấn luyện cục bộ rồi server gộp.

---

## 4. Câu hỏi trọng tâm

**Vì sao không gom dữ liệu (và FL giải quyết gì), FL khác "huấn luyện phân tán" thế nào, và vòng truyền thông (round) diễn ra ra sao?**

---

## 5. Trực giác

**Vì sao cần FL (động lực):**
- **Privacy/pháp lý:** ảnh y khoa, dữ liệu cá nhân không được rời khỏi "chủ sở hữu".
- **Bandwidth:** tải dữ liệu về trung tâm rất tốn; gửi model (nhỏ) rẻ hơn nhiều lần.
- **Quyền sở hữu dữ liệu:** mỗi bên giữ "của mình", không muốn/không được chia sẻ.

**Vòng lặp FL (cấu trúc chung):**
1. Server khởi tạo model `w` (hoặc dùng pretrained, G5).
2. Chọn một tập con **client** tham gia vòng này (client sampling).
3. Mỗi client sao chép model hiện tại, **huấn luyện cục bộ** trên dữ liệu của mình (vài epoch), nhận "bản cập nhật".
4. Client gửi **cập nhật (không phải dữ liệu)** lên server.
5. Server **gộp (aggregate)** các cập nhật — ví dụ FedAvg: lấy trung bình (G6.4) — thành model mới toàn cục.
6. Lặp lại nhiều vòng.

**"Round" (vòng truyền thông)** = một lần "client train → client gửi → server gộp". Trong mỗi round, client chạy **local training** (vài local epochs) trên dữ liệu riêng.

**FL ≠ huấn luyện phân tán (distributed):** phân tán (data parallelism) thường giả định *dữ liệu có thể gom/i.i.d.*, chia batch qua GPU, đồng bộ mỗi bước — với mục tiêu **tăng tốc**. FL giả định *dữ liệu không gom được* (nằm rải rác, minh riêng), mỗi client độc lập nhiều dữ liệu không i.i.d., mục tiêu **học từ dữ liệu phân tán có ràng buộc riêng tư**. Điểm khác: phân tán vẫn "thấy hết dữ liệu" ở mức hệ thống; FL không cho server/chủ khác thấy dữ liệu client. Đừng nhầm.

**Phép so sánh "năm bệnh viện, mỗi nơi huấn luyện trên hồ sơ riêng, mỗi tuần gặp một lần gộp ý kiến (bản tóm tắt, không mang hồ sơ)":** trực quan. **Giới hạn:** "gộp ý kiến" không đúng kiểu nghĩa chỉ bằng cách trung bình vô điều kiện — thực tế gặp vấn đề non-IID, client drift (G6.5) khiến việc gộp phức tạp. Và FL không tự động bảo mật tuyệt đối (G6.9) — đừng hiểu "không gửi data = an toàn tuyệt đối".

---

## 6. Từ trực giác đến mô hình

- **Server:** điều phối, khởi tạo, gộp, không thấy dữ liệu client.
- **Client:** giữ dữ liệu riêng, huấn luyện cục bộ, gửi cập nhật (không dữ liệu).
- **Luồng (1 round):** `server W → chọn client → mỗi client: W_i = local_train(W, data_i) → gửi Δ_i (hoặc W_i) → server gộp W = aggregate(∪ Δ_i)`.
- **Mục tiêu:** model toàn cục học từ dữ liệu phân tán, không gom dữ liệu.

**Thuật toán (1 round, tổng quát):**
```
Input: model hiện tại W, tập client n.
1. Server chọn m client (client sampling).
2. Broadcast W cho m client.
3. Mỗi client i: W_i ← local_train(W, data_i, local_epochs)   # offline, độc lập
4. Mỗi client gửi W_i (hoặc Δ_i = W_i − W) lại server.
5. Server: W ← aggregate(W_1..W_m).   (VD FedAvg: trung bình có trọng số — G6.4)
6. Lặp round tiếp theo.
```

---

## 7. Thuật toán từng bước (FL tối giản — khái niệm, không full code)

**Bước 1 — Khởi tạo:** `W = init_model()` (hoặc pretrained).

**Bước 2 — Mỗi round:** chọn client, broadcast.

**Bước 3 — Local train (client):** mỗi client lấy `W`, huấn luyện `local_epochs` trên `data_i` bằng PyTorch như thường (G3.7) — *không gửi dữ liệu*, chỉ gửi `W_i`.

**Bước 4 — Gộp (aggregate):** đây là phần sing quyết. FedAvg (G6.4): trung bình có trọng số theo số mẫu: `W_new = (1/Σn_i) Σ (n_i · W_i)` — với `n_i` = số mẫu client i. (Có thể tương đương lấy trung bình `Δ_i`.)

**Bước 5 — Lặp; theo dõi val trên server (đánh giá trên test chuẩn/client mới, G2.3).**

**Lỗi thường gặp:** nhầm "gửi dữ liệu" (FL không gửi data — chỉ W/Δ); nhầm client send "model cuối mỗi epoch" (chỉ gửi sau local train xong); đánh giá server trên chính dữ liệu client (không có — phải đánh giá qua client hoặc tập test riêng); không cẩn thận non-IID khi gộp (G6.5).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 3 client, mô hình logistic 1 tham số `w` (minh hoạ). Local train cho:
- Client A (100 mẫu): sau local train `w_A = 1.0`
- Client B (50 mẫu): `w_B = 0.4`
- Client C (50 mẫu): `w_C = 0.2`

**Bước 1 — FedAvg có trọng số theo mẫu:**
`w_new = (100×1.0 + 50×0.4 + 50×0.2)/(100+50+50) = (100+20+10)/200 = 130/200 = 0.65`.

**Bước 2 — Nếu trung bình đơn (không trọng số):** `(1.0+0.4+0.2)/3 = 0.533`.

**Bước 3 — Giải thích:** FedAvg cho client nhiều mẫu ảnh hưởng nhiều hơn (0.65 ≠ 0.533). Đây là điểm mẫu cơ bản. (Chú ý: "trọng số theo mẫu" là lựa chọn; khi phân phối non-IID nặng, nó cũng gây cách khác — G6.5. Minh hoạ khái niệm thôi.)

**Bước 4 — Không gom dữ liệu:** server chỉ nhận 3 con số `w_i` (hoặc Δ), không thấy 200 mẫu — cấu trúc FL đúng.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** huấn luyện tập trung (gom toàn bộ dữ liệu về 1 nơi).

| Phương diện | Tập trung | Federated Learning |
|---|---|---|
| Gom dữ liệu | có | **không** |
| Privacy | thấp (dữ liệu rời chủ) | cao hơn (chỉ gửi W) |
| Bandwidth | tải dữ liệu lớn | gửi model nhỏ |
| Non-IID | không thành vấn đề (mix rồi) | **vấn đề trung tâm** (G6.5) |
| Đánh đổi | đơn giản, mạnh | phức tạp, hội tụ khó hơn |

**Cải thiện:** workspace dữ liệu at nơi sở hữu (privacy, bandwidth, ownership). **Đánh đổi:** non-IID, giao tiếp, hội tụ khó — đó là lý do G6 có nhiều chương. FL thường không bằng centralized về accuracy tuyệt đối; đổi lại là điều kiện ràng buộc.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát vòng lặp FL + so sánh với central.

1. Chia dataset thành 3 "client" (giữ non-IID một chút: mỗi client lệch lớp).
2. Chạy (a) centralized: gom hết train 1 model. (b) FL: mô phỏng qua từng read — local train từng client, FedAvg gộp.
3. So val accuracy (central thường cao hơn chút — vì FL không gom data).
4. Đây là baseline để G6.4–6.8 đi sâu. (Code FL thật ở G6.4.)

---

## 11. Thực hành lập trình (FL loop mô phỏng — bản đủ ở G6.4)

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/fl_loop_demo.py` (phác — 2 client):

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

# giả dữ liệu 2 client với nhãn hơi lệch
X = torch.randn(200, 8); y = (X[:,0] > 0).long()
c1 = TensorDataset(X[:100], y[:100]); c2 = TensorDataset(X[100:], y[100:])
dl1 = DataLoader(c1, 32, shuffle=True); dl2 = DataLoader(c2, 32, shuffle=True)

model = nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 2))

def local_train(dl, epochs=5):
    m = nn.Sequential(nn.Linear(8,32), nn.ReLU(), nn.Linear(32,2))
    m.load_state_dict(model.state_dict())        # bắt đầu từ model hiện tại
    opt = torch.optim.SGD(m.parameters(), lr=0.01)
    for _ in range(epochs):
        for xb, yb in dl: opt.zero_grad(); F.cross_entropy(m(xb), yb).backward(); opt.step()
    return m.state_dict()

for rnd in range(10):                            # 10 rounds
    a = local_train(dl1); b = local_train(dl2)   # client cục bộ
    # gộp: trung bình có trọng số state_dict theo số mẫu (đơn giản: chia đôi)
    sd = {}
    for k in a: sd[k] = (a[k].float() + b[k].float()) / 2
    model.load_state_dict(sd)
# đánh giá
with torch.no_grad():
    acc = (model(X).argmax(1) == y).float().mean()
print("FL acc:", round(acc.item(), 3))
```

**Kết quả dự kiến:** accuracy cao (VD ~0.9) sau vài round — thấy FL loop chạy (local train + gộp). Đây là mô phỏng đơn giản; gộp nâng cao (weighted) ở G6.4.

**Lỗi thường gặp:** không copy state_dict (client cập nhật mô hình gốc thay vì bản); gộp trên tensor không float; quên trọng số mẫu. Đây là nền để xây FedAvg đúng ở G6.4.

---

## 12. Đánh giá

**Chỉ số:** kể đúng động lực FL (privacy/bandwidth/ownership); phân biệt FL vs distributed; mô tả 1 round (client-server); hiểu "chỉ gửi W/Δ, không dữ liệu"; thấy FL không phải "gom-toàn-bộ".

**Vì sao chọn:** khái niệm "round + chỉ trao đổi model" là khung của toàn G6; nắm đúng sẽ tránh lệch lan ra G8.

**Chỉ số không thể hiện:** chưa bao gồm non-IID sâu/client sampling/privacy (G6.5–6.9); gộp đơn giản. Đây là nền.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "FL = huấn luyện phân tán." — Không (đã bàn): distributed giả định gom được data, mục tiêu tốc độ; FL giữ data phân tán, mục tiêu học có ràng buộc privacy/ownership. Nhầm làm bạn áp sai cấu trúc.
- **Hiểu lầm 2:** "Không gửi dữ liệu = hoàn toàn riêng tư." — Không: chỉ "không rời dữ liệu" nhưng model cập nhật có thể rò thông tin (nhớ dữ liệu train), cần Secure Aggregation/DP (G6.9). Đừng phóng đại bảo mật (yêu cầu prompt).
- **Hiểu lầm 3:** "Một client gửi 1 model cuối mỗi vòng là đủ; server phải thấy dữ liệu để đánh giá." — Server không thấy data; đánh giá qua client (nhờ họ eval) hoặc tập test riêng. Không yêu cầu gom.
- **Giới hạn:** FL giả định client "gần như online/ổn định" và mạng khả dụng — thực tế client offline lẫn rụng (G6.6). Đừng giả định mọi client tham gia mọi round.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Ba động lực chính của FL (vì sao không gom dữ liệu).
2. Kể đúng 1 "round" của FL (các bước).
3. Phân biệt FL và "huấn luyện phân tán" (1 điểm khác về dữ liệu, 1 về mục tiêu).

### Luyện tập (sửa đổi / mở rộng)
4. Trong fl_loop_demo, đổi `(0.5,0.5)` gộp thành "trung bình có trọng số theo mẫu" (bài 2 client, số mẫu khác nhau) — tính tay cho 1 tham số như ví dụ mục 8.
5. Mô tả bằng lời: quy trình chọn "test" trong FL (server không có data — đánh giá thế nào). Gợi ý ngắn: qua client/trên test chuẩn.

### Thử thách (thiết kế / liên hệ)
6. Liệt kê 3 ràng buộc thực tế (client offline, bandwidth, non-IID) và ảnh hưởng lên vòng lặp round.
7. Nối với toàn lộ trình: vì sao "nếu dữ liệu các client là i.i.d. và gom được, FL không cần thiết" — và vì sao vậy FL vẫn hữu ích khi có dữ liệu ở nhiều nơi không rời được.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Privacy/pháp lý (dữ liệu nhạy cảm không rời chủ); bandwidth (gửi model nhỏ rẻ hơn data lớn); ownership (mỗi nơi giữ dữ liệu của mình).
2. server W → chọn client → broadcast → client local-train → gửi W_i/Δ → server gộp → lặp.
3. Dữ liệu: distributed thấy được gom/i.i.d.; FL data nằm phân tán, không gom, non-IID. Mục tiêu: distributed = tăng tốc; FL = học có ràng buộc privacy/ownership.
4. VD 3 client, w=1.0/0.4/0.2, mẫu 100/50/50 → weighted trung bình 0.65 (như mục 8). Client nhiều mẫu ảnh hưởng hơn.
5. Server không thấy data → đánh giá bằng cách (a) gửi model đến client nhờ eval trên dữ liệu riêng (tổng hợp chỉ số trả về), (b) có một test set "chuẩn" tách riêng data-mẫu không thuộc client để eval trên server — nhưng tránh rò rỉ client (G2.8).
6. Client offline → round chỉ chọn client khả dụng (sampling); bandwidth hạn chế → giới hạn local epochs/lần trao đổi; non-IID → gộp/hội tụ khó (G6.5). Đây là ràng buộc thiết kế.
7. Nếu data i.i.d. + gom được, centralized đơn giản và tối ưu — FL thừa. FL cần khi data *không thể gom* (pháp lý, quyền riêng tư, ownership) dù i.i.d. hay không — lúc đó FL là cách duy nhất để học từ đó. Đây là "đổi tập trung lấy khả dĩ có ràng buộc".

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **FL = nhiều bên huấn luyện chung, chỉ trao đổi model (W/Δ), không gom dữ liệu**.
2. Động lực: **privacy, bandwidth, quyền sở hữu dữ liệu**.
3. Vòng lặp: **round = client local-train → gửi cập nhật → server gộp → lặp**.
4. **FL ≠ huấn luyện phân tán**: dữ liệu không gom, non-IID, bảo mật là điều kiện.
5. Không tự động an toàn tuyệt đối; non-IID/client drift & privacy sẽ là chủ đề G6.4–6.9.

**Tự kiểm tra:**
- 3 động lực FL?
- Kể 1 round cấu trúc.
- FL vs distributed khác gì?
- Vì sao server không thấy dữ liệu nhưng vẫn đánh giá model?

---

## 16. Đọc sâu bằng trực giác — một round là một lần hội ý

Ba cửa hàng cùng học dự đoán nhu cầu nhưng giữ hóa đơn ở từng nơi. Server gửi cùng một bản mô hình, từng cửa hàng học từ dữ liệu riêng rồi gửi cập nhật về. Một lần phát–học–nhận–gộp là một round, không phải một epoch.

| Hoạt động cửa hàng | Trong FL | Thông tin trao đổi |
|---|---|---|
| Nhận cùng quy tắc đầu ngày | Broadcast global model | Tham số khởi tạo của round |
| Rút kinh nghiệm từ hóa đơn riêng | Local training | Dữ liệu vẫn ở client |
| Hội ý để cập nhật quy tắc chung | Aggregation | Model hoặc delta, số mẫu và metadata |

**Đọc công thức:** `Wᵣ₊₁=Wᵣ+Σi αiΔi`: “lấy mô hình của round r, cộng trung bình có trọng số các thay đổi client”. Với tập client tham gia round này, `αi=ni/Σj nj` và `Σi αi=1`. Không lấy tổng số mẫu của các client vắng mặt làm mẫu số nếu đang dùng phép gộp tham gia chuẩn này.

**Tính tay:** W ban đầu là 2. Ba client có 100, 50, 50 mẫu và delta lần lượt 0.3, −0.1, 0.2. Trọng số là 0.5, 0.25, 0.25. Delta gộp bằng `0.15−0.025+0.05=0.175`, nên W mới là 2.175. Server không cần nhận 200 hóa đơn để làm phép tính ấy.

**Phản ví dụ:** một client chạy 3 local epoch rồi gửi một lần, có người đếm thành 3 round vì thấy ba lượt qua dữ liệu. Round là chu kỳ điều phối–gộp; ba epoch chỉ là ba lượt cục bộ bên trong cùng một round.

**Giới hạn:** không nhận hóa đơn thô chưa có nghĩa không suy ra được thông tin về chúng từ cập nhật. FL cũng không mặc định ít byte hơn gom dữ liệu một lần: model lớn trao đổi qua nhiều round có thể tốn hơn. “Phân tán” là khái niệm rộng; FL là một cách học trên dữ liệu phân tán có ràng buộc, chứ không phải mọi huấn luyện phân tán đều gom dữ liệu về một máy.

:::interactive rounds
:::

:::quiz
Một client chạy 3 local epoch trước khi gửi cập nhật; server gộp một lần. Đã hoàn thành bao nhiêu round?
A. 1 round
B. 3 round
C. 6 round
Đáp án: A
Giải thích: Epoch đếm lượt qua dữ liệu cục bộ; round đếm chu kỳ điều phối và gộp. Một round có thể chứa nhiều local epoch.
:::

:::goi-y
Hãy đếm số lần server nhận các cập nhật rồi tạo phiên bản global mới, thay vì số lần client đi qua dữ liệu.
:::

:::loi-giai
Có một vòng giao tiếp–gộp, tức một round. Khi so phương pháp, cần ghi cả round, local epoch, client tham gia và số bước tối ưu; chỉ một con số không mô tả đủ công huấn luyện.
:::
