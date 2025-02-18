import { z } from 'zod';
import { authenticatedRequestZodSchema } from '../authentication/types';
import { validateRequest } from '../services/server/utils';

const editUserRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            username: z.string().optional(),
            profileImage: z.string().optional()
        })
    })
);
export type EditUserRequest = z.infer<typeof editUserRequestZodSchema>;
export const validateEditUserRequest = validateRequest(
    editUserRequestZodSchema
);

const getUserRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        params: z.object({
            id: z.string()
        })
    })
);
export type GetUserRequest = z.infer<typeof getUserRequestZodSchema>;
export const validateGetUserRequest = validateRequest(getUserRequestZodSchema);

const proxyGooglePictureRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        query: z.object({
            url: z.string().url()
        })
    })
);
export type ProxyGooglePictureRequest = z.infer<
    typeof proxyGooglePictureRequestZodSchema
>;
export const validateProxyGooglePictureRequest = validateRequest(
    proxyGooglePictureRequestZodSchema
);
