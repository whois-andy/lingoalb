import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Vocabulary } from '../models/index';

const router = express.Router();

// ─── Daily Word ────────────────────────────────────────────────────────────────
// GET /api/daily/word — returns today's word (same for everyone, changes daily)
router.get('/word', async (_req, res) => {
  try {
    const count = await Vocabulary.countDocuments();
    if (count === 0) {
      return res.json({
        word: {
          albanianWord: 'Mirëdita',
          targetWord: 'Good afternoon',
          pronunciation: 'ɡʊd ˈæftərnuːn',
          exampleAlb: 'Mirëdita, si jeni?',
          exampleTarget: 'Good afternoon, how are you?',
          category: 'greeting',
        }
      });
    }
    // Use day-of-year as seed to pick same word for everyone today
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = dayOfYear % count;

    const word = await Vocabulary.findOne().skip(index).lean();
    res.json({ word });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ─── Achievements ──────────────────────────────────────────────────────────────
// GET /api/daily/achievements — get user's badges
router.get('/achievements', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select('achievements xp streak');
    if (!user) return res.status(404).json({ message: 'Nuk u gjet.' });

    // Auto-award achievements based on stats
    const earned: string[] = [...(user.achievements || [])];
    const add = (badge: string) => { if (!earned.includes(badge)) earned.push(badge); };

    if (user.xp >= 100) add('fillestar');
    if (user.xp >= 500) add('nxenes_i_zjarrit');
    if (user.xp >= 1000) add('mjeshtri');
    if (user.xp >= 5000) add('kampioni');
    if (user.streak >= 3) add('besa_3');
    if (user.streak >= 7) add('besa_7');
    if (user.streak >= 30) add('besa_30');
    if (user.streak >= 100) add('besa_100');

    // Save if new badges were earned
    if (earned.length !== (user.achievements || []).length) {
      await User.findByIdAndUpdate(req.user!.id, { achievements: earned });
    }

    res.json({ achievements: earned, xp: user.xp, streak: user.streak });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ─── Battle Sessions ───────────────────────────────────────────────────────────
// In-memory battle store (resets on server restart — good enough for local dev)
interface BattleSession {
  id: string;
  hostId: string;
  hostName: string;
  guestId?: string;
  guestName?: string;
  status: 'waiting' | 'active' | 'done';
  questions: any[];
  hostScore: number;
  guestScore: number;
  hostAnswers: number;
  guestAnswers: number;
  createdAt: number;
}

const battles: Map<string, BattleSession> = new Map();

// Clean old battles every 10 minutes
setInterval(() => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  battles.forEach((b, id) => {
    if (b.createdAt < tenMinutesAgo) battles.delete(id);
  });
}, 10 * 60 * 1000);

const generateBattleId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// POST /api/daily/battle/create — create a battle room
router.post('/battle/create', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select('name');
    if (!user) return res.status(404).json({ message: 'Nuk u gjet.' });

    // Get 10 random vocab words for the battle
    const count = await Vocabulary.countDocuments();
    const questions: any[] = [];
    if (count > 0) {
      const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, count - 10)));
      const vocab = await Vocabulary.find().skip(skip).limit(10).lean();
      questions.push(...vocab);
    }

    const id = generateBattleId();
    const session: BattleSession = {
      id,
      hostId: req.user!.id,
      hostName: user.name,
      status: 'waiting',
      questions,
      hostScore: 0,
      guestScore: 0,
      hostAnswers: 0,
      guestAnswers: 0,
      createdAt: Date.now(),
    };
    battles.set(id, session);

    res.json({ battleId: id, session });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// POST /api/daily/battle/join/:id — join a battle
router.post('/battle/join/:id', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select('name');
    if (!user) return res.status(404).json({ message: 'Nuk u gjet.' });

    const battle = battles.get(req.params.id);
    if (!battle) return res.status(404).json({ message: 'Batalia nuk u gjet. Kodi mund të jetë i gabuar.' });
    if (battle.status !== 'waiting') return res.status(400).json({ message: 'Batalia ka filluar tashmë.' });
    if (battle.hostId === req.user!.id) return res.status(400).json({ message: 'Nuk mund të sfidoni veten!' });

    battle.guestId = req.user!.id;
    battle.guestName = user.name;
    battle.status = 'active';

    res.json({ session: battle });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// GET /api/daily/battle/:id — poll battle state
router.get('/battle/:id', protect, async (req: AuthRequest, res) => {
  const battle = battles.get(req.params.id);
  if (!battle) return res.status(404).json({ message: 'Batalia nuk u gjet.' });
  res.json({ session: battle });
});

// POST /api/daily/battle/:id/answer — submit an answer
router.post('/battle/:id/answer', protect, async (req: AuthRequest, res) => {
  try {
    const battle = battles.get(req.params.id);
    if (!battle || battle.status !== 'active') {
      return res.status(400).json({ message: 'Batalia nuk është aktive.' });
    }

    const { questionIndex, answer } = req.body;
    const question = battle.questions[questionIndex];
    if (!question) return res.status(400).json({ message: 'Pyetja nuk u gjet.' });

    const correct = answer.toLowerCase().trim() === question.targetWord.toLowerCase().trim();
    const isHost = req.user!.id === battle.hostId;

    if (isHost) {
      if (correct) battle.hostScore++;
      battle.hostAnswers++;
    } else {
      if (correct) battle.guestScore++;
      battle.guestAnswers++;
    }

    // Check if battle is done
    if (battle.hostAnswers >= battle.questions.length && battle.guestAnswers >= battle.questions.length) {
      battle.status = 'done';

      // Award XP to winner
      const winnerId = battle.hostScore > battle.guestScore ? battle.hostId : battle.guestId;
      if (winnerId) {
        await User.findByIdAndUpdate(winnerId, { $inc: { xp: 100 } });
      }
      // Participation XP for loser
      const loserId = battle.hostScore > battle.guestScore ? battle.guestId : battle.hostId;
      if (loserId) {
        await User.findByIdAndUpdate(loserId, { $inc: { xp: 25 } });
      }
    }

    res.json({ correct, session: battle });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

export default router;
