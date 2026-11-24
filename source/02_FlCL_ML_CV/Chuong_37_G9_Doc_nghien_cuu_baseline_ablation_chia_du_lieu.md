# Chương 9.1–9.3 — Đọc nghiên cứu: cấu trúc, baseline vs ablation, và kiểm tra cách chia dữ liệu/client/nhiệm vụ (Giai đoạn 9)

> **Câu hỏi trọng tâm:** *Làm sao đọc một bài nghiên cứu FL/CL/CV đúng cách — tìm câu hỏi, nhận diện baseline/ablation/ablation/ablation, và nghi ngờ cách chia dữ liệu có hợp lệ không?*

---

## 1. Vị trí trong lộ trình

Đã có toàn bộ nền (G1–G8). Giai đoạn cuối dạy **kỹ năng đọc nghiên cứu (literature reading)** — cốt lõi để tự học về sau: tìm câu hỏi/nghi cứu, phân biệt baseline/ablation/kết quả chính, kiểm tra cách chia dữ liệu/client/nhiệm vụ. Đây là cầu từ "học" đến "nghiên cứu". Phần tổng hợp và cũng chuẩn bị cho dự án cuối (G9.8).

---

## 2. Kiến thức cần dùng

- Baseline (G2), ablation (G8.8), chia train/test & non-IID (G2.3, G6.5), đánh giá CL (G7.6), rò rỉ dữ liệu (G2.8).

**Ôn nhanh:** baseline = chuẩn so sánh; ablation = cô lập thành phần; test/client/task chia đúng (tránh rò rỉ, G2.8/G6.5).

---

## 3. Câu chuyện mở đầu

Lan nhận nhiệm vụ "đọc 1 bài FL+CL và tóm tắt". Cô chìm trong đó — không biết nên chú ý gì. Người hướng dẫn đưa **khung đọc**: *"Đừng đọc từ đầu đến cuối. Hãy tìm 3 thứ: (1) Câu hỏi/giả định họ giải quyết gì — vấn đề gì, trong ngữ cảnh nào. (2) Kết quả họ báo — cái nào là baseline, cái nào là ablation (đóng góp từ đâu), cái nào là số chính. (3) Cách họ chia dữ liệu/client/nhiệm vụ — có hợp lệ, có rò rỉ, có phù hợp vấn đề không."* Với 3 lăng kính đó, mọi paper trở nên có cấu trúc và đọc nhanh hơn nhiều.

---

## 4. Câu hỏi trọng tâm

**Khung đọc paper (câu hỏi / baseline-ablation / cách chia dữ liệu) là gì, và vì sao 3 điểm đó quyết định chất lượng đánh giá?**

---

## 5. Trực giác

**Đọc paper "theo lăng kính câu hỏi", không đọc tuyến tính.** Ba đôi mắt:

1. **Tìm câu hỏi & đóng góp:** paper FL/CL đang "giải vấn đề gì" — chống client drift? chống forgetting? giảm bandwidth? trong bối cảnh nào (FL thuần, CL thuần, FL+CL)? Đóng góp của họ là gì (phương pháp? cải thiện? phân tích?). Nhận diện *giả định* (client online? biết task? dữ liệu i.i.d.?).

2. **Nhận diện 3 loại kết quả:**
   - **Baseline:** phương pháp chuẩn để so (trung tâm, FedAvg, naive-CL...). Bạn phải hỏi "baseline của họ đủ tốt chưa / có đúng không?" — nếu baseline yếu, mọi số khác "dễ thắng".
   - **Ablation:** kết quả khi tắt/thay từng thành phần — cho biết *đóng góp thật từ đâu* (G8.8). Nếu không có ablation, không biết "success do method hay backbone".
   - **Kết quả chính:** số chính trên benchmark — nhưng chỉ có nghĩa trong ngữ cảnh baseline/ablation đúng.

3. **Kiểm tra cách chia dữ liệu / client / nhiệm vụ:** 
   - Chia `train/val/test` có đúng (chống leakage G2.8)? 
   - Chia `client` có non-IID đúng/sai? Có tách client test khỏi client train (thử khái quát client mới)? 
   - Chia `task` (CL) có đúng chuỗi thời gian, có đúng cấu hình (TIL/CIL/DIL — G7.3)? Có "test cùng task nhiệm vụ đã huấn luyện" (không) hay nhiệm vụ mới? 
   - Nếu chia sai → kết quả không trung thực dù method đẹp.

**Phép so sánh "đọc bản thiết kế: hỏi 'giải quyết gì', 'phần nào chịu lực', 'vật liệu/lắp có chuẩn không'":** trực quan (3 câu hỏi). **Giới hạn:** đọc paper vẫn cần ngữ cảnh (nhiều paper không rõ ràng); đây là khung *chủ động*, bạn vẫn cần đi sâu section khi cần. Đừng nghĩ 3 câu là đủ đọc hết chi tiết method — nhưng đủ để đánh giá nhanh và định hướng.

---

## 6. Từ trực giác đến mô hình

- **Câu hỏi nghiên cứu:** vấn đề + giả định + đóng góp.
- **Kết quả:** baseline / ablation / main.
- **Thiết kế thí nghiệm:** cách chia train/val/test, client, task; seed; chuẩn đánh giá.

**Thuật toán đọc paper (5 bước gọn):**
```
1. Abstract/intro → câu hỏi + đóng góp.
2. Phương pháp → họ làm gì giải vấn đề.
3. Thiết kế thí nghiệm → cách chia data/client/task + baseline.
4. Bảng kết quả → tách baseline/ablation/main.
5. Limitations → giả định & điều kiện thất bại.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Abstract & intro:** tìm câu chủ đề: "We propose X to solve Y under Z assumptions". Ghi lại: Y (vấn đề), Z (giả định), X (đóng góp).

**Bước 2 — Thiết lập thí nghiệm:** tìm phần "setup/experiments": dataset nào; chia client/task thế nào; baseline nào so; seed? Đây là phần quyết định "kết quả có thật".

**Bước 3 — Tách 3 loại kết quả:** cột "baseline" (FedAvg/naive...), hàng/col "ablation", cột "ours". Nếu không thấy ablation bảng → ghi chú "thiếu; không biết đóng góp từ đâu".

**Bước 4 — Nghi ngờ chia data:** tự hỏi "client test có nằm riêng không?", "task mới có tách khỏi train không?", "có rò rỉ thời gian/đặc trưng không (G2.8)?". Nếu nghi — để đọc sâu method tables.

**Bước 5 — Kết luận:** method họ giải quyết gì, đóng góp từ đâu (theo ablation), trong giả định nào, thất bại khi nào.

**Lỗi thường gặp:** đọc paper tuyến tính rồi "tóm" nhưng bỏ qua thiết kế thí nghiệm và baseline; tin số main mà không kiểm baseline/ablation; không nhận diện "client/task test tách riêng" (khi không tách → khái quát quá mức).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** một paper FL+CL báo bảng:

| Method | Clients | A (avg acc) | Forgetting |
|---|---|---|---|
| FedAvg (baseline) | 3 | 0.55 | 0.30 |
| Ours (full) | 3 | 0.72 | 0.08 |
| Ours − pretrained (ablation) | 3 | 0.58 | 0.14 |
| Ours − reg_FL | 3 | 0.68 | 0.10 |
| Ours − reg_CL | 3 | 0.70 | 0.22 |

**Bước 1 — Baseline:** FedAvg 0.55 — họ thắng (0.72) so với baseline. Hỏi: baseline có phải "yếu có chủ đích" (thiếu pretrained, naive-CL)? Nếu baseline dùng from-scratch + naive-CL thì "thắng" dễ.

**Bước 2 — Ablation:** bỏ pretrained → A 0.58 (tụt 0.14) → **backbone đóng góp lớn**. bỏ reg_FL → 0.68 (tụt 0.04), bỏ reg_CL → forgetting 0.22 (tăng) → **reg_CL chống forgetting**. Kết luận: "success chủ yếu từ pretrained + reg_CL; reg_FL nhỏ."

**Bước 3 — Chia dữ liệu:** họ có tách **mẫu test khỏi mẫu train** không? Test trên client đã tham gia huấn luyện là hợp lệ nếu mẫu được giữ riêng và mục tiêu là khả năng trên client đã biết. Test trên client chưa gặp là giao thức khác; cần báo rõ cả hai, không nhầm trùng client với trùng mẫu.

**Bước 4 — Kết luận đọc:** method thật sự đóng góp reg_CL (giảm forgetting); phần backbone thừa hưởng pretrained; baseline cần xem kỹ. — Đây là "đọc qua lăng kính".

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** đọc tuyến tính, tin cột "ours" cao.

| Phương diện | Đọc tuyến tính | Khung 3 lăng kính |
|---|---|---|
| Hiểu vấn đề | mơ hồ | câu hỏi + giả định rõ |
| Baseline/ablation | không tách | tách, biết đóng góp |
| Kiểm chia data | không | nghi rò rỉ rõ |
| Đánh đổi | nhanh "tóm" | có cấu trúc, đọc sâu khi cần |

**Cải thiện:** đọc/đánh giá paper đúng, tránh phóng đại. **Đánh đổi:** cần chủ động đọc thiết kế thí nghiệm (không lướt).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** áp khung đọc vào 1 paper (thật hoặc giả).

1. Chọn 1 paper FL/CL (hoặc abstract giả trong tài liệu).
2. Áp 5 bước (mục 7): câu hỏi, thiết kế, tách baseline/ablation/main, nghi ngờ chia data, limitations.
3. Viết 1 trang "tóm tắt có lăng kính" — khác một "tóm tắt nội dung".
4. Đây là kỹ năng bạn dùng mãi (rèn bằng đọc thật).

---

## 11. Thực hành (không bắt buộc code)

Chương này là *kỹ năng đọc* — thực hành là đọc + viết (mục Thí nghiệm & Bài tập), không cần code. Nếu muốn rèn "kiểm chia data", dùng lại `noniid_demo.py` (G6.5) để thấy hậu quả chia client trùng / không trùng test.

**Chú thích trung thực:** đây là phần "phòng thí nghiệm văn bản"; không có script — quan trọng là xây thói quen câu hỏi khi đọc.

---

## 12. Đánh giá

**Chỉ số:** tóm đúng câu hỏi + giả định; phân biệt baseline/ablation/main; kiểm cách chia client/task (phát hiện rò rỉ/trùng); báo cáo limitations. 

**Vì sao chọn:** là khả năng "đánh giá nghiên cứu" — mục tiêu số 7/8 của lộ trình (đọc paper, nhận diện giả định/baseline/giới hạn).

**Chỉ số không thể hiện:** không phủ đọc chi tiết proof/phương pháp (tùy sâu); là "khung đọc" cấp tổng.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Cột 'ours' cao = paper tốt." — Phải xem baseline (có yếu hay không có chủ đích) + ablation (đóng góp từ đâu). Bài toán paper này dễ thắng baseline yếu.
- **Hiểu lầm 2:** "Mọi paper đều ablation chứa rõ." — Không; nhiều paper thiếu. Khi thiếu, đừng tin "method quan trọng" — chỉ biết "backbone/data kết quả".
- **Hiểu lầm 3:** "Họ chia client thế nào thì được." — Không; chia non-IID / tách client test quyết định độ khó & tính hợp lệ. Chia sai → số ảo (G6.5/G2.8). Phải kiểm.
- **Giới hạn:** 3 lăng kính là "smart reading" nhưng với paper chuyên sâu (sâu về method) vẫn cần đi sâu tables/derivation. Đây là điểm khởi đầu đủ để đánh giá nhanh.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. 3 lăng kính đọc paper là gì.
2. Baseline vs ablation khác nhau; vì sao cần cả hai.
3. Vì sao "chia client/task" phải kiểm (rò rỉ ở đâu).

### Luyện tập (sửa đổi / mở rộng)
4. Từ bảng mục 8: kết luận đóng góp chính & baseline có yếu không; cách kiểm.
5. Tìm "giả định" trong 2-3 abstract giả (viết câu giả định) và điều kiện chúng cần.

### Thử thách (thiết kế / liên hệ)
6. Viết một "checklist chia dữ liệu" cho paper FL+CL (5 mục) — và áp cho 1 abstract/proposed.
7. Nối dự án cuối: dùng khung đọc để viết phần "so sánh với baseline & ablation" trong báo cáo dự án (G9.7/9.8).

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. (a) Câu hỏi + giả định + đóng góp; (b) baseline/ablation/main; (c) cách chia data/client/task.
2. Baseline = chuẩn so; ablation = tắt từng thành phần để biết đóng góp. Cả hai tránh "khoe số ảo".
3. Nếu client test trùng train / task mới không tách, model "nhìn bài" → số cao ảo (leakage, non-IID bỏ). Kiểm để tin kết quả.
4. Basline FedAvg (from-scratch + naive) "khá yếu" → phương pháp dễ thắng nhẹ. Ablation cho thấy pretrained đóng góp lớn; reg_CL quan trọng (forgetting), reg_FL nhỏ. Kết luận trung thực phần nào thật.
5. VD: "when data is i.i.d.-light"... "assuming clients online"... — viết câu giả định + điều kiện cần (đủ data, miền gần pretrained, client khả dụng...).
6. Checklist: (a) client test tách riêng khỏi client train? (b) mức non-IID rõ/seed? (c) task mới tách khỏi train? (TIL/CIL đúng?) (d) train/val/test không trùng mẫu (G2.8)? (e) baseline đúng (fedavg/naive) + ablation? Đó là kiểm "kết quả có nghĩa".
7. Trong báo cáo, dùng khung: nêu question, baseline (centralized/FedAvg/naive), ablation (backbone/FL/CL), chia client/task rõ — để người đọc tin kết quả (đúng yêu cầu tái lập G9.7).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Đọc paper qua **3 lăng kính**: câu hỏi+giả định, baseline/ablation/main, cách chia data.
2. Không tin cột "ours" — kiểm **baseline** và **ablation** (đóng góp thật từ đâu).
3. Kiểm cách **chia client/task** tránh rò rỉ / trùng → kết quả hợp lệ.
4. Ghi **limitations** (giả định, điều kiện thất bại).
5. Đây là "bộ lọc nghiên cứu" cho dự án cuối (G9.7/9.8).

**Tự kiểm tra:**
- 3 lăng kính đọc paper.
- Baseline vs ablation.
- Cách kiểm chia data để tin kết quả.
- Cách dùng khung này trong báo cáo dự án.

---

## 16. Đọc sâu bằng trực giác — so hai chiếc xe trên cùng đường

Hai đội báo thời gian hoàn thành khác nhau, nhưng một đội dùng đường bằng còn đội kia đi đèo. Bảng leaderboard không cho biết ưu thế đến từ xe hay đường. Đọc nghiên cứu cũng cần xác định “đường đua” trước khi xem cột cao nhất.

| Thành phần bài báo | Câu hỏi đời thực | Bằng chứng cần tìm |
|---|---|---|
| Baseline | So với cách làm nào? | Backbone, tuning và budget có tương đương? |
| Split client/task | Hai đội chạy trên cùng đường? | Danh sách mẫu, lớp, thời gian và client |
| Ablation | Bộ phận mới giúp bao nhiêu? | Chỉ đổi thành phần cần kiểm |

**Đọc phép so:** `Δmethod=Anew−Amatched`: “hiệu phương pháp mới so với baseline được ghép tương xứng”. Matched không chỉ cùng seed: còn cùng dữ liệu được phép thấy, pretrained, thông tin task id và ngân sách. Nếu thay nhiều thứ cùng lúc, hiệu chỉ mô tả **cả gói thay đổi**.

**Tính tay giả lập:** baseline from-scratch đạt 0.60, baseline cùng pretrained đạt 0.70, phương pháp mới cùng pretrained đạt 0.72. Hiệu so mốc đầu là 12 điểm phần trăm; hiệu so baseline pretrained là 2 điểm. Không được gán cả 12 điểm cho regularizer mới. Mốc from-scratch vẫn có ích để đo lợi ích của cả hệ thống, nếu gọi đúng tên.

**Phản ví dụ:** test trên cùng client đã train không mặc nhiên rò rỉ, nếu **mẫu** test được giữ riêng. Nó đánh giá client đã biết. Test trên client chưa tham gia kiểm khả năng chuyển sang client mới; hai giao thức khác nhau. Ngược lại, chia ngẫu nhiên từng ảnh nhưng để ảnh cùng đối tượng/chuỗi chụp rơi vào cả train và test có thể rò thông tin dù tên file khác.

:::interactive baseline
:::

:::quiz
Ours pretrained đạt 72%, baseline pretrained đạt 70%, baseline từ đầu đạt 60%. Hiệu được hỗ trợ trực tiếp cho thay đổi ngoài pretrained là bao nhiêu, nếu mọi yếu tố khác được giữ đúng?
A. 12 điểm phần trăm
B. 2 điểm phần trăm
C. 70 điểm phần trăm
Đáp án: B
Giải thích: So hai cấu hình có cùng pretrained mới cô lập được thay đổi đang hỏi; 72−70=2 điểm. So với 60% là hiệu của cả gói.
:::

:::goi-y
Khoanh hai hàng chỉ khác phương pháp cần kiểm, không chọn hàng thấp nhất chỉ vì tạo khoảng cách đẹp hơn.
:::

:::loi-giai
Ghi “tăng 2 điểm so với baseline có cùng backbone pretrained trong thiết lập này”. Muốn kết luận ổn định cần thêm lần chạy và xem các điều kiện ghép có thật sự tương đương.
:::
