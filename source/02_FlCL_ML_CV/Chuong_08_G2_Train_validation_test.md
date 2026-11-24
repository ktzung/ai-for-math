# Chương 2.3 — Tập train, validation và test (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Tại sao phải chia dữ liệu thành 3 phần, và sự khác nhau giữa validation và test là gì?*

---

## 1. Vị trí trong lộ trình

G2.2 đã dựng "đặc trưng + nhãn + loss". Giờ đến một nguyên tắc tổ chức quan trọng bậc nhất: **chia dữ liệu thành train / validation / test**. Sai lầm ở đây là *rò rỉ dữ liệu* (data leakage) — khiến con số đánh giá sai lệch nghiêm trọng và thí nghiệm không tin được.

Nó **nối** từ 1.2 (đã giới thiệu sơ train/test) và **chuẩn bị** cho mọi thí nghiệm: G2.5 (overfit cần val), G2.7 (chỉ số), G4 (blém), G6 (chia client trong FL), G7 (chia task trong CL — thay vì chia mẫu, chia theo thời gian!).

---

## 2. Kiến thức cần dùng

- Nạp dữ liệu, NumPy (G1).
- "Đặc trưng/nhãn/loss" (G2.2).

**Ôn nhanh:** "overfit" = model thuộc lòng tập train, sai dữ liệu mới (Chương 8 sách toán). Để phát hiện overfit, ta cần dữ liệu *chưa từng thấy* — đó là lý do chia train/test.

---

## 3. Câu chuyện mở đầu

Lan huấn luyện model mèo/chó. Model "đạt 99% accuracy". Cô vui vẻ báo cho sếp. Ngày hôm sau, khi kiểm tra trên ảnh thật mới, model chỉ đúng ~70%.

Chuyện gì xảy ra? Cô đã vô tình dùng *toàn bộ dữ liệu* để huấn luyện, và đo accuracy ngay trên dữ liệu đó. Model chỉ là "học thuộc lòng" — nó trả 99% trên dữ liệu cũ (overfit), nhưng thất bại ở ảnh mới. Nếu cô chia **test riêng** (dữ liệu chưa từng thấy) từ đầu, cô đã không bị "99%" đánh lừa.

Cô cũng học thêm: khi cô *tinh chỉnh siêu tham số* (như tăng learning rate), dùng lại chính tập test nhiều lần thì cũng dần "rò rỉ" — nên cô cần một **validation set** trung gian để tinh chỉnh, giữ test "sạch" cho lần đánh giá cuối.

---

## 4. Câu hỏi trọng tâm

**Ba tập dữ liệu (train/val/test) dùng cho việc gì, và làm sao tránh 'rò rỉ' làm sai lệch đánh giá?**

---

## 5. Trực giác

Hình dung **luyện thi đại học**:
- **Train** = học bài (ôn tập trên đề cũ). Dùng để huấn luyện mô hình.
- **Validation** = thi thử giữa kỳ để *điều chỉnh cách học* (chọn bộ siêu tham số). Dùng để so sánh/tinh chỉnh — nhưng không phải "đề chính thức".
- **Test** = kỳ thi chính thức cuối kỳ, *không được nhìn trước*, đánh giá kết quả thật một lần cuối.

**Vì sao không dùng chung một tập?** Nếu vừa học vừa chấm trên cùng đề, điểm sẽ ảo (học thuộc lòng). Nếu "thi chính thức" nhiều lần để sửa cách học, cũng dần "nhớ" đề. Tách ra đảm bảo **test là phép đo khách quan cuối cùng**, chưa bao giờ "ướm" vào việc chọn model/hyperparameter.

**Phép so sánh "thi cử":** trực quan. **Giới hạn:** trong ML thật, ranh giới không luôn đơn giản như kỳ thi cuối cấp — việc "rò rỉ" có khi tinh vi (dữ liệu trùng lặp, chia sai theo thời gian). Nhưng nguyên tắc lõi — *phép đo cuối cùng phải trên dữ liệu chưa dụng vào việc chọn model* — là bất biến.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** tập mẫu `(x, y)`.
- **Model:** hàm `f(x;θ)`.
- **Ba phần và vai trò:**
  - `train`: huấn luyện `θ` (giảm loss, G1.4/G2.2).
  - `validation`: chọn siêu tham số / so sánh model / phát hiện overfit — *không cập nhật θ* nhưng dùng để quyết định.
  - `test`: đánh giá cuối cùng, một lần, trên dữ liệu chưa từng dùng vào lựa chọn nào.
- **Mục tiêu:** test cho con số trung thực về khả năng tổng quát.

**Thuật toán (quy trình 3 tập):**
```
1. Chia ngẫu nhiên: train (70%) / val (15%) / test (15%) — hoặc theo tỉ lệ hợp lý.
2. Huấn luyện trên train.
3. Theo dõi loss trên val trong quá trình huấn luyện → chọn thời điểm dừng/hyperparameter.
4. Sau khi chọn xong model+hyperparameter, đánh giá một lần trên test.
```

**Lưu ý quan trọng:** chia theo *thời gian* (dữ liệu chuỗi) hoặc theo *client/nhiệm vụ* (FL/CL) khác với chia ngẫu nhiên — mục 13 và các chương FL/CL sẽ làm rõ.

---

## 7. Thuật toán từng bước

**Bước 1 — Chia dữ liệu (NumPy/PyTorch).**

```python
import torch
from torch.utils.data import random_split

n = 10_000
# giả sử dataset đã nạp (G1.4)
train, val, test = random_split(dataset, [7000, 1500, 1500])
```

- `random_split` chia ngẫu nhiên theo số lượng. Tỉ lệ 70/15/15 là khởi đầu hợp lý; dataset nhỏ cần val/to hơn.

**Bước 2 — Vòng huấn luyện đo val loss (không chỉ test).**

```python
for epoch in range(n_epochs):
    train_loss = train_one_epoch(model, trainset)   # (hàm ta viết, G1.4)
    val_loss   = evaluate(model, valset)            # chỉ forward, không cập nhật
    print(epoch, train_loss, val_loss)
```

- Mỗi epoch đo `val_loss`. Khi `val_loss` bắt đầu tăng dù `train_loss` giảm → báo hiệu **overfit** — cần dừng sớm / điều chỉnh.

**Bước 3 — Đánh giá cuối trên test, MỘT LẦN.**

```python
test_metric = evaluate(model, testset)   # chỉ sau khi đã chốt mọi thứ
print("FINAL test:", test_metric)
```

- Không quay lại chỉnh hyperparameter sau khi đã nhìn test. Nếu làm vậy, bạn dần "rò" test vào quyết định.

**Lỗi thường gặp:**
- Dùng test để chọn hyperparameter nhiều lần → test "rò" → điểm không trung thực.
- Quên shuffle khi chia chuỗi thời gian → dữ liệu quá khứ/qua gần lẫn nhau.
- Đánh giá model ngay trên train (lỗi "99%" của Lan) → overfit không bị phát hiện.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** dataset 100 ảnh, chia 70/15/15 → 70 train, 15 val, 15 test.

**Bước 1 — Đếm:** `train=70, val=15, test=15; tổng=100`.

**Bước 2 — Minh họa overfit phát hiện qua val:**
- Epoch 5: train_loss 4.2, val_loss 4.5 (đều giảm)
- Epoch 15: train_loss 1.0, val_loss 1.6 (còn tốt)
- Epoch 25: train_loss 0.2, val_loss 2.9 (**val tăng, train giảm → overfit**)

**Bước 3 — Diễn giải:** từ epoch ~15 trở đi, model "thuộc" train nhưng sai dữ liệu mới. Nếu chỉ nhìn train_loss, ta tưởng càng huấn luyện càng tốt; nhìn val_loss mới biết phải **dừng sớm** (~epoch 15) hoặc giảm phức tạp/siêu tham số.

**Bước 4 — Test cuối:** chốt model ở epoch tốt nhất (theo val), đánh giá test 1 lần → con số trung thực về ảnh chưa từng thấy.

**Thử tương tác:** đổi tỉ lệ train và validation trên 1.000 mẫu; phần còn lại là test. Điều chỉnh đến khi tổng hai thanh dưới 100% để không còn test âm.

:::interactive split
:::

**Lưu ý:** 15 mẫu test rất ít (độ tin cậy thấp); dataset thật cần test đủ lớn. Ở FL/CL, thậm chí test thường tách riêng theo *client/nhiệm vụ chưa gặp*, không chỉ theo mẫu.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** chỉ chia train/test (không có val), dùng test để tinh chỉnh siêu tham số.

| Phương diện | Chỉ train/test | Có thêm validation |
|---|---|---|
| Tinh chỉnh hyperparameter | dùng test → test "dính" | dùng val, test sạch |
| Phát hiện overfit sớm | muộn (khi test hụt) | sớm qua val loss |
| Trung thực điểm cuối | giảm dần qua mỗi lần dùng test | giữ test riêng |
| Đánh đổi | ít bước hơn | cần dành thêm dữ liệu cho val |

**Cải thiện:** test trung thực, phát hiện overfit sớm. **Đánh đổi:** mất một phần dữ liệu cho val (đáng để đổi lấy độ tin cậy).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát overfit xuất hiện trong val loss.

Dùng model nhỏ (G1.4) trên dữ liệu nhỏ (để dễ overfit):
1. Chia 70/15/15.
2. Huấn luyện nhiều epoch, in train_loss và val_loss mỗi epoch.
3. Ghi epoch mà val_loss bắt đầu tăng → đó là điểm cần dừng sớm.

**Kết quả mong đợi:** train_loss ↓ mãi, val_loss ↓ rồi ↑ — khoảnh khắc "val bắt đầu tăng" là dấu overfit. Đây là thí nghiệm cho bạn "nhìn thấy" overfit trực tiếp trong dữ liệu của mình.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + dữ liệu nhỏ (dùng subset của CIFAR-10, G1.2).

**Cấu trúc:** `scripts/train_val_test.py` (từ các chương G1, G1.4):

```python
import torch
from torch.utils.data import random_split, Subset
from torchvision import datasets, transforms

transform = transforms.ToTensor()
ds = Subset(datasets.CIFAR10(root="./data", train=True, download=True, transform=transform), range(300))

train, val, test = random_split(ds, [210, 45, 45])   # 300 bản → 70/15/15

model = torch.nn.Linear(3*32*32, 10)
loss_fn = torch.nn.CrossEntropyLoss()
opt = torch.optim.SGD(model.parameters(), lr=0.01)

def flat(t):
    return t.reshape(t.size(0), -1)

for epoch in range(30):
    model.train()
    for x, y in torch.utils.data.DataLoader(train, batch_size=32):
        opt.zero_grad()
        loss = loss_fn(model(flat(x)), y)
        loss.backward(); opt.step()

    def eval_loss(dl):
        model.eval(); tot=0; cnt=0
        with torch.no_grad():
            for x, y in dl:
                tot += (model(flat(x)).argmax(1) == y).sum().item(); cnt += y.size(0)
        return tot/cnt
    print(epoch, "val_acc", round(eval_loss(DataLoader(val,64)), 3))
```

*(Đây là mẫu để thấy cấu trúc; đơn giản hóa một vài chi tiết — quan trọng là 3 phần và đo val.)*

**Cách chạy:** `python scripts/train_val_test.py`. **Kết quả dự kiến:** val_acc tăng rồi có thể bão hòa/giảm (overfit) — quan sát điểm đó.

**Lỗi thường gặp:** quên `model.eval()`/`torch.no_grad()` khi eval → sai kết quả; đổi chiều tensor khi `Linear`; tổng mẫu không đủ cho tỉ lệ.

**Chú thích trung thực:** mã mẫu được đơn giản để minh họa khung (70/15/15, đo val) — chạy được, nhưng chi tiết API có thể cần chỉnh theo version; mục tiêu là hiểu cấu trúc 3 tập, không phải tối ưu accuracy.

---

## 12. Đánh giá

**Chỉ số:** biết cách chia 70/15/15 đúng; đo val_loss/val_acc mỗi epoch; chỉ đánh giá test **một lần sau khi chốt**; nhận diện được overfit qua val_loss tăng.

**Vì sao chọn:** những chỉ số này phản ánh đúng *quy trình* trung thực — thứ quyết định độ tin cậy của mọi con số model.

**Chỉ số không thể hiện:** không đo hiệu năng tối ưu; không đánh giá chọn tỉ lệ chia nào tốt nhất (phụ thuộc dataset). Chương này đảm bảo *quy trình đo đúng*, không tối ưu *con số*.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Validation và test giống nhau." — Không. Val dùng để *chọn* (hyperparameter, model), test dùng để *đánh giá cuối* một lần. Dùng test để chọn = làm bẩn test.
- **Hiểu lầm 2:** "Chia ngẫu nhiên luôn đúng." — Chỉ khi dữ liệu i.i.d. (cùng phân phối). Nếu dữ liệu theo thời gian/thứ tự, phải chia theo thời gian (tránh quá khứ-vị lai lẫn nhau). Nếu FL/CL, càng không i.i.d. — phải chia theo client/nhiệm vụ (G6/G7).
- **Hiểu lầm 3:** "Model 'tốt trên val' sẽ tốt trên test." — Thường gần, nhưng không đảm bảo. Val vẫn có thể hơi khác test (nếu phân phối lệch). Tỉ lệ nhỏ lệch có thể khác nhau. Test là "phép đo chốt", không phải chuyện chắc chắn 100% khớp val.
- **Giới hạn:** trong môi trường dữ liệu thay đổi theo thời gian (continual, G7), tập test tĩnh chỉ đánh giá *một điểm*, còn CL cần đánh giá *quá trình* (khả năng học mới + giữ cũ) — chia/test khác hẳn, sẽ nói ở G7.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Kể đúng vai trò train / validation / test.
2. Vì sao việc "dùng test để chọn learning rate" là sai?
3. Vẽ ký họa: đường train_loss giảm nhưng val_loss tăng — gọi tên hiện tượng.

### Luyện tập (sửa đổi / mở rộng)
4. Dataset 1.000 mẫu, chia 70/20/10: tính số mẫu mỗi tập.
5. Với bài 4, nếu bạn sửa model (thêm tầng) để thử: bạn dùng tập nào để so sánh model? Và tập nào để công bố con số cuối?

### Thử thách (thiết kế / liên hệ)
6. Dữ liệu ảnh thu thập theo ngày (ngày 1 → ngày 30). Giải thích vì sao chia ngẫu nhiên có thể "rò rỉ" và cách chia đúng theo thời gian.
7. Trong FL (G6), "client" đóng vai trò tương tự "invalid/test" chỗ nào? Giải thích: nếu các client có phân phối khác nhau (non-IID), chỉ số test nên được tính trên client nào để trung thực?

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Train: huấn luyện tham số. Validation: chọn hyperparameter/phát hiện overfit. Test: đánh giá cuối 1 lần, chưa từng dụng để chọn.
2. Vì mỗi lần dùng test để chọn, bạn "rò thông tin" vào quyết định → test không còn khách quan; kết quả cuối bị lạc quan.
3. Overfit: model khớp train nhưng sai dữ liệu mới.
4. train 700, val 200, test 100.
5. So sánh model dùng **validation**. Con số **test** dùng để công bố, sau khi chốt model (một lần).
6. Chia ngẫu nhiên có thể để ảnh ngày sau vào train và ngày trước vào test — nhưng model "thấy" phân phối ngày sau → rò rỉ thời gian. Đúng: đặt các ngày đầu vào train, ngày cuối vào test (chia theo mốc thời gian).
7. Trong FL, "client chưa gặp" tương tự test — model được huấn luyện/chọn trên các client train/val, rồi đánh giá trên client chưa gặp. Với non-IID, phải đánh giá trên từng nhóm client đại diện và báo cáo phân tán (chứ không chỉ trung bình), vì một client có thể rất yếu. G6.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Chia dữ liệu thành **train / validation / test**; mỗi tập một vai trò riêng.
2. **Validation** dùng để chọn hyperparameter/phát hiện overfit; **test** dùng để **đánh giá cuối một lần**.
3. Đừng dùng test để tinh chỉnh — đó là **rò rỉ** làm con số không trung thực.
4. Theo dõi **val_loss** mỗi epoch để bắt overfit sớm (val tăng, train giảm).
5. Dữ liệu theo thời gian/client không i.i.d. — chia theo mốc thời gian hoặc theo client (sẽ gặp lại ở FL/CL).

**Tự kiểm tra:**
- Điểm khác chính giữa val và test là gì?
- Vì sao test phải "chưa dùng để chọn"?
- Vẽ/đọc dấu hiệu overfit trên đường train/val loss.
- Khi dữ liệu theo thời gian, bạn chia thế nào?

---

## 16. Đọc sâu bằng trực giác — test là phong bì niêm phong

Một lớp học muốn biết đề thi thử có tốt không. Nếu giáo viên vừa dạy vừa cho học sinh xem đáp án đề thi thử, điểm cao không còn chứng minh năng lực. Tập test có cùng vai trò: nó chỉ đáng tin khi chưa ai dùng nó để ra quyết định.

| Tập | Dùng để | Không được dùng để |
|---|---|---|
| Train | Cập nhật trọng số | Đo hiệu năng cuối cùng |
| Validation | Chọn siêu tham số, dừng sớm | Báo cáo như test độc lập |
| Test | Ước lượng một lần khi kết thúc | Chọn mô hình rồi báo lại điểm |

**Đọc thành lời:** tỉ lệ 70/15/15 nghĩa là lấy 70% mẫu để học, 15% để chọn cấu hình, 15% để kiểm tra lần cuối. Với `N` mẫu, số mẫu test là `0,15N`. Điều dễ đọc sai là nghĩ "đã tách test" là đủ; nếu mỗi lần đổi mô hình lại nhìn test, test đã trở thành validation thứ hai.

**Tính tay:** với 1000 mẫu và tỉ lệ 70/15/15, train có `700`, validation `150`, test `150`. Nếu cần 10% test, test còn `100` và phần còn lại phải chia lại giữa train/validation. Số mẫu mỗi lớp cũng phải được kiểm: chia ngẫu nhiên 1000 mẫu có thể để lớp hiếm rơi gần hết vào train.

**Phản ví dụ:** thử 20 cấu hình, mỗi cấu hình xem accuracy test, rồi chọn cấu hình cao nhất và báo điểm đó. Con số cuối là cực đại của 20 ước lượng nhiễu, nên thường lạc quan hơn năng lực thật. Cách đúng là chọn trên validation, chỉ chạm test một lần sau khi đã chốt.

**Giới hạn:** test độc lập vẫn chỉ đại diện cho phân phối dữ liệu đã lấy. Nếu bệnh viện, thời điểm hay thiết bị thay đổi, điểm test cũ không bảo đảm. Với dữ liệu nhỏ, một lần chia có thể may rủi; cross-validation giúp ổn định hơn nhưng tốn tính toán và vẫn không thay thế được dữ liệu mới.

:::quiz
Chia 1000 mẫu theo tỉ lệ 70/15/15 thì tập test có bao nhiêu mẫu?
A. 150
B. 300
C. 700
Đáp án: A
Giải thích: `0,15×1000=150`. Chọn C là số mẫu train; chọn B là gộp validation với test.
:::

**Tự thử thêm:** có 20.000 mẫu, chia 80/10/10. Tính số mẫu mỗi tập. Sau đó giải thích vì sao dùng test để chọn giữa 5 mô hình rồi báo điểm cao nhất lại không còn là ước lượng khách quan.

:::goi-y
Tính `0,8×20.000`, `0,1×20.000`. Với 5 mô hình, mỗi lần xem test là một lần dùng thông tin từ test để ra quyết định.
:::

:::loi-giai
Train `16.000`, validation `2.000`, test `2.000`. Khi chọn mô hình theo test, điểm được báo là mô hình tốt nhất trong 5 lần thử, không phải một ước lượng trung lập; test đã tham gia vào quá trình chọn nên điểm bị lạc quan.
:::