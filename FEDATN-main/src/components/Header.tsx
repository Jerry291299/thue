import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icategory } from "../interface/category";
import { getAllCategories } from "../service/category";
import { getProductsByCategory } from "../service/products";
import logo from "./img/logo.png"
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
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const Navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [prevSelectedCategory, setPrevSelectedCategory] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    img: "",
  });
  
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
        const formattedDob = response.data.dob
          ? new Date(response.data.dob).toISOString().split("T")[0]
          : "";
        setProfileData({
          img: response.data.img || ""
          
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    Navigate("/");
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      Navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleCategoryFilter = (categoryName: string) => {
    if (categoryName === selectedCategory) {
      // Thông báo khi cùng một danh mục được nhấp hai lần.
      alert(`Bạn đã chọn danh mục ${categoryName}.`);
    } else {
      setPrevSelectedCategory(selectedCategory);
      setSelectedCategory(categoryName);
      navigate(`/categories/${categoryName}`);
    }
  };

  return (
    <div className="container mx-auto w-full">
      <div className="up py-[15px] flex justify-between font-medium pr-[10px]">
        <div className="trái flex">
          <div className="flex items-center px-[20px]">
            <span className="border-black h-full mr-[10px]"></span>
            <p className="italic hover:scale-110 transition-transform duration-300">
              Số điện thoại: 0344357227
            </p>
          </div>

          <div className="flex items-center px-[20px]">
            <span className=" border-black h-full mr-[10px]"></span>
            <p className="italic hover:scale-110 transition-transform duration-300">
              Email: 
            </p>
          </div>

        </div>
        <div className="phải flex gap-3">
          {user ? (
            <div className="relative">
              <div
      className="flex items-center cursor-pointer border-2 border-black rounded-xl px-[10px] py-[5px]"
      onClick={toggleSubMenu}
    >
      <img
        src={profileData.img || nguoi}
        alt="Hồ sơ"
        className="w-8 h-8 rounded-full"
      />
      <p className="ml-2 flex gap-2">
        {user.info.name}
        <img className="w-4 h-4 mt-[5px]" src={iconarrow} alt="" />
      </p>
    </div>
              {isSubMenuOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10">
                  <li className="hover:bg-gray-100">
                    <Link
                      to={`/profileinfo/${user.id}`}
                      className="block w-full text-left px-4 py-2"
                    >
                      Cá nhân
                    </Link>
                  </li>
                  {(user.info.role === "admin" || user.info.role === "shipper") && (
                    <li className="hover:bg-gray-100">
                      <Link
                        to={user?.info?.role === "admin" ? "/admin" : "/shipper"}
                        className="block px-4 py-2"
                        onClick={() => setIsSubMenuOpen(false)}
                      >
                        Quản trị
                      </Link>
                    </li>
                  )}
                  {(user.info.role === "user" ||
                    user.info.role === "admin" || user.info.role === "shipper") && (
                      <>
                        <li className="hover:bg-gray-100">
                          <Link
                            to={`/Cart/${user.id}`}
                            className="block px-4 py-2"
                            onClick={() => setIsSubMenuOpen(false)}
                          >
                            Xem Giỏ hàng
                          </Link>
                        </li>
                        <li className="hover:bg-gray-100">
                          <Link
                            to="/donhang"
                            className="block px-4 py-2"
                            onClick={() => setIsSubMenuOpen(false)}
                          >
                            Xem Đơn hàng
                          </Link>
                        </li>
                      </>
                    )}
                  <li className="hover:bg-gray-100">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsSubMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2"
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <Link to={"/login"}>
                <div className="flex">
                  <img
                    className="scale-[0.9] pl-[30px] pr-[10px]"
                    src={nguoi}
                    alt=""
                  />
                  Đăng nhập
                </div>
              </Link>
              <Link to={"/register"}>
                <div className="flex">
                  <img
                    className="scale-[0.9] pl-[30px] pr-[10px]"
                    src={nguoi}
                    alt=""
                  />
                  Đăng ký
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="down flex justify-between border-y-2 py-[12px] border-black pr-[10px]">
      <Link
              to="/"
              className="hover:scale-110 transition-transform duration-300 uppercase inline-block"
            >
        <img className="h-24 pl-[40px]" src={logo} alt="" />
        </Link>
        <div className="right flex pl-[30px]">
          <div className="text flex gap-14 pt-[25px] pr-[100px] text-lg">
            <Link
              to="/"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Trang chủ
            </Link>

            <NavLink
              to="/products"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Sản phẩm
            </NavLink>

            <NavLink
              to="/tintuc"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Tin tức
            </NavLink>

            <NavLink
              to="/gioithieu"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Giới thiệu
            </NavLink>

          </div>

          <div className="search px-[30px] pt-[23px]">
            <div className="relative">
              <input
                type="text"
                className="p-2 pl-8 rounded border border-gray-200 bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
              />
              <svg
                className="w-4 h-4 absolute right-[10px] top-3.5"
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
    </div>
  );
};

export default Header;
