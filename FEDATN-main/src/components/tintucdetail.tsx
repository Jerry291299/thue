import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostById } from "../service/new"; // Import service API
import { Inews } from "../interface/news";
import canho from "../anh/noi-that-can-ho-cao-cap.jpg"; // Mặc định hình ảnh
import Header from "./Header";
import Footer from "./Footer";

const TintucDetail = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
  const [article, setArticle] = useState<Inews | null>(null); // State chứa bài viết
  const [loading, setLoading] = useState<boolean>(true); // Trạng thái đang tải
  const [error, setError] = useState<string | null>(null); // Trạng thái lỗi

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        const result = await getPostById(id);
        if (result) {
          setArticle(result); // Cập nhật bài viết
          setLoading(false); // Kết thúc trạng thái tải
        } else {
          setError("Không tìm thấy bài viết.");
          setLoading(false);
        }
      }
    };
    fetchPost();
  }, [id]); // Khi ID thay đổi, sẽ gọi lại API

  if (loading) {
    return <p className="text-center text-xl font-semibold">Đang tải...</p>; // Hiển thị khi đang tải
  }

  if (error) {
    return <p className="text-center text-red-600 font-semibold">{error}</p>; // Hiển thị thông báo lỗi
  }

  return (
    <>
    <Header/>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Chi tiết tin tức</h2>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {article ? (
          <>
            {/* Ảnh bài viết */}
            <img
              src={article.img[0] || canho} // Nếu không có ảnh, dùng ảnh mặc định
              alt={article.title}
              className="w-full h-80 object-cover mb-6"
            />
            <div className="px-6 py-4">
              {/* Tiêu đề bài viết */}
              <h1 className="text-3xl font-semibold text-gray-900">{article.title}</h1>
              <p className="mt-4 text-gray-700 text-lg">{article.content}</p>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-700">Không tìm thấy bài viết.</p>
        )}
      </div>
      <div className="mt-8 text-center">
        <Link to="/tintuc" className="text-blue-500 hover:text-blue-700 font-semibold underline">
          Quay lại trang tin tức
        </Link>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default TintucDetail;
