import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('should log hours against a ticket and aggregate the total correctly', async () => {
    const userRes = await request(app)
      .post('/users')
      .send({ name: 'Time Tracker', email: 'timer@example.com' });
    const userId = userRes.body.id || 1;

    const ticketRes = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({ title: 'Implement Time Logging', description: 'Backend tasks' });
    const ticketId = ticketRes.body.id || 1;

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 2.5 })
      .expect(201);

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({ hours: 3 })
      .expect(201);

    const totalRes = await request(app).get(`/tickets/${ticketId}/time`);

    expect(totalRes.status).toBe(200);
    expect(totalRes.body.ticket_id).toBe(ticketId);
    expect(Number(totalRes.body.total_hours)).toBe(5.5);
  });
});
