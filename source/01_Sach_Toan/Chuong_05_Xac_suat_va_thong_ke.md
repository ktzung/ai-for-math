# Chương 5 — Xác suất và thống kê (nhập môn)

> **Câu hỏi lớn của chương:** *Làm sao ra quyết định khi không biết chắc điều gì sẽ xảy ra — mà vẫn không bị "đoán mò"?*

---

## 1. Mở đầu bằng một tình huống

Một chị bác sĩ đa khoa. Một bệnh nhân đến khám với triệu chứng ho kéo dài. Chị không thể *chắc chắn* đó là cảm lạnh, viêm phổi, hay một thứ nghiêm trọng hơn — chưa có đủ xét nghiệm. Nhưng chị vẫn phải hành động: chỉ đơn thuốc, hoặc cho đi chụp phổi.

Chị làm sao ra quyết định giữa sự không chắc chắn? Chị dùng **thông tin sẵn có** (triệu chứng, tỉ lệ bệnh trong cộng đồng, tiền sử) để ước lượng khả năng mỗi khả năng — rồi chọn hành động hợp lý theo khả năng đó.

Khi bạn phân loại email, đề xuất phim, dự đoán mưa, hay khi máy nhận diện xem ảnh là "mèo" hay "chó", đều cùng một bản chất: *đưa ra quyết định với độ không chắc chắn không thể triệt tiêu.* **Xác suất** là ngôn ngữ để nói về sự không chắc chắn đó một cách *định lượng và trung thực* — không phải là "đoán mò", mà là "đo đúng mức ta không biết".

---

## 2. Trực giác trước

**Xác suất là "số đo niềm tin dựa trên thông tin".**

Khi bác sĩ nói "khả năng 60% đây là viêm phổi", chị không nói bệnh này "đúng một nửa" hay "đúng 60 lần". Chị nói: *với các triệu chứng đã thấy và kinh nghiệm cũ, viêm phổi là khả năng cao hơn cả."* Xác suất 60% là cách **chuẩn hóa niềm tin** thành một con số từ 0 đến 1, để so sánh và ra quyết định.

Cách hữu ích nhất để hình dung: **tần suất dài hạn.** Nếu có rất nhiều bệnh nhân "giống hệt" bệnh nhân này, thì (~khoảng) 60% trong số họ sẽ bị viêm phổi. Xác suất là "tỉ lệ dài hạn nếu lặp lại thật nhiều lần".

**Cách đo "trung bình" và "phân tán":**

- **Kỳ vọng (giá trị trung bình):** "nếu lặp vô cùng, trung bình tôi nhận được bao nhiêu?" Nghĩ như kết quả trung bình dài hạn của một trò dự đoán.
- **Phương sai / độ lệch chuẩn:** "kết quả quanh giá trị trung bình đó *rải* đến đâu?" Hai tập dữ liệu có thể cùng trung bình nhưng một cái "ổn định", một cái "rất dao động" — phương sai phân biệt chúng.

**Phép so sánh "xác suất = tỉ lệ dài hạn":** trực quan và chuẩn cho hiểu tần suất. **Giới hạn:** với những thứ chỉ xảy ra *một lần* (thời tiết ngày mai, một chuyến đi) không thể "lặp lại vô hạn" để đếm — nhưng ta vẫn gán xác suất như một *niềm tin có cơ sở*. Đó là cách nhìn **Bayes** (mục 5), nơi xác suất là mức độ tin cậy được cập nhật bằng bằng chứng.

---

## 3. Thử giải bằng cách chưa chính thức

**Tình huống của bác sĩ, không dùng ký hiệu:** Chị có kinh nghiệm: trong 10 người ho kéo dài đến khám, khoảng 3 người bị viêm phổi (30%), 5 người cảm lạnh (50%), 2 người khác (20%). Bệnh nhân này có triệu chứng nặng hơn thường lệ — chị phỏng đoán nâng khả năng viêm phổi lên ~45%.

Chị đã làm gì mà không biết? Chị ước lượng **xác suất tiên nghiệm** (từ tỉ lệ chung), rồi **cập nhật bằng thông tin mới** (triệu chứng) — đó chính là ý tưởng Bayes (mục 5). Chưa cần công thức, ta đã thấy: *xác suất không cố định; nó đổi khi có bằng chứng mới.*

Vấn đề là "ước bằng cảm giác" không chuẩn và không nhất quán — mỗi lần hơi khác. Máy cần *công thức hóa* việc cập nhật này để mọi lần đều đúng như nhau. Ký hiệu xác suất làm điều đó, và còn giúp phát hiện những sai lầm trực giác tinh vi (mục 8).

---

## 4. Đặt tên cho ý tưởng

- **Không gian mẫu (`Ω`):** danh sách *tất cả* kết quả có thể. Tung xúc xắc: `{1,2,3,4,5,6}`.
- **Biến cố:** một nhóm các kết quả (VD "ra số chẵn" = {2,4,6}).
- **Xác suất `P(A)`:** số 0–1 đo khả năng biến cố A xảy ra. `P` đọc "xác suất của A". Tổng xác suất của mọi kết quả = 1.
- **Biến ngẫu nhiên:** một đại lượng *nhận giá trị theo xác suất* — kết quả của việc gieo. Có thể là **rời rạc** (đếm được: số mặt) hoặc **liên tục** (đo được: cân nặng).
- **Phân phối (distribution):** mô tả "xác suất biến ngẫu nhiên nhận từng giá trị". Biểu diễn bằng bảng (rời rạc) hoặc đường cong (liên tục).
- **Kỳ vọng `E[X]`:** trung bình dài hạn của biến ngẫu nhiên X.
- **Phương sai `Var(X)` / độ lệch chuẩn:** mức phân tán quanh kỳ vọng.
- **Định lý Bayes:** công thức cập nhật xác suất khi có bằng chứng mới.
- **Hai loại phân phối quan trọng:** **Bernoulli** (có/không, 0/1) và **chuẩn (Gaussian)** (hình chuông, rất phổ biến trong dữ liệu tự nhiên và ML).

Cái cốt lõi cần nắm: **xác suất là con số 0–1, và nó được cập nhật khi có bằng chứng (Bayes)**. Kỳ vọng/phương sai là hai "số tóm tắt" của một phân phối.

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Xác suất và biến ngẫu nhiên

**Ký hiệu:**
- Biến ngẫu nhiên: viết hoa `X`.
- `P(X = x)` : xác suất X bằng đúng giá trị x.

Ví dụ biến `X` = kết quả tung xúc xắc. `P(X = 4) = 1/6`.

**Cách đọc "phân phối":** một bảng ghi gí trị và xác suất.

| X | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| P | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 |

*(Đồng đều: mỗi mặt có xác suất bằng nhau. Tổng cột xác suất = 1.)*

### 5.2 Kỳ vọng

**Ký hiệu:** `E[X]` đọc "kỳ vọng của X".

**Quy tắc (rời rạc):** nhân mỗi giá trị với xác suất của nó, rồi cộng dồn:

`E[X] = Σ x · P(X = x)` (lấy tổng theo mọi giá trị x).

**Tính cho xúc xắc:** `(1+2+3+4+5+6)×(1/6) = 21/6 = 3.5`.
**Diễn giải:** trung bình gieo nhiều lần → 3.5. (Không phải "kết quả quân 3.5" — không có mặt đó; đó là *trung bình dài hạn*.)

### 5.3 Định lý Bayes (cập nhật niềm tin)

**Bài toán bác sĩ.** Gọi:
- `D` = "bệnh nhân bị viêm phổi".
- `S` = "triệu chứng ho kéo dài".

**Trước bằng chứng:** `P(D) = 0.30` (xác suất tiên nghiệm — tỉ lệ chung trong cộng đồng).

**Khi thấy S:** ta muốn `P(D | S)` đọc "xác suất D *cho biết* S đã xảy ra" — đây là xác suất *có điều kiện* (conditioned on). Dấu `|` đọc "cho biết" hay "điều kiện trên".

**Định lý Bayes** (dạng dùng): với hai khả năng đối địch `D` và "không D" (kí hiệu `¬D`):

```
P(D|S) = [ P(S|D) · P(D) ] / [ P(S|D)·P(D) + P(S|¬D)·P(¬D) ]
```

**Giải thích từng phần:**
- `P(S|D)` — "độ nhạy": khả năng ho kéo dài *nếu* đúng là viêm phổi. (Định nghĩa từ dữ liệu y khoa.)
- `P(D)` — "tiên nghiệm": tỉ lệ viêm phổi trong cộng đồng.
- Mẫu số — tổng "các đường dẫn" đến triệu chứng S (hoặc qua D, hoặc qua ¬D), dùng để **chuẩn hóa** kết quả về 0–1.

**Vì sao ta cần công thức:** trực giác dễ sai — nhất là khi bệnh hiếm gặp (xem mục 8, bẫy "tỉ lệ dương tính giả"). Công thức đảm bảo máy không cập nhật nhầm.

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Tính kỳ vọng và phương sai

**Bài toán:** Biến ngẫu nhiên `Y` = số ca phin bán sáng ở quán (từ Chương 2). Phân phối:

| Y | 10 | 20 | 30 |
|---|---|---|---|
| P | 0.5 | 0.3 | 0.2 |

**Bước 1 — Kỳ vọng:** `E[Y] = 10×0.5 + 20×0.3 + 30×0.2 = 5 + 6 + 6 = 17`. → trung bình sáng bán ~17 ca.

**Bước 2 — Độ lệch so với trung bình (để đo phân tán):** lấy từng giá trị trừ 17: `−7, 3, 13`.

**Bước 3 — Bình phương độ lệch** (để mọi lệch đều dương): `49, 9, 169`.

**Bước 4 — Phương sai** = trung bình có trọng số của các bình phương độ lệch: `49×0.5 + 9×0.3 + 169×0.2 = 24.5 + 2.7 + 33.8 = 61`.

**Bước 5 — Độ lệch chuẩn** = căn bậc hai phương sai: `√61 ≈ 7.8`. → "dao động trung bình quanh 17 khoảng ±7.8 ca". (Dùng căn để đơn vị không bị bình phương.)

**Bước 6 — Giải thích:** kỳ vọng cho hay "điểm giữa", độ lệch chuẩn cho hay "rải cỡ nào" — hai con số cần thiết khi so sánh hai cái gì (thiết bị bán, hai model dự đoán).

### Ví dụ B — Bayes: bệnh hiếm & dương tính giả

**Bài toán:** Một test phát hiện bệnh hiếm (tỉ lệ trong dân 1%: `P(D)=0.01`). Test nhạy: nếu có bệnh, dương tính với 99% (`P(+|D)=0.99`). Test cũng "dương tính giả": nếu *không* bệnh, vẫn dương 5% (`P(+|¬D)=0.05`). Bệnh nhân test dương (+) — khả năng thật sự bị bệnh là bao nhiêu?

**Bước 1 — Ghi lại:** `P(D)=0.01`, `P(+|D)=0.99`, `P(¬D)=0.99`, `P(+|¬D)=0.05`.

**Bước 2 — Tính tử số (đường "đúng bệnh và test dương"):** `P(+|D)·P(D) = 0.99 × 0.01 = 0.0099`.

**Bước 3 — Tính mẫu số (tổng hai đường đến dương):** `(0.99×0.01) + (0.05×0.99) = 0.0099 + 0.0495 = 0.0594`.

**Bước 4 — Áp Bayes:** `P(D|+) = 0.0099 / 0.0594 ≈ 0.167`.

**Bước 5 — Kết luận gây ngạc nhiên:** dù test dương, chỉ **~16.7%** khả năng thật sự bị bệnh (không phải 99%). Vì bệnh hiếm: trong 10.000 người, có ~99 bệnh thật (được test bắt phần lớn), nhưng có `0.05×9901 ≈ 495` người khỏe mà test dương. Dương tính giả nhiều hơn bệnh thật → xác suất thật thấp hơn ta tưởng.

**Bước 6 — Vì sao quan trọng cho AI:** đây chính là bài toán *kiểm định/phân loại trong điều kiện mất cân bằng* — khi lớp hiếm (bệnh, spam rất khó), con số "đoán chuẩn" phải dùng Bayes để hiệu chỉnh. Liên hệ trực tiếp với Chương 5 sách này và G4.6 (mất cân bằng lớp) ở lộ trình FL/CL.

### Ví dụ C — Phân phối chuẩn (Gaussian) trực giác

**Bài toán:** Cân nặng của sinh viên hoặc đường kính sản phẩm đóng hộp — đo nhiều lần.

**Bước 1 — Nhận dạng:** hầu hết giá trị tập trung quanh trung bình, rất hiếm cực xa → hình chuông.

**Bước 2 — Ký hiệu:** phân phối chuẩn có dạng hình chuông, hoàn toàn mô tả bởi **kỳ vọng** (vị trí đỉnh) và **độ lệch chuẩn** (độ béo của chuông). Kí hiệu `N(μ, σ²)`.

**Bước 3 — Giải thích ký hiệu:** μ (mu) = kỳ vọng; σ (sigma) = độ lệch chuẩn. `N(μ,σ²)` đọc "phân phối chuẩn với trung bình μ và phương sai σ²".

**Bước 4 — Diễn giải:** khoảng ~68% dữ liệu nằm trong μ±σ, ~95% trong μ±2σ (quy tắc 68–95–99.7). Đây là khung để ước lượng và đọc bất thường.

**Bước 5 — Vì sao phổ biến trong ML:** nhiều đại lượng tự nhiên xấp xỉ chuẩn; các thuật toán (hồi quy, nhiều model) giả định nhiễu chuẩn. Hiểu hình dạng này giúp đọc "chuẩn hóa dữ liệu" (z-score) và đánh giá (p-value) dễ hơn về sau.

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

**Xác suất = ngôn ngữ của dự đoán không chắc chắn.** Một mô hình phân loại ảnh thường đầu ra không phải "mèo" mà là *phân phối xác suất*: 88% mèo, 10% chó, 2% khác. Chính `P(class | ảnh)` — dạng Bayes — ta gặp ở mục 5. Hiểu xác suất giúp bạn biết *như thế nào gọi là "tự tin đúng mức"* thay vì chỉ nhìn con số đầu ra.

**Kỳ vọng = "đầu ra trung bình dài hạn" của model.** Khi tối ưu hóa (Chương 8), hàm mất mát nhiều khi là kỳ vọng lỗi trên dữ liệu — ta kỳ vọng model trung bình sai ít.

**Phương sai ↔ bias–variance.** Trong học máy (Chương 2 lộ trình FL/CL), "phương sai lớn" ≈ overfitting (model quá nhạy với từng mẫu); "bias cao" ≈ underfitting. Hiểu phương sai là hiểu nửa còn lại của biểu đồ bias–variance.

**Bayes trong ML:** từ phân loại (Naive Bayes), đến cập nhật niềm tin (Bayesian), đến hiệu chỉnh trong mất cân bằng lớp. Mục Ví dụ B chỉ ra điều sau cùng rất rõ.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Đảo điều kiện:"** nhầm `P(bệnh | dương tính)` với `P(dương tính | bệnh)`. Chúng *khác nhau hoàn toàn* (Ví dụ B: 0.167 vs 0.99). Trực giác hay đánh tráo hai chiều này. Cách tránh: luôn hỏi *"cái nào là tiền đề (điều kiện)?"* Bayes chính là công cụ chuyển đổi giữa hai chiều.

**Nhầm 2: "Kỳ vọng là một giá trị có thể xảy ra."** Không. `E[X]=3.5` cho xúc xắc không phải "mặt 3.5" (không tồn tại). Nó là *trung bình dài hạn*. Đừng hiểu kỳ vọng như "giá trị phổ biến nhất".

**Nhầm 3: "Xác suất 0 nghĩa là không bao giờ, 1 nghĩa là luôn luôn."** Với *cách nhìn tần suất*, gần đúng vậy. Nhưng với *biến ngẫu nhiên liên tục*, xác suất của *một điểm chính xác* thường là 0 (vì vô hạn giá trị) — đó là nghịch lý hình học, không phải "không thể xảy ra". Phải dùng *khoảng* mới có xác suất dương. Đây là chỗ rất dễ bối rối khi gặp phân phối liên tục.

**Giới hạn của "xác suất = tỉ lệ dài hạn" (phép so sánh mục 2):** áp dụng tốt cho hiện tượng lặp được, nhưng với sự kiện *một lần* (trận bóng ngày mai) không "lặp vô hạn" được. Ở đó, xác suất là *niềm tin có cơ sở* (nhìn Bayes) — và nó không "đo được bằng đếm" mà bằng mức độ tin cậy. Đừng ép mọi xác suất vào khung tần suất (đếm).

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: ra quyết định dưới sự không chắc chắn (y tế, tài chính, thời tiết), diễn giải đầu ra của model (xác suất hơn nhãn cứng), đánh giá độ phân tán (rủi ro, chất lượng), hiểu bias–variance (Chương 2 lộ trình ML), đọc thống kê/báo cáo.

Nó **không nên áp dụng máy móc** khi: ta không có đủ thông tin để ước lượng xác suất mà lại "bịa con số" — gán xác suất cần *cơ sở*; khi áp dụng Bayes nhưng bỏ sót cập nhật tiên nghiệm (dẫn đến kết luận sai như Ví dụ B); và đừng dùng trung bình (kỳ vọng) mà bỏ qua phương sai khi rủi ro quan trọng.

---

## Đọc sâu — nhìn mẫu số để không đảo điều kiện

Một bộ lọc báo “đáng ngờ” không đồng nghĩa món hàng chắc chắn lỗi. Ta cần biết lớp lỗi phổ biến đến đâu và bộ lọc nhầm hàng tốt bao nhiêu. Cách dễ hiểu Bayes là đếm trên một nhóm giả định, rồi thu hẹp nhóm đúng theo điều kiện đang xét.

| Câu hỏi kiểm hàng | Tử số | Mẫu số cần dùng |
|---|---|---|
| Tỉ lệ hàng lỗi trong kho? | Số món lỗi | Tất cả món trong kho |
| Bộ lọc bắt được bao nhiêu hàng lỗi? | Món lỗi bị báo | Tất cả món lỗi |
| Món đã bị báo có khả năng lỗi bao nhiêu? | Món lỗi bị báo | Tất cả món bị báo, gồm báo nhầm |

**Đọc thành lời:** `P(L|B)=P(B|L)P(L)/P(B)` là “xác suất lỗi trong nhóm đã bị báo bằng phần giao vừa lỗi vừa bị báo, chia cho toàn bộ xác suất bị báo”. Điều kiện P(B)>0. Khi chia tổng thể thành lỗi L và không lỗi, mẫu số là `P(B|L)P(L)+P(B|không L)P(không L)`.

**Tính tay:** giả sử 1.000 món có 20 món lỗi. Bộ lọc bắt 90% món lỗi, tức 18; báo nhầm 10% trong 980 món tốt, tức 98. Có 116 món bị báo, nhưng chỉ 18 món lỗi: xác suất cần hỏi bằng `18/116=9/58≈15.52%`. Con số 90% là khả năng bắt lỗi trong nhóm lỗi, không phải độ đúng của mọi cảnh báo.

**Phản ví dụ:** nói “lọc bắt 90% lỗi, nên một món bị báo có 90% khả năng lỗi” đã đổi mẫu số từ 20 món lỗi sang 116 món cảnh báo. Nếu lớp lỗi phổ biến hơn, kết quả thay đổi dù giữ nguyên hai tỉ lệ hoạt động của bộ lọc. Vì thế phải báo cả tỉ lệ lớp và loại sai lầm khi diễn giải.

**Thử tương tác:** giữ chất lượng bộ lọc, thay tỉ lệ hàng lỗi ban đầu để thấy xác suất hậu nghiệm đổi mạnh. Đây là cùng một công thức Bayes với một prior khác.

:::interactive bayes
:::

**Giới hạn:** nếu mô hình đã đưa xác suất hậu nghiệm `P(L|đặc trưng)` được hiệu chuẩn đúng cho quần thể đang xét, không nhân thêm prior một lần nữa. Việc hiệu chỉnh khi quần thể đổi đòi hỏi giả định và dữ liệu, không chỉ một thao tác Bayes mặc định. Xác suất cũng khác quyết định: cùng một xác suất, chi phí bỏ sót và báo nhầm khác nhau có thể dẫn đến hành động khác nhau.

:::quiz
Trong ví dụ 1.000 món, xác suất một món thực sự lỗi khi đã bị báo là bao nhiêu?
A. 90%.
B. Khoảng 15.52%.
C. 2%.
Đáp án: B
Giải thích: Xét riêng 116 món bị báo; 18 món trong số ấy lỗi, nên lấy 18/116, không lấy 18/20.
:::

**Tự thử thêm:** email có xác suất spam đã hiệu chuẩn là 0.7. Gọi nhầm thư tốt thành spam mất 5 đơn vị, để sót spam mất 1. Hành động nào ít chi phí kỳ vọng hơn, giả sử các quyết định đúng không mất phí?

:::goi-y
Khi chuyển vào spam, sai nếu thư thực ra tốt. Khi giữ lại, sai nếu thư thực ra spam. Ghép đúng xác suất với đúng loại tổn thất.
:::

:::loi-giai
Chuyển vào spam có chi phí 0.3×5=1.5; giữ lại có chi phí 0.7×1=0.7. Giữ lại rẻ hơn theo giả định. Ngưỡng để chuyển vào spam là p>5/6, không phải mặc định 0.5.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Giải thích bằng lời: `P(viêm phổi | ho)` và `P(ho | viêm phổi)` khác nhau thế nào? Cái nào bác sĩ thực sự cần để chẩn đoán?
2. Một biến ngẫu nhiên rời rạc và một biến liên tục — cho ví dụ đời thường cho mỗi loại.
3. Kỳ vọng là gì? Vì sao `E[chấm xúc xắc] = 3.5` mà không phải là "một mặt"?

### Luyện tập (áp dụng vào bài toán mới)
4. Cho phân phối:

| X | 0 | 5 | 10 |
|---|---|---|---|
| P | 0.3 | 0.5 | 0.2 |

   Tính `E[X]` và phương sai/độ lệch chuẩn.

5. Bayes: test bệnh hiếm hơn — `P(D)=0.002`, `P(+|D)=0.98`, `P(+|¬D)=0.04`. Tính `P(D | +)`. So với Ví dụ B, kết quả thay đổi thế nào, và vì sao?

### Thử thách (liên hệ với máy tính/AI)
6. Một model phân loại email trả ra xác suất `P(spam | email) = 0.7`. Theo quan điểm Bayes, cách hợp lý để quyết định "đưa vào spam hay không" nếu mất một email quan trọng bị gọi nhầm là spam là mất gấp 5 lần để sót spam thật? *(Gợi ý: so sánh "chi phí kỳ vọng" của hai lựa chọn — dùng kỳ vọng như công cụ quyết định.)*
7. Giải thích bằng lời: vì sao một model đầu ra "chắc 99%" vẫn có thể rất sai khi lớp hiếm (như bệnh hiếm), và Bayes giúp hiệu chỉnh nó thế nào. Viết 4–6 câu.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Cái đầu = "nếu ho, khả năng viêm phổi" (chẩn đoán — cần cái này); cái sau = "nếu viêm phổi, khả năng ho". Đảo ngược hai cái này là nhầm phổ biến.
2. Rời rạc: số mặt khi tung xúc xắc, số ca phin bán. Liên tục: cân nặng, thời gian giao hàng (đo được, vô hạn giá trị).
3. Kỳ vọng = trung bình dài hạn. `3.5` vì tính trung bình theo xác suất; không phải một mặt tồn tại.
4. `E[X] = 0×0.3+5×0.5+10×0.2 = 4.5`. Độ lệch: `−4.5, 0.5, 5.5`; bình phương `20.25, 0.25, 30.25`; trung bình có trọng số `6.075+0.125+6.05`... tính: `20.25×0.3+0.25×0.5+30.25×0.2 = 6.075+0.125+6.05 = 12.25` = phương sai; σ=3.5.
5. Tử `0.98×0.002=0.00196`; mẫu `0.00196 + 0.04×0.998(=0.03992) = 0.04188`; `P ≈ 0.0468` (~4.7%). Cực thấp thậm chí với test rất nhạy — vì bệnh cực hiếm. So với Ví dụ B (16.7%) giảm nhiều vì `P(D)` nhỏ hơn.
6. Chi phí kỳ vọng "đưa vào spam": 0.7 → mất email quan trọng (×5): chi phí `0.7×5`. "giữ trong hộp thư": 0.3 × (cost sót spam, coi =1) = 0.3. So `0.7×5=3.5` vs `0.3` → giữ trong hộp rẻ hơn nhiều, nên đừng tự động bỏ spam dù xác suất 0.7. Bài học: quyết định không chỉ phụ thuộc xác suất mà cả *chi phí sai lầm*.
7. Gợi ý: với lớp hiếm (P(D) nhỏ), `P(class | input)` sai khác xa `P(input | class)`. Đầu ra "99% tự tin" là điều kiện *trên đặc trưng*; phải kết hợp xác suất tiên nghiệm của lớp (tỉ lệ bệnh/spam) bằng Bayes để có xác suất thật. Không dùng tiên nghiệm → đánh giá quá cao hiếm gặp.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. **Xác suất** = con số 0–1 đo độ không chắc chắn, có cơ sở từ thông tin — không phải đoán mò.
2. **Kỳ vọng** = "trung bình dài hạn"; **phương sai/độ lệch chuẩn** = "mức rải quanh trung bình".
3. **Bayes** = quy tắc cập nhật niềm tin khi có bằng chứng mới — và cực kỳ quan trọng để không bị bẫy "xác suất thật khác xác suất test".
4. Trong máy tính/ML, xác suất là cách model nói "tự tin đến mức nào"; hiểu nó giúp diễn giải đầu ra và tránh kết luận sai khi lớp hiếm.
5. Đừng nhầm hai chiều điều kiện; và đừng vứt bỏ phương sai khi rủi ro mới là điều bạn quan tâm.