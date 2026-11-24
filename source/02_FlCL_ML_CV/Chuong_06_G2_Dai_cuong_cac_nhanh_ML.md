# Chương 2.1 — Ba họ bài toán học máy: giám sát, không giám sát, tăng cường (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *"Máy học" theo 3 cách khác nhau như thế nào — một có đáp án, một không, một học bằng thử-sai?*

---

## 1. Vị trí trong lộ trình

Giai đoạn 1 đã trang bị công cụ: nạp dữ liệu, NumPy, PyTorch vòng lặp, Git. Giờ đến **học máy căn bản (G2)**. Chương đầu của G2 đặt **khuôn khổ** — ba cách máy "học" — để bạn biết mình đang giải loại bài toán nào. G2.2–G2.8 đi vào chi tiết của nhánh giám sát (hồi quy, phân loại, đánh giá) — nhánh chiếm đa số trong CV, FL, CL.

Nó **nối** từ G1 (dữ liệu, vòng lặp) và **chuẩn bị** cho G3 (học sâu) và G6–G8 (FL/CL — đều là các dạng mở rộng của học giám sát trên ảnh).

---

## 2. Kiến thức cần dùng

- Nạp dữ liệu, tổng hợp mảng (G1.2–1.3).
- Math: hàm mất mát, dự đoán, nhãn (Chương 2, 4 sách toán); khái niệm xác suất (Chương 5 sách toán — sẽ gặp khi nói phân loại).

**Ôn nhanh:** "nhãn (label)" = câu trả lời đúng kèm mỗi mẫu (VD ảnh này là mèo). "Đặc trưng (feature)" = các biến đầu vào (độ sáng, kích thước...). "Dự đoán (prediction)" = kết quả mô hình đưa ra.

---

## 3. Câu chuyện mở đầu

Ba cửa hàng nhờ Lan phân tích:

1. **Tiệm trà:** có 1.000 hóa đơn, mỗi hóa đơn ghi *được dán nhãn* "khách quay lại" hay "khách đi luôn". Họ muốn dự đoán: khách mới sắp tới sẽ quay lại không? *(Có đáp án để học.)*
2. **Cửa hàng thời trang:** không ghi nhãn gì, chỉ có thông tin khách (tuổi, chi tiêu, khu vực). Họ muốn *nhóm* khách hàng lại để hiểu. *(Không đáp án, chỉ tìm cấu trúc.)*
3. **Robot dọn kho:** không có dữ liệu nhãn hay nhóm — robot tự thử các hành động (đi, tránh, nhặt), mỗi lần thử được "thưởng/phạt" (đến robot sạch thì tốt, đụng kệ thì xấu). *(Học bằng thử-sai và phần thưởng.)*

Cả ba đều là "học máy" nhưng khác nhau hoàn toàn về *loại thông tin có sẵn khi học*. Phân biệt được ba nhánh này là bước đầu tiên để chọn đúng bài toán và công cụ.

---

## 4. Câu hỏi trọng tâm

**Có ba cách để cung cấp "tín hiệu học" cho máy — khác nhau ở chỗ nào, và khi nào dùng cái nào?**

---

## 5. Trực giác

Hình dung ba cách học của con người:

- **Học có giám sát (supervised):** có "thầy giáo". Thầy cho ví dụ kèm đáp án ("đây là ảnh mèo", "đây là quyển sách"). Máy học cách từ đầu vào → đáp án. Lan ở tiệm trà. → **Bài toán có nhãn:** phân loại (mèo/chó, tốt/xấu) và hồi quy (dự đoán giá, thời gian).
- **Học không giám sát (unsupervised):** không có thầy, không đáp án. Máy chỉ thấy dữ liệu thô và tìm *cấu trúc ẩn*: nhóm (clustering), nén đặc trưng, tìm điểm dị thường. Cửa hàng thời trang. → **Khám phá cấu trúc không có nhãn.**
- **Học tăng cường (reinforcement):** không thầy, không tập dữ liệu. Tác tử hành động trong môi trường, nhận **phần thưởng**, học chính sách hành vi để tối đa hoá phần thưởng dài hạn. Robot dọn kho. → **Học quyết định qua thử-sai + reward.**

**Điểm then chốt:** sự khác biệt nằm ở *loại tín hiệu phản hồi*. Giám sát = phản hồi "đáp án đúng". Không giám sát = không phản hồi, tự tìm cấu trúc. Tăng cường = phản hồi "thưởng/phạt" sau chuỗi hành động.

**Phép so sánh "ba cách học":** giám sát = học với thầy, không giám sát = tự xếp sách/khám phá kho, tăng cường = tập đi xe đạp bằng ngã-rồi-rút kinh nghiệm. **Giới hạn:** ranh giới ba cái không luôn sắc nét (có cả "self-supervised", "semi-supervised" giữa các nhánh); và việc "học tăng cường tối đa phần thưởng" có thể bị hóc vì reward thiết kế sai — ta chỉ cần nắm ý chính.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu / tín hiệu:**
  - Giám sát: `(đặc trưng x, nhãn y)` nhiều cặp.
  - Không giám sát: chỉ `x`, không y.
  - Tăng cường: không dataset; tác tử + môi trường + reward r(t).
- **Mục tiêu (optimize):**
  - Giám sát: giảm loss giữa dự đoán và nhãn (Chương 8).
  - Không giám sát: tối ưu độ "gọn" của nhóm / tái tạo.
  - Tăng cường: tối đa tổng reward.
- **Đầu ra:**
  - Giám sát: hàm `f(x)→y` (hoặc xác suất).
  - Không giám sát: gán nhóm / biểu diễn.
  - Tăng cường: chính sách `π` (hành động theo trạng thái).

**Trong lộ trình này (CV, FL, CL), nhánh được dùng chủ yếu là giám sát** — vì phân loại ảnh có nhãn. Nhưng hiểu không giám sát + self-supervised giúp đọc về pretraining (G5), và tăng cường xuất hiện trong một số ứng dụng robot/CV. Ta tập trung giám sát từ G2.2 trở đi.

---

## 7. Thuật toán từng bước (khung chung của học giám sát)

Vì các chương sau đi sâu, ở đây đưa khung:

**Bước 1 — Có dữ liệu:** nhiều cặp `(x, y)`.
**Bước 2 — Chia train / validation / test** (G2.3 sẽ đi sâu).
**Bước 3 — Chọn mô hình `f`** (hồi quy / phân loại — các chương sau).
**Bước 4 — Chọn loss** đo độ sai giữa `f(x)` và `y`.
**Bước 5 — Huấn luyện:** gradient descent giảm loss (vòng lặp G1.4).
**Bước 6 — Đánh giá** trên test, đọc chỉ số.

Khung này áp cho *mọi* mô hình giám sát — từ hồi quy tuyến tính đến mạng nơ-ron và cả bối cảnh FL/CL (chỉ thêm điều kiện phân bố client/nhiệm vụ).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** tiệm trà có 3 hóa đơn đã ghi nhãn: `(chi_tiêu=2, quay_lại=1)`, `(3, 1)`, `(8, 0)`. "Máy" đơn giản: **ngưỡng** — nếu chi tiêu < 5 thì đoán quay lại (1), ngược lại không (0).

**Bước 1 — Dự đoán theo luật:** mẫu 1: 2<5 → đoán 1 (đúng). Mẫu 2: 3<5 → 1 (đúng). Mẫu 3: 8<5 → 0 (đúng). → accuracy 3/3.

**Bước 2 — Kiểm tra luật khác:** ngưỡng 6 → 2,3 (đoán 1, đúng), 8 (đoán 0, đúng) → vẫn 3/3.

**Bước 3 — Phát hiện nhạy cảm:** hai luật cùng accuracy nhưng khác "ranh giới". Với dữ liệu mới (chi tiêu 5.5) chúng cho kết quả khác. Bài học: **accuracy trên tập nhỏ không đủ để chọn**; cần đánh giá kỹ (G2.7) và validation/test (G2.3).

**Bước 4 — Giải thích:** đây là *phân loại nhị phân* — đầu ra 0/1. Điểm cốt lõi của G2: phân loại (y là nhãn rời rạc) khác hồi quy (y là số liên tục), và ta cần cách "học ngưỡng/mô hình" tự động (G2.4).

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** không học, chỉ dùng luật tay ("chi tiêu < 5 → quay lại").

| Phương diện | Luật tay | Học giám sát |
|---|---|---|
| Tự tìm quy luật | không (do người đặt) | học từ dữ liệu |
| Quy mô đặc trưng | vài đặc trưng | hàng nghìn |
| Cập nhật khi dữ liệu mới | viết lại luật | huấn luyện lại tự động |
| Đánh đổi | minh bạch, dễ kiểm | phụ thuộc dữ liệu, cần đánh giá |

**Cải thiện:** tự động, mở rộng. **Đánh đổi:** kém minh bạch hơn, và cần đánh giá nghiêm túc — không vì máy "học" mà tin vô điều kiện (G2.5/G2.7).

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** nhận diện ba loại bài toán — không cần code, chỉ gắn nhãn.

Lấy 6 mô tả và phân loại: giám sát / không / tăng cường:
1. Dự đoán giá nhà từ diện tích (??)
2. Gom khách hàng thành nhóm (??)
3. Robot tự học đi (??)
4. Nhận diện chữ viết tay (??)
5. Tìm điểm bất thường trong giao dịch (??)
6. Dạy máy đánh cờ bằng phần thưởng thắng/thua (??)

**Đáp gợi ý:** 1-GS, 2-KGS, 3-TC, 4-GS, 5-KGS (dị thường), 6-TC. Khi đọc tài liệu, tự hỏi "tín hiệu học ở đây là gì?" — câu trả lời quyết định nhánh.

---

## 11. Thực hành lập trình

**Môi trường:** venv + numpy (+ sklearn — cài `pip install scikit-learn` nếu chưa; dùng để tạo dữ liệu minh họa, không để "che giấu" khái niệm của các chương sau).

**Cấu trúc:** `scripts/clf_basic.py`:

```python
import numpy as np

# dữ liệu có nhãn (giám sát), nhỏ
x = np.array([[2.0], [3.0], [8.0]])   # chi tiêu
y = np.array([1, 1, 0])               # quay lại: 1/0

# mô hình ngưỡng đơn giản (chưa phải "học" — minh họa)
def predict(threshold, xi):
    return 1 if xi < threshold else 0

thr = 5.0
preds = np.array([predict(thr, v) for v in x[:, 0]])
acc = (preds == y).mean()
print("accuracy:", acc)   # dự kiến 1.0
```

**Kết quả dự kiến:** accuracy 1.0 trên tập 3 mẫu (dễ "khớp hoàn hảo" vì nhỏ). **Bài học info:** accuracy cao trên tập quá nhỏ gây ảo giác — chỉ dùng để minh họa, không kết luận.

**Lỗi thường gặp:** `np.array` list lồng sai shape; so sánh `preds == y` (ok), nhưng `(preds==y).mean()` yêu cầu cùng shape — in shape ra kiểm.

**Chú thích trung thực:** chưa dùng "học" thật (chưa tự tìm ngưỡng); đó là nội dung G2.4. Đây chỉ minh họa khái niệm giám sát.

---

## 12. Đánh giá

**Chỉ số:** khả năng *phân loại đúng* 6 mô tả ở Thí nghiệm tối thiểu (giám sát/không/tăng cường), và hiểu khung 6 bước của học giám sát.

**Vì sao chọn:** ở chương khái niệm, việc "nhận diện đúng loại bài toán" quan trọng hơn con số accuracy (accuracy 3/3 vô nghĩa trên tập nhỏ). Đây là đánh giá *hiểu khái niệm*, không phải hiệu năng model.

**Chỉ số không thể hiện:** không đo lực mô hình, không đo độ tổng quát — chương này chỉ đặt nền khái niệm; hiệu năng bắt đầu thực sự ở các chương sau.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Không giám sát là 'không có gì để học'." — Sai. Nó học *cấu trúc* (nhóm, đặc trưng, dị thường) dù không có đáp án. Tín hiệu là "cấu trúc" chứ không phải liên quan nhãn.
- **Hiểu lầm 2:** "Tăng cường chỉ là 'làm được thì thưởng'." — Tinh tế hơn: tác tử phải học *quyết định qua chuỗi thời gian*, đánh đổi phần thưởng trước mắt vs dài hạn, và reward có thể thiết kế sai. Đừng đơn giản hóa thành cái máy "ăn thưởng".
- **Hiểu lầm 3:** "Có nhãn là cuối cùng tốt hơn không nhãn." — Không hẳn. Nhãn tốn công (con người gán) và có thể sai; phân loại cần giám sát, nhưng với dữ liệu lớn chưa gán nhãn, không giám sát/self-supervised rất hữu ích (pretraining, G5). Mỗi nhánh có giá trị riêng.
- **Giới hạn:** có các biến thể trung gian (semi-supervised, self-supervised, few-shot) — chúng ta chỉ cần khung 3 nhánh cơ bản; đừng nghĩ thế giới ML chỉ gói trong 3 hộp cứng.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Mô tả bằng lời sự khác nhau chính giữa giám sát / không giám sát / tăng cường.
2. Cho tình huống, gắn nhánh: (a) dự đoán thời tiết ngày mai từ dữ liệu có đáp án; (b) gom người dùng theo mục tiêu hành vi; (c) dạy AI chơi game bằng thưởng điểm.

### Luyện tập (sửa đổi / mở rộng)
3. Với tiệm trà, thêm đặc trưng "số lần ghé" và nói tín hiệu giám sát đến từ đâu.
4. Trong khung 6 bước, chỗ nào loss và gradient descent xuất hiện? Kể tên.

### Thử thách (thiết kế / liên hệ)
5. Giải thích: vì sao FL (nhiều client cùng học mà không gom dữ liệu) chủ yếu nằm trong *giám sát* — và tín hiệu học ở mỗi client là gì. *(Liên hệ G6.)*
6. Một robot nhặt rác nhận thưởng khi nhặt đúng. Thiết kế sơ bộ: reward nên phạt gì ngoài việc "không nhặt" — và vì sao reward thiết kế kém có hại. (nối khái niệm reward học tăng cường.)

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Giám sát: có nhãn đáp án → học `x→y`. Không giám sát: không nhãn → tìm cấu trúc. Tăng cường: hành động + reward → tối đa reward.
2. (a) GS; (b) KGS; (c) TC.
3. Dữ liệu có nhãn "quay lại/không" (gán thủ công từ lịch sử); đặc trưng gồm chi tiêu, số lần ghé. Tín hiệu = nhãn (giám sát).
4. Ở bước 4 (chọn loss) và bước 5 (gradient descent giảm loss) — chính là vòng lặp G1.4.
5. Vì mỗi client có dữ liệu (ảnh) với nhãn (tên lớp), học giám sát trên client rồi chia sẻ cập nhật (FedAvg). Tín hiệu học giám sát = nhãn tại từng client; FL chỉ thêm tầng phối hợp.
6. Reward ngoài "nhặt đúng" nên phạt "nhặt rác vật vô dụng" và "bỏ lỡ rác gần" — nếu chỉ thưởng nhặt, robot có thể nhặt bừa để ăn điểm; thiết kế reward sai dẫn hành vi lạ. (nguyên lý reward hacking — liên hệ đánh giá trung thực.)

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Học có giám sát:** có nhãn → học `x→y` (phân loại, hồi quy).
2. **Học không giám sát:** không nhãn → tìm cấu trúc/nhóm/đặc trưng.
3. **Học tăng cường:** tác tử + reward → học chuỗi quyết định.
4. Khung học giám sát 6 bước (dữ liệu → chia → mô hình → loss → train → đánh giá) áp cho mọi model sau này.
5. Trong lộ trình CV/FL/CL, nhánh chủ đạo là **giám sát**; sự khác biệt nằm ở *loại tín hiệu học*.

**Tự kiểm tra:**
- Ba nhánh khác nhau ở tín hiệu phản hồi như thế nào?
- Kể khung 6 bước của học giám sát.
- Vì sao accuracy trên 3 mẫu là không đáng tin?
- Trong FL, mỗi client học theo nhánh nào, tín hiệu là gì?

---

## 16. Đọc sâu bằng trực giác — phân nhánh theo tín hiệu phản hồi

Ba người cùng luyện tập nhưng nhận ba loại phản hồi khác nhau: một người có đáp án để đối chiếu, một người chỉ có dữ liệu thô để tự nhóm, một người nhận điểm thưởng sau chuỗi hành động. Tên "học có giám sát / không giám sát / tăng cường" mô tả đúng loại tín hiệu ấy, không phải tên của một thuật toán cụ thể.

| Tín hiệu có được | Nhánh | Ví dụ trong chương |
|---|---|---|
| Cặp `(x,y)` có nhãn đúng | Học có giám sát | Dự đoán khách quay lại từ hóa đơn |
| Chỉ có `x`, không có `y` | Học không giám sát | Nhóm khách theo hành vi |
| Phần thưởng sau hành động | Học tăng cường | Robot chọn bước dọn kho |

**Đọc thành lời:** học giám sát tối thiểu hóa trung bình `L(f(x),y)` trên các cặp có nhãn; học không giám sát không có `y` nên tối ưu một tiêu chí cấu trúc như độ gọn của nhóm hoặc khả năng tái tạo; học tăng cường tối đa tổng phần thưởng theo thời gian. Điều dễ đọc sai là thấy bài toán "dự đoán" là gán ngay vào giám sát: nếu không có nhãn đúng để so, đó không phải tín hiệu giám sát.

**Tính tay:** một bộ phân loại nhị phân dự đoán 5 mẫu có nhãn `[1,1,0,1,0]` lần lượt là `[1,1,0,0,0]`. Số dự đoán đúng là 4, nên accuracy `4/5=80%`. Nếu bỏ mẫu thứ tư, accuracy thành `3/4=75%`; chỉ đổi một mẫu mà con số đổi 5 điểm phần trăm, cho thấy tập quá nhỏ thì accuracy rất nhạy.

**Phản ví dụ:** thấy hai luật ngưỡng trong chương cùng đạt 3/3 trên ba hóa đơn rồi kết luận chúng tương đương. Với hóa đơn mới `chi_tiêu=5,5`, ngưỡng 5 dự đoán 0 còn ngưỡng 6 dự đoán 1; hai luật đã tách nhau. Accuracy hoàn hảo trên mẫu nhỏ không xác định được hành vi ngoài mẫu.

**Giới hạn:** ba nhánh không phải ba hộp kín. Self-supervised dùng tín hiệu sinh ra từ chính dữ liệu, semi-supervised trộn ít nhãn với nhiều mẫu chưa nhãn, và một hệ thống có thể kết hợp nhiều nhánh. Cái cần nhớ là câu hỏi đầu tiên: tín hiệu phản hồi thật sự là gì?

:::interactive branch
:::

:::quiz
Điều gì phân biệt học có giám sát với học không giám sát trong khung của chương này?
A. Có hay không có cặp đầu vào–nhãn đúng để tính loss.
B. Có dùng mạng nơ-ron hay không.
C. Có chạy trên GPU hay không.
Đáp án: A
Giải thích: Điểm khác cốt lõi là tín hiệu phản hồi: học giám sát có nhãn `y` để so với dự đoán; học không giám sát chỉ có `x` và tìm cấu trúc. Kiến trúc mạng hay GPU không quyết định nhánh.
:::

**Tự thử thêm:** một bộ phân loại dự đoán 6 mẫu có nhãn `[1,0,1,1,0,1]` lần lượt là `[1,0,1,0,0,1]`. Tính accuracy và cho biết nếu chỉ nhìn con số này thì chưa biết được điều gì về từng lớp.

:::goi-y
Đếm số vị trí trùng nhau giữa hai dãy, chia cho 6. Sau đó tự hỏi lớp 0 và lớp 1 có được dự đoán đúng như nhau không.
:::

:::loi-giai
Có 5 vị trí đúng trên 6, accuracy `5/6≈83,3%`. Con số này không cho biết precision/recall từng lớp; một lớp hiếm có thể bị bỏ sót gần hết mà accuracy vẫn cao.
:::