import { axiosservice } from "../config/API";
import { Inews, InewsLite } from "../interface/news";

// Lấy tất cả bài viết
export const getAllPosts = async (): Promise<InewsLite[] | null> => {
  try {
    const { data } = await axiosservice.get("/posts");
    return data; // API trả về danh sách bài viết
  } catch (error: any) {
    console.error(
      "Error fetching posts:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

// Lấy bài viết theo ID
// Lấy bài viết theo ID
export const getPostById = async (id?: string) => {
    try {
      if (!id) return null; // Tránh gửi yêu cầu nếu không có id
      const { data } = await axiosservice.get(`/post/${id}`);
      return data;
    } catch (error) {
      console.log("Lỗi khi lấy bài viết:", error);
      return null;  // Trả về null nếu có lỗi
    }
  };
  

// Thêm mới bài viết
export const createPost = async (post: Omit<Inews, "_id">): Promise<Inews | null> => {
  try {
    const { data } = await axiosservice.post("/posts/create", post);
    return data.data; // Đảm bảo trả về bài viết mới được tạo
  } catch (error: any) {
    console.error(
      "Error creating post:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

// Xóa bài viết theo ID
export const deletePost = async (id: string): Promise<string | null> => {
  try {
    const { data } = await axiosservice.delete(`/posts/${id}`);
    return data.message; // Trả về thông báo thành công
  } catch (error: any) {
    console.error(
      "Error deleting post:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};

// Cập nhật bài viết theo ID
export const updatePost = async (
  id: string,
  updateData: Partial<Inews>
): Promise<Inews | null> => {
  try {
    const { data } = await axiosservice.put(`/updatePost/${id}`, updateData);
    return data; // API trả về bài viết sau khi cập nhật
  } catch (error: any) {
    console.error(
      "Error updating post:",
      error.response?.data?.message || error.message
    );
    return null;
  }
};
