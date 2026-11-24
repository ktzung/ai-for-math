# Chương 9.4–9.6 — Đánh giá chỉ số / chi phí / giao tiếp, phát hiện kết luận vượt bằng chứng, và tái hiện một thí nghiệm nhỏ (Giai đoạn 9)

> **Câu hỏi trọng tâm:** *Làm sao đánh giá "con số" của một thí nghiệm/papers (chỉ số có ý nghĩa không, cost ra sao, giao tiếp tốn thế nào), phát hiện khi kết luận vượt quá bằng chứng, và tái hiện lại một thí nghiệm nhỏ để tin cậy?*

---

## 1. Vị trí trong lộ trình

Đã có khung đọc paper (9.1–3). Ba chương này bổ sung các kỹ năng "đánh giá kỹ thuật": đọc **chỉ số** (có phù hợp không), **cost/giao tiếp** (FL đắt ra sao), **phát hiện phóng đại** (kết luận vượt bằng chứng), và **tái hiện thí nghiệm** (reproducibility) — xuyên suốt dự án (G9.8).

---

## 2. Kiến thức cần dùng

- Chỉ số (G2.7, G7.6), cost FL (G6.7), đánh giá (G2.3), rò rỉ (G2.8), seed/reproducibility (G1.5).

**Ôn nhanh:** chỉ số phải khớp bài toán (accuracy lừa khi non-IID/mất cân bằng); cost FL = bytes/time/resource; "kết luận vượt bằng chứng" = khẳng định ngoài range/điều kiện đo được.

---

## 3. Câu chuyện mở đầu

Lan đọc một số paper và bảng thí nghiệm của mình, nhận ra kỹ năng "đọc con số" quan trọng hơn tưởng: 
- Có paper báo "chỉ accuracy, không cost" — nhưng FL chính là bài toán cost (G6.7). 
- Có paper báo "accuracy 95% trên client A" nhưng không nói accuracy client B (non-IID, G6.5) — báo có lựa chọn. 
- Có paper khẳng định "phương pháp vượt mọi state-of-the-art" nhưng chỉ test trên 1 dataset, 1 seed — kết luận vượt bằng chứng.

Cô học các kỹ năng: đánh giá **chỉ số/cost/giao tiếp** đúng, **phát hiện phóng đại**, và **tự tái hiện** một thí nghiệm nhỏ (run đúng baseline, cùng seed) để kiểm chứng — thay vì tin số người khác.

---

## 4. Câu hỏi trọng tâm

**Đọc/đánh giá chỉ số, cost, giao tiếp thế nào cho đúng; dấu hiệu "kết luận vượt bằng chứng" là gì; và quy trình tái hiện một thí nghiệm nhỏ để tin cậy?**

---

## 5. Trực giác

**1. Chỉ số phải khớp bài toán:** đã học accuracy lừa khi mất cân bằng/non-IID (G2.7, G4.6); CL phải A+forgetting (G7.6); FL phải per-client + cost (G6.5, G6.7). Khi đọc bảng, hỏi "chỉ số này có trả lời câu hỏi không, hay chỉ là con số dễ đẹp".

**2. Cost & giao tiếp:** FL có chi phí **truyền thông** (bytes/round), **thời gian** (straggler), **tài nguyên** client. Bảng "accuracy cao" không nói cost → thiếu bức tranh; và "giao tiếp ít vòng" chỉ tốt nếu bytes mỗi vòng nhỏ. Đọc phải ghi cả cost.

**3. Phát hiện kết luận vượt bằng chứng (over-claiming):** dấu hiệu điển hình:
- Khẳng định "tốt nhất mọi nơi" nhưng chỉ 1 dataset/seed.
- Chỉ báo metric có lựa chọn (chọn accuracy không chọn per-class/cost).
- Không ablation → không biết đóng góp (G8.8, G9.1).
- Nói "bảo mật tuyệt đối" khi chỉ "không gom data" (G6.9).
- Khái quát ngoài miền đo (OOD/giả định) — G5.9/G8.9.
Nguyên tắc: *kết luận chỉ mạnh bằng bằng chứng* — nếu bằng chứng (dataset, seed, phạm vi giả định) hẹp, đừng kết luận rộng.

**Phép so sánh "một bài test giỏi khác 'người giỏi'":** cho thấy bằng chứng hẹp không nên kết luận rộng. **Giới hạn:** vocal "over-claiming" không phải lúc nào dễ nhận (subjectivity); nhưng các dấu hiệu kể trên (1 data, 1 seed, thiếu ablation/cost) là chỗ bắt đầu tin cậy.

---

## 6. Từ trực giác đến mô hình

- **Đánh giá chỉ số:** chọn metric khớp bài (accuracy-only không đủ; cần per-class/per-client/A+forgetting/cost).
- **Cost:** ghi bytes/time/resource (G6.7).
- **Over-claim detection:** scope của bằng chứng (dataset, seeds, miền) vs độ rộng kết luận.
- **Tái hiện (reproduction):** chạy lại baseline/seed nhất định để kiểm số.

**Thuật toán (đánh giá & tái hiện):**
```
1. Với số trong paper/thon: hỏi "chỉ số khớp bài?", "cost?", "phạm vi bằng chứng?".
2. Phát hiện over-claim: nếu case hẹp (1 dataset/seed/thiếu ablation) mà nói "tốt nhất" → thận trọng.
3. Tái hiện: chạy lại (cùng method/baseline/seed như tài liệu) trên subset → đối chiếu.
4. Nếu tái hiện lệch lớn → nghi vấn/quy trình tài liệu.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Đọc chỉ số đúng:** nhìn bảng hỏi: có accuracy-only không? có per-class/per-client không? CL có A+forgetting không? cost (FL) có không?

**Bước 2 — Đọc cost/giao tiếp:** tìm `#round`, `bytes/round`, `wall time`, `resource`. Nếu thiếu — ghi "thiếu cost; chưa đánh giá được trade-off".

**Bước 3 — Phát hiện over-claim:** ghi checkpoint câu kết luận vs bằng chứng: dataset count, seeds, miền, ablation. Nếu khoảng kết luận > bằng chứng → ghi "over-claiming có thể".

**Bước 4 — Tái hiện nhỏ:** lấy baseline (VD FedAvg) + 1 method, chạy trên dataset nhỏ (subset) với seed cố định; đối chiếu xu hướng accuracy/forgetting. Không cần tái hiện toàn paper — mục tiêu là *kiểm tính nhất quán cơ bản*.

**Lỗi thường gặp:** tin accuracy-only; bỏ cost; đọc kết luận mà không đối chiếu miền/phạm vi bằng chứng; tái hiện không seed → không so được.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** paper báo "FedCL đạt avg acc 0.80, tốt nhất." Bạn kiểm:

**Bước 1 — Chỉ số:** paper chỉ báo avg acc (không per-client, không forgetting riêng). Với non-IID thì "avg acc" che giấu client yếu (G6.5) — metric chưa đủ.

**Bước 2 — Cost:** không báo bytes/round. Đánh giá FL thiếu cost (G6.7) → "tốt nhất" chưa chắc đáng dùng.

**Bước 3 — Phạm vi bằng chứng:** chỉ 1 dataset, 1 seed, không ablation. → Nói "tốt nhất mọi nơi" là **over-claim** (bằng chứng hẹp).

**Bước 4 — Tái hiện:** bạn chạy lại FedAvg baseline + FedCL (cùng seed) trên subset: thấy xu hướng giống (FedCL > FedAvg chút) — tái hiện nhất quán cơ bản. Nhưng để kết luận mạnh cần thêm dataset/seed (tài nguyên). → Kết luận thận trọng: "đóng góp có, nhưng bằng chứng hiện hẹp".

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ so accuracy, tin kết luận paper; không tái hiện.

| Phương diện | Tin số | Đánh giá đầy đủ + tái hiện |
|---|---|---|
| Chỉ số/cost | bỏ sót | khớp bài + cost |
| Over-claim | thường tin | phát hiện |
| Tin cậy | thấp | tái hiện kiểm chứng |
| Đánh đổi | nhanh | mất công tái hiện |

**Cải thiện:** đánh giá đúng, không bị "số đẹp" lừa. **Đánh đổi:** cần thời gian tái hiện nhỏ — đáng cho độ tin cậy.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** tái hiện một kết quả nhỏ + phát hiện over-claim.

1. Chọn 1 bài/abstract giả có cột "ours 0.80, tốt nhất".
2. Dùng khung: ghi thiếu metric/cost/phạm vi; xác định over-claim.
3. Tái hiện: chạy lại baseline+method trên subset (seed cố định, 2–3 lần) — so xu hướng.
4. Viết 1 quan sát "tôi tin ở mức nào" kèm lý do (bằng chứng đủ/chưa đủ).

---

## 11. Thực hành (không yêu cầu code)

Chương này dùng kỹ năng đã có (G6/G7) để tái hiện; phần chính là đọc + viết (mục Thí nghiệm & Bài tập). Nếu muốn code tái hiện, dùng lại `fedavg` (G6.4) / `cl_eval` (G7.6) chạy nhiều seed, tính mean±std.

**Chú thích trung thật:** tái hiện toàn paper về tài nguyên hạn chế không khả thi — việc nhỏ (baseline + 1 method, subset, 3 seed) đủ để kiểm "xu hướng" và phát hiện vấn đề giấy tờ (seed thiếu, số không ổn định).

---

## 12. Đánh giá

**Chỉ số:** đọc metric đúng (per-class/per-client/A+forgetting/cost); phát hiện over-claim (bằng chứng hẹp vs kết luận rộng); chạy tái hiện nhỏ (baseline + method, seed, so xu hướng).

**Vì sao chọn:** mục tiêu lộ trình — "đọc paper, nhận diện baseline/giới hạn/cost + tái hiện việc nhỏ". Là kỹ năng nghiên cứu cuối cùng.

**Chỉ số không thể hiện:** không phủ thống kê (CI/p-value — nên dùng khi có); không tái hiện toàn paper. Đây là "đánh giá số + tái hiện cơ bản".

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Accuracy cao là đủ để đánh giá." — Với non-IID/CL/cost thì chưa; cần per-class/per-client/A+forgetting/cost. Chọn metric theo bài.
- **Hiểu lầm 2:** "Nếu tôi tái hiện lệch một chút = paper sai." — Có thể do phiên bản lib/seed/hệ thống (G1.5); lệch nhỏ bình thường. Lệch lớn/không lặp lại hay sẽ là vấn đề. Tái hiện là kiểm *xu hướng*, không yêu cầu số khớp tuyệt đối.
- **Hiểu lầm 3:** "Kết luận rộng từ 1 thí nghiệm là ok." — Sai; bằng chứng hẹp → kết luận nên hẹp. Nếu ai nói "tốt nhất mọi nơi" với 1 dataset/seed — đó là over-claim.
- **Giới hạn:** "over-claiming" có tính chủ quan (vùng xám); nhưng kiểm dataset-count, seeds, ablation, miền là cách chủ động đủ tốt. Và cost đo tuỳ bài — không có chuẩn chung.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Vì sao "chỉ báo accuracy" chưa đủ khi non-IID/CL/cost (3 lý do).
2. Dấu hiệu "over-claim" (kể 3).
3. Tái hiện để làm gì; có phải khớp tuyệt đối không.

### Luyện tập (sửa đổi / mở rộng)
4. Từ một bảng giả "ours 0.82 best (1 dataset, 1 seed, no cost)": xác định & viết nhận xét over-claim + thiếu gì.
5. Chạy lại 1 baseline + method với 3 seed, tính mean±std — phát hiện seed có làm số không ổn định (nên báo trung bình nhiều seed).

### Thử thách (thiết kế / liên hệ)
6. Viết phần "đánh giá & giới hạn" của báo cáo dự án (G9.7): chỉ metric, cost, seed, giả định — theo khung.
7. Thiết kế "kế hoạch tái hiện" cho dự án (G9.8): chạy baseline, chạy method, chạy lại 3 seed, đối chiếu.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. (a) accuracy lừa khi non-IID/mất cân bằng (G2.7/G6.5); (b) CL cần A+forgetting (G7.6); (c) FL thiếu cost (G6.7). Một con số không đủ.
2. (a) "best mọi nơi" nhưng 1 dataset/seed; (b) chọn metric có lựa chọn, thiếu per-class/cost; (c) không ablation / nói "bảo mật tuyệt đối" khi chỉ không gom data.
3. Tái hiện kiểm "xu hướng nhất quán" (baseline+method) để tin/try; không cần khớp tuyệt đối (lib/seed/hệ thống).
4. Nhận xét: (a) thiếu đa dataset/seed; (b) thiếu cost; (c) thiếu ablation → "best" chưa đủ bằng chứng; cần thận trọng khi trích dẫn.
5. Nếu std lớn → vấn đề "số không ổn định"; báo mean±std; paper thiếu multi-seed là rủi ro.
6. Báo cáo ghi: metric khớp bài (per-client/A+forgetting), cost (bytes/time), seed §, giả định (client online, non-IID mức...), limitations — theo khung 9.1.
7. Kế hoạch: (a) baseline centralized/FedAvg/naive-CL; (b) method FL+CL chọn; (c) chia dataset/task/client rõ (seed); (d) chạy lại ≥3 seed, tính mean±std; (e) đối chiếu bảng A/forgetting + cost. — Đúng yêu cầu tái lập (G9.7).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Chọn **chỉ số khớp bài**: per-class/per-client/A+forgetting/cost — không chỉ accuracy.
2. Đọc **cost/giao tiếp** (FL) — không có cost, không đánh giá được.
3. Phát hiện **over-claim**: bằng chứng hẹp (1 data/seed/thiếu ablation) với kết luận rộng.
4. **Tái hiện nhỏ** (baseline + method, ≥3 seed, mean±std) để kiểm xu hướng.
5. Nền cho viết **báo cáo dự án** (G9.7) & **dự án cuối** (G9.8).

**Tự kiểm tra:**
- Vì sao accuracy-only chưa đủ.
- Dấu hiệu over-claim.
- Quy trình tái hiện nhỏ.
- Cách ghi cost/metric trong báo cáo.

---

## 16. Đọc sâu bằng trực giác — một con số đẹp phải chịu được tính lại

Một phương pháp có thể thắng ở lần chạy may mắn nhưng thua khi đổi seed. Người đọc cần biết phân bố kết quả và cái giá để đạt nó, thay vì chỉ gặp con số lớn nhất được chọn sau nhiều lần thử.

| Cách nhìn kết quả | Đại lượng | Câu hỏi cần thêm |
|---|---|---|
| Mức trung tâm | Mean qua các lần chạy | Chạy bao nhiêu lần? |
| Mức dao động | Standard deviation | Seed nào, cùng giao thức không? |
| Cái giá của cải thiện | Byte, thời gian, RAM | Cùng mốc accuracy hay cùng ngân sách? |

**Đọc công thức:** `x̄=Σs xs/S`, `s=√(Σs(xs−x̄)²/(S−1))`: “lấy trung bình S lần chạy; độ lệch chuẩn mẫu dùng mẫu số S−1”. SD qua seed mô tả biến thiên những lần chạy đã làm, không tự là khoảng tin cậy của hiệu phương pháp; S=1 không tính được SD mẫu.

**Tính tay giả lập:** ba seed đạt 0.70, 0.72, 0.74. Mean=0.72; tổng bình phương lệch là 0.0008; chia 2 rồi lấy căn cho SD=0.02. Viết `0.72±0.02 (SD, 3 seed)` minh bạch hơn chỉ báo 0.74. Nếu baseline đạt 0.71, 0.71, 0.73 trên cùng ba seed thì hiệu ghép là −0.01, 0.01, 0.01, mean≈0.00333; ưu thế chưa mạnh chỉ từ ba lần chạy.

**Phản ví dụ:** thấy ba seed 0,70–0,74 rồi khẳng định lần chạy sau chắc chắn nằm trong khoảng đó. SD mô tả ba lần đã chạy, không phải bảo đảm cho lần mới; càng không chứng minh hiệu so baseline là chắc chắn nếu hiệu ghép chỉ khoảng 0,003.

**Giới hạn:** tái hiện không chỉ tìm cùng chiều thắng–thua. Cần kiểm kích thước hiệu, độ dao động, dữ liệu, phiên bản và ngân sách; sai khác lớn không nên bỏ qua vì vẫn “thắng”. Cũng đừng coi ba seed là con số bảo đảm thống kê. Kết luận phải theo mức bằng chứng và nêu cấu hình đã thử, kể cả kết quả không thuận lợi.

:::interactive audit
:::

:::quiz
Ba accuracy là 0.70, 0.72, 0.74. Mean và SD mẫu là gì?
A. 0.72 và 0.02
B. 0.74 và 0
C. 0.72 và 0.0008
Đáp án: A
Giải thích: Mean bằng 0.72; SD là căn của 0.0008/(3−1), tức 0.02. 0.0008 mới là tổng bình phương lệch.
:::

:::goi-y
Lấy lệch −0.02, 0, +0.02; bình phương, cộng, chia hai, rồi mới lấy căn.
:::

:::loi-giai
Kết quả là `0.72±0.02`, ghi rõ ± là SD và có 3 seed. Đây không phải khẳng định kết quả tương lai chắc chắn nằm trong đoạn 0.70–0.74.
:::
