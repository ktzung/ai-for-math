# Chương 4.7–4.8 — Detection/Segmentation và phân tích lỗi của mô hình thị giác (Giai đoạn 4)

> **Câu hỏi trọng tâm:** *Sau phân loại, hai bài toán "tìm vật ở đâu" (detection/segmentation) là gì — và làm sao phân tích lỗi để cải thiện model thật sự, thay vì chỉ nhìn con số?*

---

## 1. Vị trí trong lộ trình

G4.6 đã xong phân loại ảnh. Giờ mở rộng **detection** (tìm vị trí đối tượng — bounding box) và **segmentation** (gán nhãn từng pixel — segment). Đây là nền cho ứng dụng thực (G8 dùng ảnh y/cây...) và cho ViT (G5) có nhiệm vụ segmentation. Đồng thời dạy **phân tích lỗi** (error analysis) — kỹ năng giúp bạn cải thiện model có hệ thống và rất quan trong FL/CL (lỗi theo client/task).

Gộp 2 chương cuối G4 vì chúng cùng hoàn thiện "cách đọc và cải thiện model thị giác".

---

## 2. Kiến thức cần dùng

- CNN (G4.3), đánh giá (G2.7), class imbalance (G4.6).

**Ôn nhanh:** phân loại = cả ảnh một nhãn. Detection = nhiều hộp (box) + nhãn lớp + "confidence". Segmentation = mỗi pixel một nhãn (semantic) hoặc phân biệt từng cá thể (instance).

---

## 3. Câu chuyện mở đầu

Lan có model phân loại ảnh "cây khỏe/cây bệnh". Nhưng trong ảnh thật có nhiều cây, một số bệnh — phân loại cả ảnh không đủ (ảnh nào cây bệnh? ở đâu?). Cô học:
- **Detection** (YOLO/Faster-RCNN  ...): vẽ hộp quanh từng cây + nhãn "bệnh/khỏe".
- **Segmentation** (U-Net, Mask-RCNN): nhuộm từng pixel là bệnh/khỏe — chi tiết hơn.

Model của cô báo accuracy high trên phân loại, nhưng nhìn **phân tích lỗi** (confusion trên ảnh sai, chỗ nào model nhầm, nhiều trong điều kiện/giống nhau) → cô hiểu model yếu ở đâu (VD nhầm cây con khi trời tối, nhầm 2 giống giống nhau) → cải thiện có mục tiêu (thêm dữ liệu vùng đó, augmentation, đặc trưng). Đây là vòng lặp "đo → phân tích lỗi → cải thiện" mà bạn sẽ dùng mọi lúc.

---

## 4. Câu hỏi trọng tâm

**Detection & segmentation khác nhau thế nào (đầu ra), và quy trình phân tích lỗi để cải thiện model là gì?**

---

## 5. Trực giác

**Detection:** không chỉ nói "có gì" mà "ở đâu". Đầu ra: một list các `(box, class, confidence)`. Box = hình chữ nhật quanh đối tượng. Vấn đề: ảnh có thể có nhiều/không có đối tượng — khác "phân loại 1 nhãn".

**Segmentation:** chi tiết hơn detection — nhuộm *từng pixel*:
- **Semantic segmentation:** mỗi pixel đánh dấu loại (đường, cây, bầu trời...).
- **Instance segmentation:** mỗi cá thể đối tượng tách riêng.
Đầu ra = ảnh cùng kích thước, mỗi pixel một nhãn (mask) — dùng `U-Net` (nền CV segment, encoder-decoder + skip) — hay ViT-based (G5).

**Phân tích lỗi (error analysis):** thay vì chỉ nhìn con số accuracy, *nhìn vào các mẫu sai*, nhóm chúng, tìm nguyên nhân:
- Nhóm theo loại cảnh, điều kiện (sáng/tối), lớp áp đảo, giống nhau giữa lớp.
- Tìm **confusion matrix** (G4.6) để biết nhầm lớp nào↔nào.
- Từng nhóm → hành động (thêm data, augmentation, đặc trưng, weight).

**Phép so sánh: detection = "khoanh tròn bằng bút chì"; segmentation = "tô màu từng pixel"; error analysis = "kỹ sư nhìn phòng phôi sai để tìm lỗi dây chuyền":** trực quan. **Giới hạn:** detection/segmentation phức tạp về đánh giá (IoU, mAP) — học khái niệm đủ để đọc; không bắt buộc tự xây từ đầu (nói rõ G4). Phân tích lỗi cần kỷ luật + dữ liệu đủ để nhóm lỗi có nghĩa.

---

## 6. Từ trực giác đến mô hình

- **Detection:** model trả `(box, class, conf)`; đánh giá bằng **IoU** (độ trùng hộp) và **mAP** (mean average precision).
- **Segmentation:** model trả `mask` (mỗi pixel 1 nhãn); đánh giá bằng **IoU per-class / mIoU**.
- **Error analysis pipeline:** thu mẫu sai → nhóm → tìm nguyên nhân → hành động → kiểm lại.

**Thuật toán phân tích lỗi:**
```
1. Đánh giá model trên val/test → lấy danh sách mẫu sai + confusion.
2. Nhóm lỗi theo tiêu chí (điều kiện, lớp, khó).
3. Với từng nhóm: đoán nguyên nhân (thiếu data class? augmentation sai? class khó tiền?)
4. Ưu tiên nhóm nhiều lỗi nhất → hành động cụ thể.
5. Đánh giá lại (val) xem cải thiện chưa.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Detection đánh giá bằng IoU (khái niệm).**

`IoU = (diện tích giao)/(diện tích hợp)` giữa hộp dự đoán và hộp thật. IoU > ngưỡng (0.5) coi là "trúng". Nếu không có hộp đối tượng trong ảnh — dự đoán "rỗng" sai.

**Bước 2 — Segmentation đánh giá bằng mIoU.** Trung bình IoU các lớp (mỗi lớp giữa mask dự đoán và thật). Lớp hiếm vẫn ảnh hưởng nhỏ (như G4.6) — cần xem per-class.

**Bước 3 — Chạy pretrained detector/segmenter (demo bằng torchvision).**

```python
import torchvision
from torchvision.models.detection import fasterrcnn_resnet50_fpn
model = fasterrcnn_resnet50_fpn(weights="DEFAULT")
model.eval()
# cho 1 ảnh → dict {'boxes','labels','scores'}
```
*(Đây chỉ demo dùng model sẵn; học khái niệm, không tự build. Truy cập qua API.)*

**Bước 4 — Phân tích lỗi cổ điển (phân loại).**

```python
from sklearn.metrics import confusion_matrix
cm = confusion_matrix(y_true, preds)          # nhìn nhầm lớp nào↔nào
# xem 10 mẫu sai: vẽ ảnh + nhãn dự đoán + thật, nhóm lại
```

**Lỗi thường gặp:** dùng accuracy cho detection (sai; cần mAP/IoU); segmentation bỏ qua lớp hiếm (mIoU che giấu vài lớp kém — xem per-class); error analysis chỉ nhìn "sai bao nhiêu" mà không nhóm (thiếu hành động).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** model phân loại "mèo/chó", bạn thu được danh sách sai:

**Bước 1 — Nhóm lỗi:** (a) 30 ảnh mèo tối bị đoán chó; (b) 5 ảnh chó bị đoán mèo; (c) 8 ảnh "mèo ngồi trên ghế có chó cạnh" bị lẫn.

**Bước 2 — Nguyên nhân:** (a) thiếu ảnh mèo tối → thêm/augmentation darkness; (b) nhiễu nhãn → kiểm nhãn; (c) bối cảnh khó → có thể cần detection hoặc nhiều context.

**Bước 3 — Ưu tiên:** nhóm (a) nhiều nhất → thêm dữ liệu ảnh tối + augmentation → đánh giá lại.

**Bước 4 — Kết luận:** phân tích lỗi biến "model tệ, tăng data" mù quáng thành "thiếu data loại X → thêm đúng loại X". Tiết kiệm thời và có mục tiêu.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ nhìn accuracy rồi "tăng data / đổi model".

| Phương diện | Nhìn accuracy rồi thử | Phân tích lỗi có hệ thống |
|---|---|---|
| Biết nguyên nhân | không (mò) | có (nhóm lỗi) |
| Hành động cụ thể | mù | nhắm đúng nhóm |
| Đánh giá cải thiện | mơ hồ | val lại rõ |
| Đánh đổi | nhanh "thử" | cần kỷ luật nhóm lỗi |

**Cải thiện:** hiệu quả, có mục tiêu. **Đánh đổi:** mất chút thời gian nhóm lỗi — đáng.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** làm vòng lặp phân tích lỗi một lần.

1. Huấn luyện model phân loại nhỏ trên subset.
2. Thu 100 mẫu sai trên val.
3. Nhóm thủ công thành 2–3 nhóm nguyên nhân (điều kiện/lớp).
4. Áp 1 cải thiện cho nhóm lớn nhất (thêm augmentation/data), đánh giá lại val.
5. Ghi lại trước–sau. Đây là "vòng lặp ML" thực sự.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + torchvision + matplotlib (+sklearn).

**Cấu trúc:** `scripts/error_analysis.py` (phân loại — dễ):

```python
import torch, torch.nn as nn, matplotlib.pyplot as plt
# (giả sử đã có model, dataloader val — dùng từ chương trước)

def find_misclassified(model, loader, classes):
    model.eval(); mis = []
    with torch.no_grad():
        for xb, yb in loader:
            pred = model(xb).argmax(1)
            for i in range(xb.size(0)):
                if pred[i] != yb[i]:
                    mis.append((xb[i], yb[i], pred[i]))
    return mis[:20]                 # lấy 20 mẫu sai

# vẽ lưới các mẫu sai với nhãn dự đoán — để người nhìn nhóm
# (thêm: in confusion matrix qua sklearn)
```

**Kết quả dự kiến:** lưới ảnh sai + nhãn — bạn nhóm được (cảnh tối, trùng lặp...) và dựng hành động. Đây là phần "nhìn người" của error analysis.

**Lỗi thường gặp:** nhầm chỉ số (pred vs yb); vẽ ảnh không đủ context; chỉ in số mà không vẽ nhóm.

---

## 12. Đánh giá

**Chỉ số:** hiểu difference detection/segmentation (đầu ra box/mask); dùng IoU/mAP (detection) và per-class/mIoU (segment); thực hiện được 1 vòng phân tích lỗi (nhóm → hành động → đánh giá lại).

**Vì sao chọn:** detection/seg trình độ "đọc + dùng pretrained"; phân tích lỗi là kỹ năng dài hơi — dùng ở mọi thí nghiệm G5–G9 và FL/CL.

**Chỉ số không thể hiện:** không tự xây detector/segment từ đầu (ngoài phạm vi); không phủ hyperparameter mAP chi tiết. Đây là mức "cần cho mục tiêu" (đúng prompt: detection/segmentation ở mức cần thiết cho mục tiêu).

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Detection = phân loại từng ô trên ảnh." — Gần tư duy nhưng không phải: detection dùng box regression (x,y,w,h) + classification, kèm IoU/NMS; không phải trượt cửa sổ đơn thuần.
- **Hiểu lầm 2:** "Segmentation thì 'cứ dùng model màu'." — Phức tạp hơn: mask per-class, đánh giá mIoU, dạng U-Net/ViT. Và "label noise" rất nghiêm trọng (chấm từng pixel tốn công, dễ sai).
- **Hiểu lầm 3:** "Error analysis chỉ để điều chỉnh cuối." — Nên làm ngay và xuyên suốt; rất hữu ích ở đầu (chọn đặc trưng/đầu vào). Đừng đợi model xong rồi mới nhìn lỗi.
- **Giới hạn:** phân tích lỗi cần dữ liệu đủ để nhóm có ý nghĩa (ít lỗi → khó kết luận); và detection/segmentation đòi GPU khi train thật (mục 11 nói rõ dùng pretrained). Trong FL/CL, lỗi theo client/task cần phân tích tương tự (G6/G7).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Detection đầu ra gì, segmentation đầu ra gì — khác nhau.
2. IoU đo gì; mIoU đo gì cho segmentation.
3. Vì sao chỉ nhìn accuracy là không đủ khi có model yếu?

### Luyện tập (sửa đổi / mở rộng)
4. Phân tích lỗi: bạn có 50 ảnh sai, 30 do tối, 10 do nhầm lớp giống, 10 nhiễu nhãn. Đề xuất 3 hành động và thứ tự ưu tiên.
5. Dùng model detection pretrained demo: in `boxes, labels, scores` cho 1 ảnh và giải thích ý nghĩa.

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), phân tích lỗi theo *client*: model toàn cục lỗi tập trung ở client nào? Giải thích cách kết hợp per-client confusion để tìm "client khó" (non-IID).
7. Trong CL (G7), "error thay đổi theo thời gian" — bạn theo dõi lỗi của từng task qua các phase thế nào để thấy forgetting (nối G7.6)?

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Detection: list (box, class, conf) — "vật gì ở đâu". Segmentation: mask mỗi pixel 1 nhãn — "pixel đó thuộc gì".
2. IoU = phần giao/phần hợp hai hộp; mIoU = trung bình IoU các lớp trong mask.
3. Vì con số tổng không chỉ nơi/sai kiểu nào; không biết gì để cải thiện. Cần nhìn sai cụ thể.
4. Ưu tiên nhóm nhiều nhất (tối): thêm ảnh tối/augmentation. Thứ hai lớp giống: kiểm đặc trưng/nhiều dữ liệu lớp đó. Cuối: kiểm nhãn (G2.8/4.6).
5. `boxes` = hộp, `labels` = class id, `scores` = confidence; lớn → tự tin. Dùng để kiểm demo.
6. Tính accuracy/confusion **theo client**; nếu client X val thấp → non-IID/drift. Phân tích lỗi từng client giúp biết "mô hình lệch vì client nào" → cần weight/client ước, regularization, tăng data client khó. G6.
7. Sau mỗi phase học task mới, đo accuracy **từng task cũ** — lỗi task cũ tăng dần = forgetting. Vẽ ma trận "accuracy task (row) theo phase (col)" để thấy quên (backward transfer). G7.6.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Detection** → hộp + nhãn + confidence (IoU/mAP). **Segmentation** → nhãn từng pixel (mIoU/per-class).
2. Dùng **pretrained** detector/segmenter ở mức này; đánh giá bằng IoU/mAP đúng cách.
3. **Phân tích lỗi** = nhóm mẫu sai → tìm nguyên nhân → hành động → đánh giá lại; không mò.
4. Đừng chỉ nhìn accuracy; xem confusion, per-class, điều kiện.
5. Trong FL/CL, phân tích lỗi theo **client/task** sẽ làm rõ non-IID & forgetting (G6/G7).

**Tự kiểm tra:**
- Detection vs segmentation khác nhau ở đầu ra?
- IoU/mIoU đo gì?
- Quy trình phân tích lỗi 4 bước?
- Vì sao không chỉ nhìn accuracy?

---

## 16. Đọc sâu bằng trực giác — IoU là mức chồng khớp của hai vùng

Hai người khoanh vùng một tổn thương trên phim. Một người khoanh rộng hơn, người kia lệch sang bên. Đếm "đúng hay sai" không đủ; cần biết phần chồng lên nhau chiếm bao nhiêu trong toàn bộ vùng được khoanh. IoU trả lời câu hỏi đó.

| Khái niệm | Đo cái gì | Dùng ở đâu |
|---|---|---|
| IoU | Phần giao trên phần hợp của hai vùng | Một cặp dự đoán–đáp án |
| mIoU | Trung bình IoU theo lớp | Segmentation nhiều lớp |
| mAP | Diện tích dưới đường precision–recall | Detection, có ngưỡng IoU |

**Đọc thành lời:** `IoU = diện tích giao / diện tích hợp`. Giao là phần cả hai vùng cùng phủ; hợp là toàn bộ vùng của ít nhất một bên. Với segmentation, tính theo pixel cho từng lớp rồi lấy trung bình thành mIoU. Điều dễ đọc sai là dùng IoU của hộp bao để kết luận chất lượng mặt nạ; hộp đúng chưa chắc ranh giới đúng.

**Tính tay:** hộp dự đoán `[0,0,2,2]` rộng `2×2=4`; hộp thật `[1,1,3,3]` cũng diện tích 4; phần giao `[1,1,2,2]` có diện tích `1×1=1`; hợp `4+4−1=7`; IoU `1/7≈0,143`. Nếu chọn ngưỡng 0,5, dự đoán này bị tính là sai dù tâm hộp gần đúng.

**Phản ví dụ:** báo pixel accuracy 95% cho ảnh segmentation trong đó 95% pixel là nền. Mô hình đoán toàn nền đạt 95% nhưng không tìm ra đối tượng; mIoU của lớp đối tượng bằng 0. Ngược lại, một hộp bao lớn phủ trọn đối tượng có thể có IoU thấp nếu diện tích thừa nhiều, dù không bỏ sót đối tượng.

**Giới hạn:** IoU phụ thuộc ngưỡng và cách khớp nhiều dự đoán với một đáp án; vật nhỏ rất nhạy với lệch vài pixel. mAP còn phụ thuộc ngưỡng IoU và cách nội suy precision–recall, nên con số chỉ so sánh được khi cùng giao thức. Và mọi chỉ số tổng hợp đều có thể che nhóm yếu; cần phân tích lỗi theo lớp, kích thước, điều kiện chụp.

:::interactive iou
:::

:::quiz
Hai hộp `[0,0,2,2]` và `[1,1,3,3]` có IoU xấp xỉ bao nhiêu?
A. 0,143
B. 0,250
C. 0,500
Đáp án: A
Giải thích: giao có diện tích `1`, hợp `4+4−1=7`, nên `IoU=1/7≈0,143`. Chọn B là nhầm giao/hợp; chọn C là bỏ phần diện tích không chồng.
:::

**Tự thử thêm:** tính IoU giữa hộp `[0,0,2,2]` và hộp `[0,0,1,1]`. Sau đó giải thích vì sao cùng một mô hình có thể có mIoU cao nhưng vẫn bỏ sót toàn bộ một lớp hiếm.

:::goi-y
Hộp nhỏ nằm trọn trong hộp lớn: giao bằng diện tích hộp nhỏ, hợp bằng diện tích hộp lớn. mIoU lấy trung bình theo lớp, lớp không được dự đoán có IoU 0 nhưng bị pha loãng nếu nhiều lớp khác tốt.
:::

:::loi-giai
Giao `1×1=1`; hợp `4`; IoU `1/4=0,25`. mIoU có thể cao vì các lớp phổ biến đạt tốt, trong khi lớp hiếm có IoU 0 chỉ kéo trung bình xuống một phần; cần xem chỉ số từng lớp và confusion để phát hiện.
:::