import { RequestHandler, Router } from 'express';
import { AuthConfig } from './config';
import * as authHandlers from './handlers';
import { UserModel } from '../users/model';
import { AuthRouterDependencies } from './dependencies';

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
    register: authHandlers.register(dependencies.userModel)
});

export const createAuthRouter = (
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    /**
     * @swagger
     * /auth/register:
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
     * /auth/login:
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
    router.post('/login', handlers.login);

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     summary: Refresh tokens
     *     description: Refresh access and refresh tokens using the provided refresh token
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
     *                 refreshToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       400:
     *         description: Invalid refresh token
     *       500:
     *         description: Server error
     */
    router.post('/refresh', handlers.refresh);

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: User logout
     *     description: Logout user and invalidate the refresh token
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Successful logout
     *       400:
     *         description: Invalid refresh token
     *       500:
     *         description: Server error
     */
    router.post('/logout', handlers.logout);

    return router;
};
