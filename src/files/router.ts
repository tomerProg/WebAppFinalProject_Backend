import express, { Router } from 'express';
import * as fs from 'fs';
import { FileRouterConfig } from './config';
import { responseForUploadedFile } from './handlers';
import { createMulterUpload } from './logic';

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: API for uploading and fetching saved files on server
 */

export const createFilesRouter = (config: FileRouterConfig) => {
    const { postImagesDestination, profileImagesDestination, domain } = config;
    const router = Router();
    fs.mkdirSync(postImagesDestination, { recursive: true });
    fs.mkdirSync(profileImagesDestination, { recursive: true });

    /**
     * @swagger
     * /api/files/profile-image:
     *   post:
     *     tags:
     *       - Files
     *     summary: Uploads a profile image
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               profileImage:
     *                 type: string
     *                 format: binary
     *                 description: profile image to upload.
     *     responses:
     *       200:
     *         description: url for requesting the uploaded image
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: http://backend/files/profile-image/image
     *       401:
     *         description: request is unauthorized
     *       500:
     *         description: Server error
     */
    const uplaodUserAvatar = createMulterUpload(profileImagesDestination);
    router.post(
        '/profile-image',
        uplaodUserAvatar.single('profileImage'),
        responseForUploadedFile(domain, '/api/files/profile-image/')
    );

    /**
     * @swagger
     * /api/files/profile-image/{path}:
     *   get:
     *     summary: fetch profile image
     *     description: Returns the requested profile image as a binary file.
     *     tags:
     *       - Files
     *     parameters:
     *       - in: path
     *         name: path
     *         schema:
     *           type: string
     *         required: true
     *         description: path to the file in the static folder
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
    router.use('/profile-image', express.static(profileImagesDestination));

    /**
     * @swagger
     * /api/files/post-image:
     *   post:
     *     tags:
     *       - Files
     *     summary: Uploads a post image
     *     consumes:
     *       - multipart/form-data
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               postImage:
     *                 type: string
     *                 format: binary
     *                 description: post image to upload.
     *     responses:
     *       200:
     *         description: url for requesting the uploaded image
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: http://backend/files/post-image/image
     *       401:
     *         description: request is unauthorized
     *       500:
     *         description: Server error
     */
    const uploadPostImage = createMulterUpload(postImagesDestination);
    router.post(
        '/post-image',
        uploadPostImage.single('postImage'),
        responseForUploadedFile(domain, '/api/files/post-image/')
    );

    /**
     * @swagger
     * /api/files/post-image/{path}:
     *   get:
     *     summary: fetch post image
     *     description: Returns the requested post image as a binary file.
     *     tags:
     *       - Files
     *     parameters:
     *       - in: path
     *         name: path
     *         schema:
     *           type: string
     *         required: true
     *         description: path to the file in the static folder
     *     responses:
     *       200:
     *         description: A post image file
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
    router.use('/post-image', express.static(postImagesDestination));

    return router;
};
