import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { createTestingAuthMiddlewareWithPost } from '../../authentication/__tests__/utils';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { createTestEnv } from '../../utils/tests';
import { Post } from '../model';
import { createPostsRouter } from '../router';
import { EditPostRequest } from '../validators';

describe('posts route', () => {
    const env = createTestEnv();
    const database = new Database(createDatabaseConfig(env));
    const { postModel } = database.getModels();

    const testPost: Post & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        title: 'Post Title', 
        owner: 'post owner', 
        description: 'post description'
    };
    const authMiddleware = jest.fn(
        createTestingAuthMiddlewareWithPost(testPost)
    );
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

    test('edit post should not edit other post', async () => {
        const otherPostId = new Types.ObjectId();
        await postModel.create({
            ...testPost,
            _id: otherPostId,
            email: 'otherEmail@gmail.com'
        });
        const updatedPostTitle = 'new title';
        const response = await request(app)
            .put('/post')
            .send({
                title: updatedPostTitle
            } satisfies EditPostRequest['body']);

        expect(response.status).toBe(StatusCodes.OK);

        const afterUpdateTestPost = await postModel
            .findById(testPost._id)
            .lean();
        const afterUpdateOtherPost = await postModel
            .findById(otherPostId)
            .lean();
        expect(afterUpdateTestPost?.title).toStrictEqual(updatedPostTitle);
        expect(afterUpdateOtherPost).toBeDefined();
        expect(afterUpdateOtherPost?.title).not.toStrictEqual(updatedPostTitle);
    });

    test('edit post with not editable field should edit only the valid fields', async () => {
        const updatedPostTitle = 'new title';
        const updatedDescription = 'new description'
        const response = await request(app).put('/post').send({
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
