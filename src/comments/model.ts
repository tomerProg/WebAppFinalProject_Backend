import { Model, Schema, model } from 'mongoose';
import { z } from 'zod';


/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - owner
 *         - postId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         owner:
 *           type: string
 *           description: The owner id of the comment
 *         postId:
 *           type: string
 *           description: The post id of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *       example:
 *         _id:   679a70b9f1d91978d2650d84  
 *         owner: 324vt23r4tr234t245tbv45by
 *         postId: 679a708bf1d91978d2650d81
 *         content: my first comment
 */

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