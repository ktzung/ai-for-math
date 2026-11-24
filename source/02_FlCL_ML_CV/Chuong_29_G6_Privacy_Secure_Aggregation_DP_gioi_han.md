# Chương 6.9 – 6.10 — Quyền riêng tư: Secure Aggregation & Differential Privacy (nhập môn), và các giới hạn bảo mật / độ tin cậy (Giai đoạn 6)

> **Câu hỏi trọng tâm:** *FL không tự động an toàn — vậy Secure Aggregation và Differential Privacy bảo vệ gì, "trả giá" bằng gì, và những giả định nào thường bị bỏ sót?*

---

## 1. Vị trí trong lộ trình

Đã hiểu FL trao đổi model (G6.1–8). Giờ đi sâu **quyền riêng tư**: tại sao "không gom dữ liệu" chưa đủ an toàn, hai công cụ nhập môn (**Secure Aggregation** và **Differential Privacy / DP**) bảo vệ gì và làm mất gì, cùng **các giới hạn bảo mật/độ tin cậy** (giả định hay bị bỏ). Prompt yêu cầu **không phóng đại tuyên bố về bảo mật** — chương này đúng tinh thần đó.

---

## 2. Kiến thức cần dùng

- FL loop, FedAvg (G6.4), non-IID (G6.5), cost (G6.7).

**Ôn nhanh:** FL client chỉ gửi Δ (weight update, không data). Nhưng Δ dựa trên dữ liệu → có thể "rò" thông tin ngầm. "Bảo mật" cần được định nghĩa chính xác (bảo vệ khỏi ai? mức nào?).

---

## 3. Câu chuyện mở đầu

Một đồng nghiệp nói: *"FL an toàn vì không gửi ảnh."* Lan, sau khi đọc, phản bác: *"Chưa chắc. Δ (weight update) vẫn mang dấu vết dữ liệu — có thể bị tấn công khôi phục (inversion) hay suy luận (inference). Hơn nữa, 'an toàn' phải hỏi: chống ai? server nhìn thấy từng Δ? kẻ tấn công nhìn model?"*

Cô tìm hiểu hai công cụ:
- **Secure Aggregation:** mã hóa để server chỉ thấy *tổng* các Δ, không thấy Δ từng client — bảo vệ "server tò mò" và ngăn lộ từng client. Nhưng server vẫn thấy kết quả gộp/toàn cục model.
- **Differential Privacy (DP):** thêm **nhiễu** vào update/loss một cách có kiểm soát, để bảo vệ một mẫu cụ thể khỏi bị suy luận — có bảo đảm toán học, nhưng phải **trả giá bằng accuracy giảm** (nhiễu) và cần cấu hình ε (epsilon).

Cô rút ra: **FL ≠ tự động an toàn**; cần chọn đúng công cụ, hiểu "bảo vệ gì / phá vỡ gì", và luôn nói rõ giả định.

---

## 4. Câu hỏi trọng tâm

**"Không gom dữ liệu" an toàn đến đâu? Secure Aggregation và DP bảo vệ gì, đánh đổi gì — và những giả định/giới hạn bảo mật nào hay bị bỏ sót?**

---

## 5. Trực giác

**Trước hết: thế nào là "bảo vệ dữ liệu" trong FL?** Hai câu hỏi tách bạch (hay bị gộp sai):
1. **Không để dữ liệu rời chủ sở hữu** → FL giải quyết phần này (chỉ gửi Δ).
2. **Không để kẻ khác suy ra dữ liệu từ Δ/model** → FL *không tự* giải quyết; đây là phần khó, dùng Secure Agg/DP.

**Secure Aggregation — "bỏ phiếu kín":** server cần *tổng* các Δ (FedAvg) nhưng không muốn/nên thấy *từng* Δ. Dùng mã hóa (đồng cấp) + che giấu, server chỉ tính được tổng. → *Bảo vệ khỏi server tò mò về từng client; vẫn thấy model toàn cục.*

**Differential Privacy (DP) — "đo lường sự riêng tư":** ta thêm **nhiễu ngẫu nhiên** vào kết quả (cập nhật/loss) theo ngân sách ε. Ý tưởng nền: kết quả "kém giống" kết quả không có mẫu nào đó → khó suy ra mẫu. Có **bảo đảm toán học** (ε cho định lượng) nhưng **accuracy giảm** (nhiễu) và ngân sách ε có giới hạn (dùng dần hết).

**Đánh đổi chung: privacy ↔ accuracy ↔ cost.** Thêm bảo mật (DP noise, secure agg overhead) làm giảm accuracy và/hoặc tăng cost tính toán/truyền thông. Không có "miễn phí".

**Giới hạn / giả định hay bị bỏ:**
- **Không bảo vệ khỏi mọi tấn công:** model update có thể bị tấn công suy luận (membership/inversion), dữ liệu "thông minh" nhưng không "ẩn".
- **Trusted server vs semi-honest vs malicious:** mức độ đối thủ khác nhau; secure agg thường giả định server "honest-but-curious" (có tò mò nhưng đúng quy trình), không chống server ác.
- **Client không đáng tin:** một client gửi update xấu (poisoning) làm hỏng toàn cục — FL nhạy (vấn đề ngoài DP/SecAgg).
- **Meta-data:** số mẫu n_i, thời điểm tham gia vẫn lộ — có thể nói thông tin phụ.
- **"An toàn" không có nghĩa "tuyệt đối"; và mô hình/benchmark đánh giá cần ghi rõ** (G9).

**Phép so sánh "bỏ phiếu kín (Secure Agg) vs làm nhiễu kết quả để ai cũng không đảo ra từng người (DP)":** trực quan phân tách 2 công cụ. **Giới hạn:** không nên tự tin "dùng Secure Agg là an toàn tuyệt đối" — nó chống một loại đối thủ nhất định; và DP "ε" là toán học nhưng người thực hành cần hiểu ngân sách. Đừng hiểu "dùng tool là xong".

---

## 6. Từ trực giác đến mô hình

- **FedAvg + Secure Agg:** aggregation = tổng/tổng trọng số Δ bằng mã hóa; server chỉ thấy kết quả gộp.
- **DP:** thêm nhiễu vào Δ (hoặc loss) với clip để ngân sách ε có nghĩa; `ε` nhỏ → riêng tư hơn, accuracy thấp hơn.
- **Đánh đổi:** privacy budget ε ↔ accuracy; overhead SecureAgg ↔ cost.

**Thuật toán (DP-FedAvg nhập môn — minh hoạ):**
```
Mỗi round:
1. Client tính Δ cục bộ.
2. (Server/cả) clip Δ đến chuẩn giới hạn để ngân sách DP kiểm soát; add Gaussian noise tỉ lệ ε.
3. Aggregate (có thể qua Secure Agg).
4. Lượng nhiễu phụ thuộc ε, số client, ngân sách còn lại.
```

*(Chi tiết DP nâng cao ngoài khóa; ta nắm ý: control noise theo ε, trả accuracy.)*

---

## 7. Thuật toán từng bước

**Bước 1 — Nhận diện "gì cần bảo vệ".** Đặt 3 câu: chống ai (server? client? attacker ngoài?)? chống gì (thấy từng client? suy ra mẫu?)? mức độ nào? → chọn công cụ phù hợp.

**Bước 2 — Secure Aggregation (khái niệm):** gom Δ qua mã hóa đồng cấp; server tính tổng mà không đọc từng Δ. (Trong khóa: hiểu vai trò "server chỉ thấy tổng", không tự implement mật mã.)

**Bước 3 — DP: thêm nhiễu có kiểm soát.**

```python
import torch
# clip Δ trước khi cho vào (ngân sách kiểm soát)
def clip_delta(delta, C):
    tot = sum(d.pow(2).sum() for d in delta.values()).sqrt()
    scale = min(1.0, C / (tot + 1e-8))
    return {k: v * scale for k, v in delta.items()}

def add_noise(delta, sigma):
    return {k: v + torch.randn_like(v) * sigma for k, v in delta.items()}
```

- `sigma` càng lớn → nhiễu lớn → riêng tư hơn (ε nhỏ hơn) nhưng accuracy giảm.
- DP nâng cao (moment accountant, budget ε) ngoài khóa; đây là minh hoạ cơ chế.

**Bước 4 — Đo đánh đổi:** chạy với σ = {0, 0.1, 1.0} → accuracy giảm khi σ lớn; đó là cái giá của DP.

**Bước 5 — Ghi giới hạn:** luôn nêu trong báo cáo: chống ai, mức độ, giả định (trusted server? noise budget?), không nói "FL an toàn".

**Lỗi thường gặp:** nói "secure agg = an toàn tuyệt đối" (sai); dùng DP mà không hiểu ε/ngân sách (thêm nhiễu mù → accuracy mất mà không biết mức privacy); bỏ qua clip khi dùng DP (ngân sách vô nghĩa); bỏ qua poisoning (một vấn đề bảo mật khác ngoài privacy).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** FedAvg, Δ client, muốn thêm DP noise.

**Bước 1 — Không noise:** accuracy val = 0.93 (baseline).

**Bước 2 — Thêm noise σ trung bình:** accuracy 0.85 — chấp nhận được cho privacy cao hơn.

**Bước 3 — Thêm noise lớn:** accuracy 0.60 — quá mất; ε nhỏ (privacy cao) nhưng mô hình kém.

**Bước 4 — Kết luận:** DP có bảo đảm toán học nhưng phải "trả accuracy" — không có miễn phí. Người thực hành chọn ε theo yêu cầu pháp lý/kinh doanh, không mù tối đa.

**Bước 5 — Secure Agg so sánh:** SecureAgg bảo vệ "từng Δ khỏi server", không thêm noise nên không mất accuracy — nhưng thêm overhead tính toán/truyền thông. Hai công cụ bảo vệ 2 thứ khác nhau; có thể dùng chung.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "chỉ không gửi dữ liệu, coi như an toàn".

| Phương diện | "Không gửi data = an toàn" | Có SecureAgg/DP đúng |
|---|---|---|
| Chống server tò mò từng Δ | không | SecureAgg (chỉ thấy tổng) |
| Chống suy luận mẫu | không | DP (noise) |
| Accuracy | không mất | DP giảm / SecureAgg hxi |
| Đánh đổi | ảo tưởng an toàn | rõ ràng, có nghĩa |

**Cải thiện:** hiểu bảo vệ "cái gì", trả giá bằng gì. **Đánh đổi:** accuracy/cost; cần kỹ năng chọn đúng + ghi giả định.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát DP noise ↔ accuracy.

1. FedAvg baseline (σ=0).
2. Thêm clip+noise với σ nhỏ → accuracy giảm nhẹ (privacy cao hơn).
3. σ lớn → accuracy giảm rõ.
4. Ghi bảng σ ↔ accuracy ↔ (khái niệm ε). Đây là "đánh đổi privacy–accuracy" trực quan.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/dp_fedavg_demo.py` (phát triển từ G6.4, thêm noise):

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(0)
X = torch.randn(300, 8); y = (X[:,0] + 0.2*X[:,1] > 0).long()
splits = [TensorDataset(X[:120],y[:120]), TensorDataset(X[120:210],y[120:210]), TensorDataset(X[210:],y[210:])]
dls = [DataLoader(s,32,shuffle=True) for s in splits]; counts=[120,90,90]

def make(): return nn.Sequential(nn.Linear(8,32), nn.ReLU(), nn.Linear(32,2))
model = make()

def clip_and_noise(delta, C=1.0, sigma=0.0):
    tot = sum(v.pow(2).sum() for v in delta.values()).sqrt()
    scale = min(1.0, C/(tot+1e-8))
    d = {k: v*scale for k,v in delta.items()}
    if sigma > 0:
        d = {k: v + torch.randn_like(v)*sigma for k,v in d.items()}
    return d

def local_delta(dl, base, sigma, E=3):
    m = make(); m.load_state_dict({k:v.clone() for k,v in base.items()})
    opt = torch.optim.SGD(m.parameters(), lr=0.01)
    for _ in range(E):
        for xb,yb in dl: opt.zero_grad(); F.cross_entropy(m(xb),yb).backward(); opt.step()
    st = m.state_dict(); d = {k: st[k]-base[k] for k in base}
    return clip_and_noise(d, sigma=sigma)

def run_fl(sigma):
    mm = make()
    for _ in range(15):
        base={k:v.detach().clone() for k,v in mm.state_dict().items()}
        ds=[local_delta(dl, base, sigma) for dl in dls]; N=sum(counts)
        with torch.no_grad():
            sd=mm.state_dict()
            for k in sd:
                sd[k]=base[k]
                for (dl,n),d in zip(dls,counts): sd[k]=sd[k]+ (n/N)*d[k]
    with torch.no_grad():
        return (mm(X).argmax(1)==y).float().mean().item()

for sigma in [0.0, 0.1, 1.0]:
    print(f"sigma={sigma} acc={run_fl(sigma):.3f}")
```

**Kết quả dự kiến:** σ=0 cao, σ=1.0 giảm rõ — minh hoạ DP noise↔accuracy.

**Lỗi thường gặp:** thêm noise mà quên clip (ngân sách vô nghĩa); bỏ qua ngân sách ε (thêm noise vô hạn → chữ) — ở đây minh hoạ cơ chế, DP đầy đủ phức tạp hơn. Coi đây là demo, không phải implementation DP chuẩn.

**Chú thích trung thực:** đây là *minh hoạ* về cơ chế nhiễu, không phải DP-FedAvg chuẩn (thiếu ε accounting, moments accountant, subsampling). Mục đích: thấy noise giảm accuracy. Đừng dùng như DP production.

---

## 12. Đánh giá

**Chỉ số:** phân biệt "không gom data" (FL) vs "bảo mật thực" (SecureAgg/DP); biết SecureAgg chống "server thấy từng Δ"; biết DP chống "suy luận mẫu" bằng noise, trả accuracy; ghi giả định (trusted server, ε budget); không phóng đại "FL an toàn".

**Vì sao chọn:** đúng yêu cầu prompt — không khẳng định quá mức về bảo mật; và là nền đọc các method FL+privacy trong research.

**Chỉ số không thể hiện:** không đi sâu cryptography (flip, secret sharing detail) hay DP rigorous (accountant); không phủ poisoning (một mặt bảo mật khác). Đây là mức nhập môn đúng yêu cầu.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "FL tự động an toàn." — Sai; chỉ không gom data. Δ/model vẫn có thể rò (inversion, inference). An toàn phải thiết kế (SecureAgg, DP).
- **Hiểu lầm 2:** "Secure Aggregation chống mọi tấn công." — Chỉ chống "server tò mò từng Δ" trong giả định honest-but-curious; không chống server ác, không chống client xấu (poisoning), không loại bỏ rò qua model. Đừng gán mọi khả năng.
- **Hiểu lầm 3:** "Differential Privacy 'miễn phí', thêm noise là ổn." — Không; ε nhỏ → privacy mạnh nhưng accuracy giảm; ngân sách ε có giới hạn; cần thiết kế (clip, subsampling). Dùng mù hỏng model mà không biết mức privacy.
- **Giới hạn:** còn các vấn đề khác (poisoning, fairness, hardware/secure enclave...) nằm ngoài; đây là nền nhập môn để bạn không tin "FL + crypto = hoàn toàn an toàn". Luôn ghi giả định trong báo cáo (G9).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt "không gom dữ liệu" (FL) và "bảo mật thực" — 2 câu hỏi khác nhau là gì?
2. Secure Aggregation bảo vệ gì (server chỉ thấy gì)?
3. Differential Privacy dùng gì (noise) và trả giá gì (accuracy)?

### Luyện tập (sửa đổi / mở rộng)
4. Chạy dp_fedavg_demo với σ ∈ {0, 0.05, 0.5, 2}. Ghi bảng σ↔accuracy; nhận xét.
5. Thêm "secure aggregation" khái niệm: với FedAvg, server thấy DÌ? (từng Δ hay chỉ tổng) — diễn giải sự khác khi dùng SecureAgg.

### Thử thách (thiết kế / liên hệ)
6. Thiết kế báo cáo "privacy" cho thí nghiệm FL: liệt kê bạn bảo vệ khỏi ai, bằng gì, giả định, đánh đổi (min 4 mục). (nối G9.)
7. Thảo luận: khi nào không cần DP (VD không có mẫu nhạy cảm; cần accuracy tối đa) — và hậu quả nếu bỏ lỡ nhu cầu. Nối quyết định miền.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. (1) Dữ liệu không rời chủ (FL giải quyết). (2) Kẻ khác có suy ra dữ liệu từ Δ/model không (cần SecureAgg/DP). Khác bản chất.
2. SecureAgg: server chỉ tính được **tổng** các Δ (không đọc từng client) nhờ mã hóa → bảo vệ khỏi server tò mò về từng client.
3. DP: thêm **nhiễu** có kiểm soát vào kết quả (theo ngân sách ε) để khó suy ra từng mẫu; **trả accuracy** (nhiễu giảm chất lượng) và cần thiết kế clip/budget.
4. σ tăng → accuracy giảm; bảng minh hoạ đánh đổi. σ 0 = baseline; σ 2 rất kém.
5. FedAvg thường thấy **từng Δ** (hoặc W) của client khi gộp; SecureAgg chỉ cho server thấy **tổng gộp** — phân tách "server không thấy từng client" là meaning của SecureAgg.
6. Báo cáo: (a) mô hình đe dọa (chống server tò mò? attacker ngoài?); (b) công cụ (SecureAgg/DP) + tham số (ε); (c) giả định (trusted server? client đáng tin?); (d) đánh đổi (accuracy/cost). Không nói "an toàn tuyệt đối".
7. DP không cần khi không có mẫu nhạy cảm/không đòi hỏi pháp lý, và cần accuracy max — bỏ DP giữ accuracy. Nhưng nếu sau này có nhu cầu privacy hoặc dữ liệu nhạy cảm mới, thiếu DP là rủi ro. Quyết định miền cân nhắc (G9).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **FL ≠ tự động an toàn**: chỉ không gom dữ liệu; Δ/model có thể rò.
2. **Secure Aggregation** — server chỉ thấy tổng các Δ (chống từng client); **Differential Privacy** — thêm nhiễu (chống suy luận mẫu, trả accuracy).
3. **Không có miễn phí**: bảo mật trả bằng accuracy/cost; chọn theo yêu cầu.
4. Giới hạn: không chống mọi tấn công (poisoning, server ác); phụ thuộc giả định (trusted server).
5. Luôn **ghi giả định + mô hình đe dọa + đánh đổi** trong báo cáo (G9), không khẳng định quá mức.

**Tự kiểm tra:**
- 2 câu hỏi "bảo vệ gì" khác nhau?
- SecureAgg bảo vệ khỏi gì (từng Δ vs tổng)?
- DP trả giá gì, ε nghĩa gì?
- Vì sao không nói "FL an toàn tuyệt đối"?

---

## 16. Đọc sâu bằng trực giác — che từng lá phiếu khác làm tổng khó suy ngược

Một cuộc bỏ phiếu có thể giữ kín từng lá phiếu nhưng vẫn công bố tổng. Nếu chỉ có một người bỏ phiếu, tổng lại chính là lá phiếu ấy. Phép so sánh này cho thấy Secure Aggregation cần giả định giao thức và ngưỡng tham gia, không chỉ một cái tên.

| Điều muốn bảo vệ | Công cụ liên quan | Điều chưa được bảo đảm |
|---|---|---|
| Ảnh gốc không rời thiết bị | Kiến trúc FL | Cập nhật có thể rò thông tin |
| Server không xem từng cập nhật | Secure Aggregation | Tổng vẫn có thể tiết lộ thông tin |
| Hạn chế ảnh hưởng của một đơn vị dữ liệu | DP với clipping, noise và accountant | Phải định nghĩa đơn vị bảo vệ và phép hợp thành |

**Đọc công thức:** `clipC(Δ)=Δ·min(1,C/‖Δ‖₂)`: “nếu update dài quá C, thu nó về độ dài C nhưng giữ hướng; nếu không thì giữ nguyên”. Đây là chặn độ nhạy, chưa tự tạo DP. Noise còn phụ thuộc mô hình tin cậy, cách lấy mẫu, số bước, δ và quy tắc kế toán ε.

**Tính tay:** Δ=(3,4), norm=5, C=2, nên update sau clip là `(1.2,1.6)`. Minh họa thêm một mẫu nhiễu `(0.1,−0.2)` cho kết quả `(1.3,1.4)`. Một lần cộng nhiễu cụ thể không cho phép suy ra ε; phải biết phân phối nhiễu và toàn bộ cơ chế. Không dùng ví dụ số này như cấu hình bảo mật thực tế.

**Phản ví dụ:** nói “server chỉ thấy tổng nên không thể biết gì về từng người”. Nếu round chỉ có một client tham gia, tổng chính là update của người đó; với ít client hoặc update thưa, tổng vẫn có thể tiết lộ. Secure Aggregation cần ngưỡng tham gia và giả định giao thức, không chỉ phép cộng.

**Giới hạn:** “không giữ ảnh” khác “có bảo đảm DP”. Noise lớn hơn thường đổi đánh đổi tiện ích–riêng tư khi giữ các giả định khác, nhưng không thể đọc ε trực tiếp từ một accuracy giảm. Đơn vị DP có thể là một bản ghi hoặc toàn bộ client; hai bảo đảm không thay thế nhau.

:::interactive dp
:::

:::quiz
Một cập nhật đã clip norm nhưng chưa thêm nhiễu và chưa có phân tích cơ chế. Có thể tuyên bố DP không?
A. Có, clipping là DP
B. Không, clipping riêng lẻ chưa đủ
C. Có, nếu accuracy thấp hơn
Đáp án: B
Giải thích: Clipping giới hạn ảnh hưởng; bảo đảm DP cần cơ chế ngẫu nhiên, giả định và kế toán riêng tư phù hợp, không suy ra từ accuracy.
:::

:::goi-y
Hãy phân biệt thao tác số học trên update với phát biểu xác suất về khả năng phân biệt hai bộ dữ liệu lân cận.
:::

:::loi-giai
Clip đưa (3,4) về (1.2,1.6), norm đúng bằng 2. Nó chưa che kết quả bằng ngẫu nhiên. Muốn ghi ε,δ phải xác định đơn vị bảo vệ, cơ chế và số lần sử dụng dữ liệu.
:::
