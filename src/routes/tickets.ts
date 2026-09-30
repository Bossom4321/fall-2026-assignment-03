import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { insertTimeLog, getTotalHoursForTicket } from '../dal/timeLogs.js';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import { createUser, getUserById } from '../dal/users.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const status = req.query.status as string | undefined;

    const tickets = await getAllTickets({ limit, offset, status });
    res.json(tickets);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await getTicketById(Number(req.params.id));
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function ensureUserExists(userId: number): Promise<void> {
  const existingUser = await getUserById(userId);

  if (!existingUser) {
    await createUser({
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    });
  }
}

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = Number(res.locals.userId);

    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    await ensureUserExists(userId);

    const newTicket = await createTicket({
      creator_id: userId,
      title,
      description,
      status: 'TODO',
    });

    res.status(201).json(newTicket);
  } catch {
    console.error('DB Error in POST /tickets:', Error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch(
  '/:id/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const updatedTicket = await updateTicketStatus(
        Number(req.params.id),
        status,
      );
      if (!updatedTicket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json(updatedTicket);
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

router.post(
  '/:id/time',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const ticketId = Number(req.params.id);
      const userId = Number(res.locals.userId);
      const { hours } = req.body;

      if (typeof hours !== 'number' || hours <= 0) {
        res.status(400).json({ error: 'Valid positive hours are required' });
        return;
      }

      const timeLog = await insertTimeLog(ticketId, userId, hours);
      res.status(201).json(timeLog);
    } catch {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
);

router.get('/:id/time', async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const total_hours = await getTotalHoursForTicket(ticketId);

    res.json({ ticket_id: ticketId, total_hours });
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
