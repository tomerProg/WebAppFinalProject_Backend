import { Router } from 'express';
import * as usersHandlers from './handlers';

export const createUsersRouter = () => {
    const router = Router();
    router.put('/', usersHandlers.editUser);

    return router;
};
