import { EnvironmentVariables } from '../config';

export type AuthConfig = {
    tokenSecret: string;
    tokenExpires: string;
    refreshTokenExpires: string;
};

export const createAuthConfig = (env: EnvironmentVariables): AuthConfig => ({
    tokenSecret: env.AUTH_TOKEN_SECRET,
    tokenExpires: env.AUTH_TOKEN_EXPIRES,
    refreshTokenExpires: env.AUTH_REFRESH_TOKEN_EXPIRES
});
