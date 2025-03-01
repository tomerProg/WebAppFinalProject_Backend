// tomer-shomron-324205145-omer-hasid-322994120

import { environmentVariables } from './config';
import { createSystemConfig } from './services/system/config';
import { System } from './services/system/system';

const systemConfig = createSystemConfig(environmentVariables);
try {
    const system = new System(systemConfig);
    system.start().catch((error) => {
        console.error(error);
        process.exit(1);
    });
} catch (error) {
    console.error('failed running system', error);
}
