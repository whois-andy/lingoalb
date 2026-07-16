'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Target, Volume2, RotateCcw, AlertTriangle, CheckCircle, BookOpen, TrendingUp, Zap } from 'lucide-react';
import { progressAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface WeakWord {
  word: string;
  missCount: number;
  albanianWord: string | null;
  pronunciation: string | null;
  exampleAlb: string | null;
  exampleTarget: string | null;
}

interface WeakLesson {
  _id: string;
  lesson: { _id: string; titleAlb: string; icon: string; xpReward: number } | null;
  score: number;
  attempts: number;
}

export default function PikatDobetaPage() {
  const { user, isDark, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
  const [weakLessons, setWeakLessons] = useState<WeakLesson[]>([]);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState<string | null>(null);
  const [practiceResult, setPracticeResult] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    fetch();
  }, [_hasHydrated]);

  const fetch = async () => {
    try {
      const res = await progressAPI.getWeakPoints();
      setWeakWords(res.data.weakWords || []);
      setWeakLessons(res.data.weakLessons || []);
      setTotalMistakes(res.data.totalMistakes || 0);
    } catch {
      setWeakWords([]);
      setWeakLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const speak = (word: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US'; u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const quickPractice = (word: WeakWord) => {
    setPracticing(word.word);
  };

  const checkPractice = (word: WeakWord, input: string) => {
    const clean = (s: string) => s.toLowerCase().trim().replace(/[^a-z\s]/g, '');
    const correct = clean(input) === clean(word.word);
    setPracticeResult(p => ({ ...p, [word.word]: correct }));
    setPracticing(null);
    if (correct) {
      toast.success(`✅ Saktë! "${word.word}" — e mbani mend!`, { duration: 2500 });
    } else {
      toast.error(`❌ Gabim. Ishte: "${word.word}"`, { duration: 2500 });
    }
  };

  if (!_hasHydrated || loading) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasData = weakWords.length > 0 || weakLessons.length > 0;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-50 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              🎯 Pikat e Dobëta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Këtu janë fjalët dhe mësimet ku keni bërë gabime</p>
          </div>
        </div>

        {/* Stats bar */}
        {hasData && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Fjalë të Dobëta', val: weakWords.length, icon: Target, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Gabime Totale', val: totalMistakes, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Mësime < 70%', val: weakLessons.length, icon: BookOpen, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card text-center rounded-2xl py-3 px-2">
                <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-1`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{s.val}</div>
                <div className="text-xs text-gray-400 leading-tight">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No data state */}
        {!hasData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card rounded-2xl text-center py-16">
            <div className="text-6xl mb-4">🦅</div>
            <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
              Asnjë pikë e dobët!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Ose nuk keni bërë ende mësime, ose jeni absolutisht perfekt! 😄
              <br />Bëni disa mësime dhe kthehuni këtu për të parë ku duhet të punoni.
            </p>
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Fillo mësimet
            </Link>
          </motion.div>
        )}

        {/* Weak Words */}
        {weakWords.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-red-500" />
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                Fjalët që ju mundojnë
              </h2>
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                {weakWords.length} fjalë
              </span>
            </div>

            <div className="space-y-3">
              {weakWords.map((item, i) => {
                const isPracticed = practiceResult[item.word] !== undefined;
                const wasCorrect = practiceResult[item.word];
                return (
                  <motion.div key={item.word}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className={`card rounded-2xl transition-all ${wasCorrect ? 'border-green-200 dark:border-green-800' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* Miss count badge */}
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                        item.missCount >= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        : item.missCount === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                      }`}>
                        {item.missCount}x
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white text-base">{item.word}</span>
                          <button onClick={() => speak(item.word)}
                            className="p-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-100 transition-colors">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {isPracticed && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${wasCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                              {wasCorrect ? '✓ E dini!' : '✗ Gabim'}
                            </span>
                          )}
                        </div>

                        {item.albanianWord && (
                          <p className="text-primary-600 dark:text-primary-400 text-sm font-medium mb-1">
                            🇦🇱 {item.albanianWord}
                          </p>
                        )}
                        {item.pronunciation && (
                          <p className="text-gray-400 text-xs font-mono mb-1">/{item.pronunciation}/</p>
                        )}
                        {item.exampleTarget && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs italic">"{item.exampleTarget}"</p>
                        )}

                        {/* Quick practice input */}
                        {practicing === item.word && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-3 flex gap-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Shkruani anglisht..."
                              className="input text-sm py-2 flex-1"
                              onKeyDown={e => {
                                if (e.key === 'Enter') checkPractice(item, (e.target as HTMLInputElement).value);
                                if (e.key === 'Escape') setPracticing(null);
                              }}
                            />
                            <button onClick={() => setPracticing(null)}
                              className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
                          </motion.div>
                        )}
                      </div>

                      {/* Practice button */}
                      {practicing !== item.word && (
                        <button onClick={() => quickPractice(item)}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors font-medium">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Praktiko
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weak Lessons */}
        {weakLessons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                Mësimet që duhen rishikuar
              </h2>
            </div>

            <div className="space-y-3">
              {weakLessons.map((item, i) => {
                if (!item.lesson) return null;
                const scoreColor = item.score < 50 ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                  : item.score < 70 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
                return (
                  <motion.div key={item._id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="card rounded-2xl flex items-center gap-4">
                    <div className="text-3xl flex-shrink-0">{item.lesson.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.lesson.titleAlb}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.attempts} përpjekje</p>
                    </div>
                    <div className={`text-sm font-bold px-3 py-1.5 rounded-xl flex-shrink-0 ${scoreColor}`}>
                      {item.score}%
                    </div>
                    <Link href={`/lesson/${item.lesson._id}`}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors font-medium">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Riprovo
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tip */}
        {hasData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="card mt-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">Këshilla për rishikim</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                  Fjalët me numër të lartë gabimesh janë "armiqtë" tuaj personalë — 
                  praktikojini 3 herë në ditë. Studimet tregojnë se 5 ditë rishikim 
                  i transformon ato nga "të vështira" në "automatike". Beteja me veten 
                  është beteja më e vlerë! 🦅
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
