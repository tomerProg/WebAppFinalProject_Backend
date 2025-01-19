import { EnvironmentVariables } from '../../config';

export type ServerConfig = {
    port: number;
    domain: string;
};

export const createServerConfig = (
    env: EnvironmentVariables
): ServerConfig => ({
    port: env.PORT,
    domain: env.SERVICE_DOMAIN
});
