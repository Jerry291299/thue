import { Link, NavLink, useNavigate } from "react-router-dom";
import Facebook from "../anh/Facebook.png";
import heart from "../anh/heart.png";
import noti from "../anh/notification.png";
import shoppingcard from "../anh/shopping-cart.png";
import insta from "../anh/Instagram.png";
import link from "../anh/LinkedIn.png";
import twitter from "../anh/Twitter.png";
import nguoi from "../anh/user.png";
import logo from "./img/logo.png";
import { useEffect, useState } from "react";
import iconarrow from "./icons/down-arrow_5082780.png"
import canho from "./img/etty.png";
const Header = () => {
  const [user, setUser] = useState<{
    info: { role: string; email: string;  id: string; };
    id: string;
  } | null>(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const Navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    Navigate("/");
  };

  return (
    <>
      <div className="container mx-auto w-full">
        <div className="up py-[15px] flex justify-between font-medium pr-[10px]">
          <div className="trái flex">
            <p className="border-r-2 border-black px-[20px]">
              Phone Number: 0344357227
            </p>
            <p className="px-[20px]">Email:FPTdatn2025@gmail.com</p>
          </div>
          <div className="icon flex pr-[300px] gap-4">
            <img className="w-6 h-6" src={Facebook} alt="" />
            <img className="w-6 h-6" src={insta} alt="" />
            <img className="w-6 h-6" src={twitter} alt="" />
            <img className="w-6 h-6" src={link} alt="" />
          </div>

          <div className="phải flex gap-3">
            {user ? (
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer border-2 border-black rounded-xl px-[10px] py-[5px]"
                  onClick={toggleSubMenu}
                >
                  <img
                    src={nguoi}
                    alt="Profile"
                    className="w-5 h-5"
                  />
                  <p className="ml-2 flex gap-2">{user?.info?.email} 
                    <img className="w-4 h-4 mt-[5px]" src={iconarrow} alt="" />
                  </p>
                </div>

                {isSubMenuOpen && (
                  <ul className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10">
                    {user?.info?.role === "admin" && (
                      <li className="hover:bg-gray-100">
                        <Link
                          to="/admin"
                          className="block px-4 py-2"
                          onClick={() => setIsSubMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      </li>
                    )}

                    {(user?.info?.role === "user" || user?.info?.role === "admin") && (
                      <>
                        <li className="hover:bg-gray-100">
                          <Link
                            to={`/Cart/${user?.info?.id}`}
                            className="block px-4 py-2"
                            onClick={() => setIsSubMenuOpen(false)}
                          >
                            Xem Giỏ hàng
                          </Link>
                        </li>
                        <li className="hover:bg-gray-100">
                          <Link
                            to="/order"
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
                        Logout
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
                    Login
                  </div>
                </Link>
                <Link to={"/register"}>
                  <div className="flex">
                    <img
                      className="scale-[0.9] pl-[30px] pr-[10px]"
                      src={nguoi}
                      alt=""
                    />
                    Register
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
        

        <div className="down flex justify-between border-y-2 py-[12px] border-black pr-[10px]">
          <img className="h-24 pl-[40px]" src={logo} alt="" />
          <div className="right flex pl-[30px]">
            <div className="text flex gap-14 pt-[25px] pr-[100px] text-lg">
              <Link to="/" className="hover:border-b-2 border-black">
                Home
              </Link>

              <NavLink to={"/products"} className="hover:border-b-2 border-black">
                Sản phẩm
              </NavLink>

              <NavLink to={"/tintuc"} className="hover:border-b-2 border-black">
                Tin tức
              </NavLink>
              <NavLink to={"/gioithieu"} className="hover:border-b-2 border-black">
                Giới Thiệu
              </NavLink>
            </div>

            <div className="search px-[30px] pt-[23px]">
              <div className="relative">
                <input
                  type="text"
                  className="p-2 pl-8 rounded border border-gray-200 bg-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                  placeholder="search..."
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
        <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Giới Thiệu Về Chúng Tôi</h1>
        <p className="text-lg mb-4">
          Chúng tôi là công ty hàng đầu trong lĩnh vực cung cấp các sản phẩm điện tử công nghệ chất lượng.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center mb-10">
        <div className="w-full md:w-1/2 mb-4 md:mb-0 md:pr-4">
          <img src={logo} alt="Logo" className="w-full h-auto" />
        </div>
        <div className="w-full md:w-1/2 md:pl-4">
          <h2 className="text-3xl font-semibold mb-4">Chúng Tôi Là Ai?</h2>
          <p className="text-lg mb-4">
            Chúng tôi cung cấp những sản phẩm đẹp và chất lượng cho mọi nhu cầu.
          </p>
        </div>
      </div>

      <h2 className="text-3xl font-semibold text-center mb-8">Tầm nhìn và sứ mệnh của Chúng Tôi</h2>

      <div className="flex flex-col md:flex-row items-center mb-8">
        <div className="w-full md:w-1/2 mb-4 md:pr-4">
          <img src={canho} alt="Sản phẩm 1" className="w-full h-64 object-cover rounded-lg" />
        </div>
        <div className="w-full md:w-1/2 md:pl-4">
          <h3 className="text-xl font-semibold mb-2">Giá trị và sự khác biệt</h3>
          <p className="text-gray-700">Với mong muốn phát triển thương hiệu Việt bằng nội lực, Click Mobile đã chú trọng vào mua bán và sửa chữa điện thoại trong nước. Danh mục sản phẩm của Click Mobile thường xuyên được đổi mới và cập nhật, liên tục cung cấp cho khách hàng các dòng sản phẩm theo xu hướng mới nhất. Các sản phẩm thuộc ClickMobile luôn phù hợp với cuộc sống Á Đông, đem đến công nghệ hoàn hảo trong mọi nhu cầu.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center mb-8">
        <div className="w-full md:w-1/2 mb-4 md:pr-4">
          <img src={canho} alt="Sản phẩm 2" className="w-full h-64 object-cover rounded-lg" />
        </div>
        <div className="w-full md:w-1/2 md:pl-4">
          <h3 className="text-xl font-semibold mb-2">Chất lượng và dịch vụ</h3>
          <p className="text-gray-700">Chất lượng của nguyên vật liệu, linh kiện và quy trình sản xuất của Click Mobile đều được kiểm định và giám sát chặt chẽ theo hệ thống quản lý chất lượng ISO 9001. Các sản phẩm của Click Mobile được thiết kế với tiêu chí tối ưu công năng, đảm bảo tính thẩm mỹ và độ bền cao. Trong những năm gần đây, thương hiệu không ngừng đổi mới theo xu hướng công nghệ xanh, mang đến những thiết bị di động không chỉ tiện ích mà còn thân thiện với môi trường, góp phần nâng cao trải nghiệm người dùng và bảo vệ cộng đồng.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center mb-8">
        <div className="w-full md:w-1/2 mb-4 md:pr-4">
          <img src={canho} alt="Sản phẩm 3" className="w-full h-64 object-cover rounded-lg" />
        </div>
        <div className="w-full md:w-1/2 md:pl-4">
          <h3 className="text-xl font-semibold mb-2">Click Mobile và Cộng Đồng</h3>
          <p className="text-gray-700">Đóng góp cho cộng đồng là một phần trong sứ mệnh của Click Mobile. Hướng đến việc trở thành một thương hiệu tiên phong và có trách nhiệm, Click Mobile không ngừng thực hiện các hoạt động vì xã hội, như hỗ trợ trẻ em có hoàn cảnh khó khăn, tham gia các chương trình bảo vệ môi trường, áp dụng công nghệ xanh vào sản phẩm và tổ chức các sự kiện thiện nguyện. Mỗi hành động, mỗi sáng kiến đều là một bước tiến góp phần mang đến một cuộc sống tốt đẹp hơn cho cộng đồng.</p>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-4">Liên Hệ Với Chúng Tôi</h2>
        <p className="text-lg mb-4">
          Nếu bạn có bất kỳ câu hỏi nào, xin vui lòng liên hệ với chúng tôi qua email: 
          <a href="mailto:fptdatn2025@gmail.com" className="text-blue-500"> fptdatn2025@gmail.com</a>.
        </p>
      </div>
    </div>
      </div>
    </>
  );
};

export default Header;
