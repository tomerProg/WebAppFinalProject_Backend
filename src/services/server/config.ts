import { AuthConfig, createAuthConfig } from '../../authentication/config';
import { EnvironmentVariables } from '../../config';

export type ServerConfig = {
    port: number;
    authConfig: AuthConfig;
};

export const createServerConfig = (
    env: EnvironmentVariables
): ServerConfig => ({
    port: env.PORT,
    authConfig: createAuthConfig(env)
});
