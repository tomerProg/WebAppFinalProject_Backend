import { RequestHandler, Router } from 'express';
import { PostsRouterDependencies } from './dependencies';
import * as postsController from './controller';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for /user
 */

const buildRouteHandlers = (
    dependencies: PostsRouterDependencies
): Record<keyof typeof postsController, RequestHandler> => ({
    editPost: postsController.editPost(dependencies.postModel)
});

export const createPostsRouter = (
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
     *         description: post updated successfully
     *       400:
     *         description: Invalid input
     *       404:
     *         description: post not found
     *       500:
     *         description: Server error
     */
    router.put('/', authMiddleware, handlers.editPost);

    return router;
};
