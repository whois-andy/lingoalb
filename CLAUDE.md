# LingoAlb — Claude Project Context

## Project Overview
LingoAlb is a language learning platform for Albanian speakers to learn foreign languages.
Built with Next.js (frontend), Express.js (backend), MongoDB (database).

## Architecture
```
lingoalb/
├── frontend/          # Next.js 14 App Router
│   ├── src/
│   │   ├── app/       # Route pages
│   │   ├── components/ # React components
│   │   ├── lib/       # API clients, utilities
│   │   ├── hooks/     # Custom React hooks
│   │   ├── store/     # Zustand global state
│   │   └── types/     # TypeScript interfaces
├── backend/           # Express.js REST API
│   ├── src/
│   │   ├── routes/    # API route definitions
│   │   ├── controllers/ # Business logic
│   │   ├── models/    # Mongoose schemas
│   │   ├── middleware/ # Auth, error handling
│   │   └── utils/     # Helpers, seeders
│   └── config/        # DB, env config
└── shared/            # Shared types/constants
```

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (access + refresh tokens), bcrypt
- **Audio**: Web Speech API (TTS) + stored audio URLs
- **Styling**: Tailwind CSS with custom design system

## Design System
- **Primary**: #1B4FD8 (Albanian blue)
- **Accent**: #E63946 (Albanian red)
- **Success**: #2DC653
- **Font Display**: Clash Display / Syne
- **Font Body**: Plus Jakarta Sans

## Database Models
1. `User` — auth, progress, XP, streaks
2. `Language` — available target languages
3. `Level` — Beginner/Intermediate/Advanced per language
4. `Lesson` — vocabulary, grammar, exercises
5. `Vocabulary` — word pairs (Albanian → Target)
6. `Exercise` — questions, answers, explanations
7. `UserProgress` — per-lesson completion tracking
8. `Achievement` — badges earned

## API Structure
```
POST /api/auth/register
POST /api/auth/login
GET  /api/languages
GET  /api/languages/:id/levels
GET  /api/levels/:id/lessons
GET  /api/lessons/:id
POST /api/progress/complete
GET  /api/user/dashboard
GET  /api/leaderboard

# Admin routes (admin role required)
GET/POST/PUT/DELETE /api/admin/languages
GET/POST/PUT/DELETE /api/admin/levels
GET/POST/PUT/DELETE /api/admin/lessons
GET/PUT/DELETE      /api/admin/users
```

## Key Conventions
- All UI text in Albanian (sq locale)
- API errors returned as `{ message: string, code: string }`
- JWT stored in httpOnly cookies
- Admin routes protected by `requireAdmin` middleware
- XP: 10 per vocabulary, 20 per exercise, 50 per lesson completion
- Streak: Tracks daily consecutive activity

## Seeded Content
- English course with 3 levels, 5 lessons each
- Demo admin: admin@lingoalb.com / Admin123!
- Demo student: student@lingoalb.com / Student123!

## Dev Commands
```bash
# Backend
cd backend && npm install && npm run dev   # :5000

# Frontend
cd frontend && npm install && npm run dev  # :3000

# Seed database
cd backend && npm run seed
```

## Environment Variables
### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/lingoalb
JWT_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
PORT=5000
NODE_ENV=development
```
### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Scalability Notes
- Languages are fully dynamic — add new ones via admin panel
- Exercises are typed (multiple_choice, fill_blank, matching, translation)
- Audio supports both stored URLs and TTS fallback
- Role-based access control ready for `teacher` role addition
