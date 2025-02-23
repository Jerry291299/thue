import React, { useContext, useEffect, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import axios from "axios";
import { Cartcontext } from "./contexts/cartcontext";

const Success = () => {
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const vnpAmount = queryParams.get("vnp_Amount");
  const vnp_OrderInfo = queryParams.get("vnp_OrderInfo");
  const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
  const vnp_SecureHash = queryParams.get("vnp_SecureHash");
  const vnp_TransactionNo = queryParams.get("vnp_TransactionNo");
  const vnpResponseCode = queryParams.get("vnp_ResponseCode");
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const Globalstate = useContext(Cartcontext);
  const [tongtien, setTongtien] = useState<string>(
    (Number(vnpAmount) / 100 ).toString() || ""
  );

  console.log(location);

  // Parse the query string to extract VNPay parameters

  const isPaymentSuccessful = vnpResponseCode === "00";

  useEffect(() => {
    if (location.state) {
      setMessage("Thanh toán tiền mặt thành công");
      console.log(location.state?.orderData?.amount, "state data");

      setTongtien(location.state?.orderData?.amount.toString());
    } else {
      if (isPaymentSuccessful) {
        handleConfirmPayment();
        setMessage("Thanh toán VNPay thành công");
      }
    }
  }, [isPaymentSuccessful]);

  console.log(!location.state && isPaymentSuccessful, "state thong bao");

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);

      console.log(id,"id user");

      if (id) {
        
        setUserId(id);
      }

    }
  }, [userId]);

  const handleConfirmPayment = async () => {
    try {
      const userData = sessionStorage.getItem("user");
      if(!userData) {
        return
      }
      console.log(Globalstate, "globalstate");
 
      const customerDetails = JSON.parse(
        sessionStorage.getItem("customerDetails") || "{}"
      );

      const response = await axios.post(
        "http://localhost:28017/order/confirmvnpay",
        {
          userId: userData? JSON.parse(userData).id:"",
          vnp_Amount: Number(vnpAmount) / 100,
          vnp_OrderInfo,
          vnp_ResponseCode,
          vnp_TransactionNo,
          vnp_SecureHash,
          // customerDetails,
          // items: cartItems,
          paymentMethod: "vnpay", 
        }
      );

      if (response.status === 201) {
        console.log("Order placed successfully:", response.data);
        // Clear session cart data
        sessionStorage.removeItem("cartItems");
        sessionStorage.removeItem("customerDetails");
      } else {
        console.error("Failed to place order:", response.data.message);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  return (
    <>
      <Header />

      <div className="flex flex-col items-center p-4 lg:p-8 bg-gray-100">
        <div className="text-center bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl w-full">
          <>
            <h1 className="text-lg font-bold">{message}</h1>

            <p className="text-sm mt-2">
              Cảm ơn bạn đã mua sắm tại Beautifullhouse. Đơn hàng của bạn đã
              được thanh toán thành công với mã giao dịch:{" "}
              <span className="font-bold">{vnp_TransactionNo}</span>.
            </p>
            <p className="text-sm mt-2">
              Tổng số tiền:{" "}
              <span className="font-bold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(tongtien) / 1)}
              </span>
              .
            </p>
            <p className="text-sm mt-2">
              Mô tả: <span className="font-medium">{vnp_OrderInfo}</span>
            </p>
          </>
          <div className="flex justify-center gap-4 mt-6">
            <NavLink to="/products">
              <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-100">
                Tiếp tục mua hàng
              </button>
            </NavLink>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Success;
