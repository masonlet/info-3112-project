# INFO 3112 Group Project - LookingForLove

[![CI](https://github.com/masonlet/info-3112-project/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/masonlet/info-3112-project/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20%2B%20Auth-lightblue)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://vercel.com)
[![Vitest](https://img.shields.io/badge/Vitest-Tests-green)](https://vitest.dev)

## Project Overview

This repository contains all INFO-3112 group project code, documentation, and planning materials for LookingForLove.
Our group will be developing an IT dating website over 8 weeks using Scrum.
  
### LookingForLove Coders

| Name                    | Role      |
| ----------------------- | --------- |
| Mason L'Etoile          | Developer |
| Joseph Jaikaran         | Developer |
| Unish Pandey            | Developer |
| Ahmed Elmardi O Ibrahim | Developer |
| Kyan Oberas             | Developer |

### Website

- [info-3112-project](https://info-3112-project.vercel.app)

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
  <img height="35" src="https://img.shields.io/badge/Next.js-15?logo=next.js&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Supabase-DB%2BAuth?logo=supabase&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/TypeScript-%23007ACC?logo=typescript&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Tailwind-%2300C0FF?logo=tailwind&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Vitest-%23green?logo=vitest&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/shadcn--ui-%23000?logo=shadcn&logoColor=white&style=for-the-badge"/>
  <img height="35" src="https://img.shields.io/badge/Vercel-%23000?logo=vercel&logoColor=white&style=for-the-badge"/>
</p>

## Timeline & Evaluation Breakdown

| Week(s)    | Deliverable               | Weight |
| ---------- | ------------------------- | ------ |
| Week 6     | Project Kickoff           | N/A    |
| Week 7     | Project Planning          | N/A    |
| Week 8-9   | Sprint 1 - Sprint Plan    | 5%     |
| Week 8-9   | Sprint 1 - Retrospective  | 5%     |
| Week 10-11 | Sprint 2 - Sprint Plan    | 5%     |
| Week 10-11 | Sprint 2 - Retrospective  | 5%     |
| Week 12-13 | Sprint 3 - Sprint Plan    | 5%     |
| Week 12-13 | Sprint 3 - Retrospective  | 5%     |
| Week 14    | Final Product Demo        | 35%    |

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

- [Node.js 18+](https://nodejs.org)
- [Supabase Project](https://supabase.com)

### Workflow

This repository uses **Branch Protection Rules** to ensure code quality. Direct pushes to `main` are disabled. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for the Pull Request and Review workflow.

### 1. Clone & Install

```bash
git clone https://github.com/masonlet/info-3112-project.git
cd info-3112-project
npm install
```

### 2. Environment Setup
Create `.env.local` from `.env.example` and fill in ENV keys

### 3. Run Locally

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
