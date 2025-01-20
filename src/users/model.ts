import { Model, Schema, model } from 'mongoose';
import { z } from 'zod';

/**
 *  @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - email
 *          - password
 *          - username
 *        properties:
 *          email:
 *            type: string
 *            description: The user email
 *          password:
 *            type: string
 *            description: The user password
 *          username:
 *            type: string
 *            description: the username of the user
 *          profileImage:
 *            type: string
 *            description: path to the user profile image
 *        example:
 *          email: 'tomercpc01@gmail.com'
 *          password: '123456'
 *          username: king__doom
 *          profileImage: https://backend/user/image
 *      UserPublicAttr:
 *        type: object
 *        required:
 *          - email
 *          - username
 *        properties:
 *          email:
 *            type: string
 *            description: The user email
 *          username:
 *            type: string
 *            description: the username of the user
 *          profileImage:
 *            type: string
 *            description: path to the user profile image
 *        example:
 *          email: 'tomercpc01@gmail.com'
 *          username: king__doom
 *          profileImage: https://backend/user/image
 */

export interface User {
    email: string;
    password: string;
    username: string;
    profileImage?: string;
    refreshToken?: string[];
}

export const userZodSchema: z.ZodType<User> = z.object({
    email: z.string(),
    password: z.string(),
    username: z.string(),
    profileImage: z.string().optional(),
    refreshToken: z.array(z.string()).default([])
});

const userSchema = new Schema<User>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    profileImage: String,
    refreshToken: { type: [String], default: [] }
});

export type UserModel = Model<User>;
export const userModel = model<User>('Users', userSchema);
