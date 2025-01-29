import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const responseForUploadedFile =
    (serverUrl: string) => (req: Request, res: Response) => {
        if (!req.file) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        } else {
            res.status(StatusCodes.OK).send({
                url: serverUrl + req.file.path
            });
        }
    };
