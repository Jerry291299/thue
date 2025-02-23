import { axiosservice } from '../config/API';

export const createVNPayPayment = async ({userId,  paymentMethod, amount}: {
  userId: string,  paymentMethod: string, amount: any
}) => {
  try {
    console.log("VNPay payment data:", { userId, paymentMethod, amount });
    
    const response = await axiosservice.post("/create-payment", { userId, paymentMethod, amount});
    return response.data.paymentUrl;
  } catch (error) {
    console.error("Failed to create VNPay payment:", error);
    throw error;
  }
};