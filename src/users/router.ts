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
    editUser: usersHandlers.editUser(dependencies.userModel),
    getUserById: usersHandlers.getUserById(dependencies.userModel)
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
     *     description: Update an existing user
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
     *               username:
     *                 type: string
     *                 description: user new username
     *                 example: new user username
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

    /**
     * @swagger
     * /user/byId:
     *   get:
     *     summary: get user attributes
     *     description: get an existing user
     *     tags:
     *       - User
     *     parameters:
     *       - name: id
     *         in: path
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the user
     *     responses:
     *       200:
     *         description: user public attributes
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserPublicAttr'
     *       404:
     *         description: Post not found
     *       500:
     *         description: Server error
     */
    router.get('/byId/:id', handlers.getUserById);

    return router;
};
