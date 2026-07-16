'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Languages, Loader2, ArrowLeft, User, Mail, Lock, Wifi, WifiOff } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check if backend is reachable on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL.replace('/api', '')}/health`, {
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (backendStatus === 'offline') {
      toast.error('Serveri nuk është aktiv! Sigurohuni që backend-i është duke punuar në portin 5000.', { duration: 5000 });
      return;
    }

    if (!form.email || !form.password) {
      toast.error('Plotësoni email-in dhe fjalëkalimin!');
      return;
    }
    if (mode === 'register' && !form.name) {
      toast.error('Emri është i detyrueshëm!');
      return;
    }
    if (mode === 'register' && form.password.length < 6) {
      toast.error('Fjalëkalimi duhet të ketë të paktën 6 karaktere!');
      return;
    }

    setLoading(true);
    try {
      const res = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form);

      const { user, token } = res.data;

      if (!user || !token) {
        toast.error('Përgjigje e gabuar nga serveri. Kontrolloni konsolën.');
        return;
      }

      setAuth(user, token);
      toast.success(
        mode === 'login'
          ? `Mirë se erdhët, ${user.name}! 👋`
          : 'Llogaria u krijua! Mirë se erdhe! 🎉',
        { duration: 3000 }
      );

      // Small delay so toast shows before redirect
      setTimeout(() => {
        if (user.role === 'admin') router.push('/admin');
        else router.push('/dashboard');
      }, 300);

    } catch (err: any) {
      console.error('Auth error:', err);

      // Network error = backend is down
      if (!err.response) {
        setBackendStatus('offline');
        toast.error(
          '❌ Nuk mund të lidhet me serverin!\n\nSigurohuni:\n1. Backend është duke punuar (npm run dev)\n2. Porta 5000 është e lirë',
          { duration: 6000 }
        );
        return;
      }

      // Show the actual server error message
      const serverMsg = err.response?.data?.message;
      const status = err.response?.status;

      if (status === 401) {
        toast.error('Email ose fjalëkalim i gabuar. Provoni: Student123! ose Admin123!');
      } else if (status === 400) {
        toast.error(serverMsg || 'Të dhënat janë të pavlefshme.');
      } else if (status === 429) {
        toast.error('Shumë përpjekje. Prisni 15 minuta ose rindizni serverin.');
      } else if (status >= 500) {
        toast.error(`Gabim serveri (${status}): ${serverMsg || 'Kontrolloni terminalin e backend-it.'}`);
      } else {
        toast.error(serverMsg || 'Ndodhi një gabim i panjohur.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setForm({ name: '', email: 'student@lingoalb.com', password: 'Student123!' });
    } else {
      setForm({ name: '', email: 'admin@lingoalb.com', password: 'Admin123!' });
    }
    toast.success('Të dhënat u plotësuan! Shtypni "Hyr në llogari".', { duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent/5 dark:from-dark dark:via-dark dark:to-primary-900/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-700 transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Kthehu në kryefaqe
        </Link>

        {/* Backend status banner */}
        {backendStatus !== 'checking' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 rounded-xl p-3 mb-4 text-sm ${
              backendStatus === 'online'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
            {backendStatus === 'online'
              ? <Wifi className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <div>
              {backendStatus === 'online' ? (
                <span className="font-medium">Serveri është aktiv ✓</span>
              ) : (
                <div>
                  <span className="font-bold block">Serveri nuk është aktiv! ⚠️</span>
                  <span className="text-xs mt-1 block">
                    Hapni një terminal të ri dhe ekzekutoni:<br />
                    <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded font-mono">cd lingoalb\backend</code> →{' '}
                    <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded font-mono">npm run dev</code>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card shadow-2xl border-0 bg-white/90 dark:bg-dark-50/90 backdrop-blur-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-700 to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Mirë se u kthyet!' : 'Bashkohuni me LingoAlb'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {mode === 'login' ? 'Hyni në llogarinë tuaj' : 'Krijoni llogarinë tuaj falas sot'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Emri i plotë</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Arben Kelmendi"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="ju@shembull.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fjalëkalimi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || backendStatus === 'offline'}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Duke u procesuar...</>
                : backendStatus === 'offline'
                  ? <><WifiOff className="w-5 h-5" /> Serveri nuk është aktiv</>
                  : mode === 'login' ? '🚀 Hyr në llogari' : '✨ Krijo llogarinë'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-100" />
            <span className="text-xs text-gray-400">ose provoni demo</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-100" />
          </div>

          {/* Demo accounts */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3">🧪 Llogaritë Demo — klikoni për plotësim automatik:</p>
            <button type="button" onClick={() => fillDemo('student')}
              className="w-full text-left text-xs bg-white dark:bg-dark-50 rounded-xl px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800 font-medium">
              👤 Nxënës → student@lingoalb.com / <span className="font-mono">Student123!</span>
            </button>
            <button type="button" onClick={() => fillDemo('admin')}
              className="w-full text-left text-xs bg-white dark:bg-dark-50 rounded-xl px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800 font-medium">
              👑 Admin → admin@lingoalb.com / <span className="font-mono">Admin123!</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            {mode === 'login' ? 'Nuk keni llogari?' : 'Keni llogari?'}{' '}
            <Link href={mode === 'login' ? '/auth/register' : '/auth/login'}
              className="text-primary-700 dark:text-primary-300 font-semibold hover:underline">
              {mode === 'login' ? 'Regjistrohu falas' : 'Hyr tani'}
            </Link>
          </p>
        </motion.div>

        {/* Troubleshooting tip */}
        {backendStatus === 'offline' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
            <p className="font-bold mb-2">🔧 Si ta rindizni serverin:</p>
            <ol className="space-y-1 text-xs list-decimal list-inside">
              <li>Hapni Command Prompt (cmd)</li>
              <li>Shkruani: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">cd C:\Projects\lingoalb\backend</code></li>
              <li>Shkruani: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">npm run dev</code></li>
              <li>Prisni mesazhin: <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">🚀 running on port 5000</code></li>
              <li>Kthehuni këtu dhe provoni sërish</li>
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
}
