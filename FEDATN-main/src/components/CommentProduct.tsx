import React, { useEffect, useState } from "react";
import { IUser } from "./../interface/user";
import { IComment } from "../interface/comment";

const CommentSection: React.FC<{
  productId: string;
  user: IUser | any;
}> = ({ productId, user }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [editingComment, setEditingComment] = useState<IComment | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [ratingCounts, setRatingCounts] = useState<number[]>(Array(5).fill(0));
  const [filteredRating, setFilteredRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    const storedComments = localStorage.getItem(`comments_${productId}`);
    if (storedComments) {
      const cmts = JSON.parse(storedComments);
      setComments(cmts);
      updateRatingCounts(cmts);
      calculateAverageRating(cmts);
      // onRatingUpdate(averageRating);
    }
  }, [productId]);

  const updateRatingCounts = (comments: IComment[]) => {
    const counts = Array(5).fill(0);
    comments.forEach((comment) => {
      if (comment.rating) {
        counts[comment.rating - 1] += 1;
      }
    });
    setRatingCounts(counts);
  };

  const calculateAverageRating = (comments: IComment[]) => {
    if (comments.length > 0) {
      const totalRating = comments.reduce(
        (sum, comment) => sum + (comment.rating || 0),
        0
      );
      const average = totalRating / comments.length;
      setAverageRating(average);
    } else {
      setAverageRating(0);
    }
  };

  const saveComments = (updatedComments: IComment[]) => {
    setComments(updatedComments);
    localStorage.setItem(
      `comments_${productId}`,
      JSON.stringify(updatedComments)
    );
    updateRatingCounts(updatedComments);
    calculateAverageRating(updatedComments);
  };

  const handleAddComment = () => {
    if (newComment.trim() && newRating !== null) {
      const newCommentObj: IComment = {
        id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
        user: user.role === "admin" ? "Admin" : user.info.name,
        text: newComment.trim(),
        createdAt: new Date(),
        name: user.info.name,
        rating: newRating,
        productId: productId,
      };

      saveComments([...comments, newCommentObj]);
      setNewComment("");
      setNewRating(null);
    }
  };

  const handleEditComment = (comment: IComment) => {
    setEditingComment(comment);
  };

  const handleUpdateComment = () => {
    if (editingComment && editingComment.text.trim()) {
      const updatedComments = comments.map((comment) =>
        comment.id === editingComment.id
          ? {
              ...comment,
              text: editingComment.text.trim(),
              rating: editingComment.rating,
            }
          : comment
      );
      saveComments(updatedComments);
      setEditingComment(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleDeleteComment = (id: number) => {
    const updatedComments = comments.filter((comment) => comment.id !== id);
    saveComments(updatedComments);
  };

  const filteredComments = filteredRating
    ? comments.filter((comment) => comment.rating === filteredRating)
    : comments;

  return (
    <div className="comment-section bg-gray-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Bình luận</h2>

      {/* Hiển thị tổng kết đánh giá */}
      <div className="rating-summary bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg text-white mb-6">
        <h3 className="text-2xl font-bold mb-4">Tổng kết đánh giá</h3>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-4xl font-extrabold">
              {averageRating.toFixed(1)}{" "}
              <span className="text-yellow-400">★</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{comments.length} đánh giá</p>
            <p className="text-sm opacity-80">Tổng số bình luận</p>
          </div>
        </div>
        <div className="rating-counts space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`flex items-center justify-between p-2 bg-opacity-20 rounded-lg transition cursor-pointer ${
                filteredRating === star
                  ? "bg-yellow-500 text-black"
                  : "hover:bg-opacity-30"
              }`}
              onClick={() =>
                setFilteredRating(filteredRating === star ? null : star)
              }
            >
              <div className="flex items-center space-x-2">
                <span className="flex text-yellow-400">
                  {Array.from({ length: star }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </span>
                <span className="ml-2 text-sm">
                  {ratingCounts[star - 1]} đánh giá
                </span>
              </div>
              <span className="text-xs font-medium opacity-80">
                {(
                  (ratingCounts[star - 1] / comments.length || 0) * 100
                ).toFixed(1)}
                %
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Hiển thị bình luận */}
      <div className="comments mb-4 space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="comment flex items-center p-4 bg-white rounded-lg shadow-md"
            >
              {editingComment && editingComment.id === comment.id ? (
                <div className="flex flex-col w-full space-y-2">
                  <textarea
                    value={editingComment.text}
                    onChange={(e) =>
                      setEditingComment({
                        ...editingComment,
                        text: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateComment}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full">
                  <span className="text-lg font-semibold">{comment.name}</span>
                  <p className="text-yellow-400">
                    {"★".repeat(comment.rating || 0)}
                  </p>
                  <p className="text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                  {(user.info.name === comment.name ||
                    user.role === "admin") && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="text-yellow-500"
                        onClick={() => handleEditComment(comment)}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có bình luận nào.</p>
        )}
      </div>

      {/* Thêm bình luận mới */}
      <div className="add-comment mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Thêm bình luận..."
          className="border border-gray-300 rounded-md p-2 w-full"
        />
        <div className="flex justify-start items-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star}>
              <input
                type="radio"
                id={`new-${star}-stars`}
                name="newRating"
                value={star}
                className="hidden"
                checked={newRating === star}
                onChange={() => setNewRating(star)}
              />
              <label
                htmlFor={`new-${star}-stars`}
                className="text-yellow-400 text-2xl cursor-pointer hover:scale-110"
              >
                ★
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddComment}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Gửi bình luận
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
