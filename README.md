# UpSkill

> A learning-path platform that helps students follow structured,
> industry-oriented learning journeys created by experienced
> professionals.

## Overview

**UpSkill** is a full-stack web application that helps students discover
and follow structured learning Paths.

Instead of hosting educational content itself, UpSkill organizes
external resources such as documentation, coding platforms, courses,
videos, and GitHub repositories into a clear progression of milestones
and tasks.

Creators can build and publish Paths, while students can discover them,
follow their progress, complete tasks, and upvote useful Paths.

## Features

### Student Features

-   Secure account creation and login
-   Browse published learning Paths
-   View Path sections, tasks, and external resources
-   Follow a Path
-   Mark tasks as completed
-   Track Path progress
-   Persistent progress after refresh
-   Upvote useful Paths

### Creator Features

-   Create learning Paths
-   Add sections/milestones
-   Add tasks to sections
-   Add external learning resources
-   Publish Paths
-   Edit existing Paths
-   Protected creator dashboard

### Platform Features

-   Persistent PostgreSQL database
-   Supabase authentication
-   Row Level Security (RLS)
-   User-specific ownership and permissions
-   Upvoting system
-   Responsive interface
-   Protected routes
-   Server-side data operations
-   Vercel production deployment

## Tech Stack

  Technology     Purpose
  -------------- ----------------------------------------
  Next.js 16     Full-stack React framework
  React          User interface
  TypeScript     Type-safe development
  Tailwind CSS   Styling and responsive UI
  Supabase       PostgreSQL database and authentication
  PostgreSQL     Persistent application data
  Vercel         Production deployment
  pnpm           Package management

## Application Architecture

``` text
UpSkill
|
+-- Authentication
|   +-- Supabase Auth
|
+-- Student Experience
|   +-- Explore Paths
|   +-- View Path
|   +-- Follow Path
|   +-- Complete Tasks
|   +-- Upvote Paths
|
+-- Creator Experience
|   +-- Dashboard
|   +-- Create Path
|   +-- Add Sections
|   +-- Add Tasks
|   +-- Add Resources
|   +-- Publish Path
|   +-- Edit Path
|
+-- Data Layer
    +-- Supabase PostgreSQL
        +-- profiles
        +-- roadmaps
        +-- roadmap_sections
        +-- tasks
        +-- task_resources
        +-- roadmap_followers
        +-- task_progress
        +-- roadmap_tags
        +-- roadmap_tag_links
        +-- roadmap_upvotes
```

## Data Persistence

UpSkill uses Supabase PostgreSQL for persistent application data.

Persisted data includes: - User profiles - Learning Paths - Path
sections - Tasks - External resources - Path followers - Task
completion/progress - Path upvotes - Tags

Supabase Row Level Security policies restrict user-specific operations
and protect creator-owned content.

## User Flow

### Creator

``` text
Sign Up
   |
Dashboard
   |
Create Path
   |
Add Sections
   |
Add Tasks & Resources
   |
Publish
   |
Path becomes available to students
```

### Student

``` text
Sign Up / Log In
   |
Explore Paths
   |
Open a Path
   |
Follow Path
   |
Complete Tasks
   |
Progress is saved
```

## Project Structure

``` text
app/
+-- (auth)/
|   +-- login/
|   +-- signup/
+-- actions/
|   +-- roadmaps.ts
+-- dashboard/
|   +-- roadmaps/
+-- roadmaps/
|   +-- [slug]/
|   +-- page.tsx
+-- auth/
|   +-- callback/
+-- page.tsx

components/
+-- roadmap-card.tsx
+-- progress-bar.tsx
+-- action-form.tsx
+-- upvote-button.tsx

lib/
+-- roadmaps.ts
+-- supabase/
    +-- client.ts
    +-- server.ts
```

## Getting Started

### Prerequisites

-   Node.js
-   pnpm
-   A Supabase project

### Installation

Clone the repository:

``` bash
git clone https://github.com/PranavPanicker8/UpSkill.git
cd UpSkill
```

Install dependencies:

``` bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit `.env.local` or expose its values publicly.

### Run Locally

``` bash
pnpm dev
```

Open `http://localhost:3000`.

### Production Build

``` bash
pnpm exec tsc --noEmit
pnpm build
```

## Deployment

The production application is deployed using Vercel.

**Live Demo:** `YOUR_VERCEL_URL`

**GitHub Repository:** https://github.com/PranavPanicker8/UpSkill

For production authentication, the deployed application's authentication
callback should be configured in Supabase under the project's
Authentication URL settings.

## Demonstrated End-to-End Journey

The application supports a complete multi-user workflow:

1.  A creator signs up.
2.  The creator creates a Path.
3.  Sections, tasks, and external resources are added.
4.  The creator publishes the Path.
5.  A student account discovers the published Path.
6.  The student follows the Path.
7.  The student completes tasks.
8.  Progress is stored in the database.
9.  The student refreshes the page and retains their progress.
10. The student can upvote the Path.

This demonstrates shared data, authentication, database persistence, and
user-specific state.

## Why UpSkill?

Students often have access to many learning resources but lack a clear
order in which to use them.

UpSkill focuses on the organization problem: turning scattered resources
into structured learning Paths with milestones, actionable tasks, and
persistent progress tracking.

The platform allows experienced professionals to create practical
learning journeys while students follow those journeys at their own
pace.

## Future Improvements

-   Full-text Path search
-   Advanced filtering by skill/category
-   Real-time progress updates
-   Profile customization
-   Notifications
-   Image uploads
-   Creator analytics
-   Path recommendations

## License

This project was created as a technical-track recruitment project for
GitHub Community SRM (GCSRM).
