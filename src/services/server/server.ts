import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import * as http from 'http';
import swaggerUI from 'swagger-ui-express';
import specs from '../../swagger';
import { Service } from '../service';
import { ServerConfig } from './config';
import { expressAppRoutesErrorHandler } from './utils';

export class Server extends Service {
    private app: Express;
    private server: http.Server;

    constructor(private readonly config: ServerConfig) {
        super();

        this.app = express();
        this.useMiddlewares();
        this.useRouters();
        this.useErrorHandler();

        this.server = http.createServer(this.app);
    }

    useMiddlewares = () => {
        this.app.use(bodyParser.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
    };

    useRouters = () => {
        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
    };

    useErrorHandler = () => {
        this.app.use(expressAppRoutesErrorHandler);
    };

    getExpressApp = () => this.app;

    start = () =>
        new Promise<void>((resolve, reject) => {
            const { port } = this.config;
            this.server.listen(port, () => {
                console.log(`server listening on port ${port}`);
                resolve();
            });
            this.server.once('error', reject);
        });

    stop = () =>
        new Promise<void>((resolve, reject) => {
            this.server.close((error) => (error ? reject(error) : resolve()));
        });
}
