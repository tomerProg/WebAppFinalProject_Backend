import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { createTestingAuthMiddlewareWithUser } from '../../authentication/__tests__/utils';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { createTestEnv } from '../../utils/tests';
import { User } from '../model';
import { createUsersRouter } from '../router';
import { EditUserRequest } from '../validators';

describe('users route', () => {
    const env = createTestEnv();
    const database = new Database(createDatabaseConfig(env));
    const { userModel } = database.getModels();

    const testUser: User & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        email: 'tomercpc01@gmail.com',
        username: 'king__doom',
        password: '123456'
    };
    const authMiddleware = jest.fn(
        createTestingAuthMiddlewareWithUser(testUser)
    );
    const usersRouter = createUsersRouter(authMiddleware, { userModel });
    const app = createTestingAppForRouter('/user', usersRouter);

    beforeAll(async () => {
        await database.start();
    });
    afterAll(async () => {
        await database.stop();
    });

    beforeEach(async () => {
        await userModel.create(testUser);
    });
    afterEach(async () => {
        await userModel.deleteMany();
    });

    test('edit user should edit the logged user only', async () => {
        const otherUserId = new Types.ObjectId();
        await userModel.create({
            ...testUser,
            _id: otherUserId,
            email: 'otherEmail@gmail.com'
        });
        const updatedUsername = 'new username';
        const response = await request(app)
            .put('/user')
            .send({
                username: updatedUsername
            } satisfies EditUserRequest['body']);

        expect(response.status).toBe(StatusCodes.OK);

        const afterUpdateTestUser = await userModel
            .findById(testUser._id)
            .lean();
        const afterUpdateOtherUser = await userModel
            .findById(otherUserId)
            .lean();
        expect(afterUpdateTestUser?.username).toStrictEqual(updatedUsername);
        expect(afterUpdateOtherUser).toBeDefined();
        expect(afterUpdateOtherUser?.username).not.toStrictEqual(
            updatedUsername
        );
    });

    test('edit user with not editable field should edit only the valid fields', async () => {
        const updatedUsername = 'new nick';
        const response = await request(app).put('/user').send({
            email: 'evil@mohaha.smile',
            password: 'evilPassword',
            username: updatedUsername
        });

        expect(response.status).toBe(StatusCodes.OK);

        const afterUpdateTestUser = await userModel
            .findById(testUser._id)
            .lean();
        expect(afterUpdateTestUser?.username).toStrictEqual(updatedUsername);
        expect(afterUpdateTestUser?.email).toStrictEqual(testUser.email);
        expect(afterUpdateTestUser?.password).toStrictEqual(testUser.password);
    });

    test('edit not existing user should return NOT_FOUND', async () => {
        await userModel.deleteOne({ _id: testUser._id });
        const updatedUsername = 'new nick';
        const response = await request(app).put('/user').send({
            email: 'evil@mohaha.smile',
            password: 'evilPassword',
            username: updatedUsername
        });

        expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
});
