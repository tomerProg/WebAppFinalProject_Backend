import { EnvironmentVariables } from '../../config';
import { createDatabaseConfig, DatabaseConfig } from '../database/config';
import { createServerConfig, ServerConfig } from '../server/config';

export type SystemConfig = {
    serverConfig: ServerConfig;
    databaseConfig: DatabaseConfig;
    googleClientId: string;
};

export const createSystemConfig = (
    env: EnvironmentVariables
): SystemConfig => ({
    serverConfig: createServerConfig(env),
    databaseConfig: createDatabaseConfig(env),
    googleClientId: env.GOOGLE_CLIENT_ID
});
