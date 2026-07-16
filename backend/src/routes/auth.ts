import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

const generateToken = (id: string, role: string, email: string): string => {
  return jwt.sign({ id, role, email }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = schema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Ky email është tashmë i regjistruar.', code: 'EMAIL_EXISTS' });
    }

    const user = await User.create({ name, email, password, role: 'student' });
    const token = generateToken(user.id, user.role, user.email);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, streak: user.streak, streakFreezes: 0 },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Të dhënat janë të pavlefshme.', errors: err.errors });
    }
    res.status(500).json({ message: 'Gabim gjatë regjistrimit.', code: 'SERVER_ERROR' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dhe fjalëkalimi janë të detyrueshme.', code: 'MISSING_FIELDS' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ose fjalëkalim i gabuar.', code: 'INVALID_CREDENTIALS' });
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays === 2 && (user.streakFreezes || 0) > 0) {
        // Missed exactly 1 day — auto-use a freeze to protect the streak
        user.streakFreezes -= 1;
        // streak is maintained as-is (not incremented, just protected)
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = new Date();
    await user.save();

    const token = generateToken(user.id, user.role, user.email);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, xp: user.xp, streak: user.streak, streakFreezes: user.streakFreezes || 0 },
    });
  } catch {
    res.status(500).json({ message: 'Gabim gjatë identifikimit.', code: 'SERVER_ERROR' });
  }
});

// GET /api/auth/me — returns consistent clean shape, same as login
router.get('/me', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        streak: user.streak,
        streakFreezes: user.streakFreezes || 0,
        achievements: user.achievements || [],
        enrolledLanguages: user.enrolledLanguages || [],
      }
    });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
