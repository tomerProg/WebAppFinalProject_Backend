import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createTestingAppForRouter } from '../../services/server/__tests__/utils';
import { createTestEnv } from '../../utils/tests';
import { Post } from '../model';
import { createPostsRouter } from '../router';
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
        description: 'post description',
        suggestion: 'suggestion'
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
    
    describe('get post', () =>{
        test('user can get all posts', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherPost: Post & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                title: 'Other Title', 
                owner: otherUserId, 
                description: 'other description'
            }; 
            await postModel.create(otherPost);
                
            const response = await request(app).get('/post');
                
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(2);

            const expectedPosts = await postModel.find();
            
            expect(response.body.length).toBe(expectedPosts.length);
            for (let postIndex = 0; postIndex < expectedPosts.length; postIndex++){
                expect(response.body[postIndex]._id).toStrictEqual(expectedPosts[postIndex]._id.toString());
                expect(response.body[postIndex].title).toStrictEqual(expectedPosts[postIndex].title);
                expect(response.body[postIndex].description).toStrictEqual(expectedPosts[postIndex].description);
                expect(response.body[postIndex].suggestion).toStrictEqual(expectedPosts[postIndex].suggestion);
                expect(response.body[postIndex].imageSrc).toStrictEqual(expectedPosts[postIndex].imageSrc);
            }
        });
        
        test('user can search posts by owner', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherPostId = new Types.ObjectId();  
            const otherPost: Post & { _id: Types.ObjectId } = {
                _id: otherPostId,
                title: 'Other Title', 
                owner: otherUserId, 
                description: 'other description'
            }; 
            await postModel.create(otherPost);
                
            const response = await request(app).get('/post').send({owner: otherUserId});    
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(1);

            expect(response.body[0]._id).toBe(otherPost._id.toString());
            expect(response.body[0].owner).toBe(otherPost.owner);
            expect(response.body[0].description).toBe(otherPost.description);
            expect(response.body[0].title).toBe(otherPost.title);
            expect(response.body[0].suggestion).toBe(otherPost.suggestion);
            expect(response.body[0].imageSrc).toBe(otherPost.imageSrc);
        });
        
        test('user can search posts by title', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherPost: Post & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                title: 'Other Title', 
                owner: otherUserId, 
                description: 'other description'
            }; 
            await postModel.create(otherPost);
            
            const searchTitle = 'Title';
            const response = await request(app).get('/post').send({title: searchTitle});    
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(2);

            const expectedPosts = await postModel.find({title: { $regex: searchTitle, $options: 'i' } });
            expect(response.body.length).toBe(expectedPosts.length);
            for (let postIndex = 0; postIndex < expectedPosts.length; postIndex++){
                expect(response.body[postIndex]._id).toStrictEqual(expectedPosts[postIndex]._id.toString());
                expect(response.body[postIndex].title).toStrictEqual(expectedPosts[postIndex].title);
                expect(response.body[postIndex].description).toStrictEqual(expectedPosts[postIndex].description);
                expect(response.body[postIndex].suggestion).toStrictEqual(expectedPosts[postIndex].suggestion);
                expect(response.body[postIndex].imageSrc).toStrictEqual(expectedPosts[postIndex].imageSrc);
            }
        });
        test('user can search posts by title and owner', async () => {
            const otherUserId: string = new Types.ObjectId().toString();
            const otherPost: Post & { _id: Types.ObjectId } = {
                _id: new Types.ObjectId(),
                title: 'Other Title', 
                owner: otherUserId, 
                description: 'other description'
            }; 
            await postModel.create(otherPost);
            
            const searchTitle = 'Title';
            const response = await request(app).get('/post')
            .send({title: searchTitle,
                   owner: otherUserId});

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.length).toBe(1);
            expect(response.body[0]._id).toBe(otherPost._id.toString());
            expect(response.body[0].owner).toBe(otherPost.owner);
            expect(response.body[0].description).toBe(otherPost.description);
            expect(response.body[0].title).toBe(otherPost.title);
            expect(response.body[0].suggestion).toBe(otherPost.suggestion);
            expect(response.body[0].imageSrc).toBe(otherPost.imageSrc);
        });
        test('user can search a post by its id', async () => {
            const response = await request(app).get(`/post/${testPost._id}`);

            expect(response.status).toBe(StatusCodes.OK);
            
            expect(response.body._id).toBe(testPost._id.toString());
            expect(response.body.owner).toBe(testPost.owner);
            expect(response.body.description).toBe(testPost.description);
            expect(response.body.title).toBe(testPost.title);
            expect(response.body.suggestion).toBe(testPost.suggestion);
            expect(response.body.imageSrc).toBe(testPost.imageSrc);
        });
    })

    describe('edit post', () =>{
        test('user can edit his post', async () => {
            const updatedPostTitle = 'new title';
            const updatedDescription = 'new description'
            const response = await request(app)
                .put(`/post/${testPost._id}`)
                .send({
                    title: updatedPostTitle,
                    description: updatedDescription
                });
            expect(response.status).toBe(StatusCodes.OK);
            
            const afterUpdateTestUser = await postModel.findById(testPost._id).lean();
            
            expect(afterUpdateTestUser?.title).toStrictEqual(updatedPostTitle);
            expect(afterUpdateTestUser?.owner).toStrictEqual(testPost.owner);
            expect(afterUpdateTestUser?.description).toStrictEqual(updatedDescription);    
        });
        test('edit post with not editable field should edit only the valid fields', async () => {
            const updatedPostTitle = 'new title';
            const updatedDescription = 'new description'
            const response = await request(app).put(`/post/${testPost._id}`).send({
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
                .put(`/post/${otherPost._id}`)
                .send({
                    title: updatedPostTitle,
                });
            expect(response.status).toBe(StatusCodes.FORBIDDEN);
            
        });
    
        
    
        test('edit not existing post should return BAD_REQUEST', async () => {
            await postModel.deleteOne({ _id: testPost._id });
            const updatedPostTitle = 'new title';
            const response = await request(app).put(`/post/${testPost._id}`).send({
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
    
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).not.toBeNull();
            expect(response.body?.owner).toStrictEqual(loginUser._id.toString());
            expect(response.body?.title).toStrictEqual(testPost.title);
            expect(response.body?.description).toStrictEqual(testPost.description);
            expect(response.body?.suggestion).toStrictEqual(testPost.suggestion);
            expect(response.body?.imageSrc).toStrictEqual(testPost.imageSrc);
        });
    
        test('enforce the user who created the post to be the owner of the post', async () => {
            await postModel.deleteOne({ _id: testPost._id });
            const otherUserId: string = new Types.ObjectId().toString();
             
            const response = await request(app).post('/post').send({
                ...testPost,
                owner: otherUserId
            })
        
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).not.toBeNull();
            expect(response.body?.owner).toStrictEqual(loginUser._id.toString());
            expect(response.body?.title).toStrictEqual(testPost.title);
            expect(response.body?.description).toStrictEqual(testPost.description);
            expect(response.body?.suggestion).toStrictEqual(testPost.suggestion);
            expect(response.body?.imageSrc).toStrictEqual(testPost.imageSrc);
        });

        test('suggestion is generated if the user does not give one', async () => {
            const postWithoutSuggestion: Post = {
                title: 'Replacing light bulb',
                owner: loginUser._id.toString(),  
                description: 'Replacing old light bulb with a new one'
            }
            const response = await request(app).post('/post').send({
                ...postWithoutSuggestion,
                owner: loginUser._id.toString(),
            })
        
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).not.toBeNull();
            expect(response.body?.suggestion).not.toBeNull();

            expect(response.body?.owner).toStrictEqual(loginUser._id.toString());
            expect(response.body?.title).toStrictEqual(postWithoutSuggestion.title);
            expect(response.body?.description).toStrictEqual(postWithoutSuggestion.description);
            expect(response.body?.imageSrc).toStrictEqual(postWithoutSuggestion.imageSrc);
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
            const response = await request(app).delete(`/post/${testPost._id}`)
    
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
    
            const response = await request(app).delete(`/post/${otherPost._id}`)
    
            expect(response.status).toBe(StatusCodes.FORBIDDEN);
        });
    
        test('user cannot delete a post that does not exist', async () => {
            await postModel.deleteOne({ _id: testPost._id });
    
            const response = await request(app)
            .delete(`/post/${testPost._id}`);
    
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });    
    }) 
});
