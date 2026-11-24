# Chương 2.6 — Gradient descent ở mức trực quan và toán học cơ bản (Giai đoạn 2)

> **Câu hỏi trọng tâm:** *Khi ta nói "mô hình học", cơ chế chính xác của việc điều chỉnh tham số để giảm lỗi là gì?*

---

## 1. Vị trí trong lộ trình

Đã dùng gradient descent theo cách "bấm nút" ở G1.4 (vòng lặp PyTorch). Giờ đào sâu: *hiểu* chính xác nó làm gì, vì sao, và gặp lỗi gì. Đây là nền cho việc chẩn đoán "model không học" ở G3.5 và tối ưu theo mô hình ở mọi chương sau (G6–G8 đều xoay quanh cập nhật tham số).

Nó **nối** từ G1.4 (vòng lặp) và Chương 4 & 8 sách toán (đạo hàm, gradient, tối ưu) và **chuẩn bị** cho G3 (backprop, optimizer, learning rate).

---

## 2. Kiến thức cần dùng

- Gradient, đạo hàm, dây chuyền (Chương 4 sách toán).
- Hàm mất mát (G2.2), model tuyến tính (G2.4).
- Vòng lặp PyTorch (G1.4).

**Ôn nhanh:** *gradient* = vector đạo hàm riêng, chỉ *hướng dốc lên* của hàm tại một điểm. Để giảm, ta đi ngược. `learning rate` = kích thước bước (Chương 8 sách toán).

---

## 3. Câu chuyện mở đầu

Lan đang ở trong "hẻm núi sai số": trục ngang là trọng số `w`, trục đứng là loss. Cô muốn tới đáy (loss nhỏ nhất). Nhưng cô **không nhìn thấy cả địa hình** — chỉ cảm được mũi giày nghiêng theo hướng nào (độ dốc/gradient tại chỗ đứng). Cô lặp: *cảm độ dốc, bước xuống một bước, lại cảm, lại bước* — cứ thế tới đáy.

Gradient descent chính là: dùng gradient (độ dốc) để quyết **hướng** bước, dùng learning rate để quyết **độ lớn** bước, lặp lại. Đến đây, chữ "learning" trong ML có nghĩa chính xác: *điều chỉnh tham số từng bước theo gradient để giảm loss.*

---

## 4. Câu hỏi trọng tâm

**Cơ chế gradient descent (hướng, bước, hội tụ) hoạt động chính xác như thế nào, và khi nào nó thất bại?**

---

## 5. Trực giác

**Gradient chỉ cho biết "hướng dốc nhất" ngay tại chỗ đứng** — không chỉ toàn bộ đường về đáy. Đó là thông tin *cục bộ*. Mỗi bước:
1. Đứng tại `w`, tính gradient `∇loss(w)`.
2. Bước ngược gradient một lượng bằng `learning_rate`.
3. Lặp.

**Hai khó khăn:**
- **Hốc "cực tiểu địa phương":** địa hình không phải một cái bát trơn; có nhiều hố. Gradient dẫn về hố gần nhất, có thể không phải hố sâu nhất (toàn cục). Hàm loss ML thường không "lồi đơn giản".
- **Learning rate (bước đi):** quá nhỏ → lâu đến đáy (chậm); quá lớn → nhảy qua đáy, dao động hoặc văng ra xa (không hội tụ).

**Phép so sánh "người leo bị bịt mắt dò dốc":** chính xác cho trực giác. **Giới hạn:** bịt mắt chỉ có thể dựa độ dốc cục bộ; trong không gian hàng triệu chiều (mạng lớn), trực giác "basin" không còn đơn giản, và hội tụ khó đảm bảo tuyệt đối. Nhưng cơ chế "dùng gradient + bước tới" vẫn đúng.

---

## 6. Từ trực giác đến mô hình

- **Tham số:** `θ` (một hoặc nhiều trọng số).
- **Hàm mục tiêu:** loss `L(θ)` (MSE/CE, G2.2).
- **Gradient:** `∇L(θ)` = đạo hàm riêng theo từng tham số.
- **Update rule (công thức cốt lõi):**

```
θ ← θ − α · ∇L(θ)
```

- `α` (learning rate, gọi là lr/alpha): độ lớn bước.
- `∇L(θ)` hướng "lên dốc"; `−α·∇L` hướng "xuống dốc".
- **Hội tụ (convergence):** khi gradient nhỏ dần (đứng gần đáy), cập nhật nhỏ dần → θ ổn định.

**Thuật toán tính cho 1 tham số đơn giản:**
```
1. Khởi tạo θ.
2. Lặp (epochs):
   a. Tính L(θ).
   b. Tính ∇L(θ) (autograd / tay).
   c. θ ← θ − α·∇L(θ).
3. Dừng khi L thay đổi ít hoặc đủ epochs.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Dùng một tham số, loss `L(w) = (w−3)²` (ta biết đáy tại w=3).**

- Đạo hàm: `L'(w) = 2(w−3)`.

**Bước 2 — Lặp với `w=0, α=0.1`:**

- Bước 1: `w=0 → L'=−6 → w ← 0 − 0.1×(−6) = 0.6`
- Bước 2: `w=0.6 → L'=−4.8 → w ← 0.6 − 0.1×(−4.8) = 1.08`
- Bước 3: `w=1.08 → L'=−3.84 → w ← 1.08 + 0.384 = 1.464`
- Bước 4: w tiến dần về 3, bước mỗi lần nhỏ dần.

**Bước 3 — Quan sát hội tụ:** bước nhỏ dần (gradient nhỏ gần đáy), w tiến về 3. Đây là gradient descent hoạt động.

**Bước 4 — Thử α khác:**
- `α=0.5`: bước 1 `0−0.5×(−6)=3` — văng thẳng về đáy (may), nhưng với hàm khác có thể nhảy bên kia.
- `α=2.5`: `0−2.5×(−6)=15` — văng xa đáy, dao động. → lr quá lớn hỏng.

**Bước 5 — Nòng cốt:** `θ ← θ − α·∇L` là *toàn bộ* "learning" trong ML ở dạng cơ bản. PyTorch `optimizer.step()` làm đúng dòng này (G1.4).

**Lỗi thường gặp:** lr quá lớn (dao động/phân kỳ); lr quá nhỏ (chậm); khởi tạo kém → có thể rơi hố địa phương; quên `zero_grad` (G1.4) cộng gradient sai.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** hàm 2 tham số `L(a,b) = (a−2)² + (b+1)²` — đáy tại (a=2, b=−1).

**Bước 1 — Gradient:** `∇L = (∂L/∂a, ∂L/∂b) = (2(a−2), 2(b+1))`.

**Bước 2 — Khởi tạo (0,0), α=0.1:**
- Tại (0,0): `∇L = (−4, 2)`.
- Update: `a ← 0 − 0.1×(−4) = 0.4`; `b ← 0 − 0.1×(2) = −0.2`.

**Bước 3 — Giải thích:** a tăng (vì gradient theo a âm — tăng a giảm loss), b giảm (gradient dương). Lặp, cặp (a,b) tiến về (2, −1). Mỗi bước cập nhật *cả hai* cùng lúc — ta không thể tối ưu từng cái riêng vì chúng phụ thuộc nhau.

**Bước 4 — Nối với PyTorch:** `optimizer.step()` thực hiện đúng update cả 2 tham số `model.parameters()`. Hiểu ví dụ tay này giúp bạn tin và chẩn đoán khi code thật.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "thử mù" lưới nhiều giá trị θ rồi chọn loss nhỏ nhất (grid search).

| Phương diện | Grid search | Gradient descent |
|---|---|---|
| Số chiều | bùng nổ (mỗi chiều nhân thêm) | đi theo gradient, ít bước |
| Tránh hố địa phương | có (quét rộng) | không (đi gần nhất) |
| Tốc độ | rất chậm, nhiều chiều | nhanh |
| Đánh đổi | cần biết phạm vi | phụ thuộc lr/khởi tạo |

**Cải thiện:** khả thi với nhiều chiều, nhanh. **Đánh đổi:** không đảm bảo toàn cục (hố địa phương), phụ thuộc lr/khởi tạo. Đây là lý do ML dùng gradient descent thay vì vét cạn.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát mối quan hệ lr ↔ hội tụ.

Với `L(w)=(w−3)²`, chạy gradient descent tay (hoặc code) với lr = {0.01, 0.1, 0.5, 2.0}. Vẽ/lập bảng w theo epoch hoặc loss:
- lr nhỏ (0.01): chậm, chưa tới 3.
- lr 0.1: tới gần 3 đẹp.
- lr 0.5: tới nhanh nhưng có thể dao động quanh 3.
- lr 2.0: phân kỳ/dao động mạnh (không hội tụ).

**Ghi nhận:** lr là siêu tham số then chốt; quan sát "bước quá lớn" phá hỏng hội tụ.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch (dùng autograd để không phải tự viết đạo hàm, nhưng hãy tính tay đối chiếu vài bước).

**Cấu trúc:** `scripts/gd_manual.py`:

```python
import torch

# tham số cần học (requires_grad để autograd)
w = torch.tensor([0.0], requires_grad=True)
alpha = 0.1

def loss_of(w_):
    return (w_ - 3.0) ** 2

for epoch in range(40):
    loss = loss_of(w)
    loss.backward()                 # tính gradient tự động
    with torch.no_grad():
        w -= alpha * w.grad         # ngược gradient (chú ý w.grad = ∇L)
    w.grad.zero_()                  # xóa gradient cho vòng sau
    if epoch % 8 == 0:
        print(epoch, round(w.item(), 3), round(loss.item(), 3))
```

**Kết quả dự kiến:** w tăng dần về 3, loss giảm dần về 0. (Chú ý đoạn final: `w.grad` là `2(w−3)`, nên khi w tiến 3, grad tiến 0.)

**Lỗi thường gặp:** quên `.zero_()` → gradient tích lũy; dùng `w` với `requires_grad` trong `no_grad` cần đúng context; so sánh `.item()`.

**Chú thích trung thực:** đây là gradient descent tay để minh họa; trong code thật dùng `optimizer` (G1.4) nhưng cơ chế giống hệt.

---

## 12. Đánh giá

**Chỉ số:** giải và/chạy đúng update `θ←θ−α∇L`; thấy hội tụ (loss giảm, w về đáy); phân biệt được ảnh hưởng của lr; biết nguy cơ cực tiểu địa phương.

**Vì sao chọn:** đây là "trái tim" của learning; hiểu chính xác mới chẩn đoán được model không học (G3.5).

**Chỉ số không thể hiện:** không tối ưu bài toán lớn/toàn cục; không xử lý các trick (momentum, Adam — G3.5). Đây là cơ chế gốc.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Gradient chỉ một hướng tới đáy duy nhất." — Không; nó chỉ mô tả độ dốc *tại điểm*, không biết toàn bộ địa hình. Hai khởi tạo khác có thể về hai hố khác.
- **Hiểu lầm 2:** "Loss giảm là 'learn tốt' tuyệt đối." — Loss giảm trên train có thể overfit (G2.5); và loss có thể bị hố địa phương (gần đáy nhưng không sâu nhất). Quan sát val.
- **Hiểu lầm 3:** "Step bằng gradient là một 'ma thuật'." — Không; nó chỉ là phép thay thế tiếp tuyến (linear approx) để xấp xỉ hàm; hiệu quả vì gradient cho hướng gần đúng giảm nhanh. Đó là toán thông thường.
- **Giới hạn:** thuật toán khác (Adam, SGD-with-momentum) cải thiện bước đi nhưng vẫn nằm trong khung "đi ngược hướng giảm". Trong deep learning, địa hình không trơn và hố địa phương nhiều — có methods/schedules (see G3.5). Đừng nghĩ gradient descent "luôn thành".

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Viết lại `θ ← θ − α·∇L` bằng lời: mỗi ký hiệu nghĩa gì?
2. Vì sao đi *ngược* gradient khi muốn giảm loss?
3. Quá nhỏ và quá lớn lr có hại gì?

### Luyện tập (sửa đổi / mở rộng)
4. `L(w)=(w−5)²`, `w=0`, α=0.1. Thực hiện 2 bước, ghi w.
5. Hàm 2 biến `L=(a−1)²+2(b−2)²`; tính gradient tại (0,0), cập nhật 1 bước α=0.1.
6. Thay `alpha=0.9` trong gd_manual — w có dao động quanh 3 không? Giải thích.

### Thử thách (thiết kế / liên hệ)
7. Một model "không giảm loss" dù chạy lâu. Nêu 3 khả năng nguyên nhân liên quan gradient descent và cách kiểm.
8. Giải thích: trong FL (G6), FedAvg về cơ bản "trung bình các bước gradient descent của từng client" theo một nghĩa nào đó — nối với việc mỗi client dùng lr/steps riêng có thể dẫn client drift.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. "Tham số mới = tham số cũ − (kích thước bước) × (vector độ dốc)". Đi ngược để giảm.
2. Gradient chỉ hướng tăng; đi cùng nó làm tăng loss; đi ngược làm giảm.
3. Quá nhỏ: chậm (lâu hội tụ). Quá lớn: nhảy qua đáy, dao động/phân kỳ.
4. w0=0: L'=−10; w←0−0.1×(−10)=1. w=1: L'=−8; w←1−0.1×(−8)=1.8.
5. Grad=(2(a−1),4(b−2)) tại (0,0)= (−2,−8). Update: a←0−0.1×(−2)=0.2; b←0−0.1×(−8)=0.8.
6. Với lr 0.9, w quanh 3 dao động (bước mỗi lần ~0.9×lệch) — có thể "zigzag" quanh đáy, chậm ổn định. lr vừa không quá lớn.
7. (a) Lr sai (quá lớn phân kỳ, quá nhỏ chậm) — thử đổi lr. (b) Khởi tạo hố địa phương — thử khởi tạo lại. (c) Bug cập nhật (quên zero_grad/không update) — kiểm vòng lặp. Kiểm: in loss, lr, gradient.
8. FedAvg: mỗi client chạy gradient descent cục bộ với lr/steps riêng rồi gửi update; trung bình cập nhật xấp xỉ một bước gradient toàn cục nếu dữ liệu i.i.d.. Khi client có ít dữ liệu/lệch, bước cục bộ lệch hướng trung bình → client drift. Đây là lý do G6 quan tâm lr/local epochs.

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Gradient descent** = `θ ← θ − α·∇L(θ)` — lặp bước nhỏ theo ngược hướng dốc.
2. **Gradient** chỉ hướng tăng *tại điểm* (cục bộ); **lr** quyết độ bước.
3. **lr quá lớn / quá nhỏ** đều hỏng: phân kỳ hoặc chậm — cần điều chỉnh.
4. Rủi ro: **cực tiểu địa phương** (không đảm bảo toàn cục).
5. Đây là "trái tim của learning" — nền cho optimizer (G3), và là cơ chế mà FedAvg điều phối trong FL.

**Tự kiểm tra:**
- Viết và giải thích công thức update.
- Ảnh hưởng của lr quá nhỏ/lớn?
- Vì sao không đảm bảo tìm được hố sâu nhất?
- Khi model không giảm loss, kiểm gì đầu tiên?

---

## 16. Đọc sâu bằng trực giác — bước chân xuống dốc có đà

Đứng trên sườn đồi có sương mù, ta chỉ cảm nhận độ dốc tại chỗ và bước theo hướng xuống. Bước quá ngắn thì mãi không tới đáy; bước quá dài thì vượt qua thung lũng và leo lên sườn bên kia. Learning rate chính là độ dài bước chân.

| Learning rate | Hiện tượng | Cách nhận biết |
|---|---|---|
| Quá nhỏ | Loss giảm rất chậm | Nhiều epoch vẫn gần giá trị đầu |
| Vừa | Loss giảm đều rồi chững | Train/val cùng cải thiện |
| Quá lớn | Loss dao động hoặc tăng | Nhảy qua lại, có thể thành NaN |

**Đọc thành lời:** quy tắc cập nhật là `w ← w − α·∂L/∂w`. Đạo hàm chỉ hướng dốc tăng nhanh nhất; dấu trừ đi ngược lại để giảm loss; `α` quyết định bước xa bao nhiêu. Với `L=(w−2)²`, đạo hàm là `2(w−2)`, nên mỗi bước kéo `w` về phía 2 với độ lớn tỉ lệ khoảng cách còn lại.

**Tính tay:** bắt đầu `w₀=0`, `α=0,25`. Đạo hàm tại 0 là `2(0−2)=−4`; bước một: `w₁=0−0,25×(−4)=1`. Tại `w=1`, đạo hàm `−2`; bước hai: `w₂=1+0,5=1,5`. Quỹ đạo `0 → 1 → 1,5 → 1,75` tiến dần về 2, mỗi lần đi một nửa quãng còn lại.

**Phản ví dụ:** thấy loss giảm chậm rồi kết luận "mô hình đã hội tụ". Nếu `α` quá nhỏ, loss vẫn giảm nhưng chưa tới vùng tốt; cần so sánh sau nhiều bước hoặc thử `α` lớn hơn trên validation. Ngược lại, loss dao động không luôn do "dữ liệu khó": `α` vượt ngưỡng ổn định có thể làm bước nhảy qua đáy.

**Giới hạn:** gradient descent chỉ đảm bảo tiến theo độ dốc cục bộ, không đảm bảo tìm cực tiểu toàn cục. Với hàm lồi như trên, hội tụ rõ; với mạng sâu, có yên ngựa, vùng phẳng và độ cong khác nhau theo từng hướng. Một `α` chung cũng không phù hợp mọi tham số, nên thực tế dùng optimizer thích nghi và lịch giảm.

:::interactive momentum
:::

:::quiz
Với `L=(w−2)²`, `w₀=0`, `α=0,25`, sau một bước cập nhật `w₁` bằng bao nhiêu?
A. 1
B. 0,5
C. 2
Đáp án: A
Giải thích: gradient tại 0 là `−4`; `w₁=0−0,25×(−4)=1`. Chọn B là quên dấu trừ hoặc chia sai; chọn C là nhảy thẳng tới nghiệm.
:::

**Tự thử thêm:** tiếp tục từ `w₁=1`, tính `w₂` với `α=0,25`. Sau đó thử `α=1` từ `w₀=0` và mô tả quỹ đạo hai bước đầu; giải thích vì sao nó không hội tụ.

:::goi-y
Tại `w=1`, gradient là `2(1−2)=−2`. Với `α=1`, áp dụng đúng công thức và để ý dấu.
:::

:::loi-giai
`w₂=1−0,25×(−2)=1,5`. Với `α=1`: `w₁=0−1×(−4)=4`; tại 4 gradient là 4, nên `w₂=4−4=0`. Hai bước quay lại điểm đầu, dao động `0↔4` và không tiến tới 2.
:::