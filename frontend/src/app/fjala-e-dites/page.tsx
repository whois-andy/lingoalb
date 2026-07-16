'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Volume2, Share2, Check, BookOpen, Star, RefreshCw, Calendar } from 'lucide-react';
import { dailyAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function FjaladDitesPage() {
  const { user, isDark, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [word, setWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [practiced, setPracticed] = useState(false);

  // Check if already practiced today
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    const lastPractice = localStorage.getItem('fjala_practiced');
    const today = new Date().toDateString();
    if (lastPractice === today) setPracticed(true);
    fetchWord();
  }, [_hasHydrated]);

  const fetchWord = async () => {
    try {
      const res = await dailyAPI.getWord();
      setWord(res.data.word);
    } catch {
      // fallback word
      setWord({
        albanianWord: 'Mirëdita',
        targetWord: 'Good afternoon',
        pronunciation: 'ɡʊd ˈæftərnuːn',
        exampleAlb: 'Mirëdita, si jeni sot?',
        exampleTarget: 'Good afternoon, how are you today?',
        category: 'greeting',
      });
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (!word) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.targetWord);
    u.lang = 'en-US'; u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const markPracticed = () => {
    const today = new Date().toDateString();
    localStorage.setItem('fjala_practiced', today);
    setPracticed(true);
    toast.success('Bravo! +10 XP për sot! 🔥', { duration: 3000 });
  };

  const shareWhatsApp = () => {
    if (!word) return;
    const text = `🇦🇱 Fjala e Ditës në LingoAlb:\n\n"${word.albanianWord}" = "${word.targetWord}"\n\n📝 Shembull: ${word.exampleTarget}\n\nMëso edhe ti: http://localhost:3000`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    if (!word) return;
    const text = `Fjala e Ditës: "${word.albanianWord}" = "${word.targetWord}" 🇦🇱`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('U kopjua!');
    setTimeout(() => setCopied(false), 2000);
  };

  const todayStr = new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!_hasHydrated || loading) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-yellow-50 dark:from-dark dark:via-dark-50 dark:to-dark ${isDark ? 'dark' : ''}`}>
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              ⭐ Fjala e Ditës
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{todayStr}</p>
          </div>
        </div>

        {/* Practiced banner */}
        {practiced && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400 text-sm">E praktikuat sot! 🎉</p>
              <p className="text-xs text-green-600 dark:text-green-500">Kthehuni nesër për fjalën e re</p>
            </div>
          </motion.div>
        )}

        {/* Main flip card */}
        {word && (
          <div className="mb-6" style={{ perspective: 1000 }}>
            <motion.div
              className="relative w-full cursor-pointer"
              style={{ transformStyle: 'preserve-3d', minHeight: 280 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onClick={() => setFlipped(f => !f)}
            >
              {/* Front — Albanian */}
              <div className="absolute inset-0 card flex flex-col items-center justify-center text-center p-8 rounded-3xl shadow-xl"
                style={{ backfaceVisibility: 'hidden' }}>
                <div className="text-6xl mb-4">🇦🇱</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Shqip</div>
                <div className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-2">{word.albanianWord}</div>
                {word.category && (
                  <span className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full font-medium mt-2">
                    {word.category}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-6 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Klikoni për të parë anglishten
                </p>
              </div>

              {/* Back — English */}
              <div className="absolute inset-0 card flex flex-col items-center justify-center text-center p-8 rounded-3xl shadow-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="text-6xl mb-4">🇬🇧</div>
                <div className="text-xs text-primary-200 uppercase tracking-widest font-semibold mb-3">English</div>
                <div className="font-display text-4xl font-bold mb-2">{word.targetWord}</div>
                {word.pronunciation && (
                  <div className="text-primary-200 font-mono text-lg mb-3">/{word.pronunciation}/</div>
                )}
                <button onClick={(e) => { e.stopPropagation(); speak(); }}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors mt-2">
                  <Volume2 className="w-4 h-4" /> Dëgo shqiptimin
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Example sentence */}
        {word && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card mb-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Shembull në kontekst</span>
            </div>
            <div className="space-y-3">
              {word.exampleAlb && (
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-dark-100 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">🇦🇱</span>
                  <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{word.exampleAlb}"</p>
                </div>
              )}
              {word.exampleTarget && (
                <div className="flex items-start gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">🇬🇧</span>
                  <p className="text-primary-700 dark:text-primary-300 text-sm italic font-medium">"{word.exampleTarget}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Albanian cultural tip */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🦅</span>
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">Këshilla e Shqiponjës</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                Shkruaje fjalën 3 herë me dorë, thuaje me zë 5 herë, dhe përdore në 1 fjali të vetën. 
                Kjo metodë quhet <strong>SRS</strong> — e njëjta metodë që përdorin diplomatët shqiptarë! 💪
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="space-y-3">
          {!practiced && (
            <button onClick={markPracticed}
              className="btn-primary w-full justify-center py-4 text-base">
              <Star className="w-5 h-5" /> E mësova fjalën e sotme! +10 XP
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors">
              <Share2 className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gray-100 dark:bg-dark-100 hover:bg-gray-200 dark:hover:bg-dark-50 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'U kopjua!' : 'Kopjo'}
            </button>
          </div>

          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
            <Calendar className="w-4 h-4" /> Kthehu te kurset
          </Link>
        </div>
      </div>
    </div>
  );
}
