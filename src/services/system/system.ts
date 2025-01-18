import { Database } from '../database/database';
import { Server } from '../server/server';
import { Service } from '../service';
import { SystemConfig } from './config';

export class System extends Service {
    private readonly server: Server;
    private readonly database: Database;
    constructor(private readonly config: SystemConfig) {
        super();
        const { serverConfig, databaseConfig } = this.config;
        this.database = new Database(databaseConfig);
        this.server = new Server(serverConfig, { database: this.database });
    }

    async start() {
        await this.server.start();
    }

    async stop() {
        await this.server.stop();
    }
}
