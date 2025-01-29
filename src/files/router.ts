import express, { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { FileRouterConfig } from './config';
import { createMulterUpload } from './logic';
import { responseForUploadedFile } from './handlers';

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: API for uploading and fetching saved files on server
 */

export const createFilesRouter = (config: FileRouterConfig) => {
    const { profileImagesDestination, serverUrl } = config;
    const router = Router();

    /**
     * @swagger
     * /files/profile-image:
     *   post:
     *     tags:
     *       - Files
     *     summary: Uploads a prodile image.
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
    const uplaodUserAvatar = createMulterUpload(profileImagesDestination);
    router.post(
        '/profile-image',
        uplaodUserAvatar.single('profileImage'),
        responseForUploadedFile(serverUrl)
    );

    /**
     * @swagger
     * /files/profile-image:
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
    router.get('/profile-image', express.static(profileImagesDestination));

    return router;
};
