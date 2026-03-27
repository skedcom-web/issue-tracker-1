# vThink Project & Issue Tracker — Frontend

React 18 + TypeScript + Vite + MUI v6 + SASS

---

## First-Time Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create environment file
```bash
cp .env.example .env
```
The default `.env` works as-is for local development.

### 3. Start development server
```bash
npm run dev
```

App is running at: **http://localhost:5173**

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check for linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run type-check` | TypeScript type checking only |

---

## Architecture

```
src/
├── app/
│   ├── theme.ts        MUI theme — OMS design tokens
│   └── routes.tsx      All routes + lazy loading
├── components/
│   ├── common/         StatusChip, PageHeader
│   └── layout/         Sidebar, Topbar, MainLayout
├── features/
│   ├── auth/           LoginPage, ChangePasswordPage
│   ├── dashboard/      DashboardPage (stats + charts)
│   ├── issues/         AllIssuesPage, MyIssuesPage, IssueDetailPage, NewIssueModal
│   ├── projects/       ProjectSetupPage, ProjectTrackingPage (coming soon)
│   ├── employees/      EmployeeSetupPage
│   └── users/          UserManagementPage
├── services/
│   ├── axiosInstance.ts  JWT interceptor
│   └── api.ts            All API calls
├── store/
│   └── auth.context.tsx  Auth state (JWT in localStorage)
├── styles/
│   ├── _variables.scss   OMS design tokens
│   └── global.scss       Resets + badge classes
└── types/
    └── index.ts          All TypeScript interfaces
```
