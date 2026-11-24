# Chương 5.5–5.6 — Pretraining, fine-tuning, inference; frozen backbone, linear probing & tinh chỉnh một phần (Giai đoạn 5)

> **Câu hỏi trọng tâm:** *Sau khi có một mô hình đã được "tiền huấn luyện" trên dữ liệu lớn, ta tận dụng nó theo mấy mức — và mức nào nên dùng khi nào?*

---

## 1. Vị trí trong lộ trình

Đã hiểu Transformer/ViT (G5.1–4). Giờ là **vòng đời của các mô hình lớn**: `pretraining → fine-tuning → inference`, và các *mức tận dụng* (frozen backbone / linear probing / fine-tune một phần / toàn phần). Đây là kỹ năng thực chiến cho mọi dự án và là nền của mô hình nền tảng (G5.7) và FL/CL (G8 dùng pretrained trong client).

Gộp 5.5 và 5.6 vì chúng cùng nói về "cách dùng model đã huấn luyện sẵn".

---

## 2. Kiến thức cần dùng

- Transfer learning (G4.5), CNN/backbone (G4), ViT (G5.1–4).

**Ôn nhanh:** pretrained = đã học trên data lớn. Backbone = phần trích đặc trưng (tầng conv/token). Frozen = không cập nhật trọng số (requires_grad=False, G4.5). Linear probing = thêm 1 tầng tuyến tính trên đặc trưng đông lạnh.

---

## 3. Câu chuyện mở đầu

Lan có model ViT đã pretrain trên ImageNet. Với dataset nhỏ của cô (phân loại ảnh cây), cô có nhiều cách dùng. Lời khuyên của người có kinh nghiệm: *"hãy thử từ mức nhẹ nhất: đông cứng backbone và chỉ học 1 tầng tuyến tính (linear probing). Nếu đặc trưng đã đủ tốt, bạn có kết quả nhanh. Nếu chưa, fine-tune thêm vài tầng cuối với lr nhỏ."* Lan tìm hiểu thêm:
- **Linear probing** cho biết *chất lượng biểu diễn* (nếu đặc trưng tốt, chỉ cần 1 Linear là khớp được).
- **Fine-tuning** sâu hơn cho model "thích ứng" bài toán — nhưng nếu lr lớn/dữ liệu lệch → "quên" kiến thức pretrained (nối G7 forgetting).

Cô rút quy trình: *từ đông cứng → linear probe → fine-tune ít (lr nhỏ) → so val → chọn mức tốt nhất.*

---

## 4. Câu hỏi trọng tâm

**Vòng đời `pretrain → finetune → inference` là gì, và các mức tận dụng (frozen, linear probe, fine-tune phần/toàn) khác nhau thế nào, dùng khi nào?**

---

## 5. Trực giác

**Pretraining = "học nghề chung trên dữ liệu lớn".** Mô hình học tổng quát cách nhìn thế giới (đặc trưng thị giác: cạnh, texture, object parts) từ dữ liệu khổng lồ. Tốn kém; làm một lần bởi tổ chức lớn.

**Fine-tuning = "dạy thêm chuyên môn cho bài toán cụ thể".** Lấy model pretrained, tiếp tục huấn luyện (toàn bộ / một phần) trên dữ liệu nhỏ của bạn, lr thấp. Rẻ hơn pretrain rất nhiều.

**Inference = "dùng model ở thời điểm khai thác"** — không còn học (hoặc chỉ khi có thêm nhu cầu). Đầu vào thật → đầu ra dự đoán.

**Mức tận dụng (thang từ nhẹ → năng hơn):**
1. **Frozen backbone** (đông lạnh): toàn bộ backbone không học; chỉ classifier cuối học. Rất nhanh, ít overfit, nhưng không điều chỉnh đặc trưng cho bài toán.
2. **Linear probing (dò tuyến tính):** đặc biệt cho "đông lạnh" + chỉ 1 tầng tuyến tính trên đặc trưng. Dùng để *đánh giá chất lượng biểu diễn* (nếu accuracy cao → đặc trưng đã đủ tốt, không cần fine-tune sâu).
3. **Fine-tune một phần:** mở khóa (unfreeze) vài tầng cuối (với lr nhỏ) để đặc trưng "thích ứng" chút, giữ phần lớn pretrained. Cân bằng.
4. **Fine-tune toàn bộ:** cả network học tiếp với lr nhỏ (VD 1e-4). Mạnh nhất nếu đủ dữ liệu; rủi ro "quên" pretrained (catastrophic-forgetting-like) nếu dữ liệu lệch.

Nguyên tắc chung: **bắt đầu nhẹ (frozen/probe), tăng dần khi cần, và fine-tune với lr nhỏ; chọn theo val.**

**Phép so sánh "học nghề chung → học chuyên sâu → hành nghề":** pretrain = học căn bản chung; finetune = chuyên môn; inference = làm việc. **Giới hạn:** "linear probing cao" chỉ nói biểu diễn đặc trưng tốt, chưa chắc đã là cách tận dụng tối ưu thành quả (thực tế có hiện tượng fine-tune cải thiện cả khi probe cao); và "đông lạnh" giữ lâu hơn không có nghĩa luôn tốt nhất.

---

## 6. Từ trực giác đến mô hình

- **Pretraining:** model `M0` trên data lớn (để dành: weights công khai).
- **Fine-tuning:** tiếp tục huấn luyện `M0` (fulmột/chọn phần) trên data nhỏ.
- **Inference:** `model.eval()` không huấn luyện, đọc dự đoán.
- **Frozen/probe:** `requires_grad=False` phần backbone; `new_head` học.

**Thuật toán (chọn mức):**
```
1. Load pretrained, thay head cho số lớp của mình (G4.5).
2. B1: froze mọi backbone; train head; đo val (← linear probing if head linear).
3. Nếu val đủ → dừng (dùng model).
4. Chưa đủ: unfreeze vài tầng cuối, lr nhỏ (1e-4); đo val.
5. Tiếp: fine-tune toàn lr nhỏ (giữ model khỏi quên). Chọn theo val.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Linear probing (root frozen + 1 Linear).**

```python
import torchvision.models as models, torch, torch.nn as nn
model = models.resnet18(weights="DEFAULT")
for p in model.parameters(): p.requires_grad = False      # froze
model.fc = nn.Linear(model.fc.in_features, 10)           # head tuyến tính
opt = torch.optim.SGD(model.fc.parameters(), lr=0.01)    # chỉ head
```

**Bước 2 — Fine-tune một phần (mở vài tầng cuối).**

```python
# sau/g✅: mở lớp cuối
for name, p in model.named_parameters():
    if "layer4" in name or "fc" in name: p.requires_grad = True   # example
opt = torch.optim.Adam([p for p in model.parameters() if p.requires_grad], lr=1e-4)
```

**Bước 3 — Track val để chọn mức.** Sau mỗi mức, đo val (G2.3); không nhìn train.

**Bước 4 — Inference.** `model.eval(); with torch.no_grad(): pred = model(x)` — không cập nhật, dùng thật.

**Lỗi thường gặp:** quên đóng băng khi định freeze; lr quá lớn khi fine-tune (quên pretrained); dùng train để chọn mức (phải val); nhầm "frozen backbone" ≠ "linear probing" (probe = head 1 Linear; frozen có thể head nhiều lớp nhưng để chỉ thị chất lượng tốt hơn dùng probe đơn giản).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** model pretrained, so 3 mức trên val:

| Mức | val accuracy | Ghi chú |
|---|---|---|
| Linear probe (frozen) | 0.82 | đặc trưng tốt |
| Fine-tune layer4 | 0.87 | thích ứng thêm |
| Fine-tune toàn (lr 1e-4) | 0.89 | cần dữ liệu đủ |
| Fine-tune toàn (lr 1e-2—to) | 0.60 | **quên pretrained!** |

**Bước 1 — Đọc:** probe 0.82 → biểu diễn tốt sẵn. Fine-tune augmentation to 0.89 → đáng. lr to → giảm (0.60) → minh hoạ "fine-tune lr lớn hỏng" (tương tự forgetting, G7).

**Bước 2 — Chọn:** nếu tài nguyên hạn chế/dữ liệu ít, dừng ở probe hoặc fine-tune phần (0.82–0.87) đủ tốt; fine-tune toàn chỉ khi thấy cải thiện val (0.89) và chấp được rủi ro.

**Bước 3 — Kết luận:** chọn mức cân giữa val và rủi ro / tài nguyên — có quyết định, không mặc định "to nhất".

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ fine-tune toàn bộ với lr mặc định (như train model nhỏ).

| Phương diện | Fine-tune mù | Khung theo mức (probe→phần→toàn) |
|---|---|---|
| Rủi ro quên | cao (lr to) | thấp (tăng dần) |
| Biết chất lượng đặc trưng | không | probe cho biết |
| Số thử nghiệm | nhiều mò | có hệ thống |
| Đánh đổi | nhanh "thử" | nhiều bước nhưng rẻ mỗi bước |

**Cải thiện:** kiểm soát, ít lãng phí, không mặc định mức nặng. **Đánh đổi:** vài bước nhỏ probe trước — đáng vì fine-tune lr lớn rất tốn/lệch.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát "fine-tune lr to" gây quên (giảm val).

1. Trên subset ảnh, chạy: linear probe → fine-tune layer4 (lr 1e-4) → fine-tune toàn (lr 1e-2 to).
2. So val accuracy 3 mức.
3. Ghi nhận: mức nhẹ ổn, mức to-lr-to có thể tệ → chọn theo val.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + torchvision.

**Cấu trúc:** `scripts/probe_finetune.py` (phác — 3 mức so val):

```python
import torch, torch.nn as nn, torch.nn.functional as F
import torchvision.models as models
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, Subset

tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,0.5,0.5),(0.5,0.5,0.5))])
tr = Subset(datasets.CIFAR10(root="./data", train=True, download=True, transform=tf), range(1500))
te = Subset(datasets.CIFAR10(root="./data", train=False, download=True, transform=tf), range(300))
trl = DataLoader(tr, batch_size=32, shuffle=True)

def build(freeze_all):
    m = models.resnet18(weights="DEFAULT")
    for p in m.parameters(): p.requires_grad = not freeze_all
    m.fc = nn.Linear(m.fc.in_features, 10)
    return m

def eval_acc(m):
    m.eval()
    with torch.no_grad():
        return sum((m(xb).argmax(1)==yb).sum().item() for xb,yb in DataLoader(te,64)) / len(te)

# probe: froze
m = build(True); opt = torch.optim.Adam(m.fc.parameters(), lr=1e-3)
for _ in range(8):
    m.train()
    for xb,yb in trl: opt.zero_grad(); F.cross_entropy(m(xb),yb).backward(); opt.step()
print("probe val:", round(eval_acc(m),3))
# finetune layer4 + head (v.d để ++)
```

**Kết quả dự kiến:** probe đạt accuracy (VD 0.6–0.7 trên 1500 ảnh) chứng minh đặc trưng tốt; fine-tune thêm tăng nhẹ. Đây minh hoạ thang mức.

**Lỗi thường gặp:** CIFAR 32 với resnet18 báo size mismatch (avgpool) — cần resize / hoặc nói rõ; lr quá to làm thụt val; quên đóng băng đúng.

**Chú thích trung thực:** resnet18 kỳ vọng input 224; với CIFAR 32 có thể cần resize hoặc dùng backbone khác — đây là điều chỉnh thực tế (đọc lỗi resnet `avgpool` "output size"). Mã phác: import đủ, và điều chỉnh input theo model.

---

## 12. Đánh giá

**Chỉ số:** phân biệt được frozen / linear probe / fine-tune phần / toàn; chọn mức theo val; biết fine-tune lr nhỏ (kẻo quên); biết probe là "đánh giá chất lượng đặc trưng".

**Vì sao chọn:** đây là "kho vũ khí" để dùng model sẵn có — chiếm phần lớn thực tiễn CV hiện đại, và là nền tuyệt đối cho FL/CL dùng pretrained (G8).

**Chỉ số không thể hiện:** không phủ lr schedule/warmup/early-stop tinh xảo; không bàn "linear probe vs k-NN" — nền. Và với multi/multimodal (G5.8) có riêng chuỗi.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Frozen backbone = linear probing." — Gần nhưng khác: "frozen" là trạng thái không học; "linear probing" là *chỉ thị* (thêm 1 tầng tuyến tính để đo chất lượng biểu diễn). Người ta dùng "linear probe" làm thước đo — không phải mọi frozen model đều gọi là probe.
- **Hiểu lầm 2:** "Fine-tune toàn luôn tốt nhất." — Chưa chắc; lr to + data lệch → quên pretrained, val giảm (G7-like). Thực tế nhiều khi probe/tiệm phần đủ tốt và an toàn hơn.
- **Hiểu lầm 3:** "Đóng băng 'lười biếng' nên kém." — Đôi khi đúng mục tiêu: giữ kiến thức chung, chống overfit, nhanh. Lười-flag tùy tình huống, không code-mặc định.
- **Giới hạn:** "thang mức" là guideline, không công thức; tuỳ miền có thể khác. Trong FL, mỗi client fine-tune theo cách này nhưng phải phối hợp global (G8) — sẽ bàn.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Phân biệt pretraining / fine-tuning / inference.
2. Frozen backbone vs linear probing khác nhau? Vì sao probe là "thước đo đặc trưng"?
3. Fine-tune lr nhỏ có lý do gì (nối forgetting)?

### Luyện tập (sửa đổi / mở rộng)
4. Từ pretrained 1000 lớp, chuyển 5 lớp: sửa đầu ra như thế nào? (dòng `fc`).
5. Thực hiện fine-tune một phần: mở `layer4`+`fc`, đông cứng còn lại — liệt kê bước trong code.
6. So val 3 mức (probe / phần / toàn) trên thí nghiệm — chọn mức và giải thích.

### Thử thách (thiết kế / liên hệ)
7. Trong FL (G6), mỗi client fine-tune pretrained — vì sao "fine-tune toàn + lr lớn" gây client drift mạnh, và xu hướng dùng "frozen/pre-trained + shallow" khi phối hợp?
8. Trong CL (G7), vì sao "bắt đầu từ pretrained" thường giảm catastrophic forgetting — và fine-tune sâu có thể phá ưu đó? Nối với rehearsal/regularization.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Pretrain: học biểu diễn tổng quát trên data lớn. Fine-tune: tiếp tục huấn luyện cho bài toán cụ thể (data nhỏ, lr thấp). Inference: dùng model đã xong (eval) để dự đoán.
2. Frozen = không cập nhật trọng số (num_requires_grad False). Linear probe = chỉ thị: mở head 1 Linear trên đặc trưng đông lạnh để *đo* chất lượng biểu diễn. Probe là "kiểm tra", không nhất thiết là mô hình khai thác cuối.
3. Để không "đá" mạnh kiến thức pretrained; lr lớn → fine-tune làm mô hình quên biểu diễn chung, giảm val (giống catastrophic forgetting trong CL).
4. `model.fc = nn.Linear(model.fc.in_features, 5)` (số lớp của bạn).
5. `for p in model.parameters(): p.requires_grad=False; for name,p in model.named_parameters(): if 'layer4' in name or 'fc' in name: p.requires_grad=True` → optimizer chỉ qua những p.requires_grad.
6. Chọn mức val cao nhất nhưng cân tài nguyên; thường "phần fine-tune lr nhỏ" đủ tốt/an toàn. Nếu probe cao → có thể dừng sớm.
7. Fine-tune toàn + lr lớn → mỗi client "trôi" theo phân phối riêng mạnh (drift) → khó trung bình global. Xu hướng: giữ nhiều pretrained (frozen) / shallow fine-tune / lr thấp để ổn định giữa client — nhưng đánh đổi khả năng thích ứng. G8.
8. Khởi tạo tốt từ pretrained "gần" phân phối chung hơn, nên khi học task mới ít làm hỏng kiến thức cũ hơn từ-scratch. Nhưng fine-tune sâu/lr lớn trên dữ liệu mới có thể đưa model xa → quên (giống "quá khớp" task mới). Rehearsal/regularization giúp giữ. G7.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Vòng đời: **pretrain (học biểu diễn chung) → fine-tune (chuyên mục, lr nhỏ) → inference (dùng)**.
2. Thang tận dụng: **frozen backbone → linear probe → fine-tune một phần → toàn**.
3. **Linear probing** dùng để *đo chất lượng đặc trưng* (head 1 tầng trên đặc trưng đông lạnh).
4. Fine-tune **lr nhỏ** để không "quên" pretrained (nối forgetting, G7).
5. Chọn mức theo **val** + tài nguyên, không mặc định "to nhất". Nền cho pretrained-trong-FL/CL (G8).

**Tự kiểm tra:**
- Phân biệt 3 khâu pretrain/fine-tune/inference.
- Thang mức tận dụng, khi nào dùng mức nào.
- Vì sao linear probe là thước đo đặc trưng?
- Fine-tune lr nhỏ vì sao?
- Liên hệ fading với FL client drift và CL forgetting.

---

## 16. Đọc sâu bằng trực giác — giữ tay nghề, thay nhiệm vụ

Một người biết nhận dạng nhiều loại đồ vật có thể học phân loại năm loại linh kiện mà chưa cần học lại mọi kỹ năng nhìn. Linear probing thử đúng giả thuyết ấy: biểu diễn cũ có đủ dùng khi chỉ học đầu phân loại hay không?

| Việc trong đời thực | Trong mô hình | Đại lượng cần nhìn |
|---|---|---|
| Giữ kỹ năng quan sát | Backbone đông lạnh | Tham số không nhận cập nhật gradient |
| Học quy tắc đặt tên mới | Head tuyến tính | Số chiều đặc trưng và số lớp |
| Điều chỉnh cả cách quan sát | Fine-tune backbone | Validation, chi phí và mức thay đổi biểu diễn |

**Đọc công thức:** `z=fθ(x)`, `logits=Wz+b`: “backbone biến ảnh thành đặc trưng z; đầu tuyến tính nhân z với trọng số rồi cộng bias”. Khi probe, θ cố định, còn W và b được học. `requires_grad=False` kiểm soát gradient; `eval()` còn kiểm soát hành vi Dropout/BatchNorm, nên hai việc không đồng nghĩa.

**Tính tay:** backbone có 1.000.000 tham số, xuất vector 64 chiều; bài mới có 5 lớp. Head có `5×64+5=325` tham số. Probe chỉ học 325 trên tổng 1.000.325, khoảng 0.0325%. Con số này nói lượng tham số được cập nhật, không bảo đảm thời gian hoặc bộ nhớ giảm đúng cùng tỉ lệ, vì vẫn phải tính đặc trưng nếu chưa cache.

**Phản ví dụ:** thấy probe đạt 80% rồi kết luận fine-tune là lãng phí. Nếu miền mới khác mạnh (ảnh y tế so với ảnh tự nhiên), đặc trưng pretrained có thể bỏ mất tín hiệu quan trọng; khi đó fine-tune hoặc huấn luyện lại backbone có thể cần thiết. Ngược lại, probe thấp trên một head chưa tuning cũng chưa chứng minh backbone vô dụng.

**Giới hạn:** biểu diễn pretrained có thể bỏ mất tín hiệu quan trọng của miền mới. Probe thấp không chứng minh backbone vô dụng; fine-tune có thể mở ra khả năng mới. Ngược lại, accuracy validation tăng sau nhiều lần chọn cấu hình có thể do thích nghi quá mức với validation; test vẫn cần giữ riêng.

:::interactive probe
:::

:::quiz
Backbone xuất 64 đặc trưng và head tuyến tính có bias cho 5 lớp. Head có bao nhiêu tham số?
A. 64
B. 320
C. 325
Đáp án: C
Giải thích: Có 5×64 trọng số và 5 bias, tổng cộng 325. Không cộng các tham số backbone vào số tham số của head.
:::

:::goi-y
Mỗi lớp cần 64 hệ số và một bias. Hãy đếm cho một lớp rồi nhân năm.
:::

:::loi-giai
`5×(64+1)=325`. Muốn so probe với fine-tune, giữ cùng split và tiêu chí chọn cấu hình; báo riêng tham số trainable, bộ nhớ đo được và thời gian, thay vì suy mọi chi phí từ 325.
:::
