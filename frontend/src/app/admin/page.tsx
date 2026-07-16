'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe, BookOpen, Users, BarChart3, Plus, Edit2, Trash2,
  ArrowLeft, Languages, ChevronRight, Layers, FileText,
  CheckCircle, XCircle, Eye, Save, X, Loader2, ShieldCheck
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type AdminTab = 'stats' | 'languages' | 'levels' | 'lessons' | 'vocabulary' | 'exercises' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [stats, setStats] = useState<any>({});
  const [languages, setLanguages] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    loadStats();
    loadLanguages();
  }, []);

  useEffect(() => {
    if (tab === 'levels') loadLevels();
    if (tab === 'lessons') loadLessons();
    if (tab === 'users') loadUsers();
  }, [tab]);

  const loadStats = async () => { try { const res = await adminAPI.getStats(); setStats(res.data); } catch {} };
  const loadLanguages = async () => { try { const res = await adminAPI.getLanguages(); setLanguages(res.data.languages); } catch {} };
  const loadLevels = async () => { try { const res = await adminAPI.getLevels(); setLevels(res.data.levels); } catch {} };
  const loadLessons = async () => { try { const res = await adminAPI.getLessons(); setLessons(res.data.lessons); } catch {} };
  const loadUsers = async () => { try { const res = await adminAPI.getUsers(); setUsers(res.data.users); } catch {} };

  const loadVocab = async (lessonId: string) => { try { const res = await adminAPI.getVocabulary(lessonId); setVocabulary(res.data.vocabulary); } catch {} };
  const loadExercises = async (lessonId: string) => { try { const res = await adminAPI.getExercises(lessonId); setExercises(res.data.exercises); } catch {} };

  const openModal = (type: string, data?: any) => {
    setModal({ type, data });
    setForm(data || {});
  };
  const closeModal = () => { setModal(null); setForm({}); };

  const handleSaveLanguage = async () => {
    setLoading(true);
    try {
      if (modal?.data?._id) {
        await adminAPI.updateLanguage(modal.data._id, form);
        toast.success('Gjuha u përditësua!');
      } else {
        await adminAPI.createLanguage(form);
        toast.success('Gjuha u shtua!');
      }
      closeModal();
      loadLanguages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gabim!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (!confirm('Jeni i sigurt? Kjo do të fshijë gjithçka lidhur me këtë gjuhë!')) return;
    try { await adminAPI.deleteLanguage(id); toast.success('U fshi!'); loadLanguages(); } catch { toast.error('Gabim!'); }
  };

  const handleSaveLevel = async () => {
    setLoading(true);
    try {
      if (modal?.data?._id) {
        await adminAPI.updateLevel(modal.data._id, form);
        toast.success('Niveli u përditësua!');
      } else {
        await adminAPI.createLevel(form);
        toast.success('Niveli u shtua!');
      }
      closeModal();
      loadLevels();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gabim!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async () => {
    setLoading(true);
    try {
      if (modal?.data?._id) {
        await adminAPI.updateLesson(modal.data._id, form);
        toast.success('Mësimi u përditësua!');
      } else {
        await adminAPI.createLesson(form);
        toast.success('Mësimi u shtua!');
      }
      closeModal();
      loadLessons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gabim!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Fshi përdoruesin?')) return;
    try { await adminAPI.deleteUser(id); toast.success('Përdoruesi u fshi!'); loadUsers(); } catch { toast.error('Gabim!'); }
  };

  const navItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'stats', label: 'Statistika', icon: BarChart3 },
    { id: 'languages', label: 'Gjuhët', icon: Globe },
    { id: 'levels', label: 'Nivelet', icon: Layers },
    { id: 'lessons', label: 'Mësimet', icon: BookOpen },
    { id: 'users', label: 'Përdoruesit', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Admin sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-dark dark:bg-dark-50 border-r border-dark-50 dark:border-dark-100 z-40 hidden lg:flex flex-col">
        <div className="p-6 border-b border-dark-100">
          <div className="flex items-center gap-2 text-white mb-1">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <span className="font-display font-bold text-lg">Admin Panel</span>
          </div>
          <div className="text-xs text-gray-400">LingoAlb CMS</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark-50 hover:text-white'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-100">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-4 py-2 rounded-xl hover:bg-dark-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Kthehu te Paneli
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">

          {/* STATS TAB */}
          {tab === 'stats' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">
                📊 Statistika e Platformës
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Nxënës Total', val: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Gjuhë Aktive', val: stats.totalLanguages || 0, icon: Globe, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Mësime', val: stats.totalLessons || 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((s) => (
                  <div key={s.label} className="card flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center`}>
                      <s.icon className={`w-7 h-7 ${s.color}`} />
                    </div>
                    <div>
                      <div className="font-display font-bold text-3xl text-gray-900 dark:text-white">{s.val}</div>
                      <div className="text-sm text-gray-500">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">🚀 Aksione të Shpejta</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Shto Gjuhë', action: () => setTab('languages'), icon: Globe },
                    { label: 'Shto Nivel', action: () => setTab('levels'), icon: Layers },
                    { label: 'Shto Mësim', action: () => setTab('lessons'), icon: BookOpen },
                    { label: 'Menaxho Nxënësit', action: () => setTab('users'), icon: Users },
                  ].map((a) => (
                    <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-100 hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
                      <a.icon className="w-6 h-6" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* LANGUAGES TAB */}
          {tab === 'languages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">🌍 Menaxhimi i Gjuhëve</h1>
                <button onClick={() => openModal('language')} className="btn-primary py-2 px-4 text-sm">
                  <Plus className="w-4 h-4" />
                  Shto Gjuhë
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <div key={lang._id} className="card flex items-center gap-3">
                    <span className="text-4xl">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white">{lang.nameAlb}</div>
                      <div className="text-sm text-gray-500">{lang.name} · {lang.code}</div>
                      <div className={`badge mt-1 ${lang.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {lang.isAvailable ? '✓ Aktive' : '⏳ Shpejt'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openModal('language', lang)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteLanguage(lang._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-accent transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LEVELS TAB */}
          {tab === 'levels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">📊 Menaxhimi i Niveleve</h1>
                <button onClick={() => openModal('level')} className="btn-primary py-2 px-4 text-sm">
                  <Plus className="w-4 h-4" />
                  Shto Nivel
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Niveli</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gjuha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mësimet</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">XP</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-100">
                    {levels.map((level) => (
                      <tr key={level._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{level.icon} {level.nameAlb}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{level.language?.nameAlb || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{level.totalLessons}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{level.xpRequired}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openModal('level', level)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => { if (confirm('Fshi nivelin?')) { await adminAPI.deleteLevel(level._id); loadLevels(); toast.success('U fshi!'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-accent transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* LESSONS TAB */}
          {tab === 'lessons' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">📚 Menaxhimi i Mësimeve</h1>
                <button onClick={() => openModal('lesson')} className="btn-primary py-2 px-4 text-sm">
                  <Plus className="w-4 h-4" />
                  Shto Mësim
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mësimi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gjuha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fjalor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ushtrime</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">XP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statusi</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-100">
                    {lessons.map((lesson) => (
                      <tr key={lesson._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lesson.icon} {lesson.titleAlb}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lesson.language?.nameAlb || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lesson.vocabularyCount}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{lesson.exerciseCount}</td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">+{lesson.xpReward}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${lesson.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {lesson.isPublished ? '✓ Publik' : '⏸ Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openModal('lesson', lesson)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => { if (confirm('Fshi mësimin?')) { await adminAPI.deleteLesson(lesson._id); loadLessons(); toast.success('U fshi!'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-accent transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">👥 Menaxhimi i Nxënësve</h1>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-dark-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nxënësi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roli</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">XP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seria</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">
                              {u.name[0]}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 Nxënës'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-yellow-600 font-semibold">⚡ {u.xp}</td>
                        <td className="px-4 py-3 text-orange-600">🔥 {u.streak}</td>
                        <td className="px-4 py-3 text-right">
                          {u._id !== user?.id && (
                            <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-accent transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ============ MODALS ============ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-dark-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-100">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                {modal.data ? 'Modifiko' : 'Shto'}
                {modal.type === 'language' ? ' Gjuhë' : modal.type === 'level' ? ' Nivel' : ' Mësim'}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Language form */}
              {modal.type === 'language' && (
                <>
                  {[
                    { key: 'code', label: 'Kodi (en, fr, de)', type: 'text', placeholder: 'en' },
                    { key: 'name', label: 'Emri anglisht', type: 'text', placeholder: 'English' },
                    { key: 'nameAlb', label: 'Emri shqip', type: 'text', placeholder: 'Anglisht' },
                    { key: 'flag', label: 'Flamuri (emoji)', type: 'text', placeholder: '🇬🇧' },
                    { key: 'color', label: 'Ngjyra (hex)', type: 'text', placeholder: '#3B82F6' },
                    { key: 'description', label: 'Përshkrimi (shqip)', type: 'text', placeholder: 'Gjuha angleze...' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                      <input type={field.type} className="input" placeholder={field.placeholder} value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
                    </div>
                  ))}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isAvailable || false} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 text-primary" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Aktive</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.comingSoon !== false} onChange={(e) => setForm({ ...form, comingSoon: e.target.checked })} className="w-4 h-4 text-primary" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Duke ardhur shpejt</span>
                    </label>
                  </div>
                  <button onClick={handleSaveLanguage} disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Ruaj
                  </button>
                </>
              )}

              {/* Level form */}
              {modal.type === 'level' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gjuha</label>
                    <select className="input" value={form.language || ''} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                      <option value="">Zgjidh gjuhën...</option>
                      {languages.map((l) => <option key={l._id} value={l._id}>{l.nameAlb}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Niveli</label>
                    <select className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}>
                      <option value="">Zgjidh...</option>
                      <option value="beginner">Fillestar</option>
                      <option value="intermediate">Mesatar</option>
                      <option value="advanced">Avancuar</option>
                    </select>
                  </div>
                  {[
                    { key: 'nameAlb', label: 'Emri shqip', placeholder: 'Fillestar' },
                    { key: 'description', label: 'Përshkrimi', placeholder: 'Bazat e...' },
                    { key: 'icon', label: 'Ikona (emoji)', placeholder: '🌱' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                      <input className="input" placeholder={f.placeholder} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">XP i nevojshëm</label>
                    <input type="number" className="input" placeholder="0" value={form.xpRequired || 0} onChange={(e) => setForm({ ...form, xpRequired: parseInt(e.target.value) })} />
                  </div>
                  <button onClick={handleSaveLevel} disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Ruaj
                  </button>
                </>
              )}

              {/* Lesson form */}
              {modal.type === 'lesson' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gjuha</label>
                    <select className="input" value={form.language || ''} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                      <option value="">Zgjidh gjuhën...</option>
                      {languages.map((l) => <option key={l._id} value={l._id}>{l.nameAlb}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Niveli</label>
                    <select className="input" value={form.level || ''} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                      <option value="">Zgjidh nivelin...</option>
                      {levels.map((l) => <option key={l._id} value={l._id}>{l.nameAlb} — {l.language?.nameAlb}</option>)}
                    </select>
                  </div>
                  {[
                    { key: 'titleAlb', label: 'Titulli shqip', placeholder: 'Përshëndetje' },
                    { key: 'title', label: 'Titulli anglisht', placeholder: 'Greetings' },
                    { key: 'description', label: 'Përshkrimi', placeholder: 'Mëso si të...' },
                    { key: 'icon', label: 'Ikona', placeholder: '👋' },
                    { key: 'grammarNote', label: 'Shënim gramatikor (shqip)', placeholder: 'Në anglisht...' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                      {f.key === 'grammarNote' ? (
                        <textarea className="input min-h-[80px]" placeholder={f.placeholder} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                      ) : (
                        <input className="input" placeholder={f.placeholder} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">XP Shpërblesë</label>
                      <input type="number" className="input" value={form.xpReward || 50} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Minutat</label>
                      <input type="number" className="input" value={form.estimatedMinutes || 10} onChange={(e) => setForm({ ...form, estimatedMinutes: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPublished !== false} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 text-primary" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Publikuar</span>
                  </label>
                  <button onClick={handleSaveLesson} disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Ruaj
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
