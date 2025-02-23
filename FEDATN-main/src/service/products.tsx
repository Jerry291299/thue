import React from "react";
import { axiosservice } from "../config/API";
import { IVariant, IProductLite } from "../interface/products";
import axios from "axios";

export const getAllproducts = async ({
  limit = 10,
  page = 1,
  admin = "",
  category,
}: {
  limit: number;
  page: number;
  admin?: string;
  category?: string;
  variants?: IVariant[];
}) => {
  try {
    const { data } = await axiosservice.get(
      admin === "true"
        ? `product-test?page=${page}&limit=${limit}&admin=${admin}`
        : `product-test?page=${page}&limit=${limit}`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductByID = async (id?: string) => {
  try {
    const { data } = await axiosservice.get(`/product/${id}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addProduct = async (payload: any) => {
  try {
    const response = await axios.post("http://localhost:28017/product/add", payload);
    return response.data; 
  } catch (error) {
    console.error("Error adding product:", error);
    throw error; 
  }
};


export const updateProduct = async (id?: string, product?: IProductLite) => {
  try {
    const { createdAt, updatedAt, ...productData } = product || {};
    const { data } = await axiosservice.put(`product/${id}`, product);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const DeleteProduct = async (pid: string) => {
  try {
    const { data } = await axiosservice.delete(`/product/${pid}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Hàm kích hoạt sản phẩm
export const ActivateProduct = async (pid: string) => {
  try {
    const { data } = await axiosservice.put(`/product/activate/${pid}`);
    return data;
  } catch (error) {
    console.log("Error activating product:", error);
  }
};

// Hàm vô hiệu hóa sản phẩm
export const DeactivateProduct = async (pid: string) => {
  try {
    const { data } = await axiosservice.put(`/product/deactivate/${pid}`);
    return data;
  } catch (error) {
    console.log("Error deactivating product:", error);
  }
};

// hàm lọc sản phẩm theo danh mục
export const getProductsByCategory = async (categoryId: string) => {
  try {
    const { data } = await axiosservice.get(`/products/category/${categoryId}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const calculateTotalQuantity = (variants?: IVariant[]): number => {
  if (!variants) return 0;
  return variants.reduce((total, variant) => total + variant.quantity, 0);
};
// service/products.ts
export const checkProductExistence = async (masp: string, name: string) => {
  try {
    const response = await fetch(
      `/api/products/check-existence?masp=${masp}&name=${name}`
    );
    const data = await response.json();
    return data; // Trả về true nếu tồn tại, false nếu không tồn tại
  } catch (error) {
    console.error("Error checking product existence:", error);
    return { exists: false }; // Mặc định là không tồn tại
  }
};
