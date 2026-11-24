# Chương 1 — Tư duy toán học và cách đọc ký hiệu

> **Câu hỏi lớn của chương:** *Công thức "khô khan" đó thực ra đang thì thầm điều gì?*

---

## 1. Mở đầu bằng một tình huống

Bạn mở điện thoại ra thấy dòng thông báo:

> «Đơn hàng của bạn đang được giao. **Dự kiến đến trong 15 phút.**»

Bạn gật đầu và tiếp tục sống. Nhưng khoan — máy làm sao biết sẽ đến sau 15 phút? Nó không nhìn thấy tương lai. Nó chỉ có: vị trí của tài xế, quãng đường còn lại, tốc độ trung bình, và lịch sử của những lần giao hàng trước. Từ mấy thứ lộn xộn đó, bằng cách nào nó phát ra một con số có vẻ "chắc chắn" như 15 phút?

Câu trả lời ngắn gọn: nó **làm một bài toán**. Và hầu hết mọi thứ bạn thấy "thông minh" xung quanh mình — đề xuất phim, phân loại email, nhận diện khuôn mặt, nén ảnh — đều là bài toán được tô vẽ dưới nhiều lớp giao diện đẹp đẽ.

Có một vấn đề: cái "bài toán" đó được viết bằng **một ngôn ngữ riêng** — ngôn ngữ toán học. Với ký hiệu như `Σ`, `f(x)`, `∈`, `→`. Với nhiều người, ngôn ngữ này trông như một bức tường gạch ngăn họ với "đám người thông minh". Sách này được viết để **phá bức tường đó**.

Và điều đầu tiên bạn cần biết: **một công thức không phải là một mật mã.** Nó là một câu chuyện, được ghi lại bằng chữ viết tắt rất gọn. Công việc của chương này — và của cả cuốn sách — là dạy bạn **dịch** ký hiệu thành lời, rồi dần dà đọc trực tiếp.

---

## 2. Trực giác trước

Hãy nghĩ về chữ viết của loài người. Trước khi có bảng chữ cái, người ta vẽ con bò lên vách đá — đó là **tình huống thực tế**. Sau đó rút gọn thành một hình bò đơn giản — đó là **ý tưởng**. Rồi rút gọn hơn nữa thành một ký hiệu trừu tượng — đó là **ký hiệu**. Từ con bò đầy đủ đến ký hiệu, mất rất nhiều chắt lọc.

Toán học làm y hệt vậy, chỉ nhanh hơn và gọn hơn.

- **Câu chuyện:** "Nếu bạn có 3 quả táo và tôi cho bạn thêm 2 quả, bạn có bao nhiêu?" → **Ý tưởng:** cộng thêm → **Ký hiệu:** `3 + 2 = 5`.

Con số `3` không phải là "số ba trừu tượng kỳ bí" — nó là cách ngắn gọn để nói "ba quả táo, ba đô, ba ki-lô-mét". Cộng `+` là cách nói gọn của "cho thêm" hay "gộp lại". Dấu `=` là cách nói "tổng cộng thì bằng".

Ký hiệu toán không tồn tại để gây khó. Nó tồn tại để **đóng gói nhiều câu chuyện dài vào một dòng ngắn**, để ta có thể nhìn nhanh và so sánh. Vấn đề không phải ký hiệu khó — mà là ta ít khi được dạy **bản dịch nội tâm**: mỗi ký hiệu, trong đầu phải có một hình ảnh kèm theo.

> **Nguyên tắc vàng của cả cuốn sách:** *Trước khi đọc một ký hiệu, hãy tìm bản dịch tiếng Việt của nó. Nếu bạn không thể nói nó bằng lời, thì bạn chưa hiểu nó — dù bạn có biết cách giải.*

Hãy giữ phép so sánh "ký hiệu = chữ viết tắt của câu chuyện" trong đầu. Nó hữu ích, nhưng cũng có **giới hạn**: không như chữ viết thông thường, toán học yêu cầu chính xác *tuyệt đối* — không có chỗ cho "ý đại khái". Một chữ "bovê" trong tin nhắn vẫn hiểu được; nhưng thiếu một dấu ngoặc trong công thức là sai hẳn. Ta sẽ quay lại điều này ở mục 8.

---

## 3. Thử giải bằng cách chưa chính thức

Đừng gấp — chưa cần ký hiệu phức tạp. Trước khi chương này giới thiệu "bảng dịch ký hiệu", hãy tự trải nghiệm cách đọc một công thức *bằng tiếng Việt*.

**Ví dụ chạy thử.** Bạn thấy dòng này trong tài liệu kỹ thuật về học máy:

```
Error = (prediction − truth)²
```

Trước khi biết `²` là "bình phương", hãy thử nói to bằng tiếng Việt:

- `Error` — *"lỗi"*, con số đo sự sai.
- `prediction` — *"dự đoán"*, con số máy đưa ra.
- `truth` — *"sự thật"*, con số đúng thực tế.
- `−` — *"trừ đi"*: dự đoán lệch sự thật bao xa.
- `²` — *"bình phương"*: nhân giá trị đó với chính nó (ta sẽ hiểu vì sao ở Chương 2 và 4; tạm coi nó là "làm cho mọi lệch đều thành số dương và phóng to sai lệch lớn").

Nếu đọc trơn tru theo kiểu người:
> *«Sai số bằng bình phương của (dự đoán trừ đi sự thật)»*

Bây giờ bạn đã **đọc được** một công thức học máy đầu tiên mà không cần biết nó đến từ đâu. Thậm chí bạn còn đoán được *ý nghĩa*: ta muốn con số lỗi này nhỏ đi thì dự đoán càng gần sự thật. Đó chính là la bàn của cả một mảng lớn ngành học máy (Chương 8 sẽ làm rõ).

Ta vừa làm một việc quan trọng: **không giải bài toán, mà giải bài toán "đọc".** Kỹ năng này dạy được, và chương này là nơi bắt đầu.

---

## 4. Đặt tên cho ý tưởng

Những hành động ta vừa làm có tên gọi riêng trong toán.

| Hành động ta làm | Tên gọi | Định nghĩa bằng lời |
|---|---|---|
| Tìm bản dịch tiếng Việt cho từng ký hiệu | **Diễn giải ký hiệu** (interpretation) | Gắn một ý nghĩa ngôn ngữ thường cho từng ký hiệu |
| Tách công thức thành các mảnh nhỏ có nghĩa | **Phân rã biểu thức** (parsing) | Chia biểu thức thành các thành phần, rồi đọc theo thứ tự |
| Gán hình ảnh tinh thần cho khái niệm | **Trực giác** (intuition) | Hình dung khái niệm bằng 1 hình ảnh/so sánh quen thuộc |
| Cách chính xác, không mơ hồ, dùng ký hiệu | **Định nghĩa** (definition) | Câu khai báo đúng nghĩa của khái niệm, ai cũng đồng thuận |

Hai ý tưởng trung tâm của chương này cần được "đặt tên":

1. **Biến số (variable):** một *chỗ trống để chứa một giá trị chưa biết hoặc thay đổi được*. `x` thường dùng để chứa "đầu vào"; `f(x)` đọc là "hàm số của x", nghĩa là "một cỗ máy nhận x vào và trả ra kết quả". Khi thấy `x`, đừng sợ — hãy nghĩ "đây là một chỗ trống; tôi có thể nhét 3, hay 7, hay bất kỳ số nào vào".

2. **Hàm số (function):** một *quy tắc biến đổi đầu vào thành đầu ra*, luôn cho cùng một đầu ra nếu cùng một đầu vào. Nghĩ như một chiếc máy ép nước trái cây: bỏ cam vào → ra nước cam; bỏ táo vào → ra nước táo; có quy tắc cố định. Toàn bộ trí tuệ nhân tạo hiện đại có thể được tóm gọn là: *tìm một hàm `f` thật tốt, nhận dữ liệu vào và trả ra câu trả lời đúng.* (Chương 2 đi sâu vào hàm.)

Giờ hãy giới thiệu **bảng dịch các ký hiệu thường gặp** — đây là "từ điển bỏ túi" của bạn cho cả cuốn sách.

---

## 5. Từ câu chuyện đến ký hiệu

### Bảng dịch ký hiệu cốt lõi

Mỗi dòng dưới đây: *ký hiệu → đọc là → nghĩa bằng tiếng Việt (với một hình ảnh đi kèm)*.

| Ký hiệu | Đọc to là | Nghĩa trong đầu (hình ảnh) |
|---|---|---|
| `=` | *bằng* | hai thứ cùng một giá trị; "cân thăng bằng" |
| `≠` | *khác* | hai thứ không cùng giá trị |
| `≈` | *xấp xỉ bằng* | gần bằng, sai khác chút ít; "làm tròn tạm" |
| `<` , `>` | *bé hơn / lớn hơn* | so sánh về phía nhỏ/ phía lớn |
| `≤` , `≥` | *bé hơn hoặc bằng / lớn hơn hoặc bằng* | so sánh kèm khả năng bằng |
| `+` , `−` | *cộng / trừ* | gộp vào / bớt đi |
| `×` , `·` | *nhân* | lặp lại phép cộng, hoặc "kết hợp theo tỉ lệ" |
| `/` | *chia* | chia phần |
| `x` | *ích* | một chỗ trống để chứa giá trị chưa biết |
| `x²` | *ích bình phương* | `x × x`, nhân giá trị với chính nó |
| `√x` | *căn bậc hai của ích* | số mà khi nhân với chính nó ra x |
| `f(x)` | *ép của ích* | kết quả của "cỗ máy" f khi ta nhét x vào |
| `Σ` | *xích-ma, "tổng"* | **cộng dồn** tất cả các mục theo danh sách |
| `∈` | *thuộc* | nằm trong tập hợp đó |
| `→` | *tiến tới / ánh xạ đến* | đi về phía; nhận đầu vào đưa ra đầu ra |
| `∀` | *với mọi / với tất cả* | đúng cho từng trường hợp trong nhóm |
| `∃` | *tồn tại* | có ít nhất một trường hợp như vậy |
| `n!` | *n giai thừa* | nhân các số 1..n lại với nhau (đếm cách sắp xếp) |

Hai ký hiệu cần dừng lại lâu hơn vì chúng xuất hiện khắp nơi trong học máy.

### Ký hiệu cộng dồn `Σ` (đọc: xích-ma)

Xích-ma là *con rồng đầu tiên* mà hầu hết người mới học máy gặp. Hãy khử sợ nó.

- **Câu chuyện:** bạn có điểm 3 môn: Toán 8, Lý 7, Hóa 9. Muốn biết tổng? Bạn viết `8 + 7 + 9 = 24`.
- **Ký hiệu gọn:** `Σ xᵢ` đọc là *"xích-ma của x-i"*, hiểu là *"cộng dồn tất cả các giá trị x lại"*.

Hãy đọc từng phần:
- `Σ` — "cộng dồn tất cả".
- `xᵢ` — giá trị thứ `i` trong danh sách. Chỉ số nhỏ `i` (`ᵢ`) là "con số định danh" — vị trí trong hàng. `x₁` = giá trị thứ nhất (8), `x₂` = thứ hai (7), `x₃` = thứ ba (9).
- `i = 1` ở phía dưới — *bắt đầu từ mục 1*.
- `n` ở phía trên — *chạy cho đến mục thứ n* (hết danh sách).

Vậy `Σ xᵢ` (từ i=1 đến n) có nghĩa: *"lấy từng giá trị từ mục 1 đến mục n, cộng tất cả lại."*

Nếu danh sách chỉ có 3 phần, nó chính là `8 + 7 + 9`. Xích-ma chỉ là **cách viết cộng dồn gọn cho một danh sách bất kỳ dài bao nhiêu** — kể cả hàng triệu phần tử. Máy học thì thường cộng dồn "sai số" của hàng nghìn mẫu — đây là lý do `Σ` xuất hiện trong hầu hết công thức mất mát (Chương 4, 8).

### Ký hiệu "thuộc" `∈` và "ánh xạ" `→`

- Nếu `A` nghĩa là *"tập hợp các bạn sinh viên trong lớp"*, thì câu `Lan ∈ A` đọc là *"Lan thuộc tập hợp A"*, nghĩa là "Lan là một sinh viên trong lớp". `∈` kiểm tra "một thứ có nằm trong một nhóm không".
- `→` mô tả "điều gì trở thành điều gì". `x → y` đọc là "x ánh xạ đến y" hay "từ x ra được y". Trong lập trình, cách viết `input → output` hay `x → f(x)` truyền đạt ý "đưa dữ liệu vào, ra kết quả" — đúng tinh thần của hàm số.

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Dịch một câu thành ký hiệu

**Bài toán:** Viết thành ký hiệu: *"Tổng số tiền chi cho mỗi món trong hóa đơn của bàn tiệc."*

**Bước từng bước:**

1. **Đặt tên cho "thứ" đang nói:** mỗi món là một giá trị chi phí. Ta gọi giá món thứ `i` là `cᵢ` (c = chi phí).
2. **Xác định phạm vi:** có `n` món trong hóa đơn.
3. **Dịch "tổng ... lại"** thành ký hiệu cộng dồn:
   `Σ cᵢ` (với i chạy từ 1 đến n).
4. **Ghi chú bằng lời:** "dấu xích-ma ở đây nói lên: cộng c₁, c₂, ... , cₙ lại với nhau." → Kết quả: chữ cuối hóa đơn.

**Điểm trọng tâm:** mỗi ký hiệu đều có đối tác tiếng Việt rõ ràng. Nếu làm ngược (nhìn `Σ cᵢ` và nói "cộng các chi phí lại"), bạn đã thành thạo bước đầu.

### Ví dụ B — Đọc một "công thức dự đoán"

**Bài toán:** Ta thấy công thức: `y = 2x + 1`. Một máy dùng nó để dự đoán `y` (VD thời gian giao hàng tính theo phút) từ `x` (tổng số lần phải dừng tại đèn đỏ).

**Bước từng bước:**

1. **Đọc to toàn bộ:** *"y bằng hai nhân x cộng một."*
2. **Đọc từng phần:**
   - `2x` = "hai nhân x" = gấp đôi số lần dừng.
   - `+ 1` = "cộng một" = mỗi chuyến kiểu gì cũng có 1 phút khởi động.
3. **Thử một số cụ thể (thay x):** nếu xe dừng `x = 3` lần → `y = 2×3 + 1 = 6 + 1 = 7` phút.
   *(Khi thấy `x`, nhớ "chỗ trống": nhét 3 vào, cỗ máy trả ra 7.)*
4. **Thử x = 0:** `y = 2×0 + 1 = 1` phút. (Không dừng đèn nào thì vẫn mất 1 phút — hợp lý cho phép "khởi động".)
5. **Kiểm tra tính hợp lý:** thời gian tăng khi số lần dừng tăng — đúng trực giác giao hàng. *(Quy tắc: luôn kiểm tra số đã ra có "nghe hợp lý" không.)*

**Điểm trọng tâm:** công thức là mô hình dự đoán nhỏ nhất — nhét đầu vào `x`, nhận đầu ra `y`. Cả học máy đều xoay quanh câu chuyện "tìm hàm như thế này cho thật chuẩn".

### Ví dụ C — Ước lượng (không cần công thức đầy đủ)

**Bài toán:** Trước khi có máy, dự đoán thời gian đến bằng cách nào? Câu chuyện ban đầu.

**Bước từng bước:**
1. Bạn thấy quãng đường còn lại ~10 km, xe trung bình chạy ~40 km/h.
2. Dùng quy tắc đơn giản: "thời gian ≈ quãng đường ÷ tốc độ" → `10 ÷ 40 = 0.25` giờ = **15 phút**. 
3. Con số `15` khớp với thông báo đầu chương. Dấu `≈` (xấp xỉ) dùng vì đây là ước lượng, không phải sự thật tuyệt đối.

Đây là **mô hình hóa** (Chương 2 đi sâu): biến tình huống thành phép tính. Ngay cả máy tính cũng chẳng hơn bạn là bao về bản chất — chỉ là nó có thêm lịch sử để tinh chỉnh con số. Chương 8 sẽ cho bạn thấy cách "tinh chỉnh" đó thực sự diễn ra.

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

Mọi chương trình "thông minh" bạn thấy đều có thể đứng sau đó là một câu chuyện toán:

- **Phân loại email spam:** máy tính mỗi email thành một danh sách số (đếm từ, độ dài, ...). Đó là **biến số** — nhiều biến, gọi chung là *vector* (Chương 3). Rồi máy so sánh với quy tắc đã học: nếu tổng trọng số `Σ (trọng số × đặc trưng)` vượt ngưỡng thì là spam. Toàn bộ bằng cách cộng dồn — chính là `Σ`.
- **Dự đoán giao hàng (câu chuyện đầu chương):** máy dùng một hàm `f` — giống `y = 2x + 1` nhưng phức tạp hơn — nhận rất nhiều đầu vào, ra con số "15 phút". Cách nó biết "dùng hàm nào" chính là **học máy** (Chương 8).
- **Hàm số là xương sống:** lập trình viên viết hàm để gói logic; máy học *đi tìm hàm* bằng dữ liệu. Hai việc cùng một chữ `f(x)`, nhưng một bên do người viết, một bên do máy tự tìm. Đó là ý tưởng làm thay đổi cả ngành.

**Kết luận cho chương này:** trước khi học bất kỳ thứ gì phức tạp — ma trận, đạo hàm, xác suất — hãy nhớ rằng tất cả đều là *ngôn ngữ ghi chép chuyện thật*. Đừng bỏ ký hiệu, nhưng cũng đừng để ký hiệu lấn át chuyện thật.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Ký hiệu càng khó thì ý tưởng càng khó."** — Sai. Ký hiệu rườm rà đôi khi chỉ là *cách ghi gọn* một ý tưởng đơn giản. `Σ` nghe "to tát" nhưng chỉ là "cộng dồn". Đừng đo độ khó của ý tưởng bằng độ dáng vẻ của ký hiệu. Phân biệt: *trực giác* (dễ) và *kí hiệu* (chỉ là cách ghi) với *kiến thức nền bên trong* (đôi khi thật sự khó) — đừng gộp ba thứ này.

**Nhầm 2: "Dấu `=` nghĩa là hai vế 'giống nhau về mặt ngôn từ'."** — Sai. `=` nghĩa là *"hai biểu thức này cho cùng một giá trị số"*, không phải "trông giống nhau". Ví dụ `2 + 2` và `4` trông khác nhau nhưng `2 + 2 = 4` đúng. Và trong máy học, ta còn gặp `≈` (xấp xỉ) — nói rõ "gần bằng", không phải "bằng". Phân biệt đúng `=` (chính xác) và `≈` (ước lượng) — một dấu khác là một khái niệm khác.

**Nhầm 3 (thường gặp khi đọc công thức): "Nhìn rồi nhảy thẳng tới con số cuối."** — Bỏ qua bước "dịch thành lời" rồi chăm chăm vào đáp án. Cách đúng: *đọc từng ký hiệu bằng tiếng Việt trước*, giải thích từng chữ, rồi mới tính. Nếu không nói được ý nghĩa, bạn đang "nhìn số" chứ chưa "đọc toán".

**Giới hạn của phép so sánh "ký hiệu = chữ viết tắt" trong chương này:** trong ngôn ngữ thường, "từ" có linh hoạt, mơ hồ; trong toán, mỗi ký hiệu phải được *định nghĩa chính xác* trước khi dùng, và một cặp dấu ngoặc sai có thể biến một công thức đúng thành sai. So sánh này dùng để *tiếp cận*, không dùng để *đo độ nghiêm ngặt*.

---

## 9. Khi nào ý tưởng này hữu ích?

Nó hữu ích trong **mọi lúc bạn gặp một công thức**:

- Khi đọc tài liệu lập trình/khoa học: biết bản dịch tiếng Việt của `Σ`, `∈`, `f(x)`, `→` giúp bạn không bỏ cuộc ở dòng đầu tiên.
- Khi nhìn dashboard kinh doanh: tỉ lệ, tổng, trung bình (`Σ` gộp dữ liệu lại) — hiểu chúng là đọc được báo cáo.
- Khi học các chương sau (đạo hàm, ma trận, xác suất): bạn đã có "phản xạ dịch ký hiệu", nên không bị choáng.

**Khi nào không nên áp dụng máy móc:** đừng nhồi thuộc "bảng dịch" rồi nghĩ mình đã học toán. Bảng dịch chỉ là dĩa khởi động. Giá trị thật nằm ở chỗ dùng nó để *hiểu câu chuyện* phía sau mỗi công thức — và hiểu một công thức khác hẳn với "nhận diện" một công thức.

---

## Đọc sâu — một công thức là một quy trình có điều kiện

Trước khi tính, hãy hỏi: ta đang cộng những gì, đang xét bao nhiêu đối tượng, và kết quả dùng đơn vị nào? Chỉ đọc tên ký hiệu chưa đủ; cần giữ đúng phạm vi của chúng. Trong một công thức có tổng, chỉ số i giống số thứ tự của từng món hàng, không phải một đại lượng cần đo.

| Cảnh đời thực | Thành phần toán học | Câu hỏi để hiểu đúng |
|---|---|---|
| Cộng tiền ba món trong giỏ | Tổng `Σ` trên một danh sách | Mỗi món xuất hiện một lần hay có số lượng? |
| Chia đều tiền thuê nhà | Chia tổng cho số người | Có ai trả phần cố định riêng không? |
| Chấm lỗi dự đoán giao hàng | Trung bình bình phương sai số | Sai số đang tính bằng phút hay giây? |

**Đọc thành lời:** `L = (1/n) Σᵢ₌₁ⁿ (ŷᵢ−yᵢ)²` là “với từng mẫu từ một đến n, lấy dự đoán trừ thực tế, bình phương, cộng lại rồi chia n”. `ŷᵢ` là dự đoán của mẫu i; `yᵢ` là giá trị thật cùng mẫu. Điều kiện n>0 giúp phép chia có nghĩa. Thứ tự “bình phương rồi cộng” quyết định ta đang đo điều gì.

**Tính tay:** dự đoán hai chuyến mất 12 và 18 phút, thực tế 10 và 20 phút. Hai sai số là 2 và −2 phút; bình phương thành 4 và 4 phút²; trung bình là `(4+4)/2=4` phút². Căn bậc hai của kết quả bằng 2 phút, gọi là RMSE, có đơn vị dễ liên hệ với thời gian ban đầu hơn.

**Phản ví dụ:** nếu cộng sai số trước rồi bình phương, ta được `(2−2)²=0`. Hai dự đoán đều sai nhưng sự bù trừ che mất lỗi. Tương tự, `Σ xᵢ²` khác `(Σ xᵢ)²`. Một dấu ngoặc không chỉ đổi cách đọc mà đổi hẳn câu hỏi.

**Giới hạn:** bình phương khiến mọi sai số thành số **không âm**, bao gồm 0; không phải lúc nào cũng phóng to giá trị số. Sai số 0.5 bình phương thành 0.25. Việc nó phạt tương đối mạnh sai số lớn cần hiểu khi so các sai số trong cùng thang đo. Công thức còn không nói dữ liệu có đại diện cho ngày mai hay không: đọc đúng phép tính là bước đầu để đánh giá mô hình, chưa phải bằng chứng mô hình tốt.

:::interactive formula
:::

:::quiz
Với hai sai số dự đoán là 2 và −2 phút, MSE bằng bao nhiêu?
A. 0 phút², vì hai sai số triệt tiêu.
B. 4 phút², vì bình phương từng sai số rồi mới lấy trung bình.
C. 8 phút, vì cộng hai bình phương.
Đáp án: B
Giải thích: MSE=(2²+(−2)²)/2=4 phút²; không được đưa tổng ra ngoài bình phương.
:::

**Tự thử thêm:** ba sai số là 1, −1, 2 phút. Hãy đọc công thức MSE bằng lời trước khi thay số.

:::goi-y
Bình phương riêng từng số; đếm đúng ba mẫu rồi mới chia. Kiểm tra đơn vị của kết quả.
:::

:::loi-giai
Ba bình phương là 1, 1, 4. Tổng bằng 6; MSE=6/3=2 phút². Sai số trung bình có dấu là (1−1+2)/3=2/3 phút, là một đại lượng khác.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Đọc to bằng tiếng Việt và giải thích từng từ: `total = a + b + c`.
2. `Σ xᵢ` (i từ 1 đến 3) nghĩa là gì? Viết ra bằng phép cộng cụ thể.
3. Câu "Lan ∈ lớp học" — dấu `∈` nói điều gì? Kí hiệu nào thay thế nếu ta muốn nói "Lan **không** thuộc"?

### Luyện tập (áp dụng vào bài toán mới)
4. Dịch sang ký hiệu: *"Tổng doanh thu của 5 cửa hàng"* (gợi ý: đặt tên `dᵢ` cho doanh thu cửa hàng thứ i, dùng `Σ`).
5. Cho `y = 3x − 2`. Tính `y` khi `x = 0`, `x = 2`, `x = 5`. Diễn giải bằng lời kết quả khi `x=0`.
6. Một công thức: `loss = (y − ŷ)²`. Dịch ra tiếng Việt từng ký hiệu. `ŷ` (đọc "y mũ") thường là dự đoán, `y` là giá trị đúng. Lỗi nhỏ nhất có thể là bao nhiêu, khi nào đạt?

### Thử thách (liên hệ với máy tính/AI)
7. Trong câu chuyện mở đầu, giả sử máy dùng công thức `t = 0.2·d + 1.5` (phút) với `d` = số đèn đỏ phải dừng. Tính thời gian dự đoán khi `d = 5`. Nếu bạn biết thực tế chuyến đó mất 3.5 phút, bạn nghĩ máy "sai" bao nhiêu? Đề xuất bằng lời một cách làm cho máy "học" để sai ít hơn. *(Gợi ý la bàn: ta muốn tìm số nào trong công thức để làm ra kết quả khớp hơn với thực tế?)*

### Đáp án / gợi ý (phần riêng — hãy tự thử trước)

:::loi-giai
1. *"Tổng bằng a cộng b cộng c"* — nói thêm: gộp ba giá trị a, b, c lại.
2. `x₁ + x₂ + x₃`.
3. "Lan thuộc/nằm trong lớp học"; `∉` đọc "không thuộc".
4. `Σ dᵢ` (i = 1..5).
5. x=0→y=−2; x=2→y=4; x=5→y=13. Khi x=0, y=−2: "với đầu vào bằng 0, đầu ra là −2".
6. *"Lỗi bằng bình phương của (y trừ y-mũ)"* — tức bình phương độ lệch giữa giá trị đúng và dự đoán. Lỗi nhỏ nhất = 0, đạt khi `y = ŷ` (dự đoán khớp chính xác).
7. `t = 0.2×5 + 1.5 = 2.5` phút. Thực tế 3.5 → máy sai `0.2×...` — chênh `3.5 − 2.5 = 1` phút. Để học tốt hơn: giảm bớt đóng góp của `0.2` (giá trị này đang làm dự đoán nhỏ quá) hoặc điều chỉnh hằng số khởi động — ý đó chính là "điều chỉnh tham số bằng cách giảm sai số", nền móng của Chương 8.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. Toán là một *ngôn ngữ ghi chép chuyện thật*: từ tình huống → ý tưởng → ký hiệu.
2. Khi gặp ký hiệu, hãy tự hỏi: *"Cái này dịch thành tiếng Việt là gì?"* — `Σ` = cộng dồn, `f(x)` = cỗ máy nhận x ra kết quả, `∈` = nằm trong, `→` = đưa vào đưa ra.
3. Một công thức là một *câu chuyện ghi gọn*; đừng nhảy thẳng tới đáp số mà hãy đọc từng từ.
4. Ký hiệu khó ≠ ý tưởng khó — đừng bị vẻ ngoài "to tát" dọa.
5. Cả học máy về bản chất là: *tìm một hàm mà từ đầu vào cho ra câu trả lời đúng* — khởi đầu từ cách bạn vừa đọc `y = 2x + 1`.