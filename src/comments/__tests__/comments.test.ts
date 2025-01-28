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
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
                
            const response = await request(app).get('/comment').send({postId: testPost._id});
                
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(2);

            const expectedComments = await commentModel.find();
            
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
        
        test('user can search comments by owner', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
               
            const response = await request(app).get('/comment').send({
                owner: otherUserId,
                postId: testPost._id
            });    
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(1);

            expect(response.body[0]._id).toBe(otherComment._id.toString());
            expect(response.body[0].owner).toBe(otherComment.owner);
            expect(response.body[0].postId).toBe(otherComment.postId);
            expect(response.body[0].content).toBe(otherComment.content);
        });
        
        test('user can search comments by content', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
            
            const searchContent = 'content';

            const response = await request(app).get('/comment').send({
                postId: testPost._id,
                content: searchContent
            });    
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(2);

            const expectedComments = await commentModel.find({
                postId: testPost._id,
                content: { $regex: searchContent, $options: 'i' } });
            
            expect(response.body.length).toBe(expectedComments.length);
            
            for (let commentIndex = 0; commentIndex < expectedComments.length; commentIndex++){
                expect(response.body[commentIndex]._id).toStrictEqual(expectedComments[commentIndex]._id.toString());
                expect(response.body[commentIndex].owner).toStrictEqual(expectedComments[commentIndex].owner);
                expect(response.body[commentIndex].postId).toStrictEqual(expectedComments[commentIndex].postId);
                expect(response.body[commentIndex].content).toStrictEqual(expectedComments[commentIndex].content);
            }
        });
        test('user can search comments by content and owner', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
                        
            const searchContent = 'content';
            const response = await request(app).get('/comment').send({
                postId: testPost._id,
                owner: otherUserId,
                content: searchContent
            });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(1);
            expect(response.body[0]._id).toBe(otherComment._id.toString());
            expect(response.body[0].owner).toBe(otherComment.owner);
            expect(response.body[0].postId).toBe(otherComment.postId);
            expect(response.body[0].content).toBe(otherComment.content);
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
        test('user cannot edit comment of other user', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherComment: Comment & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                owner: otherUserId, 
                postId: testPost._id.toString(),
                content: 'other content'
            }; 
            await commentModel.create(otherComment);
    
            const updatedCommentContent = 'new content';
            
            const response = await request(app)
                .put(`/comment/${otherComment._id}`)
                .send({
                    content: updatedCommentContent,
                });
            expect(response.status).toBe(StatusCodes.FORBIDDEN);
            
        });
    
    //     test('edit comment with not editable field should edit only the valid fields', async () => {
    //         const updatedCommentTitle = 'new title';
    //         const updatedDescription = 'new description'
    //         const response = await request(app).put(`/comment/${testComment._id}`).send({
    //             ...testComment,
    //             title: updatedCommentTitle, 
    //             owner: 'thief',
    //             description: updatedDescription
    //         });
    
    //         expect(response.status).toBe(StatusCodes.OK);
    
    //         const afterUpdateTestUser = await commentModel.findById(testComment._id).lean();
    
    //         expect(afterUpdateTestUser?.title).toStrictEqual(updatedCommentTitle);
    //         expect(afterUpdateTestUser?.owner).toStrictEqual(testComment.owner);
    //         expect(afterUpdateTestUser?.description).toStrictEqual(updatedDescription);
    //     });
    
    //     test('edit not existing comment should return BAD_REQUEST', async () => {
    //         await commentModel.deleteOne({ _id: testComment._id });
    //         const updatedCommentTitle = 'new title';
    //         const response = await request(app).put(`/comment/${testComment._id}`).send({
    //             title: updatedCommentTitle, 
    //             owner: testComment.owner,
    //             description: testComment.description 
    //         });
    
    //         expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    //     });    
    });

    // describe('create comment', () =>{
    //     test('user creates a comment', async () => { 
    //         await commentModel.deleteOne({ _id: testComment._id });
            
    //         const response = await request(app)
    //         .comment('/comment').send({...testComment})
    
    //         const createdComment = await commentModel.findById(testComment._id).lean();
    
    //         expect(response.status).toBe(StatusCodes.OK);
    //         expect(createdComment).not.toBeNull();
    //         expect(createdComment?.owner).toStrictEqual(loginUser._id.toString())
    //     });
    
    //     test('enforce the user who created the comment to be the owner of the comment', async () => {
    //         await commentModel.deleteOne({ _id: testComment._id });
    //         const otherUserId: string = new Types.ObjectId().toString();
             
    //         const response = await request(app).comment('/comment').send({
    //             ...testComment,
    //             owner: otherUserId
    //         })
    
    //         const createdComment = await commentModel.findById(testComment._id).lean();
    
    //         expect(response.status).toBe(StatusCodes.OK);
    //         expect(createdComment).not.toBeNull();
    //         expect(createdComment?.owner).toStrictEqual(loginUser._id.toString())
    
    //     });
    
    //     test('user cannot create comment without required fields', async () => {
    //         await commentModel.deleteOne({ _id: testComment._id });
    
    //         const response = await request(app)
    //         .comment('/comment').send({
    //             title: testComment.title            
    //         })
    
    //         expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    //     });    
    // })

    // describe('delete comment', () => {
    //     test('user deletes a comment', async () => {
    //         const response = await request(app).delete(`/comment/${testComment._id}`)
    
    //         const deletedComment = await commentModel.findById(testComment._id).lean();
    
    //         expect(response.status).toBe(StatusCodes.OK);
    //         expect(deletedComment).toBeNull();
    //     });
    
    //     test('user cannot delete other comment', async () => {
    //         const otherUserId: string = new Types.ObjectId().toString();
    //         const otherComment: Comment & { _id: Types.ObjectId } = {
    //             _id: new Types.ObjectId(),
    //             title: 'Other Title', 
    //             owner: otherUserId, 
    //             description: 'other description'
    //         }; 
    //         await commentModel.create(otherComment);
    
    //         const response = await request(app).delete(`/comment/${otherComment._id}`)
    
    //         expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    //     });
    
    //     test('user cannot delete a comment that does not exist', async () => {
    //         await commentModel.deleteOne({ _id: testComment._id });
    
    //         const response = await request(app)
    //         .delete(`/comment/${testComment._id}`);
    
    //         expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    //     });    
    // }) 
});
