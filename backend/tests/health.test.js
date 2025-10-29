const request = require('supertest');
const express = require('express');
const healthRouter = require('../src/routes/health');

const app = express();
app.use('/api/health', healthRouter);

describe('GET /api/health', () => {
  test('returns health object with backend and database fields', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('backend', 'healthy');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('timestamp');
  });
});
