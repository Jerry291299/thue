import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { IProductLite } from "../interface/products";
import { getAllproducts } from "../service/products";
import Header from "./Header";
import LoadingComponent from "./Loading";
import Footer from "./Footer";

const SearchResults = () => {
  const { searchTerm } = useParams<{ searchTerm: string }>();
  const [filteredProducts, setFilteredProducts] = useState<IProductLite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      setLoading(true);
      try {
        // Gọi API để lấy toàn bộ sản phẩm
        const products: any = await getAllproducts({ limit: 100, page: 1 });

        // Lọc sản phẩm dựa trên từ khóa
        const results: IProductLite[] = products?.docs
          ?.filter((product: IProductLite) =>
            searchTerm
              ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
              : true // Nếu không có từ khóa, trả về tất cả sản phẩm
          )
          .map((product: IProductLite) => ({
            _id: product._id,
            name: product.name,
            img: product.img,
            price: product.price,
            moTa: product.moTa,
            category: product.category,
            status: product.status,
          }));
        setFilteredProducts(results);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterProducts();
  }, [searchTerm]);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <>
      {loading && <LoadingComponent />}
      <Header />
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Search Results for "{searchTerm || "all"}"
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <NavLink to={`/product/${product._id}`} key={product._id}>
                <img
                  src={product.img[0]}
                  alt={product.name}
                  className="h-56 w-full object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h2 className="text-lg font-serif mb-2">{product.name}</h2>
                  <p className="text-sm text-gray-500">
                    {product.category?.name || "No category"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {truncateText(product.moTa, 50)}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    ${product.price}
                  </p>
                </div>
                <div className="p-4">
                  <button className="w-full py-2 text-center bg-gray-100 rounded-lg hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </NavLink>
            ))}
          </div>
        ) : (
          <p>No products found for "{searchTerm || "all"}".</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;
