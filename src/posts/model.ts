import { Model, Schema, model } from 'mongoose';
import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - owner
 *         - likes
 *         - dislikes
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         description:
 *           type: string
 *           description: The description of the post
 *         owner:
 *           type: string
 *           description: The owner id of the post
 *         suggestion:
 *           type: string
 *           description: The suggestion for the post
 *         imageSrc:
 *           type: string
 *           description: The path (in server) of the post image
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: list of users ids who liked the post
 *         dislikes:
 *           type: array
 *           items:
 *             type: string
 *           description: list of users ids who disliked the post
 *       example:
 *         _id: 245234t234234r234r23f4
 *         title: My First Post
 *         owner: 324vt23r4tr234t245tbv45by
 *         description: post description.
 *         suggestion: post suggestion
 *         imageSrc: https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQP5QQKcY4t1-_XAOvt_5Ii9LGJqTDX0B7u5sOZJFeU8QCGJ2jReifGEDftXkScCw-lMm8nmFUYF2QXwMR2KrzTsw
 *         likes: []
 *         dislikes: []
 */

export interface Post {
    title: string;
    owner: string;
    description: string;
    suggestion?: string;
    imageSrc?: string;
    likes?: string[];
    dislikes?: string[];
}

const postSchema = new Schema<Post>({
    title: { type: String, required: true },
    owner: { type: String, required: true },
    description: { type: String, required: true },
    suggestion: String,
    imageSrc: String,
    likes: { type: [String], default: [] },
    dislikes: { type: [String], default: [] }
});

export type PostModel = Model<Post>;
export const postModel = model<Post>('Posts', postSchema);
