# Chương 8.1–8.4 — Kết hợp FL + CL + CV: nhiều client khác nhau, dữ liệu thay đổi theo thời gian, học lớp mới không quên cũ, và dùng pretrained trong liên kết (Giai đoạn 8)

> **Câu hỏi trọng tâm:** *Khi vừa có nhiều client (dữ liệu non-IID) vừa có dữ liệu đến theo thời gian (nhiệm vụ mới), làm sao để model toàn cục vừa học lớp mới vừa không quên lớp cũ — trong khi mỗi client lại chỉ tinh chỉnh riêng?*

---

## 1. Vị trí trong lộ trình

Đây là **giai đoạn đích** — ghép ba trụ: **FL** (nhiều client không gom dữ liệu), **CL** (dữ liệu/nhiệm vụ đến theo thời gian), **CV** (ảnh là dữ liệu trung tâm). Mọi kiến thức G1–G7 hội tụ: non-IID (G6.5), forgetting (G7.2), ba họ CL (G7.4), pretrained (G5), đánh giá (G6.8, G7.6).

Gộp 8.1–8.4 vì chúng là "bài toán + động lực" của giai đoạn: tại sao FL+CL tự nhiên song hành, bối cảnh ảnh, học lớp mới không quên, và vai trò pretrained.

---

## 2. Kiến thức cần dùng

- FL (G6: non-IID, FedAvg, client drift, privacy), CL (G7: forgetting, TIL/CIL, rehearsal/reg/arch), CV (G4), pretrained (G5).

**Ôn nhanh:** client drift = mỗi client tối ưu loss cục bộ khác nhau → model toàn cục lệch (G6.5). Forgetting = học task mới ghi đè cũ (G7.2). Điểm mấu chốt mới: bây giờ *cả hai* xảy ra đồng thời và tương tác.

---

## 3. Câu chuyện mở đầu

Lan triển khai FL cho **một mạng các phòng khám** nhận diện ảnh da liễu:
- Mỗi phòng khám (client) có **ảnh + phân phối bệnh khác nhau** (non-IID): phòng A chủ yếu Bệnh X, phòng B chủ yếu Bệnh Y.
- Theo thời gian, **bệnh mới xuất hiện** (lớp mới): năm sau họ cần nhận thêm "u hắc tố".
- Mỗi client chỉ được **giữ dữ liệu cục bộ**, không gửi ảnh lên server.

Bài toán: (1) không gom được dữ liệu (FL), (2) dữ liệu đến dần + lớp mới xuất hiện (CL), (3) trong khi vẫn phải **học lớp mới mà không quên lớp cũ**, giữa một mạng các client không giống nhau. Đây chính là **Federated Continual Learning** — khó khăn kép: non-IID gây client drift (FL) chồng lên forgetting (CL). Nếu bạn chỉ dùng FedAvg + naive-CL, mọi thứ sụp đổ nhanh hơn từng bài toán riêng.

---

## 4. Câu hỏi trọng tâm

**Vì sao FL + CL + CV là một bài toán tự nhiên (và khó kép)? Và trong bối cảnh đó, vấn đề "client non-IID + dữ liệu theo thời gian + lớp mới + pretrained" đặt ra những cạm bẫy nào?**

---

## 5. Trực giác

**Hai vấn đề chồng nhau (khó kép):**
1. **FL (non-IID):** mỗi client tối ưu loss cục bộ lệch → **client drift** (G6.5).
2. **CL (forgetting):** mỗi client học task/lớp mới có thể **quên cũ** (G7.2).
Khi *cả hai*: client vừa drift (nghiêng theo phân phối riêng) vừa quên (mỗi client thấy task mới theo nhịp riêng) — **server gộp các bản "vừa trôi vừa quên"** → model toàn cục càng hỗn loạn. Khó hơn tổng hai bài toán vì sự lệch của các client **khác nhau về pha** (client A đang học task mới trong khi B chưa gặp).

**Bốn thách thức cụ thể (8.1–8.4):**
- **8.1 Nhiều client khác nhau:** thiết bị, ảnh, phân phối khác — non-IID vốn có của ảnh (miền, nhãn, cân bằng). FedAvg đơn dễ bị client to áp đảo → cần lưu tâm (G6.5/G4.6).
- **8.2 Dữ liệu client thay đổi theo thời gian:** client nhận data mới theo nhịp riêng; không đồng bộ khi nào mỗi client "thấy task mới". "Task" trong FL phân tán không đồng bộ — khác CL tập trung (cùng lúc cho mọi task).
- **8.3 Học lớp mới không quên lớp cũ:** vừa là CL (forgetting) vừa bị FL làm phức tạp (CL method như rehearsal khó vì không lưu mẫu client lên server — G7.7/G6.9).
- **8.4 Pretrained trong FL:** dùng model nền tảng (ViT từ G5) làm khởi tạo → client học nhanh (ít data) và giữ biểu diễn chung (giảm drift). Nhưng chi phí tải model to (bandwidth), và mỗi client fine-tune pretrained theo miền riêng có thể *hủy* tính chung.

**Phép so sánh "nhiều chi nhánh cùng 'nghiên cứu' một tài liệu dùng chung, mỗi chi nhánh thêm ghi chú riêng, ai nhận tài liệu mới trước ai cũng không đồng đều; nếu không có định bản, người đọc bản tổng hợp rối":** trực quan cho "cập nhật phân tán không đồng bộ + gộp bản". **Giới hạn:** "bản tổng hợp" ở đây là gộp trọng số — phép ẩn dụ không cho thấy mức độ "lệch pha" nghiêm trọng như thật; và "học lớp mới" trong FL còn giao "client học theo thứ tự khác nhau". Đừng đơn giản hoá.

---

## 6. Từ trực giác đến mô hình

- **Client:** giữ dữ liệu ảnh riêng, phân phối non-IID, data đến theo thời gian.
- **Task mới:** lát cắt thời gian xuất hiện lớp mới (CL, trong ngữ cảnh phân tán).
- **Server:** điều phối round; gộp; không thấy data; cần đồng bộ/đối phó "lệch pha" giữa client.
- **Method kết hợp:** vừa chống drift (FL) vừa chống forgetting (CL) + tận dụng pretrained.

**Thuật toán (khung FL+CL cơ bản):**
```
Khởi tạo: global model (= pretrained nếu có, G5).
Mỗi round:
  chọn client; broadcast global model.
  mỗi client: học trên dữ liệu mới (task mới của nó) + bảo vệ task cũ (rehearsal cục bộ / regularizer CL).
  gửi Δ (hoặc Δ sau phương pháp chống drift/forget).
Server: gộp (FedAvg hoặc method FL cải tiến).
Theo thời gian: theo dõi per-client, per-task (G6.5 / G7.6).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Nhận diện "khó kép".** Tự hỏi bài toán của bạn có BOTH (a) nhiều client non-IID và (b) task/lớp đến theo thời gian không. Nếu chỉ (a) → FL thuần; chỉ (b) → CL thuần; cả hai → FL+CL (khó).

**Bước 2 — Bảo vệ "dữ liệu cũ" mà không đụng privacy.** Trong FL, không gửi mẫu lên server; nhưng client có thể *giữ buffer cục bộ* (replay tại client, không chia sẻ) — G7.7. Đây là một cách chống forgetting mà không rời dữ liệu.

**Bước 3 — Điều tiết drift + forgetting.** Đổi FedAvg → regularization để client không trôi xa global (giống FedProx chống drift, G6.5) *và* thêm CL-regularizer per-client chống forgetting — kết hợp hai "phạt".

**Bước 4 — Dùng pretrained cẩn thận.** Khởi tạo global từ pretrained (G5) → hội tụ nhanh; nhưng mỗi client fine-tune lr lớn sẽ phá biểu diễn chung (drift). Nên giữ phần lớn backbone (frozen) hoặc fine-tune lr nhỏ (G5.6 / G4.5).

**Lỗi thường gặp:** đối xử như "FL thường + CL thường" tách biệt (BỎ QUA tương tác "lệch pha client"); rehearsal cần gửi mẫu (Sai — gửi mẫu vỡ privacy); fine-tune pretrained lr lớn (drift); đánh giá chỉ 1 con số.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 2 client; task 1 = lớp A, task 2 = lớp B (mới). Client 1 nhận task 2 sớm (round 5), client 2 nhận muộn (round 10).

**Bước 1 — Lệch pha:** Lúc round 5–9, client 1 đang học lớp B (quên A của nó) còn client 2 chưa thấy B. Server gộp 2 bản "khác pha" → global đánh giá A/B lẫn lộn.

**Bước 2 — Nếu naive-CL (không chống forgetting) + FedAvg:** client 1 quên A, client 2 chưa học B → global không giỏi A lẫn B.

**Bước 3 — Nếu có rehearsal cục bộ + pretrained backbone:** client 1 ôn lại A cục bộ (giữ), client 2 khi chưa có B chỉ học A; đến round 10 cả hai học B; global giữ được cả hai nhờ mỗi client giữ cũ + khởi tạo tốt.

**Bước 4 — Đọc:** "lệch pha" (8.2) làm CL trong FL khác CL tập trung — đây là điểm KHÓ ĐẶC TRƯNG cần chú ý (G8.6).

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ FedAvg + naive-CL (không đối mặt non-IID & forgetting kép), hoặc xem như hai vấn đề tách biệt.

| Phương diện | Tách biệt / naive | FL+CL có lưu ý |
|---|---|---|
| Non-IID & forgetting | bỏ qua tương tác | xử lý kết hợp |
| Lệch pha client | không tính | lưu ý (bất đồng bộ) |
| Privacy + replay | rehearsal nên gửi mẫu (vỡ) | replay cục bộ |

**Cải thiện:** giải quyết "bài toán thật" (vừa không gom data, vừa học theo thời gian). **Đánh đổi:** phức tạp, chi phí trao đổi/đánh giá — cần thiết kế cẩn thận.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát "lệch pha" + so sánh method.

1. 2 client; task 1 {lớp 0,1}; client 1 thêm task 2 {lớp 2,3} ở round 5, client 2 ở round 10.
2. Chạy: (a) FedAvg+naive-CL; (b) FedAvg + rehearsal cục bộ; (c) pretrained backbone + (b).
3. Đo bảng A/forgetting per-client (G7.6) + per-client accuracy — quan sát: naive quên; rehearsal cục bộ giữ hơn; pretrained hội tụ nhanh.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch.

**Cấu trúc:** frameworks ở G6.4 (FedAvg) + G7.4 (rehearsal) gắn lại; trong thư mục `session/` viết `scripts/fl_cl_demo.py` (phác — gắn kết):

```python
# Nguyên tắc: tái sử dụng local_delta từ G6.4 và replay từ G7.4,
# thêm "lệch pha": các client nhận task mới tại round khác nhau.
# theo dõi bảng per-client, per-task.
# PHÁC — bạn hoàn thiện bằng G6.4 (FedAvg) + G7.4 (replay) như chỉ dẫn.
```

(Đây là "chương ghép" — nhắc bạn nối 2 kỹ năng; không phải script chạy ngay để tránh copy mù aggregation sai. Đọc kỹ G6.4 + G7.4 để ghép đúng.)

**Lỗi thường gặp:** copy FedAvg mà quên chống forgetting; copy rehearsal mà gửi mẫu lên server (vỡ FL privacy); không theo dõi per-task (chỉ accuracy cuối giấu quên).

**Chú thích trung thực:** chương này dạy *cấu trúc ghép* — đọc lại G6.4/G7.4 và nối chúng. Không cung cấp "one-shot script" để bạn tự tay xây từ nền đã học (đúng tinh thần lộ trình).

---

## 12. Đánh giá

**Chỉ số:** nhận diện "khó kép" (non-IID + forgetting) và "lệch pha client"; biết rehearsal trong FL phải *cục bộ* (không gửi mẫu); biết dùng pretrained cẩn thận (lr nhỏ / frozen); thiết kế thí nghiệm đo per-client per-task.

**Vì sao chọn:** đây là "lăng kính" để đọc mọi paper FL+CL — biết chúng giải quyết gì trong (khó kép + lệch pha + privacy).

**Chỉ số không thể hiện:** không bao gồm method cụ thể (FedProx-FedCL, continual-FedAvg...) — G8.5–8.7; ablation (G8.8); giả định thất bại (G8.9).

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "FL+CL chỉ là 'học CL rồi huấn luyện FL'." — Sai; sự "lệch pha" (client gặp task mới không đồng bộ) và non-IID tương tác khiến không thể xử lý tuần tự đơn giản. Cần method phối hợp.
- **Hiểu lầm 2:** "Rehearsal trong FL = gửi mẫu cũ lên server." — Sai (phá privacy, G6.9). Rehearsal phải diễn ra **tại client** (able giữ mẫu locally), hoặc thay bằng regularization. Đừng gửi mẫu.
- **Hiểu lầm 3:** "Dùng pretrained là 'phép màu'." — Hội tụ nhanh, ít drift ban đầu, nhưng fine-tune client lr lớn hoặc miền client quá lệch có thể phá. Không tự nhiên an toàn.
- **Giới hạn:** "lệch pha" là một trong nhiều khó khăn (còn đánh số client, resource không đồng đều, update không đồng bộ — G8.6). Đây là "lăng kính" nhập môn, chưa phủ mọi biến thể.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Vì sao FL+CL khó kép (2 nguồn) — nêu.
2. "Lệch pha client" là gì; client task mới không đồng bộ gây khó gì.
3. Rehearsal trong FL phải ở đâu (cục bộ server/client) và vì sao.

### Luyện tập (sửa đổi / mở rộng)
4. Với 3 client, mô tả kịch bản "lệch pha" (thời điểm từng client học task mới) và hệ quả lên global.
5. Liệt kê 3 ràng buộc để chọn method FL+CL (privacy, bộ nhớ client, biết task không).

### Thử thách (thiết kế / liên hệ)
6. Thiết kế một "baseline" cho thí nghiệm FL+CL (như G9 yêu cầu): nêu method, cách chia task/client, chỉ số.
7. Nối G8.5–8.7: đề xuất 2 hướng khả thi để kết hợp (regularization kép / rehearsal cục bộ + FedAvg) và nên đánh giá thế nào.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. (a) non-IID → client drift (FL); (b) task/lớp đến theo thời gian → forgetting (CL). Cả hai cùng lúc, tương tác (client vừa trôi vừa quên theo pha riêng) → khó hơn 2 bài toán riêng.
2. Các client nhận task mới tại lượt khác nhau → "bản local" khác pha; gộp các bản khác pha → global lẫn lộn (không giống CL tập trung cùng nhịp).
3. Rehearsal phải ở **cục bộ client** (giữ mẫu tại client, không gửi lên server) — vì gửi mẫu lên server phá privacy/data không rời client (G6.9).
4. Nếu client A học B mới round 3, B round 7, C chưa học đến round 10 — global giữa round 3–7 học "nửa vời lớp mới", còn lớp old bị pha khác; cần xử lý trading/giữ cũ đồng đều.
5. (a) privacy (có giữ mẫu được không?); (b) bộ nhớ/tài nguyên client (replay to?); (c) có "task id" khi test (TIL vs CIL). Lựa theo 3 ràng buộc.
6. Baseline: tập client non-IID (seed rõ), task chia theo thứ tự, method = FedAvg + naive-CL (không chống forgetting), chỉ số A + forgetting + per-client; so với method cải tiến. Identify "có phương pháp hơn baseline không".
7. Hướng: (a) regularization kép (chống drift bằng FedProx-like + chống forgetting bằng CL-regularizer); (b) rehearsal cục bộ + FedAvg (giữ cũ tại client). Đánh giá bằng A/forgetting/per-client (G6.5/G7.6) — G8.5–8.7.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **FL+CL+CV** là bài toán đích: nhiều client non-IID + dữ liệu theo thời gian + ảnh.
2. **Khó kép**: non-IID (drift) chồng forgetting (quên) — tương tác, không tách biệt.
3. **Lệch pha client** (gặp task mới không đồng bộ) — điểm khác biệt vs CL tập trung.
4. Rehearsal trong FL phải **cục bộ** (không gửi mẫu); pretrained cần fine-tune lr nhỏ/frozen.
5. Đo per-client per-task (A/forgetting) — nền cho các method G8.5–8.9.

**Tự kiểm tra:**
- Vì sao khó kép?
- Lệch pha client là gì.
- Rehearsal đặt ở đâu trong FL.
- Liệt kê ràng buộc chọn method.

---

## 16. Đọc sâu bằng trực giác — cùng một hôm, khác một bài học

Hai cửa hàng nhận sản phẩm mới ở hai tuần khác nhau. Họ đang cùng học một quy tắc chung, nhưng “hiện tại” của mỗi nơi không chứa cùng loại dữ liệu. Trong FL+CL, cần một bảng có cả trục client lẫn trục thời gian.

| Khác biệt vận hành | Trong FL+CL | Câu hỏi đánh giá |
|---|---|---|
| Cửa hàng ở vùng khác nhau | Non-IID giữa client | Client nào đang yếu? |
| Hàng mới đến lệch tuần | Task arrival lệch pha | Ai đã thật sự gặp lớp mới? |
| Sửa cách nhận hàng mới làm quên hàng cũ | Forgetting trong client | Lỗi task cũ tăng bao nhiêu? |

**Đọc công thức:** `Llocal=(1−ρ)Lnew+ρLreplay`: “loss cục bộ trộn phần dữ liệu mới và phần ôn cũ, với ρ quyết định mức ôn”. Đây là một lựa chọn thiết kế, không phải công thức bắt buộc của mọi FL+CL. Sau học cục bộ, server vẫn phải gộp các cập nhật theo giao thức đã định.

**Tính tay giả lập:** round 5, client A có 80 mẫu lớp mới và replay 20 mẫu cũ; nếu tính loss trung bình trên toàn batch thì trọng số mới/cũ là 0.8/0.2. Client B chưa có lớp mới, chỉ có 100 mẫu cũ. Gộp model hai client không tương đương dựng một batch 200 mẫu rồi chạy một bước gradient, vì mỗi client có thể đã chạy nhiều bước phi tuyến. Đến round 10 B mới nhận lớp mới; phải ghi lịch này trong config.

**Phản ví dụ:** client B chưa từng học lớp C, dự đoán sai C rồi bị ghi là “quên C”. Không có mốc năng lực trước đó thì đó là thiếu kiến thức hoặc lỗi chuyển giao, không phải forgetting. Muốn đo quên phải so sau khi đã học với một thời điểm sau đó.

**Giới hạn:** chưa từng thấy một lớp khác với quên lớp đã học. Test toàn bộ lớp tương lai trước khi client gặp chúng có thể đo khả năng chuyển giao hoặc khả năng global, nhưng không nên gọi mọi lỗi ấy là forgetting cục bộ. Server và client cũng có phạm vi kiến thức khác nhau; cần chỉ rõ model nào được đánh giá.

:::interactive pipeline
:::

:::quiz
Client B chưa từng được học lớp mới C. B dự đoán sai C trước khi nhận dữ liệu. Chỉ từ đó có thể kết luận B quên C không?
A. Có, mọi lỗi đều là forgetting
B. Không, C chưa từng được B học
C. Có, vì server đã biết C
Đáp án: B
Giải thích: Forgetting cần một mốc năng lực trước đó. Chưa học lớp C là thiếu kiến thức hoặc bài toán chuyển giao, không tự động là quên C.
:::

:::goi-y
Tìm lần đầu lớp C xuất hiện trong lịch dữ liệu của B, và điểm C sau lần học ấy.
:::

:::loi-giai
Cần so sau-khi-học với một thời điểm về sau. Với global model, lịch lớp đã gặp có thể khác B; ghi riêng phạm vi đánh giá để tránh trộn hai lịch sử.
:::
