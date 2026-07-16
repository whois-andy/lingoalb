'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Swords, Trophy, Zap, Clock, Check, X, Users, Copy, Loader2 } from 'lucide-react';
import { dailyAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type BattlePhase = 'lobby' | 'join' | 'waiting' | 'playing' | 'done';

export default function BattlePage() {
  const { user, isDark, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const [phase, setPhase] = useState<BattlePhase>('lobby');
  const [battleId, setBattleId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [session, setSession] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [myScore, setMyScore] = useState(0);
  const [theirScore, setTheirScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const pollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isHost = useRef(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) { router.push('/auth/login'); return; }
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, [_hasHydrated]);

  const createBattle = async () => {
    setCreating(true);
    try {
      const res = await dailyAPI.createBattle();
      const { battleId: id, session: s } = res.data;
      setBattleId(id);
      setSession(s);
      isHost.current = true;
      setPhase('waiting');
      // Poll for guest to join
      pollRef.current = setInterval(async () => {
        try {
          const r = await dailyAPI.getBattle(id);
          const updated = r.data.session;
          setSession(updated);
          if (updated.status === 'active') {
            clearInterval(pollRef.current);
            startGame(updated, id);
          }
        } catch {}
      }, 2000);
    } catch {
      toast.error('Nuk u krijua beteja. Provoni përsëri.');
    } finally {
      setCreating(false);
    }
  };

  const joinBattle = async () => {
    if (!joinCode.trim()) { toast.error('Shkruani kodin e betesë!'); return; }
    setJoining(true);
    try {
      const res = await dailyAPI.joinBattle(joinCode.toUpperCase().trim());
      const s = res.data.session;
      setBattleId(s.id);
      setSession(s);
      isHost.current = false;
      startGame(s, s.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kodi i gabuar ose beteja ka filluar.');
    } finally {
      setJoining(false);
    }
  };

  const buildOptions = (questions: any[], index: number): string[] => {
    const correct = questions[index]?.targetWord || '';
    const others = questions
      .filter((_, i) => i !== index)
      .map(q => q.targetWord)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...others, correct].sort(() => Math.random() - 0.5);
  };

  const startGame = (s: any, id: string) => {
    setSession(s);
    setCurrentQ(0);
    setOptions(buildOptions(s.questions, 0));
    setPhase('playing');
    startTimer(s, id, 0);
  };

  const startTimer = (s: any, id: string, qIndex: number) => {
    setTimeLeft(15);
    setAnswered(false);
    setFeedback(null);
    setAnswer('');
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-submit wrong if not answered
          handleAnswer('__timeout__', s, id, qIndex);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleAnswer = useCallback(async (
    selected: string, s: any, id: string, qIndex: number
  ) => {
    if (answered) return;
    setAnswered(true);
    clearInterval(timerRef.current);

    const correct = selected === s.questions[qIndex]?.targetWord;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setMyScore(sc => sc + 1);

    try {
      await dailyAPI.submitAnswer(id, { questionIndex: qIndex, answer: selected });
    } catch {}

    // Poll opponent's state
    pollRef.current = setInterval(async () => {
      try {
        const r = await dailyAPI.getBattle(id);
        const updated = r.data.session;
        const theirAnswers = isHost.current ? updated.guestAnswers : updated.hostAnswers;
        const theirS = isHost.current ? updated.guestScore : updated.hostScore;
        setTheirScore(theirS);

        if (theirAnswers > qIndex || updated.status === 'done') {
          clearInterval(pollRef.current);
          if (updated.status === 'done' || qIndex >= s.questions.length - 1) {
            setSession(updated);
            setPhase('done');
          } else {
            const next = qIndex + 1;
            setCurrentQ(next);
            setOptions(buildOptions(s.questions, next));
            startTimer(s, id, next);
          }
        }
      } catch {}
    }, 1500);
  }, [answered]);

  const copyCode = () => {
    navigator.clipboard.writeText(battleId);
    setCopied(true);
    toast.success('Kodi u kopjua! Dërgojani shokut! 📱');
    setTimeout(() => setCopied(false), 3000);
  };

  if (!_hasHydrated) return null;

  const currentQuestion = session?.questions?.[currentQ];
  const amWinner = phase === 'done' && myScore > theirScore;
  const isDraw = phase === 'done' && myScore === theirScore;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-dark dark:via-dark dark:to-dark ${isDark ? 'dark' : ''}`}>
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white dark:hover:bg-dark-50 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              ⚔️ Sfida e Fjalëve
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sfido shokun — kush di më shumë anglisht?</p>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── LOBBY ── */}
          {phase === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* How it works */}
              <div className="card mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0">
                <h2 className="font-bold text-lg mb-3 flex items-center gap-2"><Swords className="w-5 h-5" /> Si funksionon?</h2>
                <ul className="space-y-2 text-sm text-indigo-100">
                  <li className="flex items-start gap-2"><span className="text-lg">1️⃣</span> Krijo një betejë dhe merr kodin</li>
                  <li className="flex items-start gap-2"><span className="text-lg">2️⃣</span> Dërgoji kodin shokut në WhatsApp</li>
                  <li className="flex items-start gap-2"><span className="text-lg">3️⃣</span> Shoku hyn me kodin — beteja fillon!</li>
                  <li className="flex items-start gap-2"><span className="text-lg">4️⃣</span> 10 pyetje, 15 sekonda secila — kush bën më shumë pikë fiton 100 XP!</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button onClick={createBattle} disabled={creating}
                  className="btn-primary w-full justify-center py-4 text-base">
                  {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Duke krijuar...</> : <><Swords className="w-5 h-5" /> Krijo Betejë të Re</>}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-dark-100" />
                  <span className="text-sm text-gray-400">ose</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-dark-100" />
                </div>

                <button onClick={() => setPhase('join')}
                  className="btn-secondary w-full justify-center py-4 text-base">
                  <Users className="w-5 h-5" /> Hyr në Betenë e Shokut
                </button>
              </div>

              <div className="card mt-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium flex items-start gap-2">
                  <span className="text-xl">⚡</span>
                  Fitoi betenë? +100 XP! Humbësh? Merr +25 XP për guximin!
                  Shqiptarët nuk dorëzohen kurrë — as në gjuhë! 🦅
                </p>
              </div>
            </motion.div>
          )}

          {/* ── JOIN ── */}
          {phase === 'join' && (
            <motion.div key="join" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="card rounded-2xl mb-4">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Shkruani kodin e betesë:</h2>
                <input
                  type="text"
                  className="input text-center text-2xl font-mono font-bold tracking-widest uppercase mb-4"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  maxLength={6}
                  autoFocus
                />
                <button onClick={joinBattle} disabled={joining || joinCode.length < 6}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50">
                  {joining ? <><Loader2 className="w-4 h-4 animate-spin" /> Duke hyrë...</> : <><Users className="w-4 h-4" /> Hyr në Betejë</>}
                </button>
              </div>
              <button onClick={() => setPhase('lobby')} className="w-full text-center text-gray-500 py-2 hover:text-gray-700 text-sm">
                ← Kthehu
              </button>
            </motion.div>
          )}

          {/* ── WAITING ── */}
          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="card rounded-3xl mb-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-4 inline-block">⚔️</motion.div>
                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">
                  Duke pritur kundërshtarin...
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Dërgojani këtë kod shokut tuaj:
                </p>

                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-6 mb-4">
                  <div className="font-mono text-5xl font-bold text-indigo-700 dark:text-indigo-300 tracking-widest mb-4">
                    {battleId}
                  </div>
                  <button onClick={copyCode}
                    className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'U kopjua!' : 'Kopjo kodin'}
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-center text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Duke pritur lidhjen e shokut...
                </div>
              </div>

              <button onClick={() => { clearInterval(pollRef.current); setPhase('lobby'); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Anulo betenë
              </button>
            </motion.div>
          )}

          {/* ── PLAYING ── */}
          {phase === 'playing' && currentQuestion && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Scoreboard */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex-1 card text-center py-3 px-2 rounded-2xl ${isHost.current ? 'border-2 border-primary-400' : ''}`}>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">{user?.name?.split(' ')[0]}</div>
                  <div className="font-display font-bold text-2xl text-primary-700 dark:text-primary-300">{myScore}</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="flex-1 card text-center py-3 px-2 rounded-2xl">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">
                    {isHost.current ? session?.guestName || 'Kundërshtari' : session?.hostName || 'Kundërshtari'}
                  </div>
                  <div className="font-display font-bold text-2xl text-gray-700 dark:text-gray-300">{theirScore}</div>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-500">Pyetja {currentQ + 1}/{session?.questions?.length}</span>
                <div className={`flex items-center gap-1.5 font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  <Clock className="w-4 h-4" />
                  {timeLeft}s
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 dark:bg-dark-100 rounded-full overflow-hidden mb-5">
                <motion.div className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-primary-600'}`}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 0.5 }} />
              </div>

              {/* Question */}
              <div className="card rounded-2xl text-center mb-4 py-8">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Shqip → Anglisht</div>
                <div className="font-display text-4xl font-bold text-gray-900 dark:text-white">
                  {currentQuestion.albanianWord}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {options.map((opt) => {
                  const isSelected = answer === opt;
                  const isCorrect = answered && opt === currentQuestion.targetWord;
                  const isWrong = answered && isSelected && opt !== currentQuestion.targetWord;
                  return (
                    <motion.button key={opt}
                      whileTap={!answered ? { scale: 0.96 } : {}}
                      onClick={() => !answered && (setAnswer(opt), handleAnswer(opt, session, battleId, currentQ))}
                      disabled={answered}
                      className={`p-4 rounded-2xl border-2 font-semibold text-sm transition-all ${
                        isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : isWrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
                        : isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700'
                        : 'border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}>
                      {isCorrect && <Check className="w-4 h-4 inline mr-1 text-green-500" />}
                      {isWrong && <X className="w-4 h-4 inline mr-1 text-red-500" />}
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {answered && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-3 text-center text-sm font-semibold ${feedback === 'correct' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  {feedback === 'correct' ? '✅ Saktë! +1 pikë' : `❌ Gabim! Përgjigja: ${currentQuestion.targetWord}`}
                  <div className="text-xs font-normal mt-1 text-gray-500">Duke pritur kundërshtarin...</div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── DONE ── */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }} className="text-center">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, delay: 0.2 }}
                className="text-8xl mb-4 inline-block">
                {amWinner ? '🏆' : isDraw ? '🤝' : '💪'}
              </motion.div>

              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {amWinner ? 'Fituat! Brava!' : isDraw ? 'Barazim!' : 'Humbët, por nuk ka gjë!'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                {amWinner ? 'Shqiponja fluturoi lart sot! 🦅 +100 XP' : isDraw ? 'Të dy keni mend! +25 XP' : 'Herën tjetër! Shqiptarët nuk heqin dorë! +25 XP'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`card rounded-2xl text-center ${amWinner ? 'border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                  <div className="text-xs text-gray-500 mb-1">{user?.name?.split(' ')[0]}</div>
                  <div className="font-display font-bold text-4xl text-gray-900 dark:text-white">{myScore}</div>
                  <div className="text-xs text-gray-400">pikë</div>
                  {amWinner && <div className="text-yellow-500 text-xs font-bold mt-1">🏆 FITUES</div>}
                </div>
                <div className="card rounded-2xl text-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {isHost.current ? session?.guestName : session?.hostName}
                  </div>
                  <div className="font-display font-bold text-4xl text-gray-900 dark:text-white">{theirScore}</div>
                  <div className="text-xs text-gray-400">pikë</div>
                  {!amWinner && !isDraw && <div className="text-yellow-500 text-xs font-bold mt-1">🏆 FITUES</div>}
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => { setPhase('lobby'); setMyScore(0); setTheirScore(0); setCurrentQ(0); setBattleId(''); setSession(null); }}
                  className="btn-primary w-full justify-center py-3">
                  <Swords className="w-4 h-4" /> Betejë e re
                </button>
                <Link href="/dashboard" className="btn-secondary w-full justify-center py-3">
                  Kthehu te kurset
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
