# Chương 7 — Đồ thị và mạng

> **Câu hỏi lớn của chương:** *Một mạng lưới hàng triệu nút kết nối — làm sao tìm được con đường, biết ai có ảnh hưởng, và hiểu thông tin lan truyền ra sao?*

---

## 1. Mở đầu bằng một tình huống

Một anh làm app bản đồ giao hàng. Mỗi ngày anh vẽ sơ đồ phố, quán, kho — và các con đường nối chúng. Khi có đơn hàng từ điểm A đến điểm B, anh cần tìm **con đường ngắn nhất**.

Thoạt nghe "chỉ là vài phố", nhưng sự thật: một thành phố có hàng chục nghìn ngã tư và con đường. Nếu anh thử mọi ngã rẽ có thể, số khả năng **bùng nổ** (giống 2ⁿ ở Chương 6). Bạn bè anh, ai cũng từng nói: "sao app nói tôi đi lòng vòng, đường này nhanh hơn nhiều?" — và một số con đường "ngắn theo km" lại chậm vì kẹt xe.

Câu chuyện của anh là câu chuyện của cả thế giới *mạng*: **mạng xã hội** (ai là bạn của ai), **mạng máy/nhà mạng viễn thông** (các router kết nối), **bản đồ đường đi**, **chuỗi khối**, và cả **mạng nơ-ron**. Tất cả đều là **đồ thị** — tập hợp các *điểm (nút/đỉnh)* và các *đường nối (cạnh)*.

---

## 2. Trực giác trước

**Đồ thị = "bản đồ chỉ gồm điểm và đường" — không quan tâm khoảng cách thật theo mặt đất, chỉ quan tâm ai nối với ai.**

Hãy nghĩ bản đồ tàu điện ngầm: ta không vẽ theo đúng tỉ lệ km; ta vẽ các trạm (điểm) và các tuyến nối chúng (đường). Điều ta cần biết để "đi" là *trạm nào nối trực tiếp với trạm nào* và *mất bao lâu*. Đồ thị ghi lại đúng thứ đó.

Ba "thành phần" ta cần phân biệt:
- **Đỉnh/nút (vertex/node):** điểm (ngã tư, người dùng, trạm).
- **Cạnh (edge):** đường nối hai đỉnh (con phố, quan hệ bạn bè).
- **Trọng số (weight):** con số gắn trên cạnh (độ dài, thời gian, mức độ thân).

Khi cạnh có trọng số (như thời gian di chuyển), "đường ngắn nhất" nghĩa là *tổng trọng số nhỏ nhất*, không phải "ít điểm dừng nhất".

**Phép so sánh "đồ thị = bản đồ tàu điện ngầm":** trực quan (điểm + tuyến + có thể ghi thời gian). **Giới hạn:** bản đồ tàu có cấu trúc gọn, lưới đều; đồ thị thật (mạng xã hội) lộn xộn, có "bậc" rất không đều (vài người có hàng nghìn bạn bè), và *vô hướng hay có hướng* (mối quan hệ "theo dõi" không đối xứng) — bản đồ tàu thường coi luồng 2 chiều.

---

## 3. Thử giải bằng cách chưa chính thức

**Anh giao hàng, không dùng thuật toán:** từ A đến B, anh "nhìn bản đồ và rút kinh nghiệm". Anh thử các tuyến quen thuộc, so sánh "đường này dài hơn nhưng ít kẹt". Với ít đường, cách này ổn. Nhưng với hàng nghìn điểm, trực giác không đủ và không tái lập được (cùng tuyến, hai lần nhớ khác nhau).

Anh cần một **thuật toán** — một quy trình từng bước, máy áp được, luôn ra cùng kết quả đúng cho mọi cặp điểm. Ý tưởng tự nhiên: *"cứ ngã tư nào, so sánh các hướng, ước chừng cái nào gần đích hơn."* Nhưng "gần đích hơn" chưa chắc đúng (đường gần về hướng đích có thể cụt). Cách đúng cần xét *toàn bộ* mà vẫn không bùng nổ — đó là thứ thuật toán (mục 6) làm được: khám phá có chọn lọc từng lớp, không thử mù mọi tuyến.

---

## 4. Đặt tên cho ý tưởng

- **Đồ thị (graph) `G = (V, E)`:** tập đỉnh `V`, tập cạnh `E` (các cặp đỉnh). Đọc "G gồm tập đỉnh V và tập cạnh E".
- **Đồ thị vô hướng / có hướng:** cạnh không có hướng (quan hệ bạn bè đối xứng) hay có hướng ("a theo dõi b").
- **Cạnh có trọng số (weighted):** mỗi cạnh mang một con số (khoảng cách, chi phí).
- **Bậc (degree):** số cạnh kề với một đỉnh (số bạn bè của một người).
- **Đường đi và chu trình (path / cycle):** chuỗi đỉnh nối tiếp; chu trình là đường đi khép kín không lặp đỉnh (trừ đầu=cuối).
- **Cây (tree):** đồ thị liên thông, không chu trình — "xương sống" không vòng.
- **Đường đi ngắn nhất:** đường đi (có trọng số) có tổng trọng số nhỏ nhất giữa hai đỉnh.
- **Thành phần liên thông:** nhóm các đỉnh mà giữa chúng luôn có đường đi.

Cái cốt lõi: **đồ thị = điểm + cạnh (+ trọng số)**; và câu hỏi kinh điển là **tìm đường đi ngắn nhất** và **đo mức kết nối/độ quan trọng của nút**.

---

## 5. Từ câu chuyện đến ký hiệu

### 5.1 Ghi lại đồ thị bằng danh sách kề (adjacency)

Cách máy lưu đồ thị: **danh sách kề** — với mỗi đỉnh, liệt kê các đỉnh kề và trọng số.

Ví dụ 4 đỉnh A, B, C, D với các cạnh (A–B nặng 2), (A–C 5), (B–C 1), (C–D 3):

```
A: (B,2), (C,5)
B: (A,2), (C,1)
C: (B,1), (A,5), (D,3)
D: (C,3)
```

**Đọc:** từ A đi được đến B (mất 2) hoặc C (mất 5). Đây là cách lập trình biểu diễn đồ thị trong dict/list — dễ duyệt từng nút.

### 5.2 Ký hiệu tập đỉnh/cạnh

- `G = (V, E)` — đồ thị gồm đỉnh V, cạnh E.
- `deg(v)` — bậc của đỉnh v.
- `e = {u, v}` — cạnh nối u và v (vô hướng).

---

## 6. Ví dụ có lời giải từng bước

### Ví dụ A — Tìm đường đi ngắn nhất bằng ý tưởng Dijkstra (nhập môn, trên đồ thị nhỏ)

**Bài toán:** Tìm đường ngắn nhất từ A đến D trên đồ thị ở mục 5.1.

**Bước 1 — Khởi tạo:** gán "điểm đến A = 0", các đỉnh khác = "vô cùng". Chọn A là điểm đang xét.

**Bước 2 — Khám phá lớp thứ nhất:** từ A đến B (2) và C (5). Cập nhật: `best[B]=2, best[C]=5`. Lấy đỉnh "chưa xong, best nhỏ nhất" → B (2).

**Bước 3 — Nới rộng từ B:** từ B đến C với chi phí 1 → đường A→B→C = 2+1 = 3 < 5 (tốt hơn đường trực tiếp). Cập nhật `best[C]=3`.

**Bước 4 — Xét C:** từ C đến D (3) → A→...→C→D = 3+3 = 6. Cập nhật `best[D]=6`.

**Bước 5 — So sánh và kết luận:** không còn đường nào tốt hơn (mọi đỉnh xét hết). Đường ngắn nhất A→D nặng **6** (A–B–C–D), không phải A–C–D (nặng 5+3=8).

**Bước 6 — Diễn giải:** thuật toán "khám phá theo lớp, luôn nới từ đỉnh best nhỏ nhất" tìm ra đường tối ưu *mà không cần thử mọi tuyến* — đây là tư tưởng Dijkstra (ta chỉ minh họa tinh thần; chi tiết đầy đủ nằm ngoài sách, biết trực giác là đủ).

### Ví dụ B — Đếm mức kết nối & phát hiện nút quan trọng (bậc)

**Bài toán:** Trong mạng xã hội 5 người, ai là người "quan trọng nhất" theo mức đơn giản (bậc)?

```
An: nối Bình, Chi, Dũng, Em        → deg=4
Bình: nối An, Chi                   → deg=2
Chi: nối An, Bình, Em               → deg=3
Dũng: nối An                        → deg=1
Em: nối An, Chi                     → deg=2
```

**Bước 1 — Tính bậc** (số bạn bè): An=4, Chi=3, Bình=2, Em=2, Dũng=1.

**Bước 2 — Kết luận theo "degree centrality":** An có bậc lớn nhất → "gần với nhiều người nhất". 

**Bước 3 — Giới hạn của chỉ số này:** "bậc" chỉ đếm *số* mối nối, không phải *chất lượng/ảnh hưởng thực*. Một tài khoản ít bạn nhưng bạn toàn người có ảnh hưởng có thể "quan trọng" hơn theo nghĩa khác (page-rank, mục 7). Nhận diện: đừng lấy một chỉ số rẻ tiền làm chân lý.

### Ví dụ C — Cây: tối ưu trong đi có cấu trúc không vòng

**Bài toán / ý tưởng:** Một cây (tree) có n đỉnh luôn có n−1 cạnh, không chu trình. Vì không vòng lặp, ta có thể duyệt "từ gốc xuống" một lần, không lo đi lặp — nền của bảng phân cấp, dữ liệu dạng cây (DOM, JSON), và nhiều thuật toán tìm kiếm. **Diễn giải:** cây là "đồ thị gọn không vòng" — rất hữu ích khi muốn tránh lặp vô hạn và biết chắc cấu trúc xác định.

---

## 7. Nhìn từ góc độ khoa học máy tính hoặc AI

- **Mạng xã hội / mạng internet là đồ thị có hàng tỷ nút.** Tìm đường đi ngắn nhất (Dijkstra) là lõi của GPS và định tuyến mạng. Phát hiện "ai quan trọng" (page-rank, centrality) là nền của xếp hạng trang và đề xuất.
- **Graph neural network (GNN)** trong học sâu làm việc trực tiếp trên đồ thị — biết biểu diễn đồ thị (danh sách kề) giúp bạn đọc tài liệu GNN dễ hơn.
- **Cây quyết định / cây phân cấp:** nhiều mô hình ML (decision tree) và cấu trúc dữ liệu (cây nhị phân) đứng trên khái niệm cây. Hiểu cây = đọc được "mô hình phân nhánh".
- **Đồ thị liên thông trong FL (Chương 6 lộ trình):** cấu trúc client–server, giao tiếp giữa client, có thể mô hình hóa bằng đồ thị — đường truyền, topo, độ sâu vòng lặp trao đổi.

---

## 8. Những chỗ dễ nhầm

**Nhầm 1: "Đồ thị và bản đồ địa lý là một."** Không. Bản đồ giữ khoảng cách hình học; đồ thị chỉ giữ *cấu trúc kết nối* (ai nối ai). Hai đồ thị "cùng cấu trúc" có thể vẽ khác nhau vẻ ngoài. Nhớ: đồ thị nói về *quan hệ nối*, bản đồ nói về *vị trí*. (Trọng số cạnh có thể tái tạo "khoảng cách", nhưng đó là dữ liệu phụ trên cạnh.)

**Nhầm 2: "Đường đi ngắn nhất = đường có ít đoạn nhất."** Sai khi cạnh có trọng số (thời gian/cost). Đường ít chặn có thể tốn nhiều thời gian hơn. Ta phải so **tổng trọng số**, không phải số cạnh. (Chính Ví dụ A: A–C–D ít hơn chặn nhưng nặng hơn A–B–C–D.)

**Nhầm 3: "Bậc (degree) đo 'độ quan trọng' tuyệt đối của nút."** Chỉ là một phép đo thô. Có nhiều độ đo khác (giữa các cặp, page-rank, closeness). Đừng quy "nhiều bạn bè = quan trọng nhất về mọi mặt". Nhận diện mức độ *của chỉ số* và chọn chỉ số phù hợp câu hỏi.

**Giới hạn của "đồ thị = bản đồ tàu điện ngầm":** mạng xã hội có *đồ thị con*, *thuộc tính nút*, và *đồ thị có hướng* — phức tạp hơn bản đồ tàu. Và tìm đường ngắn nhất trong đồ thị khổng lồ cần kỹ thuật (A*, heuristics) để không bùng nổ — đơn giản hóa "cứ Dijkstra là xong" là chưa đủ với quy mô thật.

---

## 9. Khi nào ý tưởng này hữu ích?

Nó **hữu ích** khi bạn cần: tìm đường đi ngắn nhất (GPS, logistics, mạng); hiểu cấu trúc mạng/liên thông; đo tầm quan trọng của nút (mạng xã hội, xếp hạng); mô hình các mối quan hệ (a nối b); hoặc đọc các mô hình làm việc trên đồ thị (GNN, mạng truyền thông trong FL).

Nó **không nên áp dụng máy móc** khi: vấn đề không có cấu trúc "nút–cạnh" rõ ràng, hoặc khi ta bị ép ép mọi thứ vào khung đồ thị (căng); và khi đồ thị quá lớn, đừng vứt hết mọi thứ vào tìm kiếm bùng nổ — cần thuật toán thông minh hoặc xấp xỉ thay vì liệt kê mù.

---

## Đọc sâu — “ngắn nhất” cần nói rõ đang cộng thứ gì

Một tuyến đi qua ít ngã tư chưa chắc đến nhanh nhất. Đồ thị giúp tách hình dáng bản đồ khỏi tiêu chí cần tối ưu: đỉnh biểu thị nơi có thể đứng, cạnh biểu thị bước đi hợp lệ, trọng số biểu thị chi phí của bước ấy. Sau khi đặt mô hình, ta mới chọn thuật toán.

| Mạng trong đời thực | Đỉnh và cạnh | “Ngắn” đang nghĩa là gì? |
|---|---|---|
| Tàu điện tính số lần qua trạm | Trạm và tuyến nối trực tiếp | Ít cạnh nhất nếu coi mỗi cạnh cùng giá |
| Giao hàng theo thời gian | Điểm giao và đường cho phép đi | Tổng phút di chuyển nhỏ nhất |
| Quan hệ theo dõi | Tài khoản và mũi tên theo dõi | Số bước đi theo đúng hướng; không được tự đảo cạnh |

**Đọc thành lời:** `d(v)←min(d(v),d(u)+w(u,v))` là “thử đi đến v qua u; nếu đường thử tốt hơn ước lượng hiện tại thì cập nhật”. Ký hiệu d là chi phí tốt nhất đã tìm thấy, chưa luôn là chi phí tối ưu đã chứng minh. Bước cập nhật này thường gọi là nới lỏng cạnh.

**Tính tay:** xét đồ thị vô hướng có A–B=2 phút, B–C=1 phút, A–C=5 phút, C–D=3 phút. Từ A, ban đầu d(B)=2, d(C)=5. Mở rộng B cho đường A–B–C giá 3 nên giảm d(C) từ 5 xuống 3. Đi tiếp từ C cho d(D)=6. Tuyến A–C–D có hai cạnh giá 8; tuyến A–B–C–D có ba cạnh giá 6. Ít bước hơn không đồng nghĩa ít phút hơn.

**Phản ví dụ:** BFS tìm ít cạnh nhất trên đồ thị không trọng số hoặc các cạnh đồng giá; dùng BFS để tối thiểu tổng phút ở ví dụ này có thể ưu tiên tuyến 8 phút. Dijkstra dùng nguyên tắc chọn đỉnh chưa chốt có khoảng cách nhỏ nhất và cần trọng số **không âm**. Nếu cho phép cạnh âm, lập luận chốt đỉnh ấy có thể sai; cần thuật toán phù hợp như Bellman–Ford và xét cả khả năng chu trình âm.

**Giới hạn:** chi phí gắn trên cạnh là mô hình của thực tế. Nếu một đường hết 3 phút lúc 8 giờ nhưng 15 phút lúc 9 giờ, một đồ thị trọng số tĩnh chỉ mô tả thời điểm hoặc mức trung bình đã chọn. Tương tự, người có nhiều bạn nhất chỉ có bậc lớn nhất; chưa chắc là người nối các cộng đồng hoặc có ảnh hưởng lớn nhất theo mọi tiêu chí.

:::interactive graph
:::

:::quiz
Trong đồ thị trên, đường A–B–C–D có giá 6 và A–C–D có giá 8. Muốn đến nhanh nhất, chọn gì?
A. A–B–C–D vì tổng phút nhỏ hơn dù nhiều cạnh hơn.
B. A–C–D vì có ít cạnh hơn.
C. Hai tuyến luôn tương đương vì cùng điểm đầu và cuối.
Đáp án: A
Giải thích: Mục tiêu là tổng trọng số phút; số cạnh chỉ thay thế được tiêu chí này khi các cạnh có cùng chi phí.
:::

**Tự thử thêm:** thêm cạnh B–D=2 phút vào đồ thị. Đường tốt nhất A→D đổi thế nào?

:::goi-y
So tuyến đi qua B rồi thẳng đến D với giá 6 đang có. Không cần cộng tất cả cạnh trong đồ thị.
:::

:::loi-giai
A–B–D có chi phí 2+2=4 phút, tốt hơn 6. Đường ngắn nhất mới có hai cạnh; số cạnh chỉ tình cờ cũng giảm trong trường hợp này.
:::

---

## 10. Bài tập

### Khởi động (nhận diện & giải thích bằng lời)
1. Phân biệt "đồ thị vô hướng" và "có hướng" bằng ví dụ (quan hệ bạn bè vs quan hệ theo dõi).
2. Một đồ thị có 4 đỉnh và 3 cạnh. Bỏ thêm ràng buộc nó là cây → có mấy cạnh? (Áp quy tắc n−1.)
3. Giải thích bằng lời: vì sao "đường ít chặn" chưa chắc là "đường ngắn nhất về thời gian".

### Luyện tập (áp dụng vào bài toán mới)
4. Trên đồ thị mục 6.1 (A–B 2, A–C 5, B–C 1, C–D 3), tìm đường ngắn nhất từ A đến C. Giải thích vì sao đường gián tiếp tốt hơn đường trực tiếp.
5. Cho mạng: X nối Y (3), X nối Z (8), Y nối Z (2), Z nối W (4), Y nối W (1). Tìm đường ngắn nhất X → W và nêu tổng. *(Giải theo ý tưởng Dijkstra ở trên.)*
6. Tính bậc mỗi nút trong mạng bài 5.

### Thử thách (liên hệ với máy tính/AI)
7. Một mạng xã hội: người A nối B và C; B nối D; C nối D. Nhận diện nút nào "nối/cầu" giữa các nhóm — chỉ ra lý do. Gợi ý: nếu bỏ A, B và C có còn liên thông qua D không? Đây là "giữa các cặp" (betweenness).
8. Giải thích bằng lời: vì sao trong một hệ thống giao hàng ta có thể dùng "thời gian trung bình trên mỗi cạnh" làm trọng số dự đoán, và hạn chế (thời gian thay đổi theo giờ) như thế nào — nối với khái niệm trọng số đồ thị.

### Đáp án / gợi ý (phần riêng — tự thử trước)

:::loi-giai
1. Vô hướng: "a là bạn b của b" đối xứng. Có hướng: "a theo dõi b" — a→b nhưng b không nhất thiết → a. Biểu diễn khác nhau (danh sách cạnh có định hướng).
2. Cây n đỉnh → n−1 cạnh. Với 4 đỉnh → 3 cạnh (đúng đề cho) → khớp, không phải thêm gì; đây là kiểm tra.
3. Vì "ngắn" theo thời gian phải tính **tổng trọng số** (thời gian mỗi chặn). Đường ít chặn có thể có chặn dài/kẹt → tổng lớn hơn.
4. A→C trực tiếp = 5. A→B→C = 2+1=3 < 5. Vậy đường gián tiếp (A–B–C) ngắn hơn đường trực tiếp (5→3). Vì cạnh A–C nặng 5, đường vòng A–B–C nặng 3.
5. X→Y→W = 3+1 = 4; X→Y→Z→W = 3+2+4=9; X→Z→W = 8+4=12. Ngắn nhất X→Y→W = 4.
6. X: Y,Z → deg 2; Y: X,Z,W → 3; Z: X,Y,W → 3; W: Z,Y → 2.
7. Nút A nối nhóm {B,C}... Thực tế: nếu bỏ W khỏi... — áp: bỏ D → B–C gián tiếp qua A vẫn liên thông; bỏ A → mọi người (B,C,D) vẫn nối qua D → A không phải cầu then chốt. Nút D nối B và C → trung tâm; A nối B,C nhưng B,C còn nối D nên nếu bỏ A hệ vẫn liên thông — D là "giữa các cặp" cao hơn. (Đáp gợi ý: D quan trọng vì nối B,C,W...)
8. Thời gian mỗi cạnh có thể là trung bình (ước tính tốt theo mùa/giờ) nhưng thời gian thực biến động (kẹt, thời tiết). Trọng số tĩnh bỏ sót biến thiên → cần trọng số cập nhật động theo thời gian. Nhận diện: đồ thị giúp mô hình hóa *cấu trúc*, còn giá trị trọng số phải phản ánh dữ liệu thay đổi.
:::

---

## 11. Tóm tắt bằng ngôn ngữ đời thường

1. **Đồ thị** = các điểm (nút) + các đường nối (cạnh), có thể gắn **trọng số** (khoảng cách, thời gian) — ngôn ngữ của mọi mạng lưới.
2. Bản đồ tàu điện ngầm, mạng xã hội, mạng máy, bản đồ đường đi — đều là đồ thị.
3. **Đường đi ngắn nhất** tính bằng tổng trọng số (không phải số chặn) — nền của GPS và định tuyến.
4. **Bậc (degree)** và các độ đo tương tự giúp tìm "nút quan trọng" — nhưng chỉ là phép đo thô, đừng lấy làm chân lý tuyệt đối.
5. **Cây** là đồ thị không vòng, gọn, giúp tránh lặp — nền của bảng phân cấp và nhiều mô hình ML.