import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  deactivateCategory,
  activateCategory,
  getAllCategories,
} from "../../service/category";
import { Icategory } from "../../interface/category";
import { Popconfirm, Pagination } from "antd";
import LoadingComponent from "../Loading";
import { CSVLink } from "react-csv";

type Props = {};

const Listcategory = (props: Props) => {
  const [categories, setCategory] = useState<Icategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategory(data.reverse());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeactivateCategory = async (id: string) => {
    try {
      await deactivateCategory(id);
      const updatedCategories = categories.map((category) =>
        category._id === id
          ? { ...category, status: "deactive" as "deactive" }
          : category
      );
      setCategory(updatedCategories);
    } catch (error) {
      console.error("Error deactivating category:", error);
    }
  };

  const handleActivateCategory = async (id: string) => {
    try {
      await activateCategory(id);
      const updatedCategories = categories.map((category) =>
        category._id === id
          ? { ...category, status: "active" as "active" }
          : category
      );
      setCategory(updatedCategories);
    } catch (error) {
      console.error("Error activating category:", error);
    }
  };

  const updateCategory = (id: string) => {
    navigate(`updatecategory/${id}`);
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];     

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const csvData = filteredCategories.map((category) => ({
    ID: category._id,
    "Tên danh mục": category.name,
    "Trạng thái": category.status === "active" ? "Hoạt động" : "Vô hiệu hóa",
  }));

  return (
    <>
      {loading && <LoadingComponent />}
      <div className="flex items-center justify-between px-6 h-[96px] bg-white-600 text-white"></div>
      <div className="flex items-center mb-6">
        <div className="flex space-x-4">
          <NavLink to={"/admin/addcategory"}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400">
              Thêm mới
            </button>
          </NavLink>
          <CSVLink
            data={csvData}
            filename={"categories.csv"}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
            target="_blank"
          >
            Xuất file danh mục
          </CSVLink>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600">
                Stt
              </th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600">
                Tên danh mục
              </th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600">
                Trạng thái
              </th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-gray-600">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category, index) => (
                <tr key={category._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {category.name}
                  </td>
                  <td className="py-3 px-6 text-sm">
                    {category.status === "active" ? (
                      <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs">
                        Vô hiệu hóa
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateCategory(category._id)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-1 px-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      >
                        Sửa
                      </button>
                      {category.status === "active" ? (
                        <Popconfirm
                          title="Vô hiệu hóa danh mục"
                          onConfirm={() =>
                            handleDeactivateCategory(category._id)
                          }
                          okText="Có"
                          cancelText="Không"
                        >
                          <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400">
                            Vô hiệu hóa
                          </button>
                        </Popconfirm>
                      ) : (
                        <Popconfirm
                          title="Kích hoạt danh mục"
                          onConfirm={() => handleActivateCategory(category._id)}
                          okText="Có"
                          cancelText="Không"
                        >
                          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400">
                            Kích hoạt
                          </button>
                        </Popconfirm>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6">
        <Pagination
          current={currentPage}
          total={filteredCategories.length}
          pageSize={itemsPerPage}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          className="pagination-custom"
        />
      </div>
    </>
  );
};

export default Listcategory;
