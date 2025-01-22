import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, TokenPayload } from './types';

export const createAuthMiddleware =
    (tokenSecret: string) =>
    (req: Request, res: Response, next: NextFunction) => {
        const authorization = req.header('authorization');
        const token = authorization && authorization.split(' ')[1];

        if (!token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }

        try {
            const verifiedToken = jwt.verify(token, tokenSecret);
            const userId = (verifiedToken as TokenPayload)._id;
            (req as unknown as AuthenticatedRequest).user = {
                id: userId
            };
            next();
        } catch (error) {
            res.status(StatusCodes.UNAUTHORIZED).send(error);
        }
    };
