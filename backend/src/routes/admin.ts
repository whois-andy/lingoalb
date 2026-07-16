import express from 'express';
import { Language, Level, Lesson, Vocabulary, Exercise } from '../models/index';
import { User } from '../models/User';
import { protect, requireAdmin } from '../middleware/auth';

const router = express.Router();
router.use(protect, requireAdmin);

// ===== LANGUAGE MANAGEMENT =====
router.get('/languages', async (_req, res) => {
  const languages = await Language.find().sort('order');
  res.json({ languages });
});

router.post('/languages', async (req, res) => {
  try {
    const language = await Language.create(req.body);
    res.status(201).json({ language });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/languages/:id', async (req, res) => {
  try {
    const language = await Language.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!language) return res.status(404).json({ message: 'Gjuha nuk u gjet.' });
    res.json({ language });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/languages/:id', async (req, res) => {
  try {
    await Language.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gjuha u fshi.' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ===== LEVEL MANAGEMENT =====
router.get('/levels', async (req, res) => {
  const { languageId } = req.query;
  const filter = languageId ? { language: languageId } : {};
  const levels = await Level.find(filter).populate('language').sort('order');
  res.json({ levels });
});

router.post('/levels', async (req, res) => {
  try {
    const level = await Level.create(req.body);
    res.status(201).json({ level });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/levels/:id', async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!level) return res.status(404).json({ message: 'Niveli nuk u gjet.' });
    res.json({ level });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/levels/:id', async (req, res) => {
  try {
    await Level.findByIdAndDelete(req.params.id);
    res.json({ message: 'Niveli u fshi.' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ===== LESSON MANAGEMENT =====
router.get('/lessons', async (req, res) => {
  const { levelId } = req.query;
  const filter = levelId ? { level: levelId } : {};
  const lessons = await Lesson.find(filter).populate('level language').sort('order');
  res.json({ lessons });
});

router.post('/lessons', async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ lesson });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ message: 'Mësimi nuk u gjet.' });
    res.json({ lesson });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    await Vocabulary.deleteMany({ lesson: req.params.id });
    await Exercise.deleteMany({ lesson: req.params.id });
    res.json({ message: 'Mësimi u fshi.' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ===== VOCABULARY MANAGEMENT =====
router.get('/vocabulary/:lessonId', async (req, res) => {
  const vocab = await Vocabulary.find({ lesson: req.params.lessonId });
  res.json({ vocabulary: vocab });
});

router.post('/vocabulary', async (req, res) => {
  try {
    const vocab = await Vocabulary.create(req.body);
    await Lesson.findByIdAndUpdate(req.body.lesson, { $inc: { vocabularyCount: 1 } });
    res.status(201).json({ vocabulary: vocab });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/vocabulary/:id', async (req, res) => {
  try {
    const vocab = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ vocabulary: vocab });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/vocabulary/:id', async (req, res) => {
  try {
    const vocab = await Vocabulary.findByIdAndDelete(req.params.id);
    if (vocab) await Lesson.findByIdAndUpdate(vocab.lesson, { $inc: { vocabularyCount: -1 } });
    res.json({ message: 'Fjalori u fshi.' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ===== EXERCISE MANAGEMENT =====
router.get('/exercises/:lessonId', async (req, res) => {
  const exercises = await Exercise.find({ lesson: req.params.lessonId }).sort('order');
  res.json({ exercises });
});

router.post('/exercises', async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    await Lesson.findByIdAndUpdate(req.body.lesson, { $inc: { exerciseCount: 1 } });
    res.status(201).json({ exercise });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ exercise });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (exercise) await Lesson.findByIdAndUpdate(exercise.lesson, { $inc: { exerciseCount: -1 } });
    res.json({ message: 'Ushtrimi u fshi.' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ===== USER MANAGEMENT =====
router.get('/users', async (_req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.json({ users });
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json({ user });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Përdoruesi u fshi.' });
  } catch {
    res.status(500).json({ message: 'Gabim serveri.' });
  }
});

// ===== STATS =====
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalLanguages, totalLessons] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Language.countDocuments({ isAvailable: true }),
    Lesson.countDocuments({ isPublished: true }),
  ]);
  res.json({ totalUsers, totalLanguages, totalLessons });
});

export default router;
