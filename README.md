# Looking For Love

A full-stack dating web app for IT professionals: Supabase-authenticated profiles, preference-based match recommendations, a paid tier gating contact-info sharing, and a role-based admin dashboard.

> **Archived** — this repo preserves the source and project documentation. The site is no longer deployed and all data has been removed.

![CI](https://img.shields.io/badge/CI-archived-lightgrey)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20%2B%20Auth-lightblue)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://vercel.com)
[![Vitest](https://img.shields.io/badge/Vitest-Tests-green)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

## Features

**Free Members**
- Register and login via Supabase Auth
- Create and edit profile (skills, gender, contact information, partner preferences)
- Update email, password, signout, and delete account

**Paid Members**
- Access premium membership tier via subscription. Everything in free, plus:
- View match recommendations based on partner preferences
- Request and share contact info with matched users
- Rate the quality of matches when requesting contact information

**Product Manager (DEMO)**
- Dashboard with website statistics (Free and paid member counts, plus contact information exposure amount)
- Role-based dashboard for user oversight and management

## Tech Stack

<p align="left">
  <img height="35" src="https://img.shields.io/badge/Next.js-16?logo=next.js&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Supabase-DB%2BAuth?logo=supabase&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/TypeScript-%23007ACC?logo=typescript&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Tailwind-%2300C0FF?logo=tailwind&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Vitest-%23green?logo=vitest&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/shadcn--ui-%23000?logo=shadcn&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Vercel-%23000?logo=vercel&logoColor=white&style=for-the-badge"/>
</p>

## Repo Structure
```bash
├── .env.example        # Environment Variables
├── CONTRIBUTING.md     # Project Contribution Standards
├── README.md           # Project README
├── LICENSE             # Project MIT License
├── app/                # Next.js app router
├── components/         # Shared UI components
├── lib/                # Shared helpers
│   ├── context/        # React context provider
│   └── supabase/       # Shared supabase client/server helpers
│       └── migrations/ # Database Migrations
├── hooks/              # Reusable React hooks
└── tests/              # Unit tests
```

## Deployment & Configuration

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Supabase Project](https://supabase.com)

### Workflow

This repository uses **Branch Protection Rules** to ensure code quality. Direct pushes to `main` are disabled. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for the Pull Request and Review workflow.

### 1. Clone & Install

```bash
git clone https://github.com/masonlet/looking-for-love.git
cd looking-for-love
npm install
```

### 2. Environment Setup
Create `.env.local` from `.env.example` and fill in ENV keys

### 3. Database Setup
In the Supabase SQL Editor, run the migrations in order:

1. `lib/supabase/migrations/001-profiles.sql`
2. `lib/supabase/migrations/002-contact-exposures.sql`
3. `lib/supabase/migrations/003-match-feedback.sql`

Each migration creates its table, enables row-level security, defines policies, and grants the necessary privileges. Re-running a migration against an existing database will fail; if you need to start fresh, drop all three tables first.

Ensure email auth: **Authentication -> Providers -> Email**.

### 4. Run Locally

```bash
npm run dev       # http://localhost:3000
npm test          # Vitest unit tests
npm run lint      # ESLint check
npm run typecheck # TypeScript type check
npm run build     # Production Next.js build
npm start         # Serve production build at http://localhost:3000
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
