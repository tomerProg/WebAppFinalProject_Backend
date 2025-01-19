import express, { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createMulterUpload } from './logic';
import { FileRouterConfig } from './config';

export const createFileRouter = (config: FileRouterConfig) => {
    const router = Router();
    const destinationStaticFolder = 'public/';
    const upload = createMulterUpload(destinationStaticFolder);

    router.post('/', upload.single('file'), (req, res, next) => {
        if (!req.file) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        } else {
            res.status(StatusCodes.OK).send({ url: config.serverUrl + req.file.path });
        }
    });
    router.get('/', express.static(destinationStaticFolder));

    return router;
};
