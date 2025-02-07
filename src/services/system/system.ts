import { GoogleAuthClient } from '../../googleAuth/google.auth';
import { Database } from '../database/database';
import { Server } from '../server/server';
import { Service } from '../service';
import { SystemConfig } from './config';

export class System extends Service {
    private readonly server: Server;
    private readonly database: Database;
    private readonly googleAuthClient: GoogleAuthClient;

    constructor(private readonly config: SystemConfig) {
        super();
        const { serverConfig, databaseConfig, googleClientId } = this.config;

        this.googleAuthClient = new GoogleAuthClient(googleClientId);
        this.database = new Database(databaseConfig);
        this.server = new Server(serverConfig, {
            database: this.database,
            googleAuthClient: this.googleAuthClient
        });
    }

    async start() {
        await this.database.start();
        await this.server.start();
    }

    async stop() {
        await this.server.stop();
        await this.database.stop();
    }
}
