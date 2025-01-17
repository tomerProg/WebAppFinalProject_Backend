import { EnvironmentVariables } from "../../config";

export type ServerConfig = {
    port: number;
};

export const createServerConfig = (env: EnvironmentVariables): ServerConfig => ({
    port: env.PORT
});
