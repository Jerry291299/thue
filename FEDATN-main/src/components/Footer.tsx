import React, { useEffect, useState } from "react";


type Props = {};

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 text-sm">
      <div className="container pt-[80px] border-t-2 border-black mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Support Section */}
          <div>
            <h3 className="font-bold">Tổng đài hỗ trợ</h3>
            <p>Gọi mua: <span className="text-blue-600 font-semibold">1900 232 460</span> (8:00 - 21:30)</p>
            <p>Khiếu nại: <span className="text-blue-600 font-semibold">1800 1062</span> (8:00 - 21:30)</p>
            <p>Bảo hành: <span className="text-blue-600 font-semibold">1900 232 464</span> (8:00 - 21:00)</p>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-bold">Về công ty</h3>
            <ul>
              <li><a href="#" className="hover:underline">Giới thiệu công ty (MWG.vn)</a></li>
              <li><a href="#" className="hover:underline">Tuyển dụng</a></li>
              <li><a href="#" className="hover:underline">Gửi góp ý, khiếu nại</a></li>
              <li><a href="#" className="hover:underline">Tìm siêu thị (2.962 shop)</a></li>
            </ul>
          </div>

          {/* Other Info */}
          <div>
            <h3 className="font-bold">Thông tin khác</h3>
            <ul>
              <li><a href="#" className="hover:underline">Tích điểm Quà tặng VIP</a></li>
              <li><a href="#" className="hover:underline">Lịch sử mua hàng</a></li>
              <li><a href="#" className="hover:underline">Đăng ký bán hàng CTV</a></li>
              <li><a href="#" className="hover:underline">Tìm hiểu về mua trả chậm</a></li>
              <li><a href="#" className="hover:underline">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:underline">Xem thêm</a></li>
            </ul>
          </div>

          {/* Group Websites */}
          <div>
            <h3 className="font-bold">Website cùng tập đoàn</h3>
            <div className="flex flex-wrap gap-2">
              <img src="/topzone.png" alt="TopZone" className="h-6" />
              <img src="/dienmayxanh.png" alt="Điện Máy Xanh" className="h-6" />
              <img src="/bachhoaxanh.png" alt="Bách Hóa Xanh" className="h-6" />
              <img src="/ankhang.png" alt="An Khang" className="h-6" />
              <img src="/weclam.png" alt="Việc Làm" className="h-6" />
              <img src="/erablue.png" alt="EraBlue" className="h-6" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 text-center text-gray-600">
          <p>© 2025 Công ty Cổ phần Thế Giới Di Động. GPKD: 0303217354 do Sở KH & ĐT TP.HCM cấp ngày 02/01/2007.</p>
          <p>Địa chỉ: 128 Trần Quang Khải, P. Tân Định, Q.1, TP. Hồ Chí Minh.</p>
          <p>Email: <a href="mailto:cskh@thegioididong.com" className="text-blue-600">cskh@thegioididong.com</a></p>
          <div className="flex justify-center gap-4 mt-4">
            <img src="/dmca.png" alt="DMCA" className="h-6" />
            <img src="/protected.png" alt="Protected" className="h-6" />
            <img src="/bocongthuong.png" alt="Bộ Công Thương" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;