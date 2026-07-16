'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Flame, Trophy, Moon, Sun, LogOut, Shield, Target, TrendingUp, Award } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AVATARS = ['🦅','🐺','🦁','🐲','⚡','🔥','🦋','🐼','🦊','🌙','⭐','🚀','🎯','💎','🏆','🌊','🦄','🐯','🎭','🌟'];

export default function ProfilePage() {
  const [completedLessons, setCompletedLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const { user, isDark, toggleDark, logout, _hasHydrated, updateUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    usersAPI.getDashboard()
      .then(r => {
        setCompletedLessons(r.data.completedLessons || 0);
        if (r.data.user) updateUser({ xp: r.data.user.xp, streak: r.data.user.streak });
      })
      .catch(() => setCompletedLessons(0))
      .finally(() => setLoading(false));
  }, [_hasHydrated]);

  const handleLogout = () => { logout(); toast.success('U çkyçët me sukses!'); router.push('/'); };

  const handleSelectAvatar = async (emoji: string) => {
    setSavingAvatar(true);
    try {
      await usersAPI.updateAvatar(emoji);
      updateUser({ avatar: emoji });
      setAvatarOpen(false);
      toast.success('Avatari u ndryshua!');
    } catch {
      toast.error('Nuk u ruajt avatari. Provo sërish.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const xpThresholds = [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  const currentXP = user?.xp || 0;
  const levelIndex = xpThresholds.findIndex(t => t > currentXP);
  const levelNum = levelIndex === -1 ? 10 : levelIndex + 1;

  const statCards = [
    { label: 'XP Totale', value: currentXP.toLocaleString(), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Streak', value: `${user?.streak || 0} ditë`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Mësime të Kryera', value: loading ? '...' : completedLessons, icon: Trophy, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Niveli', value: `Nivel ${levelNum}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  if (!_hasHydrated) return null;

  const displayAvatar = user?.avatar;

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark transition-colors">
        <div className="bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-dark-100">
          <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white font-display">Profili im</h1>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

          {/* Avatar card */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card text-center rounded-2xl">
            <div className="relative inline-block mb-3">
              <motion.button whileTap={{ scale: 0.94 }} onClick={() => setAvatarOpen(v => !v)}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-50 ${
                  avatarOpen ? 'ring-primary-500' : 'ring-transparent hover:ring-primary-300'
                } ${displayAvatar ? 'bg-gray-100 dark:bg-dark-100 text-5xl' : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white text-3xl font-bold'}`}>
                {displayAvatar || user?.name?.charAt(0).toUpperCase()}
              </motion.button>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs shadow">✏️</div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
            <button onClick={() => setAvatarOpen(v => !v)}
              className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline">
              {avatarOpen ? 'Mbyll zgjedhësin' : 'Ndrysho avatarin'}
            </button>
            {user?.role === 'admin' && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full">
                  <Shield className="w-3 h-3" /> Administrator
                </span>
              </div>
            )}

            {/* Avatar picker */}
            <AnimatePresence>
              {avatarOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Zgjidhni avatarin tuaj:</p>
                  <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                    {AVATARS.map(emoji => (
                      <motion.button key={emoji} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }}
                        disabled={savingAvatar}
                        onClick={() => handleSelectAvatar(emoji)}
                        className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          user?.avatar === emoji
                            ? 'bg-primary-100 dark:bg-primary-900/40 ring-2 ring-primary-500 shadow-md'
                            : 'bg-gray-100 dark:bg-dark-100 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                        }`}>
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="card text-center rounded-2xl py-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="font-display font-bold text-xl text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card rounded-2xl space-y-1">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">Lidhje të shpejta</h3>

            <Link href="/certifikata" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certifikatat e Mia</span>
            </Link>

            <Link href="/pikat-dobeta" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pikat e Dobëta</span>
            </Link>

            <Link href="/arritjet" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Arritjet & Badge-t</span>
            </Link>

            <button onClick={toggleDark}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
              <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Mënyra e ditës' : 'Mënyra e natës'}
              </span>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>

            {user?.role === 'admin' && (
              <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <Shield className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Panel Admin</span>
              </Link>
            )}

            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Çkyçu</span>
            </button>
          </motion.div>

          <p className="text-center text-xs text-gray-400 pb-4">LingoAlb v1.0 — Mëso gjuhë përmes shqipes 🇦🇱</p>
        </div>
      </div>
    </div>
  );
}
