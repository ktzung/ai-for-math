# Chương 4.4–4.5 — Kiến trúc CNN, augmentation và transfer learning (Giai đoạn 4)

> **Câu hỏi trọng tâm:** *CNN hiện đại được xây theo mô-típ nào, và làm sao tận dụng mô hình đã huấn luyện sẵn (transfer learning) thay vì train từ đầu?*

---

## 1. Vị trí trong lộ trình

Đã hiểu conv/pool (G4.1–3). Giờ ghép thành **kiến trúc CNN** (concept: LeNet→ResNet, bottleneck, `batch norm`, skip) và **augmentation** + **transfer learning** — hai việc làm cho mạng "học nhanh, ít overfit" và tái dùng mô hình sẵn có. Đây là bước đệm trực tiếp lên G5 (Transformer, pretrained model) và là nền của fine-tuning trong FL/CL (G8).

Ta gộp 4.4 (kiến trúc) và 4.5 (augmentation/transfer) vì chúng cùng trả lời "làm sao có model tốt với hạn chế tài nguyên" — mô-típ kiến trúc + augmentation + tái dùng pretrained.

---

## 2. Kiến thức cần dùng

- CNN conv/pool (G4.3), overfit/regularization (G2.5, G3.6), đánh giá (G2.7).

**Ôn nhanh:** `batch norm` (G3.6) chuẩn hóa; overfit × dữ liệu ít; pretrained = "đã học trên dữ liệu lớn".

---

## 3. Câu chuyện mở đầu

Lan cần model phân loại ảnh thực tế trên máy CPU yếu — không đủ dữ liệu (chỉ vài nghìn ảnh) và không đủ tài nguyên để train một CNN to từ đầu. Cô học được bài học:

1. **Kiến trúc** có mô-típ (conv→norm→relu→pool lặp; skip connection như ResNet giúp train sâu) — không phải chất mạng ớt "cứ nhiều tầng".
2. **Augmentation** (xoay, lật, cắt ngẫu nhiên) tạo "dữ liệu rẻ" — giảm overfit khi ít ảnh.
3. **Transfer learning** — tải một CNN đã train trên ImageNet (data lớn), **giữ backbone** (tầng conv học đặc trưng chung) và chỉ **fine-tune** (tinh chỉnh) phần cuối cho bài toán của cô → đạt accuracy cao với rất ít ảnh/tài nguyên.

Đây là cách người ta thực tế làm CV — hiếm khi train từ đầu.

---

## 4. Câu hỏi trọng tâm

**Kiến trúc CNN (mô-típ, skip, sâu) thế nào, và augmentation + transfer learning giúp học hiệu quả trên dữ liệu/tài nguyên hạn chế ra sao?**

---

## 5. Trực giác

**Kiến trúc CNN** giống "công thức xếp tầng": lặp khối `Conv → (Norm) → ReLU → Pool`, tăng dần số kênh, giảm dần không gian; cuối `Flatten → Linear`. Các biến thể nổi tiếng chỉ là tinh chỉnh khối:
- **LeNet** (nền): conv+pool đơn giản, dành chữ số.
- **VGG**: nhiều khối conv 3×3 nhỏ nhưng sâu, đơn giản.
- **ResNet**: thêm **skip connection** (đường tắt cộng đầu vào khối vào đầu ra) → giúp gradient truyền tốt qua mạng rất sâu — giải quyết việc "thêm tầng nhưng khó train".
- Ý tưởng: "đặc trưng từ chỉ tiết (cạnh) → bộ phận → đối tượng" khi đi sâu.

**Augmentation = "làm giàu dữ liệu rẻ".** Vì mèo vẫn là mèo khi lật, xoay, kéo nhẹ, phơi sáng — ta tạo ra các biến thể từ vài ảnh gốc, giúp model học bất biến và giảm overfit. Lưu ý augmentation phải "hợp lý cho bài toán" (ảnh chữ số thì không lật 180° biến 6 thành 9).

**Transfer learning = "tái dùng người thợ đã luyện".** Backbone (tầng conv) học được rất nhiều mẫu thị giác phổ quát (cạnh, texture, shape) từ ImageNet. Với bài toán nhỏ, thay vì huấn luyện lại từ đầu (tốn dữ liệu), giữ backbone và chỉnh phần cuối. Ba mức độ: **frozen backbone** (đóng băng conv, chỉ học Linear cuối) / **fine-tune một phần** / **fine-tune toàn bộ** với lr nhỏ.

**Phép so sánh "người thợ đã luyện / công thức xếp tầng":** trực quan. **Giới hạn:** transfer chỉ hữu ích nếu pretrained và bài toán đủ "gần" (miền không quá khác); fine-tune cần lr nhỏ để không "quên" kiến thức pretrained (link G5/G7). Đừng nghĩ pretrained luôn thần thánh.

---

## 6. Từ trực giác đến mô hình

- **Kiến trúc:** khối `Conv→BN→ReLU→Pool` lặp; skip trong ResNet.
- **Augmentation:** biến đổi ảnh (flip, rotate, crop) trong `DataLoader` khi train — tạo data mới mỗi epoch.
- **Transfer:** tải pretrained (torchvision), bỏ head, thay Linear cho số lớp của mình; chọn frozen/fine-tune.

**Thuật toán (augmentation + transfer mini):**
```
1. Load pretrained (VD resnet18 pretrained=True).
2. Đóng băng backbone hoặc để train với lr thấp.
3. Thay classifier cuối (num_classes của ta).
4. Thêm augmentation vào train transform (flip, rotate, couleur).
5. Huấn luyện (frozen → chỉ head; hoặc fine-tune lr nhỏ) + đánh giá val (G2.3).
```

---

## 7. Thuật toán từng bước

**Bước 1 — Augmentation (torchvision transform).**

```python
from torchvision import transforms
train_tf = transforms.Compose([
    transforms.RandomHorizontalFlip(),      # lật ngang
    transforms.RandomRotation(10),          # xoay ±10°
    transforms.RandomResizedCrop(32, scale=(0.8, 1.0)),  # crop ngẫu nhiên
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5)),
])
```
- Các `Random*` biến đổi ảnh khác nhau mỗi lần → "dữ liệu mới" mỗi epoch, giảm overfit.
- `Normalize(mean, std)` chuẩn hóa kênh (G1.3/G3.6).
- **Lưu ý:** augmentation thường **chỉ dùng cho train**; test dùng transform đơn giản (chỉ ToTensor+Normalize) để đánh giá công bằng (G4.8).

**Bước 2 — Transfer learning (resnet18).**

```python
import torchvision.models as models
import torch.nn as nn

model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
for p in model.parameters():
    p.requires_grad = False                # đóng băng backbone (frozen)
model.fc = nn.Linear(model.fc.in_features, 10)   # thay head cho 10 lớp
```
- `requires_grad=False` để backbone không cập nhật (frozen) — chỉ Linear cuối học.
- Muốn fine-tune: gỡ freeze một số layer hoặc để quặng (với lr nhỏ).

**Bước 3 — Huấn luyện.** Với frozen, optimizer chỉ đi qua `model.fc.parameters()`; loop như G3.7, đánh giá val.

**Lỗi thường gặp:** quên `requires_grad` khi muốn freeze; input phù hợp đầu vào pretrained (resnet18 chấp 224, CIFAR 32 cần resize hoặc model khác); Overlf: augmentation dùng nhầm vào test; quên Normalize khớp với cách pretrained huấn luyện.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** resnet18 (Linear cuối 1000 từ ImageNet) chuyển sang 10 lớp CIFAR.

**Bước 1 — Freeze backbone:** `requires_grad=False` hết conv; chỉ `fc` (in_features 512 → 10) học.

**Bước 2 — Lý do:** backbone đã có 512-dim đặc trưng tốt; head 10 lớp học "ánh xạ", nhanh + ít overfit.

**Bước 3 — So sánh:** fine-tune toàn bộ với lr=1e-4 (nhỏ) có thể đạt cao hơn (điều chỉnh đặc trưng sát bài toán), nhưng cần dữ liệu đủ; frozen an toàn với dữ liệu ít.

**Bước 4 — Ý tưởng:** "frozen backbone + linear probing" — đánh giá đặc trưng có tốt không (chỉ học 1 Linear) — là kỹ năng G5 dùng khi đánh giá pretrained.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** train CNN từ đầu trên dữ liệu nhỏ.

| Phương diện | Train từ đầu | Transfer learning |
|---|---|---|
| Dữ liệu cần | nhiều (tránh overfit) | ít (backbone đã học) |
| Tài nguyên/time | lớn | nhỏ |
| Accuracy (data ít) | thường thấp | cao hơn |
| Đánh đổi | chỉ kiểm soát hoàn toàn | phụ thuộc pretrained, domain-matched |

**Cải thiện:** học hiệu quả, ít overfit. **Đánh đổi:** phải chọn pretrained phù hợp miền (ảnh y/cây... nếu có model riêng); fine-tune lr nhỏ kẻo "quên" — cần experiment.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát transfer/ augmentation cải thiện.

1. Trên subset CIFAR-10 nhỏ (VD 2000 ảnh): (a) CNN từ đầu, (b) resnet18 frozen+head, (c) (b) + augmentation. So val accuracy.
2. Ghi nhận (c) thường cao nhất — transfer + augmentation kết hợp mạnh.
3. Nếu có GPU dùng nhanh; CPU vẫn chạy được với batch nhỏ.

*(Resnet18 trên CPU 224 ảnh hơi chậm — dùng subset nhỏ + vài epoch, hoặc chọn model nhẹ khác. Mục đích quan sát xu hướng, không phải benchmark.)*

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + torchvision (download weights lần đầu).

**Cấu trúc:** `scripts/transfer_cifar.py` (phác thảo — bạn hoàn thiện val/test):

```python
import torch, torch.nn as nn, torch.nn.functional as F
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, Subset

# train có augmentation; test không có (quan trọng)
train_tf = transforms.Compose([transforms.RandomHorizontalFlip(),
                               transforms.RandomRotation(10),
                               transforms.ToTensor(),
                               transforms.Normalize((0.5,0.5,0.5),(0.5,0.5,0.5))])
test_tf = transforms.Compose([transforms.ToTensor(),
                              transforms.Normalize((0.5,0.5,0.5),(0.5,0.5,0.5))])

base = datasets.CIFAR10(root="./data", train=True, download=True)
train = datasets.CIFAR10(root="./data", train=True,  download=True, transform=train_tf)
train = Subset(train, range(2000))
test  = Subset(datasets.CIFAR10(root="./data", train=False, download=True, transform=test_tf), range(500))
tr = DataLoader(train, batch_size=32, shuffle=True)
te = DataLoader(test, batch_size=32)

model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
for p in model.parameters(): p.requires_grad = False
model.fc = nn.Linear(model.fc.in_features, 10)
opt = torch.optim.Adam(model.fc.parameters(), lr=1e-3)

for _ in range(3):
    model.train()
    for xb, yb in tr:
        opt.zero_grad(); F.cross_entropy(model(xb), yb).backward(); opt.step()
model.eval()
acc = sum((model(xb).argmax(1)==yb).sum().item() for xb,yb in te)/500
print("transfer acc:", round(acc, 3))
```

**Kết quả dự kiến:** accuracy khá cao (VD 0.5–0.7) trên 2000 ảnh và 3 epoch — cho thấy transfer mạnh; so với train-from-scratch yếu. (Số tùy; xu hướng rõ.)

**Lỗi thường gặp:** CIFAR 32×32 cần resnet chấp được (torchvision resnet có thể lỗi với 32×32 "avgpool" nếu quá nhỏ — nếu lỗi, upsample về 224 hoặc dùng `models.resnet18` với `num_classes` và resize); download weights lỗi nếu không mạng; quên `requires_grad` khi <> freeze.

**Chú thích trung thực:** resnet18 pretrained kỳ vọng input 224; chạy CIFAR 32 có thể báo "matrix size incompatible" → cần resize ảnh về 224 hoặc dùng backbone khác phù hợp. Đây là điều chỉnh cần làm thực tế — đọc kỹ thông báo.

---

## 12. Đánh giá

**Chỉ số:** transfer đạt val accuracy cao hơn rõ so với train-from-scratch (trên dữ liệu ít); augmentation cải thiện thêm; biết dùng frozen vs fine-tune; biết augmentation chỉ cho train.

**Vì sao chọn:** đây là "phương pháp thực chiến" của CV — transfer + augmentation quyết định khả năng làm được việc với tài nguyên hạn chế (đúng tinh thần lộ trình CPU).

**Chỉ số không thể hiện:** không chứng minh pretrained tối ưu cho mọi miền; độ transfer phụ thuộc miền. Đây là nền kỹ thuật, chi tiết (linear probing vs fine-tune) ở G5.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Pretrained là phép màu luôn thắng." — Không; nếu miền quá khác (X-quang vs ImageNet chụp thường), transfer yếu hơn. Chọn đúng pretrained theo miền (nếu có).
- **Hiểu lầm 2:** "Fine-tune toàn lr cao là tốt." — Sai; lr cao làm "quên" kiến thức pretrained (G5/G7), hỏng. Fine-tune nên lr nhỏ (1e-4) hoặc sử dụng warmup.
- **Hiểu lầm 3:** "Augmentation vô hại, thêm càng nhiều càng tốt." — Sai; augmentation không hợp lý bài toán (lật chữ số 6→9) phản tác dụng, làm sai nhãn. Chọn augmentation theo miền.
- **Giới hạn:** transfer/augmentation vẫn là "kỹ thuật bổ trợ"; nền tảng (data, đánh giá, chống overfit) vẫn là cốt. Và mức "frozen backbone/linear probing/fine-tune" — chủ đề chi tiết G5.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Mô-típ kiến trúc CNN cơ bản (khối lặp, lượng kênh, không gian) là gì?
2. skip connection trong ResNet có tác dụng gì?
3. Augmentation làm gì và vì sao chỉ dùng cho train?

### Luyện tập (sửa đổi / mở rộng)
4. Chuyển pretrained 1000 lớp → 3 lớp động vật: sửa dòng `model.fc` như thế nào?
5. Thử lật cột augmentation để xoay không giới hạn (±90,180) trên chữ số — nhận xét nhãn có thể sai và nên giới hạn.

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), transfer learning có thể dùng làm "khởi đầu mô hình toàn cục" (pretrained backbone) để client học nhanh — phân tích lợi ích và rủi ro khi các client khác nhau fine-tune pretrained (nối G8).
7. Trong CL (G7), "augmentation/rehearsal" giữ mẫu cũ liên hệ how giảm forgetting? (gợi ý: replay mẫu cũ tương tự "augmentation" cho dữ liệu cũ để mô hình nhớ.) 

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Khối `Conv→(BN)→ReLU→Pool` lặp; kênh tăng dần, không gian giảm; cuối Flatten→Linear. Các mô-típ như ResNet thêm skip.
2. Skip/identity cho phép gradient truyền qua mạng sâu (tránh vanishing) và mạng có thể "học là mình giữ nguyên" khi không cần đổi — giúp train sâu hơn (G3.6/G4).
3. Tạo nhiều biến thể từ vài ảnh → học khả biến + giảm overfit. Chỉ dùng lúc huấn luyện; test phải đánh giá thật (không "thấy bệnh qua augmentation").
4. `model.fc = nn.Linear(model.fc.in_features, 3)`.
5. Lật/xoay 180° trên chữ số (6↔9, "b"/"d") làm nhãn sai → né tạo dữ liệu nhiễu; chọn augmentation bảo toàn label.
6. Lợi: client không cần nhiều dữ liệu, hội tụ nhanh. Rủi ro: client fine-tune pretrained theo miền riêng lệch nhau (drift), khó trung bình; nếu pretrained "gần" client A hơn B → không công bằng. Chọn giữ backbone frozen hoặc fine-tune lr nhỏ, đồng bộ client (G8).
7. Rehearsal = giữ một số mẫu cũ để "tập lại" khi học task mới — giống "augmentation" cho dữ liệu cũ, giúp model nhớ (giảm forgetting). Liên hệ G7: rehearsal và regularization là 2 họ phương pháp CL.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Kiến trúc CNN = lặp khối (Conv→Norm→ReLU→Pool), tăng kênh/giaie không gian; skip (ResNet) giúp train sâu.
2. **Augmentation** tạo biến thể dữ liệu → giảm overfit khi data ít; chỉ cho train (miền hợp lý).
3. **Transfer learning**: giữ backbone pretrained, thay head cho số lớp của mình.
4. Ba mức: **frozen backbone / fine-tune phần / fine-tune toàn** (lr nhỏ khi fine-tune kẻo quên).
5. Transfer + augmentation là cách thực chiến với tài nguyên hạn chế (CPU), và là nền cho pretrained trong FL/CL (G5/G8).

**Tự kiểm tra:**
- Mô-típ CNN cơ bản + vai trò skip?
- Augmentation dùng khi nào, và sao không dùng cho test?
- Frozen vs fine-tune khác nhau?
- Vì sao fine-tune pretrained nên lr nhỏ?

---

## 16. Đọc sâu bằng trực giác — học mượn mắt của người đi trước

Người mới học nấu ăn không cần phát minh lại cách cầm dao. Họ dùng kỹ năng cơ bản đã có, chỉ học thêm công thức mới. Transfer learning cũng vậy: mạng pretrained đã học cạnh, màu, hình khối từ dữ liệu lớn; ta giữ phần "mắt" đó và chỉ dạy phần quyết định cho bài toán mới.

| Chế độ | Phần được cập nhật | Khi nào dùng |
|---|---|---|
| Freeze | Chỉ lớp đầu ra | Dữ liệu mới ít |
| Fine-tune toàn bộ | Mọi trọng số, lr nhỏ | Dữ liệu mới vừa phải |
| Chỉ train từ đầu | Toàn bộ, lr thường | Dữ liệu lớn, miền rất khác |

**Đọc thành lời:** augmentation tạo biến thể của ảnh train — lật, cắt, đổi sáng — để mô hình không học thuộc vị trí hay ánh sáng cụ thể. Transfer learning khởi tạo trọng số từ bài toán nguồn rồi thay lớp cuối cho số lớp mới. Điều dễ đọc sai là tăng cường cả tập test; test phải giữ nguyên phân phối thật để phép đo có nghĩa.

**Tính tay:** 1000 ảnh chia 80/10/10 cho 800 train, 100 validation, 100 test. Nếu mỗi ảnh train tạo 5 biến thể, mỗi epoch mô hình thấy 4000 lượt ảnh, nhưng chỉ có 800 ảnh gốc. Với mạng 5 triệu tham số và lớp đầu ra `512→10`, phần đầu ra có `512×10+10=5130` tham số, khoảng `0,1%` tổng số; freeze phần còn lại là một cách học rất tiết kiệm.

**Phản ví dụ:** lật dọc ảnh chữ số vì "augmentation nào cũng tốt". Số 6 thành 9, nhãn sai và mô hình học nhiễu. Tương tự, fine-tune toàn bộ với learning rate lớn có thể phá các đặc trưng pretrained trong vài bước; lr nhỏ giữ phần hữu ích và chỉ tinh chỉnh.

**Giới hạn:** pretrained không miễn nhiễm với khác biệt miền: ảnh y tế, ảnh vệ tinh hay ảnh hồng ngoại có thể khác xa ảnh tự nhiên. Freeze quá nhiều khi miền mới rất khác có thể underfit; fine-tune quá nhiều khi dữ liệu ít có thể overfit. Và augmentation chỉ là giả định bất biến — nếu phép biến đổi làm đổi nhãn, nó tạo dữ liệu sai.

:::interactive augment
:::

:::quiz
Augmentation nên được áp dụng cho tập nào?
A. Chỉ tập train
B. Cả train và test
C. Chỉ tập test
Đáp án: A
Giải thích: augmentation giúp mô hình học bất biến trên dữ liệu huấn luyện; test phải giữ nguyên để đo đúng phân phối đánh giá. Áp dụng cho test làm phép đo khó diễn giải và có thể che yếu kém.
:::

**Tự thử thêm:** có 5000 ảnh, chia 90/10. Mỗi ảnh train tạo 4 biến thể. Tính số lượt ảnh train mỗi epoch và số ảnh test. Sau đó giải thích vì sao số lượt tăng không đồng nghĩa lượng thông tin tăng gấp bốn.

:::goi-y
Train có `0,9×5000=4500` ảnh; nhân với 4 biến thể. Test là `0,1×5000`. Các biến thể xuất phát từ cùng ảnh gốc nên không phải mẫu độc lập hoàn toàn.
:::

:::loi-giai
Train có 4500 ảnh, tạo `4500×4=18.000` lượt mỗi epoch; test có 500 ảnh. Bốn biến thể chia sẻ nội dung gốc, giúp mô hình bớt phụ thuộc vị trí/ánh sáng nhưng không bổ sung 4500 mẫu độc lập mới.
:::