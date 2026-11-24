# Chương 8.5–8.7 — Các hướng kết hợp FL + CL; client drift, non-IID, forgetting, cập nhật không đồng bộ; và đánh đổi (Giai đoạn 8)

> **Câu hỏi trọng tâm:** *Có những "họ" ý tưởng nào để kết hợp FL và CL (regularization kép, replay cục bộ, tách task), chúng xử lý drift/forgetting/async thế nào, và trả những đánh đổi gì?*

---

## 1. Vị trí trong lộ trình

Đã hiểu "bài toán" FL+CL (8.1–4). Giờ là **bản đồ phương pháp**: các hướng (tut) kết hợp FL và CL, và các khó khăn vận hành (drift, non-IID, forgetting, async) + đánh đổi (hiệu năng ↔ truyền thông ↔ bộ nhớ ↔ privacy ↔ thích nghi). Đây là "phần chọn lựa" — không có thuật toán duy nhất giải mọi trường hợp (đúng yêu cầu prompt).

---

## 2. Kiến thức cần dùng

- FL (G6: FedAvg, non-IID, drift, cost, privacy), CL (G7: rehearsal/reg/arch, TIL/CIL, cost), FL+CL bài toán (G8.1–4).

**Ôn nhanh:** client drift (G6.5), forgetting (G7.2), ba họ CL (G7.4), cost model (G6.7), privacy (G6.9).

---

## 3. Câu chuyện mở đầu

Lan cần chọn "phương pháp" cho FL+CL. Cô thấy paper đề nhiều hướng khác nhau khiến cô bối rối. Người hướng dẫn gợi ý: *"Đừng chìm trong tên method. Hãy nhóm theo Ý TƯỞNG — hầu hết đều thuộc vài quỹ đạo."* Cô rút gọn thành các **hướng (families)**:
1. **Regularization kép:** phạt client không trôi xa global (chống drift) + phạt không quên cũ (chống forgetting). Không giữ mẫu → privacy tốt.
2. **Replay cục bộ:** mỗi client giữ buffer mẫu cũ *cục bộ* (không gửi lên server) để "ôn" — chống forgetting mạnh nhưng tốn bộ nhớ client, buffer lệch giữa client.
3. **Tách Task / Kiến trúc:** nhận biết task để ghép head/module per-task — mạnh nhưng cần "task id" (TIL) và model to dần (khó CIL không biết task).

Đồng thời cô đối mặt các khó khăn vận hành: **cập nhật không đồng bộ** (client gửi update ở round khác nhau, "lệch pha" 8.2), cách xử drift+forgetting chồng nhau, và **đánh đổi** (hiệu năng ↔ truyền thông ↔ bộ nhớ ↔ privacy ↔ thích nghi) — luôn phải đổi cái này lấy cái kia, không có "free".

---

## 4. Câu hỏi trọng tâm

**Các họ ý tưởng kết hợp FL+CL là gì (regularization kép, replay cục bộ, tách task)? Và drift/non-IID/forgetting/async được xử lý thế nào, với đánh đổi gì?**

---

## 5. Trực giác

**Ba "quỹ đạo" ý tưởng chính (files họ method như G7.4 nhưng trong bối cảnh phân tán):**

1. **Regularization kép (dual regularization):** trong loss của client thêm HAI khoản phạt:
   - phạt **trôi khỏi global** (chống client drift — như FedProx cảm hứng, G6.5): giữ local-models gần global.
   - phạt **quên cũ** (chống forgetting — như EWC/L2 giữ tham số quan trọng, G7.4): giữ trọng số không đổi xa giá trị "quan trọng" quá khứ.
   → Không cần lưu mẫu gốc (vẫn phải đánh giá rò rỉ qua tham số/cập nhật) nhưng cần lưu tham số/importance, tinh chỉnh 2 lambda khó.

2. **Replay cục bộ (local rehearsal):** mỗi client giữ buffer mẫu cũ *của mình* (không gửi lên server) để replay khi học mới. → Chống forgetting hiệu quả (như G7.4) nhưng: tốn bộ nhớ client, và mỗi client buffer "thiên lệch" (non-IID) → replay không chung; vẫn phải chống drift song song.

3. **Tách Task / Kiến trúc (task-based/architecture):** nếu *biết task* (TIL) — thêm head/module per task, mask tham số. → Tránh ghi đè cũ (strong forgetting defense), nhưng model phình, cần task id (khó CIL / không biết task trong nhiều ứng dụng), và trong FL mỗi client thấy task khác nhau (đồng bộ head thế nào?).

**Khó khăn vận hành:**
- **Non-IID + forgetting chồng:** một client học task mới có thể đồng thời "trôi" (non-IID) và "quên" (CL) — phải phân biệt nguồn (hay nhầm: acc giảm vì drift hay vì forget).
- **Cập nhật không đồng bộ (async/lệch pha):** client update khác round, khác "thời điểm biết task" → gộp bản khác pha (8.2). Cần legacy của "stale model" delay (khi client gửi update từ model cũ). Nhóm này có async-FL, cross-round, FedBuff... (khái niệm "proxy lệch pha").
- **Lưu ý:** đừng giả định client luôn online, task đến báo trước, dữ liệu đều — G8.9 nói giả định.

**Đánh đổi (trade-off bottles) luôn tồn tại:** hiệu năng (accuracy) ↔ truyền thông (bandwidth/round) ↔ bộ nhớ (client buffer/model) ↔ privacy (giữ mẫu? loại nhiễu DP) ↔ thích nghi (khả năng học task mới). Chọn method nghĩa là chấp nhận đánh đổi — không có "hướng thắng".

**Phép so sánh "ba chiến lược quản lý kho hàng: ghi nhớ quy luật, đặt hộp mẫu riêng, kho ngăn per-sản phẩm + chịu chi phí tồn kho/đồng bộ":** trực quan cho 3 họ + trade-off. **Giới hạn:** "đồng bộ head in FL" của họ tách-task phức tạp (client thấy task khác) — ẩn dụ không cho thấy; và đánh đổi thật cần đo bằng experiment, không "cảm tính".

---

## 6. Từ trực giác đến mô hình

- **Reg. kép:** loss = `L_local + λ_drift·‖θ−θ_global‖² + λ_forget·(chống quên cũ: EWC-like term)`.
- **Replay cục bộ:** client giữ buffer b_i, train trên `data_new + buffer_i`; buffer không gửi lên server.
- **Tách task:** thêm head/module per task (TIL); cần task id; model phình.
- **Async:** client update từ model cũ (stale) — xử lý "stale Δ" hợp lý khi gộp.

**Thuật toán (khung quyết định chọn hướng):**
```
1. Xác định ràng buộc: privacy (giữ mẫu?)? biết task khi test? tài nguyên client?
2. Nếu không được giữ mẫu → regularization kép (hoặc kiến trúc nếu biết task).
3. Nếu được giữ mẫu cục bộ + bộ nhớ OK → replay cục bộ (mạnh thực dụng) + chống drift.
4. Bất kể chọn gì → đo per-client per-task + cost (G8.8 ablation).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Regularization kép (khung loss).**

```python
# client local loss thêm 2 khoản:
# loss += lambda_drift * ||theta - global_theta||^2        # chống drift
# loss += lambda_forget * EWC-like term                    # chống forgetting cũ
```
(Khái niệm — bạn tự tham khảo FedProx, EWC để code đầy đủ; mục đích hiểu "kép".)

**Bước 2 — Replay cục bộ (client giữ buffer, không gửi lên server).**

```python
# client: buffer_i (mẫu task cũ của client), train trên data mới + buffer_i
# không gửi buffer_i lên server; chỉ gửi Δ
```

**Bước 3 — Xử lý async/stale (khái niệm).** Client gửi update tính từ model global *cũ* hơn (stale); khi gộp, cân nhắc "aged" update (`lệch pcf model version`) — có round-level proxy; đừng giả định đồng bộ hoàn hảo.

**Bước 4 — Trade-off table:** ghi mỗi hướng: privacy, memory, comm, thích nghi, forgetting-defense. Chọn theo bài toán.

**Lỗi thường gặp:** gộp không chịu "lệch pha/stale" (giả định đồng bộ); replay gửi mẫu lên server (vỡ privacy); regularization kép lambda quá lớn → client không học task mới (over-regularize); nghĩ "tách task" dùng cho CIL (sai — cần task id).

---

## 8. Ví dụ nhỏ có số liệu (bảng đánh đổi)

**Tình huống:** 3 hướng trên cùng bài FL+CL (2 task, 2 client non-IID), báo A / forgetting / cost:

| Hướng | A | Forgetting | Comm | Memory client | Privacy (giữ mẫu) | Cần task id |
|---|---|---|---|---|---|---|
| Replay cục bộ | 0.72 | 0.08 | thấp | **buffer** | **giữ mẫu cục bộ** | không |
| Regularization kép | 0.65 | 0.15 | thấp | tham số (~2×) | không giữ mẫu | không |
| Tách task (TIL) | 0.80 | 0.03 | cao (nhiều head) | model to | không giữ mẫu | **có** (TIL) |

**Bước 1 — Đọc:** tách task giữ tốt nhất nhưng cần task id + model to (khó CIL). Replay mạnh nhưng tốn bộ nhớ + giữ mẫu (privacy). Reg. kép cân bằng privacy nhưng A thấp hơn. Không "hướng thắng tuyệt đối".

**Bước 2 — Chọn:** bài "tế bào học lớp mới không biết trước task, không được lưu mẫu lâu" → regularization kép là một ứng viên. Nếu cấm lưu mẫu lâu thì không được chọn replay ảnh gốc chỉ vì còn bộ nhớ; cần phương án được phép và đánh giá riêng tư riêng.

**Bước 3 — Đây là "đánh đổi" — bạn chọn trên ràng buộc, không có free.**

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** FedAvg + naive-CL (không hướng nào chống drift/forget).

| Phương diện | Naive | Có hướng FL+CL |
|---|---|---|
| Drift/forgetting | nặng | giảm |
| Đánh đổi | ít tham số | tham số (lambda, buffer) |
| Kết quả A/forgetting | kém | tốt hơn (chi phí) |

Đây là lý do cần method kết hợp — nhưng có giá.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** so 3 hướng trên cùng data FL+CL.

1. Setup: 2 client non-IID, task 2 đến lệch pha.
2. Chạy replay cục bộ, reg kép (2 lambdas), tách task (TIL — cung cấp task id khi test).
3. Bảng A/forgetting/per-client + cost (bộ nhớ, comm). 
4. Chọn hướng cho ràng buộc cụ thể (privacy/bộ nhớ/task-id).

---

## 11. Thực hành lập trình (phác, lại ghép G6.4+G7.4)

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/family_compare.py` (phác — bạn nối G6.4 FedAvg + G7.4 replay/reg):

```python
# 1. Replay cục bộ: client giữ buffer_i (G7.4), train trên data_new + buffer_i,
#    gộp bằng FedAvg (G6.4). KHÔNG gửi buffer_i lên server.
# 2. Regularization kép: thêm lambda_drift * ||θ-θ_global||² và
#    lambda_forget * EWC-like; gộp FedAvg.
# 3. (TIL) tách head: head per task (cần task id khi eval).
# Đo bảng A/forgetting per-client (G7.6) và cost.
```

(Giống G8.1–4: là *hướng dẫn ghép*, không phải script chạy ngay — bạn tự nối từ nền đã học để không copy mù. Đọc lại G6.4, G7.4.)

**Chú thích trung thực:** đây là phần "kỹ sư tự xây phòng thí nghiệm" — chương cung cấp cấu trúc + tiêu chí, bạn triển khai từ kỹ năng G6/G7. Đúng tinh thần dự án cuối của lộ trình.

---

## 12. Đánh giá

**Chỉ số:** nhóm được các paper/method theo 3 hướng (reg kép, replay cục bộ, tách task); biết drift/forgetting/async được xử lý bởi hướng nào; lập bảng trade-off và chọn theo ràng buộc; không cho rằng có "phương pháp duy nhất thắng".

**Vì sao chọn:** đúng yêu cầu prompt — "trình bày phương pháp như các lựa chọn có giả định và đánh đổi", không giả định một thuật toán giải mọi case.

**Chỉ số không thể hiện:** không đặt tên/cài từng method cụ thể (FedFed, FedReg, continual-tuning...) — nền đủ để tự đọc; không tối ưu λ. Đây là khung tư duy + thử nghiệm.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Có một thuật toán FL+CL tốt nhất." — Không; mỗi hướng có giả định (privacy, task id, bộ nhớ). Prompt nhấn mạnh điều này — phương pháp là lựa chọn với đánh đổi.
- **Hiểu lầm 2:** "Replay cục bộ 'giết' privacy." — Không hẳn: nó giữ mẫu *tại client*, không gửi lên server — bảo toàn "không rời dữ liệu" (FL mức đó). Nhưng giữ mẫu lâu vẫn có vấn đề quy định (G7.7) — cần đánh giá theo quy định, không nhìn lơ.
- **Hiểu lầm 3:** "Async chỉ là chi tiết kỹ thuật." — Không; lệch pha/stale update ảnh hưởng chất lượng gộp (8.2); phải tính đến. Bỏ qua = model toàn cục lẫn lộn.
- **Giới hạn:** "3 hướng" là khung nhập môn; paper kết hợp nhiều (replay + reg...). Và đánh đổi số liệu phụ thuộc bài — cần thí nghiệm riêng, không có số chung (G9).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Ba hướng kết hợp FL+CL + cơ chế.
2. Regularization kép phạt gì (2 khoản).
3. Vì sao không có "phương pháp duy nhất thắng".

### Luyện tập (sửa đổi / mở rộng)
4. Với bảng mục 8: chọn hướng cho bài "không được lưu mẫu, không biết task khi test" và nêu lý do (và hai còn lại vì sao kém).
5. Thiết kế ablation (G8.8): nêu cách cô lập "phát đóng góp của backbone vs FL method vs CL strategy".

### Thử thách (thiết kế / liên hệ)
6. Nêu một kịch bản "cập nhật không đồng bộ" và cách xử lý stale (khái niệm); nối với 8.2.
7. Bảng trade-off đầy đủ cho bài toán bạn chọn (ít nhất 4 bài build) — và quyết định nên chọn hướng nào dựa trên ràng buộc.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Reg kép (phạt drift + phạt forget, không giữ mẫu); replay cục bộ (client giữ buffer, không gửi lên server); tách task (head/module per task, cần task id).
2. `λ_drift·‖θ−θ_global‖²` (chống trôi khỏi global) + `λ_forget`·EWC-like (chống quên tham số quan trọng cũ).
3. Vì mỗi hướng có giả định & đánh đổi khác (privacy, task id, bộ nhớ); không có "một thuật toán" đúng cho mọi ràng buộc (prompt yêu cầu).
4. Chọn regularization kép (không lưu mẫu → privacy; không cần task id → CIL). Replay giữ mẫu ∉; tách task cần task id ∉. Với ràng buộc (không mẫu, không task id), reg kép khả vi.
5. Ablation: giữ nguyên dữ liệu/setup, lần lượt tắt từng thành phần (bỏ backbone-pretrained; dùng FedAvg thay reg; bỏ CL-regularizer) và đo A/forgetting → thấy đóng góp từng cái (G8.8).
6. Async: client gửi update từ model stale (cũ hơn round global) → gộp không nên coi như "ngang bằng"; dùng weight theo "age" hoặc buffer vòng (FedBuff-like). Nối 8.2 lệch pha — đừng giả định client luôn update mới nhất.
7. Bảng: hiệu năng, truyền thông, bộ nhớ, privacy, thích nghi, task-id — với từng hướng chấm thấp/cao. Quyết định theo ưu tiên ràng buộc (VD nếu privacy > bộ nhớ → chọn reg kép dù A thấp hơn).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Ba hướng kết hợp: **regularization kép / replay cục bộ / tách task**.
2. Mỗi hướng xử lý **drift + forgetting** theo cơ chế riêng, với giả định (privacy, memory, task id).
3. **Async / stale update** và **non-IID chồng forgetting** là khó khăn vận hành phải tính.
4. Luôn có **trade-off** (accuracy ↔ comm ↔ memory ↔ privacy ↔ thích nghi) — chọn theo ràng buộc, không "một phương pháp thắng".
5. Nền cho **ablation** (G8.8) và **giả định/điều kiện thất bại** (G8.9).

**Tự kiểm tra:**
- 3 hướng + cơ chế.
- Reg kép phạt gì.
- Vì sao không "method duy nhất thắng".
- Kể bảng trade-off + quyết định theo ràng buộc.

---

## 16. Đọc sâu bằng trực giác — hai dây neo kéo về hai nơi

Một nhân viên vừa phải theo quy tắc chung hiện tại, vừa giữ kỹ năng cũ. Hai yêu cầu có thể cùng tốt nhưng cũng có thể kéo ngược nhau. Dual regularization là cách viết hai dây neo ấy thành loss, không phải phép xóa mâu thuẫn.

| Yêu cầu đời thực | Khoản trong loss | Mốc được neo |
|---|---|---|
| Đừng đi quá xa quy tắc chung | Phạt drift | Global model hiện tại |
| Đừng phá kỹ năng đã học | Phạt forgetting | Snapshot/importance từ quá khứ |
| Học được việc đang đến | Loss dữ liệu mới | Mẫu cục bộ hiện tại |

**Đọc công thức minh họa:** `L=Lnew+λd(θ−θg)²+λf(θ−θold)²`: “ngoài lỗi mới, trả phí theo bình phương khoảng cách tới mốc global và mốc cũ”. Ví dụ này dùng một tham số và không có hệ số 1/2; khi đọc paper hãy kiểm quy ước vì gradient sẽ đổi hệ số.

**Tính tay:** θ=1.2, θg=1, θold=0.8, λd=2, λf=1. Hai phí là `2×0.2²=0.08` và `1×0.4²=0.16`, tổng 0.24. Gradient hai phí theo θ là `2×2×0.2+2×1×0.4=1.6`. Nếu gradient loss mới là −2 thì gradient tổng là −0.4: bước gradient descent vẫn tăng θ, nhưng ít mạnh hơn khi không có neo.

**Phản ví dụ:** λ quá lớn có thể giữ tham số gần mốc cũ nhưng không học nổi lớp mới. Neo global và neo cũ còn có thể xung đột khi global đã đổi miền. Không lưu ảnh gốc không bảo đảm “privacy OK”; còn update, snapshot và giới hạn giao thức. Với async, delta tính từ snapshot cũ cũng không được coi như cập nhật từ global mới nhất mà bỏ qua độ trễ.

:::interactive drift
:::

:::quiz
Chỉ tăng λf lên rất lớn có chắc đồng thời giảm quên và học lớp mới tốt hơn không?
A. Có, càng neo mạnh càng tốt
B. Không, giữ cũ mạnh có thể cản học mới
C. Có, vì loss mới không đổi
Đáp án: B
Giải thích: Loss mới giữ công thức nhưng gradient tổng và nghiệm tối ưu đã đổi. Phạt giữ tham số có thể làm mô hình không thích nghi đủ.
:::

:::goi-y
Thử tưởng tượng θ bị khóa đúng bằng θold dù dữ liệu mới cần θ khác hẳn.
:::

:::loi-giai
Cần khảo sát cả learning mới lẫn forgetting, trên validation và ngân sách cố định. Một đường trade-off cho biết nhiều hơn một giá trị λ được chọn sau khi nhìn test.
:::
