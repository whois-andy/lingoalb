import express from 'express';
import { UserProgress, Lesson } from '../models/index';
import { User } from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/progress/complete - Complete a lesson
router.post('/complete', protect, async (req: AuthRequest, res) => {
  try {
    const { lessonId, score, xpEarned } = req.body;

    const lesson = await Lesson.findById(lessonId).populate('level');
    if (!lesson) return res.status(404).json({ message: 'Mësimi nuk u gjet.' });

    const levelObj = lesson.level as any;
    const progress = await UserProgress.findOneAndUpdate(
      { user: req.user!.id, lesson: lessonId },
      {
        $set: {
          user: req.user!.id,
          lesson: lessonId,
          language: lesson.language,
          level: lesson.level,
          isCompleted: true,
          score,
          xpEarned,
          completedAt: new Date(),
          lastAttemptAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      { upsert: true, new: true }
    );

    // Award XP to user — only increment, never overwrite
    await User.findByIdAndUpdate(req.user!.id, {
      $inc: { xp: xpEarned },
      $set: { lastActiveDate: new Date() },
    });

    res.json({ progress, message: 'Mësimi u përfundua me sukses! 🎉' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// GET /api/progress/language/:languageId - User progress for a language
router.get('/language/:languageId', protect, async (req: AuthRequest, res) => {
  try {
    const progressList = await UserProgress.find({
      user: req.user!.id,
      language: req.params.languageId,
    }).populate('lesson level');

    res.json({ progress: progressList });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;