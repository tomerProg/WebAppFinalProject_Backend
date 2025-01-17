import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const expressAppRoutesErrorHandler = (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
) => {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
};
