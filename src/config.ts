import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const environmentVariablesZodScema = z.object({
    PORT: z.coerce.number(),
    SERVICE_DOMAIN: z.string(),
    DB_CONNECT: z.string(),
    AUTH_TOKEN_SECRET: z.string(),
    AUTH_TOKEN_EXPIRES: z.string(),
    AUTH_REFRESH_TOKEN_EXPIRES: z.string(),
    PROFILE_IMAGES_DEST: z.string(),
    POST_IMAGES_DEST: z.string()
});
export type EnvironmentVariables = z.infer<typeof environmentVariablesZodScema>;

const validation = environmentVariablesZodScema.safeParse(process.env);
if (validation.error) {
    console.error('Invalid Env: ', validation.error);
    process.exit(1);
}

export const environmentVariables = validation.data;
