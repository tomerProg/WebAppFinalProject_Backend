import { z } from 'zod';
import { authenticatedRequestZodSchema } from '../authentication/types';
import { validateRequest } from '../services/server/utils';

const editUserRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            nickname: z.string().optional(),
            profileImage: z.string().optional()
        })
    })
);
export type EditUserRequest = z.infer<typeof editUserRequestZodSchema>;
export const validateEditUserRequest = validateRequest(
    editUserRequestZodSchema
);
