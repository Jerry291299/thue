import { useEffect, useState } from "react";
import { getAllPosts } from "../service/new"; // Adjust the path based on your file structure
import { InewsLite } from "../interface/news";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Tintuc = () => {
  const [user, setUser] = useState<{
    info: { role: string; email: string; id: string };
    id: string;
  } | null>(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [articles, setArticles] = useState<InewsLite[]>([]); // State to store fetched articles
  const Navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getAllPosts();
      if (posts) {
        setArticles(posts); // Set the articles if fetched successfully
      }
    };

    fetchPosts(); // Call the function to fetch posts
  }, []); // Empty dependency array to run only once when the component mounts

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
      <Header />
      <div className="container mx-auto w-full">
        <main className="my-5">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Tin Tức</h1>
          {/* Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length === 0 ? (
              <p className="text-center text-lg text-gray-500">Không có bài viết nào.</p>
            ) : (
              articles.map((article) => (
                <Link
                  key={article._id}
                  to={`/tintuc/${article._id}`}
                  className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <img
                    src={article.img[0]} // Default to canho if no image
                    alt={article.title}
                    className="w-full h-48 object-cover transition-all duration-300 transform hover:scale-110"
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-900">{article.title}</h2>
                    <p className="mt-3 text-gray-600">{article.content.slice(0, 100)}...</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Tintuc;
