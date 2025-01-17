// tomer-shomron-324205145-omer-hasid-322994120

import { environmentVariables } from './config';
import { createSystemConfig } from './services/system/config';
import { System } from './services/system/system';

const systemConfig = createSystemConfig(environmentVariables);
const system = new System(systemConfig);

system.start().catch((error) => {
    console.error(error);
    process.exit(1);
});
