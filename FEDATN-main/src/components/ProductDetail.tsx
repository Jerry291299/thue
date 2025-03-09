import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import { IUser } from "../interface/user";
import { addtoCart } from "../service/cart";
import {
  getAllproducts,
  getProductByID,
} from "../service/products";
import Header from "./Header";
import Footer from "./Footer";
import { actions, Cartcontext } from "./contexts/cartcontext";
import { Icart } from "../interface/cart";
import CommentSection from "../components/CommentProduct";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Update interfaces to match your new schema
interface ISubVariant {
  specification: string;
  value: string;
  additionalPrice: number;
  quantity: number;
}

interface IVariant {
  color: string;
  basePrice: number;
  discount?: number;
  quantity: number;
  subVariants: ISubVariant[];
}

interface Iproduct {
  _id: string;
  masp: string;
  name: string;
  img: string[];
  moTa: string;
  brand: string;
  category: string;
  status: boolean;
  variants: IVariant[];
  createdAt: string;
  updatedAt: string;
  comments?: { stars: number }[];
}

const ProductDetail = () => {
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Iproduct | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedSubVariant, setSelectedSubVariant] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const Globalstate = useContext(Cartcontext);
  const [user, setUser] = useState<IUser | null>(null);
  const dispatch = Globalstate.dispatch;

  // Fetch user info
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser: IUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  // Fetch product details
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const data = await getProductByID(id);
        setProduct(data);
        if (Array.isArray(data.img) && data.img.length > 0) {
          setSelectedImage(data.img[0]);
        }
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(0);
          setSelectedColor(data.variants[0].color);
          if (data.variants[0].subVariants.length > 0) {
            setSelectedSubVariant(0);
          }
        }
      } catch (error) {
        console.log("Failed to fetch product by ID", error);
      }
    };
    fetchProductData();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const sanpham = await getAllproducts({ limit: 4, page: 1 });
        setProducts(sanpham.docs || []);
      } catch (error) {
        console.log("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle variant and sub-variant changes
  const handleVariantChange = (index: number) => {
    setSelectedVariant(index);
    setSelectedSubVariant(0); // Reset sub-variant selection
    if (product && product.img && product.img[index]) {
      setSelectedImage(product.img[index]);
    }
    if (product && product.variants[index]) {
      setSelectedColor(product.variants[index].color);
    }
  };

  const handleSubVariantChange = (index: number) => {
    setSelectedSubVariant(index);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (!product || !product.variants) return;
    const variantIndex = product.variants.findIndex((v) => v.color === color);
    if (variantIndex !== -1) {
      setSelectedVariant(variantIndex);
      setSelectedSubVariant(0); // Reset sub-variant selection
      setSelectedImage(product.img?.[variantIndex] || null);
    }
  };

  const calculateTotalQuantity = (variants: IVariant[] = [], variantIndex: number | null, subVariantIndex: number | null): number => {
    if (!variants || variantIndex === null || subVariantIndex === null) return 0;
    const selectedVariant = variants[variantIndex];
    const selectedSubVariant = selectedVariant.subVariants[subVariantIndex];
    return selectedSubVariant ? selectedSubVariant.quantity : 0;
  };

  const calculateTotalPrice = (variant: IVariant, subVariantIndex: number | null): number => {
    if (subVariantIndex === null) return 0;
    const subVariant = variant.subVariants[subVariantIndex];
    const totalPrice = variant.basePrice + (subVariant.additionalPrice || 0);
    const discount = variant.discount || 0;
    return totalPrice - discount;
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="container mx-auto w-[1400px] pt-[100px]">
        {product && (
          <div className="container mx-auto w-[1300px] flex">
            {/* Small images */}
            <div className="flex flex-col gap-4">
              {Array.isArray(product.img) &&
                product.img.map((image, index) => (
                  <img
                    key={index}
                    className={`w-[150px] h-[150px] object-cover rounded-lg border ${selectedImage === image ? "border-blue-500" : "border-gray-200"} cursor-pointer`}
                    src={image}
                    alt={`Product image ${index + 1}`}
                    onClick={() => setSelectedImage(image)}
                  />
                ))}
            </div>

            {/* Large image */}
            <div className="ml-[40px] mr-[30px]">
              {selectedImage && (
                <img
                  className="w-[690px] h-[690px] object-cover rounded-lg border border-gray-200"
                  src={selectedImage}
                  alt={product.name}
                />
              )}
            </div>

            {/* Product info */}
            <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
              <h1 className="text-xl font-bold text-black-800">{product.name}</h1>

            

              {/* Color selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="my-4">
                  <h2 className="text-lg font-medium">Màu sắc:</h2>
                  <div className="flex gap-4">
                    {Array.from(new Set(product.variants.map((v) => v.color))).map((color, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? "border-blue-500" : "border-gray-300"}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        onClick={() => handleColorChange(color)}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-variant selection */}
              {selectedVariant !== null && product.variants && product.variants[selectedVariant]?.subVariants.length > 0 && (
                <div className="my-4">
                  <h2 className="text-lg font-medium">Tùy chọn:</h2>
                  <div className="flex gap-4 overflow-x-auto">
                    {product.variants[selectedVariant].subVariants.map((subVariant, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-md ${selectedSubVariant === index ? "bg-blue-200" : "bg-white text-black"}`}
                        onClick={() => handleSubVariantChange(index)}
                        aria-pressed={selectedSubVariant === index}
                      >
                        {subVariant.value} ({subVariant.specification})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price and Quantity */}
              <div className="my-4">
                <div className="flex items-baseline">
                  <span className="text-xl font-semibold text-red-600">
                    {"Giảm giá: "}
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      product.variants && selectedVariant !== null ? product.variants[selectedVariant].discount || 0 : 0
                    )}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-black-600">
                    {"Giá: "}
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      product.variants && selectedVariant !== null && selectedSubVariant !== null
                        ? calculateTotalPrice(product.variants[selectedVariant], selectedSubVariant)
                        : 0
                    )}
                  </span>
                </div>
                <p className="font-bold text-gray-600">
                  Số lượng:{" "}
                  <span
                    className={`font-semibold ${calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) > 0
                      ? `${calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant)} sản phẩm`
                      : "Hết hàng"}
                  </span>
                </p>
                <p className="font-bold text-gray-500 mt-2">
                  Tình trạng:{" "}
                  <span
                    className={`font-semibold ${calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-md border-2 border-transparent px-12 py-3 text-center text-base font-bold text-white transition-all duration-200 ease-in-out ${
                  calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) > 0
                    ? "bg-gray-900 hover:bg-orange-400"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={async () => {
                  if (!product || !product._id) {
                    toast.error("Mã sản phẩm không hợp lệ!");
                    return;
                  }
                  if (!user || !user.id) {
                    toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
                    return;
                  }
                  if (calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) <= 0) {
                    toast.warning("Sản phẩm này đã hết hàng. Vui lòng chọn sản phẩm khác.");
                    return;
                  }

                  const selectedVariantData = product.variants[selectedVariant!];
                  const selectedSubVariantData = selectedVariantData.subVariants[selectedSubVariant!];

                  const cartItem: Icart = {
                    userId: user.id,
                    items: [
                      {
                        productId: String(product._id),
                        name: product.name,
                        price: calculateTotalPrice(selectedVariantData, selectedSubVariant),
                        img: product.img[0],
                        quantity: 1,
                        color: selectedVariantData.color,
                        subVariant: {
                          specification: selectedSubVariantData.specification,
                          value: selectedSubVariantData.value,
                        },
                      },
                    ],
                  };
                  try {
                    const response = await addtoCart(cartItem);
                    dispatch({ type: actions.ADD, payload: response });
                    toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
                  } catch (error: any) {
                    if (error.response && error.response.status === 400) {
                      toast.error("Sản phẩm đã có trong giỏ hàng!");
                    } else {
                      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
                    }
                    console.error("Không thể thêm sản phẩm vào giỏ hàng", error);
                  }
                }}
                disabled={calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) <= 0}
              >
                {calculateTotalQuantity(product.variants, selectedVariant, selectedSubVariant) > 0 ? "Add to cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        )}

        {/* Product description */}
        <div>
          {product && (
            <div className="my-6 p-6 bg-gray-100 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-black mb-4">Mô tả sản phẩm</h2>
              {product.moTa ? (
                <div className="text-gray-800 text-base leading-relaxed">
                  <div className="img flex gap-2">
                    <img className="w-[50%]" src={product.img[2]} alt="" />
                    <img className="w-[50%]" src={product.img[3]} alt="" />
                  </div>
                  <div className="mota">{product.moTa}</div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có mô tả cho sản phẩm này.</p>
              )}
            </div>
          )}
        </div>

        {/* Warranty and Shipping */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-8">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4 uppercase tracking-wider text-blue-600">
              Chính Sách Bảo Hành & Vận Chuyển - Click Mobile
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Bảo Hành</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Tất cả sản phẩm tại Click Mobile đều là hàng chính hãng, được kiểm định chất lượng trước khi đến tay khách hàng.</li>
                <li>Click Mobile áp dụng chính sách bảo hành từ 6 tháng đến 12 tháng tùy theo từng sản phẩm.</li>
                <li>Nếu sản phẩm gặp lỗi kỹ thuật do nhà sản xuất, khách hàng có thể liên hệ ngay với Click Mobile để được hỗ trợ sửa chữa hoặc đổi mới.</li>
                <li>Không tự ý tháo lắp hoặc sửa chữa sản phẩm khi gặp lỗi, hãy liên hệ Click Mobile qua hotline 0344357227 để được hướng dẫn chi tiết.</li>
                <li className="text-red-600">Lưu ý: Click Mobile không bảo hành các trường hợp hư hỏng do rơi vỡ, vào nước, tác động ngoại lực hoặc sử dụng sai cách.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Vận Chuyển</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Click Mobile hỗ trợ giao hàng toàn quốc với nhiều hình thức vận chuyển linh hoạt.</li>
                <li>Miễn phí giao hàng trong khu vực nội thành TP. Hà Nội với đơn hàng trên 2 triệu VNĐ.</li>
                <li>Đối với các tỉnh thành khác, phí vận chuyển sẽ được tính theo bảng giá của đơn vị vận chuyển.</li>
                <li>Thời gian giao hàng từ 2-5 ngày tùy theo khu vực. Đơn hàng tại nội thành Hà Nội có thể được giao trong ngày.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar products */}
        <div className="border-t-2 border-black mt-[40px]"></div>
        <section className="py-10">
          <h1 className="mb-12 text-center font-sans text-4xl font-bold">Sản phẩm tương tự</h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8 mt-[30px] mb-[50px] px-[20px] md:px-[40px] lg:px-[60px]">
            {products.slice(0, 8).map((product: Iproduct) => (
              <article key={product._id} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-all">
                <NavLink to={`/product/${product._id}`}>
                  <img src={product.img[0]} alt={product.name} className="h-56 w-full object-cover rounded-t-lg" />
                  <div className="p-4">
                    <h2 className="text-lg font-serif mb-2">{product.name}</h2>
                    <p className="text-sm text-gray-500">{truncateText(product.moTa, 50)}</p>
                    <p className="text-xl font-bold text-red-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        product.variants && product.variants.length > 0
                          ? product.variants[0].basePrice + (product.variants[0].subVariants[0]?.additionalPrice || 0)
                          : 0
                      )}
                    </p>
                  </div>
                  <div className="p-4">
                    <button className="w-full py-2 text-center bg-gray-100 rounded-lg hover:bg-gray-200">View Details</button>
                  </div>
                </NavLink>
              </article>
            ))}
          </div>
        </section>

        <div className="pt-[50px]">
          {user ? <CommentSection productId={id || ""} user={user} /> : <p className="text-gray-500">Bạn cần đăng nhập để bình luận.</p>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;