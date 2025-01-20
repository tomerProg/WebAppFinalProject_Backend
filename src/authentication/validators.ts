import { z } from 'zod';
import { validateRequest } from '../services/server/utils';
import { userZodSchema } from '../users/model';

const requestWithUserBodyZodSchema = z.object({
    body: userZodSchema
});
export const validateRequestWithUserInBody = validateRequest(
    requestWithUserBodyZodSchema
);
