import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

import app from '../../index';
import { Comment } from '../../infrastructure/mongodb/models/comment';

jest.mock('../../infrastructure/mongodb/models/comment');

const userToken  = jwt.sign({ sub: 'user1', role: 'user'  }, 'test-secret', { expiresIn: '1h' });
const adminToken = jwt.sign({ sub: 'admin1', role: 'admin' }, 'test-secret', { expiresIn: '1h' });

describe('Comment Routes', () => {

  describe('GET /posts/:postId/comments', () => {
    it('should return all comments for a post', async () => {
      (Comment.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ body: 'Nice post', authorId: 'user1' }])
      });
      const res = await request(app).get('/posts/post1/comments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /posts/:postId/comments', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/posts/post1/comments')
        .send({ body: 'Hello' });
      expect(res.status).toBe(401);
    });

    it('should create a comment with valid token', async () => {
      (Comment.create as jest.Mock).mockResolvedValue({
        _id: 'c1', postId: 'post1', authorId: 'user1', body: 'Hello'
      });
      const res = await request(app)
        .post('/posts/post1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ body: 'Hello' });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /posts/:postId/comments/:commentId', () => {
    it('should edit comment if owner', async () => {
      (Comment.findById as jest.Mock).mockResolvedValue({
        _id: 'c1', authorId: 'user1', body: 'Old',
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request(app)
        .put('/posts/post1/comments/c1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ body: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 403 if not owner', async () => {
      (Comment.findById as jest.Mock).mockResolvedValue({
        _id: 'c1', authorId: 'otheruser', body: 'Old',
        save: jest.fn()
      });
      const res = await request(app)
        .put('/posts/post1/comments/c1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ body: 'Updated' });
      expect(res.status).toBe(403);
    });

    it('should allow admin to edit any comment', async () => {
      (Comment.findById as jest.Mock).mockResolvedValue({
        _id: 'c1', authorId: 'otheruser', body: 'Old',
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request(app)
        .put('/posts/post1/comments/c1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ body: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 if comment not found', async () => {
      (Comment.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .put('/posts/post1/comments/c1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ body: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /posts/:postId/comments/:commentId', () => {
    it('should delete comment if owner', async () => {
      (Comment.findById as jest.Mock).mockResolvedValue({
        _id: 'c1', authorId: 'user1',
        deleteOne: jest.fn().mockResolvedValue(true)
      });
      const res = await request(app)
        .delete('/posts/post1/comments/c1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 403 if not owner', async () => {
      (Comment.findById as jest.Mock).mockResolvedValue({
        _id: 'c1', authorId: 'otheruser',
        deleteOne: jest.fn()
      });
      const res = await request(app)
        .delete('/posts/post1/comments/c1')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

});
