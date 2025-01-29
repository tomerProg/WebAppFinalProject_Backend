import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import * as http from 'http';
import swaggerUI from 'swagger-ui-express';
import { createAuthMiddleware } from '../../authentication/middlewares';
import { createAuthRouter } from '../../authentication/router';
import { createFileRouterConfig } from '../../files/config';
import { createFilesRouter } from '../../files/router';
import { postModel } from '../../posts/model';
import { createPostsRouter } from '../../posts/router';
import specs from '../../swagger';
import { createUsersRouter } from '../../users/router';
import { Service } from '../service';
import { ServerConfig } from './config';
import { ServerDependencies } from './dependencies';
import { expressAppRoutesErrorHandler } from './utils';

export class Server extends Service {
    private app: Express;
    private server: http.Server;

    constructor(
        private readonly config: ServerConfig,
        private readonly dependencies: ServerDependencies
    ) {
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
        const { database } = this.dependencies;
        const { userModel } = database.getModels();
        const { filesRouterConfig, authRouterConfig } =
            this.createRoutersConfigs();
        const authMiddleware = createAuthMiddleware(
            authRouterConfig.tokenSecret
        );

        this.app.use(
            '/auth',
            createAuthRouter(authRouterConfig, { userModel })
        );
        this.app.use('/files', createFilesRouter(filesRouterConfig));
        this.app.use('/user', createUsersRouter(authMiddleware, { userModel }));
        this.app.use('/post', createPostsRouter(authMiddleware, { postModel }));
        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
    };

    useErrorHandler = () => {
        this.app.use(expressAppRoutesErrorHandler);
    };

    createRoutersConfigs = () => ({
        filesRouterConfig: createFileRouterConfig(this.config, 'http'),
        authRouterConfig: this.config.authConfig
    });

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
