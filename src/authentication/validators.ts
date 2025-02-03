import { z } from 'zod';
import { validateRequest } from '../services/server/utils';
import { userZodSchema } from '../users/model';

const requestWithUserBodyZodSchema = z.object({
    body: userZodSchema
});
export const validateRequestWithUserInBody = validateRequest(
    requestWithUserBodyZodSchema
);

const loginRequestZodSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string()
    })
});
export const validateLoginRequest = validateRequest(loginRequestZodSchema);
