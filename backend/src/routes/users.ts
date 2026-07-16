import express from 'express';
import { User } from '../models/User';
import { UserProgress, Language } from '../models/index';
import { protect, AuthRequest } from '../middleware/auth';

const FREEZE_COST = 200; // XP cost per streak freeze

const router = express.Router();

// GET /api/users/dashboard
router.get('/dashboard', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select('+avatar').populate('enrolledLanguages');
    if (!user) return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });

    const completedLessons = await UserProgress.countDocuments({ user: req.user!.id, isCompleted: true });
    const recentProgress = await UserProgress.find({ user: req.user!.id })
      .sort('-lastAttemptAt')
      .limit(5)
      .populate('lesson language');

    res.json({ user, completedLessons, recentProgress });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// POST /api/users/enroll/:languageId
router.post('/enroll/:languageId', protect, async (req: AuthRequest, res) => {
  try {
    const language = await Language.findById(req.params.languageId);
    if (!language || !language.isAvailable) {
      return res.status(400).json({ message: 'Kjo gjuhë nuk është e disponueshme.' });
    }

    await User.findByIdAndUpdate(req.user!.id, {
      $addToSet: { enrolledLanguages: language._id },
    });

    res.json({ message: `U regjistruat në ${language.nameAlb}!` });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// PUT /api/users/avatar
router.put('/avatar', protect, async (req: AuthRequest, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== 'string') return res.status(400).json({ message: 'Avatar i pavlefshëm.' });
    const updated = await User.findByIdAndUpdate(req.user!.id, { $set: { avatar } }, { new: true }).select('avatar');
    res.json({ avatar: updated?.avatar });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// POST /api/users/streak-freeze — buy one streak freeze for FREEZE_COST XP
router.post('/streak-freeze', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });

    if ((user.xp || 0) < FREEZE_COST) {
      return res.status(400).json({
        message: `Keni nevojë për ${FREEZE_COST} XP për të blerë një ruajtje serie. Ju keni ${user.xp} XP.`,
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.user!.id,
      { $inc: { xp: -FREEZE_COST, streakFreezes: 1 } },
      { new: true }
    ).select('xp streak streakFreezes');

    res.json({
      message: 'Ruajtja e serisë u ble me sukses! ❄️',
      user: { xp: updated?.xp, streak: updated?.streak, streakFreezes: updated?.streakFreezes },
    });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
