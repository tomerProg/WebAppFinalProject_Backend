import express, { RequestHandler, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createMulterUpload } from '../files/logic';
import { UsersRouterConfig } from './config';
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
    config: UsersRouterConfig,
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

    /**
     * @swagger
     * /user/profile-image:
     *   post:
     *     tags:
     *       - User
     *     summary: Uploads a file.
     *       consumes:
     *         - multipart/form-data
     *       parameters:
     *         - in: formData
     *           name: profileImage
     *           type: file
     *           description: profile image to upload.
     *     responses:
     *       200:
     *         description: url for requesting the uploaded image
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: https://backend/user/image
     *       401:
     *         description: request is unauthorized
     *       500:
     *         description: Server error
     */
    const uplaodUserAvatar = createMulterUpload(
        config.profileImagesDestination
    );
    router.post(
        '/profile-image',
        uplaodUserAvatar.single('profileImage'),
        (req, res, _next) => {
            if (!req.file) {
                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            } else {
                res.status(StatusCodes.OK).send({
                    url: config.serverUrl + req.file.path
                });
            }
        }
    );

    /**
     * @swagger
     * /profile-image:
     *   get:
     *     summary: fetch profile image
     *     description: Returns the requested profile image as a binary file.
     *     tags:
     *       - User
     *     responses:
     *       200:
     *         description: A profile image file
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     *           image/jpeg:
     *             schema:
     *               type: string
     *               format: binary
     *       404:
     *         description: Image not found
     *       500:
     *         description: Server error
     */
    router.get(
        '/profile-image',
        express.static(config.profileImagesDestination)
    );

    return router;
};
