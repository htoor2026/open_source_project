import request from 'supertest';
import app from '../../index';

describe('Healthcheck', () => {
  it('should return 200 with Successful message', async () => {
    const res = await request(app).get('/healthcheck');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Successful');
  });
});
