import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, { Express, Router } from 'express';
import { readFileSync } from 'fs';
import * as http from 'http';
import * as https from 'https';
import swaggerUI from 'swagger-ui-express';
import { createAuthMiddleware } from '../../authentication/middlewares';
import { createAuthRouter } from '../../authentication/router';
import { commentModel } from '../../comments/model';
import { createCommentsRouter } from '../../comments/router';
import { createFileRouterConfig } from '../../files/config';
import { createFilesRouter } from '../../files/router';
import { ChatGenerator } from '../../openai/openai';
import { postModel } from '../../posts/model';
import { createPostsRouter } from '../../posts/router';
import { createSwaggerSpecs } from '../../swagger';
import { createUsersRouter } from '../../users/router';
import { Service } from '../service';
import { ServerConfig } from './config';
import { ServerDependencies } from './dependencies';
import { createExpressAppRoutesErrorHandler } from './utils';

export class Server extends Service {
    private app: Express;
    private server: http.Server | https.Server;

    constructor(
        private readonly config: ServerConfig,
        private readonly dependencies: ServerDependencies
    ) {
        super();

        this.app = express();
        this.useMiddlewares();
        this.useApiRouters();
        this.useSwagger();
        this.useErrorHandler();
        if (!this.config.isLocalMode) {
            this.useFrontend();
        }

        this.server = this.createServer();
    }

    private useMiddlewares = () => {
        const { isLocalMode, domain } = this.config;
        const corsOptions: CorsOptions = {
            origin: isLocalMode ? 'http://localhost:5173' : domain,
            credentials: true
        };

        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors(corsOptions));
    };

    private useApiRouters = () => {
        const { database, googleAuthClient } = this.dependencies;
        const { userModel } = database.getModels();
        const { filesRouterConfig, authRouterConfig } =
            this.createRoutersConfigs();
        const authMiddleware = createAuthMiddleware(
            authRouterConfig.tokenSecret
        );

        const { chatGeneratorConfig } = this.config;
        const chatGenerator = new ChatGenerator(chatGeneratorConfig);
        
        const apiRouter = Router();
        apiRouter.use('/files', createFilesRouter(filesRouterConfig));
        apiRouter.use(
            '/auth',
            createAuthRouter(authRouterConfig, { userModel, googleAuthClient })
        );
        apiRouter.use('/user', createUsersRouter(authMiddleware, { userModel }));
        apiRouter.use(
            '/post',
            createPostsRouter(authMiddleware, { postModel, chatGenerator })
        );
        apiRouter.use(
            '/comment',
            createCommentsRouter(authMiddleware, { commentModel })
        );

        this.app.use('/api', apiRouter)
    };

    private useSwagger = () => {
        const specs = createSwaggerSpecs(this.config);
        this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
    };

    private useFrontend = () => {
        this.app.use(express.static('front'));
        // Handle React routes
        const pwd = process.env.PWD ?? '.'
        this.app.get("*", (_req, res) => {
            res.sendFile(pwd.concat('/front/index.html'));
        });
    };

    private useErrorHandler = () => {
        this.app.use(createExpressAppRoutesErrorHandler());
    };

    private createRoutersConfigs = () => ({
        filesRouterConfig: createFileRouterConfig(this.config),
        authRouterConfig: this.config.authConfig
    });

    private createServer = () => {
        const { isLocalMode } = this.config;
        if (isLocalMode) {
            return http.createServer(this.app);
        }

        const httpsOptions: https.ServerOptions = {
            key: readFileSync('../client-key.pem'),
            cert: readFileSync('../client-cert.pem')
        };

        return https.createServer(httpsOptions, this.app);
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
