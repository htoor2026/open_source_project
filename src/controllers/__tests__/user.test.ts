import request from 'supertest';
import bcrypt from 'bcrypt';

process.env.JWT_SECRET = 'test-secret';

import app from '../../index';
import { User } from '../../infrastructure/mongodb/models/user';

jest.mock('../../infrastructure/mongodb/models/user');

const MockUser = User as jest.Mocked<typeof User>;

describe('User Routes', () => {

  describe('POST /user/create', () => {
    it('should create a new user and return 201', async () => {
      (MockUser.findOne as jest.Mock).mockResolvedValue(null);
      (MockUser.create as jest.Mock).mockResolvedValue({
        _id: 'abc123',
        username: 'testuser',
        role: 'user'
      });

      const res = await request(app)
        .post('/user/create')
        .send({ userName: 'testuser', userPassword: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userName', 'testuser');
    });

    it('should return 409 if username already exists', async () => {
      (MockUser.findOne as jest.Mock).mockResolvedValue({ username: 'testuser' });

      const res = await request(app)
        .post('/user/create')
        .send({ userName: 'testuser', userPassword: 'password123' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /user/login', () => {
    it('should login successfully and return a token', async () => {
      const hash = await bcrypt.hash('pass123', 10);
      (MockUser.findOne as jest.Mock).mockResolvedValue({
        _id: 'abc123',
        username: 'loginuser',
        passwordHash: hash,
        role: 'user'
      });

      const res = await request(app)
        .post('/user/login')
        .send({ userName: 'loginuser', userPassword: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 with wrong password', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      (MockUser.findOne as jest.Mock).mockResolvedValue({
        _id: 'abc123',
        username: 'loginuser2',
        passwordHash: hash,
        role: 'user'
      });

      const res = await request(app)
        .post('/user/login')
        .send({ userName: 'loginuser2', userPassword: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('should return 401 with non-existent user', async () => {
      (MockUser.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/user/login')
        .send({ userName: 'nobody', userPassword: 'pass' });

      expect(res.status).toBe(401);
    });
  });

});
