import { db } from '../db/database.js';

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
) {
  return await db
    .insertInto('time_logs')
    .values({
      ticket_id: ticketId,
      user_id: userId,
      hours: hours,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  const { sum } = db.fn;

  const result = await db
    .selectFrom('time_logs')
    .select(sum<number | string>('hours').as('total_hours'))
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  return Number(result?.total_hours || 0);
}
