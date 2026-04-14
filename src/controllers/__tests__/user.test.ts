import request from 'supertest';
import app from '../../index';

describe('User Routes', () => {

  describe('POST /user/create', () => {
    it('should create a new user and return 200', async () => {
      const res = await request(app)
        .post('/user/create')
        .send({ userName: 'testuser', userPassword: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('userName', 'testuser');
      expect(res.body).toHaveProperty('userPassword');
    });

    it('should hash the password', async () => {
      const res = await request(app)
        .post('/user/create')
        .send({ userName: 'testuser2', userPassword: 'mypassword' });

      expect(res.body.userPassword).not.toBe('mypassword');
    });
  });

  describe('POST /user/login', () => {
    it('should login successfully with correct credentials', async () => {
      await request(app)
        .post('/user/create')
        .send({ userName: 'loginuser', userPassword: 'pass123' });

      const res = await request(app)
        .post('/user/login')
        .send({ userName: 'loginuser', userPassword: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'User logged in successfully!');
    });

    it('should return 500 with wrong password', async () => {
      await request(app)
        .post('/user/create')
        .send({ userName: 'loginuser2', userPassword: 'correctpass' });

      const res = await request(app)
        .post('/user/login')
        .send({ userName: 'loginuser2', userPassword: 'wrongpass' });

      expect(res.status).toBe(500);
    });

    it('should return 500 with non-existent user', async () => {
      const res = await request(app)
        .post('/user/login')
        .send({ userName: 'nobody', userPassword: 'pass' });

      expect(res.status).toBe(500);
    });
  });

});
