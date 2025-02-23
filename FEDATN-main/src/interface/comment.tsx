export interface IComment {
  id: number; // ID của bình luận
  user: string; // Người dùng đã bình luận
  text: string; // Nội dung bình luận
  createdAt: Date; // thời gian khi bình luận được tạo
  productId: string; // ID của sản phẩm
  name: string; // Tên của người dùng
  rating: number; // Đánh giá tùy chọn (1-5 sao)
}

export type CommentLite = Pick<IComment, "name">;
