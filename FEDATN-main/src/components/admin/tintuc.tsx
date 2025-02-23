import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Popconfirm, message } from "antd";
import LoadingComponent from "../Loading";
import { InewsLite } from "../../interface/news";
import { deletePost, getAllPosts } from "../../service/new";

type Props = {};

const DashboardNews = (props: Props) => {
  const [news, setNews] = useState<InewsLite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      setNews((data || []).reverse());
    } catch (error) {
      console.error("Error fetching news:", error);
      message.error("Lỗi khi tải danh sách tin tức.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const deleteSelectedNews = async (id: string) => {
    try {
      const responseMessage = await deletePost(id);
      if (responseMessage) {
        setNews((prev) => prev.filter((item) => item._id !== id));
        message.success("Xóa bài viết thành công!");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      message.error("Lỗi khi xóa bài viết.");
    }
  };

  const updateNews = (id: string) => {
    navigate(`/admin/News/updatenews/${id}`);
  };

  return (
    <>
      {loading && <LoadingComponent />}
      {contextHolder}
      <div className="flex items-center justify-between px-6 h-[96px] bg-white-600 text-white"></div>

      <NavLink to={"/admin/addNews"}>
        <button className="focus:outline-none text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out font-medium rounded-lg text-sm px-5 py-2.5 mb-6 shadow-md transform hover:scale-105">
          Thêm tin tức mới
        </button>
      </NavLink>

      <div className="mb-6 flex flex-col w-full">
        <div className="overflow-x-auto">
          <div className="py-2 inline-block w-full">
            <div className="overflow-hidden bg-white rounded-lg shadow-lg">
              <table className="min-w-full table-auto border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <tr>
                    <th className="text-sm font-medium text-left px-6 py-4">STT</th>
                    <th className="text-sm font-medium text-left px-6 py-4">Tiêu đề</th>
                    <th className="text-sm font-medium text-left px-6 py-4">Hình ảnh</th>
                    <th className="text-sm font-medium text-left px-6 py-4">Mô tả</th>
                    <th className="text-sm font-medium text-left px-6 py-4">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {news.map((item, index) => (
                    <tr className="hover:bg-gray-100 border-b transition duration-300 ease-in-out" key={item._id}>
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{item.title}</td>
                      <td className="px-6 py-4">
                        <img
                          src={item.img[0]}
                          alt="news"
                          className="w-24 h-16 object-cover rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {item.descriptions.length > 50
                          ? `${item.descriptions.substring(0, 50)}...`
                          : item.descriptions}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateNews(item._id)}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 ease-in-out rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                        >
                          Edit
                        </button>
                        <Popconfirm
                          title="Bạn có chắc muốn xóa?"
                          onConfirm={() => deleteSelectedNews(item._id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <button className="ml-2 text-white bg-red-600 hover:bg-red-700 transition duration-300 ease-in-out rounded-lg text-sm px-5 py-2.5">
                            Xóa
                          </button>
                        </Popconfirm>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardNews;
