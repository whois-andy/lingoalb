'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Zap, Lock, CheckCircle, Play, Star, RotateCcw } from 'lucide-react';
import { languagesAPI, levelsAPI, progressAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const XP_GATES: Record<string, number> = { beginner: 0, intermediate: 300, advanced: 800 };

const getXPRequired = (level: any): number => {
  if ((level.xpRequired || 0) > 0) return level.xpRequired;
  return XP_GATES[level.name] ?? 0;
};

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  intermediate: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  advanced: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
};

export default function LearnLanguagePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [language, setLanguage] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    loadLanguage();
  }, [_hasHydrated, id]);

  const loadLanguage = async () => {
    try {
      const res = await languagesAPI.getById(id as string);
      setLanguage(res.data.language);
      setLevels(res.data.levels);
      if (res.data.levels.length > 0) {
        loadLessons(res.data.levels[0]);
      }
    } catch {
      toast.error('Gabim gjatë ngarkimit.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (level: any) => {
    setSelectedLevel(level);
    setLoadingLessons(true);
    try {
      const res = await levelsAPI.getLessons(level._id);
      setLessons(res.data.lessons || []);
      // Also fetch progress for this language to mark completed lessons
      if (language?._id) {
        progressAPI.getForLanguage(language._id)
          .then(r => {
            const done = (r.data.progress || [])
              .filter((p: any) => p.isCompleted)
              .map((p: any) => typeof p.lesson === 'string' ? p.lesson : p.lesson?._id);
            setCompletedLessonIds(done);
          })
          .catch(() => {});
      }
    } catch {
      toast.error('Gabim gjatë ngarkimit të mësimeve.');
    } finally {
      setLoadingLessons(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-dark-100 sticky top-0 z-30">
        <div className="container-main py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{language?.flag}</span>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">{language?.nameAlb}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{language?.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Level tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {levels.map((level) => {
            const colors = levelColors[level.name] || levelColors.beginner;
            const isSelected = selectedLevel?._id === level._id;
            const xpRequired = getXPRequired(level);
            const isLocked = xpRequired > 0 && (user?.xp || 0) < xpRequired;
            return (
              <button
                key={level._id}
                onClick={() => {
                  if (isLocked) {
                    toast(`🔒 Keni nevojë për ${xpRequired} XP për ta zhbllokuar këtë nivel. Ju keni ${user?.xp || 0} XP.`, { duration: 3000 });
                    return;
                  }
                  loadLessons(level);
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${
                  isLocked
                    ? 'border-gray-200 dark:border-dark-100 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-dark-100 cursor-not-allowed opacity-60'
                    : isSelected
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : 'border-gray-100 dark:border-dark-100 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-dark-100'
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <span>{level.icon}</span>}
                {level.nameAlb}
                {isLocked && <span className="text-xs font-normal ml-1">({xpRequired} XP)</span>}
              </button>
            );
          })}
        </div>

        {selectedLevel && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">
                {selectedLevel.icon} {selectedLevel.nameAlb}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{selectedLevel.description}</p>
            </div>

            {loadingLessons ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-4 bg-gray-100 dark:bg-dark-100 rounded mb-3" />
                    <div className="h-3 bg-gray-100 dark:bg-dark-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-dark-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson, i) => (
                  <motion.div key={lesson._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    {(() => {
                      const isDone = completedLessonIds.includes(lesson._id);
                      return (
                        <Link href={`/lesson/${lesson._id}`} className={`card-hover group relative overflow-hidden block ${isDone ? 'border-green-200 dark:border-green-800' : ''}`}>
                          {isDone && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                              <CheckCircle className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-3 pr-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDone ? 'bg-green-50 dark:bg-green-900/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                              {lesson.icon}
                            </div>
                            <div className={`badge ${isDone ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                              {isDone ? '✓ Kryer' : `+${lesson.xpReward} XP`}
                            </div>
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-700 transition-colors">
                            {lesson.titleAlb}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{lesson.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {lesson.vocabularyCount} fjalë</span>
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {lesson.exerciseCount} ushtrime</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.estimatedMinutes} min</span>
                          </div>
                          <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${isDone ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-300'}`}>
                            {isDone ? <><RotateCcw className="w-4 h-4" /> Riprovo (+20 XP)</> : <><Play className="w-4 h-4" /> Fillo mësimin</>}
                          </div>
                        </Link>
                      );
                    })()}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
