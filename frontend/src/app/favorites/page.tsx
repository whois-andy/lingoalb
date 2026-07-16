'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Volume2, Search, BookOpen, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface FavoriteWord {
  id: string;
  albanianWord: string;
  targetWord: string;
  pronunciation?: string;
  exampleAlb?: string;
  exampleTarget?: string;
  languageName: string;
  languageFlag: string;
  addedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isDark, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    // Load from localStorage (offline-capable)
    try {
      const stored = localStorage.getItem(`lingoalb_favorites_${user?.id || user?._id}`);
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    if (user) {
      localStorage.setItem(`lingoalb_favorites_${user?.id || user?._id}`, JSON.stringify(updated));
    }
  };

  const speak = (text: string, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      window.speechSynthesis.speak(utt);
    }
  };

  const filtered = favorites.filter(f =>
    f.albanianWord.toLowerCase().includes(search.toLowerCase()) ||
    f.targetWord.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white font-display">Fjalët e preferuara</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{favorites.length} fjalë të ruajtura</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Kërko fjalë..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-rose-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {search ? 'Nuk u gjet asgjë' : 'Nuk keni fjalë të preferuara'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {search
                  ? 'Provoni me terma të tjerë kërkimi.'
                  : 'Gjatë mësimeve, mund të ruani fjalët që ju duken interesante.'}
              </p>
              {!search && (
                <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Fillo të mësosh
                </Link>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {filtered.map((word, idx) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.04 }}
                    className="card group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl flex-shrink-0">{word.languageFlag}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-900 dark:text-white text-lg">{word.targetWord}</span>
                          <button
                            onClick={() => speak(word.targetWord)}
                            className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">{word.albanianWord}</p>
                        {word.pronunciation && (
                          <p className="text-gray-400 text-xs font-mono mt-0.5">/{word.pronunciation}/</p>
                        )}
                        {word.exampleAlb && (
                          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-dark-700 space-y-0.5">
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">{word.exampleAlb}</p>
                            {word.exampleTarget && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 italic">{word.exampleTarget}</p>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            {word.languageName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(word.addedAt).toLocaleDateString('sq-AL')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavorite(word.id)}
                        className="p-2 rounded-xl text-gray-300 dark:text-dark-500 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
