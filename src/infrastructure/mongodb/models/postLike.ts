import mongoose, { Schema, Document } from 'mongoose';

export interface IPostLike extends Document {
  postId: string;
  userId: string;
}

const PostLikeSchema = new Schema<IPostLike>({
  postId: { type: String, required: true },
  userId: { type: String, required: true }
}, { timestamps: true });

export const PostLike = mongoose.model<IPostLike>('PostLike', PostLikeSchema);
