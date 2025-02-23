import mongoose, { Schema, Document } from "mongoose";

export interface IChatlieu extends Document {
    _id: string;
    name: string;
    status: "active" | "deactive"; // Trường status có thể là 'active' hoặc 'deactive'
}
const ChatlieuSchema: Schema = new Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ["active", "deactive"], default: "active" }, // Mặc định là 'active'
});
export default mongoose.model<IChatlieu>("Material", ChatlieuSchema);
