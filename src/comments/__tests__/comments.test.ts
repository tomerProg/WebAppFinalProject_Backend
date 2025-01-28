import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { createTestEnv } from '../../utils/tests';
import { Comment } from '../model';
import { createCommentsRouter } from '../router';
import { User } from '../../users/model';
import { createTestingAuthMiddlewareWithUser } from '../../authentication/__tests__/utils';
import { Post, postModel } from '../../posts/model';

describe('comments route', () => {
    const env = createTestEnv();
    const database = new Database(createDatabaseConfig(env));
    const { commentModel } = database.getModels();
    
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
        title: 'Comment Title', 
        owner: loginUser._id.toString(), 
        description: 'comment description'
    };

    const testComment: Comment & { _id: Types.ObjectId } = {
        _id: new Types.ObjectId(),
        owner: loginUser._id.toString(),
        postId: testPost._id.toString(), 
        content: 'Testing comment content'
    };

    const commentsRouter = createCommentsRouter(authMiddleware, { commentModel });
    const app = createTestingAppForRouter('/comment', commentsRouter);

    beforeAll(async () => {
        await database.start();
    });
    afterAll(async () => {
        await database.stop();
    });

    afterEach(async () => {
        await postModel.deleteMany();
        await commentModel.deleteMany();
    });
    beforeEach(async () => {
        await postModel.create(testPost);
        await commentModel.create(testComment);
    });
    
    describe('get comment', () =>{
        test('user can get all comments of a comment', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const samePostComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(samePostComment);
            
            const differentPostComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: new Types.ObjectId().toString(),
                content: 'different post content'
            }; 
            await commentModel.create(differentPostComment);

            const response = await request(app).get(`/comment?postId=${testPost._id}`)
                
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(2);

            const expectedComments = await commentModel.find({postId: testPost._id});
            
            expect(response.body.length).toBe(expectedComments.length);
            for (let commentIndex = 0; commentIndex < expectedComments.length; commentIndex++){
                expect(response.body[commentIndex]._id).toStrictEqual(expectedComments[commentIndex]._id.toString());
                expect(response.body[commentIndex].owner).toStrictEqual(expectedComments[commentIndex].owner);
                expect(response.body[commentIndex].postId).toStrictEqual(expectedComments[commentIndex].postId);
                expect(response.body[commentIndex].content).toStrictEqual(expectedComments[commentIndex].content);
            }
        });

        test('user cannot get comments without a post id', async () => {    
            const response = await request(app).get('/comment');
                
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
        
        test('user can search a comment by its id', async () => {
            const response = await request(app).get(`/comment/${testComment._id}`);

            expect(response.status).toBe(StatusCodes.OK);
            
            expect(response.body._id).toBe(testComment._id.toString());
            expect(response.body.owner).toBe(testComment.owner);
            expect(response.body.postId).toBe(testComment.postId);
            expect(response.body.content).toBe(testComment.content);
        });
    });

    describe('edit comment', () =>{
        test('user can edit comment conentent', async () => {
            const updatedContent = 'new content';
            
            const response = await request(app)
                .put(`/comment/${testComment._id}`)
                .send({
                    content: updatedContent,
                });
            expect(response.status).toBe(StatusCodes.OK);        

            const afterUpdateTestUser = await commentModel.findById(testComment._id).lean();
            
            expect(afterUpdateTestUser?.owner).toStrictEqual(testComment.owner);
            expect(afterUpdateTestUser?.postId).toStrictEqual(testComment.postId);
            expect(afterUpdateTestUser?.content).toStrictEqual(updatedContent);
        });
        
        test('edit comment with not editable field should edit only the valid fields', async () => {
            const updatedContent = 'new content';
            
            const response = await request(app).put(`/comment/${testComment._id}`).send({
                ...testComment, 
                owner: 'thief owner',
                postId: 'thief post',
                content: updatedContent
            });
    
            expect(response.status).toBe(StatusCodes.OK);
    
            const afterUpdateTestUser = await commentModel.findById(testComment._id).lean();
            
            expect(afterUpdateTestUser?.owner).toStrictEqual(testComment.owner);
            expect(afterUpdateTestUser?.postId).toStrictEqual(testComment.postId);
            expect(afterUpdateTestUser?.content).toStrictEqual(updatedContent);
        });

        test('user cannot edit comment of other user', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
    
            const updatedContent = 'new content';
            
            const response = await request(app)
                .put(`/comment/${otherComment._id}`)
                .send({
                    content: updatedContent,
                });
            expect(response.status).toBe(StatusCodes.FORBIDDEN);        
        });
    
        test('edit not existing comment should return BAD_REQUEST', async () => {
            await commentModel.deleteOne({ _id: testComment._id });
            const updatedContent = 'new content';
            const response = await request(app).put(`/comment/${testComment._id}`).send({
                content: updatedContent 
            });
    
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });    
    });

    describe('create comment', () =>{
        test('user creates a comment', async () => { 
            await commentModel.deleteOne({ _id: testComment._id });
            
            const response = await request(app).post('/comment').send({...testComment})
    
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).not.toBeNull();
            expect(response.body?.owner).toStrictEqual(loginUser._id.toString());
            expect(response.body?.postId).toStrictEqual(testComment.postId);
            expect(response.body?.content).toStrictEqual(testComment.content);
        });
    
        test('enforce the user who created the comment to be the owner of the comment', async () => {
            await commentModel.deleteOne({ _id: testComment._id });
            const otherUserId: string = new Types.ObjectId().toString();
             
            const response = await request(app).post('/comment').send({
                ...testComment,
                owner: otherUserId
            })

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).not.toBeNull();
            expect(response.body?.owner).toStrictEqual(loginUser._id.toString());
            expect(response.body?.postId).toStrictEqual(testComment.postId);
            expect(response.body?.content).toStrictEqual(testComment.content);
        });
    
        test('user cannot create comment without required fields', async () => {
            await commentModel.deleteOne({ _id: testComment._id });
    
            const response = await request(app).post('/comment').send({
                content: testComment.content            
            });
    
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });    
    })

    describe('delete comment', () => {
        test('user deletes a comment', async () => {
            const response = await request(app).delete(`/comment/${testComment._id}`)
    
            const deletedComment = await commentModel.findById(testComment._id).lean();
    
            expect(response.status).toBe(StatusCodes.OK);
            expect(deletedComment).toBeNull();
        });
    
        test('user cannot delete a comment which belongs to other', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
    
            const response = await request(app).delete(`/comment/${otherComment._id}`)
            const existingComment = await commentModel.findById(otherComment._id).lean();
    
            expect(response.status).toBe(StatusCodes.FORBIDDEN);
            expect(existingComment).not.toBeNull();
            expect(existingComment?._id).toStrictEqual(otherComment._id);
            expect(existingComment?.owner).toStrictEqual(otherComment.owner);
            expect(existingComment?.postId).toStrictEqual(otherComment.postId);
            expect(existingComment?.content).toStrictEqual(otherComment.content);
        });
    
        test('user cannot delete a comment that does not exist', async () => {
            await commentModel.deleteOne({ _id: testComment._id });
    
            const response = await request(app)
            .delete(`/comment/${testComment._id}`);
    
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });    
    }); 
});
