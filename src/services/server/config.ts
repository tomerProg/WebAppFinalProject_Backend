import { AuthConfig, createAuthConfig } from '../../authentication/config';
import { EnvironmentVariables } from '../../config';

export type ServerConfig = {
    port: number;
    domain: string;
    authConfig: AuthConfig;
};

export const createServerConfig = (
    env: EnvironmentVariables
): ServerConfig => ({
    port: env.PORT,
    domain: env.SERVICE_DOMAIN,
    authConfig: createAuthConfig(env)
});
