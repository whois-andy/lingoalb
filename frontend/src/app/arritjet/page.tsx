'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock, Share2 } from 'lucide-react';
import { dailyAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ALL_BADGES = [
  {
    id: 'fillestar',
    emoji: '🌱',
    name: 'Fillestar i Guximshëm',
    nameEn: 'First Steps',
    desc: 'Fituat 100 XP të parë. Edhe Skënderbeu filloi nga zero!',
    req: '100 XP',
    color: 'from-green-400 to-emerald-500',
    xpRequired: 100,
  },
  {
    id: 'nxenes_i_zjarrit',
    emoji: '🔥',
    name: 'Nxënësi i Zjarrtë',
    nameEn: 'On Fire',
    desc: '500 XP të fituara. Nxënia ka hyrë në gjak!',
    req: '500 XP',
    color: 'from-orange-400 to-red-500',
    xpRequired: 500,
  },
  {
    id: 'besa_3',
    emoji: '🤝',
    name: 'Besa e Parë',
    nameEn: 'Word of Honor',
    desc: '3 ditë streak. Besa = fjala e dhënë. Ju e mbajtët!',
    req: '3 ditë streak',
    color: 'from-blue-400 to-indigo-500',
    streakRequired: 3,
  },
  {
    id: 'besa_7',
    emoji: '🦅',
    name: 'Shqiponja e Javës',
    nameEn: 'Weekly Eagle',
    desc: '7 ditë streak — një javë e plotë pa humbur! Kjo quhet disiplinë!',
    req: '7 ditë streak',
    color: 'from-primary-500 to-primary-700',
    streakRequired: 7,
  },
  {
    id: 'mjeshtri',
    emoji: '⚡',
    name: 'Mjeshtra i Fjalëve',
    nameEn: 'Word Master',
    desc: '1000 XP — ju keni punuar. Shqipëria është krenare!',
    req: '1000 XP',
    color: 'from-yellow-400 to-orange-500',
    xpRequired: 1000,
  },
  {
    id: 'besa_30',
    emoji: '👑',
    name: 'Besëlidhja e Madhe',
    nameEn: 'The Great Pledge',
    desc: '30 ditë streak — një muaj i tërë! Kjo është Besa e vërtetë shqiptare!',
    req: '30 ditë streak',
    color: 'from-amber-400 to-yellow-500',
    streakRequired: 30,
  },
  {
    id: 'kampioni',
    emoji: '🏆',
    name: 'Kampioni i LingoAlb',
    nameEn: 'LingoAlb Champion',
    desc: '5000 XP — jeni ndër të mirët. Ky nivel flet vetë!',
    req: '5000 XP',
    color: 'from-purple-500 to-pink-500',
    xpRequired: 5000,
  },
  {
    id: 'besa_100',
    emoji: '🌟',
    name: 'Legjendar',
    nameEn: 'Legendary',
    desc: '100 ditë streak. Nuk ka fjalë — veç respekt i thellë. 🙇',
    req: '100 ditë streak',
    color: 'from-rose-500 to-red-600',
    streakRequired: 100,
  },
];

export default function ArritjetPage() {
  const { user, isDark, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [earned, setEarned] = useState<string[]>([]);
  const [stats, setStats] = useState<{ xp: number; streak: number }>({ xp: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    fetchAchievements();
  }, [_hasHydrated]);

  // Re-fetch when tab gets focus
  useEffect(() => {
    const onFocus = () => { if (user) fetchAchievements(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const res = await dailyAPI.getAchievements();
      setEarned(res.data.achievements || []);
      setStats({ xp: res.data.xp || 0, streak: res.data.streak || 0 });
    } catch {
      // Fallback: compute locally from user store
      const badges: string[] = [];
      const xp = user?.xp || 0;
      const streak = user?.streak || 0;
      if (xp >= 100) badges.push('fillestar');
      if (xp >= 500) badges.push('nxenes_i_zjarrit');
      if (xp >= 1000) badges.push('mjeshtri');
      if (xp >= 5000) badges.push('kampioni');
      if (streak >= 3) badges.push('besa_3');
      if (streak >= 7) badges.push('besa_7');
      if (streak >= 30) badges.push('besa_30');
      if (streak >= 100) badges.push('besa_100');
      setEarned(badges);
      setStats({ xp, streak });
    } finally {
      setLoading(false);
    }
  };

  const share = (badge: typeof ALL_BADGES[0]) => {
    const text = `🏆 Fitova badge-in "${badge.name}" në LingoAlb!\n${badge.desc}\n\nMëso edhe ti: http://localhost:3000 🇦🇱`;
    if (navigator.share) {
      navigator.share({ title: 'LingoAlb Badge', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('U kopjua! Ndajeni me shokët! 📱');
    }
  };

  const earnedCount = ALL_BADGES.filter(b => earned.includes(b.id)).length;
  const nextBadge = ALL_BADGES.find(b => !earned.includes(b.id));

  if (!_hasHydrated || loading) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-50 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">🏆 Arritjet e Mia</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{earnedCount}/{ALL_BADGES.length} badge fituar</p>
          </div>
        </div>

        {/* Progress overview */}
        <div className="card rounded-2xl mb-6 bg-gradient-to-r from-primary-700 to-primary-900 text-white border-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-primary-200 text-sm">Badge-t tuaja</div>
              <div className="font-display font-bold text-3xl">{earnedCount} / {ALL_BADGES.length}</div>
            </div>
            <div className="text-right">
              <div className="text-primary-200 text-sm">XP Totale</div>
              <div className="font-bold text-xl">{(stats.xp || 0).toLocaleString()}</div>
              <div className="text-primary-200 text-sm">🔥 {stats.streak || 0} ditë streak</div>
            </div>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white rounded-full"
              initial={{ width: 0 }} animate={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }} />
          </div>
        </div>

        {/* Next badge hint */}
        {nextBadge && (
          <div className="card rounded-2xl mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{nextBadge.emoji}</div>
              <div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide mb-0.5">Tjetri badge</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{nextBadge.name}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400">Kërkon: {nextBadge.req}</div>
              </div>
            </div>
          </div>
        )}

        {/* Badges grid */}
        <div className="grid grid-cols-2 gap-4">
          {ALL_BADGES.map((badge, i) => {
            const isEarned = earned.includes(badge.id);
            return (
              <motion.div key={badge.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`card rounded-2xl relative overflow-hidden transition-all ${
                  isEarned ? 'shadow-md' : 'opacity-60'
                }`}>

                {/* Earned ribbon */}
                {isEarned && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}

                {/* Badge icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isEarned ? badge.color : 'from-gray-200 to-gray-300 dark:from-dark-100 dark:to-dark-50'} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                  {isEarned ? badge.emoji : <Lock className="w-6 h-6 text-gray-400" />}
                </div>

                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 leading-tight">{badge.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{badge.desc}</p>

                {!isEarned && (
                  <div className="text-xs text-gray-400 bg-gray-50 dark:bg-dark-100 px-2 py-1 rounded-lg inline-block">
                    🔒 {badge.req}
                  </div>
                )}

                {isEarned && (
                  <button onClick={() => share(badge)}
                    className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 font-medium">
                    <Share2 className="w-3 h-3" /> Nda me shokët
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Cultural note */}
        <div className="card mt-6 rounded-2xl bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🦅</span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Pse quhen "Besa"?</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>Besa</strong> është një nga konceptet më të lashta të kulturës shqiptare — fjala e dhënë si ligj i shenjtë. 
                Kanuni i Lekë Dukagjinit e bën Besën obligim moral absolut. 
                Kur mëson çdo ditë, po tregon Besë ndaj vetes. Ky zakon kombëtar antik — sot është superpower modern. 🇦🇱
              </p>
            </div>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
