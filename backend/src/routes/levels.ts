import express from 'express';
import { Level, Lesson } from '../models/index';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/levels/:id/lessons
router.get('/:id/lessons', protect, async (req: AuthRequest, res) => {
  try {
    const level = await Level.findById(req.params.id).populate('language');
    if (!level) return res.status(404).json({ message: 'Niveli nuk u gjet.' });

    const lessons = await Lesson.find({ level: level._id, isPublished: true }).sort('order');
    res.json({ level, lessons });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
