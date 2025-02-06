import { AuthConfig, createAuthConfig } from '../../authentication/config';
import { EnvironmentVariables } from '../../config';
import { ChatGeneratorConfig, createChatGeneratorConfig } from '../../openai/config';


export type ServerConfig = {
    port: number;
    authConfig: AuthConfig;
    chatGeneratorConfig: ChatGeneratorConfig
};

export const createServerConfig = (
    env: EnvironmentVariables
): ServerConfig => ({
    port: env.PORT,
    authConfig: createAuthConfig(env), 
    chatGeneratorConfig: createChatGeneratorConfig(env)
});
