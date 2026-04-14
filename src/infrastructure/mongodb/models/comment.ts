import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  authorId: string;
  body: string;
}

const CommentSchema = new Schema<IComment>({
  postId: { type: String, required: true },
  authorId: { type: String, required: true },
  body: { type: String, required: true }
}, { timestamps: true });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
