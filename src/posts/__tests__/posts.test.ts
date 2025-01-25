import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { createTestEnv } from '../../utils/tests';
import { Post } from '../model';
import { createPostsRouter } from '../router';
import { EditPostRequest } from '../validators';
import { User } from '../../users/model';
import { createTestingAuthMiddlewareWithUser } from '../../authentication/__tests__/utils';

describe('posts route', () => {
    const env = createTestEnv();
    const database = new Database(createDatabaseConfig(env));
    const { postModel } = database.getModels();
    
    const loginUser: User & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        email: 'user@gmail.com',
        password: 'password',
        username: 'testUser'
    }   


    const authMiddleware = jest.fn(
        createTestingAuthMiddlewareWithUser(loginUser)
    );

    const testPost: Post & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        title: 'Post Title', 
        owner: loginUser._id.toString(), 
        description: 'post description'
    };

    const postsRouter = createPostsRouter(authMiddleware, { postModel });
    const app = createTestingAppForRouter('/post', postsRouter);

    beforeAll(async () => {
        await database.start();
    });
    afterAll(async () => {
        await database.stop();
    });

    beforeEach(async () => {
        await postModel.create(testPost);
    });
    afterEach(async () => {
        await postModel.deleteMany();
    });

    test('user cannot edit post of other user', async () => {
        const otherUserId: string = new Types.ObjectId().toString();
        const otherPost: Post & { _id: Types.ObjectId } = {
            _id: new Types.ObjectId(),
            title: 'Other Title', 
            owner: otherUserId, 
            description: 'other description'
        }; 
        await postModel.create(otherPost);

        const updatedPostTitle = 'new title';
        
        const response = await request(app)
            .put('/post')
            .send({
                _id: otherPost._id.toString(),
                title: updatedPostTitle,
            });
        expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        
    });

    test('edit post with not editable field should edit only the valid fields', async () => {
        const updatedPostTitle = 'new title';
        const updatedDescription = 'new description'
        const response = await request(app).put('/post').send({
            ...testPost,
            title: updatedPostTitle, 
            owner: 'thief',
            description: updatedDescription
        });

        expect(response.status).toBe(StatusCodes.OK);

        const afterUpdateTestUser = await postModel
            .findById(testPost._id)
            .lean();
        expect(afterUpdateTestUser?.title).toStrictEqual(updatedPostTitle);
        expect(afterUpdateTestUser?.owner).toStrictEqual(testPost.owner);
        expect(afterUpdateTestUser?.description).toStrictEqual(updatedDescription);
    });

    test('edit not existing post should return BAD_REQUEST', async () => {
        await postModel.deleteOne({ _id: testPost._id });
        const updatedPostTitle = 'new title';
        const response = await request(app).put('/post').send({
            title: updatedPostTitle, 
            owner: testPost.owner,
            description: testPost.description 
        });

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });
});
