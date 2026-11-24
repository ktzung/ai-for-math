# Chương 2.8 — Rò rỉ dữ liệu và các sai lầm trong thiết kế thí nghiệm (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Kết quả "quá tốt để là thật" — làm sao nhận ra thí nghiệm bị nhiễm (data leakage) trước khi công bố?*

---

## 1. Vị trí trong lộ trình

Đây là chương cuối G2. Kết lại các kỹ năng đánh giá bằng một nguyên tắc phòng thủ: **rò rỉ dữ liệu (data leakage)** và các **sai lầm thiết kế** khiến số liệu không đáng tin. FL/CL đặc biệt nhạy cảm (rò rỉ giữa client, rò rỉ qua thời gian/nhiệm vụ) — chương này đặt nền.

Nó **nối** từ G2.3 (chia tập) và **chuẩn bị** cho mọi thí nghiệm sau (G4–G9), và đặc biệt các phần "phát hiện leakage/giả định" ở G9.2.

---

## 2. Kiến thức cần dùng

- Chia train/val/test (G2.3), chỉ số (G2.7).
- Data pipeline (G1.2).

**Ôn nhanh:** "test" phải là dữ liệu *chưa từng* dùng để chọn model/hyperparameter. Rò rỉ = thông tin từ test (hoặc tương lai) lọt vào quá trình huấn luyện → model "nhìn bài".

---

## 3. Câu chuyện mở đầu

Lan rất vui: model chẩn đoán của cô đạt **99,9% accuracy** trên test. Quá đẹp. Trước khi khoe sếp, cô rà lại pipeline và phát hiện lỗi:

- Cô xếp *nhầm nhãn* đổi chỗ 2 cột, khiến test có dữ liệu của train (hoặc ngược lại) — model thật ra nhớ từng mẫu.
- Cô chuẩn hóa dữ liệu (trừ trung bình, chia std) tính trên *toàn bộ dữ liệu gồm cả test* rồi mới chia — test bị "rọi" thông tin phân phối toàn tập.
- Cô vô tình dùng một đặc trưng "kết quả đã biết" (VD thời gian chữa khỏi khi dự đoán có khỏi không) — đặc trưng này "không lộ tương lai" là giả.

Một trong những lỗi trên đủ làm con số 99,9% là **ảo giác**. Chương này dạy cách phát hiện và tránh chúng — vì "kết quả quá tốt" thường là dấu hiệu rò rỉ.

---

## 4. Câu hỏi trọng tâm

**Data leakage là gì (các loại), và làm sao phát hiện/tránh trong thiết kế thí nghiệm?**

---

## 5. Trực giác

**Leakage = "model được xem đáp án trước kỳ thi".**

Hình dung thi cuối kỳ: nếu ai đó in cả *đáp án đề thi* (test) vào phần *ôn tập* (train), bạn sẽ đạt 100% trên "đề thi" — nhưng không hề biết làm bài thật khi gặp đề mới. Đó chính là rò rỉ: **thông tin mà lẽ ra chỉ có trong test (hay tương lai) đã lọt vào dữ liệu huấn luyện / quá trình chọn model.**

**Ba nguồn rò rỉ kinh điển:**
1. **Trùng/hòa trộn dữ liệu:** các bản sao của cùng đối tượng nằm cả train và test → model "nhớ" đúng pattern sample.
2. **Tiền xử lý dùng toàn tập:** chuẩn hóa/trung bình tính trên cả test rồi mới chia → test mong phân phối.
3. **Đặc trưng "tương lai":** dùng thông tin không tồn tại ở thời điểm dự đoán thực tế (VD dùng giờ đúng của "thời gian đến" để dự đoán "có đến muộn").

**Phép so sánh "in đáp án đề thi":** trực quan và chuẩn. **Giới hạn:** đôi khi rò rỉ tinh vi (trùng lặp "gần giống", metadata gián tiếp); không phải lúc nào dễ gắn cờ. Nên nghĩ "model thật lúc chạy sẽ có gì?" — nếu feature không có ở thời điểm dự đoán thật, đừng dùng.

---

## 6. Từ trực giác đến mô hình

- **Đà/organize thời điểm:** huấn luyện dựa trên *thông tin có ở thời điểm dự đoán*.
- **Nguyên tắc vàng:** toàn bộ pipeline (chuẩn hóa, chọn đặc trưng, chọn hyperparameter) phải **chỉ sử dụng train/val**, test chỉ nhìn *một lần cuối*.
- **Đẩy rò rỉ dạng chuỗi thời gian:** không chia ngẫu nhiên; chia theo mốc thời gian (test là tương lai, train là quá khứ).
- **Rò rỉ theo nhóm/đơn vị (FL/CL):** khi dữ liệu theo client/nhiệm vụ, không dùng mẫu cùng client vào cả train & test (nếu test là "client mới").

**Thuật toán tránh leakage:**
```
1. Tách toàn bộ dữ liệu thô ra trước khi bất kỳ xử lý nào.
2. Chia theo phương án đúng (ngẫu nhiên nếu i.i.d.; theo thời gian/client nếu không).
3. Chỉ tính chuẩn hóa/đặc trưng từ TRAIN; áp lên val/test nguyên vẹn.
4. Không dùng feature "tương lai".
5. Test chỉ chạy một lần cuối cùng.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Chuẩn hóa đúng cách (tránh rò rỉ).**

```python
# SAI: tính mean/std trên TOÀN dữ liệu trước khi chia
mean = data.mean()          # lọt thông tin test → sai
data_n = (data - mean)/data.std()

# ĐÚNG: chỉ fit trên train, áp lên test với cùng tham số
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler().fit(X_train)      # chỉ train
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)        # dùng scaler đã fit từ train
```

Điểm cốt lõi: tham số chuẩn hóa (mean/std) chỉ lấy từ train.

**Bước 2 — Kiểm tra trùng lặp.** Trước khi chia, xóa/déo mẫu trùng:
```python
# kiểm tra trùng giữa train/test
dup = set(map(tuple, X_train[:1000])) & set(map(tuple, X_test[:1000]))
print("samples trùng:", len(dup))
```

**Bước 3 — Chia theo thời gian (chuỗi).**
```python
split = int(len(data)*0.8)
train, test = data[:split], data[split:]      # không shuffle
```

**Bước 4 — Tránh feature tương lai.** Rà từng cột: cột này có tồn tại *tại thời điểm dự đoán* không? Nếu không, bỏ.

**Lỗi thường gặp:** chuẩn hóa trước chia; shuffle chuỗi thời gian; để nhãn lạc quan vào feature (một biến thể tinh vi: dùng "kết quả" làm feature dự đoán chính kết quả ấy).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** dự đoán "khách churn (rời bỏ)" tháng tới từ dữ liệu 12 tháng.

**Bước 1 — Feature "tương lai" sai:** nếu một đặc trưng là "doanh số tháng **sau** khi tháng hỏi" (chỉ có trong tương lai), model sẽ "biết trước" — rò rỉ. Đúng: chỉ dùng các tháng ≤ tháng dự đoán.

**Bước 2 — Chia sai theo thời gian:** chia ngẫu nhiên có thể để tháng 12 (tương lai) vào train và tháng 1 (quá khứ) vào test → model thấy half phân phối tương lai, tăng điểm ảo. Đúng: chia theo mốc thời gian (train: tháng 1–9, val: 9–10, test: 11–12).

**Bước 3 — Kiểm chứng:** con số "95% churn" mà thực ra chỉ do feature tương lai → sau khi bỏ feature/chia đúng, accuracy về 70% — đó là con số trung thực.

**Bước 4 — Liên hệ FL/CL:** trong FL, nếu test là các *client mới*, đừng để các mẫu cùng client... (xem G6); trong CL (chuỗi nhiệm vụ), test phải là nhiệm vụ chưa gặp — không "nhìn lại" qua training. Đây là phiên bản "rò rỉ theo thời gian/client" của CL.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** pipeline "đơn giản" gộp mọi thứ vào nhau, tính chuẩn hóa trên toàn tập, chia ngẫu nhiên.

| Phương diện | Pipeline đơn giản | Pipeline chống leakage |
|---|---|---|
| Rủi ro rò rỉ | cao | thấp |
| Độ tin số liệu | thấp (ảo) | cao |
| Công sức | ít | thêm các bước tách/kiểm |
| Kết luận | có thể sai | trung thực |

**Cải thiện:** số liệu tin cậy, kết luận đúng. **Đánh đổi:** phải cẩn thận thứ tự xử lý, tách train/test trước khi encode/chuẩn hóa.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát rò rỉ do chuẩn hóa sai.

1. Tạo dữ liệu ngẫu nhiên 100 mẫu, chia train/test.
2. Tính accuracy khi: (a) chuẩn hóa trên train, (b) chuẩn hóa trên toàn tập trước khi chia.
3. Ghi nhận: (b) cho accuracy "tốt hơn một chút" nhưng KHÔNG hợp lệ — model bị "rọi" phân phối test. Điểm này thường nhỏ nhưng trong thực tế có thể tổng lên.

**Bài học:** kỷ luật "chỉ fit trên train" quan trọng hơn cải thiện con số nhỏ do lười.

---

## 11. Thực hành lập trình

**Môi trường:** venv + sklearn + numpy.

**Cấu trúc:** `scripts/leakage_demo.py`:

```python
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

np.random.seed(0)
X = np.random.randn(200, 4); y = (X[:,0] + 0.5*X[:,1] > 0).astype(int)
train, test = X[:160], X[160:]; ytr, yte = y[:160], y[160:]

# (b) sai: scaler fit trên toàn bộ
scaler_all = StandardScaler().fit(X)
Xtr_all = scaler_all.transform(train); Xte_all = scaler_all.transform(test)
m = LogisticRegression().fit(Xtr_all, ytr)
print("leaked acc:", accuracy_score(yte, m.predict(Xte_all)))

# (a) đúng: chỉ fit train
scaler_tr = StandardScaler().fit(train)
Xtr = scaler_tr.transform(train); Xte = scaler_tr.transform(test)
m2 = LogisticRegression().fit(Xtr, ytr)
print("clean acc:", accuracy_score(yte, m2.predict(Xte)))
```

**Kết quả dự kiến:** 2 accuracy gần nhau (vì dữ liệu nhỏ), nhưng cái đầu KHÔNG hợp lệ về mặt quy trình. Điểm chính là hiểu cái nào đúng, chứ không phải chênh lệch số.

**Lỗi thường gặp:** dùng `fit` trên X_tr lẫn lộn; test bị chuẩn hóa bằng tham số riêng của nó (sai) — luôn dùng `transform` (không `fit`) với scaler đã fit train.

**Chú thích trung thực:** với dữ liệu này chênh nhỏ; mục đích là minh họa *thứ tự đúng*, không phải để thấy số khác biệt to. Trong thực tế, rò rỉ còn nghiêm trọng hơn khi feature nhiều/dữ liệu lệch.

---

## 12. Đánh giá

**Chỉ số:** nhận diện được 3 loại rò rỉ (trùng lặp, tiền xử lý toàn tập, feature tương lai); biết chuẩn hóa chỉ fit train; biết chia theo thời gian khi cần; biết "kết quả quá tốt" là tín hiệu nghi leakage.

**Vì sao chọn:** những kỹ năng này bảo vệ tính trung thực của mọi con số sau này — đặc biệt khi báo cáo thí nghiệm tái lập (G9).

**Chỉ số không thể hiện:** không phủ hết mọi dạng rò rỉ tinh vi (metadata, encoder). Nhưng bộ ba trên bao phủ phần lớn lỗi phổ biến.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Chuẩn hóa trước chia là tiện, không sao." — Sai, đó là rò rỉ (test bị "nhuộm" thông tin). Luôn fit train.
- **Hiểu lầm 2:** "Shuffle là vô hại." — Với chuỗi thời gian là tai hại (dữ liệu tương lai lọt train). Chỉ shuffle khi i.i.d.
- **Hiểu lầm 3:** "Miễn là tôi không để nhãn vào feature thì không rò rỉ." — Vẫn có thể rò qua *feature gián tiếp mang thông tin tương lai/định danh*. Cần rà nghĩa từng cột.
- **Giới hạn:** rò rỉ tinh vi khó phát hiện tự động; tốt nhất là *thiết kế đúng từ đầu* theo nguyên tắc "chỉ dùng thông tin có tại thời điểm dự đoán + chỉ fit train". Đừng dựa vào con số để phát hiện khi đã muộn.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Định nghĩa data leakage, cho 1 ví dụ.
2. Vì sao "chuẩn hóa bằng tham số of toàn dataset" là rò rỉ?

### Luyện tập (sửa đổi / mở rộng)
3. Dữ liệu ảnh thu thập theo ngày; bạn cần chia train/test. Sử dụng cách nào (chia ngẫu nhiên hay theo thời gian)? Vì sao.
4. Một model đạt accuracy 99% nghi vấn rò rỉ. Kể 3 điều bạn kiểm tra.

### Thử thách (thiết kế / liên hệ)
5. Trong FL (G6), giải thích vì sao nếu "client A là test nhưng mẫu của client A cũng có trong train" là rò rỉ, và cách đúng là chia theo client.
6. Trong CL (G7), vì sao "test gồm nhiệm vụ đã huấn luyện" là trái nguyên tắc (không đánh giá khả năng học mới)? Đề xuất cách chia theo nhiệm vụ.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Thông tin từ test/tương lai lọt vào train/chọn model → model nhìn bài. VD: chuẩn hóa trên toàn tập, feature tương lai.
2. Vì tham số mean/std lấy từ cả test → test không còn "chưa từng thấy"; model/ước lượng phân phối được "ád" thông tin test.
3. Theo thời gian: train các ngày đầu, test ngày cuối. Ngẫu nhiên có thể để tương lai vào train → rò rỉ.
4. (a) Kiểm trùng mẫu train/test; (b) kiểm feature "tương lai"/metadata; (c) kiểm thứ tự xử lý (chuẩn hóa fit toàn?); cũng kiểm chia đúng chuỗi thời gian/client.
5. Vì mẫu cùng client A nằm trong train đã cho model "nhìn dáng" client test → test client mới không còn khách quan. Đúng: giữ nguyên client (không trộn mẫu) khi chia; hoặc test = client chưa bao giờ trong train. G6.
6. Nếu test gồm nhiệm vụ đã huấn luyện, model chỉ đoán "nhớ bài", không đo khả năng học nhiệm vụ mới — trái mục đích CL. Đúng: test gồm nhiệm vụ chưa gặp; và giữ test riêng cho từng task theo chuỗi. G7.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Data leakage = model "thấy đáp án" (test/tương lai lọt vào train/chọn).**
2. Ba nguồn chính: **trùng mẫu**, **chuẩn hóa trên toàn tập**, **feature tương lai**.
3. Nguyên tắc: toàn bộ xử lý chỉ fit trên **train**; test **một lần cuối**; chia đúng (nếu chuỗi/time hay client → chia theo time/client).
4. "Kết quả quá tốt" là **dấu hiệu nghi rò rỉ** — rà pipeline trước khi công bố.
5. Trong FL/CL, rò rỉ giữa client/nhiệm vụ là vấn đề đặc trưng — sẽ gặp lại G6/G7/G9.

**Tự kiểm tra:**
- Kể 3 loại rò rỉ phổ biến.
- Vì sao chuẩn hóa phải fit train?
- Khi dữ liệu chuỗi thời gian, chia thế nào?
- Dấu hiệu "quá tốt" cần kiểm gì?

---

## 16. Đọc sâu bằng trực giác — rò rỉ là nhìn trộm đáp án trước giờ thi

Một giáo viên soạn đề bằng cách lấy nguyên câu trong sách bài tập mà học sinh đã có lời giải. Điểm cao không phản ánh năng lực vì thông tin đáp án đã lọt vào quá trình luyện. Rò rỉ dữ liệu xảy ra khi thông tin từ tập đánh giá hoặc tương lai lọt vào lúc huấn luyện.

| Kiểu rò rỉ | Ví dụ | Cách chặn |
|---|---|---|
| Chuẩn hóa toàn bộ | Tính mean/std trước khi chia train/test | Chỉ fit trên train |
| Trùng lặp mẫu | Cùng bệnh nhân ở cả train và test | Chia theo người/nhóm |
| Dùng tương lai | Random split dữ liệu chuỗi thời gian | Chia theo mốc thời gian |
| Nhãn rò vào đặc trưng | Cột "ngày xuất viện" khi dự đoán nhập viện | Kiểm tra thời điểm có sẵn |

**Đọc thành lời:** mọi phép biến đổi học tham số từ dữ liệu — chuẩn hóa, chọn đặc trưng, điền khuyết — phải được "fit" trên train rồi áp dụng nguyên trạng cho validation/test. Nếu dùng thống kê của cả ba tập, test đã góp phần định hình mô hình. Chia theo nhóm hoặc thời gian cũng là một phần của thiết kế, vì các mẫu gần nhau thường chia sẻ thông tin.

**Tính tay:** train có giá trị `[10,20]`; min-max trên train là `x'=(x−10)/10`. Mẫu test `30` thành `(30−10)/10=2`, nằm ngoài `[0,1]` nhưng hợp lệ. Nếu tính min-max trên cả `[10,20,30]`, test thành `(30−10)/20=1`. Con số 1 trông "đẹp" chỉ vì test đã tham gia xác định min/max, không phải vì mô hình giỏi.

**Phản ví dụ:** accuracy test 99% trong khi mô hình chỉ học thuộc. Kiểm tra thấy ảnh trùng lặp giữa train và test, hoặc chuẩn hóa được tính trên toàn bộ dữ liệu. Hạ điểm bằng cách chia lại theo nhóm và fit scaler trên train; nếu điểm vẫn cao mới đáng tin. Ngược lại, điểm test thấp bất thường cũng có thể do lệch phân phối, không nhất thiết mô hình kém.

**Giới hạn:** loại bỏ rò rỉ không bảo đảm mô hình tốt; nó chỉ làm phép đo trung thực hơn. Với dữ liệu quan sát, không thể kiểm soát mọi biến gây nhiễu; kết luận nhân quả cần thiết kế thí nghiệm, không chỉ mô hình dự đoán. Và trong FL/CL, rò rỉ có thể xảy ra giữa client hoặc giữa nhiệm vụ cũ/mới, khó thấy hơn trong một bảng dữ liệu.

:::interactive leakage
:::

:::quiz
Thao tác nào gây rò rỉ dữ liệu?
A. Tính mean và std trên toàn bộ dữ liệu rồi mới chia train/test
B. Chỉ tăng cường ảnh cho tập train
C. Chia train/validation/test theo tỉ lệ 70/15/15
Đáp án: A
Giải thích: thống kê toàn bộ đã dùng thông tin của test để biến đổi train. Tăng cường ảnh chỉ trên train và chia tập hợp lý không tự gây rò rỉ.
:::

**Tự thử thêm:** train `[10,20]`, test `[30]`. Tính giá trị chuẩn hóa min-max của test theo hai cách: fit trên train và fit trên toàn bộ. Giải thích cách nào phản ánh đúng khả năng áp dụng cho dữ liệu mới.

:::goi-y
Fit trên train dùng min 10, max 20; fit toàn bộ dùng min 10, max 30. So sánh mẫu số.
:::

:::loi-giai
Fit trên train: `(30−10)/(20−10)=2`. Fit toàn bộ: `(30−10)/(30−10)=1`. Cách đầu chỉ dùng thông tin train nên mô phỏng đúng lúc gặp dữ liệu mới; cách sau đã cho test tham gia xác định thang đo, làm điểm đánh giá lạc quan.
:::