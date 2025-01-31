import { Model, Schema, model } from 'mongoose';
import { z } from 'zod';

export interface Comment {  
    owner: string, 
    postId: string, 
    content: string 
}

export const commentZodSchema: z.ZodType<Comment> = z.object({
    owner: z.string(),
    postId: z.string(),
    content: z.string(),
});

const commentSchema = new Schema<Comment>({
    owner: { type: String, required: true },
    postId: { type: String, required: true },
    content: { type: String, required: true },
});

export type CommentModel = Model<Comment>;
export const commentModel = model<Comment>('Comments', commentSchema);