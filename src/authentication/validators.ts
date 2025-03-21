import { z } from 'zod';
import { validateRequest } from '../services/server/utils';
import { userZodSchema } from '../users/model';
import { REFRESH_TOKEN_COOKIE_NAME } from './config';
import { authenticatedRequestZodSchema } from './types';

const requestWithUserBodyZodSchema = z.object({
    body: userZodSchema
});
export const validateRequestWithUserInBody = validateRequest(
    requestWithUserBodyZodSchema
);

export const requestWithRefreshTokenCookie = z.object({
    cookies: z.object({
        [REFRESH_TOKEN_COOKIE_NAME]: z.string()
    })
});

const loginRequestZodSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string()
    })
});
export const validateLoginRequest = validateRequest(loginRequestZodSchema);

export const validateRequestWithRefreshToken = validateRequest(
    requestWithRefreshTokenCookie
);

const googleLoginRequestZodSchema = z.object({
    body: z.object({ credential: z.string() })
});
export const validateGoogleLoginRequest = validateRequest(
    googleLoginRequestZodSchema
);


export const validateAuthenticatedRequest = validateRequest(authenticatedRequestZodSchema);
