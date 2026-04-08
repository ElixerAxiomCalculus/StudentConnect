# StudentConnect
A full-stack student collaboration and matching platform. Students create profiles, complete a personality and interest questionnaire, get matched with compatible peers, and collaborate through chat, forums, projects, and groups.

---

## Features

### Landing Page
- Animated hero section with 3D scene
- "How It Works" steps and live stats
- Mission statement and contact form
- Floating navigation bar with smooth scroll

### Authentication
- Email + password registration with OTP email verification (Resend API)
- JWT-based sessions (7-day expiry, stored in `localStorage`)
- Protected dashboard routes

### Dashboard — Home
- Overview stats: active matches, pending requests, active projects, upcoming deadlines, forum mentions
- Weekly activity bar chart (GSAP animated)
- Monthly follower trend chart
- Engagement breakdown (posts, comments, reactions, views)
- Streak tracker and top skills panel
- Live activity feed (projects, forums, groups)

### Dashboard — Chat
- Real-time 1-on-1 and group messaging over WebSocket
- Thread list with search and filters (all / friends / requests / archived)
- Message reactions (6 emoji types), edit/delete own messages
- File and image attachments with drag-and-drop
- Emoji picker, disappearing messages, chat background presets
- Pin, mute, archive threads; profile drawer; typing indicator

### Dashboard — Forums
- Four categories: General Discussion, Study Groups, Project Showcase, Help & Support
- Sort by newest, top-voted, or most active
- Upvote/downvote threads and comments, bookmark, share, follow
- Nested comments with replies
- Create new thread with category, tags, and body

### Dashboard — Projects
- Tabs: My Projects / Joined / Public
- Kanban task board (To Do → In Progress → Done)
- Team member roles: owner, maintainer, collaborator, viewer
- Create projects, add/edit/delete tasks, invite or remove members
- Accept/decline join requests; copy project ID for sharing

### Dashboard — Groups
- Browse and discover groups by category (Study, Club, Project, Social)
- Search and filter (All / My Groups / Discover / Invitations)
- Create groups with name, description, category, visibility, and tags
- Join, leave, or accept invitations with real-time updates
- Visibility badges (Public / Private)

### Dashboard — Settings
- Profile: name, major, year, bio, interests, avatar
- Notifications: email, push, and in-app toggles per event type
- Privacy: profile visibility, message and invite permissions
- Accessibility: reduced motion, high contrast mode, text scale (80–140%)

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| React Router | 7 | Client-side routing |
| Vite | 7 | Build tool and dev server |
| Framer Motion | 12 | Page transitions and animations |
| GSAP | 3 | Chart animations |
| Lucide React | 0.575 | Icon set |
| @react-three/fiber | 9 | 3D hero scene (landing page) |

### Backend
| Library | Version | Purpose |
|---|---|---|
| FastAPI | 0.133 | REST + WebSocket API framework |
| PyMongo | 4 | MongoDB driver |
| Pydantic | 2 | Request/response validation |
| PyJWT | 2 | JWT auth tokens |
| bcrypt | 5 | Password hashing |
| Resend | 2 | Transactional email (OTP) |
| NumPy | 2 | Vector operations |
| uvicorn | 0.41 | ASGI server |

---

## Project Structure

```
Mini Proj/
├── README.md
├── .gitignore
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── ARCHITECTURE.md          # Full API reference and ERD
│   ├── .env                     # Secrets (not committed)
│   └── app/
│       ├── core/                # Config, datastore, dependencies, seed data
│       ├── models/schemas.py    # Pydantic models
│       ├── routes/              # One file per feature domain
│       ├── services/            # Business logic
│       └── utils/               # Cosine similarity
└── frontend/
    └── StudentConnect/
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            ├── context/AuthContext.jsx
            ├── pages/
            │   ├── LandingPage.jsx
            │   ├── AuthPage.jsx
            │   └── UserDashboard/
            │       ├── DashboardLayout.jsx
            │       ├── components/      # FrostCard, Avatar, Modal, Toast…
            │       ├── data/api.js      # API client
            │       └── pages/           # HomePage, ChatPage, ForumsPage…
            └── components/landing/      # Landing page sections
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB Atlas cluster (or set `USE_IN_MEMORY_DB=true` for local dev)

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env   # or create .env manually (see ARCHITECTURE.md)

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend/StudentConnect

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

> The frontend calls the backend directly at `http://localhost:8000` (no Vite proxy). Make sure the backend is running before loading the dashboard.

---

## Environment Variables

Create `backend/.env` with the following keys:

```env
APP_NAME=StudentConnect API
USE_IN_MEMORY_DB=false
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
MONGO_DB_NAME=student_similarity
DEMO_USER_ID=u0
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=<long-random-secret>
RESEND_OTP=re_<resend-api-key>
```

Set `USE_IN_MEMORY_DB=true` to skip MongoDB entirely — the app seeds itself with demo data on startup.

---

## API Overview

All endpoints are prefixed with `/api`. Auth endpoints are under `/api/auth/*`. Full reference in [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md).

| Domain | Prefix | Key Operations |
|---|---|---|
| Auth | `/api/auth` | register, verify OTP, login, me |
| Users | `/api` | list users, get/update own profile |
| Settings | `/api/settings` | notifications, privacy, accessibility |
| Dashboard | `/api/dashboard` | overview, feed, analytics |
| Matches | `/api/matches` | questionnaire, recommendations, actions |
| Chat | `/api/chat` | threads, messages; WS at `/ws/chat/{id}` |
| Forums | `/api/forums` | threads, categories, votes, comments |
| Groups | `/api/groups` | list, create, join, leave, invite |
| Projects | `/api/projects` | list, create, tasks, members |


------------------------------
TEST OUT AT : https://thestudentconnect.netlify.app/
