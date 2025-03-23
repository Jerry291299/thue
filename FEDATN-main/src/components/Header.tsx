import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icategory } from "../interface/category";
import { getAllCategories } from "../service/category";
import logo from "./img/logo.png";
import nguoi from "../anh/user.png";
import iconarrow from "./icons/down-arrow_5082780.png";
import axios from "axios";

const Header = () => {
  const [user, setUser] = useState<{
    info: { role: string; name: string; email: string; id: string };
    id: string;
  } | null>(null);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [profileData, setProfileData] = useState({ img: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserProfile(parsedUser.id);
    }

    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:28017/user/${id}`);
      if (response.data) {
        setProfileData({
          img: response.data.img || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          {/* Left Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className="w-px h-5 bg-gray-300 mr-3"></span>
              <p className="text-gray-700 text-sm hover:text-gray-900 transition-colors duration-200">
                Số điện thoại: 0344357227
              </p>
            </div>
            <div className="flex items-center">
              <span className="w-px h-5 bg-gray-300 mr-3"></span>
              <p className="text-gray-700 text-sm hover:text-gray-900 transition-colors duration-200">
                Email: support@clickmobile.vn
              </p>
            </div>
          </div>

          {/* Right User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors duration-200"
                  onClick={toggleSubMenu}
                >
                  <img
                    src={profileData.img || nguoi}
                    alt="Hồ sơ"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <p className="ml-2 text-gray-800 font-medium flex items-center gap-1">
                    {user.info.name}
                    <img className="w-4 h-4" src={iconarrow} alt="Dropdown" />
                  </p>
                </div>
                {isSubMenuOpen && (
                  <ul className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-10 border border-gray-200">
                    <li className="hover:bg-gray-50">
                      <Link
                        to={`/profileinfo/${user.id}`}
                        className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Cá nhân
                      </Link>
                    </li>
                    {(user.info.role === "admin" || user.info.role === "shipper") && (
                      <li className="hover:bg-gray-50">
                        <Link
                          to={user.info.role === "admin" ? "/admin" : "/shipper"}
                          className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                          onClick={() => setIsSubMenuOpen(false)}
                        >
                          Quản trị
                        </Link>
                      </li>
                    )}
                    {(user.info.role === "user" ||
                      user.info.role === "admin" ||
                      user.info.role === "shipper") && (
                      <>
                        <li className="hover:bg-gray-50">
                          <Link
                            to={`/Cart/${user.id}`}
                            className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                            onClick={() => setIsSubMenuOpen(false)}
                          >
                            Giỏ hàng
                          </Link>
                        </li>
                        <li className="hover:bg-gray-50">
                          <Link
                            to="/donhang"
                            className="block px-4 py-2 text-gray-700 hover:text-gray-900"
                            onClick={() => setIsSubMenuOpen(false)}
                          >
                            Đơn hàng
                          </Link>
                        </li>
                      </>
                    )}
                    <li className="hover:bg-gray-50">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsSubMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <img src={nguoi} alt="Login" className="w-6 h-6 mr-2" />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <img src={nguoi} alt="Register" className="w-6 h-6 mr-2" />
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-16 transition-transform duration-300 hover:scale-105"
            />
          </Link>

          {/* Navigation and Search */}
          <div className="flex items-center space-x-8">
            {/* Navigation Links */}
            <nav className="hidden lg:flex space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-gray-800 font-medium text-lg uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? "border-b-2 border-gray-900"
                      : "hover:border-b-2 hover:border-gray-900"
                  }`
                }
              >
                Trang chủ
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `text-gray-800 font-medium text-lg uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? "border-b-2 border-gray-900"
                      : "hover:border-b-2 hover:border-gray-900"
                  }`
                }
              >
                Sản phẩm
              </NavLink>
              <NavLink
                to="/tintuc"
                className={({ isActive }) =>
                  `text-gray-800 font-medium text-lg uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? "border-b-2 border-gray-900"
                      : "hover:border-b-2 hover:border-gray-900"
                  }`
                }
              >
                Tin tức
              </NavLink>
              <NavLink
                to="/gioithieu"
                className={({ isActive }) =>
                  `text-gray-800 font-medium text-lg uppercase tracking-wide transition-all duration-200 ${
                    isActive
                      ? "border-b-2 border-gray-900"
                      : "hover:border-b-2 hover:border-gray-900"
                  }`
                }
              >
                Giới thiệu
              </NavLink>
            </nav>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;