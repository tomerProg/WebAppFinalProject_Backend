import { EnvironmentVariables } from '../config';
import {SignOptions} from 'jsonwebtoken'

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';

export type AuthConfig = {
    tokenSecret: string;
    tokenExpires: SignOptions['expiresIn'];
    refreshTokenExpires: SignOptions['expiresIn'];
};

export const createAuthConfig = (env: EnvironmentVariables): AuthConfig => ({
    tokenSecret: env.AUTH_TOKEN_SECRET,
    tokenExpires: env.AUTH_TOKEN_EXPIRES as SignOptions['expiresIn'],
    refreshTokenExpires: env.AUTH_REFRESH_TOKEN_EXPIRES  as SignOptions['expiresIn']
});
