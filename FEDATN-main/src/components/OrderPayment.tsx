import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { getCartByID } from "../service/cart";

import { NavLink, useNavigate } from "react-router-dom";
import { IOrderData, placeOrder } from "../service/order";
import { createVNPayPayment } from "../service/payment";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Ensure ICartItem matches your updated schema
interface ISubVariant {
  specification: string;
  value: string;
}

interface ICartItem {
  productId: string; // Assuming string since it’s populated as ObjectId.toString()
  name: string;
  price: number;
  img: string;
  quantity: number;
  color: string;
  subVariant?: ISubVariant;
}

function OrderPayment() {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [profileData, setProfileData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      setUser(id);
      fetchCartData(id);
      fetchUserProfile(id);
    }
  }, []);

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:28017/user/${id}`);
      if (response.data) {
        setProfileData({
          name: response.data.name || "",
          address: response.data.address || "",
          phone: response.data.phone || "",
          email: response.data.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    if (profileData.name || profileData.phone || profileData.email || profileData.address) {
      setCustomerDetails((prevDetails) => ({
        ...prevDetails,
        name: profileData.name || prevDetails.name,
        phone: profileData.phone || prevDetails.phone,
        email: profileData.email || prevDetails.email,
        address: profileData.address || prevDetails.address,
      }));
    }
  }, [profileData]);

  const fetchCartData = async (userId: string) => {
    try {
      const data = await getCartByID(userId);
      if (data) {
        setCartItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:28017/voucher/apply", { code: voucherCode });
      setDiscount(response.data.discountAmount);
      toast.success(`Áp dụng mã giảm giá thành công! Giảm ${response.data.discountAmount} VND.`);
    } catch (error) {
      toast.error("Không thể áp dụng mã giảm giá.");
    }
  };

  const total = cartItems.reduce((total, item) => {
    const quantity = item.quantity ?? 0;
    const price = item.price ?? 0;
    return total + price * quantity;
  }, 0);

  const discountedTotal = Math.max(0, total - discount);

  const handleOrderSubmit = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const orderData: IOrderData = {
      userId: user,
      items: cartItems,
      amount: discountedTotal,
      paymentMethod: selectedPaymentMethod,
      customerDetails: customerDetails,
    };

    const updateProductQuantities = async (items: ICartItem[]) => {
      try {
        for (const item of items) {
          console.log(`Processing item: ${item.productId}, Quantity to order: ${item.quantity}`);
    
          const response = await fetch(
            `http://localhost:28017/api/products-pay/${item.productId}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );
          if (!response.ok) {
            const error = await response.json();
            console.error(`GET failed for ${item.productId}:`, error);
            toast.error(error.message || "Không thể lấy thông tin sản phẩm.");
            return false;
          }
          const product = await response.json();
          console.log("Product data:", product);
    
          const variant = product.variants.find((v: any) => v.color === item.color);
          if (!variant) {
            console.error(`Variant not found for ${item.productId}, color: ${item.color}`);
            toast.error(`Không tìm thấy biến thể cho sản phẩm ${item.name}.`);
            return false;
          }
    
          let subVariant;
          if (item.subVariant) {
            subVariant = variant.subVariants.find(
              (sv: any) =>
                sv.specification === item.subVariant?.specification &&
                sv.value === item.subVariant?.value
            );
            if (!subVariant) {
              console.error(`SubVariant not found for ${item.productId}`);
              toast.error(`Không tìm thấy tùy chọn cho sản phẩm ${item.name}.`);
              return false;
            }
          }
    
          const availableQuantity = subVariant ? subVariant.quantity : variant.quantity || 0;
          console.log(`Available quantity: ${availableQuantity}`);
          if (availableQuantity < item.quantity) {
            toast.error(`Sản phẩm ${item.name} không đủ số lượng trong kho.`);
            return false;
          }
    
          const updatedQuantity = availableQuantity - item.quantity;
          console.log(`New quantity: ${updatedQuantity}`);
    
          const updatePayload = {
            quantity: updatedQuantity,
            color: item.color,
            subVariant: item.subVariant ? {
              specification: item.subVariant.specification,
              value: item.subVariant.value,
            } : undefined,
          };
          console.log("Update payload:", updatePayload);
    
          const updateResponse = await fetch(
            `http://localhost:28017/api/products/${item.productId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatePayload),
            }
          );
    
          if (!updateResponse.ok) {
            const error = await updateResponse.json();
            console.error(`PUT failed for ${item.productId}:`, error);
            toast.error(
              error.message || `Không thể cập nhật số lượng cho sản phẩm ${item.name}.`
            );
            return false;
          }
    
          const updatedProduct = await updateResponse.json();
          console.log(`Updated product response:`, updatedProduct);
        }
        return true;
      } catch (error) {
        console.error("Unexpected error updating quantities:", error);
        toast.error("Không thể cập nhật số lượng sản phẩm trong kho.");
        return false;
      }
    };

    try {
      await updateProductQuantities(cartItems);
      if (selectedPaymentMethod === "cash_on_delivery") {
        await placeOrder(orderData);
        toast.success(
          "Cảm ơn bạn! Đơn hàng của bạn đã được xác nhận thành công.",
          { position: "top-right" }
        );
        setCartItems([]);
        navigate("/success", { state: { orderData } });
      } else if (selectedPaymentMethod === "vnpay") {
        await placeOrder(orderData);
        const paymentUrl = await createVNPayPayment({
          userId: user,
          paymentMethod: selectedPaymentMethod,
          amount: discountedTotal,
        });
        setCartItems([]);
        window.location.href = paymentUrl; // Redirect to VNPay
      }
    } catch (error) {
      toast.error(
        "Rất tiếc! Đã có lỗi xảy ra khi xác nhận đơn hàng. Vui lòng thử lại.",
        { position: "top-right" }
      );
    }
  };

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 bg-gray-100">
        {/* Left Column */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4">Địa chỉ giao hàng</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Họ và tên *</label>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Địa chỉ email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={customerDetails.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 p-2 rounded-md"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold">Thông tin thêm</h3>
              <textarea
                name="notes"
                value={customerDetails.notes}
                onChange={handleInputChange}
                className="mt-2 block w-full border border-gray-300 p-2 rounded-md"
                rows={4}
                placeholder="Lưu ý cho đơn hàng"
              ></textarea>
            </div>
          </form>

          <h2 className="text-lg font-bold mt-8">Phương thức thanh toán</h2>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handlePaymentMethodChange("cash_on_delivery")}
              className={`w-full border p-4 rounded-md flex items-center justify-center ${
                selectedPaymentMethod === "cash_on_delivery"
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="text-lg font-medium">
                Thanh toán khi nhận hàng
              </span>
            </button>
            <button
              onClick={() => handlePaymentMethodChange("vnpay")}
              className={`w-full border p-4 rounded-md flex items-center justify-center ${
                selectedPaymentMethod === "vnpay"
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="text-lg font-medium">VNPay</span>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Giỏ hàng ({cartItems.length} sản phẩm)
          </h2>
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between mb-4"
            >
              <div className="flex items-center">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-16 h-16 rounded-md mr-4"
                />
                <div>
                  <span>{item.name}</span>
                  <p className="text-sm text-gray-500">
                    {item.color}{" "}
                    {item.subVariant ? `(${item.subVariant.value} ${item.subVariant.specification})` : ""}
                  </p>
                </div>
              </div>
              <span className="font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.price)}{" "}
                x {item.quantity}
              </span>
            </div>
          ))}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Tổng cộng</span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(total)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Giảm giá</span>
                <span>
                  -{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(discount)}
                </span>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium">Mã giảm giá</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-md"
                  placeholder="Nhập mã giảm giá"
                />
                <button
                  onClick={handleApplyVoucher}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Thành tiền</span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(discountedTotal)}
              </span>
            </div>
          </div>

          {/* Order confirmation button */}
          <div className="mt-6 flex justify-between items-center">
            <NavLink to={`/Cart/${user}`} className="text-blue-500">
              Quay về giỏ hàng
            </NavLink>
            <button
              onClick={handleOrderSubmit}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderPayment;