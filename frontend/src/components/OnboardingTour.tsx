'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, BookOpen, Zap, Flame, Swords, Play } from 'lucide-react';

const STEPS = [
  {
    icon: '🇦🇱',
    emoji: true,
    title: 'Mirë se erdhe te LingoAlb!',
    body: 'Platforma e parë shqiptare për mësimin e gjuhëve të huaja. Mëso anglisht, gjermanisht dhe shumë gjuhë të tjera — me shqipen si bazë.',
    color: 'from-primary-700 to-primary-900',
  },
  {
    icon: BookOpen,
    title: 'Kartat e Fjalorëve',
    body: 'Çdo mësim fillon me karta interaktive. Kliko kartën për ta kthyer dhe shfaq përkthimin. Dëgo shqiptimin dhe ruaj fjalët e preferuara!',
    color: 'from-blue-600 to-blue-800',
    demo: (
      <div className="mt-3 flex gap-2 justify-center">
        <div className="w-16 h-20 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-lg cursor-pointer">📖</div>
        <div className="w-16 h-20 rounded-xl bg-white/20 flex items-center justify-center text-2xl shadow-lg rotate-6">🔄</div>
      </div>
    ),
  },
  {
    icon: Zap,
    title: 'Ushtrimet & XP',
    body: 'Pas fjalëve vijnë ushtrimet. Zgjidhni përgjigjen e saktë, plotëso boshllëqet ose dëgo dhe identifiko fjalën. Çdo përgjigje e saktë të jep XP!',
    color: 'from-yellow-500 to-orange-600',
    demo: (
      <div className="mt-3 flex gap-2 justify-center">
        <div className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-bold">+20 XP ⚡</div>
        <div className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-bold">+15 XP ⚡</div>
      </div>
    ),
  },
  {
    icon: Flame,
    title: 'Seria Ditore 🔥',
    body: 'Mëso çdo ditë për të ndërtuar serinë tënde! Nëse humb një ditë, mund të blesh një "Ruajtje Serie" me XP-të e fituara për ta mbrojtur.',
    color: 'from-orange-500 to-red-600',
    demo: (
      <div className="mt-3 flex gap-1 justify-center">
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${i <= 5 ? 'bg-orange-400' : 'bg-white/20'}`}>
            {i <= 5 ? '🔥' : '·'}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Swords,
    title: 'Sfida me Shokë ⚔️',
    body: 'Gati për kompeticion? Provoko shokët me Sfida Live dhe fito +100 XP nëse fiton! Kalo në "Sfida me Shok" nga menuja kryesore.',
    color: 'from-purple-600 to-indigo-700',
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('lingoalb_onboarded')) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const finish = () => {
    localStorage.setItem('lingoalb_onboarded', '1');
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${current.color}`}
          >
            <button onClick={finish}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10">
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="p-8 pt-10 text-center text-white">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5 text-4xl shadow-lg">
                {current.emoji
                  ? current.icon as string
                  : <current.icon className="w-10 h-10" />}
              </div>

              <h2 className="font-display font-bold text-2xl mb-3 leading-tight">{current.title}</h2>
              <p className="text-white/80 text-sm leading-relaxed">{current.body}</p>
              {(current as any).demo}
            </div>

            <div className="px-8 pb-8 flex flex-col gap-4">
              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {STEPS.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
                ))}
              </div>

              <button onClick={next}
                className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors text-base">
                {step < STEPS.length - 1
                  ? <><ChevronRight className="w-5 h-5" /> Vazhdo</>
                  : <><Play className="w-5 h-5" /> Fillo mësimin!</>}
              </button>

              {step < STEPS.length - 1 && (
                <button onClick={finish} className="text-white/50 text-sm hover:text-white/80 transition-colors">
                  Kapërceje udhëzuesin
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
