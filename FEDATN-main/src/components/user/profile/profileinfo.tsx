import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { upload } from "../../../service/upload";
import { notification } from "antd";
import LoadingComponent from "../../Loading";

type Props = {};

const Profileinfo = (props: Props) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [profileData, setProfileData] = useState({
    img: "",
    name: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    role: "", // Default role
  });

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const showNotification = (
    type: "success" | "error",
    title: string,
    description: string
  ) => {
    notification[type]({
      message: title,
      description,
      placement: "topRight",
    });
  };

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      if (id) {
        setUserId(id);
        // Fetch user profile
        fetchUserProfile(id);
      }
    }
  }, []);

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:28017/user/${id}`);
      if (response.data) {
        const formattedDob = response.data.dob
          ? new Date(response.data.dob).toISOString().split("T")[0]
          : "";
        setProfileData({
          img: response.data.img || "",
          name: response.data.name || "",
          dob: formattedDob,
          gender: response.data.gender || "",
          address: response.data.address || "",
          phone: response.data.phone || "",
          role: response.data.role || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles); // Replace existing files for single profile picture
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("images", file);
    
      try {
        const response = await upload(formData);
        const imageUrl = response.payload[0].url;
        urls.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification("error", "Lỗi tải ảnh", "Không thể tải ảnh lên, vui lòng thử lại!");
      }
    }
    return urls;
  };

  const handleSave = async () => {
    setLoading(true);
    if (!userId) {
      alert("User ID not found");
      return;
    }
  
    try {
      // Upload images if there are new files
      let uploadedImageUrl = profileData.img;
      if (files.length > 0) {
        const uploadedUrls = await uploadImages(files);
        if (uploadedUrls.length > 0) {
          uploadedImageUrl = uploadedUrls[0]; // Assuming only one profile image
        }
      }
  
      // Update the profileData with the new image URL
      const updatedProfileData = { ...profileData, img: uploadedImageUrl };
  
      // Send the updated profile data to the server
      const response = await axios.put(`http://localhost:28017/updateProfile/${userId}`, updatedProfileData);
  
      showNotification("success", "Thành công", "Cập nhật thông tin thành công!");
      setProfileData(updatedProfileData);
      console.log("Updated profile:", response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    if (!userId) {
      alert("User ID not found");
      return;
    }
  
    if (newPassword !== confirmNewPassword) {
      showNotification("error", "Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp!");
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.put(`http://localhost:28017/change-password/${userId}`, {
        oldPassword,
        newPassword,
        changedBy: userId, // Bạn có thể thêm thông tin về người thay đổi nếu cần
      });
  
      if (response.status === 200) {
        showNotification("success", "Thành công", "Mật khẩu đã được thay đổi thành công!");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        showNotification("error", "Lỗi", "Không thể thay đổi mật khẩu.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showNotification("error", "Lỗi", "Mật khẩu cũ không chính xác hoặc có lỗi khác.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <LoadingComponent />}
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <div>
            <img
              className="w-24 h-24 rounded-full"
              src={profileData.img}
              alt="Ảnh đại diện"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{profileData.name}</h1>
            <p className="text-sm text-gray-600">{profileData.role}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đầy đủ</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày Sinh</label>
            <input
              type="date"
              name="dob"
              value={profileData.dob}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giới tính</label>
            <select
              name="gender"
              value={profileData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Vui lòng chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-6 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg"
        >
          Save
        </button>

        {/* Phần thay đổi mật khẩu */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">Thay đổi mật khẩu</h2>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleChangePassword}
            className="mt-4 px-6 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg"
          >
            Thay đổi mật khẩu
          </button>
        </div>
      </div>
    </>
  );
};

export default Profileinfo;