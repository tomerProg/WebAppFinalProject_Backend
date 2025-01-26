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
    getAllPosts: postsController.getAllPosts(dependencies.postModel),
    getPostById: postsController.getPostById(dependencies.postModel),
});

export const createPostsRouter = (
    authMiddleware: RequestHandler,
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();
/**
* @swagger
* tags:
*   name: Posts
*   description: The Posts API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         description:
 *           type: string
 *           description: The description of the post
 *         owner:
 *           type: string
 *           description: The owner id of the post
 *         suggestion:
 *           type: string
 *           description: The suggestion for the post
 *         imageSrc:
 *           type: string
 *           description: The path (in server) of the post image
 * 
 *       example:
 *         _id: 245234t234234r234r23f4
 *         title: My First Post
 *         owner: 324vt23r4tr234t245tbv45by
 *         description: post description.
 *         suggestion: post suggestion 
 *         imageSrc: https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQP5QQKcY4t1-_XAOvt_5Ii9LGJqTDX0B7u5sOZJFeU8QCGJ2jReifGEDftXkScCw-lMm8nmFUYF2QXwMR2KrzTsw
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts
 *     tags:
 *       - Posts
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
    router.get('/', handlers.getAllPosts)   


/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a single post by its ID
 *     tags:
 *       - Posts
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
    router.get("/:id", handlers.getPostById);
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post
 *     tags:
 *       - Posts
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
 *               owner:
 *                 type: string
 *                 description: The owner of the post
 *               suggestion:
 *                 type: string
 *                 description: The suggestion of the post
 *               imageSrc:
 *                 type: string
 *                 description: The image source of the post
 *             required:
 *               - title
 *               - content         
 *               - owner
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

/**
 * @swagger
 * /post:
 *   delete:
 *     summary: Delete post 
 *     description: Delete an existing post
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
 *               _id:
 *                 type: string
 *                 description: post id to delete
 *                 example: 
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
    router.delete('/', authMiddleware, handlers.deletePost)


    return router;
};
