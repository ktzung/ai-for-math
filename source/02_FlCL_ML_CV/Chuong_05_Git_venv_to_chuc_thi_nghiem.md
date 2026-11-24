# Chương 1.5 — Git, môi trường ảo & tổ chức thí nghiệm (Giai đoạn 1)

> **Câu hỏi trọng tâm:** *Làm sao quản lý mã, môi trường và kết quả để một thí nghiệm chạy lại được — bởi tôi, hay bởi người khác, trên máy khác?*

---

## 1. Vị trí trong lộ trình

Đây là chương cuối của Giai đoạn 1. Ta đã nạp dữ liệu (1.2), thao tác mảng (1.3), viết vòng lặp PyTorch (1.4). Giờ trang bị **công cụ nghề nghiệp**: Git (phiên bản mã), **môi trường ảo + requirements** (tái lập môi trường), và **cấu trúc thư mục thí nghiệm** (đã giới thiệu ở 1.2 — giờ khép lại thành chuẩn).

Nó **nối** từ 1.2 (cây thư mục) và **chuẩn bị toàn bộ** G2–G9 — vì mọi thí nghiệm FL/CL đều cần "ai đó chạy lại được" (yêu cầu tái lập ở mục tiêu lộ trình). Kỹ năng ở đây không tạo ra số liệu, nhưng tạo ra *độ tin cậy* của số liệu.

---

## 2. Kiến thức cần dùng

- Đã biết tạo file, chạy Python.
- Đã hiểu cấu trúc thư mục (1.2).
- Math: không cần đạo hàm/xác suất — đây là chương công cụ.

**Ôn nhanh — "môi trường ảo" là gì:** một thư mục riêng chứa bản Python + thư viện *của dự án này*, tách khỏi Python hệ thống. Vì sao: hai dự án có thể cần hai phiên bản `torch` khác nhau; môi trường ảo tránh xung đột. Bạn đã tạo một cái ở Chương 1.1 (`python -m venv .venv`).

---

## 3. Câu chuyện mở đầu

Lan làm xong một thí nghiệm phân loại ảnh. Ba tuần sau, cô cần chạy lại để so sánh với một phương pháp mới. Cô mở máy: mã ở đâu? Có vài bản `train_final.py`, `train_final2.py`, `train_OLD.py` rải rác. Cài lại môi trường thì lầy lội, phiên bản không nhớ rõ. Và cô không chắc hai kết quả cũ "so sánh được" vì... seed khác, config khác, không ghi chú.

Tình trạng "ô dề" này là **thực trạng của phần lớn thí nghiệm không tái lập được**. Chương này đưa ra một *kỷ luật* tối giản, đủ dùng cho cả lộ trình: **mã có phiên bản (Git), môi trường có file cấu hình, kết quả có chỗ lưu rõ và ghi chú.**

---

## 4. Câu hỏi trọng tâm

**Cần những thói quen tối thiểu nào để một thí nghiệm (mã + môi trường + cấu hình + kết quả) chạy lại được đáng tin cậy?**

---

## 5. Trực giác

**Git như "máy quay lưu lại mọi phiên bản mã".** Mỗi lần bạn commit là chụp một "trạng thái tốt" của dự án. Mắc lỗi? Quay lại trạng thái cũ. Muốn nhìn lịch sử? `git log`. Muốn thử thử nghiệm mà không phá kết quả chính? Tạo **nhánh** (branch). Đây là "cỗ máy thời gian" của mã.

**Môi trường ảo + `requirements.txt` như "công thức món ăn viết ra giấy".** Nếu không ghi "nấu bằng bao nhiêu muối", người khác khó làm đúng. `requirements.txt` ghi chính xác thư viện + phiên bản → on máy khác chỉ cần `pip install -r requirements.txt` là dựng lại đúng môi trường.

**Cấu trúc thư mục như "ngăn kéo tủ hồ sơ".** Mã một ngăn, cấu hình một ngăn, kết quả một ngăn, dữ liệu một ngăn. Ai mở tủ cũng tìm được đồ — kể cả Lan ba tháng sau (mục tiêu làm "người xa lạ" hiểu được dự án).

**Phép so sánh "Git = máy quay / môi trường = công thức / thư mục = tủ hồ sơ":** đều quen thuộc. **Giới hạn** của mỗi cái: Git không lưu được số liệu/kết quả lớn (dùng Git LFS hoặc sinh ra lại); `requirements.txt` chưa buộc phiên bản **hệ tranh chấp** tuyệt đối như lockfile; thư mục tách bạch không thay thế việc *ghi chú* (lý do tại sao chọn config này). Ta sẽ học mức "đủ dùng", không phải chuẩn chuyên nghiệp quá mức.

---

## 6. Từ trực giác đến mô hình

- **Dữ liệu:** không cần dữ liệu ML ở đây; minh họa trên dự án ví dụ nhỏ.
- **Mô hình:** không có (chương công cụ).
- **Mục tiêu:** một dự án (mã + env + config + results) chạy lại được.
- **Điều kiện:** đã có git cài (chạy `git --version` kiểm tra). Nếu chưa, cài Git (dùng package manager).
- **Các thành phần quản lý:** mã (Git), env (`requirements.txt`), cấu hình (config.py), kết quả (results/ + README).

**Thuật toán tối giản (mỗi dự án mới):**

```
1. Lập thư mục theo chuẩn (scripts/ config.py results/ data/ README.md).   (1.2)
2. Giữ config.py output có seed + cấu hình cố định.
3. Ghi requirements.txt từ env hiện tại.
4. git init; git add; commit (điểm bắt đầu).
5. Mỗi thí nghiệm → chạy, lưu kết quả vào results/<run_id>, ghi note.
6. Commit mỗi khi code ổn định.
```

---

## 7. Thuật toán từng bước

**Bước 1 — Chuẩn cây thư mục (nhắc lại 1.2, khép lại).**

```
my_experiment/
  scripts/           # mã huấn luyện/đánh giá
  config.py          # cấu hình: seed, epochs, lr, dataset
  results/           # đầu ra mỗi lần chạy (số, ảnh, checkpoint)
  data/              # dữ liệu (không commit vào git)
  requirements.txt   # thư viện + phiên bản
  README.md          # cách chạy lại
```

**Bước 2 — Viết `config.py` (giữ mọi "núm" ở một nơi).**

```python
SEED = 42
EPOCHS = 10
LR = 0.001
BATCH_SIZE = 64
DATASET = "cifar10"
```

- Mọi siêu tham số về đây. Khi thử nghiệm, bạn đổi config (không sửa lung tung trong code), lưu config theo từng lần chạy để so sánh.

**Bước 3 — Ghi lại môi trường.**

```bash
pip freeze > requirements.txt
```

`pip freeze` xuất tất cả thư viện đang cài + version ra file. **Khi chạy lại**:

```bash
pip install -r requirements.txt
```

*(Mẹo kỷ luật: chỉ `pip freeze` trong env đúng; dùng chung Python hệ thống sẽ kéo cả thứ không cần. Nên môi trường ảo cô lập.)*

**Lưu ý:** `pip freeze` có thể in cả các gói không thuần về dự án; nếu muốn tối giản, ghi thủ công các gói chính (`numpy matplotlib torch torchvision`) kèm phiên bản — đủ cho tái lập ở mức này.

**Bước 4 — Khởi tạo Git.**

```bash
git init
git add .gitignore requirements.txt config.py scripts/
git commit -m "init project"
```

**Bước 5 — `.gitignore` (đừng commit thứ không nên).**

```
data/
results/*.bin
__pycache__/
```

- `data/` to — không nên đưa vào Git (tải lại bằng script).
- `__pycache__/` — file cache tạm.
- `results/` — tùy; nếu sinh lại được thì không cần commit bản nhị phân.

**Bước 6 — Mỗi lần chạy thí nghiệm:** đặt `run_id` (VD datetime), ghi `results/<run_id>/` kèm copy `config.py` và `stdout`/metric. Ghi note vào README hoặc `results/<run_id>/notes.md`.

**Bước 7 — Commit thường:** khi code ổn định, `git add . && git commit -m "..."`. Log: `git log --oneline`; xem trạng thái: `git status`.

**Lỗi thường gặp:**
- Commit nhầm `data/` (repo nặng) → thêm `data/` vào `.gitignore` trước khi commit.
- Quên `pip freeze` → thiếu env khi chạy lại → thiếu requirements.
- Commit "mỗi thay đổi nhỏ" tên mơ hồ → khó tra lịch sử; ghi message có nghĩa.

---

## 8. Ví dụ nhỏ có số liệu

**Tình huống:** chạy 2 thí nghiệm FL mini so sánh (sẽ học khái niệm ở G6 — ở đây chỉ dùng làm ví dụ tổ chức). Cấu hình khác nhau ở **seed**.

**Bước 1 — Tạo 2 config:** trong `config.py` thay `SEED=42` và `SEED=123`, lưu thành `results/run1/config_seed42.py`, `results/run2/config_seed123.py` (copy file sau khi chạy).

**Bước 2 — Ghi kết quả:** mỗi `results/<run_id>/` gồm `metrics.json` (accuracy, forgetting), `seed` ghi rõ, `notes.md`.

**Bước 3 — Dùng `git tag` (gắn nhãn) cho mốc quan trọng:**

```bash
git tag v1-fl-2client      # điểm mốc dễ nhớ
```

**Bước 4 — Giải thích:** nhờ ghi seed + config + kết quả theo run, bạn (hoặc người đọc) so sánh 2 run một cách trung thực, và **không nhầm kết quả của cấu hình nào**. Đây chính là "reproducibility" tối giản.

**Kiểm chứng số:** mỗi run ghi đủ 4 thông tin (seed, config, metric, notes). Nếu thiếu một → báo cáo coi như không tái lập được.

---

## 9. So sánh với phương pháp đơn giản hơn

**Phương pháp đơn giản hơn:** "chỉ lưu mã, không ghi env/config/kết quả" (cách Lan ban đầu).

| Phương diện | Lưu mã tay, không process | Với Git+env+config+results |
|---|---|---|
| Tái lập môi trường | khó, mò phiên bản | `pip install -r` là xong |
| So sánh thí nghiệm | lẫn lộn (train_final2.py...) | run_id + config + metrics rõ |
| Quay lại kết quả cũ | mất mốc | git log/tag |
| Đánh đổi | không cần học thêm | mất chút thời gian kỷ luật ban đầu |

**Cải thiện:** đáng tin, so sánh được, không mất mốc. **Đánh đổi:** phải giữ kỷ luật (commit, ghi note) — đổi lại là "bảo hiểm" tránh những ngày mò root-cause vô ích.

---

## 10. Thí nghiệm tối thiểu

**Mục tiêu:** làm một dự án nhỏ từ đầu theo chuẩn, và **tự tái lập** nó (mô phỏng "máy khác").

Làm:
1. Tạo thư mục như mục 7, thêm một `scripts/hello.py` in "hello".
2. `pip freeze > requirements.txt`.
3. `git init`, add, commit.
4. **Tái lập:** tạo môi trường mới `python -m venv .venv2`, `pip install -r requirements.txt`, chạy `hello.py`.
5. Ghi nhận: nếu `hello.py` chạy được trong env mới, bạn đã làm được "chạy trên máy khác" cho một dự án tí hon.

Đây là phép thử "tái lập" nhỏ nhất — thói quen bạn sẽ mở rộng lên mọi thí nghiệm thật sau này.

---

## 11. Thực hành lập trình

**Môi trường:** git + venv.

**Cấu trúc & lệnh (chạy từ `my_experiment/`):**

```bash
# 1. file config.py (như mục 7)
# 2. scripts/hello.py
# 3. tạo env tái lập
python -m venv .venv2
source .venv2/bin/activate        # Windows: .venv2\Scripts\activate
pip list                         # xem env trống
pip install -r requirements.txt  # tái lập
python scripts/hello.py          # chạy lại
# 4. git
git init
git add .
git commit -m "initial reproducible repo"
git log --oneline
```

**Kết quả dự kiến:** `hello.py` in ra dòng mong đợi trong env mới; `git log` hiện 1 commit; `git status` sạch.

**Lỗi thường gặp:**
- `source .venv2/bin/activate` lỗi (không có file) → chưa tạo đúng env; tạo lại `python -m venv .venv2`.
- `pip: command not found` → chưa kích hoạt env hoặc Python không có pip.
- Commit báo lớn (nhiều file lạ) → kiểm `.gitignore` đã bỏ `__pycache__/`, `data/`.

**Chú thích trung thực:** cú pháp lệnh đúng cho môi trường Unix/Linux/macOS; trên Windows thay `source` bằng `Scripts\activate`. Phiên bản Git/Python chỉ cần bản hợp lý.

---

## 12. Đánh giá

**Chỉ số:** dự án tái lập được nếu thỏa 4 điều: (1) có `requirements.txt`; (2) có `config.py` với seed; (3) kết quả lưu trong `results/<run_id>/` kèm note; (4) chạy lại trên env mới sinh ra đúng kết quả (hoặc ít nhất chạy được).

**Vì sao chọn:** đây là những thứ *người khác cần* để chạy thử nghiệm lại mã của bạn. Nếu thiếu một, báo cáo coi như thiếu một phần khả năng tái lập.

**Chỉ số không thể hiện:** không kiểm tra *chất lượng mô hình* (đó là việc các giai đoạn sau); không kiểm tra *tính đúng đắn khoa học* của lựa chọn cấu hình. Chỉ xác nhận "quy trình đủ để lặp lại".

---

## 13. Hiểu lầm và giới hạn

- **Hiểu lầm 1:** "Git ghi lại *mọi phút* thay đổi tự động." — Không. Bạn phải chủ động `git add` + `git commit`; Git chỉ lưu những gì bạn commit. Làm kỷ luật, không để "mất" giữa chừng.
- **Hiểu lầm 2:** "`requirements.txt` đảm bảo tái lập hoàn hảo." — Not hoàn toàn: nó khóa phiên bản thư viện, nhưng*toàn hệ thống* (cuda, nền OS, driver) có thể khác. Với lộ trình này (CPU, dữ liệu nhỏ) là đủ; nhưng biết giới hạn.
- **Hiểu lầm 3:** "Cây thư mục tách bạch = thí nghiệm tái lập." — Chưa đủ. Cấu trúc chỉ là vỏ; cần *ghi note* (config nào, tại sao) và giữ *config.py* — thứ "ý nghĩa" của thí nghiệm.
- **Giới hạn:** mức này chưa bàn hash dữ liệu, quản lý dữ liệu lớn (Git LFS), hay workflow nhánh phức tạp. Chỉ trang bị "đủ cho một nhà nghiên cứu tái lập" — những thứ nâng cao để lại cho các chương thực hành (G9).

---

## 14. Bài tập

### Khởi động (giải thích ý tưởng / đọc sơ đồ)
1. Git dùng để làm gì, và vì sao bạn phải chủ động `commit` (không tự động)?
2. Vì sao môi trường ảo + `requirements.txt` giúp tái lập môi trường trên máy khác?
3. Đọc cây thư mục mục 7: `config.py` nên được đặt ở đâu và chứa gì?

### Luyện tập (sửa đổi / mở rộng)
4. Tạo một dự án con: thư mục + `scripts/hello.py`, `requirements.txt`, `config.py`. Chạy `git init` + commit. Kiểm tra `git status` sau commit.
5. Thêm `data/` và `__pycache__/` vào `.gitignore`, tạo 2 file giả trong `data/`, commit. Kiểm tra file đó có bị git "theo dõi" không (`git status`).
6. Đổi `SEED` trong `config.py`, chạy lại, lưu kết quả vào `results/run2/` (copy config + ghi note). Tạo `git tag v2`.

### Thử thách (thiết kế / liên hệ)
7. Thiết kế `README.md` cho một thí nghiệm FL nhỏ (dùng các khái niệm đã học): gồm mục *Cách chạy*, *Cấu hình*, *Kết quả*, *Seed*. Viết 2–3 dòng mỗi mục.
8. Giải thích: vì sao "ghi seed + config cùng kết quả" lại là điều kiện tiên quyết để so sánh 2 thí nghiệm (ví dụ tăng số vòng Fed có hiệu quả không) một cách trung thực, thay vì chỉ xem con số accuracy.

### Đáp án / gợi ý (phần riêng — tự thử trước)
1. Giữ lịch sử mã, cho quay lại/hợp nhất. Không tự động vì Git lưu đúng *điểm* bạn quyết định là "ổn định"; phải `add`+`commit` có chủ đích.
2. Mỗi dự án có bộ thư viện riêng; `requirements.txt` ghi đúng phiên bản → `pip install -r` tái dựng đúng môi trường, tránh xung đột hệ thống.
3. Ở gốc (cạnh `scripts/`); chứa seed, epochs, lr, batch, dataset — mọi siêu tham số.
4. Sau commit, `git status` sạch (không file chưa theo dõi); có 1 commit trong `git log`.
5. Với `.gitignore` đúng, `data/` và `__pycache__/` không xuất hiện trong `git status` → không bị đưa vào commit.
6. `results/run2/` có `config_seed…py`, note, và `git tag v2` gắn nhãn mốc.
7. README gồm: *Cách chạy* (lệnh install + run), *Cấu hình* (seed, lr, rounds), *Kết quả* (chỗ lưu metrics), *Seed* (seed cố định để so sánh).
8. Nếu 2 thí nghiệm khác seed, sự khác biệt accuracy có thể do nhiễu khởi tạo chứ không phải do cấu hình (rounds). Ghi seed + config + kết quả trong cùng run giúp "giữ mọi thứ cố định trừ một thứ đang khảo sát" — nguyên tắc control variable, nền tảng của so sánh trung thực (liên hệ G9 ablation).

---

## 15. Tóm tắt và tự kiểm tra

**3–5 ý chính:**
1. **Git** giữ phiên bản mã — commit có chủ đích các mốc ổn định, không tự động.
2. **Môi trường ảo + `requirements.txt`** tái tạo lại môi trường trên máy khác.
3. **Cấu trúc thư mục** (scripts/config/results/data/README) + `.gitignore` giữ dự án gọn, không bơm dữ liệu vào git.
4. Mỗi thí nghiệm lưu **seed + config + kết quả + note** trong `results/<run_id>/` để so sánh trung thực.
5. Mục tiêu: thí nghiệm **chạy lại được** bởi người khác trên máy khác — nền của tái lập khoa học.

**Tự kiểm tra:**
- Kể đúng 3 lệnh Git cơ bản bạn dùng thường xuyên (`git add`, `git commit`, `git status`/`git log`).
- Làm thế nào tái tạo môi trường trên máy khác?
- Vì sao `data/` thường không commit vào git?
- Một thí nghiệm "tái lập được" cần ghi lại những gì (min 4 đồ)?
- Vì sao seed lại quan trọng khi so sánh 2 thí nghiệm?

---

## 16. Đọc sâu bằng trực giác — tái lập là một công thức bốn thành phần

Một người thử nấu lại món ăn chỉ dựa vào ảnh thành phẩm sẽ khó thành công; cần cả công thức, loại nguyên liệu, nhiệt độ lò và thời gian. Kết quả huấn luyện cũng vậy: con số accuracy chỉ tái lập được khi biết mã nào, môi trường nào, cấu hình nào và dữ liệu nào đã tạo ra nó.

| Thành phần | Hiện vật cần giữ | Câu hỏi kiểm tra |
|---|---|---|
| Mã | Commit hash hoặc tag | Đúng phiên bản code chưa? |
| Môi trường | `requirements.txt` có phiên bản | Đúng thư viện và phiên bản chưa? |
| Cấu hình | `config.py` kèm seed | Đúng siêu tham số và seed chưa? |
| Dữ liệu | Split manifest, checksum | Đúng mẫu nào vào train/test chưa? |

**Đọc quy ước tái lập:** `run = (commit, env, config, data_split)`. Dấu bằng ở đây không có nghĩa bit-identical trên mọi phần cứng; nó có nghĩa là người khác có đủ thông tin để chạy lại cùng quy trình và so sánh trong sai số đã ghi. Điều dễ đọc sai là chỉ lưu `train.py` rồi gọi là "đã tái lập", trong khi seed, phiên bản và danh sách mẫu vẫn nằm trong ký ức.

**Tính tay:** một thí nghiệm có 3 seed và 2 learning rate cần `3×2=6` lần chạy. Nếu mỗi lần mất 12 phút, tổng thời gian là `6×12=72` phút. Nếu lưu checkpoint 25 MB mỗi lần, riêng checkpoint đã chiếm `6×25=150 MB`; đừng quên ngân sách đĩa khi nhân số cấu hình.

**Phản ví dụ:** chạy lại đúng file `train.py` nhưng môi trường có NumPy phiên bản mới hơn, hoặc quên ghi seed nên lần chạy tự lấy giờ hệ thống. Kết quả lệch vài phần trăm, có khi vượt cả mức cải thiện đang muốn chứng minh. Đúng phải là: khóa phiên bản, ghi seed, lưu split và chạy lại theo đúng bốn thành phần.

**Giới hạn:** tái lập được không đồng nghĩa kết luận đúng. Một thí nghiệm có thể chạy lại y hệt nhưng vẫn sai vì chia dữ liệu rò rỉ, chọn test quá nhiều lần hoặc thiếu baseline. Và trên phần cứng khác, phép tính float có thể lệch nhỏ; hãy ghi dung sai chấp nhận thay vì đòi giống tuyệt đối.

:::interactive repro
:::

:::quiz
Muốn người khác chạy lại một thí nghiệm huấn luyện, bộ thông tin tối thiểu nào hợp lý nhất?
A. Chỉ cần file mã nguồn `train.py`.
B. Mã, môi trường có phiên bản, cấu hình kèm seed và cách chia dữ liệu.
C. Chỉ cần accuracy cuối cùng và tên mô hình.
Đáp án: B
Giải thích: Mã quyết định phép tính, môi trường quyết định thư viện, cấu hình quyết định quá trình chạy, còn split quyết định mẫu nào được dùng. Thiếu một thành phần thường không tái lập được kết quả.
:::

**Tự thử thêm:** một lưới thử có 4 seed và 3 learning rate, mỗi lần chạy 8 phút, mỗi checkpoint 25 MB. Tính tổng thời gian và dung lượng checkpoint.

:::goi-y
Số lần chạy là tích của số seed và số learning rate; nhân tiếp với thời gian và dung lượng mỗi lần.
:::

:::loi-giai
`4×3=12` lần chạy; `12×8=96` phút; `12×25=300 MB`. Nếu lưu thêm log, prediction hoặc nhiều checkpoint trong một lần chạy, ngân sách thực tế còn cao hơn.
:::