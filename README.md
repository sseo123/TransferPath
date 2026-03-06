# TransferPathway

**Transfer planning made simple for California community college students.**

TransferPathway is a full-stack web application that helps community college students plan, track, and optimize their course roadmap for transferring to a University of California (UC) campus. Students select their community college, target university, and major — then receive a personalized, interactive semester-by-semester plan with prerequisite validation, IGETC tracking, and more.

🌐 **Live at**: [https://transferpathway.com](https://transferpathway.com)

---

## What It Does

### For Students
- **Personalized Transfer Plans** — Select your community college, target UC(s), and major to receive a tailored course roadmap.
- **Drag-and-Drop Plan Editor** — Organize courses across semesters with an intuitive drag-and-drop interface. Move courses between "Unassigned," individual semesters, and "Completed."
- **Multi-University Targeting** — Add multiple UC + major combinations and compare requirements side by side.
- **IGETC & Pattern Tracking** — Interactive checklists to track progress on IGETC general-education requirements and major-specific prerequisite patterns.
- **Prerequisite Validation** — Real-time warnings when a course is placed before its prerequisites are completed.
- **Calendar & Deadlines** — Built-in calendar to track homework, application deadlines, and custom notes.
- **Counselor View (PDF Export)** — Generate a printable PDF of your plan to share with academic counselors.
- **Custom Courses** — Add courses not in the default catalog and assign them to specific university requirements.
- **Semester Completion** — Mark semesters as complete to track progress over time.
- **Dark / Light Mode** — Full theme support via `next-themes`.

### Coverage
- **9 UC campuses**: Berkeley, UCLA, San Diego, Irvine, Davis, Santa Barbara, Santa Cruz, Riverside, Merced.
- **57+ major-specific requirement datasets** across engineering, computer science, mathematics, statistics, business, and more.
- **Community colleges**: Currently Diablo Valley College (DVC) with extensible architecture for adding more.

---

## How It Works

### User Flow
1. **Landing Page** → Animated marketing page with live interactive demo.
2. **Sign Up / Sign In** → Create an account with username + password, or use **Google OAuth** (one-click).
3. **Onboarding** → Select your first name, last name, community college, and intended transfer term (season + year).
4. **Dashboard** → The main hub:
   - View your semester-by-semester plan with unit counts.
   - Enter the **Plan Editor** to drag-and-drop courses.
   - Track IGETC and prerequisite-pattern checklists.
   - Use the calendar for deadlines and notes.
   - Add/remove target universities and majors.
   - Export a counselor-friendly PDF.

### Planner Engine
The core planning logic lives in `lib/planner/`:

| File | Purpose |
|---|---|
| `engine.ts` | Builds the initial semester plan from a `RequirementGraph` — resolves prerequisites, assigns courses to semesters respecting dependency order. |
| `validator.ts` | Checks prerequisite satisfaction for a given course placement across all semesters. |
| `utils.ts` | Utility functions (e.g., total unit calculation). |
| `types.ts` | TypeScript types for `Semester`, `PlannedCourse`, `RequirementGraph`, `SyncTask`, etc. |

### Requirement Data
Each UC + major combination has a hand-curated requirement file in `data/colleges/<uc>/<uc>_<major>.ts` defining:
- Required courses (with DVC-specific course codes)
- Prerequisite chains (which courses must be taken before which)
- Unit values and course titles

These are aggregated in `data/registry.ts`, which serves as the **central lookup** mapping university display names → majors → requirement graphs.

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19, Server Components + Server Actions) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **Auth** | Lucia v3 + Arctic (Google OAuth) + oslo (password hashing) |
| **Database** | Cloudflare D1 (SQLite at the edge) |
| **ORM** | Drizzle ORM (SQLite dialect, D1 HTTP driver) |
| **Hosting** | Cloudflare Workers (via `@opennextjs/cloudflare`) |
| **Drag-and-Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **PDF Generation** | `@react-pdf/renderer` |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Theming** | `next-themes` |

### Project Structure

```
transferpath/
├── app/                    # Next.js App Router pages & layouts
│   ├── page.tsx            # Landing page (marketing + demo)
│   ├── layout.tsx          # Root layout (fonts, theme, metadata)
│   ├── signin/             # Sign-in page + server actions
│   ├── signup/             # Sign-up page + server actions
│   ├── login/google/       # Google OAuth flow (redirect + callback)
│   ├── onboarding/         # Post-signup onboarding wizard
│   ├── dashboard/          # Main app (plan viewer, editor, calendar)
│   │   ├── page.tsx        # Server component — loads user data
│   │   ├── dashboardClient.tsx  # Client dashboard UI
│   │   ├── planEditor.tsx  # Drag-and-drop plan editor
│   │   ├── actions.ts      # Server actions (save plan, manage targets, etc.)
│   │   └── CounselorViewPDF.tsx # PDF export component
│   ├── error.tsx           # Global error boundary
│   └── not-found.tsx       # 404 page
├── components/             # Shared React components
│   ├── TransferPathwayDemo.tsx  # Interactive landing page demo
│   ├── CourseItem.tsx      # Reusable course chip/card
│   ├── DashboardSidebar.tsx    # Navigation sidebar
│   ├── ProfileMenu.tsx     # User profile dropdown
│   ├── AutoPlanSimulation.tsx  # Animated plan-building demo
│   └── ThemeToggle.tsx     # Light/dark mode toggle
├── data/                   # Static requirement data
│   ├── registry.ts         # Central university → major → requirements lookup
│   ├── colleges/           # 57+ requirement files across 9 UCs
│   ├── courses/            # Course catalog data
│   └── cc/                 # Community college course catalogs (DVC)
├── db/
│   └── schema.ts           # Drizzle ORM schema (9 tables)
├── drizzle/                # Migration files (23 migrations)
├── lib/
│   ├── auth.ts             # Lucia setup, session validation, lastActiveAt tracking
│   ├── oauth.ts            # Google OAuth config (Arctic)
│   ├── db.ts               # Database connection helper
│   ├── password.ts         # Password hashing (oslo)
│   └── planner/            # Core planning engine
│       ├── engine.ts       # Plan builder (prerequisite resolution)
│       ├── validator.ts    # Prerequisite validation
│       ├── utils.ts        # Unit calculations
│       └── types.ts        # TypeScript types
├── public/                 # Static assets (logos, robots.txt, sitemap.xml)
├── next.config.ts          # Security headers (HSTS, CSP, X-Frame-Options, etc.)
├── wrangler.toml           # Cloudflare Workers + D1 config
├── drizzle.config.ts       # Drizzle Kit config (D1 HTTP driver)
└── package.json
```

### Deployment
The app is deployed on **Cloudflare Workers** using `@opennextjs/cloudflare`:
- **Build**: `next build` → OpenNext adapter → Cloudflare Worker bundle
- **Database**: Cloudflare D1 (edge SQLite), migrations managed by Drizzle Kit + Wrangler
- **Static assets**: Served via Cloudflare's asset binding
- **Domain**: Configure via Cloudflare dashboard (DNS + Workers route)

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Database Migrations
```bash
# Generate a migration
npx drizzle-kit generate

# Apply migrations to D1
npx wrangler d1 migrations apply transferpath-database
```
