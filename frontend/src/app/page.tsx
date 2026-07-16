'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, Star, Zap, Globe, ChevronRight, ArrowRight, Play,
  CheckCircle, Users, Trophy, Flame, Moon, Sun, Menu, X,
  Languages, Brain, Headphones, Sparkles, Lock
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const languages = [
  { flag: '🇬🇧', name: 'Anglisht', code: 'English', color: '#3B82F6', available: true },
  { flag: '🇩🇪', name: 'Gjermanisht', code: 'Deutsch', color: '#EAB308', available: false },
  { flag: '🇫🇷', name: 'Frëngjisht', code: 'Français', color: '#EC4899', available: false },
  { flag: '🇪🇸', name: 'Spanjisht', code: 'Español', color: '#F97316', available: false },
  { flag: '🇮🇹', name: 'Italisht', code: 'Italiano', color: '#22C55E', available: false },
  { flag: '🇹🇷', name: 'Turqisht', code: 'Türkçe', color: '#EF4444', available: false },
];

const steps = [
  { icon: Globe, title: 'Zgjidh gjuhën', desc: 'Zgjidhni gjuhën që dëshironi të mësoni — anglisht për momentin, me shumë gjuhë në vijim.', color: '#1B4FD8' },
  { icon: BookOpen, title: 'Mëso me leksione', desc: 'Lexoni fjalor, dëgjoni shqiptimin dhe kuptoni gramatikën në shqip.', color: '#E63946' },
  { icon: Brain, title: 'Praktiko çdo ditë', desc: 'Bëni ushtrime interaktive dhe fitoni pikë XP me çdo përgjigje të saktë.', color: '#2DC653' },
  { icon: Trophy, title: 'Arrini majat', desc: 'Mbani serinë tuaj ditore dhe ngjiteni në tabelën e renditjes.', color: '#F59E0B' },
];

const stats = [
  { value: '10K+', label: 'Nxënës Aktivë', icon: Users },
  { value: '500+', label: 'Mësime', icon: BookOpen },
  { value: '98%', label: 'Kënaqësi', icon: Star },
  { value: '6+', label: 'Gjuhë së shpejti', icon: Globe },
];

const testimonials = [
  { name: 'Blerina M.', city: 'Tiranë', text: 'LingoAlb ndryshoi mënyrën time të mësuarit! Tani flas anglisht me vetëbesim.', xp: 2340, streak: 45 },
  { name: 'Genti K.', city: 'Prishtinë', text: 'Shpjegimet në shqip e bëjnë shumë të lehtë kuptimin. Fantastike!', xp: 1870, streak: 32 },
  { name: 'Arta S.', city: 'Shkodër', text: 'E përdor çdo ditë në mëngjes. Seria ime është 60 ditë! 🔥', xp: 4100, streak: 60 },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleDark, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark overflow-x-hidden">
      {/* ============ NAVBAR ============ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-dark/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-dark-50' : 'bg-transparent'}`}>
        <div className="container-main flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Languages className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-800 text-xl text-gray-900 dark:text-white">
              Lingo<span className="text-accent">Alb</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#si-funksionon" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 font-medium transition-colors">Si funksionon</a>
            <a href="#gjuhet" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 font-medium transition-colors">Gjuhët</a>
            <a href="#perfitimet" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 font-medium transition-colors">Përfitimet</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-50 transition-colors text-gray-600 dark:text-gray-300">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                Paneli Im <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden md:block text-gray-700 dark:text-gray-300 font-semibold hover:text-primary transition-colors">
                  Hyr
                </Link>
                <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">
                  Regjistrohu
                </Link>
              </>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-50 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden bg-white dark:bg-dark border-t border-gray-100 dark:border-dark-50 px-4 py-4 space-y-3">
            <a href="#si-funksionon" className="block text-gray-700 dark:text-gray-300 font-medium py-2">Si funksionon</a>
            <a href="#gjuhet" className="block text-gray-700 dark:text-gray-300 font-medium py-2">Gjuhët</a>
            <a href="#perfitimet" className="block text-gray-700 dark:text-gray-300 font-medium py-2">Përfitimet</a>
            <Link href="/auth/login" className="block text-gray-700 dark:text-gray-300 font-medium py-2">Hyr</Link>
          </motion.div>
        )}
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-hero-pattern">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary-100 to-transparent dark:from-primary-900/20 opacity-60" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-radial from-accent/10 to-transparent opacity-60" />
        </div>

        <div className="container-main relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary-100 dark:border-primary-800">
                <Sparkles className="w-4 h-4" />
                Platforma #1 Shqiptare e Gjuhëve
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Mëso gjuhë të huaja{' '}
                <span className="gradient-text">përmes shqipes</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-lg">
                LingoAlb është platforma e parë shqiptare ku mëson anglisht, gjermanisht, frëngjisht dhe shumë gjuhë të tjera — gjithçka shpjeguar në shqip.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/auth/register" className="btn-primary text-lg px-8 py-4 animate-pulse-glow">
                  <Zap className="w-5 h-5" />
                  Fillo tani — Falas
                </Link>
                <button className="btn-secondary text-lg px-8 py-4">
                  <Play className="w-5 h-5" />
                  Shiko si funksionon
                </button>
              </div>

              {/* Mini stats */}
              <div className="flex gap-8">
                {[
                  { val: '10K+', label: 'Nxënës' },
                  { val: '4.9★', label: 'Vlerësim' },
                  { val: '100%', label: 'Falas' },
                ].map((s) => (
                  <div key={s.val}>
                    <div className="font-display text-2xl font-bold text-gray-900 dark:text-white">{s.val}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero illustration - interactive demo card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              {/* Main demo card */}
              <div className="card shadow-2xl border-0 relative z-10 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🇬🇧</div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Anglisht — Fillestar</div>
                      <div className="text-xs text-gray-500">Mësimi 1: Përshëndetje</div>
                    </div>
                  </div>
                  <div className="badge bg-green-100 text-green-700">Aktiv</div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-4">
                  <div className="text-xs text-primary-600 dark:text-primary-300 font-semibold mb-1">SHQIP</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Mirëmëngjes 👋</div>
                </div>

                <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">Si thuhet në anglisht?</div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['Good night', 'Good morning', 'Good evening', 'Hello'].map((opt, i) => (
                    <button key={opt} className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${i === 1 ? 'border-success bg-green-50 dark:bg-green-900/20 text-success' : 'border-gray-100 dark:border-dark-100 text-gray-700 dark:text-gray-300 hover:border-primary hover:bg-primary-50'}`}>
                      {opt}
                      {i === 1 && <CheckCircle className="w-4 h-4 inline ml-1" />}
                    </button>
                  ))}
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm text-green-700 dark:text-green-300">
                  ✅ Saktë! +20 XP fituat. "Good morning" = Mirëmëngjes.
                </div>
              </div>

              {/* Floating badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-4 -right-4 bg-white dark:bg-dark-50 rounded-2xl shadow-lg p-3 flex items-center gap-2 border border-gray-100 dark:border-dark-100">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-xs text-gray-500">Seria</div>
                  <div className="font-bold text-gray-900 dark:text-white">7 ditë</div>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} className="absolute -bottom-4 -left-4 bg-white dark:bg-dark-50 rounded-2xl shadow-lg p-3 flex items-center gap-2 border border-gray-100 dark:border-dark-100">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="text-xs text-gray-500">XP Totale</div>
                  <div className="font-bold text-gray-900 dark:text-white">2,340 XP</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="py-12 bg-primary dark:bg-primary-800">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center text-white">
                <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <div className="font-display text-3xl font-bold">{stat.value}</div>
                <div className="text-primary-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="si-funksionon" className="section bg-gray-50 dark:bg-dark-50">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="badge bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 mb-4 mx-auto">Si Funksionon</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              4 hapa drejt <span className="gradient-text">rrjedhshmërisë</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Sistemi ynë është i dizajnuar posaçërisht për shqiptarët — me shpjegime në shqip dhe progres të matshëm.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="relative">
                <div className="card text-center group hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${step.color}15` }}>
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-dark-50 border-2 border-gray-100 dark:border-dark-100 flex items-center justify-center font-display font-bold text-gray-400 text-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-gray-300 dark:text-dark-100" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LANGUAGES ============ */}
      <section id="gjuhet" className="section">
        <div className="container-main">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="badge bg-accent/10 text-accent mb-4 mx-auto">Gjuhët Tona</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Zgjidh gjuhën tënde
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Fillo me anglishten sot. Gjuhë të tjera do të shtohen shpejt!
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {languages.map((lang, i) => (
              <motion.div key={lang.code} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                {lang.available ? (
                  <Link href="/auth/register" className="card-hover group relative block text-center py-6">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-200">{lang.flag}</div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{lang.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{lang.code}</div>
                    <div className="absolute top-2 right-2 badge bg-green-100 text-green-700 text-xs px-2 py-0.5">
                      ✓ Aktive
                    </div>
                  </Link>
                ) : (
                  <div className="card relative text-center py-6 opacity-60">
                    <div className="text-5xl mb-3 grayscale">{lang.flag}</div>
                    <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">{lang.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{lang.code}</div>
                    <div className="absolute top-2 right-2 badge bg-gray-100 dark:bg-dark-100 text-gray-500 text-xs px-2 py-0.5">
                      <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                      Shpejt
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section id="perfitimet" className="section bg-gray-50 dark:bg-dark-50">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
              <div className="badge bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-300 mb-4">Përfitimet</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Pse shqiptarët zgjedhin <span className="gradient-text">LingoAlb</span>?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '🇦🇱', title: 'Shpjegime 100% në Shqip', desc: 'Të gjitha rregullat gramatikore dhe shpjegimet janë në shqip — asnjë konfuzion.' },
                  { icon: '🎯', title: 'Mësuari i Personalizuar', desc: 'Sistemi adaptohet me ritmin tuaj të mësuarit dhe të mbush boshllëqet.' },
                  { icon: '🔊', title: 'Shqiptim Natyral', desc: 'Dëgjoni shqiptimin autentik dhe mësoni ta folni si fol mëmë.' },
                  { icon: '🏆', title: 'Sistem Motivimi', desc: 'XP, seria ditore dhe tabelat e renditjes ju mbajnë të motivuar.' },
                  { icon: '📱', title: 'Mëso Kudo', desc: 'Desktop, tablet apo telefon — LingoAlb funksionon kudo.' },
                ].map((benefit) => (
                  <div key={benefit.title} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{benefit.title}</div>
                      <div className="text-gray-600 dark:text-gray-300 text-sm mt-0.5">{benefit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={t.name} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.city}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="badge bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">⚡ {t.xp} XP</div>
                      <div className="badge bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">🔥 {t.streak} ditë</div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{t.text}"</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section bg-gradient-to-br from-primary via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-hero-pattern" />
        <div className="container-main text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-6 animate-bounce-gentle">🚀</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Gati të filloni aventurën?
            </h2>
            <p className="text-primary-200 text-xl mb-10 max-w-2xl mx-auto">
              Bashkohuni me mbi 10,000 shqiptarë që po mësojnë gjuhë të reja çdo ditë. Falas, gjithmonë.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-white text-primary font-bold px-10 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg text-lg inline-flex items-center gap-2 active:scale-95">
                <Zap className="w-5 h-5" />
                Fillo tani — Falas
              </Link>
              <Link href="/auth/login" className="border-2 border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-all text-lg inline-flex items-center gap-2">
                Kam llogari
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12 bg-dark text-gray-400">
        <div className="container-main">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Languages className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">Lingo<span className="text-accent">Alb</span></span>
            </div>
            <div className="text-sm text-center">
              © 2024 LingoAlb. Bërë me ❤️ për shqiptarët kudo në botë.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/auth/login" className="hover:text-white transition-colors">Hyr</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Regjistrohu</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
