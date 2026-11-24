# Tên sách

**Từ Trực Giác Đến Thuật Toán** — *Một hành trình toán học cho người mới bắt đầu học máy, học sâu và khoa học máy tính*

## Lời giới thiệu ngắn

Cuốn sách này được viết cho những bạn sinh viên năm nhất ngành CNTT cảm thấy sợ toán, thấy ký hiệu và công thức khô khan. Chúng tôi không bắt đầu bằng định nghĩa, mà bằng những tình huống bạn gặp hằng ngày: chia tiền thuê nhà, dự đoán thời gian giao hàng, tìm đường ngắn nhất, nén ảnh, phân loại email, đề xuất phim. Từ câu chuyện, chúng ta đi dần đến ý tưởng, rồi mới đến ký hiệu. Mục tiêu không phải là biến bạn thành chuyên gia toán, mà là giúp bạn **đọc được**, **hình dung được** và **tin được** những công cụ toán mà ngành khoa học máy tính và trí tuệ nhân tạo đang dùng hằng ngày.

---

## Chân dung độc giả

- **Bạn là ai:** Sinh viên năm nhất/năm hai ngành CNTT, hoặc bất kỳ ai muốn theo đuổi học máy, học sâu và khoa học máy tính nhưng chưa tự tin với nền tảng toán.
- **Bạn đang gặp gì:** Cảm thấy công thức, ký hiệu khô khan và rời rạc; chưa thấy mối liên hệ giữa toán trên lớp và việc máy tính "học" như thế nào.
- **Một định nghĩa của "không giỏi":** Chưa nắm chắc đạo hàm, chưa quen ma trận, xác suất mơ hồ. — Đều được, sách không giả định bạn đã giỏi.

**Giả định về kiến thức đầu vào:**
- Biết đếm, làm các phép tính số học căn bản, vẽ đồ thị hàm số bậc nhất/bậc hai ở mức cấp 3.
- Biết một chút khái niệm hàm số, biến số, x, y (không cần thành thạo).
- **Không** cần biết đạo hàm, tích phân, ma trận, xác suất trước khi đọc.
- **Không** cần biết lập trình — các phần liên hệ CNTT/AI được giải thích bằng ngôn ngữ thường, mọi khái niệm đều tự chứa.

---

## Mục tiêu học tập của cuốn sách

Sau khi đọc xong, bạn có thể:

1. **Đọc ký hiệu và công thức** xuất hiện trong tài liệu kỹ thuật về ML/DL mà không bỏ cuộc — biết mỗi ký hiệu "đang nói về điều gì".
2. **Giải thích bằng lời** một khái niệm toán (vector, đạo hàm, xác suất, gradient) trước khi viết công thức ra.
3. **Chuyển một tình huống đời thường** thành mô hình toán học đơn giản (mô hình hóa).
4. **Hiểu luồng ý tưởng cốt lõi của học máy:** biểu diễn dữ liệu (đại số tuyến tính), đo sai số và học tham số (giải tích + tối ưu hóa), ra quyết định trong điều kiện không chắc chắn (xác suất).
5. **Nhận biết "chỗ dễ nhầm"** và giới hạn của từng phép so sánh hoặc mô hình, thay vì áp dụng công thức một cách máy móc.

---

## Bản đồ lộ trình toàn cuốn (theo thứ tự học)

Ý tưởng xuyên suốt: **mỗi chương mở ra một "cơ chế" tinh thần, rồi mới đặt cho nó cái tên toán học.**

```
[C1] Tư duy toán & cách đọc ký hiệu
        │
[C2] Số, tỉ lệ, hàm & mô hình hóa
        │
        ├──────────────┬──────────────────────────┐
        ▼              ▼                          ▼
[C3] Đại số tuyến     [C4] Giải tích       [C5] Xác suất &
     tính (vector,     (hàm, đạo hàm,       thống kê
     ma trận, biến     gradient)           (kỳ vọng, Bayes)
     đổi, trị riêng)         │                   │
        │                   │                   │
        │                   ▼                   │
        ├──────────► [C8] Tối ưu hóa ◄──────────┤
        │              (gradient descent)       │
        ▼                    │                  │
[C6] Toán rời rạc           ▼                   │
     & logic         [C9] Các ý tưởng           │
        │              gặp nhau trong           │
        ▼              ML & DL                  │
[C7] Đồ thị & mạng ──────────┘                   │
        └───────────────────────────────────────┘
```

**Cách đọc bản đồ:**
- C1 → C2 là nền chung, nên đọc trước.
- C3, C4, C5 là **ba trụ cột độc lập** — bạn có thể học theo bất kỳ thứ tự nào trong ba cái này; ta đặt song song để linh hoạt.
- C6 (toán rời rạc/logic) và C7 (đồ thị) nhánh sang hướng thuật toán & cấu trúc dữ liệu, có thể đọc sau C3.
- C8 (tối ưu hóa) **đòi hỏi** kiến thức C4 (đạo hàm) và nên có C3 (để hiểu gradient trên vector).
- C9 là chương tổng kết, gộp mọi thứ lại trong ngữ cảnh ML/DL.

---

## Mục lục chi tiết (kèm mô tả từng chương)

> Ghi chú về ký hiệu ưu tiên: **◆ = hỗ trợ trực tiếp máy học/học sâu** • **▲ = thuật toán & CS**

### Chương 1 — Tư duy toán học và cách đọc ký hiệu
- **Câu hỏi lớn:** "Công thức 'khô khan' đó thực ra đang thì thầm điều gì?"
- **Nội dung:** Tư duy "từ tình huống → khái niệm → ký hiệu"; đọc một công thức như đọc một câu tiếng Việt; các ký hiệu thường gặp (Σ, ∈, →, ∀, ∃, =, ≈) và cách dịch thành lời; sự khác nhau giữa trực giác, định nghĩa chính xác, ví dụ và giới hạn của ví dụ.
- **Kiến thức nền:** Không cần gì — đây là điểm khởi đầu.
- **Ứng dụng:** Vì sao người làm ML phải đọc tài liệu; đọc một công thức mất mát đầu tiên.

### Chương 2 — Số, tỉ lệ, hàm và mô hình hóa
- **Câu hỏi lớn:** "Làm sao biến câu chuyện 'giao hàng chậm' thành một công thức dự đoán?"
- **Nội dung:** Số và đơn vị; tỉ lệ, phần trăm, tốc độ thay đổi; hàm số là "cỗ máy biến đầu vào thành đầu ra"; đồ thị hàm; hàm tuyến tính và phi tuyến; dựng một mô hình từ dữ liệu đời thường; sai số của mô hình.
- **Kiến thức nền:** C1.
- **Ứng dụng ◆:** Hồi quy tuyến tính là "hàm dự đoán" — khái niệm nền trực tiếp.

### Chương 3 — Đại số tuyến tính: vector, ma trận, biến đổi và trị riêng (nhập môn)
- **Câu hỏi lớn:** "Làm thế nào một bức ảnh hay một bảng dữ liệu trở thành 'một con số' mà máy xử lý được?"
- **Nội dung:** Vector là danh sách có hướng (điểm trong không gian); cộng/nhân vector; tích vô hướng và ý nghĩa "đo độ giống nhau"; ma trận là bảng phối hợp biến đổi; nhân ma trận-vector như "áp quy tắc"; biến đổi tuyến tính (xoay, co giãn); nghịch đảo và định thức; trị riêng/vector riêng ở mức trực giác (trục "không bị lệch hướng").
- **Kiến thức nền:** C2 (hàm, phép tính).
- **Ứng dụng ◆:** Ảnh = ma trận pixel; dữ liệu = bảng số; PCA và tìm trục quan trọng nhất. ▲ **:** biến đổi tọa độ trong đồ họa.

### Chương 4 — Giải tích: hàm, độ dốc, đạo hàm, tích phân và gradient
- **Câu hỏi lớn:** "Làm sao biết một giá trị đang 'đi lên hay đi xuống', và nhanh đến mức nào?"
- **Nội dung:** Độ dốc của đường thẳng và đường cong; đạo hàm là "tốc độ thay đổi tức thời"; quy tắc đạo hàm thông dụng; đạo hàm làm gì khi hàm nhiều biến → gradient; tích phân như "cộng dồn các phần nhỏ" và diện tích; quy tắc dây chuyền.
- **Kiến thức nền:** C2 (hàm), C3 cơ bản (để có gradient trên vector).
- **Ứng dụng ◆:** Gradient descent — cách mô hình "học" bằng cách dò theo độ dốc. 

### Chương 5 — Xác suất và thống kê (nhập môn)
- **Câu hỏi lớn:** "Làm sao ra quyết định khi không biết chắc điều gì sẽ xảy ra?"
- **Nội dung:** Biến ngẫu nhiên; không gian mẫu; xác suất là "số đo niềm tin có thể tính"; phân phối xác suất (đồng đều, Bernoulli, chuẩn); kỳ vọng là "giá trị trung bình dài hạn"; phương sai và độ lệch chuẩn đo độ phân tán; Bayes và cách cập nhật niềm tin khi có bằng chứng mới; lấy mẫu và ý tưởng về kiểm định ở mức cơ bản.
- **Kiến thức nền:** C2 (tỉ lệ, số trung bình).
- **Ứng dụng ◆:** Dự đoán trong điều kiện không chắc chắn; phân loại theo xác suất; entropy/lượng thông tin.

### Chương 6 — Toán rời rạc và logic
- **Câu hỏi lớn:** "Máy tính 'suy nghĩ' bằng những khối logic rời rạc như thế nào — và làm sao biết các suy luận đó đúng?"
- **Nội dung:** Mệnh đề, phép toán logic (and/or/not); suy luận và chứng minh trực tiếp/phản chứng; tập hợp và quan hệ giữa tập hợp; hàm giữa các tập hợp; tổ hợp và đếm; quy nạp toán học như "chứng minh cho vô hạn bước".
- **Kiến thức nền:** C1.
- **Ứng dụng ▲:** Thuật toán, cấu trúc dữ liệu, chứng minh tính đúng đắn (invariant).

### Chương 7 — Đồ thị và mạng
- **Câu hỏi lớn:** "Một mạng lưới hàng triệu nút kết nối — làm sao tìm được con đường, ai có ảnh hưởng, và lan truyền thông tin ra sao?"
- **Nội dung:** Đồ thị là "tập điểm + tập đường nối"; vô hướng/có hướng, có trọng số; bậc của đỉnh; đường đi, chu trình, cây; tìm đường ngắn nhất (ý tưởng BFS/Dijkstra); độ kết nối; đồ thị trong mạng xã hội, bản đồ, mạng máy tính.
- **Kiến thức nền:** C1, C2 (toán rời rạc nhẹ).
- **Ứng dụng ▲◆:** Tìm đường, đề xuất kết bạn, xếp hạng trang (networks & page-rank intuition).

### Chương 8 — Tối ưu hóa: hàm mục tiêu, ràng buộc và gradient descent
- **Câu hỏi lớn:** "Làm sao tìm được lời giải 'tốt nhất', khi lời giải nằm giữa một địa hình mênh mông?"
- **Nội dung:** Hàm mục tiêu là "thước đo ta cần làm nhỏ/cực đại hóa"; cực trị (cực đại/cực tiểu, toàn cục vs cục bộ); gradient descent là "bước xuống dốc từng chút, theo hướng dốc nhất"; learning rate và tại sao bước quá lớn/quá nhỏ đều hỏng; ý tưởng ràng buộc; minh họa trên hàm 1 biến rồi 2 biến.
- **Kiến thức nền:** C4 (bắt buộc), C3 (để hiểu gradient trên vector).
- **Ứng dụng ◆:** Trái tim của phương pháp học máy — điều chỉnh tham số để giảm sai số.

### Chương 9 — Các ý tưởng toán học gặp nhau trong học máy và học sâu
- **Câu hỏi lớn:** "Ba trụ cột (đại số, giải tích, xác suất) thực sự phối hợp ra sao trong một mạng nơ-ron?"
- **Nội dung:** Ghép lại toàn bộ: biểu diễn dữ liệu bằng vector (C3) → đo sai số bằng hàm mất mát (C2/C5) → dùng đạo hàm/gradient để cập nhật (C4) → tối ưu hóa (C8); xác suất biến thành dự đoán (C5); tổng quan lại toàn bộ bản đồ; "tiếp theo nên học gì" (một số chủ đề nâng cao được đề nghị học sau).
- **Kiến thức nền:** Toàn bộ các chương trước.
- **Ứng dụng ◆:** Đi qua một vòng huấn luyện ML/DL từ đầu đến cuối bằng lời và sơ đồ.

---

### Một số chủ đề "nên học sau" (chưa đưa vào cuốn này)

- Đại số tuyến tính sâu hơn: phép phân rã (SVD), nhiều loại chuẩn.
- Xác suất nâng cao: phân phối liên tục chi tiết, định lý giới hạn, suy luận Bayes nâng cao.
- Tối ưu hóa: các biến thể như Adam, SGD, tối ưu lồi.
- Giải tích nhiều biến và vi tích phân trên đa tạp.
- Lý thuyết thông tin và entropy sâu hơn.

---

## Quy ước biên tập hiện hành

Toàn bộ 9 chương của sách đã có nội dung. Mỗi chương giữ 11 mục và có thêm một mục **Đọc sâu** đặt sau mục 9, gồm bảng tình huống đời thực, đọc công thức bằng lời, tính tay, phản ví dụ, giới hạn, quiz, gợi ý và lời giải.

Khi sửa hoặc viết thêm:

1. Giữ mạch "trực giác trước, ký hiệu sau"; mục Đọc sâu phải thêm góc nhìn mới, không lặp phần tóm tắt.
2. Kiểm lại mọi phép tính tay bằng một công cụ độc lập trước khi ghi.
3. Khối mở rộng dùng `:::quiz`, `:::goi-y`, `:::loi-giai`, `:::interactive <tên>` và đóng bằng `:::`. Quiz có đúng ba lựa chọn A/B/C, một đáp án và một giải thích.
4. Sau khi sửa, chạy `node webapp/build.js` và các kiểm tra trong `webapp/` trước khi báo hoàn thành.