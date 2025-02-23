import { axiosservice } from "../config/API";
import { IMaterialLite } from "../interface/material";

export const getAllMaterials = async () => {
  try {
    const { data } = await axiosservice.get("material");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getMaterialByID = async (id?: string) => {
  try {
    const { data } = await axiosservice.get(`/material/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching material by ID:", error);
  }
};

export const addMaterial = async (material: IMaterialLite) => {
  try {
    const { data } = await axiosservice.post("addmaterial", material);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateMaterial = async (id?: string, material?: IMaterialLite) => {
  try {
    const { data } = await axiosservice.put(`/updatematerial/${id}`, material);
    return data;
  } catch (error: any) {
    console.log(
      "Error updating material:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deactivateMaterial = async (id: string) => {
  const { data } = await axiosservice.put(`/material/deactivate/${id}`);
  return data;
};

export const activateMaterial = async (id: string) => {
  const { data } = await axiosservice.put(`/material/activate/${id}`);
  return data;
};
