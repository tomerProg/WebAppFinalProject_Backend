import express, { Router } from 'express';
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
    const { postImagesDestination, profileImagesDestination, serverUrl } =
        config;
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
        responseForUploadedFile(serverUrl, 'files/profile-image/')
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

    /**
     * @swagger
     * /files/post-image:
     *   post:
     *     tags:
     *       - Files
     *     summary: Uploads a prodile image.
     *       consumes:
     *         - multipart/form-data
     *       parameters:
     *         - in: formData
     *           name: postImage
     *           type: file
     *           description: profile image to upload.
     *     responses:
     *       200:
     *         description: url for requesting the uploaded image
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: https://backend/post/image
     *       401:
     *         description: request is unauthorized
     *       500:
     *         description: Server error
     */
    const uploadPostImage = createMulterUpload(postImagesDestination);
    router.post(
        '/post-image',
        uploadPostImage.single('postImage'),
        responseForUploadedFile(serverUrl , 'files/post-image/')
    );

    /**
     * @swagger
     * /files/post-image:
     *   get:
     *     summary: fetch post image
     *     description: Returns the requested post image as a binary file.
     *     tags:
     *       - User
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
    router.get('/post-image', express.static(postImagesDestination));

    return router;
};
