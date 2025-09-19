/**
 * Cấu hình dành cho môi trường phát triển (development).
 *
 * Đặt `DEV_MODE_SKIP_API_KEY` thành `true` để bỏ qua màn hình yêu cầu API Key,
 * cho phép vào thẳng game để kiểm tra UI và các chức năng không gọi đến AI.
 *
 * LƯU Ý: Khi cờ này được bật, các chức năng game yêu cầu AI (như tạo sự kiện,
 * xử lý hành động) sẽ không hoạt động vì không có API Key.
 *
 * File này nên được xóa hoặc đặt cờ thành `false` khi triển khai sản phẩm thật.
 */
export const DEV_MODE_SKIP_API_KEY = true;
