# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARL Intranet (ARL Connect) - Internal intranet portal for Adamus Resources Limited, a mining company in Ghana. This is a full-stack React Router v7 application with SSR, replacing an existing WordPress-based intranet.

## Commands

```bash
# Development
npm run dev              # Start development server with HMR

# Build & Production
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run typecheck        # Generate types & run TypeScript check
npm run lint             # ESLint check on app/
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format all TS/TSX/CSS with Prettier
npm run format:check     # Check formatting without modifying

# Docker
docker build -t arl-intranet .
docker run -p 3000:3000 arl-intranet
```

## Tech Stack

- **Framework:** React Router v7.12 (full-stack with SSR)
- **React:** v19.2
- **UI:** HeroUI (formerly NextUI), Framer Motion, Lucide icons
- **Styling:** TailwindCSS v4 with custom brand theme
- **Build:** Vite v7
- **Database:** MongoDB (planned, not yet implemented)
- **Auth:** OTP + JWT for admin portal (planned)

## Architecture

```
app/
├── components/
│   ├── dashboard/       # Homepage dashboard components
│   ├── layout/          # MainLayout, Header, Footer
│   └── ui/              # Reusable UI (LoadingSpinner, ErrorPage)
├── routes/              # React Router file-based routes
│   ├── home.tsx         # Index route (/)
│   └── routes.ts        # Route configuration
├── lib/
│   ├── constants.ts     # Brand colors, nav links, departments, API routes
│   └── utils.ts         # Helper functions (formatDate, truncateText, debounce)
├── providers/           # Context providers (HeroUIProvider)
├── root.tsx             # Root layout & error boundary
└── app.css              # Global styles & Tailwind theme
```

## Key Patterns

**Imports:** Use path alias `~/` for app directory (e.g., `import { Header } from "~/components/layout"`)

**Component exports:** Named exports with index.ts barrel files

**Task references:** Components reference WBS task IDs in comments (e.g., `Task: 1.1.1.3.1`)

**Brand colors:** Primary gold (#D4AF37), secondary navy (#1B365D), safety colors defined in constants.ts and app.css

## Project Documentation

- `PROJECT_PLAN.md` - Detailed 4-phase project plan with all features
- `WBS.md` - Work Breakdown Structure with task tracking and status
- `docs/DEPARTMENTS.md` - Department structure and codes
- `.env.example` - Environment variables template

## Current Status

Phase 1 (Foundation & Core Communication) is in progress. Base layout components are mostly complete. Database setup, admin portal, and content features are pending. See WBS.md for detailed task status.
