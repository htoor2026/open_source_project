import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

import app from '../../index';
import { User } from '../../infrastructure/mongodb/models/user';
import { Post } from '../../infrastructure/mongodb/models/post';
import { Comment } from '../../infrastructure/mongodb/models/comment';
import { PostLike } from '../../infrastructure/mongodb/models/postLike';

jest.mock('../../infrastructure/mongodb/models/user');
jest.mock('../../infrastructure/mongodb/models/post');
jest.mock('../../infrastructure/mongodb/models/comment');
jest.mock('../../infrastructure/mongodb/models/postLike');

const adminToken = jwt.sign({ sub: 'admin1', role: 'admin' }, 'test-secret', { expiresIn: '1h' });
const userToken  = jwt.sign({ sub: 'user1',  role: 'user'  }, 'test-secret', { expiresIn: '1h' });

describe('Admin Routes', () => {

  describe('GET /admin/stats', () => {
    it('should return stats for admin user', async () => {
      (User.countDocuments as jest.Mock).mockResolvedValue(10);
      (Post.countDocuments as jest.Mock).mockResolvedValue(20);
      (Comment.countDocuments as jest.Mock).mockResolvedValue(30);
      (PostLike.countDocuments as jest.Mock).mockResolvedValue(40);

      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ totalUsers: 10, totalPosts: 20, totalComments: 30, totalLikes: 40 });
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/admin/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /admin/users', () => {
    it('should return list of users for admin', async () => {
      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ username: 'testuser', role: 'user' }])
      });

      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

});
