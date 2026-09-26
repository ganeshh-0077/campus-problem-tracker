# 🏫 Campus Issue Tracker

> A modern, real-time full-stack web application for reporting, tracking, and resolving campus facilities issues across Students, Staff, and Administrators.

Built with **React**, **TypeScript**, **Vite**, **Node.js (Express)**, **Supabase PostgreSQL**, **Supabase Auth**, and **Supabase Realtime**.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [User Roles & Permissions](#-user-roles--permissions)
4. [Project Directory Structure](#-project-directory-structure)
5. [Prerequisites](#-prerequisites)
6. [Step-by-Step Supabase Setup Guide](#-step-by-step-supabase-setup-guide)
   - [1. Create a Supabase Project](#1-create-a-supabase-project)
   - [2. Obtain API Keys & URL](#2-obtain-api-keys--url)
   - [3. Run Database Migrations (Schema & RLS)](#3-run-database-migrations-schema--rls)
   - [4. Seed the Database](#4-seed-the-database)
   - [5. Verify Realtime Publication](#5-verify-realtime-publication)
7. [Environment Variables Configuration](#-environment-variables-configuration)
8. [Installation & Running Locally](#-installation--running-locally)
9. [Realtime Architecture & Event Flow](#-realtime-architecture--event-flow)
10. [REST API Documentation](#-rest-api-documentation)
11. [Running Automated Tests](#-running-automated-tests)
12. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Project Overview

Colleges and universities regularly deal with maintenance issues: projector failures in auditoriums, broken computers in science labs, flickering fluorescent lights, internet dropouts, or spills.

**Campus Issue Tracker** provides a centralized, real-time portal:
- **Students** report issues with a location, category, and priority, and monitor status updates and staff replies in real time without refreshing.
- **Staff Members** have a dedicated queue of issues assigned to them, can update progress (*In Progress* $\rightarrow$ *Resolved*), post updates, and inspect audit logs.
- **Administrators** have a command center with campus-wide statistics, issue assignment dropdowns, priority modifiers, category distribution metrics, and management tools.

---

## 🛠 Tech Stack & Architecture

```
               ┌────────────────────────────────────────────────────────┐
               │              React 18 + Vite + TypeScript              │
               │  - Tailwind CSS + Lucide Icons                         │
               │  - Role-based views: Student / Staff / Admin           │
               │  - Supabase Browser SDK (Auth & Realtime Channels)     │
               └───────────────▲────────────────────────▲───────────────┘
                               │                        │
                      HTTP REST Calls             Realtime WebSocket
                    (Bearer Supabase JWT)       (postgres_changes events)
                               │                        │
                               ▼                        │
               ┌──────────────────────────────┐         │
               │    Node.js Express Server    │         │
               │  - TypeScript & Zod Schema   │         │
               │  - RBAC Middleware           │         │
               │  - REST Controllers          │         │
               └───────────────▲──────────────┘         │
                               │                        │
                          SQL / RPC                     │
                               │                        │
                               ▼                        ▼
               ┌────────────────────────────────────────────────────────┐
               │                  Supabase PostgreSQL                   │
               │  - Row Level Security (RLS) policies                   │
               │  - Automated Triggers (updated_at, history audit)       │
               │  - Supabase Auth (auth.users <-> public.profiles)      │
               │  - Supabase Realtime Publication (WAL replication)     │
               └────────────────────────────────────────────────────────┘
```

### Why this architecture?
1. **Separation of Concerns**: Business logic and input validation remain isolated in the Express backend services.
2. **Database-level Security**: Even if a request were to reach the database directly, PostgreSQL Row Level Security (RLS) ensures students cannot read or edit unauthorized tickets.
3. **Instant Responsiveness**: Supabase Realtime broadcasts PostgreSQL Write-Ahead Log (WAL) changes over WebSockets, updating the UI dynamically.

---

## 👥 User Roles & Permissions

| Feature / Action | 🎓 Student | 🛠️ Staff | 🛡️ Admin |
| :--- | :---: | :---: | :---: |
| Register / Login via Supabase Auth | ✅ | ✅ | ✅ |
| Report a new campus issue | ✅ | ✅ | ✅ |
| View own submitted issues | ✅ | ✅ | ✅ |
| View assigned maintenance queue | ❌ | ✅ | ✅ |
| View all campus-wide issues | ❌ | ❌ | ✅ |
| Update issue status (*In Progress*, *Resolved*) | ❌ | ✅ (Assigned) | ✅ (Any) |
| Assign issues to staff | ❌ | ❌ | ✅ |
| Change issue priority (*Low*, *Medium*, *High*, *Critical*) | ❌ | ❌ | ✅ |
| Delete issue | ✅ (*Pending only*) | ❌ | ✅ |
| Post & read discussion comments | ✅ (Own) | ✅ (Assigned) | ✅ (Any) |
| View status audit history | ✅ (Own) | ✅ (Assigned) | ✅ (Any) |
| View campus-wide metrics & breakdowns | ❌ | ❌ | ✅ |

---

## 📂 Project Directory Structure

```
campus-issue-tracker/
├── package.json                   # Root orchestrator scripts
├── README.md                      # Complete guide and docs
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql # Profiles, issues, comments, triggers, realtime
│   │   └── 002_row_level_security.sql # RLS policies for Student, Staff, and Admin
│   └── seed.sql                   # Realistic sample users, tickets, comments, and history
├── backend/
│   ├── src/
│   │   ├── controllers/           # HTTP Request & Response handlers
│   │   │   ├── issueController.ts
│   │   │   ├── commentController.ts
│   │   │   └── dashboardController.ts
│   │   ├── routes/                # Express endpoint definitions
│   │   │   ├── issueRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/              # Business logic & database operations
│   │   │   ├── issueService.ts
│   │   │   ├── commentService.ts
│   │   │   └── dashboardService.ts
│   │   ├── middleware/            # Auth, RBAC, Validation & Error handling
│   │   │   ├── authMiddleware.ts
│   │   │   ├── validateMiddleware.ts
│   │   │   └── errorMiddleware.ts
│   │   ├── utils/
│   │   │   ├── supabaseClient.ts  # Admin & User-scoped Supabase client
│   │   │   └── validationSchemas.ts # Zod schemas for all models
│   │   ├── types/
│   │   │   └── index.ts           # Shared TypeScript interfaces
│   │   ├── app.ts                 # Express application setup
│   │   └── server.ts              # HTTP server entrypoint
│   ├── tests/
│   │   └── api.test.ts            # Vitest & Supertest automated test suite
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/            # Reusable UI widgets
    │   │   ├── Navbar.tsx         # Realtime status badge + Demo role switcher
    │   │   ├── IssueCard.tsx      # Ticket item card
    │   │   ├── IssueDetailModal.tsx # Full detail, comments, history & controls
    │   │   ├── CreateIssueModal.tsx # Report issue form
    │   │   ├── CommentSection.tsx # Live discussion thread
    │   │   ├── HistoryTimeline.tsx# Status audit trail
    │   │   ├── StatsOverview.tsx  # Metric cards
    │   │   ├── FilterBar.tsx      # Search & dropdown filters
    │   │   ├── StatusBadge.tsx
    │   │   ├── PriorityBadge.tsx
    │   │   ├── CategoryBadge.tsx
    │   │   └── ProtectedRoute.tsx # Route guard
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── StudentDashboard.tsx
    │   │   ├── StaffDashboard.tsx
    │   │   ├── AdminDashboard.tsx
    │   │   └── UnauthorizedPage.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx    # Supabase session + fast role preview
    │   ├── hooks/
    │   │   └── useRealtimeIssues.ts # WebSocket subscription hook
    │   ├── services/
    │   │   └── api.ts             # API client with Bearer token injection
    │   ├── lib/
    │   │   └── supabase.ts        # Browser Supabase client
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 📋 Prerequisites

Make sure you have installed on your development machine:
1. **Node.js** (v18.0.0 or higher - verified on Node v26)
2. **npm** (v9.0.0 or higher)
3. A free account on [Supabase](https://supabase.com)

---

## 🚀 Step-by-Step Supabase Setup Guide

### 1. Create a Supabase Project
1. Log in to [https://supabase.com](https://supabase.com).
2. Click **New Project** and choose an organization.
3. Fill in:
   - **Name**: `campus-issue-tracker`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose the closest region to you.
4. Click **Create new project** and wait 1-2 minutes for provisioning.

### 2. Obtain API Keys & URL
1. In the Supabase Dashboard, navigate to **Project Settings** (gear icon at the bottom left) $\rightarrow$ **API**.
2. Copy the following values:
   - **Project URL** (e.g. `https://xyzprojectref.supabase.co`)
   - **anon / public** key (under Project API keys)
   - **service_role** key (click *Reveal secret key* - **never share this in frontend code**)

### 3. Run Database Migrations (Schema & RLS)
1. In the Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New query**.
3. Open `supabase/migrations/001_initial_schema.sql` in your code editor, copy the entire content, paste it into the Supabase SQL editor, and click **Run**.
   - *What this creates*: `profiles`, `issues`, `comments`, `issue_history` tables, performance indexes, the `handle_updated_at` trigger, the `handle_issue_status_change` audit trigger, the `handle_new_user` profile sync trigger, and adds tables to `supabase_realtime` publication.
4. Open a new query in the SQL Editor.
5. Open `supabase/migrations/002_row_level_security.sql`, copy all content, paste it into the editor, and click **Run**.
   - *What this creates*: Enables Row Level Security on all four tables and sets up strict role policies for Students, Staff, and Admins.

### 4. Seed the Database
1. Open a new query in the Supabase SQL Editor.
2. Open `supabase/seed.sql`, paste the contents, and click **Run**.
   - *What this creates*:
     - **Admin**: `admin@campus.edu` (Password: `Password123!`)
     - **Staff (IT)**: `james.staff@campus.edu` (Password: `Password123!`)
     - **Staff (Facilities)**: `elena.staff@campus.edu` (Password: `Password123!`)
     - **Students**: `alex.student@campus.edu`, `priya.student@campus.edu`, `liam.student@campus.edu` (Password: `Password123!`)
     - 6 realistic campus issues, comments thread, and status transition logs.

### 5. Verify Realtime Publication
1. Navigate to **Database** $\rightarrow$ **Replication** in the Supabase dashboard.
2. Under the `supabase_realtime` publication, confirm that `issues`, `comments`, and `issue_history` have replication enabled (toggled on).

### 6. Configure Supabase Authentication (Localhost Dev)
1. Go to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. For seamless local testing, turn off **Confirm email** so test users can log in immediately upon registration without email verification links.

---

## ⚙️ Environment Variables Configuration

### Backend: `backend/.env`
Create a `.env` file inside the `backend/` folder (or copy from `backend/.env.example`):

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Replace with your Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend: `frontend/.env`
Create a `.env` file inside the `frontend/` folder (or copy from `frontend/.env.example`):

```env
# Replace with your Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Express Backend URL
VITE_API_URL=http://localhost:3000/api
```

---

## 💻 Installation & Running Locally

### Step 1: Install Dependencies
Open your terminal in the project directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 2: Start the Backend Server
In a terminal window:
```bash
npm run dev:backend
```
*The backend server will start on [http://localhost:3000](http://localhost:3000). You can verify it by opening [http://localhost:3000/api/health](http://localhost:3000/api/health).*

### Step 3: Start the Frontend Application
In a second terminal window:
```bash
npm run dev:frontend
```
*The Vite frontend will start on [http://localhost:5173](http://localhost:5173).*

Open [http://localhost:5173](http://localhost:5173) in your browser.

> 💡 **Built-in Interactive Role Preview**:
> Even before connecting your Supabase project, you can click on the **Quick Role Preview** buttons (Student, Staff, Admin) on the login screen or in the top navigation bar to explore the complete role-tailored user interfaces!

---

## ⚡ Realtime Architecture & Event Flow

Supabase Realtime listens to PostgreSQL's replication stream (Logical Decoding / Write-Ahead Logs) and publishes database events over WebSockets.

```
+-------------------------------------------------------------------------+
|                           Event Lifecycle Flow                          |
+-------------------------------------------------------------------------+
 1. Staff clicks "Update Status -> In Progress"
 2. Express backend executes:
    UPDATE public.issues SET status = 'In Progress' WHERE id = :id;
 3. PostgreSQL executes the UPDATE.
 4. Trigger "trigger_issue_status_history" logs the old and new status.
 5. PostgreSQL WAL notifies Supabase Realtime daemon.
 6. Supabase Realtime broadcasts WebSocket packet:
    {
      "eventType": "UPDATE",
      "table": "issues",
      "new": { "id": "...", "status": "In Progress", ... }
    }
 7. In connected student browsers, `useRealtimeIssues` hook receives payload.
 8. React state updates immediately:
    - Ticket badge turns to "In Progress"
    - An animated notification banner informs the student
    - No page refresh required!
+-------------------------------------------------------------------------+
```

### Frontend Subscription (`frontend/src/hooks/useRealtimeIssues.ts`)
```typescript
const channel = supabase
  .channel('campus-tracker-realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'issues' }, (payload) => {
    callbacks.onIssueInsert(payload.new);
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'issues' }, (payload) => {
    callbacks.onIssueUpdate(payload.new);
  })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
    callbacks.onCommentInsert(payload.new);
  })
  .subscribe();
```

---

## 📡 REST API Documentation

Base URL: `http://localhost:3000/api`

All endpoints (except `/health`) require the HTTP header:
`Authorization: Bearer <supabase_jwt_token>`

### 1. Issues Endpoints

#### `GET /api/issues`
- **Description**: Fetch list of issues (Students receive own tickets, Staff receive assigned tickets, Admins receive all).
- **Query Parameters**:
  - `status`: `Pending` | `In Progress` | `Resolved` | `Closed`
  - `priority`: `Low` | `Medium` | `High` | `Critical`
  - `category`: `Computer` | `Internet` | `Electricity` | `Classroom` | `Cleaning` | `Furniture` | `Other`
  - `search`: Keyword searched against title, description, and location
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "d0000000-0000-0000-0000-000000000001",
      "title": "Lab 3 PC #14 Blue Screen",
      "description": "Computer crashes on boot.",
      "category": "Computer",
      "priority": "High",
      "status": "In Progress",
      "location": "Science Building Room 304",
      "created_by": "c0000000-0000-0000-0000-000000000001",
      "assigned_to": "b0000000-0000-0000-0000-000000000001",
      "created_at": "2026-09-22T08:00:00Z",
      "updated_at": "2026-09-23T10:00:00Z",
      "creator": { "name": "Alex Chen", "email": "alex.student@campus.edu", "role": "Student" },
      "assignee": { "name": "James Wilson", "email": "james.staff@campus.edu", "role": "Staff" }
    }
  ]
}
```

#### `POST /api/issues`
- **Description**: Report a new campus issue.
- **Request Body**:
```json
{
  "title": "Flickering overhead projector",
  "description": "Projector in Room 204 produces continuous flickering lines.",
  "category": "Classroom",
  "priority": "Medium",
  "location": "Engineering Hall Room 204"
}
```
- **Response**: `201 Created`

#### `GET /api/issues/:id`
- **Description**: Fetch detailed information for a single issue.
- **Response**: `200 OK` (or `403 Forbidden` if user is not authorized to view this ticket).

#### `PUT /api/issues/:id`
- **Description**: Update issue details (location, description, etc.).
- **Permissions**: Admins can update any; Staff can update assigned; Students can update own ticket only if `Pending`.
- **Response**: `200 OK`

#### `PUT /api/issues/:id/status`
- **Description**: Update lifecycle status (`Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved` $\rightarrow$ `Closed`).
- **Permissions**: Admins and Assigned Staff only.
- **Request Body**: `{ "status": "Resolved" }`
- **Response**: `200 OK`

#### `PUT /api/issues/:id/assign`
- **Description**: Assign an issue to a staff member or unassign it (`null`).
- **Permissions**: Admin only.
- **Request Body**: `{ "assigned_to": "b0000000-0000-0000-0000-000000000001" }`
- **Response**: `200 OK`

#### `DELETE /api/issues/:id`
- **Description**: Delete an issue.
- **Permissions**: Admin, or Student if ticket is still `Pending`.
- **Response**: `200 OK`

#### `GET /api/issues/:id/history`
- **Description**: Retrieve audit trail of all status transitions for this issue.
- **Response**: `200 OK`

---

### 2. Comments Endpoints

#### `GET /api/issues/:id/comments`
- **Description**: Get discussion comments for an issue.
- **Response**: `200 OK`

#### `POST /api/issues/:id/comments`
- **Description**: Add a comment to an issue.
- **Request Body**: `{ "comment": "Parts have been ordered, arriving tomorrow." }`
- **Response**: `201 Created`

---

### 3. Dashboard Statistics Endpoint

#### `GET /api/dashboard/statistics`
- **Description**: Aggregates metric counters across status, priority, and category based on role scope.
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 6,
    "pending": 2,
    "inProgress": 2,
    "resolved": 2,
    "critical": 2,
    "byCategory": {
      "Computer": 1,
      "Internet": 1,
      "Electricity": 1,
      "Classroom": 1,
      "Cleaning": 1,
      "Furniture": 1,
      "Other": 0
    },
    "byPriority": {
      "Low": 1,
      "Medium": 1,
      "High": 2,
      "Critical": 2
    }
  }
}
```

---

## 🧪 Running Automated Tests

The backend includes a comprehensive test suite written with **Vitest** and **Supertest** covering:
- Authentication & JWT token validation
- Role-based authorization & permission restrictions (Student vs Staff vs Admin)
- Input payload validation & Zod schema checks
- Creating issues, updating status, assigning tickets
- Comment posting and length constraints
- Error handling and HTTP status codes

To run the tests:

```bash
cd backend
npm test
```

Sample output:
```
 ✓ tests/api.test.ts (10 tests) 45ms
 Test Files  1 passed (1)
      Tests  10 passed (10)
   Duration  728ms
```

---

## ❓ Troubleshooting & FAQ

### 1. `Invalid or expired authentication session` (401)
- Ensure the user has logged in and the Bearer token is valid.
- If testing via Postman or curl, obtain a session token by logging in through `/login` or checking `localStorage.getItem('sb-...')`.

### 2. `Access denied. Requires one of: [Admin]` (403)
- You attempted to perform an action restricted to another role (e.g. a Student trying to assign an issue or change a status).
- Check the user's role in the `profiles` table in Supabase.

### 3. Realtime updates are not received in the browser
- Verify you executed the realtime migration command:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_history;
  ```
- Check your browser developer console for WebSocket errors.

### 4. CORS Error in browser
- Ensure `CORS_ORIGIN` in `backend/.env` matches your frontend origin (default: `http://localhost:5173`).
