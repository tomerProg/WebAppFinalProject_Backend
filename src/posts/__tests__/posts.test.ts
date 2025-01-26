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

    afterEach(async () => {
        await postModel.deleteMany();
    });
    beforeEach(async () => {
        await postModel.create(testPost);
    });

    describe('edit post', () =>{
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
    
            const afterUpdateTestUser = await postModel.findById(testPost._id).lean();
    
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
    })

    describe('create post', () =>{
        test('user creates a post', async () => { 
            await postModel.deleteOne({ _id: testPost._id });
            
            const response = await request(app)
            .post('/post').send({...testPost})
    
            const createdPost = await postModel.findById(testPost._id).lean();
    
            expect(response.status).toBe(StatusCodes.OK);
            expect(createdPost).not.toBeNull();
            expect(createdPost?.owner).toStrictEqual(loginUser._id.toString())
        });
    
        test('enforce the user who created the post to be the owner of the post', async () => {
            await postModel.deleteOne({ _id: testPost._id });
            const otherUserId: string = new Types.ObjectId().toString();
             
            const response = await request(app).post('/post').send({
                ...testPost,
                owner: otherUserId
            })
    
            const createdPost = await postModel.findById(testPost._id).lean();
    
            expect(response.status).toBe(StatusCodes.OK);
            expect(createdPost).not.toBeNull();
            expect(createdPost?.owner).toStrictEqual(loginUser._id.toString())
    
        });
    
        test('user cannot create post without required fields', async () => {
            await postModel.deleteOne({ _id: testPost._id });
    
            const response = await request(app)
            .post('/post').send({
                title: testPost.title            
            })
    
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });    
    })


    describe('delete post', () => {
        test('user deletes a post', async () => {
            const response = await request(app).delete('/post')
            .send({_id: testPost._id});
    
            const deletedPost = await postModel.findById(testPost._id).lean();
    
            expect(response.status).toBe(StatusCodes.OK);
            expect(deletedPost).toBeNull();
        });
    
        test('user cannot delete other post', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherPost: Post & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                title: 'Other Title', 
                owner: otherUserId, 
                description: 'other description'
            }; 
            await postModel.create(otherPost);
    
            const response = await request(app)
            .delete('/post').send({
                _id: otherPost._id       
            })
    
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });
    
        test('user cannot delete a post that does not exist', async () => {
            await postModel.deleteOne({ _id: testPost._id });
    
            const response = await request(app)
            .delete('/post').send({
                _id: testPost._id       
            })
    
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });    
    }) 
});
