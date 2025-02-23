import { axiosservice } from "../config/API";
import { IVoucher } from "../interface/voucher";

export const getAllVouchers = async () => {
    try{
  const { data } = await axiosservice.get("/vouchers");
  return data;
} catch (error) {
    console.log(error);
    
};
}

export const addVoucher = async (voucher: any) => {
    try{
        const { data } = await axiosservice.post("/vouchers/add", voucher);
    return data;}
    catch (error) {
        console.log(error);
        
        console.error("Error adding voucher:", error);
        throw error;
    }
}

export const updateVoucher = async (id: string, voucherData: IVoucher) => {
    try {
      const { data } = await axiosservice.put(`/vouchers/${id}`, voucherData);
      return data;
    } catch (error) {
      console.error("Error updating voucher:", error);
      throw error;
    }
  };
  
export const toggleVoucherStatus = async (id: string) => {
    try{
        const { data } = await axiosservice.put(`/vouchers/${id}/toggle`);
    return data;
    }
    catch (error) {
        console.log(error);
        
        console.error("Error toggling voucher status:", error);
        throw error;
    }
    
  };