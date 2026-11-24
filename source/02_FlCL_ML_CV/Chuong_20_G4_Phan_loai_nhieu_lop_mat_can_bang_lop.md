# Chương 4.6 — Phân loại nhiều lớp và mất cân bằng lớp (Giai đoạn 4)

> **Câu hỏi trọng tâm:** *Khi có hơn 2 lớp, và có lớp hiếm khiến model "quên" hẳn nó, ta đo và khắc phục như thế nào?*

---

## 1. Vị trí trong lộ trình

G2.7 đã dạy chỉ số nhị phân. Giờ mở rộng **phân loại nhiều lớp** (multi-class) và vấn đề **mất cân bằng lớp** (class imbalance) — chuyện rất thực trong ảnh (lớp hiếm) và đặc biệt trong FL non-IID (mỗi client có thể thiếu hẳn một lớp). Đây là kỹ năng sống còn cho G6/G8.

Nó nối G2.7 (chỉ số) và G4 (CV) — và chuẩn bị trực tiếp cho bài toán mất cân bằng giữa client trong FL.

---

## 2. Kiến thức cần dùng

- Phân loại nhị phân (G2.4), chỉ số precision/recall/F1 (G2.7), CNN (G4.3).

**Ôn nhanh:** multi-class: mỗi mẫu thuộc đúng 1 trong K lớp (khác multi-label: có thể thuộc nhiều). Loss multi-class = CrossEntropy (softmax trên K logits, nhãn là số nguyên chỉ lớp).

---

## 3. Câu chuyện mở đầu

Lan có 10 lớp ảnh (mèo, chó, thuyền, xe...). Nhưng "thuyền" rất hiếm — chỉ vài trăm ảnh, trong khi "xe" chiếm nửa dataset. Model đọc loss cross-entropy giảm, accuracy "cao" nhưng... *thuyền bị bỏ qua gần như hoàn toàn* (vì để accuracy cao chỉ cần đoán "xe" hoài). Khi đánh giá kỹ, recall lớp thuyền gần 0.

Lan học: với nhiều lớp + lớp hiếm, **accuracy trung bình không đủ**; phải xem **confusion matrix theo từng lớp**, dùng chỉ số per-class (macro-F1), và khắc phục bằng khó trọng số lớp (weighted loss) / tăng mẫu lớp hiếm / oversampling. Trong FL (G6), khi một client còn *thiếu* cả lớp, vấn đề còn nghiêm trọng hơn — cần đặc biệt theo dõi.

---

## 4. Câu hỏi trọng tâm

**Phân loại nhiều lớp dùng cross-entropy thế nào, và vấn đề lớp mất cân bằng nên được đo & xử lý ra sao?**

---

## 5. Trực giác

**Multi-class:** mỗi mẫu thuộc 1 trong K nhóm. Đầu ra là K logits; **softmax** biến thành K xác suất (tổng 1). Cross-entropy tối đa xác suất của lớp đúng. Nhãn thường là số nguyên (0..K-1).

**Mất cân bằng lớp:** vài lớp có rất ít mẫu. Vì Loss tính trung bình theo mẫu, các lớp đông "áp đảo" gradient → model học tốt lớp đông, "bỏ bê" lớp hiếm. Accuracy vẫn cao (vì lớp đông đúng), nhưng recall lớp hiếm thấp thảm.

**Giống hệ thống cảnh báo hiếm:** G2.8/G2.7 đã thấy chuyện accuracy giả. Multi-class/imbalance là phiên bản nhiều nhóm hơn. Cần nhìn **confusion matrix** (lớp nào bị nhầm sang lớp nào) và dùng **macro** metric (trung bình các lớp đều nhau, không bị lớp đông làm nặng).

**Phép so sánh "cân sách trong thư viện" (lớp ít sách bị quên):** trực quan — nếu chỉ đếm tổng lượt mượn (accuracy), kệ sách hiếm tưởng "ổn" nhưng thật ra ít người dùng; phải xem lượt mượn *từng kệ*. **Giới hạn:** "weighted loss" / oversampling là các công cụ; không phải lúc nào cũng đúng (oversample lớp hiếm quá mức → overfit). Chọn theo vấn đề.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** nhiều lớp, lớp hiếm có ít mẫu.
- **Model:** CNN → K logits → softmax → xác suất.
- **Loss:** CrossEntropy (mặc định trọng số bằng nhau).
- **Chỉ số đánh giá:** accuracy (kém khi imbalance) + **confusion matrix** + **precision/recall/F1 per-class** + **macro-F1** (trung bình F1 các lớp đều nhau).

**Thuật toán khắc phục:**
```
1. Đo: confusion matrix, recall per-class (đặc biệt lớp hiếm).
2. Nếu lớp hiếm kém: 
   a. class weight (nâng trọng số lớp hiếm trong loss).
   b. oversample / tăng ảnh lớp hiếm (augmentation).
   c. thu thập thêm mẫu lớp hiếm nếu có thể.
3. Đánh giá lại bằng mỗi chỉ số per-class (không chỉ accuracy).
```

---

## 7. Thuật toán từng bước

**Bước 1 — CrossEntropy multi-class.**

```python
import torch.nn.functional as F
logits = model(batch)              # (N, K)
loss = F.cross_entropy(logits, labels)   # labels: (N,) số nguyên 0..K-1
```

- `cross_entropy` bên trong áp softmax + CE. Giữ logits/chuẩn API.

**Bước 2 — Đánh giá per-class (confusion + recall).**

```python
from sklearn.metrics import classification_report
# trên test, thu preds và y_true
print(classification_report(y_true, preds, digits=3))
```

- Báo precision/recall/F1 **mỗi lớp** — thấy ngay lớp hiếm kém.

**Bước 3 — Trọng số lớp (nặng lớp hiếm).**

```python
from sklearn.utils.class_weight import compute_class_weight
w = compute_class_weight("balanced", classes=np.arange(K), y=y_train)
weights = torch.tensor(w, dtype=torch.float32)
loss = F.cross_entropy(logits, labels, weight=weights)
```

- `weight` nâng loss của lớp hiếm → model chú ý hơn.

**Bước 4 — (Alt) Oversample lớp hiếm:** lặp/ứ mẫu lớp hiếm trong DataLoader, hoặc augmentation nhiều hơn cho lớp hiếm.

**Lỗi thường gặp:** dùng accuracy khi imbalance; quên per-class; `compute_class_weight` với nhãn int đúng range; nâng weight quá → overfit lớp hiếm.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 3 lớp A (800), B (150), C (50) = 1000 mẫu. Model "đoán A hoài".

**Bước 1 — Accuracy:** `Pred A everywhere` → đúng 800/1000 = **0.80** — "cao".

**Bước 2 — Recall per-class:** A: 1.0; B: 0.0; C: 0.0. → Model vô dụng với B/C.

**Bước 3 — Macro-F1:** trung bình F1 mỗi lớp (mỗi lớp 0 hoặc 1 theo đó) → rất thấp → phản ánh thật hơn accuracy 0.8.

**Bước 4 — Xử lý:** set weight tỉ lệ nghịch (weight_C cao nhất) → loss phạt sai C mạnh → model học C hơn, recall C tăng (chấp nhận A giảm chút).

**Bước 5 — Đọc again bằng confusion:** thấy mẫu C bị nhầm sang lớp nào (nếu lẫn với A hay B) → thông tin để cải thiện đặc trưng.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ dùng accuracy đơn (mặc định, không per-class).

| Phương diện | Chỉ accuracy | + per-class / weighted loss |
|---|---|---|
| Lớp hiếm | bị bỏ bê | chú ý (recall tăng) |
| Đọc triệu chứng | không hiểu lớp nào yếu | confusion rõ |
| Đánh đổi | đơn giản, ít chỉ số | thêm công sức + chọn weight |

**Cải thiện:** nhạy với lớp hiếm (rất quan trọng trong FL/CL khi client thiếu lớp). **Đánh đổi:** cần theo dõi per-class, chọn weight cẩn thận (quá → overfit).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát class imbalance đánh lừa accuracy.

1. Trên dataset ảnh (CIFAR subset) cố ý giữ ít lớp 1 lớp hiếm (chỉ giữ vài chục ảnh 1 lớp).
2. Train model "bình thường" → accuracy cao nhưng recall lớp hiếm thấp.
3. Thêm `weight` balanced → recall lớp hiếm tăng (accuracy tổng có thể nhích giảm chút — đó là trade-off đúng).
4. Ghi nhận: cân bằng đánh đổi, không có "free lunch".

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + sklearn.

**Cấu trúc:** `scripts/imbalance_demo.py` (phác — dùng dữ liệu giả trước):

```python
import numpy as np, torch, torch.nn as nn, torch.nn.functional as F
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_class_weight

# giả 3 lớp, imbalance
np.random.seed(0)
X = torch.randn(600, 5); y = (X[:,0] > 0).long() + (X[:,1] > 1).long()  # 3 classes (giả)
# nhét imbalance: ép class 2 hiếm
idx_c0 = (y==0) # etc — để dài; đơn giản: dùng Tổng CrossEntropy mặc định trước
...
# huấn luyện MLP nhỏ, rồi:
# print(classification_report(y_np, preds_np))
```

*(Đây là khung; bạn hoàn thiện để nhìn recall lớp hiếm thấp, rồi thêm weight → tăng.)*

**Ý chính:** dùng `classification_report` để thấy per-class; dùng `weight` balanced trong cross_entropy.

**Chú thích trung thực:** với dữ liệu fake có thể không "kịch tính"; nên dùng tập ảnh thật (CIFAR subset cố ý bất đối xứng) để thấy rõ. Khung code để minh họa API.

---

## 12. Đánh giá

**Chỉ số:** đọc `classification_report` per-class; thấy accuracy lừa khi imbalance; dùng `weight` balanced; đánh giá lại bằng recall/F1 lớp hiếm (không chỉ accuracy).

**Vì sao chọn:** khả năng này trực tiếp cứu thí nghiệm FL/CL (lớp thiếu client), và giúp đọc hiệu quả tính "đóng góp của từng lớp".

**Chỉ số không thể hiện:** không tối ưu mọi chiến lược cân bằng (oversampling fraction, focal loss); đó là nâng cao. Chương này nền per-class + weighted.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Accuracy cao là model tốt, kể cả imbalance." — Sai; per-class sẽ lộ model bỏ lớp hiếm. Luôn xem recall/confusion khi imbalance.
- **Hiểu lầm 2:** "Thêm weight luôn bổ ngực, không nhược." — Sai; weight quá mạnh → overfit lớp hiếm, model quên lớp đông/accuracy giảm. Chọn vừa + xem per-class.
- **Hiểu lầm 3:** "Oversample luôn tốt." — Có thể overfit (lặp cùng mẫu). Tốt hơn dùng augmentation (biến thể) + oversample vừa phải.
- **Giới hạn:** trong FL, "class imbalance" còn giao với "non-IID giữa client" — vấn đề nặng hơn, xử lý ghép ở G6. Và có metrics nâng cao (macro vs weighted micro, balanced accuracy) — nền ở đây đủ đọc.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Multi-class vs multi-label khác nhau?
2. Vì sao accuracy lừa khi class imbalance? 
3. Macro-F1 là gì, sao hữu ích khi imbalance?

### Luyện tập (sửa đổi / mở rộng)
4. Với dataset 900 A / 100 B, "đoán A hoài" → accuracy? F1 cho lớp B? 
5. Thêm `weight` balanced vào cross_entropy trên dataset giả; nhận xét recall lớp hiếm thay đổi thế nào.

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), nếu một client chỉ có "xe" (1 lớp), model toàn cục FedAvg có thể quên "tàu" của client khác không? Giải thích + cách theo dõi per-class theo client.
7. Trong CL (G7), "lớp mới ít mẫu" thêm vào như thế nào liên quan class imbalance + forgetting — nối với rehearsal/weight cho lớp mới.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Multi-class: mẫu thuộc đúng 1 trong K, loss CE. Multi-label: mẫu thuộc đồng thời nhiều nhãn, dùng BCE/khác. Khác bản chất.
2. Lớp đông chiếm mà vẫn "đúng" → accuracy cao dù bỏ lớp hiếm. Đo per-class mới thấy.
3. Macro-F1 = trung bình F1 từng lớp (mỗi lớp nặng như nhau, không theo số mẫu) → lớp hiếm không bị "lấn át" → phản ánh khả năng mọi lớp.
4. Accuracy = 900/1000=0.9; lớp B → "đoán A" → recall B=0, precision B=0 (không bao giờ báo B). Macro-F1 của B = 0.
5. Weight balanced → sai lớp hiếm bị phạt nặng → model học lớp hiếm hơn → recall B tăng (accuracy tổng có thể nhẹ giảm — trade-off).
6. Nếu client "xe" áp đảo global update, model toàn cục thiên xe → client "tàu" kém → model quên tàu ở mức toàn cục. Theo dõi: confusion/recall **per-class per-client**; update có trọng số mẫu; không chỉ trung bình accuracy. (G6 chuyên sâu.)
7. Lớp mới ít mẫu + học mạnh → model khớp lớp mới, có thể quên lớp cũ (forgetting); đồng thời lớp mới hiếm → recall thấp. Giảm: weight lớp mới, rehearsal mẫu cũ, học nhẹ (lr/epoch). (G7.)

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Phân loại nhiều lớp → **cross-entropy** với K logits; nhãn số nguyên.
2. **Class imbalance** → accuracy lừa; lớp hiếm bị bỏ.
3. Đo bằng **confusion matrix + per-class recall/F1 + macro-F1** (không chỉ accuracy).
4. Khắc phục: **weight lớp / oversample / augmentation** cho lớp hiếm — nhưng đánh đổi overfit, chọn vừa.
5. Imbalance giao với **non-IID giữa client** trong FL và **lớp mới hiếm / forgetting** trong CL (G6/G7).

**Tự kiểm tra:**
- Vì sao accuracy lừa khi imbalance?
- Cách đọc per-class metric / macro-F1.
- Cách dùng weighted loss + rủi ro.
- Liên hệ imbalance ↔ FL/CL (client thiếu lớp, lớp mới hiếm).

---

## 16. Đọc sâu bằng trực giác — lớp hiếm là ca bệnh trong phòng khám đông

Một phòng khám có 95 người khỏe và 5 người bệnh. Nếu bác sĩ nói "tất cả đều khỏe", 95% câu trả lời đúng nhưng không ai được chữa. Accuracy trong bài toán mất cân bằng cũng vậy: nó bị số đông chi phối, còn lớp hiếm gần như không được đo.

| Thành phần | Ý nghĩa | Điều dễ nhầm |
|---|---|---|
| Logit `z_k` | Điểm thô cho lớp `k` | Tưởng đã là xác suất |
| Softmax | Chuẩn hóa điểm thành phân phối | Tưởng xác suất là "độ chắc chắn thật" |
| Accuracy | Tỉ lệ đoán đúng toàn cục | Bỏ qua lớp hiếm |
| Macro average | Trung bình đều giữa các lớp | Không phản ánh số mẫu |

**Đọc thành lời:** softmax là `p_k=e^{z_k}/Σ_j e^{z_j}`. Điểm cao hơn nhận xác suất lớn hơn, nhưng tổng luôn bằng 1. Với ba lớp, mỗi xác suất phụ thuộc hiệu điểm với hai lớp còn lại, không phụ thuộc mức tuyệt đối. Điều dễ đọc sai là dùng accuracy làm thước đo duy nhất khi một lớp chiếm phần lớn dữ liệu.

**Tính tay:** logits `[2,1,0]`: `e²≈7,389`, `e¹≈2,718`, `e⁰=1`; tổng `≈11,107`; xác suất `[0,665; 0,245; 0,090]`. Nếu dữ liệu có 95 mẫu lớp A, 3 lớp B, 2 lớp C và mô hình luôn đoán A: accuracy `95/100=95%`, nhưng recall lớp B và C đều bằng 0; macro recall `(1+0+0)/3≈33,3%`.

**Phản ví dụ:** thấy accuracy 95% rồi triển khai hệ thống sàng lọc. Lớp bệnh hiếm chỉ 5 mẫu, mô hình bỏ sót toàn bộ; accuracy vẫn đẹp. Ngược lại, tăng trọng số lớp hiếm có thể đẩy accuracy xuống nhưng recall lớp hiếm lên — đó có thể là đánh đổi mong muốn, không phải mô hình tệ đi.

**Giới hạn:** không có một cách cân bằng vạn năng. Oversampling có thể lặp mẫu và gây overfit; undersampling bỏ thông tin lớp đông; class weight phụ thuộc chi phí do người thiết kế chọn. Với nhiều lớp, macro, micro và weighted average trả lời các câu hỏi khác nhau, nên phải báo rõ loại trung bình.

:::interactive softmax
:::

:::quiz
Với logits `[2,1,0]`, xác suất softmax cho lớp đầu tiên xấp xỉ bao nhiêu?
A. 0,665
B. 0,333
C. 0,245
Đáp án: A
Giải thích: `e²/(e²+e¹+e⁰)≈7,389/11,107≈0,665`. Chọn C là xác suất lớp thứ hai; chọn B là chia đều ba lớp.
:::

**Tự thử thêm:** với ba logits bằng nhau `[0,0,0]`, tính xác suất mỗi lớp. Sau đó giải thích vì sao một mô hình luôn đoán lớp đa số có thể đạt accuracy 95% nhưng macro recall chỉ khoảng 33% trên dữ liệu 95/3/2.

:::goi-y
Ba logit bằng nhau cho ba tử số bằng nhau, tổng bằng 3. Macro recall lấy trung bình recall từng lớp, không trọng số theo số mẫu.
:::

:::loi-giai
`[0,0,0]` cho `[1/3,1/3,1/3]`. Trên dữ liệu 95/3/2, đoán luôn lớp A cho recall `1`, `0`, `0`; trung bình đều là `1/3≈33,3%`, dù accuracy 95%.
:::