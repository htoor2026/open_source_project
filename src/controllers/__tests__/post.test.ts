import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

import app from '../../index';
import { Post } from '../../infrastructure/mongodb/models/post';
import { PostLike } from '../../infrastructure/mongodb/models/postLike';

jest.mock('../../infrastructure/mongodb/models/post');
jest.mock('../../infrastructure/mongodb/models/postLike');

const userToken  = jwt.sign({ sub: 'user1', role: 'user'  }, 'test-secret', { expiresIn: '1h' });
const adminToken = jwt.sign({ sub: 'admin1', role: 'admin' }, 'test-secret', { expiresIn: '1h' });

describe('Post Routes', () => {

  describe('GET /posts', () => {
    it('should return 200 and an array', async () => {
      (Post.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      const res = await request(app).get('/posts');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 404 for missing post', async () => {
      (Post.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/posts/64f0000000000000000000001');
      expect(res.status).toBe(404);
    });

    it('should return 500 with invalid id', async () => {
      (Post.findById as jest.Mock).mockRejectedValue(new Error('Invalid ID'));
      const res = await request(app).get('/posts/invalidid');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /posts', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).post('/posts').send({ title: 'T', body: 'B' });
      expect(res.status).toBe(401);
    });

    it('should create post with valid token', async () => {
      (Post.create as jest.Mock).mockResolvedValue({ _id: 'p1', title: 'T', body: 'B', authorId: 'user1' });
      const res = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'T', body: 'B' });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update post if owner', async () => {
      (Post.findById as jest.Mock).mockResolvedValue({
        _id: 'p1', title: 'Old', body: 'Old', authorId: 'user1',
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request(app)
        .put('/posts/p1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New' });
      expect(res.status).toBe(200);
    });

    it('should return 403 if not owner', async () => {
      (Post.findById as jest.Mock).mockResolvedValue({
        _id: 'p1', title: 'Old', body: 'Old', authorId: 'otheruser',
        save: jest.fn()
      });
      const res = await request(app)
        .put('/posts/p1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New' });
      expect(res.status).toBe(403);
    });

    it('should allow admin to edit any post', async () => {
      (Post.findById as jest.Mock).mockResolvedValue({
        _id: 'p1', title: 'Old', body: 'Old', authorId: 'otheruser',
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request(app)
        .put('/posts/p1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'New' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /posts/:id/like', () => {
    it('should like a post', async () => {
      (PostLike.findOne as jest.Mock).mockResolvedValue(null);
      (PostLike.create as jest.Mock).mockResolvedValue({});
      const res = await request(app)
        .post('/posts/p1/like')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(201);
    });

    it('should unlike if already liked', async () => {
      (PostLike.findOne as jest.Mock).mockResolvedValue({ deleteOne: jest.fn().mockResolvedValue(true) });
      const res = await request(app)
        .post('/posts/p1/like')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Post unliked');
    });
  });

});
