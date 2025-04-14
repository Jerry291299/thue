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
import Header from "./Header";
import Footer from "./Footer";
const Gioithieu = () => {
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
   <Header/>
      <div className="container mx-auto w-full">
        
        
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
    <Footer/>
    </>
  );
};

export default Gioithieu;
