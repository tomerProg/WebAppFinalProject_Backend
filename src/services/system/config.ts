import { EnvironmentVariables } from '../../config';
import { createServerConfig, ServerConfig } from '../server/config';

export type SystemConfig = {
    serverConfig: ServerConfig;
};

export const createSystemConfig = (
    env: EnvironmentVariables
): SystemConfig => ({
    serverConfig: createServerConfig(env)
});
