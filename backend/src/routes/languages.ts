import express from 'express';
import { Language, Level, Lesson, Vocabulary, Exercise, UserProgress } from '../models/index';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/languages - List all languages
router.get('/', async (_req, res) => {
  try {
    const languages = await Language.find().sort('order');
    res.json({ languages });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// GET /api/languages/:id - Single language with levels
router.get('/:id', async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);
    if (!language) return res.status(404).json({ message: 'Gjuha nuk u gjet.' });

    const levels = await Level.find({ language: language._id }).sort('order');
    res.json({ language, levels });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
