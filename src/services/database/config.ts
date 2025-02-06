import { EnvironmentVariables } from '../../config';

export type DatabaseConfig = {
    connection: string,
};

export const createDatabaseConfig = (
    env: EnvironmentVariables
): DatabaseConfig => ({
    connection: env.DB_CONNECT
});
