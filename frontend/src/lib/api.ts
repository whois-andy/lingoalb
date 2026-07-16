import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// How many times a 401 must happen before we log the user out
// This prevents a single bad request from killing the session
let consecutiveAuthFailures = 0;
const MAX_AUTH_FAILURES = 3;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout — prevents hanging requests
});

// ── Request interceptor: attach token ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config;
    try {
      const raw = localStorage.getItem('lingoalb-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // localStorage parse failed — just continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: smart error handling ────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Reset failure counter on any successful response
    consecutiveAuthFailures = 0;
    return response;
  },
  (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status = error.response?.status;
    const url = error.config?.url || '';

    // Only log out on 401 if:
    // 1. It happens on a protected route (not /auth/login or /auth/register)
    // 2. It has happened multiple times in a row (not a one-off glitch)
    // 3. We actually have a token stored (otherwise it's expected)
    if (status === 401) {
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

      if (!isAuthRoute) {
        consecutiveAuthFailures++;

        try {
          const raw = localStorage.getItem('lingoalb-auth');
          const hasToken = raw ? !!JSON.parse(raw)?.state?.token : false;

          if (hasToken && consecutiveAuthFailures >= MAX_AUTH_FAILURES) {
            // Real expired session — log out
            console.warn('Session expired after multiple 401s. Logging out.');
            consecutiveAuthFailures = 0;
            localStorage.removeItem('lingoalb-auth');
            window.location.href = '/auth/login';
          }
          // Otherwise: just reject the promise silently, let the caller handle it
        } catch {
          // localStorage error — don't log out
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── API helpers ───────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const languagesAPI = {
  getAll: () => api.get('/languages'),
  getById: (id: string) => api.get(`/languages/${id}`),
};

export const levelsAPI = {
  getLessons: (levelId: string) => api.get(`/levels/${levelId}/lessons`),
};

export const lessonsAPI = {
  getById: (id: string) => api.get(`/lessons/${id}`),
};

export const progressAPI = {
  complete: (data: { lessonId: string; score: number; xpEarned: number; mistakeWords?: string[]; combo?: boolean }) =>
    api.post('/progress/complete', data),
  getForLanguage: (languageId: string) =>
    api.get(`/progress/language/${languageId}`),
  getLesson: (lessonId: string) =>
    api.get(`/progress/lesson/${lessonId}`),
  getWeakPoints: () =>
    api.get('/progress/weak-points'),
};

export const usersAPI = {
  getDashboard: () => api.get('/users/dashboard'),
  enroll: (languageId: string) => api.post(`/users/enroll/${languageId}`),
  buyStreakFreeze: () => api.post('/users/streak-freeze'),
  updateAvatar: (avatar: string) => api.put('/users/avatar', { avatar }),
};

export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getLanguages: () => api.get('/admin/languages'),
  createLanguage: (data: any) => api.post('/admin/languages', data),
  updateLanguage: (id: string, data: any) => api.put(`/admin/languages/${id}`, data),
  deleteLanguage: (id: string) => api.delete(`/admin/languages/${id}`),
  getLevels: (languageId?: string) => api.get('/admin/levels', { params: { languageId } }),
  createLevel: (data: any) => api.post('/admin/levels', data),
  updateLevel: (id: string, data: any) => api.put(`/admin/levels/${id}`, data),
  deleteLevel: (id: string) => api.delete(`/admin/levels/${id}`),
  getLessons: (levelId?: string) => api.get('/admin/lessons', { params: { levelId } }),
  createLesson: (data: any) => api.post('/admin/lessons', data),
  updateLesson: (id: string, data: any) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/admin/lessons/${id}`),
  getVocabulary: (lessonId: string) => api.get(`/admin/vocabulary/${lessonId}`),
  createVocab: (data: any) => api.post('/admin/vocabulary', data),
  updateVocab: (id: string, data: any) => api.put(`/admin/vocabulary/${id}`, data),
  deleteVocab: (id: string) => api.delete(`/admin/vocabulary/${id}`),
  getExercises: (lessonId: string) => api.get(`/admin/exercises/${lessonId}`),
  createExercise: (data: any) => api.post('/admin/exercises', data),
  updateExercise: (id: string, data: any) => api.put(`/admin/exercises/${id}`, data),
  deleteExercise: (id: string) => api.delete(`/admin/exercises/${id}`),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};


export const dailyAPI = {
  getWord: () => api.get('/daily/word'),
  getAchievements: () => api.get('/daily/achievements'),
  createBattle: () => api.post('/daily/battle/create'),
  joinBattle: (id: string) => api.post(`/daily/battle/join/${id}`),
  getBattle: (id: string) => api.get(`/daily/battle/${id}`),
  submitAnswer: (id: string, data: { questionIndex: number; answer: string }) =>
    api.post(`/daily/battle/${id}/answer`, data),
};

export default api;
