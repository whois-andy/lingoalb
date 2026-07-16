'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame, Zap, BookOpen, Trophy, ArrowRight, Play,
  Globe, Star, TrendingUp, LogOut, Moon, Sun, Swords, Brain, Award, Target,
  Languages, Lock, CheckCircle2, Heart, Shield, User
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI, languagesAPI, leaderboardAPI, dailyAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isDark, toggleDark, _hasHydrated, updateUser } = useAuthStore();
  const [languages, setLanguages] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyWord, setDailyWord] = useState<any>(null);
  const [dailyPracticed, setDailyPracticed] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  useEffect(() => {
    // Wait for Zustand to load from localStorage before checking auth
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (isDark) document.documentElement.classList.add('dark');
    loadData();
  }, [_hasHydrated, isAuthenticated]);

  // Each call is INDEPENDENT — one failure won't break the others
  const loadData = async () => {
    setLoading(true);

    // Languages
    languagesAPI.getAll()
      .then(res => setLanguages(res.data.languages || []))
      .catch(() => setLanguages([]));

    // Dashboard stats — backend returns: { user, completedLessons, recentProgress }
    usersAPI.getDashboard()
      .then(res => {
        const data = res.data;
        setCompletedLessons(data.completedLessons || 0);
        setEnrolledCount(data.user?.enrolledLanguages?.length || 0);
        if (data.user) updateUser({ xp: data.user.xp, streak: data.user.streak, streakFreezes: data.user.streakFreezes || 0 });
      })
      .catch(() => {
        setCompletedLessons(0);
        setEnrolledCount(0);
      });

    // Leaderboard — backend returns: { leaderboard: [...] }
    leaderboardAPI.get()
      .then(res => setLeaderboard((res.data.leaderboard || []).slice(0, 5)))
      .catch(() => setLeaderboard([]));

    // Daily word
    dailyAPI.getWord()
      .then(res => setDailyWord(res.data.word || null))
      .catch(() => {});

    // Achievements
    dailyAPI.getAchievements()
      .then(res => setEarnedBadges(res.data.achievements || []))
      .catch(() => {});

    // Check daily practice
    const today = new Date().toDateString();
    if (localStorage.getItem('fjala_practiced') === today) setDailyPracticed(true);

    // Small delay to let calls start, then stop spinner
    setTimeout(() => setLoading(false), 800);
  };

  // Re-fetch when user returns to dashboard (e.g. after completing a lesson)
  useEffect(() => {
    const onFocus = async () => {
      if (!isAuthenticated || !_hasHydrated) return;
      loadData(); // refresh languages, leaderboard, stats
      // Also sync user XP/streak/achievements from server
      try {
        const res = await fetch(
          (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/users/dashboard',
          { headers: { Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('lingoalb-auth') || '{}')?.state?.token } }
        );
        const data = await res.json();
        if (data.user) {
          updateUser({ xp: data.user.xp, streak: data.user.streak });
        }
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, _hasHydrated]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleBuyFreeze = async () => {
    try {
      const res = await usersAPI.buyStreakFreeze();
      if (res.data.user) updateUser({ xp: res.data.user.xp, streak: res.data.user.streak, streakFreezes: res.data.user.streakFreezes });
      toast.success('Ruajtja e serisë u ble! ❄️');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gabim gjatë blerjes.');
    }
  };

  const xpThresholds = [100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];
  const currentXP = user?.xp || 0;
  const nextLevel = xpThresholds.find(t => t > currentXP) || 10000;
  const levelIndex = xpThresholds.findIndex(t => t > currentXP);
  const prevLevel = levelIndex > 0 ? xpThresholds[levelIndex - 1] : 0;
  const xpProgress = Math.min(((currentXP - prevLevel) / (nextLevel - prevLevel)) * 100, 100);

  const myRank = leaderboard.findIndex(p => p.name === user?.name) + 1;

  // Last 7 days streak calendar
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const active = i >= 7 - Math.min(user?.streak || 0, 7);
    return { day: d.toLocaleDateString('sq-AL', { weekday: 'short' }), active };
  });

  // Show blank screen while store is hydrating from localStorage
  // This prevents the flash redirect to login
  if (!_hasHydrated) return null;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Duke ngarkuar...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>

      {/* ── Sidebar ── */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-50 border-r border-gray-100 dark:border-dark-100 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-dark-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-accent flex items-center justify-center">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Lingo<span className="text-accent">Alb</span>
            </span>
          </Link>
        </div>

        {/* User card in sidebar */}
        <div className="p-4 border-b border-gray-100 dark:border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { icon: Globe,   label: 'Gjuhët',        href: '/dashboard', active: true },
            { icon: Trophy,  label: 'Klasifikimi',    href: '/leaderboard' },
            { icon: Swords,  label: 'Sfida Live',     href: '/battle' },
            { icon: Brain,   label: 'Mentaliteti',    href: '/mentaliteti' },
            { icon: Award,   label: 'Arritjet',       href: '/arritjet' },
            { icon: Target,  label: 'Pikat e Dobëta', href: '/pikat-dobeta' },
            { icon: Heart,   label: 'Fjalë Favorite', href: '/favorites' },
            { icon: Award,   label: 'Certifikata',     href: '/certifikata' },
            { icon: User,    label: 'Profili',         href: '/profile' },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100'
              }`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />{item.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-all">
              <Shield className="w-4 h-4" /> Panel Admin
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-dark-100 space-y-1">
          <button onClick={toggleDark}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-all">
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Mënyra e ndritshme' : 'Mënyra e errët'}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut className="w-4 h-4" /> Çkyçu
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="lg:ml-64">

        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-dark-100 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">
                Mirë se erdhe, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-xl">
                <span className="streak-fire text-base">🔥</span>
                <span className="font-bold text-sm">{user?.streak || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-xl">
                <Zap className="w-4 h-4" />
                <span className="font-bold text-sm">{currentXP.toLocaleString()} XP</span>
              </div>
              <button onClick={handleLogout} className="lg:hidden p-2 text-red-500 hover:bg-red-50 rounded-xl">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">

          {/* XP Progress Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-r from-primary-700 to-primary-900 text-white border-0 shadow-xl shadow-primary-900/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-primary-200 text-sm font-medium mb-1">Progresi juaj</div>
                <div className="font-display font-bold text-3xl">{currentXP.toLocaleString()} XP</div>
                {myRank > 0 && (
                  <div className="text-primary-300 text-sm mt-1 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Pozita #{myRank} në klasifikim
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-primary-300 text-xs mb-1">Niveli {levelIndex + 1}</div>
                <div className="font-bold text-lg">{nextLevel.toLocaleString()} XP</div>
                <div className="text-primary-300 text-xs">niveli tjetër</div>
              </div>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-white rounded-full" />
            </div>
            <div className="mt-2 text-primary-200 text-xs">{Math.round(xpProgress)}% drejt nivelit tjetër</div>
          </motion.div>

          {/* Streak + Stats */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Streak Calendar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="streak-fire text-2xl">🔥</span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Seria Ditore</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user?.streak || 0} ditë radhazi</div>
                </div>
              </div>
              <div className="flex gap-1.5 justify-between">
                {streakDays.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${d.active ? 'bg-orange-400 text-white' : 'bg-gray-100 dark:bg-dark-100 text-gray-400'}`}>
                      {d.active ? '🔥' : '·'}
                    </div>
                    <span className="text-xs text-gray-400">{d.day}</span>
                  </div>
                ))}
              </div>

              {/* Streak freeze row */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">❄️</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{user?.streakFreezes || 0}</span>
                  <span className="text-xs text-gray-400">ruajtje serie</span>
                </div>
                <button
                  onClick={handleBuyFreeze}
                  disabled={currentXP < 200}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Bli (−200 XP)
                </button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-3">
              {[
                { label: 'Mësime të Kryera', val: completedLessons, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: 'XP Totale', val: currentXP.toLocaleString(), icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { label: 'Pozita Globale', val: myRank > 0 ? `#${myRank}` : '-', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                { label: 'Gjuhë Regjistruar', val: enrolledCount, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              ].map(s => (
                <div key={s.label} className="card text-center py-4 px-3">
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="font-display font-bold text-xl text-gray-900 dark:text-white">{s.val}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── New Feature Cards Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Daily Word */}
            <Link href="/fjala-e-dites"
              className="card-hover group rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 group-hover:from-yellow-400/20 group-hover:to-orange-400/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl shadow-md">⭐</div>
                  {dailyPracticed && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">✓ E bëra</span>}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Fjala e Ditës</h3>
                {dailyWord ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sot: <strong className="text-gray-700 dark:text-gray-200">{dailyWord.albanianWord}</strong> → {dailyWord.targetWord}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Një fjalë e re çdo ditë</p>
                )}
              </div>
            </Link>

            {/* Battle */}
            <Link href="/battle"
              className="card-hover group rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 group-hover:from-purple-400/20 group-hover:to-indigo-400/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-md">⚔️</div>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">Live</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Sfida me Shok</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Luaj live kundër shokëve — +100 XP nëse fiton!</p>
              </div>
            </Link>

            {/* Mentaliteti */}
            <Link href="/mentaliteti"
              className="card-hover group rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-teal-400/10 group-hover:from-blue-400/20 group-hover:to-teal-400/20 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center text-xl shadow-md">🧠</div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">E re</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Mentaliteti Anglez</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Si mendojnë ndryshe anglezët — sekreti i rrjedhshmërisë</p>
              </div>
            </Link>
          </div>

          {/* Badges preview */}
          {earnedBadges.length > 0 && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="card rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  🏆 Badge-t e Mia
                </h3>
                <Link href="/arritjet" className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                  Shih të gjitha <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex gap-3 flex-wrap">
                {[
                  { id:'fillestar', e:'🌱' }, { id:'nxenes_i_zjarrit', e:'🔥' }, { id:'besa_3', e:'🤝' },
                  { id:'besa_7', e:'🦅' }, { id:'mjeshtri', e:'⚡' }, { id:'besa_30', e:'👑' },
                  { id:'kampioni', e:'🏆' }, { id:'besa_100', e:'🌟' }
                ].map(b => (
                  <div key={b.id}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${earnedBadges.includes(b.id) ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-md' : 'bg-gray-100 dark:bg-dark-100 opacity-30 grayscale'}`}
                    title={b.id}>
                    {b.e}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Languages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">Kurset e Gjuhëve</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {languages.filter(l => l.isAvailable).length} aktive
              </span>
            </div>

            {languages.length === 0 ? (
              <div className="card text-center py-12">
                <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-dark-100" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Duke ngarkuar gjuhët...
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((lang, i) => (
                  <motion.div key={lang._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}>
                    {lang.isAvailable ? (
                      <Link href={`/learn/${lang._id}`}
                        className="card-hover group flex items-start gap-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-5 text-6xl flex items-center justify-center pointer-events-none">{lang.flag}</div>
                        <div className="text-4xl">{lang.flag}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                            {lang.nameAlb}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{lang.description}</div>
                          <div className="flex items-center gap-2 mt-3 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                            <Play className="w-4 h-4" /> Fillo mësimin
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-dark-100 flex-shrink-0 mt-1 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ) : (
                      <div className="card flex items-center gap-4 opacity-55 cursor-not-allowed">
                        <div className="text-4xl grayscale">{lang.flag}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-700 dark:text-gray-300">{lang.nameAlb}</div>
                          <div className="text-xs text-gray-400 mt-0.5 truncate">{lang.description}</div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-dark-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                          <Lock className="w-3 h-3" /> Shpejt
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Klasifikimi
              </h3>
              <Link href="/leaderboard"
                className="text-sm text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                Shih të gjithë <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-10 h-10 mx-auto mb-2 text-gray-200 dark:text-dark-100" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Nuk ka të dhëna për klasifikimin akoma.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((player: any, i: number) => {
                  const isMe = player.name === user?.name;
                  return (
                    <div key={player._id || i}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isMe ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'hover:bg-gray-50 dark:hover:bg-dark-100'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 dark:bg-dark-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 dark:bg-dark-100 text-gray-500'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {player.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm truncate ${isMe ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                          {player.name} {isMe && <span className="text-xs font-normal text-gray-500">(Ti)</span>}
                        </div>
                        <div className="text-xs text-gray-400">🔥 {player.streak || 0} ditë</div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                        <Zap className="w-3.5 h-3.5" />{(player.xp || 0).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Mobile quick nav */}
          <div className="lg:hidden grid grid-cols-2 gap-3 pb-4">
            {[
              { icon: Trophy, label: 'Klasifikimi',    href: '/leaderboard', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { icon: Heart,  label: 'Fjalë Favorite', href: '/favorites',   color: 'text-rose-600',   bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { icon: User,   label: 'Profili im',      href: '/profile',     color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
              ...(user?.role === 'admin' ? [{ icon: Shield, label: 'Panel Admin', href: '/admin', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' }] : []),
            ].map(item => (
              <Link key={item.label} href={item.href}
                className="card flex items-center gap-3 py-4 hover:shadow-md transition-all">
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
