import bodyParser from 'body-parser';
import express, { Router } from 'express';
import cors from 'cors';
import { expressAppRoutesErrorHandler } from '../utils';

export const createTestingAppForRouter = (path: string, router: Router) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    app.use(path, router);
    app.use(expressAppRoutesErrorHandler);

    return app;
};
