# AI for Math — Kho tài liệu Toán & FL/CL-CV

Bản web tĩnh của bộ tài liệu học tập gồm 50 bài đọc thuộc ba mạch:

- Toán nền tảng cho AI;
- Học máy và thị giác máy tính;
- Học liên kết (Federated Learning) và học liên tục (Continual Learning).

Mỗi bài có công thức, ví dụ, câu hỏi tự kiểm tra và lab tương tác. Toàn bộ 48 lab chạy bằng JavaScript ngay trên trình duyệt, không cần máy chủ.

## Điểm tương tác chính

- **Cổng dự đoán** trước khi mở lab: chọn dự đoán, nhận phản hồi rồi mới xem kết quả.
- **Thao tác trực tiếp**: kéo vector, điểm gradient, ngưỡng phân loại, cửa sổ convolution, tham số client FedAvg và điểm ε của DP.
- **Mốc A / hiện tại**: lưu một cấu hình để so sánh với trạng thái đang xem.
- **Thử thách**: kiểm tra một mục tiêu cụ thể bằng số liệu của lab.
- **Bảo tàng lỗi**: nạp sẵn các cấu hình sai phổ biến kèm giải thích.
- **Chia sẻ trạng thái lab** bằng URL và **xuất phiếu lab** Markdown.
- **Ôn tập cách quãng**: quiz đúng/sai được lưu cục bộ, có lịch ôn và gợi ý bài tiếp theo.
- **Bộ lọc** theo lộ trình/độ khó, bản đồ khái niệm, chế độ lớp học và điều hướng bàn phím.
- **Font tiếng Việt tự lưu** trong `fonts/`; trang không phụ thuộc Google Fonts khi đọc.

Tiến độ đọc, quiz và trạng thái lab được lưu trong `localStorage` của trình duyệt; không gửi lên máy chủ.

## Xem trực tuyến

https://ktzung.github.io/ai-for-math/

Trang bài mẫu:

https://ktzung.github.io/ai-for-math/vector.html

## Cấu trúc

- `index.html` — ứng dụng đọc chính, đã bao gồm nội dung và mã tương tác.
- `vector.html` — bài mẫu Đại số tuyến tính tương tác.
- `audio/` — audio bài đọc đầu tiên và manifest.
- `fonts/` — font tiếng Việt tự lưu (Be Vietnam Pro, Noto Serif; giấy phép OFL).
- `source/` — bản gốc Markdown và mã nguồn webapp để tái lập bản build.
- `.github/workflows/build-check.yml` — build lại từ `source/` và chạy kiểm tra trên GitHub Actions.
- `.nojekyll` — tắt xử lý Jekyll của GitHub Pages.

## Chạy cục bộ

```bash
python3 -m http.server 8000
```

Sau đó mở `http://localhost:8000/`.

## Build lại từ nguồn

```bash
node source/webapp/build.js
node source/webapp/test-series-upgrade.js
node source/webapp/test-vector-lesson.js
node source/webapp/verify.js
node source/webapp/test_render.js
```