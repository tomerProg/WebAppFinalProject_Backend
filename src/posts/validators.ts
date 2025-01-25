import { z } from 'zod';
import { authenticatedRequestZodSchema } from '../authentication/types';
import { validateRequest } from '../services/server/utils';

const editPostRequestZodSchema = authenticatedRequestZodSchema.and(
    z.object({
        body: z.object({
            _id: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            suggestion: z.string().optional(),
            imageSrc: z.string().optional()
        })
    })
);

export type EditPostRequest = z.infer<typeof  editPostRequestZodSchema>;
export const validateEditPostRequest = validateRequest(
    editPostRequestZodSchema
);

