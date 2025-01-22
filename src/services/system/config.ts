import { EnvironmentVariables } from '../../config';
import { createDatabaseConfig, DatabaseConfig } from '../database/config';
import { createServerConfig, ServerConfig } from '../server/config';

export type SystemConfig = {
    serverConfig: ServerConfig;
    databaseConfig: DatabaseConfig;
};

export const createSystemConfig = (
    env: EnvironmentVariables
): SystemConfig => ({
    serverConfig: createServerConfig(env),
    databaseConfig: createDatabaseConfig(env)
});
