# Chương 3.1–3.3 — Neuron, các tầng, hàm kích hoạt & lan truyền xuôi–ngược (Giai đoạn 3)

> **Câu hỏi trọng tâm:** *Một mạng nơ-ron được xây bằng "tế bào và tầng" như thế nào, và dữ liệu chảy ra sao qua forward (xuôi) rồi lỗi lan ngược (backward)?*

---

## 1. Vị trí trong lộ trình

Đã xong ML nền (G2): mô hình tuyến tính, logistic, loss, gradient descent. Giai đoạn 3 nâng lên **học sâu**: nhiều tầng kết nối (mạng nơ-ron), có hàm kích hoạt, học bằng backprop. Đây là nền để đọc mọi kiến trúc hiện đại (G4 CV, G5 Transformer).

Ta gộp 3 chương đầu (neuron/tầng, activation, forward-backward) thành **một bài** vì chúng là một khối liên tục: một "neuron" không đứng riêng — có tầng + activation thì mới thành mạng, và cần forward/backward để học.

---

## 2. Kiến thức cần dùng

- Hồi quy/logistic (G2.4), gradient descent (G2.6).
- Ma trận nhân vector (sách toán C3), dây chuyền & đạo hàm (C4).
- Vòng lặp PyTorch (G1.4).

**Ôn nhanh:** một neuron = `hàm tuyến tính + hàm kích hoạt`. Ma trận nhân vector = "áp quy tắc tuyến tính cho mọi đặc trưng". Quy tắc dây chuyền = cách đạo hàm hàm lồng nhau.

---

## 3. Câu chuyện mở đầu

Lan muốn phân loại ảnh mèo/chó nhưng dữ liệu không tách được bằng một đường thẳng (G2.4 thất bại: vùng "mèo" và "chó" đan xen phi tuyến). Cô cần một mô hình *uốn được* ranh giới.

Cô ghép nhiều "tế bào tuyến tính" lại, mỗi cái chịu trách nhiệm một góc của vùng — giữa các tế bào cô chèn một **hàm kích hoạt phi tuyến** để tổ hợp "uốn" được. Kết quả: một **mạng nơ-ron** — một hàm rất linh hoạt học được ranh giới cong. Và để học nó, cô cần **backprop**: lan truyền lỗi ngược từ đầu ra về từng trọng số (dây chuyền).

---

## 4. Câu hỏi trọng tâm

**Một mạng nơ-ron gồm tế bào/tầng/activation như thế nào, và cơ chế forward + backprop giúp nó học ra sao?**

---

## 5. Trực giác

**Neuron = (tổng tuyến tính) + (phi tuyến).** Một "tế bào" nhận nhiều đầu vào `x₁, x₂…`, nhân với trọng số `w₁, w₂…`, cộng lại (`w·x + b` — giống logistic), rồi đưa qua hàm kích hoạt (như ReLU) để có đầu ra. Lý do phi tuyến: nếu chỉ toàn tuyến tính, xếp mấy tầng cũng "sụp" thành một tầng tuyến tính (sách toán C9) — không học được sự phi tuyến của dữ liệu.

**Mạng = nhiều tầng neuron nối nhau.** Mỗi tầng lấy đầu ra tầng trước làm đầu vào. Lớp đầu nhận "đặc trưng" (pixel), lớp cuối cho dự đoán/xác suất. Các tầng giữa (hidden layers) "trích xuất biểu diễn" ngày càng trừu tượng.

**Forward = dữ liệu chảy từ đầu vào ra đầu ra.** Mỗi tầng làm phép `activation(W·x + b)` rồi chuyển tiếp. **Backward (backprop) = lỗi lan ngược.** Dùng quy tắc dây chuyền, ta tính "lỗi ở đầu ra do mỗi trọng số ở mỗi tầng gây ra" — giống truyền thông điệp ngược từng lớp để điều chỉnh.

**Phép soánh "dây chuyền sản xuất":** nguyên liệu (dữ liệu) qua nhiều khâu (tầng), mỗi khâu biến đổi; forward = đi xuôi. **Giới hạn:** trực quan tốt cho forward, nhưng backward không phải "gỡ ngược quy trình" đơn giản — nó là *phép đạo hàm chính xác* ngược từng tầng bằng dây chuyền. Đừng nghĩ backprop "chạy mã nguợc" mã delta như thật; nó tính gradient toán học.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** ảnh → tensor (N, 3, H, W) (G1.2) → dẹt vector / giữ spatial (G4).
- **Neuron/tầng:** `z = W·x + b` (tuyến tính); `a = activation(z)`.
- **Mạng:** chồng nhiều `(W, b, activation)`.
- **Loss:** cross-entropy (phân loại, G2.2) — đầu ra tầng cuối thường qua softmax.
- **Học:** backprop tính gradient theo mọi `W,b` (dây chuyền); gradient descent cập nhật (G2.6).

**Thuật toán forward (mạng 2 tầng):**
```
a0 = x
z1 = W1·a0 + b1 ; a1 = ReLU(z1)
z2 = W2·a1 + b2 ; logits = z2
```
**Backward:** từ loss, tính grad theo W2 (đạo hàm CE+softmax), rồi dây chuyền grad theo W1 qua `∂a1/∂z1`, `∂z1/∂W1`.

PyTorch: bạn chỉ viết *forward*; `.backward()` tự làm backward bằng autograd (G1.4), nhưng *hiểu* backward giúp bạn debug.

---

## 7. Thuật toán từng bước (viết mạng & vòng huấn luyện)

**Bước 1 — Mạng nơ-ron nhỏ trong PyTorch.**

```python
import torch.nn as nn
model = nn.Sequential(
    nn.Linear(4, 8),   # tầng vào 4 → 8 neuron
    nn.ReLU(),         # kích hoạt
    nn.Linear(8, 2),   # 8 → 2 (2 lớp: mèo/chó)
)
```

- `nn.Sequential` xếp các tầng tuần tự.
- `nn.Linear(in, out)`: một lớp `W·x+b` (in→out).
- `nn.ReLU()`: phi tuyến `max(0, z)`.

**Bước 2 — Forward.**

```python
x = torch.randn(1, 4)     # 1 mẫu, 4 đặc trưng
out = model(x)            # (1, 2) — logits 2 lớp
```

**Bước 3 — Loss + backward + step (vòng lặp như G1.4, G2.6).**

```python
loss = nn.CrossEntropyLoss()(out, y)
loss.backward()
optimizer.step()
```

**Bước 4 — Diễn giải hidden layer:** 8 neuron ở tầng giữa học "biểu diễn" đặc trưng trung gian — không phải con người chỉ định ý nghĩa từng neuron; chúng tự học.

**Lỗi thường gặp:** quên activation (sụp tuyến tính); sai shape giữa `Linear` (đầu vào phải khớp size trong); dùng `CrossEntropyLoss` với nhãn là số nguyên (không one-hot) — đúng theo API.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** phân loại nhị phân phi tuyến bằng mạng 2 tầng (x ∈ R¹).

**Bước 1 — Nếu chỉ tuyến tính:** `w·x+b` là ranh giới 1 điểm (line) — không tách được 2 cụm cong. MLP với ReLU có thể: dùng 2 neuron ẩn, mỗi neuron "làm thẳng" một phần, tổ hợp lại thành ranh giới "hộp".

**Bước 2 — Kiểm tay 1 neuron:**
- `z = w·x + b`, chọn w,b sao cho `z` phân biệt "x < 0" vs "x ≥ 0". ReLU: nếu z ≥ 0 giữ, z < 0 → 0. Neuron này "kích hoạt" một vùng nửa trục.
- Hai neuron ReLU nữa → nhiều vùng → tầng cuối "OR/tổ hợp" chúng → ranh giới lồi/cong.

**Bước 3 — Kết luận:** lý do activation phi tuyến + đủ neuron = mạng biểu diễn hàm phức tạp. (Giới hạn: cần đủ năng lực + dữ liệu; quá nhiều thì overfit, G2.5.)

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** logistic đơn (1 neuron, không activation giữa, không hidden layer).

| Phương diện | Logistic 1 lớp | MLP nhiều lớp |
|---|---|---|
| Ranh giới | đường/plane | cong/phức tạp |
| Khả năng biểu diễn | thấp | cao |
| Rủi ro overfit | thấp | cao (do nhiều tham số) |
| Đánh đổi | đơn giản | cần dữ liệu, đánh giá |

**Cải thiện:** học phi tuyến. **Đánh đổi:** nhiều tham số → dễ overfit (G2.5) — cần dữ liệu + regularization + đánh giá val.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát MLP học ranh giới phi tuyến (mà logistic không làm được).

1. Tạo dữ liệu 2 cụm "không tách tuyến tính" (VD 2 vòng tròn), hoặc `y = 1 if x>0 else 0` phức tạp.
2. Huấn luyện logistic (tuyến tính) vs MLP 2 tầng ReLU.
3. So sánh accuracy/val: MLP đạt cao hơn — minh họa sức mạnh phi tuyến.
4. Quan sát: thay activation ReLU bằng linear (hoặc bỏ) → mạng "sụp" tệ — chứng minh cần tồn activation.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + sklearn (tạo dữ liệu phi tuyến).

**Cấu trúc:** `scripts/mlp_vs_linear.py`:

```python
import torch, torch.nn as nn, torch.nn.functional as F
from sklearn.datasets import make_moons
import numpy as np

X, y = make_moons(200, noise=0.1)            # 2 cụm cong (không tách line)
Xt = torch.tensor(X, dtype=torch.float32); yt = torch.tensor(y, dtype=torch.long)

def train(model):
    opt = torch.optim.Adam(model.parameters(), lr=0.02)
    for _ in range(500):
        opt.zero_grad()
        logits = model(Xt)
        loss = F.cross_entropy(logits, yt)
        loss.backward(); opt.step()
    acc = (model(Xt).argmax(1) == yt).float().mean().item()
    return acc

lin = nn.Linear(2, 2)                        # logistic (tuyến tính)
mlp = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 2))
print("linear acc:", round(train(lin), 3))
print("mlp acc:", round(train(mlp), 3))
```

**Kết quả dự kiến:** MLP (với ReLU) đạt accuracy cao hơn rõ (VD 0.95+) so với tuyến tính (~0.5–0.65) trên make_moons. (Khởi tạo ngẫu nhiên; số có thể khác chút.)

**Lỗi thường gặp:** thiếu ReLU → MLP không hơn; nhãn phải `long` type; set seed để tái lập (G1.5).

**Chú thích trung thực:** dữ liệu đơn giản; minh họa "phi tuyến học được", không phải benchmark thật. Kết quả có thể lệch chút theo seed/lr.

---

## 12. Đánh giá

**Chỉ số:** MLP đạt accuracy cao hơn đáng kể logistic trên dữ liệu phi tuyến; loại bỏ ReLU thì mạng "sụp" về mức tuyến tính; hiểu được chuỗi forward + vai trò backprop.

**Vì sao chọn:** đây là bằng chứng trực tiếp rằng "activation + nhiều tầng" mở rộng khả năng biểu diễn — nền để đọc mọi architecture sau.

**Chỉ số không thể hiện:** không phủ các vấn đề thực (độ sâu, khởi tạo, gradient vanishing — G3.6); không đánh giá trên dữ liệu thật chuẩn. Đây là minh họa cơ chế.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Neuron = bản sao não người." — Không. Nó là phép nhân-chất + phi tuyến đơn giản; vay tên, không mô phỏng sinh học (đã nhắc sách C9).
- **Hiểu lầm 2:** "Càng nhiều lớp tự khắc giỏi hơn." — Không tự nhiên. Sâu hơn cần dữ liệu + khởi tạo + chống vanishing gradient (G3.6); quá sâu dễ khó train. "Đủ sâu hợp lý" là câu chuyện thực hành.
- **Hiểu lầm 3:** "`.backward()` là một ma thuật khéo." — Không; nó tính dây chuyền gradient một cách chính xác từ loss qua từng tầng. Hiểu cơ chế giúp bạn debug "không học" (G3.7) và chọn architecture.
- **Giới hạn:** backprop cần đạo hàm liên tục; một activation như ReLU có điểm kẹt ở 0 (đạo hàm không xác định) — PyTorch xử lý bằng quy ước; và vanishing gradient ở mạng sâu là vấn đề thực (G3.6).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Mô tả một neuron: phép tuyến tính + activation, từng bước.
2. Vì sao activation phi tuyến quan trọng (nếu toàn tuyến tính thì sao)?
3. Forward và backward khác nhau ra sao (vai trò dây chuyền)?

### Luyện tập (sửa đổi / mở rộng)
4. Trong `nn.Sequential(nn.Linear(8,4), nn.ReLU(), nn.Linear(4,2))`, tầng hidden có bao nhiêu neuron? Iterate qua `model` để in shape.
5. Thay ReLU bằng `nn.Tanh()` và `nn.Sigmoid()` trong mlp_vs_linear; quan sát accuracy (có thể kém hơn một chút). Giải thích sơ bộ.
6. Tăng width (16→64) MLP; hội tụ/accuracy thay đổi? (quan sát overfit nếu dữ liệu ít).

### Thử thách (thiết kế / liên hệ)
7. Vì sao việc "biểu diễn từng tầng" (từng lớp ẩn học đặc trưng trừu tượng hơn) lại là tiền đề của *transfer learning / fine-tuning* (G5) và *mô hình nền tảng*?
8. Trong FL, nếu mỗi client huấn luyện MLP trên dữ liệu thiên lệch lớp, các tầng ẩn có thể "trôi" khác nhau — liên hệ client drift (G6) và vì sao hiện tượng này với mạng nhiều tầng phức tạp hơn model đơn giản.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. `z = W·x + b`, `a = activation(z)`. Neuron = tổng có trọng số + biến đổi phi tuyến.
2. Không phi tuyến → chồng tầng sụp như ma trận tuyến tính đơn; mạng không học được phi tuyến dữ liệu (C9 sách toán).
3. Forward: dữ liệu/chấm từ đầu vào→ra output. Backward: từ loss, dây chuyền gradient ngược về từng trọng số để cập nhật.
4. Hidden có 4 neuron (Linear 8→4). In shapes để kiểm.
5. Tanh/Sigmoid vẫn phi tuyến nhưng có thể vanishing gradient / kém ổn định hơn; với bài nhỏ vẫn thường đạt, nhưng ReLU hay hơn trong thực tế (G3.6 lý giải).
6. Width lớn → năng lực cao hơn nhưng dễ overfit (train high, val cao chưa chắc); trên dữ liệu ít có thể overfit (G2.5).
7. Vì tầng ẩn học biểu diễn chung hữu ích (nhận diện cạnh, vùng, vật thể...); tận dụng biểu diễn đã học (pretrained) như "nền", chỉ fine-tune tầng cuối → mô hình nền tảng / transfer learning. Là cốt lõi G5.
8. Client học trên phân phối riêng → trọng số tầng ẩn hội tụ khác ("client drift"); với mạng nhiều tầng, khác biệt lan qua nhiều tầng, khó "trung bình" chuẩn hơn model nông. Đây là khó khăn FL với deep nets (G6, G8).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Neuron** = `W·x+b` + activation; **mạng** = nhiều tầng neuron.
2. **Activation phi tuyến** (ReLU...) là yếu tố giúp mạng học phi tuyến; không có nó mạng "sụp" tuyến tính.
3. **Forward** đưa dữ liệu từ đầu vào đến đầu ra qua từng tầng.
4. **Backprop** dùng quy tắc dây chuyền để lan lỗi ngược, tính gradient theo mọi trọng số → gradient descent cập nhật.
5. Mạng học "biểu diễn" trong tầng ẩn — tiền đề của transfer learning và mô hình nền tảng (G5).

**Tự kiểm tra:**
- Một neuron gồm phép gì và activation làm gì?
- Vì sao chồng nhiều tầng tuyến tính không giúp học phi tuyến?
- Forward và backward khác nhau thế nào?
- Vai trò lớp ẩn ("biểu diễn") liên hệ chuyện gì ở G5?

---

## 16. Đọc sâu bằng trực giác — activation là khúc quanh của đường gấp

Một sợi dây thẳng không thể tạo hình chữ V nếu chỉ kéo hai đầu; cần một chỗ bẻ. Mạng không có activation cũng vậy: chồng bao nhiêu lớp tuyến tính vẫn chỉ là một phép tuyến tính. Activation tạo chỗ bẻ để mạng biểu diễn đường gấp, vùng, và tương tác.

| Thành phần | Công thức | Nếu bỏ đi |
|---|---|---|
| Tầng affine | `z=w·x+b` | Không có trọng số để học |
| Activation | `a=φ(z)` | Nhiều tầng gộp thành một tầng |
| Lan truyền ngược | Chuỗi đạo hàm từ loss về `w` | Không biết cập nhật theo hướng nào |

**Đọc thành lời:** mỗi neuron tính điểm `z` từ đầu vào, rồi bẻ điểm đó qua `φ`: ReLU giữ phần dương và đặt phần âm về 0; sigmoid nén vào `(0,1)`. Khi huấn luyện, loss đi ngược qua từng phép để cho biết `∂L/∂w`; đó là quy tắc chuỗi. Điều dễ đọc sai là nghĩ lớp ẩn "tự hiểu" dữ liệu; nó chỉ là phép biến đổi có tham số, được định hình bởi loss và dữ liệu.

**Tính tay:** với `w=[2,−1]`, `x=[3,1]`, `b=0,5`: `z=2×3+(−1)×1+0,5=5,5`. ReLU cho `a=5,5`; sigmoid cho `a≈0,996`. Nếu `x=[1,3]` thì `z=2−3+0,5=−0,5`, ReLU cho `a=0` và neuron "tắt" ở mẫu này. Với loss `L=(a−1)²` và `a=5,5`, `∂L/∂a=9`; nếu ReLU đang mở, `∂L/∂z=9`, rồi `∂L/∂w₁=9×3=27`.

**Phản ví dụ:** xếp ba tầng `W₃(W₂(W₁x))` không có activation. Khai triển thành `(W₃W₂W₁)x`, tức vẫn chỉ là một ma trận. Mô hình "sâu" như vậy không học được đường cong, dù có hàng triệu tham số. Ngược lại, thêm ReLU nhưng mọi `z` đều âm thì các neuron chết, mạng cũng gần như tuyến tính.

**Giới hạn:** một neuron chỉ tạo một khúc; mạng cần nhiều neuron và nhiều lớp để ghép biểu diễn phức tạp. ReLU rẻ nhưng có thể chết nếu learning rate lớn; sigmoid bão hòa làm gradient rất nhỏ. Và lan truyền ngược chỉ hiệu quả khi đồ thị tính toán rõ ràng, gradient không bị cắt hoặc nổ.

:::interactive neuron
:::

:::quiz
Với `w=[2,−1]`, `x=[3,1]`, `b=0,5`, điểm `z` bằng bao nhiêu?
A. 5,5
B. 6,5
C. 5,0
Đáp án: A
Giải thích: `2×3+(−1)×1+0,5=6−1+0,5=5,5`. Chọn B là bỏ dấu trừ của `−1`; chọn C là quên bias.
:::

**Tự thử thêm:** giữ nguyên `w,b`, đổi `x=[1,3]`. Tính `z`, giá trị ReLU và sigmoid. Sau đó giải thích vì sao mẫu này không đóng góp gradient qua ReLU.

:::goi-y
`z=2×1+(−1)×3+0,5`. ReLU của số âm bằng 0; đạo hàm ReLU tại vùng âm cũng bằng 0.
:::

:::loi-giai
`z=2−3+0,5=−0,5`; ReLU `a=0`; sigmoid `σ(−0,5)≈0,378`. Vì ReLU đang tắt, gradient qua nó bằng 0, nên mẫu này không cập nhật trọng số phía trước theo đường đó.
:::