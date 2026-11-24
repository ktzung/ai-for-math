# Chương 6 — Toán rời rạc và logic

> **Câu hỏi lớn của chương:** *Máy tính "suy nghĩ" bằng những khối logic rời rạc như thế nào — và làm sao biết một suy luận là đúng?*

---

## 1. Mở đầu bằng một tình huống

Một anh làm app quản lý đơn hàng. App của anh có một chức năng: hệ thống tự gửi email nhắc nếu một đơn **quá hạn** và **chưa thanh toán**. Anh viết đại ý bằng lời:

> "Nếu đơn quá hạn và chưa thanh toán, hãy gửi nhắc. Nếu đã thanh toán, đừng gửi nhắc. Nếu không quá hạn thì cũng đừng gửi."

Nghe có vẻ rõ, nhưng anh vướng một câu hỏi: *"Làm sao chắc chắn tập hợp luật này không có lỗ hổng — ví dụ trường hợp 'quá hạn, chưa thanh toán nhưng khách đã hủy'? Hay hai luật mâu thuẫn nhau?"*

Đây là bài toán **logic + toán rời rạc**. Máy tính không "hiểu" tiếng Việt: mọi luật kinh doanh phải được gói thành những **mệnh đề chính xác, không mơ hồ**, và chứng minh rằng chúng không mâu thuẫn. Toàn bộ lập trình — điều kiện `if`, vòng lặp, cấu trúc dữ liệu, chứng minh thuật toán đúng — đứng trên nền này.

---

## 2. Trực giác trước

**Logic là "nghệ thuật suy luận không sai".**

Bạn đã suy luận logic mỗi ngày mà không biết tên:
- *"Mọi sinh viên CNTT đều biết Python. Lan là sinh viên CNTT. Vậy Lan biết Python."* — đây là **suy luận** đúng.
- *"Nếu đơn quá hạn → gửi nhắc."* — đây là một **mệnh đề có điều kiện**.

Máy tính không "tin tưởng" gì; nó chỉ **áp dụng quy tắc một cách máy móc, chính xác**. Điều khiến máy khác người: nó không bao giờ bị "cảm giác" làm lệch — nhưng nó cũng *mù với ý nghĩa*: nó chỉ thao tác đúng cú pháp. Vì vậy, người làm phần mềm phải *thiết kế luật đúng từ đầu*, nếu không máy sẽ trung thành áp dụng cả luật sai.

**Toán rời rạc** nghiên cứu những đối tượng **đếm được, tách rời** (số nguyên, tập hợp, đồ thị, văn bản) — trái ngược với "liên tục" ở Chương 4 (thời gian, khoảng cách đo được). Vì máy tính lưu trữ mọi thứ bằng **những đơn vị rời rạc** (bit, byte, phần tử), toán rời rạc là "toán của máy tính" theo nghĩa trực tiếp nhất.

**Phép so sánh "logic = bộ luật chơi cờ":** một bộ luật rõ ràng, ai áp cũng ra cùng kết quả, không mơ hồ. **Giới hạn:** bộ luật cờ vẫn để người chơi "chọn" nước đi (chiến lược, ý nghĩa); logic hình thức thì *không có ý nghĩa* — chỉ có đúng/sai theo cú pháp. Đừng tìm "ý nghĩa đời sống" bên trong logic hình thức, nó nằm ngoài phạm vi.

---

## 3. Thử giải bằng cách chưa chính thức

**Bài toán app đơn hàng, chưa dùng ký hiệu:** anh muốn liệt kê *mọi tình huống* để chắc chắn luật bao phủ hết. Anh lập bảng các khả năng:

- Đơn quá hạn? (Có / Không)
- Đã thanh toán? (Có / Không)
- Đã hủy? (Có / Không)

Với 3 câu hỏi mỗi cái có/không → **2×2×2 = 8 trường hợp**. Anh duyệt từng dòng, quyết định gửi nhắc hay không. Khi liệt kê đủ, anh **chứng minh bằng tay** rằng luật "không có trường hợp lọt". Cách "liệt kê toàn bộ khả năng rồi kiểm từng cái" chính là **bảng chân trị** và **quy nạp/duyệt** — cốt lõi của toán rời rạc.

Vấn đề: khi có nhiều biến, "liệt kê" bùng nổ (10 biến → 1024 dòng; 20 biến → hơn 1 triệu). Ta cần *công cụ tư duy* — logic hình thức + quy nạp — để suy luận mà không phải liệt kê mù.

---

## 4. Đặt tên cho ý tưởng

- **Mệnh đề (proposition):** một câu khẳng định *đúng hoặc sai, không lấp lửng*. "Hôm nay mưa" là mệnh đề (đúng/sai). "Chào bạn" không phải (không đúng/sai).
- **Phép toán logic:** **phủ định** `¬` (không), **và** `∧` (AND), **hoặc** `∨` (OR), **kéo theo** `→` (nếu... thì), **tương đương** `↔` (đúng khi hai bên cùng trị).
- **Bảng chân trị (truth table):** bảng liệt kê kết quả của một biểu thức logic với mọi tổ hợp đầu vào.
- **Tập hợp (set):** nhóm các đối tượng phân biệt, kí hiệu `{...}`. Phần tử thuộc `∈`, không thuộc `∉`.
- **Tổ hợp (combinatorics):** toán đếm — "có bao nhiêu cách sắp xếp/tuỳ chọn".
- **Quy nạp toán học (mathematical induction):** chứng minh một mệnh đề đúng với *mọi* số tự nhiên, bằng "tháp domino" (bước cơ sở + bước quy nạp).
- **Quan hệ & hàm:** cách nối các phần tử của tập này với tập khác.

Hai thứ nền tảng nhất để nắm: **mệnh đề + bảng chân trị** (để đọc luật kinh doanh/điều kiện code), và **quy nạp** (để chứng minh thuật toán/lặp đúng).

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Ký hiệu mệnh đề và phép toán

- `Q` = "đơn quá hạn", `T` = "đã thanh toán".
- `¬Q` = "đơn không quá hạn".
- `Q ∧ ¬T` = "quá hạn **và** chưa thanh toán" (trường hợp cần nhắc).
- `Q → nhắc` đọc "nếu Q thì gửi nhắc".

### 5.2 Bảng chân trị của `∧` (AND) và `→` (kéo theo)

| Q | T | Q ∧ ¬T | Q → gửi nhắc |
|---|---|---|---|
| S | S | S (nếu ¬T=S thì ¬T=S, Q=S → S∧S=S) | S |
| S | K | S (... K = S; S∧S=S) | S |
| K | S | K | S (dù Q=K, luật vẫn "đúng" về mặt cú pháp) |
| K | K | K | S |

**Điểm quan trọng và dễ hiểu nhầm:** «kéo theo» `A → B` chỉ **sai** khi A đúng mà B sai. Mọi dòng A sai thì `A→B` "đúng về mặt logic" kể cả khi không liên quan thực tế (gọi là *vacuous truth*). Đây là nơi trực giác của con người (thường coi "nếu...thì" có ngụ ý về quan hệ nhân quả) lệch khỏi logic hình thức của máy tính và toán học (chỉ tính giá trị chân lý).

### 5.3 Tập hợp và quy nạp

**Tập hợp:** `C = {cam, táo}` — một nhóm. `cam ∈ C` (đúng), `chó ∉ C`.

**Quy nạp — "tháp domino":** muốn chứng minh mệnh đề `P(n)` đúng mọi n:
1. **Bước cơ sở:** chứng minh `P(1)` đúng.
2. **Bước quy nạp:** chứng minh "nếu P(k) đúng thì P(k+1) cũng đúng".
Khi xếp cả hai bước, "mọi n" được suy ra như domino đổ liên tiếp: 1 → 2 → 3 → ...

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Bảng chân trị và luật gửi nhắc

**Bài toán:** Luật "gửi nhắc khi quá hạn `Q` và chưa thanh toán `¬T`". Kiểm tra qua 4 tổ hợp (bảng trên). Xác định trường hợp gửi nhắc.

**Bước 1 — Viết đúng mệnh đề:** `nhắc = Q ∧ ¬T`.

**Bước 2 — Liệt kê trường hợp gửi (Q=S, T=K):** đơn quá hạn và chưa thanh toán → gửi. Đúng theo bảng, dòng 2.

**Bước 3 — Kiểm tra các trường hợp khác:** Q=S,T=S (quá hạn, đã trả) → ¬T=K → `S∧K=K`, không gửi. Q=K (không quá hạn) → dù T gì, `K∧¬T = K`, không gửi. Như vậy chỉ đúng 1 dòng → luật không gửi nhầm trong 3/4 trường hợp.

**Bước 4 — Phát hiện lỗ hổng:** trường hợp "quá hạn, chưa trả, **nhưng đã hủy**" — bảng này chưa có biến "hủy". Thiếu nó, luật vẫn gửi nhắc cho đơn đã hủy (nếu Q=S, T=K). Cần thêm biến `H` (đã hủy) và sửa luật thành `nhắc = Q ∧ ¬T ∧ ¬H`. **Bài học:** liệt kê đủ biến rồi bảng chân trị giúp phát hiện lỗ hổng mà trực giác bỏ sót.

### Ví dụ B — Đếm: quy tắc nhân trong tổ hợp

**Bài toán:** Một menu có 3 món khai vị, 4 món chính, 2 món tráng miệng. Hỏi bao nhiêu tổ hợp bữa ăn (chọn 1 món mỗi loại)?

**Bước 1 — Nguyên lý nhân:** nếu chọn tuần tự và mỗi bước độc lập, số khả năng = tích số khả năng mỗi bước.

**Bước 2 — Áp dụng:** 3 × 4 × 2 = **24** bữa ăn khác nhau.

**Bước 3 — Giải thích:** vì mỗi khai vị phối được với cả 4 món chính (12 combos), mỗi combo lại x 2 tráng miệng → 24. Đây là "quy tắc nhân", nền của đếm trong thuật toán, tìm kiếm, mật khẩu,...

### Ví dụ C — Quy nạp: tổng 1+2+...+n

**Bài toán:** Chứng minh `1+2+...+n = n(n+1)/2` đúng mọi n≥1.

**Bước 1 — Bước cơ sở `n=1`:** `1 = 1(1+1)/2 = 1` ✔.

**Bước 2 — Giả sử `P(k)` đúng:** `1+...+k = k(k+1)/2`.

**Bước 3 — Chứng minh `P(k+1)`:** `(1+...+k) + (k+1) = k(k+1)/2 + (k+1) = (k+1)[k/2 + 1] = (k+1)(k+2)/2`. Đúng dạng `P(k+1)`. ✔

**Bước 4 — Kết luận quy nạp:** vì base đúng và bước quy nạp đúng, mọi n đều đúng. → **hợp lệ.**

**Bước 5 — Giải thích vì sao quan trọng:** khi ghi vòng lặp `for i in range(1, n+1): sum += i`, ta muốn chắc "sum đúng với mọi i". Quy nạp là cách **chứng minh vòng lặp/đệ quy đúng** — cơ chế tư duy của lập trình viên nghiêm túc (bất biến vòng lặp, G sau này).

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

- **`if` / `else`, `and`, `or`, `not` — bạn đang viết mệnh đề logic.** Mỗi điều kiện trong code là một biểu thức cho ra đúng/sai — đúng định nghĩa mệnh đề. Hiểu bảng chân trị giúp bạn viết đúng và tìm bug điều kiện phức tạp.
- **Tập hợp và hàm → cấu trúc dữ liệu.** List, set, dict, và "ánh xạ khóa→giá trị" đều là hiện thân của tập hợp/quan hệ/hàm. Hiểu bản chất giúp chọn cấu trúc đúng.
- **Tổ hợp → phân tích thuật toán và tìm kiếm.** Đếm số khả năng (24 combo, 2ⁿ con, n! hoán vị) là cách biết thuật toán "khả thi" hay "bùng nổ". Đây là nền của độ phức tạp tính toán.
- **Quy nạp → chứng minh thuật toán đúng.** "Bất biến vòng lặp", "đúng với mọi bước" đều dùng tư duy quy nạp. AI/học máy cũng dùng khi chứng minh tính hội tụ (thuật toán dừng và tới đỉnh ở Chương 8).
- **Logic → học máy có ký hiệu (symbolic) và suy luận:** dù học sâu "học từ số liệu", vẫn có cả nhánh máy học dùng logic/biểu diễn tri thức. Nhận diện ranh giới "logic đúng/sai" vs "xác suất không chắc chắn" (Chương 5) giúp bạn đọc tài liệu hiểu đúng.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "`A → B` đồng nghĩa 'A gây ra B'."** Không. Kéo theo logic chỉ nói "A đúng thì B phải đúng"; nó *không* khẳng định nhân quả. "Mưa → trời nhiều mây" đúng về logic, nhưng mưa không *gây* mây (mây sinh mưa). Trong máy, `→` chỉ là quy tắc suy diễn cú pháp. Đặc biệt với line `A=S → B` đúng trong mọi trường hợp (vacuous truth) — dễ khiến con người kinh ngạc.

**Nhầm 2: "`hoặc` (OR) trong toán là 'hoặc là A, hoặc là B, không cả hai'."** Trong logic thường dùng `∨` là **OR bao hàm** (inclusive): đúng nếu A đúng, B đúng, hoặc cả hai đúng. "Hoặc loại trừ" (XOR) là trường hợp riêng dùng khi cần (VD mật khẩu chỉ được một trong hai). Đừng nhầm `hoặc` thông thường (inclusive) với "hoặc loại trừ".

**Nhầm 3: "Quy nạp là 'suy từ vài trường hợp sang tất cả' (cảm nhận theo mẫu)."** Sai. Quy nạp toán học *không* phải suy luận theo mẫu; nó là **chứng minh chặt chẽ** bằng hai bước (cơ sở + quy nạp) mà không cần thử hữu hạn. Tên gọi "quy nạp" dễ gây hiểu lầm với "inductive reasoning" (theo mẫu). Đây là **suy diễn tiên nghiệm một lần cho mọi n**.

**Giới hạn của "logic = bộ luật chơi cờ":** bộ luật cờ có thể mâu thuẫn về tinh tế (gamer phán xử); logic hình thức thì yêu cầu *không mâu thuẫn* và *đầy đủ*. Nhưng cũng chính sự "không ý nghĩa" của logic khiến nó mạnh: máy có thể xử lý hàng triệu mệnh đề mà không cần hiểu — vừa là sức mạnh, vừa là lý do cần người thiết kế luật đúng.

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: viết/debug điều kiện phức tạp trong code; thiết kế luật kinh doanh không lỗ hổng (app đơn hàng); đếm số thao tác/khả năng (độ phức tạp); chứng minh thuật toán/vòng lặp đúng; xây dựng và hiểu cấu trúc dữ liệu; đọc các chứng minh, cũng như đánh giá các mô hình học có thành phần logic.

Nó **không nên áp dụng máy móc** khi: vấn đề vốn *liên tục* và *không chắc chắn* — đừng cố "liệt kê hết mọi trường hợp" khi số lượng bùng nổ (thay bằng quy nạp); và đừng ép các tri thức xác suất (Chương 5) vào khung logic đúng/sai cứng nhắc khi thế giới không rạch ròi.

---

## Đọc sâu — một điều kiện đủ chưa phải điều kiện cần

Luật “nếu quá hạn thì gửi nhắc” chỉ nói điều phải xảy ra khi quá hạn. Nó chưa cấm gửi nhắc trong trường hợp khác. Khi thiết kế một ứng dụng, ta thường muốn mô tả chính xác **khi nào và chỉ khi nào** hành động xảy ra; đó là chỗ cần phân biệt kéo theo với tương đương.

| Tình huống | Câu logic | Điểm cần phân biệt |
|---|---|---|
| Đơn quá hạn thì nhắc | `Q→R` | Q là điều kiện đủ để R |
| Chỉ nhắc nếu đơn quá hạn | `R→Q` | Q là điều kiện cần của R |
| Nhắc đúng khi quá hạn và chưa trả | `R↔(Q∧¬T)` | Xác định cả các trường hợp phải nhắc và không nhắc |

**Đọc thành lời:** đặt Q là quá hạn, T là đã thanh toán, H là đã hủy. `R=Q∧¬T∧¬H` đọc “gửi nhắc khi quá hạn, đồng thời chưa trả, đồng thời chưa hủy”. Dấu bằng ở đây định nghĩa giá trị Boolean R. Một phép phủ định chỉ áp vào phần biểu thức nằm trong phạm vi của nó.

**Tính tay:** với Q đúng, T sai, H đúng: `¬T` đúng nhưng `¬H` sai; phép AND của ba điều kiện thành sai nên không nhắc. Nếu Q đúng, T sai, H sai, cả ba thành phần đều đúng nên nhắc. Ba biến Boolean có 2³=8 tổ hợp; duyệt đủ tám tổ hợp là chứng minh vét cạn trên không gian hữu hạn này, không phải chứng minh quy nạp.

**Phản ví dụ:** từ “nếu là hình vuông thì có bốn cạnh” không được suy ngược “có bốn cạnh thì là hình vuông”: hình chữ nhật 2×3 là phản ví dụ. Trong app, nhìn thấy email nhắc không đủ để kết luận quá hạn nếu hệ thống còn gửi nhắc trước hạn. Kéo theo là quan hệ chân trị, không tự khẳng định nguyên nhân thực tế.

**Giới hạn:** logic đúng dựa trên dữ liệu đầu vào đúng. Nếu trường “đã thanh toán” cập nhật chậm, quy tắc Boolean vẫn có thể chạy đúng nhưng gửi nhắc sai ngoài đời. Ngoài cú pháp và phép suy diễn, logic hình thức còn có ngữ nghĩa: cách gán giá trị và diễn giải mệnh đề trong một mô hình. Người thiết kế phải kiểm cả quy tắc lẫn cách liên hệ dữ liệu với thế giới.

:::interactive logic
:::

:::quiz
Biết “nếu là hình vuông thì có bốn cạnh”. Từ việc một hình có bốn cạnh, suy ra điều gì?
A. Chắc chắn là hình vuông.
B. Chắc chắn không phải hình vuông.
C. Chưa đủ kết luận nó là hình vuông.
Đáp án: C
Giải thích: Có bốn cạnh là điều kiện cần nhưng chưa đủ; hình chữ nhật không vuông là một phản ví dụ.
:::

**Tự thử thêm:** có 2 loại tài khoản, 3 khu vực và 2 trạng thái thanh toán. Nếu mọi tổ hợp đều hợp lệ, cần xét bao nhiêu cấu hình? Đây có phải giả định độc lập xác suất không?

:::goi-y
Mỗi lựa chọn thứ nhất kết hợp được với mọi lựa chọn ở các bước sau. Phân biệt số tổ hợp với xác suất mỗi tổ hợp.
:::

:::loi-giai
Có 2×3×2=12 cấu hình. Quy tắc đếm không đòi các lựa chọn độc lập về xác suất; chỉ cần mọi tổ hợp đã mô tả đều được phép. Chúng không nhất thiết xuất hiện thường xuyên như nhau.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Câu nào là mệnh đề (đúng/sai), câu nào không: "Trời hôm nay mưa", "Chào bạn", "2+2=5", "Món này ngon quá".
2. Lập bảng chân trị `A ∧ B` và `A ∨ B` với hai biến đúng/sai.
3. Giải thích: vì sao `A → B` đúng khi A sai? (Vacuous truth)

### Luyện tập (áp dụng vào bài toán mới)
4. Một khóa gồm chọn mật khẩu 4 ký tự, mỗi ký tự là một chữ số (0–9). Có bao nhiêu khả năng? (Áp quy tắc nhân.)
5. Dùng quy nạp chứng minh: tổng các số lẻ `1+3+...+ (2n−1) = n²`.
6. Sửa luật app: "gửi nhắc nếu quá hạn Q, chưa thanh toán ¬T, và chưa hủy ¬H". Viết mệnh đề và nêu bảng chân trị đơn giản có/nhắc.

### Thử thách (liên hệ với máy tính/AI)
7. Viết biểu thức logic cho: "đơn được duyệt khi đã thanh toán đủ T và (không bị hủy ¬H hoặc được quản trị viên bỏ qua Q_override)". Dùng các biến bạn chọn. Rồi với một bảng chân trị, tìm trường hợp được duyệt.
8. Giải thích: vì sao "số khả năng tăng gấp đôi mỗi khi thêm một biến đúng/sai" — và hậu quả gì cho việc liệt kê mọi trường hợp khi có 30 biến. Đề xuất cách tránh việc liệt kê mù.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Mệnh đề: "Trời hôm nay mưa" (đúng hay sai), "2+2=5" (sai). Không: "Chào bạn" (không đúng/sai), "Món này ngon quá" (chủ quan/không khẳng định rạch ròi).
2. `A∧B` chỉ đúng khi cả hai đúng; `A∨B` (inclusive) sai chỉ khi cả hai sai.
3. Vì với `A→B`, bảng chân trị chỉ qui định "không có trường hợp A đúng mà B sai". Khi A sai, điều kiện "A đúng" không thỏa, nên không vi phạm → đúng về cú pháp (dù ta không "tin" điều đó theo nhân quả).
4. `10×10×10×10 = 10⁴ = 10.000` khả năng.
5. Base n=1: 1 = 1². Giả sử `1+...+2k−1 = k²`. Thì `1+...+2k−1 + (2k+1) = k² + 2k+1 = (k+1)²` ✔ → đúng mọi n.
6. Mệnh đề: `nhắc = Q ∧ ¬T ∧ ¬H`. Bảng: chỉ gửi khi Q=S, T=K, H=K (cả 3 điều thỏa); mọi trường hợp khác không gửi.
7. `duyet = T ∧ (¬H ∨ Q_override)`. Bảng chân trị với 3 biến (T, H, Q_override) → chỉ duyệt khi T=S và (¬H hoặc override đúng). Trường hợp: T=S, H=K, Q_override=K → ¬H=S → duyet=S.
8. Với n biến đúng/sai, số tổ hợp = 2ⁿ (mỗi biến gấp đôi nhánh). 30 biến → 2³⁰ ≈ 1 tỷ, không liệt kê nổi. Cách tránh: dùng quy nạp/chứng minh, tối ưu không phụ thuộc liệt kê, hoặc suy luận cấu trúc thay vì vét cạn mọi tổ hợp.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. **Logic** là bộ quy tắc suy luận chính xác — máy tính áp dụng máy móc từng quy tắc, không cần "hiểu", nên luật phải được thiết kế đúng từ đầu.
2. **Mệnh đề + bảng chân trị** là cách kiểm tra "luật kinh doanh có lỗ hổng hay mâu thuẫn không".
3. **Toán rời rạc** nghiên cứu các đối tượng đếm được (số, tập hợp, đồ thị) — ngôn ngữ trực tiếp của máy tính.
4. **Quy nạp** (tháp domino) chứng minh một mệnh đề đúng với *mọi* n — cơ chế chứng minh vòng lặp/thuật toán đúng.
5. **Đếm (tổ hợp)** và 2ⁿ giúp biết thứ gì "khả thi" và thứ gì bùng nổ không liệt kê nổi.