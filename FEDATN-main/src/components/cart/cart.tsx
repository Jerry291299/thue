import { useContext, useEffect, useState } from "react";
import { Cartcontext } from "../contexts/cartcontext";
import { CartItem } from "../../interface/cart";
import { getCartByID, removeFromCart, updateCartQuantity } from "../../service/cart";
import Header from "../Header";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const Globalstate = useContext(Cartcontext);
  const [userId, setUserId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch cart data based on user ID
  const fetchCartData = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getCartByID(userId);
      if (data) {
        setCartItems(data.items);
      }
    } catch (err) {
      setError("Failed to fetch cart data.");
      console.error("Error fetching cart data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check for price changes
  const checkForPriceChanges = async () => {
    try {
      const response = await axios.post("http://localhost:28017/checkout", {
        userId,
      });
      if (response.status === 400 && response.data.message) {
        toast.error(response.data.message); 
        setCartItems([]); 
        return "priceChanged"; 
      }
    } catch (error: any) {
      console.error("Error during price check:", error.response?.data || error);
      if (error.response?.status === 400 && error.response.data?.message) {
        // toast.error(error.response.data.message); 
        setCartItems([]); 
        return "priceChanged"; 
      }
    }
    return "noChange"; 
  };

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      if (id) {
        setUserId(id);
        fetchCartData(id);
      }
    }
  }, []); 

  useEffect(() => {
    if (userId) {
      checkForPriceChanges();
    }
  }, [userId]); 

  const handleRemove = async (item: CartItem) => {
    try {
      const updatedCart = await removeFromCart(userId as string, item.productId);
      setCartItems(updatedCart.items);
      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng.");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Đã xảy ra lỗi khi xóa sản phẩm.");
    }
  };

  const handleIncrease = async (item: CartItem) => {
    try {
      const response = await fetch(`http://localhost:28017/api/products/${item.productId}`);
      const text = await response.text();

      if (response.ok && text.startsWith("{")) {
        let product;
        try {
          product = JSON.parse(text);

          if (item.quantity + 1 > product.soLuong) {
            toast.error("Sản phẩm không đủ số lượng để thêm vào giỏ hàng.");
            return;
          }

          const updatedItems = cartItems.map((cartItem) =>
            cartItem.productId === item.productId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
          setCartItems(updatedItems);

          const updateResponse = await fetch(`http://localhost:28017/api/cart/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity + 1,
            }),
          });

          if (!updateResponse.ok) {
            throw new Error(`Failed to update cart quantity: ${updateResponse.statusText}`);
          }

          toast.success("Số lượng sản phẩm đã được cập nhật.");
        } catch (parseError) {
          throw new Error("Failed to parse product details as JSON.");
        }
      } else {
        throw new Error("Received invalid response, expected JSON.");
      }
    } catch (error) {
      console.error("Failed to increase quantity:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  const handleDecrease = async (item: CartItem) => {
    try {
      if (item.quantity && item.quantity > 1) {
        const updatedItems = cartItems.map((cartItem) =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: item.quantity - 1 }
            : cartItem
        );
        setCartItems(updatedItems);
        await updateCartQuantity(userId as string, item.productId, item.quantity - 1);
        toast.success("Số lượng sản phẩm đã được cập nhật.");
      } else {
        handleRemove(item);
      }
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
      toast.error("Đã xảy ra lỗi khi giảm số lượng.");
    }
  };

  const total = cartItems.reduce((total, item) => {
    const quantity = item.quantity ?? 0;
    const price = item.price ?? 0;
    return total + price * quantity;
  }, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
  
    try {
      // Check user status
      const userStatusResponse = await axios.get(
        `http://localhost:28017/user/${userId}/status`
      );
  
      const { active, reason } = userStatusResponse.data;
  
      if (!active) {
        toast.error(
          `Your account is deactivated. Reason: ${reason || "Not specified"}`
        );
        return;
      }
  
      const priceCheckResult = await checkForPriceChanges();
  
      if (priceCheckResult === "priceChanged") {
        toast.warning("The price of items in your cart has changed. Please review your cart.");
        return;
      }
  
      if (cartItems.length === 0) {
        toast.info("Your cart is empty.");
        return;
      }
  
      navigate("/order");
    } catch (error) {
      console.error("Failed to check user status:", error);
      toast.error("An error occurred while checking user status.");
    }
  };
  

  return (
    <>
      <Header />
      <div className="w-full font-sans mt-6 md:max-w-7xl max-md:max-w-xl mx-auto bg-white py-8 px-4 md:px-8 rounded-lg shadow-md">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giỏ hàng của bạn</h2>
            <hr className="border-gray-300 mb-6" />

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-4 font-semibold text-gray-700"></th>
                    <th className="p-4 font-semibold text-gray-700"></th>
                    <th className="p-4 font-semibold text-gray-700 uppercase">Sản phẩm</th>
                    <th className="p-4 font-semibold text-gray-700 uppercase">Kích cỡ</th>
                    <th className="p-4 font-semibold text-gray-700 uppercase">Số lượng</th>
                    <th className="p-4 font-semibold text-gray-700 uppercase">Giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">Giỏ hàng đang trống</td>
                    </tr>
                  ) : (
                    cartItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition duration-300">
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleRemove(item)}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200 text-xl"
                            aria-label={`Remove ${item.name}`}
                          >
                            &times;
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="w-20 h-20 shrink-0 bg-white p-2 rounded-md border border-gray-200">
                            <img
                              src={item?.img ? item.img[0] : "/default-image.png"}  // Handle null image
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </td>
                        <td className="p-4 text-gray-700 font-medium">{item.name}</td>
                        <td className="p-4 text-gray-700 font-medium">{item.size}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              className="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition duration-200"
                              onClick={() => handleDecrease(item)}
                            >
                              -
                            </button>
                            <span className="text-gray-800 font-medium">{item.quantity}</span>
                            <button
                              className="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition duration-200"
                              onClick={() => handleIncrease(item)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-lg font-semibold text-gray-800">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <hr className="border-gray-300 mb-6" />
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md md:sticky top-0">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tổng cộng</h2>
            <hr className="border-gray-300 mb-6" />
            <ul className="divide-y">
              <li className="flex justify-between py-2 text-gray-800 font-medium">
                <span>Tổng tiền</span>
                <span className="font-semibold text-lg">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(total)}
                </span>
              </li>
            </ul>
            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-200"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default Cart;
