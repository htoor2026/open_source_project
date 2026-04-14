import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  body: string;
  authorId: string;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  body: { type: String, required: true },
  authorId: { type: String, required: true }
}, { timestamps: true });

export const Post = mongoose.model<IPost>('Post', PostSchema);
