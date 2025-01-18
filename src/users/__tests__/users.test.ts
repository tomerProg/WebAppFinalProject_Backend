import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { User } from '../model';
import { createUsersRouter } from '../router';
import { EditUserRequest } from '../validators';

describe('users route', () => {
    const testUser: User & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        email: 'tomercpc01@gmail.com',
        nickname: 'king__doom',
        password: '123456'
    };
    const usersRouter = createUsersRouter();
    const app = createTestingAppForRouter('/user', usersRouter);

    beforeAll(async () => {
        // await database.start();
    });
    afterAll(async () => {
        // await database.stop();
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
        const updatedNickName = 'new nickname';
        const response = await request(app)
            .put('/user')
            .send({
                nickname: updatedNickName
            } satisfies EditUserRequest['body']);

        expect(response.status).toBe(StatusCodes.OK);

        const afterUpdateTestUser = await userModel
            .findById(testUser._id)
            .lean();
        const afterUpdateOtherUser = await userModel
            .findById(otherUserId)
            .lean();
        expect(afterUpdateTestUser?.nickname).toStrictEqual(updatedNickName);
        expect(afterUpdateOtherUser).toBeDefined();
        expect(afterUpdateOtherUser?.nickname).not.toStrictEqual(
            updatedNickName
        );
    });

    test('edit user with not editable field should edit only the valid fields', async () => {
        const updatedNickName = 'new nick';
        const response = await request(app).put('/user').send({
            email: 'evil@mohaha.smile',
            password: 'evilPassword',
            nickname: updatedNickName
        });

        expect(response.status).toBe(StatusCodes.OK);

        const afterUpdateTestUser = await userModel
            .findById(testUser._id)
            .lean();
        expect(afterUpdateTestUser?.nickname).toStrictEqual(updatedNickName);
        expect(afterUpdateTestUser?.email).toStrictEqual(testUser.email);
        expect(afterUpdateTestUser?.password).toStrictEqual(testUser.password);
    });

    test('edit not existing user should return BAD_REQUEST', async () => {
        await userModel.deleteOne({ _id: testUser._id });
        const updatedNickName = 'new nick';
        const response = await request(app).put('/user').send({
            email: 'evil@mohaha.smile',
            password: 'evilPassword',
            nickname: updatedNickName
        });

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
});
