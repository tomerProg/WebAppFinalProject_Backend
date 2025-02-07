import { EnvironmentVariables } from '../config';

export type ChatGeneratorConfig = {
    apiKey: string,
};

export const createChatGeneratorConfig = (
    env: EnvironmentVariables
): ChatGeneratorConfig => ({
    apiKey: env.OPENAI_API_KEY
});
