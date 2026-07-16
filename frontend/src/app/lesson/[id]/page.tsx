'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Volume2, CheckCircle, XCircle, ArrowRight,
  BookOpen, Zap, Star, Trophy, RotateCcw, Mic,
  MicOff, AlertCircle, ChevronRight, Heart, Shuffle, Home
} from 'lucide-react';
import { lessonsAPI, progressAPI, levelsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type Phase = 'vocabulary' | 'exercises' | 'complete';

// ─── Smart Answer Checker ─────────────────────────────────────────────────────
// Accepts answers that are: different case, extra spaces, minor typos,
// missing articles (a/an/the), or Albanian diacritic variations
function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .trim()
      // Remove punctuation
      .replace(/[.,!?;:'"()-]/g, '')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      // Normalize Albanian characters to base (ë→e, ç→c) for fuzzy match
      .replace(/ë/g, 'e')
      .replace(/ç/g, 'c')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/û/g, 'u');

  const u = normalize(userAnswer);
  const c = normalize(correctAnswer);

  // Exact match after normalization
  if (u === c) return true;

  // Remove articles (a, an, the) from both and compare
  const stripArticles = (s: string) =>
    s.replace(/^(a |an |the )/, '').replace(/ (a |an |the )/g, ' ').trim();

  if (stripArticles(u) === stripArticles(c)) return true;

  // Allow 1 character typo for short answers, 2 for longer ones
  const maxTypos = c.length <= 5 ? 1 : 2;
  if (levenshtein(u, c) <= maxTypos) return true;

  return false;
}

// Levenshtein distance — counts minimum edits to turn one string into another
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}


// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const colors = ['#1B4FD8','#E63946','#2DC653','#F59E0B','#8B5CF6','#EC4899'];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div key={i} className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: colors[i % colors.length], left: `${Math.random() * 100}%`, top: -20 }}
          animate={{ y: ['0vh','110vh'], rotate: [0, Math.random()*720-360], opacity: [1,1,0] }}
          transition={{ duration: 2+Math.random()*2, delay: Math.random()*0.8, ease:'easeIn' }}
        />
      ))}
    </div>
  );
}

// ─── XP Popup ────────────────────────────────────────────────────────────────
function XPPopup({ xp, show }: { xp: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity:0, y:0, scale:0.5 }} animate={{ opacity:1, y:-70, scale:1 }} exit={{ opacity:0, scale:0 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-yellow-900 font-bold text-xl px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
        >
          <Star className="w-5 h-5" /> +{xp} XP!
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Pronunciation Component ──────────────────────────────────────────────────
function PronunciationExercise({ word, lang, onResult, disabled }: {
  word: string; lang: string; onResult: (correct: boolean, said: string) => void; disabled: boolean;
}) {
  const [mode, setMode] = useState<'mic'|'text'>('mic');
  const [status, setStatus] = useState<'idle'|'listening'|'done'|'skipped'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [score, setScore] = useState<number|null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [textInput, setTextInput] = useState('');
  const recRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const doneRef = useRef(false);
  const bestRef = useRef('');

  React.useEffect(() => {
    doneRef.current = false;
    bestRef.current = '';
    setStatus('idle');
    setTranscript('');
    setInterimText('');
    setScore(null);
    setTimeLeft(10);
    setTextInput('');
    setMode('mic');
    return () => {
      clearInterval(timerRef.current);
      try { recRef.current?.abort(); } catch {}
    };
  }, [word]);

  const calcScore = (said: string, target: string): number => {
    const c = (s: string) => s.toLowerCase().trim()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
    const s = c(said); const t = c(target);
    if (!s) return 0;
    if (s === t) return 100;
    const sw = s.split(' '); const tw = t.split(' ');
    if (sw.includes(t) || tw.includes(s)) return 100;
    if (sw.some((w: string) => tw.includes(w))) return 85;
    if (s.includes(t) || t.includes(s)) return 80;
    const matched = tw.filter((w: string) => sw.some((sv: string) =>
      sv === w || (w.length > 3 && sv.startsWith(w.slice(0, w.length - 1)))
    )).length;
    return Math.round((matched / tw.length) * 100);
  };

  const finish = (finalTranscript: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    try { recRef.current?.stop(); } catch {}
    const best = finalTranscript || bestRef.current;
    if (!best) { setStatus('idle'); return; }
    const sim = calcScore(best, word);
    console.log('🎤', JSON.stringify(best), '→', JSON.stringify(word), '=', sim + '%');
    setTranscript(best);
    setInterimText('');
    setScore(sim);
    setStatus('done');
    onResult(sim >= 50, best);
  };

  const startMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMode('text'); return; }

    doneRef.current = false;
    bestRef.current = '';
    setInterimText('');
    setTranscript('');
    setScore(null);

    try {
      const rec = new SR();
      rec.lang = lang;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      recRef.current = rec;

      rec.onstart = () => {
        setStatus('listening');
        setTimeLeft(10);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) { clearInterval(timerRef.current); finish(bestRef.current); return 0; }
            return t - 1;
          });
        }, 1000);
      };

      rec.onresult = (e: any) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            // Pick best alternative by score
            let best = r[0].transcript; let bestSc = 0;
            for (let j = 0; j < r.length; j++) {
              const sc = calcScore(r[j].transcript, word);
              if (sc > bestSc) { bestSc = sc; best = r[j].transcript; }
            }
            final += best;
            bestRef.current = final;
          } else {
            interim += r[0].transcript;
            if (calcScore(interim, word) > calcScore(bestRef.current, word)) {
              bestRef.current = interim;
            }
          }
        }
        if (interim) setInterimText(interim);
        if (final) finish(final);
      };

      rec.onerror = (e: any) => {
        clearInterval(timerRef.current);
        console.warn('Speech error:', e.error);
        if (doneRef.current) return;
        if (e.error === 'not-allowed' || e.error === 'permission-denied') {
          toast.error('Mikrofoni u bllokua! Klikoni 🔒 pranë URL-së dhe jepni leje.', { duration: 6000 });
          setStatus('idle');
        } else if (e.error === 'network') {
          // Switch to text mode silently — no scary error message
          toast('📝 Njohja me zë nuk funksionoi — shkruajeni fjalën!', { icon: '💡', duration: 3000 });
          setMode('text');
          setStatus('idle');
        } else if (e.error === 'no-speech') {
          if (bestRef.current) { finish(bestRef.current); }
          else { setStatus('idle'); toast('Nuk u dëgjua asgjë. Flisni pak më fort! 🔊', { icon: '⚠️', duration: 2500 }); }
        } else {
          // Unknown error — switch to text mode
          setMode('text');
          setStatus('idle');
        }
      };

      rec.onend = () => {
        clearInterval(timerRef.current);
        if (!doneRef.current) {
          if (bestRef.current) finish(bestRef.current);
          else setStatus('idle');
        }
        setInterimText('');
      };

      rec.start();
    } catch (err: any) {
      console.error('Could not start:', err);
      setMode('text');
    }
  };

  const submitText = () => {
    const val = textInput.trim();
    if (!val) return;
    const sim = calcScore(val, word);
    setScore(sim);
    setTranscript(val);
    setStatus('done');
    onResult(sim >= 50, val);
  };

  const retry = () => {
    doneRef.current = false;
    bestRef.current = '';
    setStatus('idle');
    setTranscript('');
    setInterimText('');
    setScore(null);
    setTimeLeft(10);
    setTextInput('');
  };

  const skip = () => {
    clearInterval(timerRef.current);
    try { recRef.current?.abort(); } catch {}
    if (!doneRef.current) {
      doneRef.current = true;
      setStatus('skipped');
      onResult(true, '__skipped__');
    }
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang; u.rate = 0.75;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-5">
      {/* Word + listen */}
      <div className="text-center">
        <div className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-3">{word}</div>
        <div className="flex items-center justify-center gap-2">
          <button onClick={speak}
            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-xl hover:bg-primary-100 transition-colors">
            <Volume2 className="w-4 h-4" /> Dëgjo
          </button>
          <button onClick={() => setMode(m => m === 'mic' ? 'text' : 'mic')}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-dark-100 px-3 py-2 rounded-xl transition-colors">
            {mode === 'mic' ? '📝 Shkruaj' : '🎤 Mikrofon'}
          </button>
        </div>
      </div>

      {/* MIC MODE */}
      {mode === 'mic' && (
        <div className="flex flex-col items-center gap-4">
          {status === 'idle' && (
            <motion.button whileTap={{ scale: 0.92 }} onClick={startMic} disabled={disabled}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white flex flex-col items-center justify-center gap-2 shadow-2xl hover:shadow-primary-500/30 transition-all disabled:opacity-50">
              <Mic className="w-10 h-10" />
              <span className="text-xs font-semibold">Fol tani</span>
            </motion.button>
          )}

          {status === 'listening' && (
            <>
              <motion.button animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                onClick={() => finish(bestRef.current)}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex flex-col items-center justify-center gap-2 shadow-2xl shadow-red-500/30">
                <MicOff className="w-10 h-10" />
                <span className="text-xs font-semibold">Ndalo ({timeLeft}s)</span>
              </motion.button>
              <div className="flex items-center gap-1.5">
                {[0,1,2,3,4].map(i => (
                  <motion.div key={i} className="w-1.5 bg-primary-500 rounded-full"
                    animate={{ height: ['8px','24px','8px'] }}
                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }} />
                ))}
              </div>
              {interimText && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-primary-50 dark:bg-primary-900/20 rounded-xl px-4 py-2 text-sm text-primary-700 dark:text-primary-300 italic text-center">
                  "{interimText}"
                </motion.div>
              )}
            </>
          )}
        </div>
      )}

      {/* TEXT MODE */}
      {mode === 'text' && status !== 'done' && status !== 'skipped' && (
        <div className="space-y-3">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            📝 Shkruajeni fjalën angleze:
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              className="input text-center text-lg font-semibold flex-1"
              placeholder={word}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitText()}
              disabled={disabled}
            />
            <button onClick={submitText} disabled={!textInput.trim() || disabled}
              className="btn-primary px-4 py-2 disabled:opacity-50">
              ✓
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}
      {status === 'done' && score !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
              score >= 80 ? 'border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20'
              : score >= 50 ? 'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
              : 'border-red-400 text-red-600 bg-red-50 dark:bg-red-900/20'
            }`}>{score}%</div>
            <div className={`font-semibold text-sm ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {score >= 80 ? '🎉 Shkëlqyeshëm!' : score >= 50 ? '👍 Mirë!' : '😅 Provoni sërish!'}
            </div>
          </div>
          {transcript && transcript !== '__skipped__' && (
            <div className="bg-gray-50 dark:bg-dark-100 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Ju {mode === 'text' ? 'shkruat' : 'thatë'}:</div>
              <div className="font-medium text-gray-700 dark:text-gray-300 italic">"{transcript}"</div>
            </div>
          )}
          {!disabled && score < 80 && (
            <button onClick={retry}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 dark:border-dark-100 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 transition-all text-sm font-medium">
              <RotateCcw className="w-4 h-4" /> Provo sërish
            </button>
          )}
        </motion.div>
      )}

      {status === 'skipped' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
          <div className="text-4xl mb-2">⏭️</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">U kalua — asnjë zemër nuk u humb!</p>
        </motion.div>
      )}

      {/* Info + skip */}
      <div className="space-y-2">
        {mode === 'mic' && status !== 'done' && status !== 'skipped' && (
          <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-dark-100 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Funksionon më mirë në <strong>Google Chrome</strong>. Nëse mikrofoni nuk punon, shtypni <strong>"📝 Shkruaj"</strong> për të shkruar përgjigjen.</span>
          </div>
        )}
        {!disabled && status !== 'done' && status !== 'skipped' && (
          <button onClick={skip}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-dark-100 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all text-xs font-medium">
            ⏭️ Kalo pyetjen
          </button>
        )}
      </div>
    </div>
  );
}
// ─── Listening Challenge Component ───────────────────────────────────────────
function ListeningChallengeExercise({ word, lang, options, correctAnswer, onResult, disabled }: {
  word: string; lang: string; options: string[]; correctAnswer: string;
  onResult: (correct: boolean) => void; disabled: boolean;
}) {
  const [played, setPlayed] = useState(false);
  const [selected, setSelected] = useState<string|null>(null);
  const [revealed, setRevealed] = useState(false);

  const speak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang || 'de-DE'; u.rate = 0.8;
    window.speechSynthesis.speak(u);
    setPlayed(true);
  };

  const handleSelect = (opt: string) => {
    if (revealed || disabled) return;
    setSelected(opt);
    setRevealed(true);
    onResult(opt === correctAnswer);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={speak}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2 shadow-2xl transition-all ${
            played ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white' : 'bg-gradient-to-br from-primary-600 to-primary-800 text-white hover:shadow-primary-500/30'
          }`}>
          <Volume2 className="w-10 h-10" />
          <span className="text-xs font-semibold">{played ? 'Sërisht' : 'Dëgo'}</span>
        </motion.button>
        {!played && <p className="text-sm text-gray-400">Klikoni për të dëgjuar fjalën</p>}
      </div>

      {played && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3">
          {options.map(opt => {
            const isRight = revealed && opt === correctAnswer;
            const isWrong = revealed && opt === selected && opt !== correctAnswer;
            return (
              <motion.button key={opt} whileTap={!revealed ? { scale: 0.96 } : {}}
                onClick={() => handleSelect(opt)} disabled={revealed || disabled}
                className={`p-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  isRight ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : isWrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
                  : opt === selected && !revealed ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700'
                  : 'border-gray-100 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}>
                {isRight && <CheckCircle className="w-4 h-4 inline mr-1.5 text-green-500" />}
                {isWrong && <XCircle className="w-4 h-4 inline mr-1.5 text-red-500" />}
                {opt}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ─── Matching Component ───────────────────────────────────────────────────────
function MatchingExercise({ pairs, onComplete, disabled }: {
  pairs: { left: string; right: string }[]; onComplete: (c: boolean) => void; disabled: boolean;
}) {
  const [leftSel, setLeftSel] = useState<number|null>(null);
  const [rightSel, setRightSel] = useState<number|null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{l:number;r:number}|null>(null);
  const shuffled = useRef([...pairs].sort(() => Math.random()-0.5));

  const isRightMatched = (i: number) => matched.some(m => pairs[m].right === shuffled.current[i].right);

  const checkMatch = (l: number, r: number) => {
    if (pairs[l].right === shuffled.current[r].right) {
      const nm = [...matched, l];
      setMatched(nm); setLeftSel(null); setRightSel(null);
      if (nm.length === pairs.length) setTimeout(() => onComplete(true), 400);
    } else {
      setWrong({l,r});
      setTimeout(() => { setWrong(null); setLeftSel(null); setRightSel(null); }, 800);
    }
  };

  const handleLeft = (i: number) => {
    if (disabled || matched.includes(i)) return;
    setLeftSel(i);
    if (rightSel !== null) checkMatch(i, rightSel);
  };

  const handleRight = (i: number) => {
    if (disabled || isRightMatched(i)) return;
    setRightSel(i);
    if (leftSel !== null) checkMatch(leftSel, i);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p, i) => {
            const isM = matched.includes(i); const isSel = leftSel === i; const isW = wrong?.l === i;
            return (
              <motion.button key={i} onClick={() => handleLeft(i)}
                animate={isW ? { x:[-5,5,-5,5,0] } : {}} transition={{ duration:0.3 }}
                className={`w-full p-3 rounded-xl border-2 text-sm font-semibold text-center transition-all ${isM ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default' : isW ? 'border-red-400 bg-red-50 text-red-600' : isSel ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700' : 'border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}>
                {isM && <CheckCircle className="w-3.5 h-3.5 inline mr-1 text-green-500" />}{p.left}
              </motion.button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffled.current.map((p, i) => {
            const isM = isRightMatched(i); const isSel = rightSel === i; const isW = wrong?.r === i;
            return (
              <motion.button key={i} onClick={() => handleRight(i)}
                animate={isW ? { x:[-5,5,-5,5,0] } : {}} transition={{ duration:0.3 }}
                className={`w-full p-3 rounded-xl border-2 text-sm font-semibold text-center transition-all ${isM ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default' : isW ? 'border-red-400 bg-red-50 text-red-600' : isSel ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700' : 'border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}>
                {p.right}
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 pt-1">
        {matched.length}/{pairs.length} çifte • {' '}
        <span className="flex justify-center gap-1 inline-flex mt-1">
          {pairs.map((_,i) => <div key={i} className={`w-2 h-2 rounded-full inline-block ${matched.includes(i) ? 'bg-green-400' : 'bg-gray-200 dark:bg-dark-100'}`} />)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, updateUser, user, isDark } = useAuthStore();

  const [lesson, setLesson] = useState<any>(null);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [phase, setPhase] = useState<Phase>('vocabulary');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabFlipped, setVocabFlipped] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string|null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const xpEarnedRef = useRef(0); // ref to avoid stale closure in completeLesson
  const [hearts, setHearts] = useState(5);
  const [mistakeWords, setMistakeWords] = useState<string[]>([]);
  const mistakeWordsRef = React.useRef<string[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentXPAmount, setCurrentXPAmount] = useState(20);
  const [awardedXP, setAwardedXP] = useState(0);
  const [comboCount, setComboCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    // Load combo count for this session
    const saved = parseInt(sessionStorage.getItem('lingoalb_combo') || '0');
    setComboCount(saved);
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      // Use prefetched data if available (from previous lesson's background fetch)
      const cacheKey = `lesson_prefetch_${id}`;
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
      let data: any;
      if (cached) {
        data = JSON.parse(cached);
        sessionStorage.removeItem(cacheKey);
      } else {
        const res = await lessonsAPI.getById(id as string);
        data = res.data;
      }

      const vocab = data.vocabulary || [];
      const rawEx = data.exercises || [];
      setLesson(data.lesson);
      setVocabulary(vocab);
      setExercises(buildExercises(rawEx, vocab));

      // Find next lesson and prefetch it in the background
      try {
        const levelLessons = data.lesson?.level?._id
          ? await levelsAPI.getLessons(data.lesson.level._id)
          : null;
        if (levelLessons) {
          const lessons = levelLessons.data.lessons || [];
          const currentOrder = data.lesson?.order || 0;
          const next = lessons.find((l: any) => l.order > currentOrder);
          if (next) {
            setNextLessonId(next._id);
            // Fire-and-forget prefetch so navigating to next lesson is instant
            const prefetchKey = `lesson_prefetch_${next._id}`;
            if (!sessionStorage.getItem(prefetchKey)) {
              lessonsAPI.getById(next._id).then(r => {
                sessionStorage.setItem(prefetchKey, JSON.stringify(r.data));
              }).catch(() => {});
            }
          }
        }
      } catch {}
    } catch {
      toast.error('Gabim gjatë ngarkimit të mësimit.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveFavorite = (vocabItem: any) => {
    try {
      const stored = JSON.parse(localStorage.getItem(`lingoalb_favorites_${user?.id || (user as any)?._id}`) || '[]');
      const alreadySaved = stored.some((f: any) => f.id === vocabItem._id);
      if (alreadySaved) {
        toast('Tashmë e keni ruajtur!', { icon: '💛' });
        return;
      }
      const newFav = {
        id: vocabItem._id,
        albanianWord: vocabItem.albanianWord,
        targetWord: vocabItem.targetWord,
        pronunciation: vocabItem.pronunciation,
        exampleAlb: vocabItem.exampleAlb,
        exampleTarget: vocabItem.exampleTarget,
        languageName: 'Anglisht',
        languageFlag: '🇬🇧',
        addedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        `lingoalb_favorites_${user?.id || (user as any)?._id}`,
        JSON.stringify([...stored, newFav])
      );
      setSavedWords(s => [...s, vocabItem._id]);
      toast.success(`💛 "${vocabItem.albanianWord}" u ruajt te Favoritet!`, { duration: 2000 });
    } catch {
      toast.error('Nuk u ruajt. Provoni përsëri.');
    }
  };

  const buildExercises = (raw: any[], vocab: any[]) => {
    const result = [...raw];
    // Add a matching exercise after the 2nd exercise if we have vocab
    if (vocab.length >= 3) {
      const matchEx = {
        _id: 'matching_auto',
        type: 'matching',
        question: 'Lidh fjalën shqipe me përkthimin e saj anglisht:',
        matchingPairs: vocab.slice(0, Math.min(5, vocab.length)).map(v => ({ left: v.albanianWord, right: v.targetWord })),
        correctAnswer: '__matching__',
        explanationAlb: 'Të lidhësh çiftet ndihmon memorien tuaj!',
        xpReward: 40,
      };
      result.splice(Math.min(2, result.length), 0, matchEx);
    }
    // Add pronunciation exercises for 2 vocab words
    const candidates = [...vocab].sort(() => Math.random()-0.5).slice(0, 2);
    candidates.forEach((v, i) => {
      const pronEx = {
        _id: `pron_${v._id}_${i}`,
        type: 'pronunciation',
        question: 'Shqiptoni fjalën angleze:',
        pronunciationWord: v.targetWord,
        correctAnswer: v.targetWord,
        explanationAlb: `"${v.albanianWord}" = "${v.targetWord}". Vazhdoni të praktikoni shqiptimin!`,
        xpReward: 30,
      };
      result.splice(Math.min(i * 3 + 1, result.length), 0, pronEx);
    });
    return result;
  };

  const langCode = (lesson?.level as any)?.language?.code || 'en';
  const speechLang = ({ en: 'en-US', de: 'de-DE', fr: 'fr-FR', it: 'it-IT', es: 'es-ES', tr: 'tr-TR' } as Record<string, string>)[langCode] ?? 'en-US';

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = speechLang; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const triggerXP = (amount: number) => {
    setCurrentXPAmount(amount);
    xpEarnedRef.current = xpEarnedRef.current + amount;
    setShowXP(true);
    setTimeout(() => setShowXP(false), 1300);
  };

  const handleNextVocab = () => {
    setVocabFlipped(false);
    if (vocabIndex < vocabulary.length - 1) setVocabIndex(v => v + 1);
    else setPhase('exercises');
  };

  const handleSubmitAnswer = () => {
    const ex = exercises[exerciseIndex];
    const ans = (ex.type === 'fill_blank' || ex.type === 'translation') ? fillAnswer.trim() : selectedAnswer;
    if (!ans) { toast.error('Zgjidhni ose shkruani përgjigjen!'); return; }
    const correct = isAnswerCorrect(ans, ex.correctAnswer);
    setIsCorrect(correct); setShowResult(true);
    if (correct) { setScore(s => s+1); triggerXP(ex.xpReward || 20); }
    else {
      setHearts(h => Math.max(0, h-1));
      // Track which word/question the user got wrong
      const wrongWord = ex.pronunciationWord || ex.correctAnswer || '';
      if (wrongWord && !mistakeWordsRef.current.includes(wrongWord)) {
        mistakeWordsRef.current = [...mistakeWordsRef.current, wrongWord];
        setMistakeWords([...mistakeWordsRef.current]);
      }
    }
  };

  const handlePronunciationResult = (correct: boolean) => {
    const ex = exercises[exerciseIndex];
    setIsCorrect(correct); setShowResult(true);
    if (correct) { setScore(s => s+1); triggerXP(ex.xpReward || 30); }
  };

  const handleListeningResult = (correct: boolean) => {
    const ex = exercises[exerciseIndex];
    setIsCorrect(correct); setShowResult(true);
    if (correct) { setScore(s => s+1); triggerXP(ex.xpReward || 25); }
    else {
      setHearts(h => Math.max(0, h-1));
      const wrongWord = ex.listeningWord || ex.correctAnswer || '';
      if (wrongWord && !mistakeWordsRef.current.includes(wrongWord)) {
        mistakeWordsRef.current = [...mistakeWordsRef.current, wrongWord];
        setMistakeWords([...mistakeWordsRef.current]);
      }
    }
  };

  const handleMatchingComplete = () => {
    const ex = exercises[exerciseIndex];
    setIsCorrect(true); setShowResult(true);
    setScore(s => s+1); triggerXP(ex.xpReward || 40);
  };

  const handleNextExercise = () => {
    setShowResult(false); setSelectedAnswer(null); setFillAnswer('');
    if (exerciseIndex < exercises.length - 1) setExerciseIndex(i => i+1);
    else completeLesson();
  };

  const completeLesson = async () => {
    const finalScore = exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 100;
    // Combo: if this is the 3rd+ lesson in the session, apply 1.5x multiplier
    const isCombo = comboCount >= 2;
    const baseXP = xpEarnedRef.current + (lesson?.xpReward || 50);
    const totalXP = isCombo ? Math.round(baseXP * 1.5) : baseXP;
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
    try {
      const res = await progressAPI.complete({
        lessonId: id as string,
        score: finalScore,
        xpEarned: totalXP,
        mistakeWords: mistakeWordsRef.current,
        combo: isCombo,
      });
      const xpAwarded = res.data.xpAwarded ?? totalXP;
      const isFirst = res.data.isFirstTime ?? true;
      const newAchievements: string[] = res.data.newAchievements || [];

      // Increment session combo counter
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      sessionStorage.setItem('lingoalb_combo', String(newCombo));

      // Use the exact XP/streak/achievements returned by server — no guessing
      setAwardedXP(xpAwarded);
      if (res.data.user) {
        updateUser({
          xp: res.data.user.xp,
          streak: res.data.user.streak,
        });
      } else {
        // Fallback: add locally
        updateUser({ xp: (user?.xp || 0) + xpAwarded });
      }

      // Show badge notifications for newly earned badges
      const badgeNames: Record<string, string> = {
        fillestar: '🌱 Fillestar i Guximshëm',
        nxenes_i_zjarrit: '🔥 Nxënësi i Zjarrtë',
        besa_3: '🤝 Besa e Parë',
        besa_7: '🦅 Shqiponja e Javës',
        mjeshtri: '⚡ Mjeshtra i Fjalëve',
        besa_30: '👑 Besëlidhja e Madhe',
        kampioni: '🏆 Kampioni i LingoAlb',
        besa_100: '🌟 Legjendar',
      };
      newAchievements.forEach(badge => {
        if (badgeNames[badge]) {
          setTimeout(() => {
            toast.success('Badge i ri: ' + badgeNames[badge] + '!', { duration: 5000 });
          }, 1500);
        }
      });

      if (isCombo && isFirst) {
        toast.success(`🔥 Combo x1.5! +${xpAwarded} XP`, { duration: 3000 });
      } else if (!isFirst) {
        if (xpAwarded > 0) {
          toast('🔄 Rishikim! +' + xpAwarded + ' XP bonus.', { duration: 4000, icon: '📚' });
        } else {
          toast('📚 Rishikim i kryer! Keni marrë bonusin e sotëm për këtë mësim.', { duration: 4000 });
        }
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'gabim rrjeti';
      console.error('❌ Failed to save progress:', detail, err);
      toast.error(`XP nuk u ruajt: ${detail}`, { duration: 6000 });
      setAwardedXP(totalXP);
      updateUser({ xp: (user?.xp || 0) + totalXP });
    }
    setPhase('complete');
  };

  const resetLesson = () => {
    xpEarnedRef.current = 0;
    mistakeWordsRef.current = [];
    setMistakeWords([]);
    setAwardedXP(0);
    setPhase('vocabulary'); setVocabIndex(0); setVocabFlipped(false);
    setExerciseIndex(0); setScore(0); setHearts(5);
    setSelectedAnswer(null); setFillAnswer(''); setShowResult(false);
    loadLesson();
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Duke ngarkuar mësimin...</p>
      </div>
    </div>
  );

  const totalSteps = vocabulary.length + exercises.length;
  const currentStep = phase === 'vocabulary' ? vocabIndex : vocabulary.length + exerciseIndex;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const currentExercise = exercises[exerciseIndex];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <Confetti active={showConfetti} />
      <XPPopup xp={currentXPAmount} show={showXP} />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-dark-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/learn/${lesson?.level?.language?._id || lesson?.language}`}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex-1 h-3 bg-gray-100 dark:bg-dark-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
              initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:0.5 }} />
          </div>
          {comboCount >= 1 && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
              comboCount >= 2
                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-dark-100 text-gray-500 dark:text-gray-400'
            }`}>
              🔥{comboCount >= 2 ? ' x1.5' : ` ${comboCount + 1}/3`}
            </div>
          )}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {Array.from({ length:5 }).map((_,i) => (
              <Heart key={i} className={`w-5 h-5 transition-all ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-200 dark:text-dark-100'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400 flex-shrink-0">
            {Math.min(currentStep+1, totalSteps)}/{totalSteps}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ═══ VOCABULARY PHASE ═══ */}
          {phase === 'vocabulary' && vocabulary[vocabIndex] && (
            <motion.div key={`vocab-${vocabIndex}`}
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.25 }}
            >
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full">
                  <BookOpen className="w-4 h-4" /> Fjalor • {vocabIndex+1}/{vocabulary.length}
                </span>
              </div>

              {/* Flip Card */}
              <div className="relative mb-6 cursor-pointer" style={{ perspective:1000 }}
                onClick={() => setVocabFlipped(f => !f)}>
                <motion.div style={{ transformStyle:'preserve-3d', position:'relative' }}
                  animate={{ rotateY: vocabFlipped ? 180 : 0 }} transition={{ duration:0.5, ease:'easeInOut' }}>

                  {/* Front */}
                  <div className="card text-center py-12" style={{ backfaceVisibility:'hidden' }}>
                    <div className="text-6xl mb-4">📖</div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Shqip</div>
                    <div className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-3">
                      {vocabulary[vocabIndex].albanianWord}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center justify-center gap-1.5 mt-4">
                      <Shuffle className="w-3.5 h-3.5" /> Klikoni kartën për të parë përkthimin
                    </div>
                  </div>

                  {/* Back */}
                  <div className="card text-center py-12 absolute inset-0"
                    style={{ backfaceVisibility:'hidden', transform:'rotateY(180deg)' }}>
                    <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Anglisht</div>
                    <div className="font-display text-4xl font-bold text-primary-700 dark:text-primary-300 mb-1">
                      {vocabulary[vocabIndex].targetWord}
                    </div>
                    {vocabulary[vocabIndex].pronunciation && (
                      <div className="text-xl text-gray-400 font-mono mb-3">/{vocabulary[vocabIndex].pronunciation}/</div>
                    )}
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={e => { e.stopPropagation(); speak(vocabulary[vocabIndex].targetWord); }}
                        className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors">
                        <Volume2 className="w-4 h-4" /> Dëgjo
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); saveFavorite(vocabulary[vocabIndex]); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${savedWords.includes(vocabulary[vocabIndex]._id) ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-white/20 text-white/70 hover:bg-rose-100 hover:text-rose-500 dark:hover:bg-rose-900/30'}`}
                      >
                        <Heart className={`w-4 h-4 transition-all ${savedWords.includes(vocabulary[vocabIndex]._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        {savedWords.includes(vocabulary[vocabIndex]._id) ? '♥ Ruajtur' : '♡ Ruaj'}
                      </button>
                    </div>
                    {(vocabulary[vocabIndex].exampleAlb || vocabulary[vocabIndex].exampleTarget) && (
                      <div className="mx-auto max-w-xs bg-gray-50 dark:bg-dark-100 rounded-xl p-3 text-left space-y-1 mt-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shembull</div>
                        {vocabulary[vocabIndex].exampleAlb && <div className="text-sm text-gray-600 dark:text-gray-300">🇦🇱 {vocabulary[vocabIndex].exampleAlb}</div>}
                        {vocabulary[vocabIndex].exampleTarget && <div className="text-sm text-gray-600 dark:text-gray-300">🇬🇧 {vocabulary[vocabIndex].exampleTarget}</div>}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              <button onClick={handleNextVocab} className="btn-primary w-full justify-center py-4 text-base">
                {vocabIndex < vocabulary.length - 1
                  ? <><ChevronRight className="w-5 h-5" /> Fjalë tjetër</>
                  : <><Zap className="w-5 h-5" /> Fillo ushtrimet!</>}
              </button>
            </motion.div>
          )}

          {/* ═══ EXERCISES PHASE ═══ */}
          {phase === 'exercises' && currentExercise && (
            <motion.div key={`ex-${exerciseIndex}`}
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.25 }}
            >
              {/* Badge */}
              <div className="text-center mb-5">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full ${
                  currentExercise.type === 'pronunciation' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                  : currentExercise.type === 'matching' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                  : currentExercise.type === 'listening_challenge' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                }`}>
                  {currentExercise.type === 'pronunciation' && <><Mic className="w-4 h-4" /> Shqiptim • Ushtrim {exerciseIndex+1}/{exercises.length}</>}
                  {currentExercise.type === 'matching' && <><Shuffle className="w-4 h-4" /> Lidh çiftet • Ushtrim {exerciseIndex+1}/{exercises.length}</>}
                  {currentExercise.type === 'listening_challenge' && <><Volume2 className="w-4 h-4" /> Dëgjim • Ushtrim {exerciseIndex+1}/{exercises.length}</>}
                  {currentExercise.type === 'multiple_choice' && <><Star className="w-4 h-4" /> Zgjidhni • Ushtrim {exerciseIndex+1}/{exercises.length}</>}
                  {currentExercise.type === 'fill_blank' && <><Zap className="w-4 h-4" /> Plotëso • Ushtrim {exerciseIndex+1}/{exercises.length}</>}
                  {currentExercise.type === 'translation' && <><BookOpen className="w-4 h-4" /> Përkthe • Ushtrim {exerciseIndex+1}/{exercises.length}</>}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white text-center mb-5">
                {currentExercise.question}
              </h2>

              <div className="card mb-4">
                {/* Multiple choice */}
                {currentExercise.type === 'multiple_choice' && (
                  <div className="grid grid-cols-2 gap-3">
                    {currentExercise.options?.map((opt: string) => {
                      const isSel = selectedAnswer === opt;
                      const isRight = showResult && opt === currentExercise.correctAnswer;
                      const isWrong = showResult && isSel && !isCorrect;
                      return (
                        <motion.button key={opt} whileTap={!showResult ? { scale:0.96 } : {}}
                          onClick={() => !showResult && setSelectedAnswer(opt)} disabled={showResult}
                          className={`p-4 rounded-xl border-2 text-left font-medium text-sm transition-all ${
                            isRight ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : isWrong ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
                            : isSel ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'border-gray-100 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                          }`}>
                          {isRight && <CheckCircle className="w-4 h-4 inline mr-1.5 text-green-500" />}
                          {isWrong && <XCircle className="w-4 h-4 inline mr-1.5 text-red-500" />}
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Fill blank */}
                {currentExercise.type === 'fill_blank' && (
                  <div className="space-y-3">
                    <input type="text" autoFocus
                      className={`input text-center text-lg font-semibold ${showResult ? isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}`}
                      placeholder="Shkruani përgjigjen..." value={fillAnswer}
                      onChange={e => !showResult && setFillAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !showResult && handleSubmitAnswer()}
                      disabled={showResult} />
                    {showResult && !isCorrect && (
                      <p className="text-center text-green-600 font-semibold text-sm">
                        ✓ Përgjigja: <strong>{currentExercise.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Translation */}
                {currentExercise.type === 'translation' && (
                  <div className="space-y-3">
                    <textarea autoFocus
                      className={`input text-lg font-semibold min-h-[110px] resize-none ${showResult ? isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}`}
                      placeholder="Shkruani përkthimin..." value={fillAnswer}
                      onChange={e => !showResult && setFillAnswer(e.target.value)}
                      disabled={showResult} />
                    {showResult && !isCorrect && (
                      <p className="text-center text-green-600 font-semibold text-sm">
                        ✓ Përgjigja: <strong>{currentExercise.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Pronunciation */}
                {currentExercise.type === 'pronunciation' && (
                  <PronunciationExercise
                    word={currentExercise.pronunciationWord || currentExercise.correctAnswer}
                    lang={speechLang}
                    onResult={handlePronunciationResult}
                    disabled={showResult}
                  />
                )}

                {/* Matching */}
                {currentExercise.type === 'matching' && (
                  <MatchingExercise
                    pairs={currentExercise.matchingPairs || vocabulary.slice(0,5).map((v:any) => ({ left:v.albanianWord, right:v.targetWord }))}
                    onComplete={handleMatchingComplete}
                    disabled={showResult}
                  />
                )}

                {/* Listening Challenge */}
                {currentExercise.type === 'listening_challenge' && (
                  <ListeningChallengeExercise
                    word={currentExercise.listeningWord || currentExercise.correctAnswer}
                    lang={currentExercise.listeningLang || 'de-DE'}
                    options={currentExercise.options || []}
                    correctAnswer={currentExercise.correctAnswer}
                    onResult={handleListeningResult}
                    disabled={showResult}
                  />
                )}
              </div>

              {/* Result */}
              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    className={`rounded-2xl p-4 mb-4 border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                    <div className={`font-bold mb-1 flex items-center gap-2 ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isCorrect ? <><CheckCircle className="w-5 h-5" /> Saktë! +{currentExercise.xpReward || 20} XP 🎉</> : <><XCircle className="w-5 h-5" /> Gabim! -1 ❤️</>}
                    </div>
                    {currentExercise.explanationAlb && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{currentExercise.explanationAlb}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit / Next */}
              {(currentExercise.type === 'matching' || currentExercise.type === 'pronunciation' || currentExercise.type === 'listening_challenge') ? (
                showResult && (
                  <motion.button initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    onClick={handleNextExercise} className="btn-primary w-full justify-center py-4 text-base">
                    {exerciseIndex < exercises.length - 1
                      ? <><ArrowRight className="w-5 h-5" /> Ushtrimi tjetër</>
                      : <><Trophy className="w-5 h-5" /> Mbaro mësimin!</>}
                  </motion.button>
                )
              ) : !showResult ? (
                <button onClick={handleSubmitAnswer} className="btn-primary w-full justify-center py-4 text-base">
                  Kontrollo përgjigjen
                </button>
              ) : (
                <button onClick={handleNextExercise} className="btn-primary w-full justify-center py-4 text-base">
                  {exerciseIndex < exercises.length - 1
                    ? <><ArrowRight className="w-5 h-5" /> Ushtrimi tjetër</>
                    : <><Trophy className="w-5 h-5" /> Mbaro mësimin!</>}
                </button>
              )}
            </motion.div>
          )}

          {/* ═══ COMPLETE PHASE ═══ */}
          {phase === 'complete' && (
            <motion.div key="complete"
              initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              transition={{ type:'spring', stiffness:300, damping:25 }} className="text-center">
              <motion.div animate={{ rotate:[0,-10,10,-10,10,0], scale:[1,1.2,1] }}
                transition={{ duration:1, delay:0.2 }} className="text-8xl mb-6 inline-block">🎉</motion.div>
              <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-2">Mësimi u Krye!</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Shkëlqyeshëm! Vazhdo kështu!</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Star, label:'Saktësi', value:`${exercises.length > 0 ? Math.round((score/exercises.length)*100) : 100}%`, color:'text-yellow-500', bg:'bg-yellow-50 dark:bg-yellow-900/20' },
                  { icon: Zap, label:'XP Fituar', value:`+${awardedXP}`, color:'text-primary-600', bg:'bg-primary-50 dark:bg-primary-900/20' },
                  { icon: BookOpen, label:'Fjalë', value:vocabulary.length, color:'text-blue-500', bg:'bg-blue-50 dark:bg-blue-900/20' },
                ].map((s,i) => (
                  <motion.div key={s.label}
                    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.1 }}
                    className={`card text-center ${s.bg}`}>
                    <s.icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
                    <div className="font-display font-bold text-2xl text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Vocabulary recap */}
              {vocabulary.length > 0 && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                  className="card mb-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <BookOpen className="w-4 h-4 text-primary-500" /> Fjalori i mësimit
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {vocabulary.slice(0, 8).map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-dark-100 rounded-lg px-3 py-2 min-w-0">
                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{v.albanianWord}</span>
                        <span className="text-gray-300 dark:text-gray-600 flex-shrink-0">→</span>
                        <span className="text-primary-600 dark:text-primary-400 font-semibold truncate">{v.targetWord}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="card mb-6 flex items-center justify-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Zemra të mbetura:</span>
                <div className="flex gap-1">
                  {Array.from({ length:5 }).map((_,i) => (
                    <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-200 dark:text-dark-100'}`} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button onClick={resetLesson} className="btn-secondary flex-1 justify-center py-3 min-w-[120px]">
                  <RotateCcw className="w-4 h-4" /> Riprovo
                </button>
                {nextLessonId ? (
                  <Link href={`/lesson/${nextLessonId}`} className="btn-primary flex-1 justify-center py-3 min-w-[120px]">
                    <ArrowRight className="w-4 h-4" /> Mësimi tjetër
                  </Link>
                ) : (
                  <Link href={`/learn/${lesson?.level?.language?._id || lesson?.language}`} className="btn-primary flex-1 justify-center py-3 min-w-[120px]">
                    <ArrowRight className="w-4 h-4" /> Kursi
                  </Link>
                )}
              </div>
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 mt-1 rounded-xl border border-gray-200 dark:border-dark-100 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-all">
                <Home className="w-4 h-4" /> Kthehu te Paneli
              </Link>
              {mistakeWords.length > 0 && (
                <Link href="/pikat-dobeta"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-red-500 dark:text-red-400 hover:underline mt-1">
                  🎯 Keni {mistakeWords.length} fjalë të dobëta — shikojini
                </Link>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
