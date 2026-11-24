# Chương 8.8–8.9 — Xác định đóng góp đến từ đâu (ablation), và giả định / điều kiện thất bại của mỗi phương pháp (Giai đoạn 8)

> **Câu hỏi trọng tâm:** *Khi một hệ thống FL+CL đạt kết quả tốt, làm sao biết "thành công đến từ backbone, hay phương pháp FL, hay chiến lược CL" — và phương pháp đó vỡ khi nào (giả định nào bị vi phạm)?*

---

## 1. Vị trí trong lộ trình

Đã hiểu các hướng FL+CL (8.5–7). Hai chương cuối của G8 dạy **tư duy khoa học**: (1) **ablation** — cô lập đóng góp của từng thành phần để biết cái gì thực sự "tạo khác biệt"; (2) **giả định & điều kiện thất bại** — mỗi method đúng trong những giả định nào, và vỡ khi nào. Đây là yêu cầu rõ trong prompt ("xác định đóng góp đến từ mô hình nền tảng, phương pháp liên kết hay chiến lược học liên tục"; "giả định và điều kiện thất bại").

Kết thúc G8, chuẩn bị G9 (đọc nghiên cứu & dự án).

---

## 2. Kiến thức cần dùng

- Các hướng FL+CL (8.5–7), đánh giá (G6.8/G7.6), baseline (G2), non-IID/privacy (G6.5/G6.9).

**Ôn nhanh:** "ablation" = thí nghiệm loại bỏ từng thành phần để đo đóng góp. Phân biệt baseline (chuẩn so sánh) và ablation (cô lập thành phần) — prompt nêu rõ.

---

## 3. Câu chuyện mở đầu

Paper báo cáo hệ FL+CL đạt accuracy ấn tượng. Câu hỏi của Lan: *"Cải thiện này đến từ đâu? Vì họ dùng pretrained backbone mạnh? Vì FedProx chống drift? Vì EWC chống forgetting? Hay chỉ vì tuning siêu tham số?"* Nếu không hỏi, bạn có thể "khen" sai bộ phận và lặp lại sai ở bài toán khác.

Lan học:
- **Ablation:** lần lượt tắt từng thành phần (bỏ pretrained / dùng FedAvg thay vì reg / bỏ CL-regularizer) và giữ mọi thứ khác — đọc "thay đổi đó có lợi bao nhiêu" → xác định đâu là "nguồn" cải thiện.
- **Giả định / điều kiện thất bại:** mỗi method chỉ đúng trong giả định (client online, task đến đều, đủ dữ liệu, khởi tạo gần tối ưu...). Xác định "khi nào nó vỡ" (client offline, non-IID cực, data ít, task ít chồng lấp) → không đọc "method thắng mọi case".

---

## 4. Câu hỏi trọng tâm

**Ablation giúp xác định đóng góp thật như thế nào? Và mỗi phương pháp FL+CL có những giả định / điều kiện thất bại nào (cần nêu khi báo cáo)?**

---

## 5. Trực giác

**Ablation = "kiểm soát biến" để biết cái nào thực sự quan trọng.**

Giống thử thuốc: bạn uống viên kết hợp (backbone tốt + method FL + strategy CL). Muốn biết thành phần nào lành thật, bạn thử bỏ từng thành phần và so. Chỉ thay đổi **một thứ tại một thời điểm**, giữ mọi thứ khác (data, seed, setup — G1.5) → cô lập đóng góp:

- **Baseline:** toàn bộ component (kết quả tốt).
- **Ablation từng phần:** tắt component X → nếu accuracy/forgetting xuống nhiều, X đóng góp; nếu không đổi, X ít quan trọng.
- **Nhận diện "cao thủ giấu tay":** có khi "thành công" chỉ do backbone pretrained (không phải method của họ); có khi do một CL-regularizer nhỏ. Ablation lộ điều đó.

**Giả định & điều kiện thất bại — mỗi method đúng trong "phạm vi" nào:**
- Phương pháp dùng **replay** → giả định (i) có bộ nhớ lưu buffer, (ii) được phép giữ mẫu (không vi phạm privacy/quy định). Vỡ khi: hết bộ nhớ hoặc cấm lưu dữ liệu.
- **Regularization** → giả định (i) trọng số/biểu diễn cũ "gần" được (task không quá khác), (ii) có thể lưu importance/θ. Vỡ khi: task mới quá khác / non-IID cực → khó phạt.
- **Tách task (TIL)** → giả định biết task khi test. Vỡ khi không biết task (CIL).
- **FedAvg-chống-drift (như FedProx)** → giả định client gần global (μ vừa). Vỡ khi μ quá lớn (không học task mới) / client quá non-IID.
- **Dùng pretrained** → giả định miền client gần miền pretrained. Vỡ khi miền quá khác → hỏi đột.

**Phép so sánh "thử thuốc / rà vùng an toàn":** trực quan cho ablation + tìm "điểm vỡ". **Giới hạn:** ablation chi phí (nhiều lần chạy — phải cân); và "điểm vỡ" là *vùng liên tục* (không phải "đúng/sai") — phải khảo sát nhiều ngưỡng, không chỉ 1 điểm. Đừng "check 1 cái rồi kết luận".

---

## 6. Từ trực giác đến mô hình

- **Ablation matrix:** các config = baseline; baseline−X1; baseline−X2; ...
- **Chỉ số so:** A (G7.6) + forgetting + cost — đo trên cùng setup, chỉ đổi 1 thành phần.
- **Giả định:** mỗi method có list "giả định" (thường ghi trong paper "limitations"); điều kiện thất bại = khi giả định bị vi phạm.

**Thuật toán (ablation):**
```
1. Định nghĩa component: A=pretrained backbone, B=FL method (drift-reg), C=CL strategy (forget-reg).
2. Chạy baseline (A+B+C), đo A/F/cost.
3. Chạy baseline−A (B+C), baseline−B (A+C), baseline−C (A+B).
4. (tùy) thay từng component bằng lựa chọn khác (thay reg→FedAvg).
5. Đọc: thành phần nào thay đổi làm metric tụt nhiều nhất → quan trọng.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Định nghĩa các thành phần rõ ràng.** VD: Backbone (pretrained vs from-scratch); FL (FedAvg vs FedProx-like reg); CL (naive vs EWC-like forget-reg).

**Bước 2 — Chạy baseline và các ablation, giữ seed/data/setup cố định (G1.5, G2.3).** Ghi bảng metric.

**Bước 3 — Đọc kết quả.** Config nào tụt nhiều → đóng góp lớn. Có khi "backbone pretrained" chiếm hết — method không phải nguồn khác biệt (đừng phóng đại method).

**Bước 4 — Khảo sát giả định.** Khảo sát các trục: `non-IID_level`, `data per client`, `task overlap`, `client online ratio`... Vẽ accuracy theo từng trục → tìm "vùng" method hoạt động và "vùng vỡ".

**Bước 5 — Báo cáo trung thực.** Nêu "method cải thiện vì X (ablation cho thấy), nhưng giả định Y cần thỏa và vỡ khi Z".

**Lỗi thường gặp:** đổi nhiều thứ một lúc trong ablation (không cô lập); không cố định seed → nhiễu; kết luận "method thắng" khi chỉ có backbone đóng góp; không nêu giả định/điều kiện thất bại.

---

## 8. Ví dụ nhỏ có số liệu (ablation + điều kiện thất bại)

**Tình huống:** system FL+CL; metric A (avg acc) trên cùng setup.

**Ablation bảng:**
| Config | A | Forgetting | Ghi chú |
|---|---|---|---|
| Baseline (pretrained + reg_FL + reg_CL) | 0.74 | 0.06 | full |
| − pretrained (from scratch) | 0.55 | 0.12 | **pretrained quan trọng** (tụt 0.19) |
| − reg_FL (FedAvg thường) | 0.70 | 0.08 | reg_FL đóng góp nhỏ hơn |
| − reg_CL (naive-CL) | 0.66 | 0.15 | reg_CL quan trọng cho forgetting |

**Bước 1 — Đọc:** pretrained là nguồn lớn (A tụt mạnh); reg_CL chống forgetting; reg_FL tác động nhỏ hơn. Nếu chỉ khoe "baseline 0.74" mà không ablation, ta tưởng cả hệ thống quan trọng — thật ra pretrained làm phần lớn. → **ablation chống phóng đại.**

**Bước 2 — Điều kiện thất bại:** khảo sát `non-IID_level` (0 → nặng): accuracy FedProx/reg_CL tụt khi non-IID cực; `data per client` giảm; client offline ratio tăng → method không còn ổn. Ghi "vùng hoạt động" vs "vùng vỡ".

**Bước 3 — Kết luận báo cáo:** "đóng góp chủ yếu từ pretrained backbone; method FL/CL cải thiện forgetting nhưng chỉ trong vùng non-IID vừa; vỡ khi client offline nhiều/data quá ít."

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ báo "baseline accuracy, method thắng" không ablation, không giả định.

| Phương diện | Chỉ baseline | Có ablation + giả định |
|---|---|---|
| Hiểu nguồn cải thiện | không | rõ (component nào) |
| Tránh phóng đại | có thể | tránh |
| Biết điều kiện thất bại | không | vùng hoạt động rõ |
| Đánh đổi | nhanh | nhiều lần chạy, phải khảo sát |

**Cải thiện:** trung thực, tái lập được, không 'ảo tưởng method'. **Đánh đổi:** chi phí thí nghiệm (ablation nhiều config) — đáng để kết luận đúng (G9).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** làm ablation đơn giản + tìm điểm vỡ.

1. Baseline FL+CL (chọn 1 hướng G8.5–7).
2. Ablation: từng bước tắt pretrained / reg_FL / reg_CL → bảng metric.
3. Khảo sát non-IID level (2–3 mức): vẽ accuracy theo mức → tìm "mức vỡ".
4. Ghi nhận: đóng góp từ đâu + điều kiện thất bại.

---

## 11. Thực hành lập trình (tiếp tục `family_compare.py`)

**Môi trường:** venv + torch.

**Cấu trúc:** mở rộng `family_compare.py`: chạy các config (baseline, −backbone, −reg_FL, −reg_CL) với seed cố định; khảo sát non-IID 2 mức; đo A/forgetting per-client. 

**Lưu ý:** với dữ liệu nhỏ, "tụt metric" có thể do nhiễu — chạy nhiều seed (3–5) và báo mean±std (G9 reproducibility). Đây là bước "kỹ sư phòng thí nghiệm" — tự nối từ G6/G7.

**Chú thích trung thật:** ablation cần đủ lần chạy/seed để không kết luận nhầm; với tài nguyên hạn chế, giảm scope (2 component thay vì 3) hợp lý. Hướng dẫn, không phải script chạy ngay.

---

## 12. Đánh giá

**Chỉ số:** xác định đóng góp thật qua ablation (component nào tụt mạnh); chỉnh đúng "backbone vs FL vs CL" khi báo; khảo sát giả định/điều kiện thất bại (vùng non-IID, data, offline); báo cáo trung thực không phóng đại.

**Vì sao chọn:** đúng yêu cầu prompt — xác định đóng góp đến từ đâu; nêu giả định & điều kiện thất bại. Là "bộ lọc khoa học" khi đọc/viết research (G9).

**Chỉ số không thể hiện:** không bao gồm phân tích thống kê sâu (ANOVA...); không phủ mọi trục khảo sát — nền tư duy + khung thí nghiệm.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Baseline cao nghĩa là method tôi tốt." — Chưa; phải ablation xem nguồn. Có khi backbone pretrained làm hết (bạn "khen" sai method). Prompt không cho phóng đại.
- **Hiểu lầm 2:** "Một lần ablation (1 seed, 1 config) đủ." — Không; nhiễu/seed thay đổi; cần chạy lại + nhiều promoter. Và ablation phải đổi DUY NHẤT 1 thành phần.
- **Hiểu lầm 3:** "Method 'thắng' trong thí nghiệm tôi = thắng mọi nơi." — Sai; chạy chỉ trong vùng giả định; vỡ khi giả định (online, non-IID vừa, data đủ...) bị vi phạm. Phải nêu điều kiện thất bại.
- **Giới hạn:** "vùng hoạt động" là khái niệm liên tục, cần khảo sát chứ không '1 điểm'; và ablation chi phí nhiều lần chạy — cân scope với tài nguyên.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Ablation là gì và vì sao "đổi 1 thứ một lúc".
2. Vì sao baseline cao chưa chứng minh "method tôi tốt"?
3. "Giả định" và "điều kiện thất bại" khác gì, cho ví dụ.

### Luyện tập (sửa đổi / mở rộng)
4. Từ bảng mục 8: kết luận đóng góp từ component nào, và nói chính xác vì sao.
5. Thiết kế khảo sát non-IID 2–3 mức để tìm "mức vỡ" của 1 method.

### Thử thách (thiết kế / liên hệ)
6. Viết đoạn "limitations" trung thực cho 1 method FL+CL (nêu 2 giả định + 2 điều kiện thất bại + cách kiểm).
7. Nối G9: dùng ablation để đọc 1 paper — nêu cách kiểm "paper đó có ablation để bạn biết 'thành công từ đâu' không, và giả định họ nói gì".

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Ablation = tắt từng component, giữ mọi thứ khác, đo metric; đổi 1 thứ/lúc để cô lập đóng góp (không đổi nhiều → không biết cái nào).
2. Baseline có thể nhờ backbone pretrained/data dễ; không ablation → không biết method đóng góp thật. Khoe "baseline cao" = ảo.
3. Giả định = điều kiện method cần đúng (VD client online, miền gần pretrained, đủ bộ nhớ replay). Điều kiện thất bại = khi giả định bị vi phạm → method vỡ. (VD: replay vỡ khi cấm lưu mẫu; TIL vỡ khi không biết task.)
4. Pretrained đóng góp lớn (A tụt 0.19 khi bỏ); reg_CL quan trọng cho forgetting; reg_FL ảnh hưởng nhỏ. Cáohiệt: bỏ backtrack → A giảm mạnh nhất → nguồn chính.
5. Chạy method ở non-IID_level ∈ {nhẹ, vừa, cực}, đo A/forgetting; tìm level mà metric tụt ngưỡng → "mức vỡ". Khảo sát thay vì 1 điểm.
6. Limitations: method đúng khi "client đủ online & task đến như scoped; nếu non-IID cực hoặc client offline nhiều, A/forgetting kém hơn; replay cần bộ nhớ/phép lưu mẫu — không phù hợp cấm giữ dữ liệu". Kèm "có thể kiểm bằng khảo sát non-IID/offline".
7. Khi đọc paper: (a) hỏi "có ablation bảng không — component nào thay đổi/giảm"; (b) "phần limitations/giả định nói gì"; nếu không có → nghi ngờ nguồn đóng góp; nếu có → đọc xem thành công từ backbone hay method thật.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Ablation** cô lập đóng góp từng component (1 đổi/lúc, cùng setup/seed).
2. Biết **đóng góp từ backbone vs FL method vs CL strategy** — tránh phóng đại method.
3. Mỗi method có **giả định**; **điều kiện thất bại** xảy ra khi giả định bị vi phạm — cần khảo sát (non-IID, data, offline) để tìm "vùng vỡ".
4. Báo cáo trung thực: nêu ablation + limitations.
5. Đây là "lăng kính khoa học" cho G9 (đọc nghiên cứu & dự án).

**Tự kiểm tra:**
- Cách thiết kế ablation.
- Vì sao baseline cao chưa đủ.
- Nêu giả định & điều kiện thất bại cho 1 method.
- Cách dùng ablation khi đọc paper.

---

## 16. Đọc sâu bằng trực giác — tháo một bộ phận chưa nói hết cơ chế

Một chiếc xe chạy nhanh có thể nhờ động cơ, lốp hoặc sự phối hợp cả hai. Tháo lốp tốt làm tốc độ giảm cho biết lốp quan trọng trong chiếc xe ấy; chưa chứng minh lốp luôn mang đúng mức lợi ích đó trong mọi xe.

| Câu hỏi thử nghiệm | Thiết kế | Cần giữ cố định |
|---|---|---|
| Thành phần X có ích không? | Full so với bỏ X | Data, ngân sách và cách chọn siêu tham số |
| X phối hợp với Y thế nào? | Thử đủ bốn tổ hợp | Các thiết lập còn lại |
| Khi nào phương pháp hỏng? | Stress test giả định | Quy tắc thay mức khó |

**Đọc công thức:** `ΔX|Y=A(X,Y)−A(¬X,Y)`: “lợi ích của X khi đang có Y là hiệu accuracy giữa hai cấu hình chỉ khác X”. Dấu điều kiện sau gạch nhắc rằng đóng góp đo được phụ thuộc các thành phần còn lại.

**Tính tay giả lập:** không X/Y đạt 0.60; chỉ X đạt 0.64; chỉ Y đạt 0.65; cả X/Y đạt 0.75. X đem thêm 0.04 khi không Y, nhưng thêm 0.10 khi có Y. Phần tương tác trên thang accuracy là `0.75−0.64−0.65+0.60=0.06`. Vì vậy không thể cộng hai chênh lệch từ các ablation của full rồi gọi đó là phân rã hoàn chỉnh của accuracy.

**Phản ví dụ:** full 0,75 và không X/Y 0,60, rồi gán toàn bộ 0,15 cho X. Con số 0,15 là hiệu của cả gói X+Y; khi chỉ thêm X vào cấu hình không Y, mức tăng chỉ 0,04. Phải đọc đúng cặp cấu hình đang so.

**Giới hạn:** một seed có thể làm chênh lệch nhiễu; việc bỏ thành phần cũng có thể thay ngân sách, số tham số hoặc nhu cầu tuning. Cần ghi rõ giữ nguyên hay tuning lại theo cùng quy tắc. Ablation tốt hỗ trợ một kết luận có điều kiện; không tự chứng minh cơ chế nhân quả nội bộ hoặc độ đúng ở mọi dataset. Stress test phải có phạm vi thực tế, không chọn riêng mức khó có lợi.

:::interactive ablation
:::

:::quiz
Full đạt 0.75, cấu hình bỏ X nhưng giữ Y đạt 0.65. Kết luận trực tiếp nào phù hợp?
A. X luôn cải thiện 10 điểm trên mọi bài toán
B. Trong thiết lập đang xét và có Y, thêm X gắn với tăng 10 điểm phần trăm
C. X chiếm 10% tham số
Đáp án: B
Giải thích: Hiệu 0.10 là chênh accuracy có điều kiện trong thí nghiệm này. Không suy ra phạm vi khác hay số tham số.
:::

:::goi-y
Giữ cụm “trong thiết lập này” khi chuyển một hàng ablation thành một câu kết luận.
:::

:::loi-giai
`0.75−0.65=0.10`, tức 10 điểm phần trăm. Báo thêm seed, biến thiên và ngân sách; thử đủ tổ hợp nếu muốn hiểu tương tác X–Y.
:::
