import { axiosservice } from '../config/API';
import { CartItem } from '../interface/cart';
export interface Order {
  _id: string;
  createdAt: string;
  amount: number;
  paymentMethod: string;
  paymentstatus: string;
  status: string;
  cancelReason:{
    reason: String , // Lý do hủy đơn
    canceledAt:  Date , // Thời điểm hủy
    canceledBy: String , // Người thực hiện hủy
    }
    confirmedAt?: Date; // Thời điểm xác nhận đơn hàng
    confirmedBy?: string; // Người xác nhận đơn hàng
    receivedAt?: Date; // Thời điểm nhận hàng
    receivedBy?: string; // Người xác nhận đã nhận
}
export interface IOrderData {
    userId: string;
    items: CartItem[];
    amount: number;
    paymentMethod: string;
    confirmedAt?: Date; // Thời điểm xác nhận đơn hàng
    confirmedBy?: string; // Người xác nhận đơn hàng
    receivedAt?: Date; // Thời điểm nhận hàng
    receivedBy?: string; // Người xác nhận đã nhận
    customerDetails: {   // Add customer details to the interface
      name: string;
      phone: string;
      email: string;
      address: string;
      notes: string;
    };
  }
  export interface IOrder {
    _id: string;
    userId: { name: string; email: string };
    items: {
      productId: { name: string; price: number; img: string[] };
      name: string;
      price: number;
      quantity: number;
    }[];
    amount: number;
    status: string;
    createdAt: string;
    cancelReason:{
      reason: String , // Lý do hủy đơn
      canceledAt:  Date , // Thời điểm hủy
      canceledBy: String , // Người thực hiện hủy
      receivedAt?: Date; // Thời điểm nhận hàng
      receivedBy?: string; // Người xác nhận đã nhận
      }
    customerDetails: {
      name: string;
      phone: string;
      email: string;
      address: string;
      notes?: string;
    };
  }
  export interface IOrderShipper {
    paymentstatus: string;
    _id: string;
    userId: { name: string; email: string };
    items: {
      productId: { _id: string;name: string; price: number; img: string[] };
      name: string;
      price: number;
      quantity: number;
    }[];
    amount: number;
    status: string;
    createdAt: string;
    cancelReason:{

    }
    customerDetails: {
      name: string;
      phone: string;
      email: string;
      address: string;
      notes?: string;
    };
    paymentMethod: string;
  }
  
  

// Function to submit the order
export const placeOrder = async (orderData: IOrderData) => {
  try {
    const response = await axiosservice.post('/order/confirm', orderData);
    return response.data; // Returns the order confirmation or status
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};



export const getOrdersByUserId = async (userId: string) => {
  try {
    const response = await axiosservice.get(`/orders/${userId}`);
    return response.data.orders;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const response = await fetch(`http://localhost:28017/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error("Could not fetch the order. Please try again later.");
    }
    const orderData = await response.json();
    return orderData; // Return the order data
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw new Error("Could not fetch the order. Please try again later.");
  }
};


