import { z } from 'zod';

export type Tokens = {
    accessToken: string;
    refreshToken: string;
};

export type TokenPayload = {
    _id: string;
    random: string;
};

export const authenticatedRequestZodSchema = z.object({
    user: z.object(
        {
            id: z.string()
        },
        { message: 'user request is not authenticated' }
    )
});
export type AuthenticatedRequest = z.infer<
    typeof authenticatedRequestZodSchema
>;
