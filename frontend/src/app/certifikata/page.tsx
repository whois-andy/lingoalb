'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Award } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI, languagesAPI } from '@/lib/api';

const SEAL = '🏆';

function drawCertificate(canvas: HTMLCanvasElement, opts: {
  name: string; language: string; flag: string; xp: number; date: string;
}) {
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width, H = canvas.height;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0F172A');
  bg.addColorStop(1, '#1E293B');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Gold border (outer)
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Gold border (inner thin)
  ctx.strokeStyle = 'rgba(245,158,11,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  // Corner decorations
  const corners = [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]];
  corners.forEach(([x, y]) => {
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Header strip
  const hg = ctx.createLinearGradient(0, 60, W, 140);
  hg.addColorStop(0, '#1B4FD8');
  hg.addColorStop(1, '#1d4ed8cc');
  ctx.fillStyle = hg;
  ctx.fillRect(40, 60, W - 80, 80);

  // LingoAlb + flag
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${opts.flag}  LingoAlb`, W / 2, 112);

  // "CERTIFIKATË"
  ctx.font = 'bold 52px serif';
  ctx.fillStyle = '#F59E0B';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFIKATË', W / 2, 210);

  // Subtitle
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('Kjo certifikatë vërteton se', W / 2, 260);

  // User name
  ctx.font = 'bold 58px serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(opts.name, W / 2, 340);

  // Underline
  const nameW = ctx.measureText(opts.name).width;
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameW / 2, 352);
  ctx.lineTo(W / 2 + nameW / 2, 352);
  ctx.stroke();

  // Body text
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('ka përfunduar me sukses kursin e', W / 2, 400);

  ctx.font = 'bold 36px serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText(opts.language, W / 2, 450);

  // XP
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText(`⚡ ${opts.xp.toLocaleString()} XP të fituar gjatë kursit`, W / 2, 495);

  // Date line
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Data e përfundimit: ${opts.date}`, W / 2, 535);

  // Seal
  ctx.font = '72px serif';
  ctx.textAlign = 'center';
  ctx.fillText(SEAL, W / 2, 620);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('VULA ZYRTARE', W / 2, 648);

  // Footer
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('LingoAlb — Mëso gjuhë të huaja përmes shqipes 🇦🇱', W / 2, H - 45);
}

export default function CertifikatePage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, isDark } = useAuthStore();
  const [enrolledLanguages, setEnrolledLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    loadData();
  }, [_hasHydrated]);

  const loadData = async () => {
    try {
      const [dashRes, langRes] = await Promise.all([
        usersAPI.getDashboard(),
        languagesAPI.getAll(),
      ]);
      const enrolled: string[] = (dashRes.data.user?.enrolledLanguages || []).map((l: any) =>
        typeof l === 'string' ? l : l._id
      );
      const allLangs: any[] = langRes.data.languages || [];
      const filtered = allLangs.filter((l: any) => enrolled.includes(l._id) || enrolled.includes(String(l._id)));
      // If none enrolled yet, show all available
      setEnrolledLanguages(filtered.length > 0 ? filtered : allLangs.filter((l: any) => l.isAvailable));
    } catch {
      setEnrolledLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCanvas = (lang: any, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !user) return;
    canvasRefs.current[lang._id] = canvas;
    drawCertificate(canvas, {
      name: user.name,
      language: lang.nameAlb,
      flag: lang.flag,
      xp: user.xp || 0,
      date: new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  };

  const downloadCert = (lang: any) => {
    const canvas = canvasRefs.current[lang._id];
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `certifikata-lingoalb-${lang.code}-${user?.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  if (!_hasHydrated) return null;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-dark ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-dark-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white">Certifikatat e Mia</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : enrolledLanguages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Asnjë kurs aktiv</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Regjistrohu në një kurs për të gjeneruar certifikatën tënde.</p>
            <Link href="/dashboard" className="btn-primary inline-flex">Shko te kurset</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {enrolledLanguages.map((lang, idx) => (
              <motion.div key={lang._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{lang.flag}</span>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white text-lg">{lang.nameAlb}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Certifikatë e gjeneruar për {user?.name}</p>
                    </div>
                  </div>
                  <button onClick={() => downloadCert(lang)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-semibold rounded-xl transition-colors text-sm">
                    <Download className="w-4 h-4" /> Shkarko PNG
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-dark-100">
                  <canvas
                    ref={(el) => renderCanvas(lang, el)}
                    width={900} height={700}
                    className="w-full h-auto block"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
