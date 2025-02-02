import { RequestHandler, Router } from 'express';
import { PostsRouterDependencies } from './dependencies';
import * as postsController from './controller';

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: API for /post
 */

const buildRouteHandlers = (
    dependencies: PostsRouterDependencies
): Record<keyof typeof postsController, RequestHandler> => ({
    editPost: postsController.editPost(dependencies.postModel),
    createPost: postsController.createPost(dependencies.postModel),
    deletePost: postsController.deletePost(dependencies.postModel),
    getAllPosts: postsController.getAllPosts(dependencies.postModel),
    getPostById: postsController.getPostById(dependencies.postModel),
    setPostLike: postsController.setPostLike(dependencies.postModel)
});

export const createPostsRouter = (
    authMiddleware: RequestHandler,
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    /**
     * @swagger
     * /post:
     *   get:
     *     summary: Get all posts
     *     description: Retrieve a list of all posts
     *     tags:
     *       - Post
     *     responses:
     *       200:
     *         description: A list of posts
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Post'
     *       500:
     *         description: Server error
     */
    router.get('/', handlers.getAllPosts);

    /**
     * @swagger
     * /post/{id}:
     *   get:
     *     summary: Get a post by ID
     *     description: Retrieve a single post by its ID
     *     tags:
     *       - Post
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the post
     *     responses:
     *       200:
     *         description: A single post
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Post'
     *       404:
     *         description: Post not found
     *       500:
     *         description: Server error
     */
    router.get('/:id', handlers.getPostById);

    /**
     * @swagger
     * /post:
     *   post:
     *     summary: Create a new post
     *     description: Create a new post
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
     *                 description: The title of the post
     *               description:
     *                 type: string
     *                 description: The description of the post
     *               suggestion:
     *                 type: string
     *                 description: The suggestion of the post
     *               imageSrc:
     *                 type: string
     *                 description: The image source of the post
     *             required:
     *               - title
     *               - description
     *     responses:
     *       201:
     *         description: Post created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Post'
     *       400:
     *         description: Invalid input
     *       500:
     *         description: Server error
     */
    router.post('/', authMiddleware, handlers.createPost);

    /**
     * @swagger
     * /post/{id}:
     *   put:
     *     summary: Update post attributes
     *     description: Update an existing post
     *     tags:
     *       - Post
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the updated post
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *              title:
     *                 type: string
     *                 description: post new title
     *                 example: new title
     *              description:
     *                  type: string
     *                  description: post new desctiption
     *                  example: new description
     *              suggestion:
     *                  type: string
     *                  description: post new suggestion
     *                  example: new suggestion
     *              imageSrc:
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
    router.put('/:id', authMiddleware, handlers.editPost);

    /**
     * @swagger
     * /post/{id}:
     *   delete:
     *     summary: Delete post
     *     description: Delete an existing post
     *     tags:
     *       - Post
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the deleted post
     *     responses:
     *       200:
     *         description: post deleted successfully
     *       400:
     *         description: Invalid input
     *       404:
     *         description: post not found
     *       500:
     *         description: Server error
     */
    router.delete('/:id', authMiddleware, handlers.deletePost);

    /**
     * @swagger
     * /post/like/{id}:
     *   put:
     *     summary: Update post user like
     *     description: change the likes and dislikes of post for user
     *     tags:
     *       - Post
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The ID of the post
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *              like:
     *                 type: boolean
     *                 description: is the user liked the post (for undefined the user not likes the post nor dislikes)
     *                 example: true
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
    router.put('/like/:id', authMiddleware, handlers.setPostLike);

    return router;
};
