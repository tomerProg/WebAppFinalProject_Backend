import { Model, Schema, model } from 'mongoose';
import { z } from 'zod';

export interface Post { 
    title: string, 
    owner: string, 
    description: string, 
    suggestion?: string, 
    imageSrc?: string }

export const postZodSchema: z.ZodType<Post> = z.object({
    title: z.string(),
    owner: z.string(),
    description: z.string(),
    suggestion: z.string().optional(),
    imgSrc: z.string().optional()
});

const postSchema = new Schema<Post>({
    title: { type: String, required: true },
    owner: { type: String, required: true },
    description: { type: String, required: true },
    suggestion: String,
    imageSrc: String
});

export type PostModel = Model<Post>;
export const postModel = model<Post>('Posts', postSchema);