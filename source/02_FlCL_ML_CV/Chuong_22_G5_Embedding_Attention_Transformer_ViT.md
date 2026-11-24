# Chương 5.1–5.4 — Embedding, attention/self-attention, Transformer và Vision Transformer (Giai đoạn 5)

> **Câu hỏi trọng tâm:** *Làm sao mô hình "nhìn" toàn bộ bối cảnh cùng lúc (thay vì từng cục bộ như CNN) — qua embedding và cơ chế attention, và Vision Transformer (ViT) áp điều đó cho ảnh thế nào?*

---

## 1. Vị trí trong lộ trình

Đến đây ta đã biết CNN (G4) xử lý ảnh cục bộ. Giai đoạn 5 chuyển sang **Transformer** — kiến trúc hiện đại dùng **attention** để nhìn toàn cục, và **Vision Transformer (ViT)** áp cho ảnh. Đây là nền của "mô hình nền tảng" (G5.5–9) và là công cụ mà FL/CL hiện đại tận dụng (G8).

Gộp 5.1–5.4 (embedding, attention, transformer, ViT) là một mạch: từ "biến dữ liệu thành vector (embedding)" → "để các vector tự 'trao đổi' qua attention" → "đóng thành khối Transformer" → "ViT áp cho ảnh".

---

## 2. Kiến thức cần dùng

- Vector/dot product (sách C3), softmax (G2.4), deep net block (G3), linear/feedforward (G2.4).

**Ôn nhanh:** dot product đo "độ khớp" giữa 2 vector (sách C3). Softmax biến K số thành K xác suất. `Multi-head`/LayerNorm là các chi tiết kỹ thuật (G3.6 đã gặp LayerNorm).

---

## 3. Câu chuyện mở đầu

Lan đọc một giấy tờ về "Vision Transformer biến ảnh thành chuỗi và để các phần tự chú ý nhau". Cô tò mò: CNN nhìn cục bộ từng vùng rồi hợp dần; Transformer lại cho *mọi phần "nhìn" mọi phần cùng lúc*. Từ đó, mô hình biết ngữ cảnh toàn ảnh ngay tầng đầu — ví dụ khi phân biệt "một con chó và một con mèo kề nhau", attention biết pixel chó "nhìn" pixel mèo để phân tách.

Cô cần hiểu 4 bậc: (1) **embedding** biến pixel/word thành vector; (2) **attention** cho các vector tự "trao đổi" (gán mức độ chú ý); (3) **Transformer** ghép attention + feedforward vào block lặp; (4) **ViT** chia ảnh thành patch, nhúng từng patch, rồi chạy như Transformer.

---

## 4. Câu hỏi trọng tâm

**Embedding là gì, attention/self-attention hoạt động thế nào, Transformer đóng từ đó ra sao — và ViT áp cho ảnh như thế nào?**

---

## 5. Trực giác

**Embedding = "số hóa một phần tử thành vector có ý nghĩa".** Một từ / một patch ảnh / một pixel được biến thành một vector số. Ý nghĩa nằm ở *vị trí trong không gian vector*: các thứ "giống" → vector gần nhau (đo bằng dot product / cosine, sách C3). Đây là cách đưa văn bản/ảnh vào để model làm toán.

**Attention = "mỗi phần tử quyết định nên nhìn vào phần tử nào bao nhiêu".** Với câu "con *mèo* ngồi trên *bàn*", từ "mèo" muốn chú ý vào "bàn" để biết ngữ cảnh. Cơ chế:
- Mỗi phần tử có đại diện **query Q**, **key K**, **value V** (biến đổi từ chính vector của nó).
- Điểm attention = `Q·K` (dot product — mức "khớp"), chuẩn hóa bằng softmax → trọng số attention.
- Kết quả = tổng có trọng số các `V` (các phần tử "mình chú ý nhiều" góp nhiều).

**Tự-chú ý (self-attention)** = khi **Q, K, V đều từ cùng một chuỗi đầu vào** — mỗi phần tử xem xét chính toàn chuỗi (chú ý bối cảnh chính nó). (Khác *cross-attention*: chuỗi này nhìn chuỗi khác, gặp khi encoder-decoder.)

**Transformer block** = self-attention (nhiều "head" để chú ý nhiều kiểu quan hệ) → feedforward → với LayerNorm/residual (G3.6/4.4) → lặp nhiều block. Đây là "thân xe".

**ViT (Vision Transformer):** chia ảnh H×W thành **patch** (VD 16×16), nhúng từng patch thành vector (patch embedding), thêm **position embedding** (biết vị trí từng patch), nối thêm token `[CLS]` để gộp toàn ảnh, rồi chạy qua Transformer. Đầu ra [CLS] dùng làm "đại diện ảnh" cho phân loại. Sự khác CNN: không dùng conv cục bộ, mà để attention nhìn toàn cục từ đầu.

**Phép so sánh "attention = cuộc họp mà mỗi người lắng nghe người liên quan hơn":** trực quan. **Giới hạn:** attention "toàn cục" có chi phí O(n²) theo số phần tử — với ảnh lớn (nhiều patch) tốn. Đây là lý do xuất hiện các biến thể/giảm chi phí — nhưng khái niệm gốc vậy.

---

## 6. Từ trực giác đến mô hình

- **Đầu vào:** chuỗi token (văn bản) hoặc patch ảnh → `embedding` → chuỗi vector.
- **Self-attention:** với mỗi phần tử, `attn = softmax(Q·Kᵀ/√d)`, `out = attn·V`.
- **Block:** `x → LayerNorm → MultiHeadAttention` (residual) → `LayerNorm → FFN` (residual) → lặp.
- **ViT:** patch → flatten → Linear embed → `+ position_embed` → transformer → `[CLS]` → classifier.

**Thuật toán (ViT cho ảnh nhỏ, khái niệm):**
```
1. Chia ảnh 32×32 thành patch 8×8 → 16 patch.
2. Nhúng từng patch (Linear) → 16 vector + [CLS] + pos.
3. Chạy qua N Transformer block (self-attention + FFN).
4. Lấy [CLS] → Linear → logits lớp.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Embedding patch (ViT cốt lõi).**

```python
import torch, torch.nn as nn, torch.nn.functional as F

B, C, H, W = 4, 3, 32, 32
P = 8                                # patch size
x = torch.randn(B, C, H, W)
# reshape ảnh → chuỗi patch (B, n_patch, C*P*P)
x = x.unfold(2, P, P).unfold(3, P, P)      # tạo patch
x = x.permute(0, 2, 3, 1, 4, 5).reshape(B, (H//P)*(W//P), -1)
n_patch = x.size(1)
proj = nn.Linear(C*P*P, 64)                # nhúng mỗi patch thành 64-dim
tokens = proj(x)                           # (B, n_patch, 64)
```
*(Đây là phép nhúng patch; Q, K, V được tạo bởi các phép chiếu riêng trong attention.)*

**Bước 2 — Thêm vị trí & [CLS].**

```python
pos = nn.Parameter(torch.randn(1, n_patch+1, 64))
cls = nn.Parameter(torch.randn(1, 1, 64))
tokens = torch.cat([cls.expand(B, -1, -1), tokens], dim=1) + pos
```

**Bước 3 — Chạy qua 1 Transformer block (tối giản).**

```python
# dùng nn.TransformerEncoderLayer (có sẵn) cho khái niệm
enc = nn.TransformerEncoderLayer(d_model=64, nhead=4, batch_first=True, norm_first=True)
out = enc(tokens)                     # (B, n_patch+1, 64)
logits = nn.Linear(64, 10)(out[:, 0]) # dùng [CLS] (= vị trí 0)
```

**Bước 4 — Đọc:** ViT chia patch, nhúng, tự chú ý toàn ảnh, gộp qua [CLS] để phân loại. Khác CNN cơ bản: patch tương tác qua self-attention toàn cục; phép nhúng patch cũng có thể cài bằng convolution với stride bằng kích thước patch.

**Lỗi thường gặp:** reshape patch sai; quên pos embedding (mất thứ tự patch → model không biết vị trí); dùng `batch_first` thiếu; không có đủ dữ liệu/tài nguyên (ViT cần nhiều data hơn CNN — nói G5.5–9).

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** 2 vector (embedding của 2 patch), self-attention 1-head nhỏ.

**Bước 1 — Đặt:** v1=(0,1), v2=(1,0). Giả sử Q=K=V = chính vector (identity đơn giản).

**Bước 2 — Điểm có chia căn số chiều:** với d=2, ma trận `QKᵀ/√2 = [[1/√2, 0], [0, 1/√2]]`. Dot chéo bằng 0, nhưng đây mới là **logit**, chưa phải trọng số attention.

**Bước 3 — Softmax theo từng hàng:** `exp(1/√2)/(exp(1/√2)+1) ≈ 0.669762`; phần còn lại ≈0.330238. Ma trận trọng số là `[[0.669762, 0.330238], [0.330238, 0.669762]]`. Mỗi hàng có tổng bằng 1. Hai vector trực giao vẫn trao đổi thông tin với trọng số dương trong ví dụ không có mask này.

**Bước 4 — Nhân với V:** với `v1=(0,1)`, `v2=(1,0)`, đầu ra thứ nhất là `0.669762·v1 + 0.330238·v2 = (0.330238, 0.669762)`; đầu ra thứ hai là `(0.669762, 0.330238)`.

**Phản ví dụ:** nếu cả hai token đều `(1,1)` thì mọi logit bằng nhau, nên softmax là `(0.5,0.5)` trên mỗi hàng, dù dot đều bằng 2. Trọng số là **tương đối trong một hàng**, không suy ra từ một dot riêng lẻ. Trong mô hình thật, Q, K, V là các phép chiếu học được; attention không tự cung cấp lời giải thích nhân quả về ý nghĩa ảnh.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** CNN (conv cục bộ, G4).

| Phương diện | CNN | Transformer (ViT) |
|---|---|---|
| Nhìn bối cảnh | cục bộ (dần rộng) | toàn cục ngay |
| Chi phí | tốt cho ảnh lớn | O(n²) với n patch — tốn |
| Cần dữ liệu | vừa | nhiều hơn (data-hungry) |
| Đánh đổi | tự nhiên cho ảnh | mạnh tổng quát nhưng tốn |

**Cải thiện:** mô hình hóa quan hệ toàn cục, transfer data lớn. **Đánh đổi:** tốn dữ liệu/tài nguyên; trên ảnh nhỏ/ít data, CNN thường tốt hơn — chính vì nhiều ViT dùng **pretrained trên data lớn** (G5.5–9) là chìa khóa.

*(So sánh này giúp hiểu khi nào chọn cái nào; không có "khanh tuyệt đối".)*

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** quan sát attention "chú ý phần liên quan" và ViT chạy.

1. Với câu/chuỗi giả, in ma trận attention của 1 layer — xem các token liên quan có trọng số cao không.
2. Huấn luyện ViT mini trên subset (hoặc chạy pretrained ViT qua torchvision) — so với CNN small cùng data: trên ít data CNN có thể hơn; sau khi pretrained ViT mạnh (chuyển G5.5).
3. Ghi nhận vị trí embedding / attention trực quan.

---

## 11. Thực hành lập trình

**Môi trường:** venv + torch + torchvision.

**Cấu trúc:** `scripts/vit_mini.py` (mô phỏng nhỏ; để thấy hình dạng):

```python
import torch, torch.nn as nn
from torch.nn import TransformerEncoderLayer

B, C, H, W = 2, 3, 32, 32
P = 8
x = torch.randn(B, C, H, W)
# patchify (giản — giả sử đã reshape)
tokens = x.reshape(B, C, (H//P), P, (W//P), P).permute(0,2,4,3,5,1).reshape(B, (H//P)*(W//P), -1)
d = 64
proj = nn.Linear(tokens.size(-1), d)
tokens = proj(tokens)                       # (B, 16, 64)
B_, n = tokens.shape[0], tokens.shape[1]
cls = nn.Parameter(torch.randn(1, 1, d))
pos = nn.Parameter(torch.randn(1, n+1, d))
tokens = torch.cat([cls.expand(B_, -1, -1), tokens], dim=1) + pos
enc = TransformerEncoderLayer(d_model=d, nhead=4, batch_first=True, norm_first=True)
out = enc(tokens)
logits = nn.Linear(d, 10)(out[:, 0])
print(tokens.shape, logits.shape)           # (2,17,64) và (2,10)
```

**Kết quả dự kiến:** in shapes — xác nhận mạch patch→embed→[CLS]+pos→transformer→logits. (Đây là khung tự build nhỏ để hiểu; thực tế dùng pretrained `torchvision.models.vit_b_16`.)

**Lỗi thường gặp:** patch shape cuối (B, n, C*P*P) — kiểm; thiếu position → mất thứ tự; `batch_first`.

**Chú thích trung thực:** đây là self-contained mini-ViT để *hiểu hình dạng* (chưa huấn luyện tốt — ViT cần data lớn/pretrain). Để dùng thật, dùng pretrained (G5.5). Mã này không được tối ưu huấn luyện.

---

## 12. Đánh giá

**Chỉ số:** hiểu mạch `embedding → attention → transformer → [CLS]`; đọc được self-attention là "mỗi vector nhìn vector liên quan"; dựng minh ViT chạy (shapes đúng); biết sự khác CNN.

**Vì sao chọn:** đây là "bộ não" của mô hình nền tảng (G5.5–9) và FL/CL hiện đại (G8) dùng ViT/pretrain. Nắm khái niệm là bước cần.

**Chỉ số không thể hiện:** hiệu năng thực (cần pretrain/data lớn); không phủ mọi chi tiết (multi-head, kv cache). Chương này nền khái niệm đủ đọc tài liệu.

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Attention là 'cần plugin thêm' cho CNN." — Không; nó là cơ chế trung tâm của Transformer, dùng thay cho phép gộp toàn cục. (Attention cũng có thể thêm vào CNN, nhưng ở đây "Transformer" = không conv.)
- **Hiểu lầm 2:** "ViT chỉ là CNN có thêm thứ gì." — Khác bản chất: không conv; chỉ patch+attention toàn cục. Vị vậy cần pos embedding (cũng khác CNN có cấu trúc ngầm).
- **Hiểu lầm 3:** "Transformer tự khắc giỏi trên mọi thứ." — Data-hungry; không pretrain + dữ liệu ít → kém CNN. Giỏi nhờ *pretraining trên data lớn* (G5.5). Đừng nghĩ tự thần.
- **Giới hạn:** O(n²) attention với n lớn tốn; nhiều biến thể (swin, efficient attention) ra đời để giảm — không đưa ở đây. Nhưng khái niệm gốc (Q K V, self-attn, patch embedding) là nền đọc chúng.

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Embedding là gì và tại sao cần "số hóa" văn bản/ảnh thành vector?
2. Self-attention: Q, K, V vai trò gì; kết quả ra sao?
3. Khác giữa self-attention và cross-attention? Khi nào dùng từng loại?

### Luyện tập (sửa đổi / mở rộng)
4. Trong vit_mini: đổi P từ 8 → 4; patch count thay đổi ra sao (chỉ hình dạng)?
5. Bỏ pos embedding — nhận xét model còn biết vị trí patch không; trong thực tế ảnh hưởng gì?

### Thử thách (thiết kế / liên hệ)
6. Trong FL (G6), nếu dùng ViT pretrained + mỗi client fine-tune: đặc trưng toàn cục (attention) giữ được hơn hay kém so với CNN khi non-IID? (gợi ý: attention global, data-hungry — liên hệ G8.)
7. Trong CL (G7), tại sao mô hình nền tảng (pretrained ViT) thường "ít quên" hơn model train-from-scratch (khởi tạo tốt + biểu diễn chung)? Nối với G5.5–9 và rehearsal.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Embedding = map một đối tượng (từ/patch) sang vector số, giữ ý nghĩa tương tự trong metric (dot/cosine) — để model làm toán trên đó.
2. Q hỏi "tôi quan tâm gì", K nhận "tôi là gì", V cung cấp "giá trị". Sự khớp Q·K định trọng số; tổng có trọng số V = đầu ra (bối cảnh liên quan).
3. Self: Q/K/V cùng một chuỗi (mỗi phần tử nhìn chính chuỗi). Cross: Q từ chuỗi này, K/V từ chuỗi khác (VD decoder nhìn encoder). Dùng tương ứng.
4. P=4 → (32/4)² = 64 patch (từ 16) → tokens shape (B, 65, d) sau [CLS].
5. Bỏ pos → model không biết thứ tự patch; ảnh như "túi patch không thứ tự", mất cấu trúc không gian — giảm accuracy rõ. Pos embedding cần thiết.
6. ViT dùng attention toàn cục + pretrained → biểu diễn chung ổn hơn; khi fine-tune client non-IID, attention toàn cục có thể "trôi" theo phân phối client nhưng nếu giữ phần lớn backbone pretrained (shallow fine-tune), vẫn ổn hơn CNN deep. Xu hướng thực hành: giữ pretrained + đông lạnh nhiều. G8.
7. Pretrained khởi tạo tốt (đã học biểu diễn chung), nên khi fine-tune task mới ít "đá" mạnh kiến thức cũ hơn train-from-scratch; kèm rehearsal thêm giữ. Đây là lý do mô hình nền tảng làm CL/FL dễ hơn. (G5.5–9, G7.)

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Embedding** số hóa phần tử thành vector có nghĩa (dot-product đo khớp).
2. **Self-attention**: mỗi phần tử nhìn toàn chuỗi qua Q/K/V → tổng có trọng số V nổi bật phần liên quan.
3. **Transformer block** = (Multi-head) self-attention + FFN + LayerNorm/residual, lặp.
4. **ViT** = patch → embed → + pos → transformer; muộn [CLS] phân loại; nhìn toàn cục từ đầu (khác CNN).
5. Transformer/ViT mạnh nhờ **pretraining trên data lớn** — chuyển sang G5.5–9; và nền cho FL/CL hiện đại (G6/G8).

**Tự kiểm tra:**
- Embedding làm gì? 
- Self-attention dùng Q/K/V như thế nào?
- ViT xử lý ảnh (patch, pos, [CLS]) ra sao?
- Khác CNN thế nào, và vì sao cần pretrain?

---

## 16. Đọc sâu bằng trực giác — một lượt attention thực sự tính gì?

Hãy nghĩ đến hai nhân viên cùng góp ý cho một đơn hàng. “Mức hợp với câu hỏi” là điểm thô; “tỉ lệ được lắng nghe” mới là trọng số cuối. Một điểm riêng lẻ chưa cho biết tỉ lệ ấy.

| Trong cuộc trao đổi | Trong attention | Cần phân biệt |
|---|---|---|
| Câu hỏi của người đang nghe | Query Q | Không phải nhãn cần dự đoán |
| Dấu hiệu để chọn người góp ý | Key K | Điểm QKᵀ chưa là xác suất |
| Thông tin được góp vào câu trả lời | Value V | Được trộn bằng trọng số sau softmax |

**Đọc công thức:** `P = softmax(QKᵀ/√d)` rồi `O = PV`: “so từng query với các key, chia căn số chiều, đổi mỗi hàng thành các phần có tổng bằng một, rồi lấy trung bình có trọng số các value”. Với n token và một head, Q/K có shape n×d; P có shape n×n; V có shape n×dᵥ; O có shape n×dᵥ.

**Tính tay:** lấy hai token `(1,0)` và `(0,1)`, Q=K=V, d=2, không mask. Hàng điểm của token đầu là `(0.7071,0)`. Sau softmax, `P₁≈(0.6698,0.3302)`. Đầu ra là `(0.6698,0.3302)`, không còn chỉ token đầu. Dot chéo bằng 0 nhưng trọng số chéo vẫn khoảng 33%.

**Thử tương tác:** giữ hai raw dot khác nhau rồi đổi dₖ. Raw dot bằng 0 vẫn có thể nhận trọng số khác 0 sau softmax; trọng số phụ thuộc chênh lệch logit, không phải độ lớn tuyệt đối.

:::interactive attention
:::

**Phản ví dụ:** nếu mọi điểm trong một hàng đều bằng 100 thì trọng số vẫn chia đều; điểm tuyệt đối lớn không đủ để khẳng định chú ý tập trung. Mask có thể loại hẳn một vị trí; ví dụ này không có mask. Một heatmap attention cũng chưa chứng minh phần ảnh nào gây ra quyết định theo nghĩa nhân quả.

:::quiz
Hai logit của một query đều bằng 2, không có mask. Softmax của hàng đó là gì?
A. (2, 2)
B. (0.5, 0.5)
C. (1, 0)
Đáp án: B
Giải thích: Hai số exp(2) bằng nhau; mỗi số chia cho tổng hai số nên bằng 1/2. Trọng số phụ thuộc chênh lệch tương đối.
:::

:::goi-y
Với hai logit bằng nhau, viết mẫu số thành `exp(2)+exp(2)` trước khi bấm máy.
:::

:::loi-giai
Mỗi trọng số là `exp(2)/(2exp(2))=0.5`. Nếu V là hai vector khác nhau, đầu ra là trung điểm của chúng. Tổng trọng số bằng 1 không có nghĩa mô hình đã chọn một token duy nhất.
:::
