const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình để web đọc được dữ liệu gửi lên và hiển thị giao diện
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Kết nối đến Database PostgreSQL của Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Tự động tạo bảng 'danh_sach_dat_phong' nếu trong CSDL chưa có
pool
  .query(
    `
    CREATE TABLE IF NOT EXISTS danh_sach_dat_phong (
        id SERIAL PRIMARY KEY,
        ten_phong VARCHAR(100),
        thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`,
  )
  .then(() => console.log("Đã khởi tạo bảng CSDL thành công!"))
  .catch((err) => console.error("Lỗi tạo bảng:", err));

// API Xử lý khi khách bấm nút Đặt Phòng
app.post("/api/dat-phong", async (req, res) => {
  try {
    const tenPhong = req.body.tenPhong;
    // Lưu vào cơ sở dữ liệu
    await pool.query(
      "INSERT INTO danh_sach_dat_phong (ten_phong) VALUES ($1)",
      [tenPhong],
    );
    res.json({
      success: true,
      message: `Dữ liệu phòng "${tenPhong}" đã được lưu an toàn vào PostgreSQL!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Lỗi Database" });
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(`Máy chủ Backend đang chạy ở cổng ${port}`);
});
