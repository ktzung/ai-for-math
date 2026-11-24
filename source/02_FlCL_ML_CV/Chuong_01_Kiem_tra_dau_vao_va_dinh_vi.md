# Chương 1.1 — Kiểm tra đầu vào & định vị (Giai đoạn 1)

> Đây là chương đầu tiên của lộ trình. Trước khi "học", bạn cần biết mình đang đứng ở đâu — và chuyến đi này đi về đâu.

---

## 1. Vị trí trong lộ trình

Đây là điểm xuất phát. Nếu bài kiểm tra đầu vào (trong `00_LoTrinh_MucLuc.md`) cho thấy bạn thiếu nền, bạn đã đi qua **Giai đoạn 0 (học bù)**; chương này là nơi bạn *chốt lại* vị trí và thiết lập "phòng thí nghiệm" đầu tiên.

Chương này **nối** từ kết quả kiểm tra đầu vào và **chuẩn bị** cho Chương 1.2 (Đọc dữ liệu & tổ chức thí nghiệm) và toàn bộ Giai đoạn 1–2. Nếu bạn không có máy Python, chương này chính là nơi bạn cài môi trường trước khi bất kỳ mã nào chạy được.

---

## 2. Kiến thức cần dùng

Không cần gì ngoài việc đã đọc phần "Bài kiểm tra đầu vào" trong mục lục. Mọi kỹ năng (Python, toán, PyTorch) đều là trạng thái **được đo** ở đây, chứ chưa cần thành thạo.

Nếu bạn quên: phần này nhắc lại đúng *một việc* — kiểm tra đầu vào chỉ để **định hình chương trình**, không phải để chấm "trượt/đỗ". Không ai bị loại; mọi kết quả đều đưa đến một nhánh học cụ thể.

---

## 3. Câu chuyện mở đầu

Lan là sinh viên năm cuối khoa CNTT. Cô muốn làm đồ án về "nhiều bệnh viện cùng huấn luyện mô hình nhận diện ảnh X-quang mà không được chia sẻ ảnh bệnh nhân" — chính là Federated Learning (Chương G6). Cô tải một hướng dẫn "Federated Learning for Beginners" về. Mở ra, cô lạc vào một rừng mã PyTorch, thuật ngữ `client`, `round`, `non-IID`, và công thức đầy `Σ` và `gradient`. Cô cảm thấy mình "không đủ giỏi" và muốn bỏ cuộc.

Câu hỏi mà chương này và cả lộ trình trả lời:

> *"Tôi phải biết những gì, và còn thiếu gì, để có thể hiểu và triển khai thứ Lan đang đọc?"*

Đây không phải câu hỏi "khó hay dễ". Nó là câu hỏi *"bắt đầu từ đâu"*. Chương này giúp bạn trả lời câu đó một cách trung thực — và không xấu hổ.

---

## 4. Câu hỏi trọng tâm

**Với kiến thức hiện tại của tôi, tôi nên bắt đầu từ giai đoạn nào — và tôi cần học bù những gì?**

---

## 5. Trực giác

Hình dung ba người bạn cùng muốn leo một ngọn núi (đích: hiểu + triển khai FL/CL cho ảnh):

- **A** biết Python khá, từng train một mạng nơ-ron nhỏ → đứng ở chân núi phía cao, chỉ cần đi bộ tiếp.
- **B** biết Python, nhưng chưa từng nghe "gradient descent" → đứng ở chân núi phía thấp hơn, cần đi ngang một đoạn về toán.
- **C** chỉ mới học Python vài tuần → đứng khá xa, cần đi đường vòng dài hơn (qua Giai đoạn 0).

Cả ba đều đi **cùng một ngọn núi** (cùng một lộ trình), chỉ khác **điểm xuất phát**. Kiểm tra đầu vào giống như dùng GPS để biết mình đang ở đâu — chứ không phải để phán xét "bạn leo được hay không". Điểm xuất phát thấp không đáng xấu hổ; nó chỉ có nghĩa là *đường đi của bạn dài hơn chút*, và đó là thứ bạn kiểm soát được.

*(So sánh "kiểm tra đầu vào = GPS" chỉ dùng để minh họa cách định vị. Giới hạn: GPS cho vị trí một thời điểm; kiến thức thay đổi theo thời gian, và một người "dốt hôm qua" có thể "giỏi hôm nay". Đừng đóng băng bản thân trong một kết quả kiểm tra.)*

---

## 6. Từ trực giác đến mô hình

Hãy định hình "kiến thức" thành các *thành phần đo được*:

- **Dữ liệu (học liệu):** câu trả lời cho 20 câu hỏi kiểm tra đầu vào (Python, toán, học máy/học sâu).
- **Mô hình (điểm xuất phát):** một "ngưỡng" rời: nếu điểm ≥ ngưỡng → vào thẳng G3–G4; trung bình → có nhánh học bù; thấp → đi qua G0.
- **Client/Server (không có ở đây — chương này không có nhiều bên):** nhấn mạnh rằng chương này chỉ là *điểm start trên máy của bạn*, chưa liên quan đến FL/CL.
- **Điều kiện & giả định:** giả định bạn có máy tính có thể chạy Python. Mục tiêu tối ưu: *bắt đầu đúng chỗ* — đủ nền mà không lãng phí thời gian học lại thứ đã biết.
- **Thông tin giữ lại:** kết quả kiểm tra (điểm) của riêng bạn — để quyết định nhánh học.

Thuật toán "định vị" (mã giả):

```
điểm = chấm bài kiểm tra đầu vào (20 câu)
if điểm >= 14: bắt đầu tại Giai đoạn 3 (lướt G1–G2 nhanh)
elif điểm >= 8: làm bài học bù theo các phần sai, rồi bắt đầu tại G2
else: đi qua Giai đoạn 0 đầy đủ trước, rồi vào G1
```

*(Đây là khuyến nghị. Nếu bạn tự tin vào năng lực nhưng điểm kiểm tra thấp vì quên, hãy chọn nhánh học bù gọn hơn — bạn nắm chủ động.)*

---

## 7. Thuật toán từng bước (định vị & chuẩn bị máy)

**Bước 1 — Cài môi trường Python (nếu chưa có).**
Khuyến nghị tối giản để "không lạm dụng": chạy Python + tạo môi trường ảo.
- Windows/Linux: `python -m venv .venv` rồi `source .venv/bin/activate` (Windows: `.venv\Scripts\activate`).
- macOS có thể cần cài Python qua Homebrew/`pyenv` nếu chưa có.

**Bước 2 — Kiểm tra bản in Python.**
Vì phiên bản thư viện ảnh hưởng kết quả, ta **ghi rõ** phiên bản. Chạy:

```python
import sys
print(sys.version)          # bản Python
```

**Lưu ý trung thực về môi trường:** câu lệnh trên là để *đọc* phiên bản. Kết quả (số phiên bản) có thể khác máy bạn so với tài liệu này — vậy **hãy ghi lại số đó** trong sổ tay thí nghiệm của mình.

**Bước 3 — Cài các thư viện cần dùng.**
Trong môi trường ảo đã kích hoạt:

```bash
pip install numpy matplotlib torch torchvision
```

- `numpy` — mảng số.
- `matplotlib` — vẽ đồ thị.
- `torch` + `torchvision` — PyTorch & dữ liệu ảnh chuẩn.

*(Giả định: bạn cài trên CPU. Nếu bạn có GPU, phiên bản torch cần cài theo hướng dẫn riêng của PyTorch; ở lộ trình này CPU là đủ.)*

**Bước 4 — Kiểm tra môi trường chạy được.**

```python
import torch
import torchvision
print(torch.__version__)
print(torchvision.__version__)
x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print(x + 1)   # mỗi phần tử cộng một
```

**Kết quả dự kiến:** in ra 2 phiên bản thư viện và một bảng số 3×3 (2 hàng × 2 cột cộng 1). Nếu dòng `import torch` báo lỗi "ModuleNotFoundError", nghĩa là chưa cài xong → quay lại Bước 3.

**Giải thích:** tensor là "mảng nhiều chiều" của PyTorch (khái niệm chi tiết ở Chương 1.4). Lệnh `x + 1` cho thấy phép cộng tự áp dụng cho **từng phần tử** — một hành vi NÚT-quan-trọng sẽ dùng suốt lộ trình.

**Lỗi thường gặp:**
- `ModuleNotFoundError` → chưa cài đúng thư viện hoặc sai môi trường ảo.
- `No module named 'torch'` nhưng đã cài → nhớ kích hoạt đúng môi trường ảo (Bước 1).
- Cài torch rất lâu → bình thường, đợi hoàn tất.

---

## 8. Ví dụ nhỏ có số liệu

Giả sử bạn chấm bài kiểm tra đầu vào **20 câu** (như mục lục) và đếm được:

- Phần A (Python + công cụ, 7 câu): làm đúng 6.
- Phần B (Toán, 6 câu): làm đúng 2.
- Phần C (ML/DL, 7 câu): làm đúng 1.

**Tổng điểm = 6 + 2 + 1 = 9.**

**Diễn giải theo thuật toán:**
- Điểm `9` nằm khoảng `8 ≤ điểm < 14` → **khuyến nghị:** làm học bù theo *phần làm sai*. Cụ thể phần B sai 4/6 (toán yếu) và phần C sai 6/7 (ML/DL chưa biết) → ôn mạnh Part B (G0.3 toán bù) và coi G0 như cần thiết cho ML nếu chưa quen.
- Không đòi hỏi "bạn cần phải giỏi". Chỉ là: *"để hiểu FL/CL, bạn cần nắm nền này; đây là chỗ bạn dành thời gian."*

**Lưu ý về phân tích (tính cẩn thận):** điểm `9` là 9/20 = 45%. Nhưng đừng quy đổi nhanh thành "đậu/rớt" — theo khung, 45% nằm giữa ngưỡng, nghĩa là bạn cần ôn có chọn lọc. Đây là ví dụ về **cách dùng số liệu để ra hệ thống quyết định**, một thói quen bạn sẽ rèn suốt lộ trình (đánh giá mô hình ở Chương G2.7).

**Sai số thường gặp khi tự chấm:** đếm nhầm, hoặc chấm "đúng đại khái". Cách đúng: mỗi câu, nếu bạn làm được mà không tra cứu thì mới tính đúng. Kiểm tra đầu vào không chấm "ý đại khái".

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "cứ bắt đầu từ trang đầu, học hết mọi thứ từ A đến Z".

| Phương diện | Học tuần tự không khảo sát | Khảo sát đầu vào (chương này) |
|---|---|---|
| Thời gian cho phần đã biết | Lãng phí (học lại từ đầu) | Tiết kiệm (bỏ qua phần đã nắm) |
| Thời gian cho phần thiếu | Có thể bỏ lỡ vì không biết mình thiếu | Đặt đúng chỗ, không bỏ sót |
| Rủi ro | Bỏ cuộc vì "quá nhiều" | Vẫn phải tự trung thực khi tự chấm |
| Đánh đổi | Không cần chuẩn bị gì | Phải dành 20 phút làm bài kiểm tra |

**Cải thiện:** giảm lãng phí, đặt đúng nền tảng. **Đánh đổi:** phải tự chấm nghiêm túc — nếu tự cho mình điểm cao quá, bạn sẽ bỏ lỡ nền tảng. Đó là trade-off mà người học tự kiểm soát.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát trực tiếp "môi trường Python hoạt động đúng" và hình thành thói quen *kiểm tra môi trường* — thói quen dùng trong mọi thí nghiệm sau này (G4, G6, G7).

Thực hiện chạy script Bước 4. **Điều cần ghi vào sổ tay:**
1. Bản Python.
2. Bản `torch` và `torchvision`.
3. Kết quả `x + 1` (bảng số).

**Ý nghĩa:** nếu có gì đó sau này "chạy sai", bước đầu tiên là xem lại *phiên bản + môi trường*. Việc ghi lại cấu hình ngay từ đầu chính là nền của "báo cáo tái lập được" (Chương G9.6).

---

## 11. Thực hành lập trình

**Môi trường & thư viện:** Python + venv + numpy, matplotlib, torch, torchvision (xem Bước 1–3).

**Cấu trúc dữ liệu:** chưa cần dữ liệu; chỉ cần một script `check_env.py`:

```python
# check_env.py — kiểm tra môi trường
import sys
import numpy as np
import torch

print("Python:", sys.version.split()[0])
print("NumPy:", np.__version__)
print("Torch:", torch.__version__)
x = torch.tensor([[1., 2.], [3., 4.]])
print("x + 1 =\n", (x + 1).numpy())
```

**Cách chạy:** `python check_env.py` (trong môi trường ảo đã kích hoạt).

**Kết quả dự kiến:**
```
Python: 3.x.y
NumPy: x.y.z
Torch: x.y.z
x + 1 =
 [[2. 3.]
 [4. 5.]]
```
*(Các số "x.y.z" phụ thuộc phiên bản của bạn — ghi lại chúng.)*

**Lỗi thường gặp:**
- "Python: 3.8" rất cũ → nên nâng bản Python (một số thư viện mới đòi bản ≥3.9).
- `ModuleNotFoundError: No module named 'torch'` → quên cài hoặc sai môi trường.
- Torch cài về máy ai? **Đúng phải cài trong môi trường ảo**, không phải Python hệ thống.

**Chú thích trung thực:** tài liệu này không xác nhận mã đã được lập trình-chạy trên từng hệ điều hành. Phiên bản PyTorch có thể thay đổi chi tiết in; nếu có gì lạ, đối chiếu lại phiên bản bạn cài.

---

## 12. Đánh giá

**Chỉ số:** 2 việc được đo — (1) **môi trường chạy đúng** (script Bước 11 in đủ 3 dòng phiên bản + bảng số), (2) **điểm đầu vào** (đã chấm, đã chọn nhánh).

**Vì sao chọn chỉ số này:** trước khi học nội dung, thứ duy nhất cần "đo" là môi trường có sẵn sàng — nếu môi trường chưa chạy được thì mọi chương sau bị kẹt. Điểm đầu vào quyết định nhánh học bù.

**Chỉ số này KHÔNG thể hiện:** điểm đầu vào không đo được tiềm năng, động lực, hay tốc độ học. Nó chỉ là trạng thái *tại thời điểm đó*. Trong các chương sau (nhất là G2.7), ta sẽ học phân biệt rõ "chỉ số đo được cái gì" và "nó không nói lên điều gì" — một nguyên tắc áp dụng xuyên suốt cả lộ trình.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Điểm thấp = không nên học lộ trình này." → Sai. Mọi điểm đều có nhánh học; lộ trình được thiết kế cho người bắt đầu từ số 0 (G0–G1).
- **Hiểu lầm 2:** "Điểm cao = tôi có thể bỏ qua nền tảng." → Sai. Điểm cao ở *vài câu* không nghĩa là nắm chắc *toàn bộ* giai đoạn. Vẫn nên lướt nhanh để đảm bảo không bỏ lỗ hổng.
- **Hiểu lầm 3:** "Cài môi trường xong = đã sẵn sàng mọi thứ." → Mới bắt đầu. Cài môi trường chỉ là "chìa khóa mở cửa", không phải "hoàn thành chuyến đi".
- **Giới hạn của chương này:** nó **không dạy** Python, toán, hay ML — nó chỉ định vị. Kiến thức đó đến từ G0–G5. Đừng nhầm việc "cài được môi trường" với "hiểu được FL/CL".

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng)
1. Bằng lời (không cần chạy): bài kiểm tra đầu vào dùng để làm gì? Vì sao không phải để "đậu/rớt"?
2. Đọc sơ đồ ở mục 6: một người được 15/20 điểm theo khuyến nghị bắt đầu ở giai đoạn nào?

### Luyện tập (sửa đổi / mở rộng)
3. Chạy lại `check_env.py` với một phép biến đổi nhỏ: in `x * 2` thay cho `x + 1`. Ghi lại kết quả. (Mục đích: quen sửa & chạy mã.)
4. Nếu điểm của bạn là 6/20, bạn sẽ đi qua những nhánh học bù nào? Giải thích bằng lời.

### Thử thách (thiết kế / liên hệ)
5. Bạn được giao thiết kế lại bài kiểm tra đầu vào sao cho ít bị "điểm cao giả". Đề xuất 2 thay đổi và giải thích vì sao chúng làm bài kiểm tra trung thực hơn. *(Tham chiếu: G2.7 về chỉ số & đánh giá.)*

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Để *định hình chương trình* theo điểm xuất phát; ai cũng có nhánh học — mục tiêu là "bắt đầu đúng chỗ" chứ không phải "chấm qua/rớt".
2. `≥14` → bắt đầu tại Giai đoạn 3 (lướt nhanh G1–G2); cụ thể là vào thẳng G3 vì "nền tảng đã ổn".
3. `x * 2` sẽ in `[[2.,4.],[6.,8.]]` — phép nhân cũng áp dụng từng phần tử (một hành vi mảng sẽ dùng mãi).
4. Mức 6/20 thuộc nhóm thấp → đi qua **Giai đoạn 0 đầy đủ** (Python + toán + công cụ) trước khi vào G1; không bỏ qua từng phần đã sạch.
5. Ví dụ gợi ý: (a) *yêu cầu làm không tra cứu* để đo đúng kiến thức hiện có; (b) *thêm câu hỏi "giải thích"* (không chỉ trắc nghiệm), vì trắc nghiệm dễ đoán → giảm "điểm cao giả".

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. Kiểm tra đầu vào dùng để **định vị điểm xuất phát**, không phải để loại ai khỏi lộ trình.
2. Điểm quy ra **nhánh học**: cao (≥14) → thẳng G3; trung bình (8–13) → học bù có chọn lọc; thấp (<8) → qua G0 đầy đủ.
3. Trước khi học nội dung, **cài và kiểm tra môi trường** (Python, NumPy, torch) — và ghi lại phiên bản.
4. Phân biệt **chỉ số đo được** (điểm, môi trường chạy) với **điều nó không nói lên** (tiềm năng, động lực).
5. Thói quen *đo trước khi học / ghi cấu hình* là nền tảng của báo cáo tái lập được — dùng xuyên suốt lộ trình.

**Tự kiểm tra (đọc to, trả lời trong đầu):**
- Kiểm tra đầu vào giúp gì về mặt lộ trình?
- Với điểm của bạn, nhánh bắt đầu là gì, và cần học bù phần nào?
- `check_env.py` đã chạy đúng chưa? Bạn đã ghi lại phiên bản chưa?
- Điểm đầu vào có cho biết bạn "giỏi hay dốt" không? Vì sao không?
- Bạn cần làm gì trước Chương 1.2? *(Đáp: đảm bảo môi trường chạy + ghi điểm/nhánh bắt đầu.)*

---

## 16. Đọc sâu bằng trực giác — tổng điểm che mất hồ sơ từng phần

Một bác sĩ không kết luận sức khỏe chỉ từ cân nặng; cùng 60 kg nhưng một người cao 1,75 m và một người cao 1,55 m cần lời khuyên khác. Điểm đầu vào cũng vậy: tổng 9/20 chỉ là một con số, còn hồ sơ A/B/C mới cho biết nên học bù ở đâu.

| Cách đọc | Con số | Điều có thể kết luận |
|---|---|---|
| Tổng điểm | 9/20 = 45% | Nằm giữa hai ngưỡng, cần ôn chọn lọc |
| Hồ sơ từng phần | A 6/7, B 2/6, C 1/7 | Toán và ML/DL là chỗ thiếu nặng nhất |
| Ngưỡng lộ trình | ≥14 vào G3; 8–13 vào G2; <8 qua G0 | Chỉ là khuyến nghị, không phải nhãn năng lực |

**Đọc thành lời:** `điểm = A + B + C`, rồi so với hai ngưỡng 14 và 8. Ký hiệu A/B/C là số câu đúng của ba phần, không phải điểm phần trăm. Điều dễ đọc sai là thấy 9/20 rồi kết luận "trung bình nên học lại mọi thứ"; quyết định đúng dựa trên phần nào yếu, vì hai người cùng 9 điểm có thể cần hai nhánh khác nhau.

**Tính tay:** với A=6/7, B=2/6, C=1/7, ta có `6+2+1=9`. Tỉ lệ từng phần là `6/7≈85,7%`, `2/6≈33,3%`, `1/7≈14,3%`. Điểm 9 nằm trong khoảng 8–13, nên nhánh gợi ý là vào G2 kèm học bù toán (B) và ML/DL (C); phần Python (A) có thể lướt nhanh.

**Phản ví dụ:** một bạn khác cũng được 9 nhờ A=2/7, B=5/6, C=2/7. Nếu chỉ nhìn tổng, ta sẽ cho hai bạn cùng một kế hoạch; nhưng bạn thứ hai mạnh toán, yếu Python, nên cần học bù A và C, không cần lặp lại B. Tổng điểm giống nhau không đồng nghĩa hồ sơ giống nhau.

**Giới hạn:** bài kiểm tra 20 câu là mẫu nhỏ, còn phụ thuộc việc tự chấm và trạng thái lúc làm. Nó đo hiện trạng để chọn điểm bắt đầu, không đo tiềm năng hay dự báo kết quả cuối lộ trình. Hãy làm lại khi đã học bù để cập nhật vị trí.

:::interactive readiness
:::

:::quiz
Bạn X có A=6/7, B=2/6, C=1/7; bạn Y có A=2/7, B=5/6, C=2/7. Cả hai được 9/20. Kết luận nào hợp lý?
A. Hai bạn nên học bù giống hệt nhau vì cùng tổng điểm.
B. Y chắc chắn giỏi hơn X vì điểm toán cao hơn.
C. Cần xem hồ sơ từng phần để chọn nội dung học bù khác nhau.
Đáp án: C
Giải thích: Tổng điểm chỉ dùng để chọn ngưỡng chung; phần yếu quyết định nội dung cần ôn. X yếu toán/ML, còn Y yếu Python/ML, nên kế hoạch không thể giống hệt.
:::

**Tự thử thêm:** một bạn đạt A=5/7, B=5/6, C=4/7. Tính tổng, xác định ngưỡng lộ trình và nêu phần nào vẫn nên ôn trước khi vào G3.

:::goi-y
Cộng ba tử số trước, so với 14 và 8; sau đó nhìn phần có tỉ lệ thấp nhất thay vì chỉ nhìn tổng.
:::

:::loi-giai
`5+5+4=14`, đạt ngưỡng vào G3. Tỉ lệ lần lượt khoảng 71,4%, 83,3% và 57,1%; Python và ML/DL vẫn nên lướt lại, dù không cần đi qua G0 đầy đủ.
:::