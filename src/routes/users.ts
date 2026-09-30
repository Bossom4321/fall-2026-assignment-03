import { Router, Request, Response } from 'express';
import { getAllUsers, getUserById, createUser } from '../dal/users.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getUserById(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const newUser = await createUser({ name, email });
    res.status(201).json(newUser);
  } catch {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
