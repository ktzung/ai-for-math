# Tên bộ tài liệu

**Học Liên Kết & Học Liên Tục cho Thị Giác Máy Tính** — *Một lộ trình từ nền tảng đến nghiên cứu*

*(Federated Learning & Continual Learning for Computer Vision: A Learning Roadmap)*

## Mô tả ngắn

Bộ tài liệu đưa người học đi từ số 0 (chưa biết Python, học máy hay học sâu) đến khả năng thiết kế, triển khai, đánh giá và đọc nghiên cứu về hai chủ đề liên quan chặt chẽ: **học liên kết** (nhiều bên cùng huấn luyện mà không gom dữ liệu về một nơi) và **học liên tục** (mô hình học thêm dữ liệu/nhiệm vụ mới mà không quên kiến thức cũ), với ứng dụng trọng tâm là thị giác máy tính (Computer Vision). Mỗi giai đoạn bắt đầu bằng một vấn đề thực tế, đi từ trực giác đến thuật toán, rồi đến mã chạy được và đánh giá nghiêm túc.

---

## Chân dung người học mục tiêu

- **Bạn là ai:** Sinh viên, kỹ sư hoặc người tự học muốn nghiên cứu/đi sâu vào Federated Learning và Continual Learning, đặc biệt trong ngữ cảnh thị giác máy tính; sẵn sàng bắt đầu từ nền tảng nếu còn thiếu.
- **Không giả định:** Được cho là bạn **chưa** biết Python, chưa biết học máy, chưa biết học sâu, chưa từng chạy mô hình.
- **Tài nguyên mục tiêu:** Thiết bị CPU/phần cứng phổ thông; mô hình thị giác chạy được trên dữ liệu nhỏ, công khai hoặc tổng hợp.

**Giả định về toán và lập trình (sẽ được kiểm tra ở đầu vào):**
- Toán: chỉ cần vector/ma trận, đạo hàm/gradient, xác suất/kỳ vọng, tối ưu hóa cơ bản — nếu thiếu sẽ có nhánh "học bù".
- Lập trình: Python cơ bản (biến, kiểu, điều kiện, vòng lặp, hàm, module); NumPy và trực quan hóa; PyTorch cơ bản; Git + môi trường ảo. Nếu thiếu sẽ có nhánh "học bù".

---

## Bài kiểm tra đầu vào (ngắn) & cách diễn giải

> Mục đích: định vị điểm xuất phát để chọn nhánh học bù hay vào thẳng. Không chấm điểm "trượt/đỗ", mà **định hình chương trình cá nhân**.
>
> Diễn giải chung: mỗi phần làm được = "sẵn sàng"; làm sai/quên = "đánh dấu để học bù tại giai đoạn tương ứng". Lời khuyên cụ thể theo từng phần bên cạnh từng câu dưới đây.

### A. Python & công cụ (7 câu hỏi ngắn)
1. Viết hàm trả về tổng các số chẵn trong một list. → *(làm được: lập trình căn bản ổn)*
2. Viết vòng lặp in ra bình phương các số 1..5. → *(if/loop)*
3. Đọc một file CSV và in 3 dòng đầu. → *(đọc/ghi dữ liệu)*
4. Tạo mảng NumPy 3x3 toàn 1, in shape, đổi cột đầu thành 0. → *(NumPy)*
5. Vẽ đồ thị `y = x^2` cho x từ -3..3 bằng matplotlib. → *(trực quan hóa)*
6. Tạo `torch.Tensor` 2x3, tính tổng theo chiều 0. → *(PyTorch/GPU-tensor cơ bản)*
7. Kể tên 2 lệnh Git để tạo nhánh và ghi lại cấu hình. → *(công cụ thí nghiệm)*

### B. Toán (6 hỏi ngắn)
1. Nhân ma trận 2x3 với vector 3x1, cho kết quả. → *(vector/ma trận)*
2. Giải thích đạo hàm của `f(x)=x^2` dùng để làm gì và kết quả tại x=3. → *(đạo hàm)*
3. Gradient của `g(x,y)=x^2+y^2` tại (1,2) là gì? → *(gradient nhiều biến)*
4. Quy tắc dây chuyền là gì, cho ví dụ 1 dòng. → *(chain rule)*
5. Kỳ vọng của một biến ngẫu nhiên là gì, cho ví dụ. → *(xác suất/kỳ vọng)*
6. "Cực tiểu địa phương" khác "cực tiểu toàn cục" thế nào? → *(tối ưu)*

### C. Học máy / học sâu (7 hỏi ngắn)
1. Phân biệt train/validation/test. → *(đánh giá)*
2. Overfitting là gì, một dấu hiệu trên đường cong loss. → *(regularization)*
3. Hàm mất mát trong phân loại thường là gì, tại sao. → *(loss)*
4. Backpropagation hoạt động theo nguyên tắc nào. → *(học sâu)*
5. Convolution filter trong ảnh làm gì. → *(CV)*
6. Fine-tuning một mô hình tiền huấn luyện khác gì train-from-scratch. → *(transfer learning)*
7. Attention/self-attention dùng để làm gì (trực giác). → *(Transformer)*

**Cách diễn giải:**
- **>14/20 đúng**: sẵn sàng vào Giai đoạn 3–4; lướt nhanh nội dung học bù khi cần.
- **8–14/20**: dành 1–2 tuần bổ sung nhánh học bù Python/toán theo giai đoạn còn yếu, rồi vào G2.
- **<8/20**: đi qua nhánh học bù đầy đủ (G0) trước khi vào G1.
- Dù điểm nào, **tất cả những chủ đề làm sai đều trở thành "chủ đề cần học đúng theo tài liệu"** ở giai đoạn tương ứng.

---

## Mục tiêu đầu ra cụ thể (sau khi hoàn thành)

Người học có thể:

1. Giải thích bằng lời + sơ đồ các khái niệm cốt lõi của Computer Vision, Federated Learning (FL) và Continual Learning (CL).
2. Huấn luyện và đánh giá một mô hình CV cơ bản (phân loại ảnh) trên CPU/cấu hình phổ thông.
3. Giải thích vai trò của Transformer, pretraining, fine-tuning, frozen backbone, linear probing và "mô hình nền tảng" (không phóng đại).
4. Triển khai một thí nghiệm FL cơ bản (FedAvg) với nhiều client mô phỏng, biết đọc hiệu năng và chi phí truyền thông.
5. Thiết kế một thí nghiệm CL (chuỗi nhiệm vụ) và kết hợp FL + CL, chọn baseline và chỉ số phù hợp.
6. Lựa chọn chỉ số đánh giá và **giải thích những gì chỉ số đó không thể hiện** (accuracy, forgetting, cost, privacy).
7. Đọc một bài nghiên cứu, nhận diện giả định, baseline, ablation, giới hạn và chi phí.
8. Viết báo cáo tái lập được với tài nguyên tính toán hạn chế.

---

## Bản đồ học tập theo giai đoạn

```
[G0] Học bù (chỉ khi thiếu) — Python • Toán • Công cụ
   │
[G1] Kiểm tra đầu vào & nền tảng lập trình (NumPy, PyTorch, Git)
   │
[G2] Học máy căn bản (hồi quy, phân loại, gradient descent, đánh giá)
   │
[G3] Học sâu căn bản (neuron, backprop, optimizer)
   │
[G4] Thị giác máy tính (pixel, CNN, augmentation, transfer learning)
   │
[G5] Transformer & mô hình nền tảng (attention, ViT, pretraining)
   │
   ├──────────────────────────┐
   ▼                          ▼
[G6] Học liên kết       [G7] Học liên tục
 (FedAvg, non-IID,    (forgetting, task/class/
  client-server,       domain-incremental)
  privacy)                  │
   └──────────┬─────────────┘
              ▼
[G8] Kết hợp FL + CL + CV (chủ đề đích)
   │
[G9] Đọc nghiên cứu & dự án cuối
```

**Thứ tự:** G0–G5 là nền chung; G6 và G7 độc lập nhau, có thể học theo thứ tự tùy chọn (khuyến nghị G6 trước vì khái niệm non-IID/round dùng chung) ; G8 bắt buộc sau cả hai; G9 ở cuối để hợp nhất kỹ năng.

---

## Mục lục chi tiết (nêu mục tiêu và bài thực hành từng chương)

> Mỗi chương tuân theo mẫu 16 mục: 15 mục nền và mục 16 "Đọc sâu bằng trực giác" (xem phần "Mẫu bắt buộc" bên dưới).

### Giai đoạn 0 — Nhánh học bù (chỉ khi bài kiểm tra đầu vào cho thấy thiếu)
| Chương | Mục tiêu | Bài thực hành điển hình |
|---|---|---|
| G0.1 Python cơ bản | Viết chương trình đọc/xử lý dữ liệu | Viết script tính trung bình cột từ file |
| G0.2 NumPy & trực quan hóa | Thao tác mảng, vẽ biểu đồ | Tạo/vẽ histogram của dữ liệu |
| G0.3 Toán bù (ma trận→gradient→xác suất→tối ưu) | Đủ nền để hiểu công thức ML/DL | Giải bài nhân ma trận, tính gradient tay |

### Giai đoạn 1 — Nền tảng lập trình & công cụ
- **G1.1 Kiểm tra đầu vào & định vị** — chạy/bàn giao bài kiểm tra, chọn nhánh. *(TH: làm bài kiểm tra, ghi kết quả.)*
- **G1.2 Đọc dữ liệu & tổ chức thí nghiệm** — đọc dữ liệu ảnh (folders → tensor), cấu trúc thư mục thí nghiệm. *(TH: nạp CIFAR-10/MNIST, in shape, vẽ lưới ảnh.)*
- **G1.3 NumPy cho ML** — indexing, broadcasting, reduction. *(TH: normalization tay trên array.)*
- **G1.4 PyTorch cơ bản** — Tensor, Dataset, DataLoader, vòng lặp huấn luyện. *(TH: train một model nhỏ với loop tự viết.)*
- **G1.5 Git & môi trường ảo & ghi cấu hình** — reproducibility. *(TH: tạo repo, commit checkpoint, lưu config.)*

### Giai đoạn 2 — Học máy căn bản
- **G2.1 Học có giám sát / không giám sát / giới thiệu RL** — phân loại ba bài toán lớn. *(TH: nhận diện loại bài toán từ mô tả.)*
- **G2.2 Dữ liệu, đặc trưng, nhãn, hàm mất mát** — ngôn ngữ chung. *(TH: mô phỏng "mô hình dự đoán" tay.)*
- **G2.3 Train/validation/test** — chia dữ liệu. *(TH: chia dataset, giải thích vì sao có val.)*
- **G2.4 Hồi quy tuyến tính & logistic** — từ hàm đến dự đoán xác suất. *(TH: fit hồi quy logistic trên dữ liệu 2 class.)*
- **G2.5 Overfitting, underfitting, regularization, bias–variance** — đánh đổi cốt lõi. *(TH: khảo sát overfit với đa thức bậc tăng dần.)*
- **G2.6 Gradient descent (trực quan + toán)** — cơ chế học. *(TH: thực hiện GD tay trên 1 biến rồi 2 biến.)*
- **G2.7 Chỉ số đánh giá** — accuracy, precision/recall, confusion matrix. *(TH: tính chỉ số trên dữ liệu mất cân bằng.)*
- **G2.8 Data leakage & sai lầm thiết kế thí nghiệm** — tính nghiêm túc. *(TH: phát hiện leakage trong scenario cho sẵn.)*

### Giai đoạn 3 — Học sâu căn bản
- **G3.1 Neuron & tầng** — đơn vị tính toán. *(TH: tính đầu ra neuron tay.)*
- **G3.2 Hàm kích hoạt** — ReLU, sigmoid, tanh (khi nào). *(TH: vẽ từng hàm, so sánh.)*
- **G3.3 Lan truyền xuôi & ngược** — trực giác trước, ký hiệu sau. *(TH: backprop ví dụ 1 neuron bằng tay, kiểm tra bằng autograd.)*
- **G3.4 Hàm mất mát & gradient descent** — gắn với G2. *(TH: mô phỏng vòng lặp SGD.)*
- **G3.5 Mini-batch, optimizer, learning rate** — động lực học. *(TH: thay đổi LR, ghi nhận hành vi loss.)*
- **G3.6 Khởi tạo, chuẩn hóa, regularization** — ổn định quá trình. *(TH: so sánh khởi tạo x ấu/tốt.)*
- **G3.7 Đọc đường cong huấn luyện & chẩn đoán** — biết model không học. *(TH: tạo train/loss plot, chẩn đoán.)*

### Giai đoạn 4 — Thị giác máy tính
- **G4.1 Ảnh số, pixel, kênh, độ phân giải, tiền xử lý** — dữ liệu ảnh. *(TH: normalize, resize, augment ảnh.)*
- **G4.2 Phân loại ảnh** — bài toán cơ bản. *(TH: phân loại MNIST/CIFAR bằng PyTorch.)*
- **G4.3 Convolution, padding, stride, pooling** — trích xuất đặc trưng. *(TH: tay tính output size sau conv/pool.)*
- **G4.4 CNN & kiến trúc phổ biến (khái niệm)** — LeNet→ResNet intuition. *(TH: build CNN nhỏ, huấn luyện.)*
- **G4.5 Augmentation & transfer learning** — dữ liệu và kiến thức. *(TH: so sánh train-from-scratch vs finetune pretrained.)*
- **G4.6 Phân loại nhiều lớp & mất cân bằng lớp** — thực chiến. *(TH: đối phó dataset mất cân bằng.)*
- **G4.7 Detection/segmentation ở mức cần thiết** — mở rộng bài toán. *(TH: chạy model pretrained detection/segmentation demo.)*
- **G4.8 Phân tích lỗi của mô hình thị giác** — đừng chỉ nhìn loss. *(TH: phân nhóm sai mẫu, đề xuất hướng khắc phục.)*

### Giai đoạn 5 — Transformer & mô hình nền tảng
- **G5.1 Embedding & biểu diễn dữ liệu** — từ số sang vector nghĩa. *(TH: kiểm tra độ "gần nhau" của embedding.)*
- **G5.2 Attention & self-attention (trực giác)** — mỗi phần tử nhìn vào phần tử khác. *(TH: minh họa query/key/value trên ví dụ nhỏ.)*
- **G5.3 Transformer & luồng thông tin** — các khối chính. *(TH: phác họa sơ đồ khối, ghi chú từng bước.)*
- **G5.4 Vision Transformer (ViT)** — ảnh thành patch embedding. *(TH: dùng ViT pretrained cho phân loại.)*
- **G5.5 Pretraining, fine-tuning, inference** — vòng đời mô hình. *(TH: finetune model pretrained trên dataset nhỏ.)*
- **G5.6 Frozen backbone, linear probing, fine-tuning một phần** — cách tận dụng. *(TH: so sánh frozen vs finetune phần → đúng yêu cầu.)*
- **G5.7 Mô hình nền tảng ≠ mô hình lớn bất kỳ** — tách bạch thuật ngữ. *(TH: thảo luận tiêu chí.)*
- **G5.8 Mô hình thị giác tiền huấn luyện & đa phương thức** — hệ sinh thái. *(TH: so sánh 2 lựa chọn pretrained cho bài toán.)*
- **G5.9 Giới hạn (dữ liệu, tính toán, thiên lệch, bền vững, đánh giá)** — không phóng đại. *(TH: liệt kê rủi ro khi dùng model lớn.)*

### Giai đoạn 6 — Học liên kết
- **G6.1 Bài toán client–server** — vì sao không gom dữ liệu. *(TH: vẽ sơ đồ, liệt kê giả định.)*
- **G6.2 FL ≠ huấn luyện phân tán** — tách bạch khái niệm. *(TH: bảng so sánh.)*
- **G6.3 Communication rounds, local training, tổng hợp** — vòng đời FL. *(TH: minh họa 1 round bằng tay.)*
- **G6.4 Federated Averaging (FedAvg)** — phương pháp khởi đầu. *(TH: cài FedAvg với 2–3 client mô phỏng.)*
- **G6.5 non-IID & mất cân bằng giữa client** — thực tế xấu hơn lý thuyết. *(TH: chia dữ liệu non-IID, đo hiệu năng.)*
- **G6.6 Client sampling, local epochs, số round** — siêu tham số. *(TH: thay đổi local epoch, ghi nhận đánh đổi.)*
- **G6.7 Hiệu năng, thời gian, giao tiếp, tài nguyên** — cost model. *(TH: đo số bytes gửi nhận mỗi round.)*
- **G6.8 Đánh giá & so sánh với huấn luyện tập trung** — baseline đúng. *(TH: FL vs centralized trên cùng dữ liệu.)*
- **G6.9 Privacy: Secure Aggregation & Differential Privacy (nhập môn)** — bảo vệ gì, giá phải trả gì. *(TH: đo impact của noise/DP lên accuracy.)*
- **G6.10 Giới hạn bảo mật, độ tin cậy & giả định bỏ sót** — không phóng đại. *(TH: liệt kê giả định dễ vỡ.)*

### Giai đoạn 7 — Học liên tục
- **G7.1 Dữ liệu đến theo luồng / chuỗi nhiệm vụ** — đặc điểm thực tế. *(TH: dựng chuỗi task từ dataset.)*
- **G7.2 Catastratic forgetting** — hiện tượng trung tâm. *(TH: huấn luyện theo thứ tự lớp, đo quên.)*
- **G7.3 Task / class / domain-incremental** — ba cấu hình khác nhau. *(TH: phân biệt bằng ví dụ + đo.)*
- **G7.4 Rehearsal, regularization, kiến trúc** — ba họ phương pháp. *(TH: cài 1 phương pháp mỗi họ, so sánh.)*
- **G7.5 Học lớp mới & thích nghi miền** — thực chiến. *(TH: thêm lớp mới, mô hình cũ giữ được không?)*
- **G7.6 Đánh giá: học mới ↔ giữ cũ** — 2 mục tiêu. *(TH: tính forgetting & average accuracy.)*
- **G7.7 Giới hạn: bộ nhớ, quyền riêng tư, dữ liệu lưu lại** — rehearsal cần lưu gì. *(TH: khảo sát đánh đổi bộ nhớ replay.)*

### Giai đoạn 8 — Kết hợp FL + CL + CV (chủ đề đích)
- **G8.1 Nhiều client: thiết bị, ảnh, phân phối khác nhau** — bản chất non-IID của ảnh. *(TH: mô phỏng client với ảnh thiên lệch.)*
- **G8.2 Dữ liệu client thay đổi theo thời gian** — CL gặp FL. *(TH: client nhận task mới qua các round.)*
- **G8.3 Client cần học lớp mới mà không quên lớp cũ** — mục tiêu kép. *(TH: đo forgetting trong môi trường FL.)*
- **G8.4 Fine-tuning / cập nhật mô hình thị giác tiền huấn luyện trong FL** — tận dụng pretrained. *(TH: finetune pretrained backbone theo FedAvg.)*
- **G8.5 Các hướng kết hợp FL + CL** — map phương pháp. *(TH: lưới so sánh hướng tiếp cận.)*
- **G8.6 Client drift, non-IID, forgetting, cập nhật không đồng bộ** — hiệu ứng cộng hưởng. *(TH: so sánh đồng bộ vs không đồng bộ.)*
- **G8.7 Đánh đổi hiệu năng / truyền thông / bộ nhớ / quyền riêng tư / thích nghi** — đề ra quyết định. *(TH: bảng trade-off, chọn cấu hình.)*
- **G8.8 Đóng góp đến từ đâu: backbone, phương pháp FL, chiến lược CL?** — ablation mindset. *(TH: chạy ablation đơn giản.)*
- **G8.9 Giả định & điều kiện thất bại từng phương pháp** — không có thuật toán chung thắng. *(TH: tìm "điểm vỡ" của thiết lập.)*

### Giai đoạn 9 — Đọc nghiên cứu & dự án cuối
- **G9.1 Cấu trúc một bài nghiên cứu** — question, assumption, contribution. *(TH: đọc 1 paper, tóm tắt theo khung.)*
- **G9.2 Baseline, ablation, kết quả chính** — phân biệt 3 loại kết quả. *(TH: nhận diện ablation trong paper.)*
- **G9.3 Kiểm tra cách chia dữ liệu, client, nhiệm vụ** — tính hợp lệ. *(TH: phát hiện leakage/giả định yếu.)*
- **G9.4 Chỉ số, chi phí tính toán, giao tiếp** — biết đọc con số. *(TH: đánh giá cost từ bảng thí nghiệm.)*
- **G9.5 Phát hiện kết luận vượt bằng chứng** — tư duy phản biện. *(TH: tìm chỗ phóng đại.)*
- **G9.6 Tái hiện một thí nghiệm nhỏ** — reproducibility. *(TH: chạy lại baseline, đối chiếu số.)*
- **G9.7 Viết báo cáo tái lập & đề xuất tiếp theo** — kỹ năng tổng kết. *(TH: viết báo cáo dự án.)*
- **G9.8 Dự án cuối lộ trình** — xem mục "Dự án cuối" dưới.

---

## Danh sách thuật ngữ Anh–Việt quan trọng (trích; bản đầy đủ mở rộng dần theo từng chương)

| Anh | Việt | Ghi chú ngắn |
|---|---|---|
| Gradient descent | hạ/leo dốc theo-gradient | trái tim của optimization |
| Loss function | hàm mất mát | thước đo sai số |
| Overfitting | học quá khớp | nhớ dữ liệu thay vì quy luật |
| Baseline | đường cơ sở / phương pháp nền | điểm so sánh mặc định |
| Data leakage | rò rỉ dữ liệu | thông tin từ test lọt vào train |
| Training loop | vòng lặp huấn luyện | forward→loss→backward→update |
| Epoch / batch / iteration | kỷ/vòng, lô, bước lặp | đơn vị vòng huấn luyện |
| Tensor | ten-xơ | mảng đa chiều |
| Convolution | phép chập | trích đặc trưng không gian ảnh |
| Pooling | gộp | giảm chiều dữ liệu |
| Augmentation | tăng cường dữ liệu | làm giàu tập ảnh |
| Transfer learning | học truyền tải | tận dụng mô hình đã huấn luyện |
| Fine-tuning | tinh chỉnh | cập nhật tiếp trọng số |
| Pretraining | tiền huấn luyện | huấn luyện trước trên dữ liệu lớn |
| Frozen backbone | mạng nền đóng băng | trọng số không cập nhật |
| Linear probing | dò tuyến tính | thêm 1 tầng tuyến tính để đánh giá biểu diễn |
| Foundation model | mô hình nền tảng | mô hình đa năng tiền huấn luyện lớn |
| Attention / Self-attention | cơ chế chú ý / tự chú ý | gán mức ảnh hưởng giữa phần tử |
| Vision Transformer (ViT) | Transformer thị giác | chia ảnh thành các patch |
| Client / Server | client / máy chủ | bên giữ dữ liệu / bên tổng hợp |
| Communication round | vòng truyền thông | một lần trao đổi client↔server |
| Local epoch | kỷ cục bộ | train trên client trước khi gửi cập nhật |
| Federated Averaging (FedAvg) | trung bình hóa liên kết | phương pháp FL kinh điển |
| non-IID data | dữ liệu không IID | phân phối khác nhau giữa client |
| Secure Aggregation | tổng hợp an toàn | gom cập nhật mà server không thấy từng client |
| Differential Privacy (DP) | quyền riêng tư vi phân | bảo đảm quyền riêng tư chính thức |
| Client drift | trôi client | mô hình client lệch khỏi nhau |
| Catastrophic forgetting | quên thảm khốc | quên kiến thức cũ khi học mới |
| Task/Class/Domain-incremental | học tăng dần theo nhiệm vụ/lớp/miền | ba cấu hình CL |
| Rehearsal | hồi tưởng (tái phát dữ liệu) | lưu/trình lại mẫu cũ |
| Accuracy / Average accuracy | độ chính xác / độ chính xác trung bình | chỉ số hiệu năng |
| Forgetting metric | chỉ số quên lãng | đo mức mất kiến thức cũ |
| Ablation | thí nghiệm loại bỏ thành phần | cô lập đóng góp của từng phần |

---

## Đề xuất dự án cuối lộ trình

**Đề xuất (chạy được trên CPU/phần cứng phổ thông):**
> **"Phân loại ảnh y-khoa/cây trồng giả lập theo mô hình FL + CL."**

Người học:
1. **Xác định câu hỏi & giả định:** VD "nhiều phòng khám lâu năm cần học nhận diện bệnh mới trên ảnh hiển vi mà không chia sẻ ảnh, và phải giữ khả năng nhận diện bệnh cũ" — nêu rõ giả định.
2. **Xây baseline tập trung:** huấn luyện một mô hình giám sát tập trung trên toàn bộ dữ liệu (điểm tham chiếu lý thuyết).
3. **Mô phỏng nhiều client:** chia một tập ảnh công khai (VD subset của CIFAR/EMNIST/biểu hiện bệnh giả lập) thành các client với phân phối non-IID/mất cân bằng.
4. **Triển khai phương pháp FL cơ bản:** FedAvg từ đầu (hoặc thư viện đơn giản), chạy nhiều round.
5. **Tạo chuỗi nhiệm vụ thay đổi phân phối:** mô phỏng CL — các nhiệm vụ/lớp mới đến qua các round (VD client nhận lớp mới theo thời gian).
6. **(Tùy chọn) So sánh mô hình tự huấn luyện với pretrained:** fine-tune backbone pretrained trong cùng thiết lập.
7. **Chọn & giải thích chỉ số:** accuracy trên task mới, forgetting của task cũ, chi phí truyền thông (bytes), (tùy chọn) ảnh hưởng của DP.
8. **So sánh hiệu năng / thời gian / giao tiếp / tài nguyên** giữa các cấu hình.
9. **Phân tích lỗi, giới hạn, vấn đề quyền riêng tư:** chỉ ra nơi mô hình thất bại và giả định chưa thỏa.
10. **Viết báo cáo tái lập được:** lưu cấu hình (config), seed, mã, thư mục chạy, kết quả.

**Tiêu chí chấm dự án:**
- Baseline trung tâm rõ, được chạy và ghi số.
- Phương pháp FL triển khai đúng (luồng dữ liệu/round rõ).
- Chuỗi CL được tạo đúng và báo cáo đủ *cả* khả năng học mới lẫn giữ cũ.
- Chỉ số được chọn có lí do; có phân tích giới hạn.
- Báo cáo tái lập được (có config + seed + mã); đề xuất thí nghiệm tiếp theo rõ.

---

## Mẫu bắt buộc cho mỗi chương (tóm tắt khung 16 mục)

1. Vị trí trong lộ trình
2. Kiến thức cần dùng (ôn nhanh nếu quên)
3. Câu chuyện mở đầu
4. Câu hỏi trọng tâm
5. Trực giác
6. Từ trực giác đến mô hình
7. Thuật toán từng bước
8. Ví dụ nhỏ có số liệu
9. So sánh với phương pháp đơn giản hơn
10. Thí nghiệm tối thiểu
11. Thực hành lập trình (môi trường, cấu trúc, chạy, kết quả dự kiến, lỗi)
12. Đánh giá
13. Hiểu lầm và giới hạn
14. Bài tập (3 mức) + đáp án/gợi ý
15. Tóm tắt và tự kiểm tra
16. Đọc sâu bằng trực giác (bảng đời thực, đọc công thức, tính tay, phản ví dụ, giới hạn, quiz, gợi ý và lời giải)

---

## Quy ước biên tập hiện hành

Toàn bộ 39 chương của bộ tài liệu đã có nội dung. Khi sửa hoặc viết thêm:

- Giữ khung 16 mục trên; mục 16 phải có góc nhìn riêng của chương, không lặp lại phần tóm tắt.
- Mọi phép tính tay phải kiểm lại; không dùng một con số minh họa cho nhiều kết luận khác nhau.
- Khối mở rộng dùng `:::quiz`, `:::goi-y`, `:::loi-giai`, `:::interactive <tên>` và đóng bằng `:::`. Quiz có đúng ba lựa chọn A/B/C, một đáp án và một giải thích.
- Không thêm widget chỉ để trang trí; chỉ dùng khi tương tác làm rõ một quan hệ trong chương.
- Sau khi sửa, chạy `node webapp/build.js` và các kiểm tra trong `webapp/` trước khi báo hoàn thành.