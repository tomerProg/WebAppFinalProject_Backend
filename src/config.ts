import dotenv from 'dotenv';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? '';
const envFile = nodeEnv !== 'production' ? '.env.dev' : '.env.prod';
dotenv.config({ path: envFile });

const environmentVariablesZodScema = z.object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number(),
    SERVICE_DOMAIN: z.string(),
    DB_CONNECT: z.string(),
    AUTH_TOKEN_SECRET: z.string(),
    AUTH_TOKEN_EXPIRES: z.string(),
    AUTH_REFRESH_TOKEN_EXPIRES: z.string(),
    OPENAI_API_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
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
