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
    editPost: postsController.editPost(dependencies.postModel),
    createPost: postsController.createPost(dependencies.postModel),
    deletePost: postsController.deletePost(dependencies.postModel),
    getAllPosts: postsController.getAllPosts(dependencies.postModel)
});

export const createPostsRouter = (
    authMiddleware: RequestHandler,
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    router.get('/', handlers.getAllPosts)
    router.post('/', handlers.createPost)
    
    /**
     * @swagger
     * /post:
     *   put:
     *     summary: Update post attributes
     *     description: Update an existing post
     *     tags:
     *       - Post
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 description: post new title
     *                 example: new title
     *               description:  
     *                  type: string
     *                  description: post new desctiption
     *                  example: new description
     *               suggestion: 
     *                  type: string
     *                  description: post new suggestion
     *                  example: new suggestion
     *               imageSrc:
     *                 type: string
     *                 description: path (in server) of a new post image
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

    router.delete('/', authMiddleware, handlers.deletePost)


    return router;
};
