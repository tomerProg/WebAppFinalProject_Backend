import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import { createExpressAppRoutesErrorHandler } from '../utils';

export const createTestingAppForRouter = (path: string, router: Router) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.use(path, router);
    app.use(createExpressAppRoutesErrorHandler(false));

    return app;
};
