import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "./img/logo.png";
type Props = {};

const Navbar = (props: Props) => {
  const [user, setUser] = useState<{
    info: { role: string; email: string };
    id: string;
  } | null>(null);
  const Navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    Navigate("/");
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">
        <aside
          className="fixed inset-y-0 left-0 z-40 w-[250px] lg:w-[270px] bg-white border-r border-gray-200 shadow-md transition-all duration-300"
          id="sidenav-main"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-16 h-[96px] bg-white text-Black">
            <div className="logo w-[70px] mr-[19px]">
              <img className="w-full" src={logo} alt="" />
            </div>
            <h1 className="text-lg font-semibold">
              {user?.info?.role === "admin" && "Admin"}
              {user?.info?.role === "shipper" && "Shipper"}
            </h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div>
                <p className="font-medium text-gray-800">{user?.info?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2 text-md">
              <li>
                <NavLink
                  to="/"
                  className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                >
                  Trang chủ
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                >
                  Đăng xuất
                </button>
              </li>
            </ul>

            {user?.info?.role === "admin" && (
              <>
                <h2 className="px-4 mt-6 mb-2 text-md font-semibold text-gray-500 uppercase">
                  Chức năng:
                </h2>
                <ul className="space-y-2 text-md">
                  <li>
                    <NavLink
                      to="/admin/users"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Người dùng
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/order"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Đơn hàng
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/vouchers"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Voucher
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/comments"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Bình luận
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/Listcategory"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Danh mục
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/Material"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Chất liệu
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/dashboard"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Sản phẩm
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/tintuc"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Tin tức
                    </NavLink>
                  </li>
                </ul>
              </>
            )}

            {user?.info?.role === "shipper" && (
              <>
                <h2 className="px-4 mt-6 mb-2 text-md font-semibold text-gray-500 uppercase">
                  Chức năng:
                </h2>
                <ul className="space-y-2 text-md">
                  
                  <li>
                    <NavLink
                      to="/shipper/orders"
                      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
                    >
                      Đơn hàng
                    </NavLink>
                  </li>
                </ul>
              </>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
