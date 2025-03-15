import { RequestHandler, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthConfig } from './config';
import { AuthRouterDependencies } from './dependencies';
import * as authHandlers from './controller';
import axios from 'axios';
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const buildRouteHandlers = (
    config: AuthConfig,
    dependencies: AuthRouterDependencies
): Record<keyof typeof authHandlers, RequestHandler> => ({
    login: authHandlers.login(config, dependencies.userModel),
    logout: authHandlers.logout(config.tokenSecret),
    refresh: authHandlers.refresh(config),
    register: authHandlers.register(dependencies.userModel),
    googleLogin: authHandlers.googleLogin(
        config,
        dependencies.userModel,
        dependencies.googleAuthClient
    )
});

export const createAuthRouter = (
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: registers a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: The new user
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    router.post('/register', handlers.register);

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: User login
     *     description: Authenticate user and return tokens
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/User'
     *     responses:
     *       200:
     *         description: Successful login
     *         headers:
     *           Set-Cookie:
     *             schema:
     *               type: string
     *               example: refresh-token=someAuthToken123; HttpOnly;
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: access token for the user
     *                 _id:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: the user id
     *       400:
     *         description: Invalid credentials or request
     *       500:
     *         description: Server error
     */
    router.post('/login', handlers.login);

    /**
     * @swagger
     * /api/auth/refresh:
     *   get:
     *     summary: Refresh tokens
     *     description: Refresh access and refresh tokens using the provided refresh token
     *     tags:
     *       - Auth
     *     parameters:
     *       - in: cookie
     *         name: refresh-token
     *         schema:
     *           type: string
     *         required: true
     *         description: user jwt refresh token
     *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Tokens refreshed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: access token for the user
     *                 _id:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: the user id
     *       400:
     *         description: Invalid refresh token
     *       500:
     *         description: Server error
     */
    router.get('/refresh', handlers.refresh);

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: User logout
     *     description: Logout user and invalidate the refresh token
     *     tags:
     *       - Auth
     *     parameters:
     *       - in: cookie
     *         name: refresh-token
     *         schema:
     *           type: string
     *         required: true
     *         description: user jwt refresh token
     *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Successful logout
     *       400:
     *         description: Invalid refresh token
     *       500:
     *         description: Server error
     */
    router.post('/logout', handlers.logout);

    /**
     * @swagger
     * /api/auth/google/sign-in:
     *   post:
     *     summary: User login via google
     *     description: Authenticate user using google and return tokens
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               credential:
     *                 type: string
     *                 required: true
     *     responses:
     *       200:
     *         description: Successful login
     *         headers:
     *           Set-Cookie:
     *             schema:
     *               type: string
     *               example: refresh-token=someAuthToken123; HttpOnly;
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                 refreshToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                 _id:
     *                   type: string
     *                   example: 60d0fe4f5311236168a109ca
     *       400:
     *         description: Invalid credentials or request
     *       500:
     *         description: Server error
     */
    router.post('/google-login', handlers.googleLogin);

    return router;
};
