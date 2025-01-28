import { z } from 'zod';
import { authenticatedRequestZodSchema } from '../authentication/types';
import { validateRequest } from '../services/server/utils';

const editCommentRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            content: z.string()
        }),
        params: z.object({
            id: z.string()
        })
    })
);
export type EditCommentRequest = z.infer<typeof  editCommentRequestZodSchema>;
export const validateEditCommentRequest = validateRequest(
    editCommentRequestZodSchema
);

const createCommentRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            content: z.string(),
            postId: z.string(),
        })
    })
);
export type CreateCommentRequest = z.infer<typeof  createCommentRequestZodSchema>;
export const validateCreateCommentRequest = validateRequest(
    createCommentRequestZodSchema
);

const deleteCommentRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        params: z.object({
            id: z.string(),
        })
    })
);
export type DeleteCommentRequest = z.infer<typeof  deleteCommentRequestZodSchema>;
export const validateDeleteCommentRequest = validateRequest(
    deleteCommentRequestZodSchema
);

const getCommentRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            owner: z.string().optional(),
            postId: z.string(),
            content: z.string().optional(),
        })
    })
);
export type GetCommentRequest = z.infer<typeof  getCommentRequestZodSchema>;
export const validateGetCommentRequest = validateRequest(
    getCommentRequestZodSchema
);

const getCommentByIdRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        params: z.object({
            id: z.string()
        })
    })
);
export type GetCommentByIdRequest = z.infer<typeof  getCommentByIdRequestZodSchema>;
export const validateGetCommentByIdRequest = validateRequest(
    getCommentByIdRequestZodSchema
);
