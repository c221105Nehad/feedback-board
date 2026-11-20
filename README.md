# Feedback Board

A full-stack feedback and roadmap board. Users suggest features, upvote and discuss them, and admins move ideas through **Open → Planned → In progress → Done**, so everyone can see what's coming.

**Live demo:** https://feedback-board-na83.vercel.app

![Home page](docs/home.jpeg)

| Post detail and comments | Admin moderation |
| --- | --- |
| ![Post page](docs/post.jpeg) | ![Admin page](docs/admin.jpeg) |

## Features

- **Authentication:** email and password sign-up and sign-in, with sessions stored in HTTP-only cookies
- **Feature requests:** create posts with server-side validation
- **Upvotes:** optimistic UI (the count updates instantly), with one vote per user per post enforced by the database
- **Comments:** a dedicated page for each post
- **Roadmap statuses:** admins change a post's status from a protected `/admin` page
- **Moderation:** admins can delete posts (with their votes and comments) and individual comments
- **Browsing:** filter by status, sort by top or newest, and paginate, all driven by URL search params so every view is shareable
- **Polish:** loading skeletons, error boundaries, a custom 404, and per-post SEO metadata

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL on Neon, with Drizzle ORM |
| Auth | Better Auth |
| Validation | Zod |
| Deployment | Vercel |

## Design decisions

- **Server Components by default.** Pages query the database directly on the server. `"use client"` is limited to small interactive pieces such as the vote button and the forms.
- **Server Actions for every mutation, each one re-checking the session.** Actions are public endpoints, so authorization lives next to the data and never relies on hidden UI.
- **Roles can't be self-assigned.** The `role` field is excluded from sign-up input (`input: false`) and is changed only in the database. The admin page and every admin action check the role on the server.
- **The database enforces the rules.** A composite primary key makes duplicate votes impossible, and foreign keys with `ON DELETE CASCADE` keep data consistent when a post or user is removed.
- **The URL is the state** for filters, sorting, and pagination. Every parameter is validated with Zod and falls back to a safe default, so invalid input never reaches the database.
- **Optimistic updates** with `useOptimistic`: the UI responds immediately and corrects itself automatically if the server rejects the action.
- **`proxy.ts` is only a convenience layer.** It redirects visitors without a session cookie away from `/admin`, but real security is enforced in the page and the actions.

## Project structure

```
src/
├── app/
│   ├── page.tsx                 # Home: list, filters, sorting, pagination
│   ├── layout.tsx               # Root layout, header, site metadata
│   ├── actions.ts               # Server Actions (posts, votes, comments, admin)
│   ├── admin/page.tsx           # Admin: change status, delete posts
│   ├── posts/[id]/              # Post detail: page, loading, error, not-found
│   ├── sign-in/ · sign-up/      # Auth pages
│   └── api/auth/[...all]/       # Better Auth route handler
├── components/                  # Header, PostForm, CommentForm, VoteButton, Filters, ...
├── db/                          # Drizzle client and schema
├── lib/                         # Auth server config and auth client
└── proxy.ts                     # Route guard for /admin
```

## Getting started

**Prerequisites:** Node.js 20 or newer, and a free PostgreSQL database (for example, [Neon](https://neon.tech)).

```bash
git clone https://github.com/[your-username]/feedback-board.git
cd feedback-board
npm install
```

Create a `.env.local` file in the project root (see `.env.example`):

```
DATABASE_URL="postgresql://user:password@host/dbname"
BETTER_AUTH_SECRET="a-random-32-byte-hex-string"
BETTER_AUTH_URL="http://localhost:4000"
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create the tables and start the app:

```bash
npm run db:push
npm run dev
```

Open http://localhost:4000 (use `localhost`, not your network IP, because Better Auth checks the request origin).

### Becoming an admin

There is deliberately no UI for this. Sign up through the app, then run this in your database's SQL editor (or in `npm run db:studio`):

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

Refresh the app, and an **Admin** link appears in the header.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 4000 |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:studio` | Open Drizzle Studio to browse data |

## Deployment

Deployed on Vercel with these environment variables:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Connection string of the production database |
| `BETTER_AUTH_SECRET` | A different secret from local development |
| `BETTER_AUTH_URL` | The production domain exactly, with `https://` and no trailing slash |

Local development and production use separate Neon branches, so testing never touches live data.

## Author

**Inkiad Hossain Nehad**
www.linkedin.com/in/inkiad-hossain-nehad-a83970275 · [[GitHub URL]](https://github.com/c221105Nehad/)
