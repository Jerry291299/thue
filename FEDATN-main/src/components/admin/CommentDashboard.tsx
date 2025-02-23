import React, { useEffect, useState } from "react";
import { Popconfirm, Button, Input, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface Comment {
  id: number;
  user: string;
  text: string;
  createdAt: string;
  productId: string;
  name: string;
  rating?: number;
  productName: string;
}

const CommentDashboard = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchComments = () => {
      const keys = Object.keys(localStorage);
      const allComments: Comment[] = [];
      keys.forEach((key) => {
        if (key.startsWith("comments_")) {
          const productComments = JSON.parse(localStorage.getItem(key) || "[]");
          productComments.forEach((comment: Comment) => {
            allComments.push({
              ...comment,
              productId: key.replace("comments_", ""),
            });
          });
        }
      });
      // Sắp xếp bình luận theo ngày tạo (mới nhất lên đầu)
      allComments.sort((a, b) =>
        dayjs(b.createdAt).isBefore(dayjs(a.createdAt)) ? 1 : -1
      );
      setComments(allComments.reverse());
    };
    fetchComments();
  }, []);

  const handleDeleteComment = (id: number) => {
    const updatedComments = comments.filter((comment) => comment.id !== id);
    setComments(updatedComments);

    const groupedComments: Record<string, Comment[]> = {};
    updatedComments.forEach((comment) => {
      if (!groupedComments[comment.productId])
        groupedComments[comment.productId] = [];
      groupedComments[comment.productId].push(comment);
    });

    Object.keys(groupedComments).forEach((productId) => {
      localStorage.setItem(
        `comments_${productId}`,
        JSON.stringify(groupedComments[productId])
      );
    });
  };

  const filteredComments = comments.filter((comment) =>
    comment.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text: any, record: Comment, index: number) => index + 1,
    },
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-cyan-500">{text}</span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      render: (text: string) => <span className="text-purple-500">{text}</span>,
    },
    {
      title: "Nội dung",
      dataIndex: "text",
      key: "text",
      render: (text: string) => <span className="italic">{text}</span>,
    },
    {
      title: "Số sao đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (text: number) => (
        <span className="text-yellow-500">{"★".repeat(text || 0)}</span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Comment) => (
        <Popconfirm
          title="Xóa bình luận"
          description="Bạn có chắc chắn muốn xóa bình luận này không?"
          onConfirm={() => handleDeleteComment(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button
            danger
            className="transition-all hover:bg-red-600 hover:text-white"
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="search-container p-4">
        <Input
          placeholder="Tìm kiếm bình luận"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
          style={{
            width: "300px",
            padding: "8px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            color: "#333",
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredComments}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        className="comment-table"
        style={{
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        rowClassName="hover:bg-gray-200 transition-all" // Hover hiệu ứng chỉ áp dụng khi di chuột vào bảng
      />
    </div>
  );
};

export default CommentDashboard;
