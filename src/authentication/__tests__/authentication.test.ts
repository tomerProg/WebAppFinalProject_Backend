import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { GoogleAuthClient } from '../../googleAuth/google.auth';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { User } from '../../users/model';
import { createTestEnv } from '../../utils/tests';
import { createAuthConfig } from '../config';
import { createAuthMiddleware } from '../middlewares';
import { createAuthRouter } from '../router';
import { generateTokens, hashPassword } from '../utils';

describe('authentication tests', () => {
    const env = createTestEnv({ AUTH_TOKEN_EXPIRES: '3s' });
    const authConfig = createAuthConfig(env);
    const database = new Database(createDatabaseConfig(env));
    const { userModel } = database.getModels();
    const googleAuthClientMock = {
        verifyCredential: jest.fn()
    } satisfies Record<keyof GoogleAuthClient, jest.Mock>;
    const authRouter = createAuthRouter(createAuthConfig(env), {
        userModel,
        googleAuthClient: googleAuthClientMock as any
    });
    const app = createTestingAppForRouter('/auth', authRouter);
    const testAuthenticatedRoute = '/authTestRoute';
    app.get(
        testAuthenticatedRoute,
        createAuthMiddleware(authConfig.tokenSecret),
        (_req, res) => {
            res.sendStatus(StatusCodes.OK);
        }
    );

    const routeInAuthRouter = (route: string) => '/auth' + route;
    const testUser: User = {
        email: 'tomercpc01@gmail.com',
        password: '123456',
        username: 'tester'
    };

    const loginUser = async (user: User) => {
        const response = await request(app)
            .post(routeInAuthRouter('/login'))
            .send(user);
        expect(response.status).toBe(StatusCodes.OK);

        return response;
    };

    beforeAll(async () => {
        await database.start();
    });
    afterAll(async () => {
        await database.stop();
    });
    beforeEach(async () => {
        const hashedPassword = await hashPassword(testUser.password);
        await userModel.create({ ...testUser, password: hashedPassword });
    });
    afterEach(async () => {
        await userModel.deleteMany();
    });

    describe('register', () => {
        beforeEach(async () => {
            await userModel.deleteMany();
        });

        const registerUser = (user: User) =>
            request(app).post(routeInAuthRouter('/register')).send(user);

        test('register new user shold create user', async () => {
            const response = await registerUser(testUser);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        test('register exisitng user shold return BAD_REQUEST', async () => {
            const registerResponse = await registerUser(testUser);
            const registerExistingResponse = await registerUser({
                ...testUser,
                password: 'otherPassword'
            });

            expect(registerResponse.status).toBe(StatusCodes.CREATED);
            expect(registerExistingResponse.status).toBe(
                StatusCodes.BAD_REQUEST
            );
        });

        test('missing email shold return BAD_REQUEST', async () => {
            const user: Partial<User> = {
                password: '123456'
            };
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing password shold return BAD_REQUEST', async () => {
            const user: Partial<User> = {
                email: 'tomercpc01@gmail.com'
            };
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('login', () => {
        test('user login should return tokens', async () => {
            const response = await loginUser(testUser);
            const { accessToken, refreshToken } = response.body;

            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(response.body._id).toBeDefined();
        });

        test('login should return different tokens for each login', async () => {
            const firstLogin = await loginUser(testUser);
            const secondLogin = await loginUser(testUser);

            const {
                accessToken: firstLoginAccesToken,
                refreshToken: firstLoginRefreshToken
            } = firstLogin.body;
            const {
                accessToken: secondLoginAccesToken,
                refreshToken: secondLoginRefreshToken
            } = secondLogin.body;
            expect(firstLoginAccesToken).not.toBe(secondLoginAccesToken);
            expect(firstLoginRefreshToken).not.toBe(secondLoginRefreshToken);
        });

        test('incorrect password should return BAD_REQUEST', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/login'))
                .send({
                    ...testUser,
                    password: 'randomPassword'
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('incorrect email should return BAD_REQUEST', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/login'))
                .send({
                    ...testUser,
                    email: 'randomEmail'
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('logout', () => {
        test('logout should remove all user refresh tokens', async () => {
            const loginResponse = await loginUser(testUser);
            expect(loginResponse.statusCode).toBe(StatusCodes.OK);
            const { refreshToken, _id: userId } = loginResponse.body;

            const logoutResponse = await request(app)
                .post(routeInAuthRouter('/logout'))
                .send({ refreshToken });
            expect(logoutResponse.statusCode).toBe(StatusCodes.OK);

            const user = await userModel.findById(userId);
            expect(user).toBeDefined();
            expect(user!.refreshToken?.length).toBe(0);
        });
    });

    describe('refresh token', () => {
        test('not existing refresh token should return BAD_REQUEST and empty user refresh tokens', async () => {
            const loginResponse = await loginUser(testUser);
            const userId = loginResponse.body._id;
            const tokens = generateTokens(authConfig, userId)!;
            expect(tokens).toBeDefined();
            const { refreshToken } = tokens!;

            const refreshResponse = await request(app)
                .post(routeInAuthRouter('/refresh'))
                .send({ refreshToken });

            const user = await userModel.findById(userId);
            expect(refreshResponse.status).toBe(StatusCodes.BAD_REQUEST);
            expect(user?.refreshToken?.length).toBe(0);
        });

        test('refresh should insert new refresh token to user', async () => {
            const loginResponse = await loginUser(testUser);
            const { _id: userId, refreshToken } = loginResponse.body;
            const refreshResponse = await request(app)
                .post(routeInAuthRouter('/refresh'))
                .send({ refreshToken });

            const user = await userModel.findById(userId);
            expect(refreshResponse.status).toBe(StatusCodes.OK);
            expect(user?.refreshToken?.length).toBeGreaterThan(0);
            expect(user?.refreshToken).not.toContain(refreshToken);
        });

        const requestAuthenticatedRoute = (accessToken: string) =>
            request(app)
                .get(testAuthenticatedRoute)
                .set({ authorization: 'JWT ' + accessToken });

        test('refresh expired token should return valid token', async () => {
            const loginResponse = await loginUser(testUser);
            const { refreshToken, accessToken } = loginResponse.body;
            // wait for the token to expire
            await new Promise((resolve) => setTimeout(resolve, 5_000));

            const createPostResponse = await requestAuthenticatedRoute(
                accessToken
            );
            expect(createPostResponse.status).toBe(StatusCodes.UNAUTHORIZED);

            const refreshResponse = await request(app)
                .post(routeInAuthRouter('/refresh'))
                .send({ refreshToken });
            expect(refreshResponse.status).toBe(StatusCodes.OK);
            const newAccessToken = refreshResponse.body.accessToken;

            const createPostResponseWithValidToken =
                await requestAuthenticatedRoute(newAccessToken);
            expect(createPostResponseWithValidToken.status).toBe(
                StatusCodes.OK
            );
        }, 10_000);
    });

    describe('google auth', () => {
        googleAuthClientMock.verifyCredential.mockResolvedValue({
            email: testUser.email
        });

        test('first time user login should create user', async () => {
            await userModel.deleteMany();
            const userBefore = await userModel.findOne({
                email: testUser.email
            });
            const response = await request(app)
                .post(routeInAuthRouter('/google-login'))
                .send({
                    credential: 'someCredential'
                });
            const userAfter = await userModel.findOne({
                email: testUser.email
            });

            expect(response.status).toBe(StatusCodes.OK);
            expect(userBefore).toBeNull();
            expect(userAfter).toBeDefined();
            expect(response.body._id).toStrictEqual(userAfter?._id.toString());
        });

        test('first time user login should create user', async () => {
            const userBefore = await userModel.findOne({
                email: testUser.email
            });
            const response = await request(app)
                .post(routeInAuthRouter('/google-login'))
                .send({
                    credential: 'someCredential'
                });
            expect(response.status).toBe(StatusCodes.OK);
            const { accessToken, refreshToken } = response.body;

            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(response.body._id).toBeDefined();
            expect(userBefore).toBeDefined();
            expect(response.body._id).toStrictEqual(userBefore?._id.toString());
        });
    });
});
