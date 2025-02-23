import React, { useEffect, useState } from "react";
import { Form, Input, message } from "antd";
import LoadingComponent from "../../Loading";
import { upload } from "../../../service/upload";
import { createPost } from "../../../service/new";

const AddNews = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        setFiles((prev) => [...prev, ...newFiles]);

        // Generate image previews
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
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
            }
        }

        return urls;
    };

    const onFinish = async (values: any) => {
        setLoading(true);

        try {
            const imageUrls = await uploadImages(files);

            const payload = {
                title: values.title,
                descriptions: values.descriptions,
                content: values.content,
                img: imageUrls,
            };

            console.log("Payload:", payload);

            await createPost(payload);
            message.success("News added successfully!");
            form.resetFields();
            setFiles([]);
            setPreviews([]);
        } catch (error) {
            console.error("Error adding news:", error);
            message.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            {loading && <LoadingComponent />}
            {contextHolder}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 font-[sans-serif] max-w-4xl mx-auto bg-white shadow-md rounded-lg">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-700">Thông tin bài viết</h2>

                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item
                            name="title"
                            label={<span className="text-lg text-gray-700">Tiêu đề:</span>}
                            rules={[{ required: true, message: "Bắt buộc nhập tiêu đề!" }]}
                        >
                            <Input placeholder="Nhập tiêu đề bài viết" className="rounded border-gray-300" />
                        </Form.Item>

                        <Form.Item
                            name="descriptions"
                            label={<span className="text-lg text-gray-700">Mô tả:</span>}
                            rules={[{ required: true, message: "Bắt buộc nhập mô tả!" }]}
                        >
                            <Input placeholder="Nhập mô tả bài viết" className="rounded border-gray-300" />
                        </Form.Item>

                        <Form.Item
                            name="content"
                            label={<span className="text-lg text-gray-700">Nội dung:</span>}
                            rules={[{ required: true, message: "Bắt buộc nhập nội dung!" }]}
                        >
                            <Input.TextArea rows={6} placeholder="Nhập nội dung bài viết" className="rounded border-gray-300" />
                        </Form.Item>

                        <Form.Item>
                            <div className="mt-6 flex justify-center">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-500 text-white font-medium text-lg rounded hover:bg-blue-600 focus:ring focus:ring-blue-300"
                                >
                                    Thêm mới bài viết
                                </button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-700">Ảnh bài viết</h2>

                    <div className="flex flex-wrap gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative w-32 h-32 border rounded overflow-hidden">
                                <img
                                    src={preview}
                                    alt={`Preview ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full hover:bg-red-600"
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>

                    <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="block w-full border-gray-300 rounded p-2"
                    />
                </div>
            </div>
        </>
    );
};

export default AddNews;