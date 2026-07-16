import express from 'express';
import { Lesson, Vocabulary, Exercise, UserProgress } from '../models/index';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/lessons/:id - Full lesson with vocab + exercises
router.get('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate({ path: 'level', populate: { path: 'language' } });

    if (!lesson) return res.status(404).json({ message: 'Mësimi nuk u gjet.' });

    const vocabulary = await Vocabulary.find({ lesson: lesson._id }).sort('difficulty');
    const exercises = await Exercise.find({ lesson: lesson._id }).sort('order');

    const progress = await UserProgress.findOne({
      user: req.user!.id,
      lesson: lesson._id,
    });

    res.json({ lesson, vocabulary, exercises, progress });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
