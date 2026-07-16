import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  avatar?: string;
  xp: number;
  streak: number;
  streakFreezes: number;
  lastActiveDate?: Date;
  enrolledLanguages: mongoose.Types.ObjectId[];
  favoriteWords: mongoose.Types.ObjectId[];
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatar: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    streakFreezes: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    enrolledLanguages: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
    favoriteWords: [{ type: Schema.Types.ObjectId, ref: 'Vocabulary' }],
    achievements: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
