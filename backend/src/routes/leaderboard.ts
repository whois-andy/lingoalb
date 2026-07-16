import express from 'express';
import { User } from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// GET /api/leaderboard
router.get('/', protect, async (_req, res) => {
  try {
    const top = await User.find({ role: 'student' })
      .select('name xp streak avatar')
      .sort('-xp')
      .limit(50);

    res.json({ leaderboard: top });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
