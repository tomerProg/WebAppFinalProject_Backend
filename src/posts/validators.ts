import { z } from 'zod';
import { authenticatedRequestZodSchema } from '../authentication/types';
import { validateRequest } from '../services/server/utils';

const editPostRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            suggestion: z.string().optional(),
            imageSrc: z.string().optional()
        }),
        params: z.object({
            id: z.string()
        })
    })
);
export type EditPostRequest = z.infer<typeof editPostRequestZodSchema>;
export const validateEditPostRequest = validateRequest(
    editPostRequestZodSchema
);

const createPostRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            title: z.string(),
            description: z.string(),
            suggestion: z.string().optional(),
            imageSrc: z.string().optional()
        })
    })
);
export type CreatePostRequest = z.infer<typeof createPostRequestZodSchema>;
export const validateCreatePostRequest = validateRequest(
    createPostRequestZodSchema
);

const deletePostRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        params: z.object({
            id: z.string()
        })
    })
);
export type DeletePostRequest = z.infer<typeof deletePostRequestZodSchema>;
export const validateDeletePostRequest = validateRequest(
    deletePostRequestZodSchema
);

const getPostRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            owner: z.string().optional()
        })
    })
);
export type GetPostRequest = z.infer<typeof getPostRequestZodSchema>;
export const validateGetPostRequest = validateRequest(getPostRequestZodSchema);

const paramsWithIdZodScheam = z.object({
    params: z.object({
        id: z.string()
    })
});
const getPostByIdRequestZodSchema = authenticatedRequestZodSchema.and(
    paramsWithIdZodScheam
);
export type GetPostByIdRequest = z.infer<typeof getPostByIdRequestZodSchema>;
export const validateGetPostByIdRequest = validateRequest(
    getPostByIdRequestZodSchema
);

const setLikedPostZodSchema = authenticatedRequestZodSchema
    .and(paramsWithIdZodScheam)
    .and(
        z.object({
            body: z.object({
                like: z.boolean().optional()
            })
        })
    );
export type LikePostRequest = z.infer<typeof setLikedPostZodSchema>;
export const validateLikePostRequest = validateRequest(setLikedPostZodSchema);
