# Chương 2.7 — Chỉ số đánh giá (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Một con số như "accuracy 95%" có nói lên mọi thứ không — và làm sao chọn đúng chỉ số cho bài toán mất cân bằng?*

---

## 1. Vị trí trong lộ trình

G2.3 dạy chia train/val/test. Giờ học **cách đo kết quả trên test đúng đầu** — cụ thể hơn, với *ma trận nhầm lẫn* và các chỉ số (accuracy, precision, recall, F1). Đây là kỹ năng sống còn của mọi thí nghiệm, và cực kỳ quan trọng ở FL/CL (G6/G7) nơi "mọi chỉ số" có sắc thái riêng (dữ liệu mất cân bằng giữa client, chất lượng giữ-kiến-thức-cũ).

Nó **nối** từ G2.3 (test) và **chuẩn bị** cho G4 (phân loại ảnh, mất cân bằng lớp), G6–G8 (đánh giá FL/CL).

---

## 2. Kiến thức cần dùng

- Phân loại nhị phân (G2.4), chia tập (G2.3).
- Khái niệm xác suất / nhãn (G2.2, Chương 5 sách toán).

**Ôn nhanh:** "dương (positive)" = lớp ta quan tâm (VD "trễ", "có bệnh", "spam"); "âm (negative)" = lớp còn lại. "Nhãn thật" là answer; "dự đoán" là model.

---

## 3. Câu chuyện mở đầu

Hệ thống chẩn đoán bệnh hiếm: trong 10.000 mẫu, chỉ có **50** người thật bị bệnh (tỉ lệ 0.5% — rất mất cân bằng). Một model "đoán ai cũng không bệnh" (nhãn âm) sẽ đạt **99.5% accuracy** — nhưng vô dụng: bỏ sót toàn bộ người bệnh.

Lan thấy ngay: **accuracy không đủ** trong bài toán mất cân bằng. Cần các chỉ số khác: *có bắt được người bệnh không* (recall), *khi báo bệnh có chính xác không* (precision). Chương này dạy đọc những chỉ số đó và tránh bị một "accuracy cao" đánh lừa — vấn đề nổi cộm khi FL/CL cũng thường non-IID/mất cân bằng.

---

## 4. Câu hỏi trọng tâm

**Ma trận nhầm lẫn và các chỉ số (precision/recall/F1) là gì, và khi nào accuracy gây hiểu lầm?**

---

## 5. Trực giác

Hình dung hai câu hỏi khác nhau về một model chẩn đoán:

- **Precision ("độ chính xác khi nói CÓ"):** *"Trong những ca model nói 'bị bệnh', có bao nhiêu là thật sự bệnh?"* — Nếu precision 0.8, nghĩa là: model báo bệnh, thì 80% trong đó thật bệnh. Đo lường **"lời cảnh báo có đáng tin không."**
- **Recall ("độ phát hiện ra tất cả"):** *"Trong những người thật bị bệnh, model bắt được bao nhiêu?"* — Nếu recall 0.7, 70% người bệnh được phát hiện, 30% bị bỏ sót. Đo **"có lọt người bệnh không."**

Hai chỉ số này thường **đánh đổi**: muốn bắt hết người bệnh (recall cao) thì dễ báo nhầm khỏe mạnh thành bệnh (precision thấp); muốn "báo bệnh thì chắc chắn" (precision cao) thì dễ bỏ sót (recall thấp). Tùy bài toán chọn một bên.

**Phép so sánh "kiểm soát an ninh sân bay":** bảo vệ muốn *bắt hết* người nguy hiểm (recall cao — không bỏ sót) chấp nhận *soát nhiều người lành* (precision thấp — phiền). Ngược lại, đội ngũ chất lượng muốn *chỉ dừng đúng người thật sự* (precision cao) có thể chấp nhận lọt vài nguy hiểm (recall thấp). Tùy "cái giá của sai lầm".

**Giới hạn phép so sánh:** thực tế mỗi chính sách còn có chi phí khác; nhưng ý "đánh đổi phát hiện vs chính xác" rất chuẩn.

---

## 6. Từ trực giác đến mô hình

**Ma trận nhầm lẫn (confusion matrix):** bảng `2×2` cho nhị phân:

| | Dự đoán Dương | Dự đoán Âm |
|---|---|---|
| Thật Dương | **TP** (true positive) | **FN** (false negative) |
| Thật Âm | **FP** (false positive) | **TN** (true negative) |

- **TP:** model báo bệnh & đúng (ca có bệnh được phát hiện).
- **FP:** model báo bệnh nhưng sai (khỏe bị nhận nhầm) — "dương tính giả".
- **TN:** model báo khỏe & đúng.
- **FN:** model báo khỏe nhưng sai (bỏ sót ca bệnh) — "âm giả".

**Chỉ số (kí hiệu):**
- `Accuracy = (TP+TN)/(TP+FP+TN+FN)`.
- `Precision = TP/(TP+FP)`.
- `Recall (hay True Positive Rate) = TP/(TP+FN)`.
- `F1 = 2·P·R/(P+R)` (trung bình điều hòa P và R, gồm cả hai).

**Thuật toán tính (từ test set):**
```
1. Lấy dự đoán của model trên test (0/1) + nhãn thật.
2. Xây ma trận nhầm lẫn (đếm TP/FP/TN/FN).
3. Tính P, R, accuracy, F1 từ bảng.
4. Diễn giải kết hợp ngữ cảnh bài toán.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Từ xác suất → lớp dự đoán.** Model logistic trả `p`; với ngưỡng 0.5: `pred = 1 if p ≥ 0.5 else 0`.

**Bước 2 — Xây ma trận nhầm lẫn bằng tay hoặc sklearn.**

```python
from sklearn.metrics import confusion_matrix, classification_report
y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1]
y_pred = [1, 0, 1, 0, 0, 1, 1, 0, 1, 1]
cm = confusion_matrix(y_true, y_pred)   # [[TN, FP],[FN, TP]]
print(cm)
print(classification_report(y_true, y_pred))
```

- `confusion_matrix` trả bảng; `classification_report` in sẵn accuracy/precision/recall/F1.

**Bước 3 — Đọc bảng.** Giải thích từng ô từ TP→FN để biết model nhầm loại nào (bỏ sót hay báo nhầm) — quan trọng hơn con số tổng.

**Lỗi thường gặp:** dùng accuracy khi class mất cân bằng (chuỗi); chọn nhầm thứ tự lớp (lớp 1 là positive — cần định nghĩa rõ); đọc hiểu lẫn "precision" với "recall".

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 100 ca chẩn đoán, model cho: TP=30, FP=10, FN=5, TN=55. (Thật dương tổng = 35; thật âm = 65.)

**Bước 1 — Accuracy:** `(30+55)/100 = 0.85`.

**Bước 2 — Precision:** `30/(30+10) = 0.75`. (Khi báo bệnh, 75% đúng.)

**Bước 3 — Recall:** `30/(30+5) = 0.857`. (Bắt được 85.7% người bệnh; bỏ lọt 5.)

**Bước 4 — F1:** `2×0.75×0.857/(0.75+0.857) ≈ 0.80`.

**Bước 5 — Diễn giải:** accuracy 85% "nghe ổn", nhưng recall 85.7% nghĩa vẫn bỏ sót ~14% người bệnh. Nếu đây là bệnh nguy hiểm, ta phải tăng recall bằng cách hạ ngưỡng (chấp nhận precision giảm). Việc chọn "ưu tiên precision hay recall" là quyết định ngữ cảnh, không phải công thức.

**Thử tương tác:** thay TP/FP/FN/TN và quan sát accuracy, precision, recall. Thêm nhiều TN có thể làm accuracy tăng trong khi recall không đổi; mẫu số 0 hiển thị “Không xác định”.

:::interactive metrics
:::

**Bước 6 — Nối FL/CL:** trong FL non-IID, nếu một client chỉ có 1 lớp, model toàn cục có thể bỏ sót lớp đó → phải theo dõi recall/confusion theo từng client, không chỉ trung bình accuracy. (G6/G7.)

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ dùng accuracy.

| Phương diện | Chỉ accuracy | + precision/recall/confusion |
|---|---|---|
| Mất cân bằng | bị lừa (99.5% vô dụng) | nhìn F1/P/R rõ |
| Loại sai lầm | không phân biệt | TP/FP/FN/TN rõ |
| Ra quyết định | không biết ưu tiên | chọn theo ngữ cảnh |
| Đánh đổi | đơn giản, ít số | nhiều số hơn, cần đọc |

**Cải thiện:** phát hiện được bom accuracy, biết loại nhầm. **Đánh đổi:** phải xác định "lớp nào là positive", hiểu đánh đổi P/R — mất chút "sạch sẽ" của một con số.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát accuracy "lừa" khi mất cân bằng.

1. Tạo dataset 95 âm, 5 dương. Dùng "classifier" luôn trả âm (hoặc ngưỡng rất cao).
2. Tính accuracy (≈0.95 — cao), nhưng recall & F1 của lớp dương = 0.
3. Ghi nhận: model "điểm cao" nhưng vô dụng cho lớp quan tâm.

**Liên hệ FL/CL sớm:** dữ liệu ảnh giữa client lệch lớp (non-IID) — nếu chỉ báo accuracy trung bình sẽ bỏ sót lớp hiếm; cần xem confusion theo client (G6.5).

---

## 11. Thực hành lập trình

**Môi trường:** `pip install scikit-learn` (đã dùng ở chương công cụ; nếu chưa, cài).

**Cấu trúc:** `scripts/metrics_demo.py`:

```python
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# ví dụ mất cân bằng: 95 âm, 5 dương
np.random.seed(0)
y_true = np.array([0]*95 + [1]*5)
y_pred = np.array([0]*95 + [1]*0 + [0]*5)   # model luôn báo âm

print("acc:", round(accuracy_score(y_true, y_pred), 3))
print("precision:", round(precision_score(y_true, y_pred, zero_division=0), 3))
print("recall:", round(recall_score(y_true, y_pred, zero_division=0), 3))
print("confusion:\n", confusion_matrix(y_true, y_pred))
```

**Kết quả dự kiến:** accuracy ≈0.95 nhưng precision/recall = 0 — chứng minh "accuracy cao nhưng vô dụng".

**Lỗi thường gặp:** `precision_score` lỗi "UndefinedMetricWarning" khi không có dự đoán dương → dùng `zero_division=0` hoặc đảm bảo có TP/FP.

**Chú thích trung thực:** sklearn chỉ để tính nhanh (đồn P/R/confusion đã chuẩn); bạn nên tự đếm TP/FP một lần bằng tay để hiểu nguồn gốc, đừng mù tin hàm.

---

## 12. Đánh giá

**Chỉ số:** tính tay đúng TP/FP/TN/FN → P/R/F1 từ 1 ví dụ; nhận diện đúng "accuracy lừa" khi mất cân bằng; chọn đúng chỉ số ưu tiên theo ngữ cảnh.

**Vì sao chọn:** kỹ năng cốt lõi này quyết định "con số model có ý nghĩa không". Với FL/CL, "chỉ số phù hợp + đọc đúng" là yếu tố tái lập trung thực.

**Chỉ số không thể hiện:** không đo mức tự tin/chi phí sai (cần khi quyết định kinh doanh/y tế); không phủ hết đánh giá xác suất-calibrated (G2.8/advanced). Chương này nền chỉ số gốc.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Accuracy là 'chân lý'." — Sai với mất cân bằng; phải xem P/R/F1 + confusion.
- **Hiểu lầm 2:** "Precision cao thì recall cũng cao (tự khó)." — Chúng đánh đổi; tăng P thường giảm R. Hiểu rõ mối quan hệ.
- **Hiểu lầm 3:** "F1 luôn là 'tốt nhất', dùng F1 cho mọi thứ." — F1 là trung bình gộp P/R nhưng *đối xứng* hai bên; nếu bài toán có chi phí bất đối xứng nặng (bỏ sót bệnh tệ hơn nhiều báo nhầm), F1 có thể không phản ảnh đúng — cần weight/chi phí.
- **Giới hạn:** nhiều bài toán (multi-class, segmentation, ranking) cần chỉ số riêng (macro/micro F1, IoU, mAP) — sẽ gặp ở G4/G5/G7. Chương này cho nền chỉ số nhị phân.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Định nghĩa TP/FP/TN/FN và ý nghĩa từng loại với bài "trễ đơn".
2. Giải thích sự khác nhau và mối đánh đổi precision vs recall.
3. Khi nào accuracy gây hiểu lầm nặng nhất?

### Luyện tập (sửa đổi / mở rộng)
4. Cho TP=40, FP=5, FN=15, TN=40. Tính acc, precision, recall, F1.
5. Bài toán phát hiện gian lận: chi phí bỏ sót gian lận (FN) cao hơn nhiều báo nhầm (FP). Bạn ưu tiên recall hay precision? Vì sao?
6. Thay ngưỡng (VD từ 0.5 xuống 0.3) — precision và recall thay đổi thế nào (dự đoán trực giác)?

### Thử thách (thiết kế / liên hệ)
7. Trong FL non-IID (G6), giải thích vì sao "accuracy trung bình các client" có thể che giấu một client yếu — và bạn nên báo chỉ số gì ngoài trung bình.
8. Trong CL (G7), "mất lớp cũ" (giữ kiến thức) thường được đo bằng chỉ số gì liên quan recall/accuracy đã học? (gợi ý: accuracy trên dữ liệu task cũ sau khi học task mới — sẽ nói G7.)

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. TP: đơn trễ & model báo trễ (đúng). FP: không trễ nhưng model báo trễ. TN: không trễ & báo không trễ. FN: trễ nhưng model bỏ sót (không báo).
2. Precision: "lời báo CÓ đáng tin?". Recall: "bắt hết thật CÓ?". Đánh đổi: hạ ngưỡng tăng recall nhưng giảm precision.
3. Khi 1 lớp chiếm áp đảo (mất cân bằng) — accuracy cao dù bỏ sót lớp nhỏ.
4. acc=(40+40)/100=0.80; P=40/45=0.889; R=40/55=0.727; F1=2×0.889×0.727/(0.889+0.727)=0.80.
5. Ưu tiên **recall** (tránh bỏ sót gian lận) chấp nhận precision giảm (nhiều báo nhầm, phiền nhưng không thảm khốc). Chi phí FN cao → recall.
6. Hạ ngưỡng → nhiều ca bị báo dương hơn → recall tăng (bắt thêm), precision giảm (thêm FP). (Niềm xác suất.)
7. Nếu 1 client chỉ có 1 lớp, trung bình accuracy che giấu model bỏ lớp đó. Nên báo accuracy/recall **theo từng client**, `min`, và confusion theo nhóm client — không chỉ mean.
8. Sau khi học task mới, đo accuracy/recall trên dữ liệu **task cũ** → so với trước khi học task mới → "forgetting" (mức giảm). Đây là chỉ số giữ-kiến-thức của CL (G7.6).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Ma trận nhầm lẫn** (TP/FP/TN/FN) phân loại loại sai lầm.
2. **Accuracy** có thể lừa khi mất cân bằng; dùng **precision** (báo CÓ đáng tin?) & **recall** (bắt hết thật Có?).
3. **F1** gộp P/R trung bình điều hòa — hữu ích khi cần cân cả hai.
4. Precision/recall **đánh đổi**; chọn theo chi phí sai của bài toán.
5. Trong FL/CL non-IID, phải báo chỉ số theo client/task, không chỉ trung bình.

**Tự kiểm tra:**
- Viết công thức P, R, F1, accuracy.
- Khi nào accuracy giả? 
- Bài toán mà bạn ưu tiên recall, và vì sao?
- Vì sao trung bình accuracy trong FL có thể che yếu client?

---

## 16. Đọc sâu bằng trực giác — mỗi chỉ số trả lời một câu hỏi khác

Một bác sĩ sàng lọc ung thư không chỉ hỏi "bao nhiêu ca đoán đúng". Cần biết: trong số ca báo dương, bao nhiêu thật sự bệnh? Trong số ca thật sự bệnh, bắt được bao nhiêu? Mỗi chỉ số là một câu hỏi, không có chỉ số nào trả lời tất cả.

| Chỉ số | Câu hỏi | Điểm mù |
|---|---|---|
| Accuracy | Tổng thể đoán đúng bao nhiêu? | Lớp hiếm bị pha loãng |
| Precision | Báo dương có đúng không? | Bỏ sót nhiều vẫn cao |
| Recall | Bắt được bao nhiêu ca dương thật? | Báo nhầm nhiều vẫn cao |
| F1 | Cân bằng precision và recall | Không phản ánh chi phí thực |

**Đọc thành lời:** với ma trận nhầm lẫn `TP` (dương đúng), `FP` (báo nhầm), `FN` (bỏ sót), `TN` (âm đúng): accuracy là `(TP+TN)/tổng`; precision là `TP/(TP+FP)`; recall là `TP/(TP+FN)`; F1 là `2TP/(2TP+FP+FN)`. Điều dễ đọc sai là so sánh precision của hai mô hình có ngưỡng khác nhau mà không nói ngưỡng.

**Tính tay:** với `TP=8, FP=2, FN=4, TN=86`: accuracy `(8+86)/100=0,94`; precision `8/(8+2)=0,8`; recall `8/(8+4)≈0,667`; F1 `16/(16+2+4)=16/22≈0,727`. Mô hình bỏ sót 4 trong 12 ca bệnh, dù accuracy 94% nghe rất cao.

**Phản ví dụ:** bộ dữ liệu có 5 ca bệnh trong 100 mẫu; mô hình luôn đoán "khỏe" đạt accuracy 95% nhưng recall bằng 0 và không phát hiện ca nào. Chỉ nhìn accuracy sẽ chọn mô hình vô dụng. Ngược lại, mô hình báo dương mọi ca có recall 1 nhưng precision thấp, cũng không dùng được cho sàng lọc.

**Giới hạn:** các chỉ số phụ thuộc ngưỡng và phân phối lớp; đổi ngưỡng sẽ đổi precision/recall. Với nhiều lớp, cần nói rõ macro, micro hay weighted. Và không chỉ số nào đo chi phí hậu quả: bỏ sót một ca bệnh thường đắt hơn một lần xét nghiệm lại, nên quyết định cuối phải gắn với bối cảnh.

:::quiz
Với `TP=8, FP=2, FN=4, TN=86`, precision bằng bao nhiêu?
A. 0,80
B. 0,67
C. 0,94
Đáp án: A
Giải thích: `precision=TP/(TP+FP)=8/10=0,8`. Chọn B là recall `8/12`; chọn C là accuracy `94/100`.
:::

**Tự thử thêm:** dùng cùng ma trận nhầm lẫn, tính recall và F1. Sau đó giải thích vì sao hạ ngưỡng dự đoán dương thường làm recall tăng nhưng precision giảm.

:::goi-y
Recall dùng mẫu số `TP+FN`; F1 dùng `2TP/(2TP+FP+FN)`. Hạ ngưỡng làm nhiều ca được báo dương hơn, gồm cả ca âm.
:::

:::loi-giai
Recall `8/12≈0,667`; F1 `16/22≈0,727`. Hạ ngưỡng bắt thêm được ca dương thật (recall tăng) nhưng cũng báo nhầm nhiều ca âm hơn (precision giảm); đánh đổi này phải chọn theo chi phí bỏ sót và báo nhầm.
:::