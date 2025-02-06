import { RequestHandler, Router } from 'express';
import { CommentsRouterDependencies } from './dependencies';
import * as commentsController from './controller';

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: API for /comment
 */

const buildRouteHandlers = (
    dependencies: CommentsRouterDependencies
): Record<keyof typeof commentsController, RequestHandler> => ({
    editComment: commentsController.editComment(dependencies.commentModel),
    createComment: commentsController.createComment(dependencies.commentModel),
    deleteComment: commentsController.deleteComment(dependencies.commentModel),
    getAllComments: commentsController.getAllComments(dependencies.commentModel),
    getCommentById: commentsController.getCommentById(dependencies.commentModel),
});

export const createCommentsRouter = (
    authMiddleware: RequestHandler,
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - owner
 *         - postId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         owner:
 *           type: string
 *           description: The owner id of the comment
 *         postId:
 *           type: string
 *           description: The post id of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *       example:
 *         _id:   679a70b9f1d91978d2650d84  
 *         owner: 324vt23r4tr234t245tbv45by
 *         postId: 679a708bf1d91978d2650d81
 *         content: my first comment
 */

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of all comments
 *     tags:
 *       - Comment
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           description: post id of all the comments
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
    router.get('/', handlers.getAllComments)   

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a single comment by its ID
 *     tags:
 *       - Comment
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
    router.get("/:id", handlers.getCommentById);
   
/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment
 *     tags:
 *       - Comment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The post id of the comment
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *             required:
 *               - postId
 *               - content
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
    router.post('/', authMiddleware, handlers.createComment)
/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     summary: Update comment attributes
 *     description: Update an existing comment
 *     tags:
 *       - Comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the updated comment  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              content:
 *                 type: string
 *                 description: comment new content
 *                 example: new content
 *     responses:
 *       200:
 *         description: comment updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: comment not found
 *       500:
 *         description: Server error
 */    
    router.put('/:id', authMiddleware, handlers.editComment);

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Delete comment 
 *     description: Delete an existing comment
 *     tags:
 *       - Comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the deleted comment
 *     responses:
 *       200:
 *         description: comment deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: comment not found
 *       500:
 *         description: Server error
 */
    router.delete('/:id', authMiddleware, handlers.deleteComment)

    return router;
};
