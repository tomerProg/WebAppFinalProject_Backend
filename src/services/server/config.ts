import { AuthConfig, createAuthConfig } from '../../authentication/config';
import { EnvironmentVariables } from '../../config';

export type ServerConfig = {
    port: number;
    domain: string;
    profileImagesDestination: string;
    authConfig: AuthConfig;
};

export const createServerConfig = (
    env: EnvironmentVariables
): ServerConfig => ({
    port: env.PORT,
    domain: env.SERVICE_DOMAIN,
    profileImagesDestination: env.PROFILE_IMAGES_DEST,
    authConfig: createAuthConfig(env)
});
