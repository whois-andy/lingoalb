import mongoose, { Document, Schema } from 'mongoose';

// ============ LANGUAGE MODEL ============
export interface ILanguage extends Document {
  code: string;           // 'en', 'fr', 'de'
  name: string;           // 'English'
  nameAlb: string;        // 'Anglisht'
  flag: string;           // emoji or URL
  isAvailable: boolean;
  comingSoon: boolean;
  totalLevels: number;
  color: string;          // theme color for this language
  description: string;   // in Albanian
  order: number;
  createdAt: Date;
}

const LanguageSchema = new Schema<ILanguage>(
  {
    code: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    nameAlb: { type: String, required: true },
    flag: { type: String, required: true },
    isAvailable: { type: Boolean, default: false },
    comingSoon: { type: Boolean, default: true },
    totalLevels: { type: Number, default: 3 },
    color: { type: String, default: '#1B4FD8' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Language = mongoose.model<ILanguage>('Language', LanguageSchema);

// ============ LEVEL MODEL ============
export interface ILevel extends Document {
  language: mongoose.Types.ObjectId;
  name: 'beginner' | 'intermediate' | 'advanced';
  nameAlb: string;
  description: string;
  order: number;
  xpRequired: number;
  icon: string;
  totalLessons: number;
  isLocked: boolean;
}

const LevelSchema = new Schema<ILevel>(
  {
    language: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    name: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    nameAlb: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    xpRequired: { type: Number, default: 0 },
    icon: { type: String, default: '📚' },
    totalLessons: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Level = mongoose.model<ILevel>('Level', LevelSchema);

// ============ LESSON MODEL ============
export interface ILesson extends Document {
  level: mongoose.Types.ObjectId;
  language: mongoose.Types.ObjectId;
  title: string;
  titleAlb: string;
  description: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  icon: string;
  vocabularyCount: number;
  exerciseCount: number;
  grammarNote?: string;
  isPublished: boolean;
}

const LessonSchema = new Schema<ILesson>(
  {
    level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
    language: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    title: { type: String, required: true },
    titleAlb: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    xpReward: { type: Number, default: 50 },
    estimatedMinutes: { type: Number, default: 10 },
    icon: { type: String, default: '📖' },
    vocabularyCount: { type: Number, default: 0 },
    exerciseCount: { type: Number, default: 0 },
    grammarNote: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);

// ============ VOCABULARY MODEL ============
export interface IVocabulary extends Document {
  lesson: mongoose.Types.ObjectId;
  language: mongoose.Types.ObjectId;
  albanianWord: string;
  targetWord: string;
  pronunciation?: string;  // IPA or phonetic
  audioUrl?: string;
  exampleAlb: string;
  exampleTarget: string;
  imageUrl?: string;
  category: string;
  difficulty: number;   // 1-5
}

const VocabularySchema = new Schema<IVocabulary>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    language: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    albanianWord: { type: String, required: true, trim: true },
    targetWord: { type: String, required: true, trim: true },
    pronunciation: { type: String },
    audioUrl: { type: String },
    exampleAlb: { type: String, default: '' },
    exampleTarget: { type: String, default: '' },
    imageUrl: { type: String },
    category: { type: String, default: 'general' },
    difficulty: { type: Number, default: 1, min: 1, max: 5 },
  },
  { timestamps: true }
);

export const Vocabulary = mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);

// ============ EXERCISE MODEL ============
export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'matching' | 'translation' | 'listening_challenge';

export interface IExercise extends Document {
  lesson: mongoose.Types.ObjectId;
  language: mongoose.Types.ObjectId;
  type: ExerciseType;
  question: string;
  questionAlb?: string;
  options?: string[];
  correctAnswer: string;
  explanationAlb: string;
  xpReward: number;
  order: number;
  vocabulary?: mongoose.Types.ObjectId;
  listeningWord?: string;
  listeningLang?: string;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    language: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    type: { type: String, enum: ['multiple_choice', 'fill_blank', 'matching', 'translation', 'listening_challenge'], required: true },
    question: { type: String, required: true },
    questionAlb: { type: String },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanationAlb: { type: String, required: true },
    xpReward: { type: Number, default: 20 },
    order: { type: Number, default: 0 },
    vocabulary: { type: Schema.Types.ObjectId, ref: 'Vocabulary' },
    listeningWord: { type: String },
    listeningLang: { type: String, default: 'de-DE' },
  },
  { timestamps: true }
);

export const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);

// ============ USER PROGRESS MODEL ============
export interface IUserProgress extends Document {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  language: mongoose.Types.ObjectId;
  level: mongoose.Types.ObjectId;
  isCompleted: boolean;
  isFirstCompletion: boolean; // used to prevent XP farming
  score: number;
  xpEarned: number;
  attempts: number;
  mistakeWords: string[]; // words the user got wrong
  completedAt?: Date;
  lastAttemptAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    language: { type: Schema.Types.ObjectId, ref: 'Language', required: true },
    level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
    isCompleted: { type: Boolean, default: false },
    isFirstCompletion: { type: Boolean, default: true },
    score: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    mistakeWords: [{ type: String }],
    completedAt: { type: Date },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
