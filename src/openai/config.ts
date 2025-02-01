import { EnvironmentVariables } from '../config';

export type ChatGeneratorConfig = {
    apiKey: string,
    environment: string
};

export const createChatGeneratorConfig = (
    env: EnvironmentVariables
): ChatGeneratorConfig => ({
    apiKey: env.OPENAI_API_KEY,
    environment: env.ENVIRONMENT
});
