import { Server } from '../server/server';
import { Service } from '../service';
import { SystemConfig } from './config';

export class System extends Service {
    private readonly server: Server;

    constructor(private readonly config: SystemConfig) {
        super();
        const { serverConfig } = this.config;
        this.server = new Server(serverConfig);
    }

    async start() {
        await this.server.start();
    }

    async stop() {
        await this.server.stop();
    }
}
