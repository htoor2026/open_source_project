import request from 'supertest';
import app from '../../index';
import { Post } from '../../infrastructure/mongodb/models/post';

jest.mock('../../infrastructure/mongodb/models/post');

const MockPost = Post as jest.Mocked<typeof Post>;

describe('Post Routes', () => {

  describe('GET /posts', () => {
    it('should return 200 and an array', async () => {
      (MockPost.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const res = await request(app).get('/posts');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /posts', () => {
    it('should return 401 without a token', async () => {
      const res = await request(app)
        .post('/posts')
        .send({ title: 'Test Post', body: 'Hello world' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 500 with an invalid post id', async () => {
      (MockPost.findById as jest.Mock).mockRejectedValue(new Error('Invalid ID'));

      const res = await request(app).get('/posts/invalidid');
      expect(res.status).toBe(500);
    });
  });

});
