'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, Crown, Flame, Zap, TrendingUp, Star } from 'lucide-react';
import { leaderboardAPI, usersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [myStats, setMyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, isDark, _hasHydrated, updateUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    fetchData();
  }, [_hasHydrated]);

  const fetchData = async () => {
    try {
      const [lbRes, dashRes] = await Promise.all([leaderboardAPI.get(), usersAPI.getDashboard()]);
      setLeaders(lbRes.data.leaderboard || []);
      // Backend dashboard returns { user, completedLessons, recentProgress }
      const dbUser = dashRes.data?.user;
      if (dbUser) {
        setMyStats(dbUser);
        // Sync store with real DB values
        updateUser({ xp: dbUser.xp, streak: dbUser.streak });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const myRank = leaders.findIndex(e => e.name === (myStats?.name || user?.name)) + 1;

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700';
    return 'bg-white dark:bg-dark-50 border-gray-100 dark:border-dark-100';
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-dark-50 border-b border-gray-200 dark:border-dark-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white font-display">Klasifikimi</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Top {leaders.length} nxënës</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

          {/* My rank card */}
          {myRank > 0 && myStats && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
              className="card bg-gradient-to-r from-primary-700 to-primary-900 text-white border-0 shadow-xl shadow-primary-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-200 text-sm mb-1">Pozita jote</p>
                  <p className="text-4xl font-bold">#{myRank}</p>
                  <p className="text-primary-200 text-sm mt-1">{myStats.name || user?.name}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2 justify-end">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold text-lg">{(myStats.xp || 0).toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Flame className="w-4 h-4 text-orange-300" />
                    <span className="font-semibold">{myStats.streak || 0} ditë streak</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Podium — top 3 */}
          {!loading && leaders.length >= 3 && (
            <div className="flex items-end justify-center gap-3 py-4">
              {/* 2nd place */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                className="flex flex-col items-center gap-2 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {leaders[1].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center truncate max-w-[70px]">{leaders[1].name}</p>
                <p className="text-xs text-yellow-600 font-bold">{(leaders[1].xp || 0).toLocaleString()} XP</p>
                <div className="bg-gray-300 dark:bg-gray-600 w-full h-14 rounded-t-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </motion.div>

              {/* 1st place */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
                className="flex flex-col items-center gap-2 flex-1">
                <Crown className="w-7 h-7 text-yellow-400" />
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-yellow-300 shadow-2xl shadow-yellow-400/30">
                  {leaders[0].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center truncate max-w-[70px]">{leaders[0].name}</p>
                <p className="text-xs text-yellow-600 font-bold">{(leaders[0].xp || 0).toLocaleString()} XP</p>
                <div className="bg-yellow-400 w-full h-22 rounded-t-xl flex items-center justify-center" style={{ height: 88 }}>
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
              </motion.div>

              {/* 3rd place */}
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="flex flex-col items-center gap-2 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {leaders[2].name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center truncate max-w-[70px]">{leaders[2].name}</p>
                <p className="text-xs text-yellow-600 font-bold">{(leaders[2].xp || 0).toLocaleString()} XP</p>
                <div className="bg-orange-400 w-full h-8 rounded-t-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">3</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Full list */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Të gjithë nxënësit</h2>
            </div>

            {loading ? (
              Array.from({ length:8 }).map((_,i) => (
                <div key={i} className="card animate-pulse flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-dark-100 rounded-full" />
                  <div className="w-10 h-10 bg-gray-200 dark:bg-dark-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-dark-100 rounded w-1/3" />
                    <div className="h-2 bg-gray-200 dark:bg-dark-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : leaders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nuk ka të dhëna për klasifikimin akoma.</p>
              </div>
            ) : (
              leaders.map((entry, idx) => {
                const rank = idx + 1;
                const isMe = entry.name === (myStats?.name || user?.name);
                return (
                  <motion.div key={entry._id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:idx*0.03 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border mb-2 transition-all ${getRankBg(rank)} ${isMe ? 'ring-2 ring-primary-400 dark:ring-primary-600' : ''}`}>
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {getRankDisplay(rank)}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {entry.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {entry.name} {isMe && <span className="text-xs font-normal text-gray-500">(Ti)</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-orange-400" />{entry.streak || 0} ditë
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="font-bold text-gray-800 dark:text-white text-sm">{(entry.xp || 0).toLocaleString()}</span>
                      </div>
                      <span className="text-xs text-gray-400">XP</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
