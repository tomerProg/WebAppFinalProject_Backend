import { RequestHandler, Router } from 'express';
import { UsersRouterDependencies } from './dependencies';
import * as usersHandlers from './handlers';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for /user
 */

const buildRouteHandlers = (
    dependencies: UsersRouterDependencies
): Record<keyof typeof usersHandlers, RequestHandler> => ({
    editUser: usersHandlers.editUser(dependencies.userModel)
});

export const createUsersRouter = (
    authMiddleware: RequestHandler,
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    /**
     * @swagger
     * /user:
     *   put:
     *     summary: Update user attributes
     *     description: Update an existing post
     *     tags:
     *       - User
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nickname:
     *                 type: string
     *                 description: user new nickname
     *                 example: new user nickname
     *               profileImage:
     *                 type: string
     *                 description: path (in server) of new profile image
     *                 example: new/image/path
     *     responses:
     *       200:
     *         description: user updated successfully
     *       400:
     *         description: Invalid input
     *       404:
     *         description: user not found
     *       500:
     *         description: Server error
     */
    router.put('/', authMiddleware, handlers.editUser);

    return router;
};
