import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('POST /users - should create a new user and return 201', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Jane Doe', email: 'jane@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Jane Doe');
  });

  it('POST /tickets - should reject with 401 when X-User-Id is missing', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ title: 'Fix Bug', description: 'App crashes on load' });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('POST /tickets - should create a new ticket when auth is present and return 201', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', '1')
      .send({ title: 'Fix Bug', description: 'App crashes on load' });

    expect(res.status).toBe(201);
  });

  it('GET /tickets/:id - should return 404 for a non-existent ticket', async () => {
    const res = await request(app).get('/tickets/999999');
    expect(res.status).toBe(404);
  });

  it('GET /users/:id - should return 404 for a non-existent user', async () => {
    const res = await request(app).get('/users/999999');
    expect(res.status).toBe(404);
  });

  it('GET /tickets - should handle pagination and filtering query parameters', async () => {
    const res = await request(app).get('/tickets?limit=5&offset=0&status=TODO');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
