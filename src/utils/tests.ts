import { environmentVariables, EnvironmentVariables } from '../config';

export const createTestEnv = (env?: Partial<EnvironmentVariables>) => ({
    ...environmentVariables,
    ...(env ?? {})
});
