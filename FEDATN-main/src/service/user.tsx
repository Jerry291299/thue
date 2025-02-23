import React from "react";
import { axiosservice } from "../config/API";
import { IUserLogin, IUserRegister, IUserLite } from "../interface/user";
import axios from "axios";

export const getAllusersAccount = async () => {
  try {
    const { data } = await axiosservice.get("usersaccount");

    // console.log('getAllusers', data);

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const UserLogin = async (datauser: IUserLogin) => {
  try {
    const { data } = await axiosservice.post("/login", datauser);

    // Kiểm tra dữ liệu trả về từ server
    if (data && data.isActive === false) {
      throw new Error("Account is deactivated");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    // Nếu có lỗi do server trả về
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "An error occurred";
      throw new Error(message); // Trả lại thông báo lỗi từ server
    }
    throw error; // Trả lại lỗi khác
  }
};

export const UserRegister = async (datauser: IUserRegister) => {
  try {
    const { data } = await axiosservice.post("/register", datauser);
    return data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

export const deactivateUser = async (_id: string, reason: string) => {
  try {
    const { data } = await axiosservice.put(`/user/deactivate/${_id}`, { reason });
    return data;
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw new Error("Không thể vô hiệu hóa người dùng. Vui lòng thử lại sau.");
  }
};
export const getDeactivationHistory = async () => {
  try {
    const response = await fetch('/api/user/deactivation-history');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching deactivation history:", error);
    throw error;
  }
};

export const activateUser = async (_id: string) => {
  try {
    const { data } = await axiosservice.put(`/user/activate/${_id}`);
    return data;
  } catch (error) {
    console.error("Error activating user:", error);
    throw new Error("Không thể kích hoạt lại người dùng. Vui lòng thử lại sau.");
  }
};

export const updateUser = async (_id: string, newRole: string) => {
  try {
    const response = await axiosservice.put(`/admin/user/${_id}`, { role: newRole });
    return response.data; // Ensure this returns the updated user data
  } catch (error) {
    // console.error("Error updating user in API:", error);
    throw error; // Rethrow to handle in the calling function
  }
};

export const getUserById = async (_id?: string) => {
  try {
    const { data } = await axiosservice.get(`/user/${_id}`);
    // console.log(_id);
    return data;
  } catch (error) {
    console.log(error);
  }
};
