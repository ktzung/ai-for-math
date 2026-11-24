# Chương 5.7–5.9 — Mô hình nền tảng là gì (và không phải gì), mô hình đa phương thức & giới hạn (Giai đoạn 5)

> **Câu hỏi trọng tâm:** *"Mô hình nền tảng" khác gì một mô hình lớn bất kỳ — và dù mạnh đến đâu, nó có những giới hạn nào mà bạn phải luôn nhớ?*

---

## 1. Vị trí trong lộ trình

Đã hiểu Transformer, pretrain/fine-tune (G5.1–6). Giờ đặt thuật ngữ **mô hình nền tảng (foundation model)** vào đúng khung: nó *là gì* và *không phải gì* (chống phóng đại — yêu cầu ràng buộc của prompt), dạng **đa phương thức (multimodal)**, và **các giới hạn** (dữ liệu, tính toán, thiên lệch, độ bền). Đây là "phần tỉnh táo" trước khi bước vào FL/CL (G6–G8) nơi pretrained đóng vai trò lớn.

---

## 2. Kiến thức cần dùng

- ViT, pretrain/fine-tune (G5.1–6), embedding (G5.1).

**Ôn nhanh:** "tiền huấn luyện trên dữ liệu lớn → mô hình đa dụng → chuyên biệt hóa bằng fine-tune" (G5.5).

---

## 3. Câu chuyện mở đầu

Một đồng nghiệp khen: *"Model của tôi 10 tỷ tham số, chắc là một mô hình nền tảng!"* Lan đúng ra hỏi lại: *"Lớn chưa chắc là foundation."* "Foundation model" không chỉ là "model lớn"; nó là một mô hình được **tiền huấn luyện trên dữ liệu rộng và đa dụng**, có thể tái dùng làm **nền** cho nhiều bài toán hạ lưu qua fine-tune/adapt. Kích thước là hệ quả thường thấy, không phải định nghĩa. Cô cũng cần biết: mô hình nền tảng có giới hạn (thiên lệch dữ liệu, độ bền kém ở miền ngoài phạm vi, chi phí), và có cả dạng đa phương thức (ảnh+văn bản+...).

---

## 4. Câu hỏi trọng tâm

**"Mô hình nền tảng" nghĩa là gì (và không phải), mô hình đa phương thức là gì, và các giới hạn chính khi dùng chúng là gì?**

---

## 5. Trực giác

**Foundation model = "nền móng xây nhiều toà nhà".** Thay vì xây toà văn phòng (bài toán A), bệnh viện (bài toán B), nhà ở (bài toán C) mỗi cái nền riêng, bạn đổ chung một **nền móng thật vững** (pretrained trên data rộng), rồi mỗi toà chỉ xây phần trên theo nhu cầu (fine-tune/adapt). Nền móng đó là nền tảng — dùng chung, học từ dữ liệu khổng lồ và đa dạng.

**Định nghĩa "không phải":** *không phải* chỉ là "mô hình lớn". Một mô hình 3 tỷ tham số train riêng cho 1 bài toán không phải foundation theo nghĩa này. Foundation có tính: (1) **tiền huấn luyện quy mô lớn** trên dữ liệu rộng, (2) **đa dụng/đa nhiệm** (nền cho nhiều hạ lưu), (3) **tái dùng qua fine-tune/adapt/probing**. Kích thước là dấu hiệu thường có, không phải tiêu chí.

**Mô hình đa phương thức (multimodal):** kết hợp nhiều loại dữ liệu: ảnh + văn bản + âm thanh. VD: model nhận ảnh lẫn câu hỏi văn bản, trả lời về ảnh đó. Đưa các "modal" (phương thức) vào chung một không gian embedding (G5.1) là mấu chốt — vd CLIP (ảnh–text).

**Giới hạn (cần kể rõ, không che giấu):**
- **Thiên lệch (bias):** dữ liệu huấn luyện thiên lệch → model kế thừa (bệnh nghề nghiệp của học từ data, G2/G8).
- **Độ bền bỉ (robustness):** trên miền ngoài phân phối huấn luyện (OOD) kém — "học trong phạm vi dữ liệu thấy".
- **Chi phí:** tính toán/data lớn — đắt, xanh/kinh phí.
- **Rò rỉ/bảo mật:** có thể "nhớ" dữ liệu huấn luyện (privacy) — đặc biệt liên quan FL.
- **Đánh giá khó:** benchmark chưa đủ; model "giỏi" test chưa chắc thực tế.
- **Không thay thế kiến thức miền** và hiểu biết giới hạn.

**Phép so sánh "nền móng":** chuẩn. **Giới hạn của so sánh:** nền móng "dùng chung" gợiý hard; thực tế fine-tune cần đánh giá kỹ, không phải "chọn model là xong". Và "nền móng vững" không đảm bảo "toà nhà" (bài toán hạ lưu) đúng nếu data/mục tiêu khác.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** dữ liệu đa phương thức / rộng rãi.
- **Model:** Transformer (G5.1–4) pretrain; head/adaptor hạ lưu.
- **Hạ lưu:** fine-tune/linear probe (G5.5–6) trên nhiều task.
- **Đánh giá giới hạn:** test OOD, bias audit, robustness.

**Thuật toán (dùng foundation có trách nhiệm):**
```
1. Chọn pretrained phù hợp nhiệm vụ / miền (G5.6).
2. Fine-tune/probe với val (G5.6).
3. Đánh giá không chỉ test i.i.d: kiểm OOD, bias (per-class G4.6), robustness.
4. Ghi giới hạn: chi phí, rủi ro, privacy. Đừng phóng đại khả năng.
```

---

## 7. Thuật toán từng bước (đánh giá trách nhiệm foundation)

**Bước 1 — Phân biệt "foundation" vs "model lớn":** tự hỏi 3 câu: pretrained data rộng? đa dụng? tái dùng nhiều hạ lưu? Nếu chỉ "lớn + 1 task" → chưa chắc.

**Bước 2 — Kiểm bias:** đánh giá accuracy **theo nhóm** (per-class, giới tính/điều kiện — nếu có metadata) — nếu nhóm này kém vượt trội → thiên lệch data/đánh giá. (Giống G4.6 phân tích lỗi theo nhóm.)

**Bước 3 — Kiểm robustness (OOD):** thử trên dữ liệu hơi lệch (nhiễu, sáng khác...): accuracy giảm mạnh → giới hạn độ bền.

**Bước 4 — Ghi chi phí/privacy:** model lớn tốn; có thể nhớ dữ liệu train (data leakage/privacy). Ghi trong báo cáo.

**Lỗi thường gặp:** gọi mọi model lớn là "foundation"; chỉ đánh giá test i.i.d (bỏ qua OOD/bias); phóng đại "model này giải quyết mọi thứ" (không); bỏ đi chi phí rẻ hạ lưu nhưng pretrain đắt.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** ViT pretrained, đánh giá trên test + OOD.

**Bước 1 — Test i.i.d:** accuracy 0.92 — "rất tốt".

**Bước 2 — OOD (sáng/độ nhiễu đổi nhỏ):** accuracy 0.55 → giảm mạnh → robustness kém ngoài phân phối.

**Bước 3 — Per-group:** lớp hiếm recall 0.2 (G4.6) → bias/imbalance.

**Bước 4 — Kết luận:** 0.92 "tốt trên test" nhưng giới hạn rõ (OOD kém, lớp hiếm kém). Báo cáo trung thực phải kèm độ phân tán + OOD + per-class, không tựa 1 con số.

**Bước 5 — Liên hệ FL:** khi đưa pretrained vào FL (G8), mỗi client miền khác (OOD) — cùng bài học về đánh giá miền.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "dùng model to nhất, đánh giá 1 con số accuracy".

| Phương diện | Mặc định "to nhất" | Đánh giá có trách nhiệm |
|---|---|---|
| Hiểu model dùng gì | kích thước | tính foundation (pretrain/đa dụng) |
| Giới hạn | không biết | OOD/bias/chi phí rõ |
| Quyết định | kích thước | theo val + ràng buộc |
| Đánh đổi | dễ chọn | cần thời gian đánh giá đầy đủ |

**Cải thiện:** chọn đúng, báo cáo trung thực. **Đánh đổi:** cần đánh giá thêm (OOD, bias) thay vì tin 1 số.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát degradation OOD/bias.

1. Lấy pretrained model, đo accuracy trên test bình thường.
2. Thêm nhiễu/lệch sáng nhẹ vào test → đo lại (accuracy giảm → OOD kém).
3. Giới hạn chỉ 1 lớp hiếm → per-class recall thấp (G4.6).
4. Ghi nhận: "test accuracy cao ≠ robust/đều". Đây là bài học "đánh giá có trách nhiệm" trước khi FL/CL dùng pretrained.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + torchvision (+ numpy để làm nhiễu).

**Cấu trúc:** `scripts/foundation_limits.py` (phác):

```python
import torch, numpy as np
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# load pretrained (giả sử model phù hợp — dùng 1 model nhỏ cho demo)
model = models.resnet18(weights="DEFAULT")
model.eval()

# dữ liệu test chuẩn và "OOD" (độ sáng lệch)
norm = transforms.Normalize((0.485,0.456,0.406),(0.229,0.224,0.225))
def acc(ds):
    c=0; n=0
    with torch.no_grad():
        for xb,yb in DataLoader(ds,32):
            c += (model(xb).argmax(1)==yb).sum(); n += yb.size(0)
    return c.item()/n

base = datasets.ImageFolder(...)   # cần thay bằng đường dẫn dataset thật; đây là khung minh họa
# (thực tế): so acc(A) test chuẩn vs acc(B) test đổi brightness/nhiễu
```

**Ghi chú thực tế:** với CIFAR/ImageNet đúng, resnet18 kỳ vọng 224; nếu dùng CIFAR phải resize. Mục đích là *đọc OOD/bias* — bạn áp khung phân tích lỗi (G4.8) lên paper model. Đây là phác thảo khung, không phải script chạy ngay cho mọi dữ liệu.

**Chú thích trung thực:** cần chỉnh dữ liệu/input theo model chọn; mục đích minh họa cách kiểm (nhóm a vs b), không phải script "one-shot" phổ quát.

---

## 12. Đánh giá

**Chỉ số:** định nghĩa chính xác "foundation model" (3 tiêu chí); phân biệt với "model lớn"; nhận diện multimodal (embedding chung); kể/kiểm giới hạn (OOD, bias, chi phí, privacy); không phóng đại khi báo cáo.

**Vì sao chọn:** chống "tin thần thánh model lớn" là yêu cầu rõ trong prompt (không khẳng định quá mức), và chuẩn bị cho FL/CL (đánh giá mỗi client miền khác = OOD thực tế).

**Chỉ số không thể hiện:** không bảo hiểm loại bias tinh vi / mọi kỹ thuật adaptation; nền khái niệm + tư duy đánh giá.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Lớn = foundation." — Chưa đủ; phải pretrain rộng + đa dụng + tái dùng (3 tiêu chí). Size là hệ quả, kích thước không phải định nghĩa.
- **Hiểu lầm 2:** "Foundation 'giải quyết mọi thứ'." — Không; nó làm `nền`, hạ lưu vẫn cần fine-tune/adapt + đánh giá. Không tự động đúng miền hẹp.
- **Hiểu lầm 3:** "Accuracy test cao = tốt mọi đường." — Sai; bỏ qua OOD, bias, đánh giá trung thực. Đã nói G4.6/G4.8 — nhấn mạnh lần nữa.
- **Giới hạn:** "foundation model" là thuật ngữ vận động (Bommasani et al.); có tranh luận. Trong khóa, dùng nghĩa trên để đọc tài liệu. FL/CL dùng pretrained (G8) phải lưu ý chi phí tải/đồng bộ — sẽ bàn.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Ba tiêu chí của "foundation model" — và vì sao "lớn chưa đủ".
2. Multimodal model là gì; embedding dùng chung để làm gì?
3. Kể 4 giới hạn của mô hình nền tảng.

### Luyện tập (sửa đổi / mở rộng)
4. Với pretrained model, làm bảng "test accuracy vs OOD accuracy" ở thí nghiệm — nhận xét.
5. Đánh giá per-class (G4.6) và ghi nhận lớp hiếm thấp — nối bias/imbalance.

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), đưa pretrained (foundation) vào làm "điểm khởi tạo" các client — phân tích lợi ích (hội tụ nhanh) và rủi ro (chi phí tải mô hình, bias riêng miền client, non-IID).
7. Trong CL (G7), foundation giúp giảm forgetting thế nào, nhưng giới hạn (OOD/bias) ảnh hưởng ra sao khi học task mới — bàn luận ngắn.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. (1) pretrain data rộng; (2) đa dụng/nhiều hạ lưu; (3) tái dùng qua fine-tune/probe. "Lớn" không đủ vì size không đảm bảo tính "nền" — có model lớn chuyên 1 việc cũng không phải foundation.
2. Multimodal = kết hợp nhiều loại data (ảnh+văn bản+âm thanh) trong chung một không gian embedding để model làm việc xuyên phương thức (VD mô tả ảnh bằng text). Embedding chung cho phép so sánh/liên kết giữa modal.
3. Bias dữ liệu; robustness OOD kém; chi phí tính toán/data lớn; rò rỉ/privacy (nhớ dữ liệu train); đánh giá/benchmark chưa đủ; không thay thế kiến thức miền.
4. Nếu OOD accuracy tụt mạnh → model chưa robust ngoài phân phối; cần ghi rõ, không khoe 1 con số test.
5. Per-class recall lớp hiếm thấp → bias/imbalance (G4.6); thêm vào "đánh giá có trách nhiệm".
6. Lợi: pretrained khởi tạo tốt → hội tụ nhanh, dữ liệu client ít vẫn ổn. Rủi: chi phí tải mô hình lớn đến client (bandwidth), miền client lệch (non-IID) tận dụng không đều; gộp update cần đồng bộ. G8 chuyên sâu.
7. Foundation làm điểm khởi tạo tốt (giảm forgetting, đã bàn G5.6); giới hạn OOD nghĩa là task mới lệch miền vẫn có thể hại, và bias pretrained kế thừa — cần đánh giá từng task. G7.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Foundation model** = pretrain trên data rộng + đa dụng + tái dùng (fine-tune/probe); **không phải** chỉ "model lớn".
2. **Multimodal**: tập nhiều loại dữ liệu vào chung không gian embedding (ảnh + text...).
3. Giới hạn lớn: **bias, robustness OOD kém, chi phí cao, rò rỉ/privacy, đánh giá chưa đủ**.
4. Đánh giá có trách nhiệm: không chỉ test i.i.d — kiểm **OOD, per-group, best-effort**; không phóng đại.
5. Điều này tăng tính "tỉnh táo" cho các chương FL/CL (G6–G8) khi dùng pretrained.

**Tự kiểm tra:**
- 3 tiêu chí foundation; vì sao "lớn" chưa đủ.
- Multimodal làm gì qua embedding chung.
- Kể 4 giới hạn + cách kiểm.
- Vì sao không chỉ tin accuracy test.

---

## 16. Đọc sâu bằng trực giác — giỏi ở đâu, yếu với ai?

Một máy phân loại hàng hóa rất tốt trong kho sáng rõ chưa chắc tốt ở kho tối. “Mô hình nền tảng” nói cách học và tái sử dụng, không phải giấy chứng nhận chất lượng cho mọi điều kiện vận hành.

| Câu hỏi của người quản lý kho | Đại lượng mô hình | Ý nghĩa |
|---|---|---|
| Bao nhiêu kiện phân đúng? | Accuracy tổng | Phụ thuộc tỉ lệ từng nhóm |
| Ca đêm có bị bỏ quên? | Accuracy theo nhóm/miền | Làm lộ nhóm ít mẫu |
| Chuyển sang camera khác thì sao? | Đánh giá ngoài phân phối | Kiểm tra khả năng chuyển miền cụ thể |

**Đọc công thức:** `Acc = Σg (ng/N)·Accg`: “lấy độ chính xác mỗi nhóm, nhân với tỉ lệ số mẫu của nhóm ấy, rồi cộng”. Accuracy tổng là trung bình có trọng số theo tập đánh giá, không phải trung bình công bằng mặc định giữa mọi nhóm.

**Tính tay với số liệu giả lập:** test có 900 ảnh sáng, accuracy 95%, và 100 ảnh tối, accuracy 50%. Mô hình đúng `855+50=905` trên 1.000 ảnh, tức 90.5%. Nếu coi hai miền ngang nhau thì macro trung bình là `(95+50)/2=72.5%`; nhóm yếu nhất chỉ 50%. Cả ba số đều đúng nhưng trả lời ba câu hỏi khác nhau.

**Phản ví dụ:** nếu triển khai nơi 90% ảnh là ảnh tối, giả sử hiệu năng từng nhóm giữ nguyên thì accuracy dự kiến chỉ `0.1×95%+0.9×50%=54.5%`. Không được chuyển con số 90.5% sang môi trường mới mà không kiểm phân phối. Phép tính dự báo này cũng có điều kiện: chất lượng trong từng nhóm có thể đổi theo camera, loại hàng hoặc thời gian.

:::interactive context
:::

:::quiz
Với 900 ảnh sáng đạt 95% và 100 ảnh tối đạt 50%, accuracy tổng là bao nhiêu?
A. 72.5%
B. 90.5%
C. 95%
Đáp án: B
Giải thích: Tổng dự đoán đúng là 855+50=905 trên 1.000. 72.5% là trung bình hai nhóm ngang trọng số, khác accuracy gộp.
:::

:::goi-y
Đếm số đúng ở từng nhóm trước khi chia tổng số ảnh. Đừng lấy trung bình hai phần trăm ngay.
:::

:::loi-giai
`(900×0.95+100×0.50)/1000=0.905`. Khi báo cáo nên kèm số mẫu, định nghĩa nhóm và số của nhóm yếu, để người đọc biết kết quả áp dụng ở đâu.
:::
