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
    paymentstatus: string;
    
    createdAt: string;
    confirmedAt?: Date; // Thời điểm xác nhận đơn hàng
    confirmedBy?: string; // Người xác nhận đơn hàng
    cancelReason:{
    reason: String , // Lý do hủy đơn
    canceledAt:  Date , // Thời điểm hủy
    canceledBy: String , // Người thực hiện hủy
    }
    customerDetails: {
      name: string;
      phone: string;
      email: string;
      address: string;
      notes?: string;
      
    }
  }

  export interface Order {
    _id: string;
    createdAt: string;
    amount: number;
    paymentMethod: string;
    paymentstatus: string;
    status: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
    cancelReason?: {
      reason: string;
      canceledAt: string; 
      canceledBy?: string; 
    };
    confirmedAt?: string; 
    confirmedBy?: string; 
  }