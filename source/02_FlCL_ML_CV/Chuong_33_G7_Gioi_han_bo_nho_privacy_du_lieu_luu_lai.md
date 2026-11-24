# Chương 7.7 — Giới hạn của CL: bộ nhớ, quyền riêng tư và dữ liệu được lưu lại (Giai đoạn 7)

> **Câu hỏi trọng tâm:** *Các phương pháp CL "giữ cũ" thường phải lưu gì đó (mẫu, tham số nền...) — vậy chúng tốn bộ nhớ, đụng quyền riêng tư, và vi phạm "không lưu dữ liệu cũ" thế nào?*

---

## 1. Vị trí trong lộ trình

Đã học 3 họ method (G7.4). Chương này nhìn vào **"cái giá" của việc giữ cũ**: bộ nhớ (replay buffer), quyền riêng tư (lưu mẫu), và yêu cầu "lưu dữ liệu bảo quản". Đây đặc biệt quan trọng khi kết hợp với FL (G8) — nơi privacy là rào cản lớn, dữ liệu client không được phép "để lại".

---

## 2. Kiến thức cần dùng

- Rehearsal/regularization/architecture (G7.4), privacy FL (G6.9), đánh giá CL (G7.6).

**Ôn nhanh:** rehearsal cần lưu mẫu (buffer); regularization cần lưu tham số/importance; architecture cần lưu module/head cũ. Mỗi cái đều chiếm chỗ hoặc giữ thông tin.

---

## 3. Câu chuyện mở đầu

Lan muốn dùng rehearsal (replay buffer) cho hệ thống y tế CL: giữ vài chục ảnh mỗi buổi để ôn. Đồng nghiệp bảo hiểm... nhưng Luật bảo vệ dữ liệu cá nhân cấm *lưu lại ảnh bệnh nhân cũ* lâu dài, và bộ nhớ thiết bị có hạn. 

Cô đối mặt với **giới hạn cố hữu của CL**: "giữ cũ" cần *lưu* thứ gì đó:
- **Lưu mẫu (buffer)** → tốn bộ nhớ + vi phạm privacy (giữ dữ liệu nhạy cảm).
- **Lưu tham số/importance (regularization)** → hầu như không giữ mẫu (tốt privacy) nhưng giữ nhiều tham số nền (bộ nhớ model, phức tạp tinh chỉnh).
- **Lưu architecture (module/head cũ)** → model lớn dần, cần biết task.

Không có "giữ cũ miễn phí": mọi method trả bằng bộ nhớ, privacy, hoặc độ phức tạp. Chương này giúp Lan (và bạn) chọn method phù hợp ràng buộc thực tế — và đây là điểm mấu chốt khi gặp FL (không thể lưu mẫu client → rehearsal toàn FL khó).

---

## 4. Câu hỏi trọng tâm

**Mỗi họ CL defer "giữ cũ" bằng cách lưu gì, và tốn bộ nhớ / vi phạm privacy / vi phạm 'không lưu dữ liệu cũ' ở mức nào?**

---

## 5. Trực giác

**"Giữ cũ" không miễn phí — phải 'mang theo' thứ gì đó.**

Hình dung ba cách "nhớ lại":
- **Rehearsal:** chụp và giữ một số "ảnh kỷ niệm" (mẫu cũ) để khi học mới lật xem lại. → Chi phí: kho ảnh (bộ nhớ) + giữ chính nội dung → privacy.
- **Regularization:** ghi lại "bản đồ quy tắc" + "đánh dấu quy tắc nào quan trọng" (tham số/importance), rồi khi học mới không được xé vùng quan trọng. → Không giữ mẫu (privacy tốt) nhưng giữ plot tham số (bộ nhớ model + phức tạp).
- **Architecture:** mở "ngăn kéo mới" cho task mới, ngăn cũ để nguyên. → Nhớ sạch nhưng model/phần cứng phình to ("tủ" nhiều ngăn) và cần biết task.

**Bộ nhớ / privacy / "không lưu dữ liệu cũ":**
- Rehearsal: **dữ dội nhất** về privacy (giữ mẫu gốc) và bộ nhớ (buffer).
- Regularization: privacy **tốt** (không giữ mẫu) nhưng giữ "bản sao tham số/statistics" — chiếm bộ nhớ model, có thể rò quanh qua biểu diễn; và nhạy tinh chỉnh.
- Architecture: privacy **tốt** (không giữ mẫu) nhưng chi phí bộ nhớ model to dần, và phụ thuộc "biết task".

**Giới hạn chung thường bị bỏ:** 
- CL không "từ free" — mọi "giữ cũ" đều có chi phí ẩn (lưu thứ gì đó).
- "Không chia sẻ dữ liệu" (FL) nhưng giữ *mẫu locally để replay* vẫn tạo vấn đề riêng tư/quy định (vì vẫn giữ dữ liệu nhạy cảm lâu). 
- Đánh giá CL (A/forgetting) đẹp mà không báo chi phí bộ nhớ/privacy = chưa đủ (G9).
- Tài nguyên client giới hạn (thiết bị biên) — bộ nhớ/bandwidth/power không được phép vô hạn.

**Phép so sánh "kho ảnh / bản đồ quy tắc / ngăn kéo":** trực quan cho 3 chi phí. **Giới hạn:** có method kết hợp (replay + regularization) làm mềm ranh giới; và "privacy" của regularization chưa tuyệt đối (biểu diễn có thể rò). Đừng nói "regularization không bao giờ rò dữ liệu".

---

## 6. Từ trực giác đến mô hình

- **Rehearsal:** buffer kích thước cố định (b) mẫu cũ; chi phí bộ nhớ/proteomics; khi task nhiều, buffer lưu tỉ lệ ít hơn.
- **Regularization:** lưu `θ_star` (tham số cũ) + importance (Fisher...) — chiếm ~2× bộ nhớ model/head; không giữ mẫu.
- **Architecture:** thêm module/head per task → chiếm tham số; cần "task id" để chọn.
- **Trade-off:** memory/privacy/tinh chỉnh/task-knowledge.

**Thuật toán (chọn method theo ràng buộc):**
```
1. Xác định ràng buộc: bộ nhớ giới hạn? privacy (có được giữ mẫu)? biết task khi test?
2. Nếu khả giữ mẫu + bộ nhớ ổn → rehearsal (mạnh nhất thực dụng).
3. Nếu không được giữ mẫu (privacy) → regularization (không giữ sample) hoặc architecture (nếu biết task).
4. Báo cáo chi phí bộ nhớ/privacy cùng A/forgetting (G9).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Đếm chi phí bộ nhớ rehearsal.**

```python
# buffer_cap = 1000 ảnh
# mỗi ảnh (3,32,32) = 3072 float → ~12KB float32
mem_per_img = 3*32*32*4
buffer_mem = 1000 * mem_per_img
print("buffer MB:", round(buffer_mem/1e6, 1))   # ~12.3 MB
```

**Bước 2 — Đếm chi phí regularization.**

```python
# lưu θ_star + importance ≈ 2× số tham số model
n_params = sum(p.numel() for p in model.parameters())
print("reg store MB:", round(2*n_params*4/1e6, 1))
```

**Bước 3 — Đếm chi phí architecture.** Số tham số tăng theo number of tasks (thêm head/module) — Ghi mô tả.

**Bước 4 — Nêu privacy trade-off:** rehearsal lưu mẫu (rủi ro privacy/quy định); regularization/architecture không lưu mẫu (nhưng giữ tham số/statistics — vẫn cần đánh giá).

**Lỗi thường gặp:** nghĩ regularization "tự nhiên private" (sai — đánh giá theo môi trường); chọn rehearsal khi không được giữ mẫu (Sai privacy); bỏ qua tài nguyên client khi chọn buffer to.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** CL 10 task, model 10M params, mỗi task 5.000 ảnh (32×32×3, lưu tensor float32 chưa nén). Đánh giá cost 3 họ.

**Bước 1 — Rehearsal, giữ 1.000 ảnh/task:** buffer `1000×10 task×32×32×3×4 byte = 122.88 MB` (MB thập phân; ≈117.19 MiB). Giữ = lưu 10.000 ảnh gốc → **privacy rủi ro** (lưu dữ liệu gốc).

**Bước 2 — Regularization:** nếu lưu một snapshot `θ_star` và một importance tổng hợp, bộ nhớ **bổ sung** là `2×10M×4 byte = 80 MB`, chưa tính model đang học, gradient và optimizer. Nếu lưu riêng hai tensor này cho mỗi task thì 10 task cần 800 MB. Hai con số tương ứng **hai cách cài đặt khác nhau**; không được đánh tráo. Không giữ ảnh gốc vẫn chưa phải bảo đảm riêng tư chính thức.

*(Chọn con số minh hoạ: rehearsal để mẫu gốc, reg giữ tham số — trade-off rõ.)*

**Bước 3 — Architecture:** tham số tăng theo task (head per task) — model phình.

**Bước 4 — Kết luận:** "CL giữ cũ" có chi phí; chọn trên ràng buộc bộ nhớ/privacy. Trong FL (G8), rehearsal toàn FL càng khó (không lưu mẫu client global) — thường dùng regularization hoặc replay tại client mỗi nơi sản xuất riêng.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "cứ replay buffer to, giữ nhiều mẫu cũ" (không tính chi phí).

| Phương diện | Replay to ngây thơ | Chọn theo ràng buộc (mem/privacy) |
|---|---|---|
| Giữ cũ mạnh | mạnh | tùy chọn |
| Bộ nhớ | lớn | khống chế |
| Privacy | lưu mẫu gốc (rủi ro) | cân nhắc (reg/arch khi cần) |
| Đánh đổi | bỏ qua cost | chọn đúng cost |

**Cải thiện:** không bỏ qua chi phí/privacy. **Đánh đổi:** cần đánh giá method theo ràng buộc, không mặc định "replay to".

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát chi phí bộ nhớ & hiệu năng khi giảm buffer.

1. Chạy rehearsal với buffer {200, 1000, 5000} → vẽ (A, forgetting) theo buffer size.
2. Ghi nhận: buffer càng to → giữ cũ tốt hơn nhưng chi phí bộ nhớ + privacy tăng. 
3. So với regularization (không lưu mẫu) — có chấp nhận "thấp hơn chút" để không lưu mẫu? Trade-off trực quan.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** `scripts/cl_cost.py` (phát triển rehearsal G7.4, thêm đo mem):

```python
import torch, torch.nn as nn
# sau khi có loop rehearsal (G7.4), thêm:
def mem_buf(cap, img_shape=(3,32,32), dtype_bytes=4):
    return cap * img_shape[0]*img_shape[1]*img_shape[2] * dtype_bytes

def mem_reg(model):
    np = sum(p.numel() for p in model.parameters())
    return 2 * np * 4          # θ_star + importance

model = nn.Linear(10, 2)       # mô hình minh họa cho phép đếm tham số, không phải kết quả thực nghiệm
print("buffer 1000 ảnh MB:", round(mem_buf(1000)/1e6, 2))
print("reg 2x params MB:", round(mem_reg(model)/1e6, 2))
```

**Kết quả dự kiến:** in MB cho buffer & reg — thấy rehearsal tốn theo dữ liệu (to), reg theo model. Đi cho thí nghiệm so A/forgetting theo buffer.

**Chú thích trung thực:** đếm bộ nhớ ước lượng (chưa kể overhead); và "privacy" không chỉ là "bytes" — là *bản chất dữ liệu lưu* (mẫu gốc vs tham số). Đo bytes là một phần; quyết định privacy theo quy định/đánh giá rủi ro (G6.9).

---

## 12. Đánh giá

**Chỉ số:** đếm chi phí bộ nhớ từng họ (buffer theo dữ liệu; reg theo model; arch theo task); phân biệt privacy (mẫu gốc vs tham số); chọn method theo ràng buộc bộ nhớ/privacy.

**Vì sao chọn:** "giữ cũ không miễn phí" — biết chi phí giúp chọn đúng method (nhất là trong FL) và đọc paper CL (họ "giấu" chi phí bộ nhớ/privacy khi khoe A).

**Chỉ số không thể hiện:** không định lượng "rò rỉ regularization" (cần đánh giá riêng); không phủ tất cả biến thể bộ nhớ (quantization). Chương này là khung suy nghĩ cost/privacy.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Regularization hoàn toàn 'không giữ gì'." — Giữ `θ_star`/importance (bộ nhớ tham số), và biểu diễn có thể rò thông tin. "Không giữ mẫu" ≠ "không giữ gì / không rò".
- **Hiểu lầm 2:** "Replay là 'đáng lỗ' vì mạnh, cứ dùng." — Nếu cấm lưu dữ liệu (privacy/quy định) thì không dùng được; và bộ nhớ thiết bị biên giới hạn. Không phải "vô điều kiện".
- **Hiểu lầm 3:** "Architecture 'an toàn' vì chỉ thêm module." — Model phình, cần biết task (TIL); trong CIL/FL không phải lúc nào cũng trực tiếp. Có đánh đổi.
- **Giới hạn:** "giữ cũ" luôn tốn — bài toán thực là *chọn chi phí chấp nhận*, không phải "tìm cách miễn phí". Và trong FL+CL (G8) chi phí này giao cross với đồng bộ.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Mỗi họ CL lưu gì để "giữ cũ" (buffer/θ+importance/module).
2. Vì sao rehearsal gặp vấn đề privacy nhiều hơn regularization?
3. "Giữ cũ không miễn phí" — cho ví dụ chi phí của từng cách.

### Luyện tập (sửa đổi / mở rộng)
4. Tính bộ nhớ buffer 500 ảnh 64×64×3 (float32) so với model 5M params (reg ~2×).
5. Chọn method cho: (a) hệ thống có cấm lưu bất kỳ mẫu; (b) thiết bị bộ nhớ nhỏ nhưng được giữ mẫu; (c) bài toán biết task khi test, cho phép thêm head.

### Thử thách (thiết kế / liên hệ)
6. Trong FL+CL (G8): client không được gửi mẫu lên server; nhưng có thể *tự giữ mẫu cục bộ để replay* không? — nêu lợi ích & vấn đề (privacy tại client, đồng bộ).
7. Thiết kế báo cáo "CL cost" trung thực (G9): ghi gì về bộ nhớ, privacy, method (min 4 mục).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Rehearsal: lưu **mẫu** (buffer). Regularization: lưu **θ_star + importance** (không mẫu). Architecture: lưu **module/head** cho task.
2. Rehearsal giữ *dữ liệu gốc* (nhạy cảm), regularization chỉ giữ tham số/statistics (không phải mẫu gốc) → ít rò "nội dung dữ liệu" trực tiếp hơn (vẫn cần đánh giá).
3. Rehearsal: buffer MB + giữ dữ liệu (privacy). Reg: bộ nhớ tham số (~2×) + tinh chỉnh khó. Arch: model to + cần biết task.
4. `500×64×64×3×4 ≈ 24.6 MB` (buffer). Model 5M×2×4 = 40 MB (reg). Buffer ảnh to gần bằng/nặng hơn model — thấy rehearsal tốn theo dữ liệu.
5. (a) regularization (không giữ mẫu — privacy tuân thủ). (b) rehearsal (được giữ mẫu, bộ nhớ khớp), buffer nhỏ. (c) architecture (head per task — biết task).
6. FL: client được phép lưu mẫu *cục bộ* để replay (không gửi lên server) → lợi: chống forgetting tại client, giữ privacy hơn centralized replay. Vấn đề: buffer lệch non-IID giữa client (replay thiên lệch), chi phí bộ nhớ client, đồng bộ không cân đối. G8.
7. Báo cáo: (a) method + tham số; (b) bộ nhớ dùng (buffer/θ); (c) mô tả privacy (có lưu mẫu gốc không? đánh giá rủi ro); (d) cấu hình (TIL/CIL) + cách chia; (e) chỉ số A/forgetting + cost. Để tái lập trung thực (G9).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. "Giữ cũ" trong CL **không miễn phí** — mọi method lưu gì đó (buffer mẫu / θ+importance / module).
2. **Rehearsal** tốn bộ nhớ theo dữ liệu + đụng **privacy** (lưu mẫu gốc).
3. **Regularization/architecture** không giữ mẫu (privacy tốt hơn) nhưng tốn tham số/model + điều chỉnh.
4. Chọn method theo **ràng buộc bộ nhớ/privacy/task-knowledge**, không mặc định.
5. Đây là điểm mấu chốt khi kết hợp **FL+CL (G8)** — rehearsal toàn FL khó vì privacy.

**Tự kiểm tra:**
- Mỗi họ lưu gì để giữ cũ.
- Vì sao rehearsal đụng privacy, reg thì không lưu mẫu.
- Cách đếm bộ nhớ buffer vs reg.
- Chọn method theo ràng buộc — liên hệ FL+CL (G8).

---

## 16. Đọc sâu bằng trực giác — trí nhớ cũng có hóa đơn

Giữ ảnh cũ giống mang theo hồ sơ gốc; lưu snapshot và importance giống mang bản tóm tắt kỹ năng. Cả hai cần chỗ chứa, nhưng loại thông tin lưu và rủi ro không giống nhau. Đừng chỉ đếm số mẫu mà quên cách mã hóa.

| Vật được giữ | Trong CL | Cách đếm dung lượng |
|---|---|---|
| Ảnh cũ để ôn | Replay buffer | Số ảnh × kích thước thực mỗi ảnh |
| Bản tham số cũ | Snapshot θ* | Số tham số × byte mỗi tham số |
| Mức quan trọng của tham số | Importance/Fisher | Phụ thuộc lưu chung hay riêng từng task |

**Đọc công thức:** `Bảnh=n·H·W·C·b`: “số ảnh nhân số pixel mỗi ảnh, số kênh và byte mỗi kênh”. Công thức dành cho tensor dense chưa nén; JPEG/PNG có kích thước biến thiên, còn nhãn, metadata và cấu trúc Python tốn thêm.

**Tính tay:** 1.000 ảnh 32×32 RGB lưu uint8 cần `1000×32×32×3×1=3.072 MB`; cùng ảnh đổi float32 cần 12.288 MB. Mười nghìn ảnh float32 cần 122.88 MB. Model 10 triệu tham số float32 cần 40 MB; một snapshot và một importance vector bổ sung 80 MB, chưa tính model đang học, gradient hay optimizer. Nếu lưu riêng chúng cho 10 task thì phần bổ sung thành 800 MB.

**Phản ví dụ:** tính 1.000 ảnh uint8 khoảng 3 MB rồi suy 10.000 ảnh float32 cũng khoảng 30 MB. Đổi sang float32 đã tăng 4 lần, còn tăng số ảnh 10 lần; kết quả đúng là 122,88 MB cho phần pixel, chưa kể nhãn và metadata.

**Giới hạn:** “không replay ảnh” chưa bảo đảm riêng tư; tham số và embedding cũng có thể chứa thông tin về dữ liệu. Giữ buffer cố định còn tạo cạnh tranh: khi task tăng, số mẫu đại diện mỗi task có thể giảm. So phương pháp phải ghi cả ngân sách byte và quy tắc chọn mẫu, không chỉ tên rehearsal hay regularization.

:::interactive memory
:::

:::quiz
Cùng một ảnh RGB chưa nén, đổi tensor từ uint8 sang float32 làm phần dữ liệu pixel tăng mấy lần?
A. 2 lần
B. 4 lần
C. Không đổi
Đáp án: B
Giải thích: uint8 dùng 1 byte mỗi giá trị, float32 dùng 4 byte. Số pixel và kênh giữ nguyên nên tăng 4 lần.
:::

:::goi-y
Phân biệt bit với byte: 8 bit là một byte; 32 bit là bốn byte.
:::

:::loi-giai
1.000 ảnh tăng từ 3.072 lên 12.288 MB ở phần pixel. Bộ nhớ khi train còn có batch và activation, nên ngân sách lưu buffer không thay thế phép đo RAM/VRAM đỉnh.
:::
