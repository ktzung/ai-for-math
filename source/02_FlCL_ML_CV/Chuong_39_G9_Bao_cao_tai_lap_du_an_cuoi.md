# Chương 9.7–9.8 — Viết báo cáo tái lập được & dự án cuối lộ trình (Giai đoạn 9)

> **Câu hỏi trọng tâm:** *Làm sao viết một báo cáo mà người khác (và bạn, sau này) có thể chạy lại — và thiết kế & triển khai dự án FL+CL cuối lộ trình hoàn chỉnh?*

---

## 1. Vị trí trong lộ trình

Đây là **đỉnh cao** của toàn bộ: tổng hợp mọi kỹ năng (G1–G8) thành **dự án cuối** — một thí nghiệm FL+CL on CV hoàn chỉnh, tái lập được, trên tài nguyên hạn chế (CPU). G9.7 dạy *viết báo cáo tái lập*; G9.8 là *khuôn khổ dự án cuối* (designed theo mục lục Gentry).

---

## 2. Kiến thức cần dùng

Mọi thứ: nền (G1–G4), pretrained (G5), FL (G6), CL (G7), kết hợp (G8), đánh giá & báo cáo (G9.1–6).

**Ôn nhanh:** tái lập = mã + seed + config + môi trường + kết quả lưu đủ để "ai đó chạy lại" (G1.5, G5 reproducibility).

---

## 3. Câu chuyện mở đầu

Lan hoàn tất thí nghiệm FL+CL (phân loại ảnh, vài client, task mới theo thời gian). Cô muốn đối chiếu hai phương pháp. Trước khi viết báo cáo, cô nhớ lời nhắc: *"Một kết quả không thể tái lập gần như vô nghĩa."* Cô dành thời gian: tách train/val/test & client & task đúng seed, lưu config, ghi num mẫu, chạy nhiều seed, ghi cost. Bài viết cuối có: câu hỏi, thiết lập đầy đủ, baseline + ablation, bảng A/forgetting per-client, cost, limitations. Nhờ vậy một đồng nghiệp khác có thể **chạy lại y hệt** — và phát hiện đóng góp thật.

---

## 4. Câu hỏi trọng tâm

**Cấu trúc một báo cáo tái lập (method/config/metation/baseline/ablation/cost/limitations) là gì, và dự án cuối FL+CL cuối lộ trình thiết kế + triển khai thế nào?**

---

## 5. Trực giác

**Báo cáo tái lập = "công thức nấu ăn đầy đủ"** (đã từng ví ở G1.5): đọc kỹ là làm ra đúng món. Không phải "kết quả đẹp" mà là "kết quả tin được và lặp lại được". Người khác (hay bạn 3 tháng sau) phải tái hiện được bằng: **mã**, **command**, **config**, **seed**, **môi trường (requirements)**, **cách chia data**, **cách đo**.

**Cấu trúc báo cáo chuẩn (G9.7):**
1. **Câu hỏi & mục tiêu** (giải vấn đề gì).
2. **Thiết lập** (dataset, cách chia train/val/test, chia client, chia task, seed) — trả lời "đánh giá ở đâu" (G9.1).
3. **Phương pháp** (model, baseline, method FL+CL) + hyperparameter (đã ghi config).
4. **Kết quả:** bảng accuracy/forgetting per-client, cost (bytes/time), plus **baseline** và **ablation** (đóng góp từ đâu, G8.8).
5. **Tái lập:** mã/config/command/requirements (G1.5); chạy được lệnh `bash run.sh`.
6. **Limitations & giả định** (G8.9): điều kiện thất bại.

**Dự án cuối (G9.8)** — cốt lõi từ mục lục:
- **Câu hỏi:** phân loại ảnh theo FL nhieu client + CL task mới (thiết lập như sinh lý).
- **Baseline:** huấn luyện tập trung (centralized) + FedAvg (FL) + naive-CL. 
- **Mô phỏng client:** chia ảnh non-IID (mỗi client thiên vài lớp).
- **Method FL+CL:** chọn 1 hướng (G8.5–7: replay cục bộ / regularization kép) và so với baseline.
- **Chuỗi task:** task mới đến theo thời gian; đánh giá A + forgetting (G7.6).
- **Đánh giá cost:** bytes/time (G6.7).
- **Chạy trên CPU:** dataset nhỏ (CIFAR-10 subset, vài lớp), model nhỏ (CNN mini / pretrained nhẹ), batch nhỏ.

**Phép so sánh "công thức nấu ăn" / "hồ sơ kỹ thuật":** trực quan. **Giới hạn:** "tái lập tuyệt đối" khó (phụ thuộc hệ thống/lib) — yêu cầu là *tái lập được ở mức "same config + seed, lệch nhỏ"*, không phải "bit-identical everywhere". Và project cần cân scope để CPU chạy được.

---

## 6. Từ trực giác đến mô hình

- **Báo cáo tái lập:** gồm mã/config/seed/môi trường/chia data/baseline/ablation/metric/cost/limitations.
- **Dự án cuối:** một pipeline FL+CL có "điều khiển" (đối chiếu baseline + ablation) trên dataset CV nhỏ CPU.
- **Trao đổi:** mọi kết quả gắn seed/config → tái lập.

**Thuật toán (dự án cuối tối giản):**
```
1. Chọn dataset CV nhỏ (CIFAR-10 subset), tách 10 lớp theo client non-IID + task chuỗi.
2. Baseline centralized (gom hết) → ghi.
3. Baseline FL: FedAvg (3-5 client) → ghi.
4. Method FL+CL: chọn 1 hướng (replay cục bộ/reg kép) → ghi.
5. Đo: A + forgetting per-client, cost (bytes/time); ablation (backbone/FL/CL).
6. Viết báo cáo tái lập (config, seed, command, limitations).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Chuẩn thư mục & config (G1.5).** Ta dùng `my_experiment/` (scripts, config.py, results, requirements, README).

**Bước 2 — Chia dữ liệu (non-IID + task).** Chia 10 lớp thành: 4 client (mỗi client thiên 2-3 lớp non-IID); task 1 = lớp {0..4}, task 2 = {5..9} đến sau (CL). Seed rõ.

**Bước 3 — Baseline & method.** Centralized (gom) → FedAvg (FL) → method FL+CL (replay cục bộ hoặc reg kép). Cùng seed.

**Bước 4 — Config trong config.py + chạy nhiều seed.** Script output results/<run>/ with metrics.json (bảng A/forgetting per-client), cost (bytes/time), config copy.

**Bước 5 — Bảng kết quả + ablation.** Bảng: centralized, FedAvg, ours FL+CL; + ablation (− back, −reg_FL, −reg_CL). Ghi cost.

**Bước 6 — Viết báo cáo.** README/report.md: question, setup, method, results table, reproduction command, limitations.

**Lỗi thường gặp:** quên seed → không tái lập; quên per-client (chỉ avg giấu yếu); quên cost; quên ablation (không biết đóng góp); chia task trùng train/test (rò rỉ, G9.1).

---

## 8. Ví dụ nhỏ có số liệu (bảng dự án cuối)

| Setup (seed 42) | A (avg acc) | Forgetting | Comm (MB) | Ghi chú |
|---|---|---|---|---|
| Centralized (baseline) | 0.80 | — | — | gom hết, điểm chuẩn |
| FedAvg (FL, naive-CL) | 0.66 | 0.18 | 50 | client drift+forgetting |
| Ours (replay cục bộ + FedAvg) | 0.72 | 0.06 | 60 | giữ cũ tốt hơn |
| Ours −replay (ablation) | 0.67 | 0.15 | — | replay đóng góp (forgetting) |

**Bước 1 — Đọc:** replay cục bộ giữ forgetting thấp (0.06 vs 0.18) chấp nhận comm tăng nhẹ (60 vs 50). Centralized vẫn cao nhất (0.80) — kỳ vọng (FL đổi chút accuracy lấy privacy, G6.8).

**Bước 2 — Ablation:** bỏ replay → forgetting tăng rõ (0.15) → replay là đóng góp chính. Báo cáo trung thực: "cải thiện đến từ replay cục bộ chống forgetting; chi phí comm nhẹ."

**Bước 3 — Tái lập:** ghi seed 42, config, command `bash run.sh`, môi trường — để người khác chạy lại.

**Bước 4 — Limitations:** non-IID vừa, 4 client, task 2; nếu client offline/data ít hơn → method yếu (G8.9).

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ chạy 1 method, báo accuracy, không config/seed/ablation.

| Phương diện | Báo cáo đơn giản | Báo cáo tái lập |
|---|---|---|
| Tái lập | không | có (config, seed, command) |
| Biết đóng góp | không (no ablation) | có |
| Cost/per-client | không | có |
| Tin cậy | thấp | cao |
| Đánh đổi | nhanh | công sức, nhiều lần chạy |

**Cải thiện:** kết luận tin cậy, người khác lặp lại được. **Đánh đổi:** cần kỷ luật (config, seed, ghi cost) — đây là chuẩn nghề nghiệp mà lộ trình hướng tới.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** làm mini dự án có tái lập.

1. Chọn 4 lớp, 2 client non-IID, 2 task.
2. Chạy centralized, FedAvg(naive-CL), FedAvg+replay cục bộ. (Dùng G6.4 + G7.4.)
3. Ghi config, seed, bảng A/forgetting per-client, cost.
4. Viết README tái lập (command; requirements). Đây là "bản nháp" dự án cuối.

---

## 11. Thực hành triển khai

Bạn đã có mọi mảnh (qua G1–G8): gắn thành pipeline:
- `config.py` + thư mục (G1.5), DataLoader non-IID (G6.5), FedAvg (G6.4), replay cục bộ (G7.4), đánh giá A/forgetting (G7.6). 

**Ghi chú trung thật:** tài liệu này dạy *từng mảnh*. Dự án cuối là *ghép* chúng — đúng tinh thần "tự tay xây phòng thí nghiệm". Khung (config/dataset/baseline/method/eval/report) có ở các chapter; bạn ráp lại theo mục 7. Ưu tiên scope nhỏ (4 lớp, 2 client, 2 task) để CPU chạy được trong thời gian hợp lý.

---

## 12. Đánh giá dự án

**Chỉ số (đánh giá dự án cuối):** (1) baseline centralized + FedAvg + method rõ; (2) chia non-IID/task seed đúng; (3) bảng per-client A/forgetting + cost; (4) ablation (đóng góp từ đâu); (5) báo cáo tái lập (config, command, requirements). — đúng tiêu chí mục lục.

**Vì sao chọn:** những chỉ số này phản ánh "thí nghiệm nghiêm túc tái lập được" — mục tiêu cuối của lộ trình.

**Chỉ số không thể hiện:** không yêu cầu model to/tài nguyên GPU; không yêu cầu thắng SOTA — "đủ tốt + có tái lập + đóng góp rõ" là đạt.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Báo cáo = ghi kết quả số." — Phải gồm config, seed, chia data, method, baseline, ablation, cost, limitations — mới "tái lập được".
- **Hiểu lầm 2:** "Dự án 'thắng accuracy' là thành công." — Không; mục tiêu là *thí nghiệm nghiêm túc* (tái lập, đóng góp rõ, so baseline). Accuracy cao nhưng báo cáo ẩu = không phải thành công.
- **Hiểu lầm 3:** "Tái lập = bit-identical everywhere." — Không thực tế (lib/version/hệ thống, G1.5). Tái lập = "cùng config+seed → lệch nhỏ/ổn". Nêu version lib.
- **Giới hạn:** project đơn giản (4 lớp, 2 client) không đủ "chứng minh SOTA"; đúng — mục tiêu là học quy trình.Theo+ mở rộng scope cho nghiên cứu thật.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Một báo cáo tái lập gồm những mục gì (min 6).
2. Ablation trong dự án dùng để làm gì.
3. Vì sao "accuracy cao" chưa là "thành công dự án".

### Luyện tập (sửa đổi / mở rộng)
4. Tạo `config.py` cho dự án (seed, epochs, lr, batch, num_client, task_split) — rồi một `run_all.sh` để tái lập.
5. Chạy lại dự án mini với seed 42 và seed 123 (2 lần) → check kết quả ổn định (std nhỏ).

### Thử thách (thiết kế / liên hệ trọn lộ trình)
6. Viết phần "limitations" cho dự án (giả định client, non-IID mức, task numbers; điều kiện thất bại — G8.9).
7. Tổng kết 1 paragrap "hành trình lộ trình này dạy gì" — từ nền (G1) đến dự án cuối (G9): liệt kê 5 kỹ năng cốt lõi bạn sẽ dùng mãi.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Câu hỏi, thiết lập (data/chia/seed), method+config, kết quả (per-client/A/forgetting/cost), baseline+ablation, cách chạy (command), môi trường (requirements), limitations.
2. Xác định đóng góp thật (backbone/FL/CL) — không "khoe" toàn hệ thống.
3. Accuracy cao có thể do backbone/data/seed may; thiếu tái lập → không tin. Thành công = thí nghiệm nghiêm túc + báo cáo tái lập.
4. `config.py` đặt seed, siêu tham số, chia client/task; `run_all.sh` chạy baseline + method + ablation, lưu ra results/<run>/.
5. Chạy 2 seed → mean±std; std nhỏ → tái lập tốt; std lớn → vấn đề / cần thêm seed.
6. Limitations: giả định client online đủ, non-IID mức vừa (4 client), 2 task; thất bại khi client offline nhiều / data quá ít / task miền quá khác; replay cần bộ nhớ & được giữ mẫu (privacy) — nêu rõ.
7. 5 kỹ năng cốt lõi: (1) đánh giá nghiêm túc (chia train/val/test, metric khớp bài, chống rò rỉ); (2) hiểu cơ chế ML/DL (loss, gradient, optimizer, overfit); (3) FL (client-server, FedAvg, non-IID, cost, privacy); (4) CL (forgetting, TIL/CIL, rehearsal/reg/arch, đánh giá A+forgetting); (5) kết hợp FL+CL + nghiên cứu (ablation, đọc paper, tái lập). — Từng cái bạn đã học sâu qua 9 giai đoạn.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Báo cáo tái lập**: câu hỏi + setup + method/config + baseline/ablation + kết quả (per-client/A/forgetting/cost) + command/môi trường + limitations.
2. **Ablation** chỉ đóng góp thật; **cost** bức tranh đầy đủ.
3. **Dự án cuối**: FL+CL trên CV, chia non-IID/task seed rõ, baseline trung tâm + FedAvg + method, CPU-friendly.
4. Tái lập = "cùng config+seed → lệch nhỏ/ổn" (không bit-identical).
5. Đây là đỉnh của lộ trình — mọi kỹ năng G1–G9 hội tụ.

**Tự kiểm tra:**
- Mục của báo cáo tái lập.
- Vì sao cần baseline + ablation + cost.
- Cách chia client/task trong dự án.
- Làm sao để dự án "tái lập được".

---

## 16. Đọc sâu bằng trực giác — để người khác đi lại đúng đường

Báo cáo tái lập giống bản hướng dẫn đường đi có mốc và điều kiện, không chỉ một tấm ảnh đích đến. Người khác cần biết đã dùng dữ liệu nào, được thấy gì ở từng thời điểm và phải đo cùng đại lượng ra sao.

| Điều người chạy lại cần | Hiện vật nên lưu | Tác dụng |
|---|---|---|
| Biết chính xác đường chia dữ liệu | Split manifest và checksum dữ liệu | Giữ client/task/test nhất quán |
| Biết thao tác đã chạy | Config, command và phiên bản | Giảm các mặc định bị quên |
| Biết kết luận đến từ đâu | Log từng seed, metric và cost | Tính lại bảng mà không chọn số đẹp |

**Đọc phép tính kết luận:** `ΔA=Anew−Abase`; `ΔB=Bnew−Bbase`: “tách lợi ích accuracy khỏi phần byte tăng thêm”. Đừng gộp thành câu “hiệu quả hơn” nếu chưa nói hiệu quả theo mục tiêu nào. Mức giảm forgetting cũng phải dùng cùng định nghĩa và cùng tập task.

**Tính tay từ bảng minh họa:** replay đạt A=0.72 so FedAvg 0.66, tăng 6 điểm phần trăm. Forgetting giảm từ 0.18 xuống 0.06, giảm tuyệt đối 0.12 và tương đối khoảng 66.7%. Communication từ 50 lên 60 MB, tăng 10 MB, tức 20%. Đây là một đánh đổi ba đại lượng, chưa phải chiến thắng toàn diện. Replay cục bộ tự nó không bắt buộc tăng communication; số 60 MB chỉ hợp lý khi giao thức/lịch round thực sự phát sinh thêm byte và được ghi rõ.

**Phản ví dụ:** thấy accuracy tăng 6 điểm rồi viết “phương pháp tốt hơn” mà bỏ byte tăng 20% và forgetting. Một kết luận đúng phải nêu cả ba đại lượng và mục tiêu ưu tiên; nếu ứng dụng quan tâm chi phí truyền, 6 điểm có thể không đáng 10 MB mỗi vòng.

**Giới hạn:** một seed và hai task phù hợp bài học quy trình, chưa đủ kết luận tổng quát về phương pháp. Config giống nhau cũng chưa bảo đảm bit-identical trên phần cứng khác; phải báo môi trường và khoảng sai khác chấp nhận. Không lưu dữ liệu nhạy cảm vào repo chỉ để tái lập: dùng dữ liệu được phép, manifest và hướng dẫn truy cập phù hợp.

:::interactive checklist
:::

:::quiz
Phương pháp tăng accuracy 6 điểm phần trăm nhưng byte từ 50 lên 60 MB. Byte tăng tương đối bao nhiêu?
A. 10%
B. 20%
C. 60%
Đáp án: B
Giải thích: Mức tăng là 10 MB chia cho mốc 50 MB, bằng 0.20. Tăng tuyệt đối 10 MB không đồng nghĩa tăng 10%.
:::

:::goi-y
Chọn đúng mẫu số: mức cũ là 50 MB. Luôn ghi cả mức gốc và mức mới cạnh phần trăm.
:::

:::loi-giai
`(60−50)/50=20%`. Một câu kết luận phù hợp là “trong cấu hình giả lập này, A tăng 6 điểm, forgetting giảm 12 điểm, đổi lại byte tăng 20%”; kèm seed và giao thức để người khác kiểm.
:::
