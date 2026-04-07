# StudentConnect Backend Architecture

## Overview

StudentConnect is a student collaboration platform powered by a **FastAPI** backend with **MongoDB** (or in-memory store for development) and a **React/Vite** frontend.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.133 |
| Database | MongoDB (Atlas) / In-Memory (dev) |
| Auth | JWT (PyJWT) + bcrypt + OTP via Resend API |
| Real-Time | WebSocket (Starlette) |
| ML/Matching | Cosine similarity on personality + interest vectors |
| Email | Resend API |

---

## Project Structure

```
backend/
├── main.py                          # FastAPI app entry point, CORS, lifespan
├── requirements.txt
├── app/
│   ├── core/
│   │   ├── config.py                # Environment settings (Pydantic Settings)
│   │   ├── datastore.py             # InMemoryStore / MongoStore abstractions
│   │   ├── dependencies.py          # FastAPI dependency injectors
│   │   ├── chat_manager.py          # WebSocket connection manager
│   │   └── seed_data.py             # Demo seed data for development
│   ├── models/
│   │   └── schemas.py               # Pydantic request/response models
│   ├── routes/
│   │   ├── auth.py                  # /api/auth/*
│   │   ├── users.py                 # /api/users, /api/me
│   │   ├── settings.py              # /api/settings/*
│   │   ├── dashboard.py             # /api/dashboard/*
│   │   ├── matches.py               # /api/matches/*
│   │   ├── questionnaire.py         # /api/questionnaire
│   │   ├── chat.py                  # /api/chat/*, /ws/chat/*
│   │   ├── forums.py                # /api/forums/*
│   │   ├── groups.py                # /api/groups/*
│   │   ├── projects.py              # /api/projects/*
│   │   └── health.py                # /health
│   ├── services/
│   │   ├── auth_service.py          # Password hashing, JWT, OTP logic
│   │   ├── user_service.py          # User CRUD, settings
│   │   ├── dashboard_service.py     # Overview, feed, analytics aggregation
│   │   ├── chat_service.py          # Chat threads & messages
│   │   ├── forum_service.py         # Forum CRUD + voting
│   │   ├── group_service.py         # Group CRUD + membership
│   │   ├── project_service.py       # Project CRUD + tasks + members
│   │   ├── match_service.py         # Matching algorithm + actions
│   │   ├── questionnaire_service.py # Onboarding questionnaire → ML vectors
│   │   ├── scoring_services.py      # personality_vector + interest_vector
│   │   ├── email_service.py         # Resend API OTP emails
│   │   └── common.py                # Shared helpers (user_map, new_id, etc.)
│   └── utils/
│       └── vector_utils.py          # Cosine similarity
```

---

## User Data Model

```json
{
  "_id": "u_<hex>",
  "name": "string",
  "email": "string",
  "password_hash": "bcrypt hash",
  "email_verified": true,
  "questionnaire_completed": true,

  "major": "string",
  "year": 1,
  "year_label": "Freshman",
  "semester": 5,
  "college": "string",
  "department": "string",
  "bio": "string",
  "github": "string",
  "linkedin": "string",
  "avatar": "DiceBear URL",
  "online": false,

  "interests": ["Web Development", "AI/ML"],
  "skills_offer": ["Web Dev", "AI / ML"],
  "skills_seek": ["UI / UX", "Data Science"],
  "goals": ["Startup / Product", "Hackathons"],
  "availability_days": ["Mon", "Tue", "Wed"],
  "availability_hours": ["Evening", "Night Owl"],
  "project_tags": ["Long-term", "Remote only"],
  "team_size": "3–4",
  "weekly_commitment": "6–8 hrs/week",
  "match_type": "Complementary Skills",

  "personality_vector": [0.75, 0.50, 0.80, 0.60, 0.70],
  "interest_vector": [0.90, 0.40, 0.20, 0.70, 0.50, 0.30, 0.80, 0.35],

  "settings": {
    "notifications": { "email": {}, "push": {}, "inApp": {} },
    "privacy": { "profile_visible": true, "allow_messages_from_anyone": true, "allow_project_invites": true },
    "accessibility": { "reduced_motion": false, "high_contrast": false, "text_scale": 100 }
  },
  "dashboard": { "recent_activity": [], "analytics": {} },
  "created_at": "ISO8601"
}
```

---

## API Endpoints

### Authentication — `/api/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new account (sends OTP) | None |
| POST | `/api/auth/verify-email` | Verify OTP → returns JWT + user | None |
| POST | `/api/auth/resend-otp` | Resend OTP to email | None |
| POST | `/api/auth/login` | Login → returns JWT + user | None |
| GET | `/api/auth/me` | Get current session user | Bearer JWT |

All auth responses include `questionnaire_completed` flag used by frontend routing guards.

### Users — `/api`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | List all users (public summaries) | Bearer JWT |
| GET | `/api/me` | Get full current user profile | Bearer JWT |
| PUT | `/api/me` | Update profile (name, bio, skills, goals, links, etc.) | Bearer JWT |

### Questionnaire — `/api/questionnaire`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/questionnaire` | Submit onboarding questionnaire, compute ML vectors | Bearer JWT |
| GET | `/api/questionnaire/status` | Check if questionnaire is completed | Bearer JWT |

**POST `/api/questionnaire` payload:**
```json
{
  "profile": {
    "first_name": "string", "last_name": "string",
    "college": "string", "department": "string",
    "year": 1, "year_label": "Freshman",
    "github": "string", "linkedin": "string",
    "interests": ["string"], "bio": "string"
  },
  "personality": {
    "q1": 0, "q2": 0, "q3": 2, "q4": 40.0,
    "q5": 0, "q6": 0, "q7": 0, "q8": 0, "q9": 0
  },
  "preferences": {
    "skills_offer": ["Web Dev"], "skills_seek": ["UI / UX"],
    "goals": ["Hackathons"],
    "availability_days": ["Mon", "Wed"], "availability_hours": ["Evening"],
    "project_tags": ["Long-term"],
    "team_size": "3–4", "weekly_commitment": "6–8 hrs/week",
    "match_type": "Complementary Skills"
  }
}
```

**Response:**
```json
{
  "questionnaire_completed": true,
  "personality_vector": [0.75, 0.50, 0.80, 0.60, 0.70],
  "interest_vector": [0.90, 0.40, 0.20, 0.70, 0.50, 0.30, 0.80, 0.35]
}
```

### Settings — `/api/settings`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/settings/notifications` | Get notification preferences | Bearer JWT |
| PUT | `/api/settings/notifications` | Update notification preferences | Bearer JWT |
| GET | `/api/settings/privacy` | Get privacy settings | Bearer JWT |
| PUT | `/api/settings/privacy` | Update privacy settings | Bearer JWT |
| GET | `/api/settings/accessibility` | Get accessibility settings | Bearer JWT |
| PUT | `/api/settings/accessibility` | Update accessibility settings | Bearer JWT |

### Dashboard — `/api/dashboard`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard/overview` | Stats: matches, projects, deadlines, activity | Bearer JWT |
| GET | `/api/dashboard/feed` | Live feed items (projects + forums) | Bearer JWT |
| GET | `/api/dashboard/analytics` | Collaborators + user analytics data | Bearer JWT |

### Matches — `/api/matches`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/matches/recommendations` | Sorted match recommendations | Bearer JWT |
| GET | `/api/matches/results` | Same as recommendations (default limit=6) | Bearer JWT |
| POST | `/api/matches/actions` | Record like/pass/accept/decline action | Bearer JWT |
| POST | `/api/matches/questionnaire` | Update personality/interest vectors directly | Bearer JWT |
| GET | `/api/matches/summary` | Active matches + pending requests count | Bearer JWT |

### Chat — `/api/chat` + `/ws/chat`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/chat/threads` | List threads for current user | Bearer JWT |
| POST | `/api/chat/threads` | Create thread (personal/group/project/request) | Bearer JWT |
| PATCH | `/api/chat/threads/{id}` | Pin, mute, or archive thread | Bearer JWT |
| POST | `/api/chat/threads/{id}/read` | Mark thread as read | Bearer JWT |
| GET | `/api/chat/threads/{id}/messages` | Get message history | Bearer JWT |
| POST | `/api/chat/threads/{id}/messages` | Send a message | Bearer JWT |
| WS | `/ws/chat/{threadId}?user_id=X` | Real-time WebSocket connection | user_id param |

### Forums — `/api/forums`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/forums/categories` | List categories | Bearer JWT |
| GET | `/api/forums/threads` | List threads | Bearer JWT |
| POST | `/api/forums/threads` | Create thread | Bearer JWT |
| GET | `/api/forums/threads/{id}` | Get thread + comments | Bearer JWT |
| POST | `/api/forums/threads/{id}/vote` | Upvote/downvote thread | Bearer JWT |
| POST | `/api/forums/threads/{id}/bookmark` | Toggle bookmark | Bearer JWT |
| POST | `/api/forums/threads/{id}/follow` | Toggle follow | Bearer JWT |
| POST | `/api/forums/threads/{id}/comments` | Add comment | Bearer JWT |
| POST | `/api/forums/threads/{id}/comments/{cid}/vote` | Vote on comment | Bearer JWT |
| POST | `/api/forums/threads/{id}/comments/{cid}/replies` | Reply to comment | Bearer JWT |

### Groups — `/api/groups`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/groups` | List all groups | Bearer JWT |
| POST | `/api/groups` | Create group | Bearer JWT |
| POST | `/api/groups/{id}/join` | Join a public group | Bearer JWT |
| POST | `/api/groups/{id}/leave` | Leave group | Bearer JWT |
| POST | `/api/groups/{id}/invite` | Invite user to group | Bearer JWT |

### Projects — `/api/projects`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/projects` | List user's projects | Bearer JWT |
| POST | `/api/projects` | Create project | Bearer JWT |
| GET | `/api/projects/{id}` | Get project detail | Bearer JWT |
| POST | `/api/projects/join` | Request to join project | Bearer JWT |
| POST | `/api/projects/{id}/invite` | Invite user to project | Bearer JWT |
| POST | `/api/projects/{id}/tasks` | Create task | Bearer JWT |
| PATCH | `/api/projects/{id}/tasks/{tid}` | Update task status/details | Bearer JWT |
| DELETE | `/api/projects/{id}/tasks/{tid}` | Delete task | Bearer JWT |
| DELETE | `/api/projects/{id}/members/{mid}` | Remove member | Bearer JWT |

---

## Authentication Flow

```
Register → OTP sent via email
  → POST /api/auth/verify-email → JWT issued
  → questionnaire_completed = false  (new user)
  → Frontend redirects to /questionnaire

Complete questionnaire → POST /api/questionnaire
  → questionnaire_completed = true
  → Frontend redirects to /dashboard
  → First-time tour shown (localStorage flag: sc_tour_done)

Login (existing user)
  → POST /api/auth/login → JWT issued
  → questionnaire_completed included in response
  → If false → /questionnaire, else → /dashboard
```

---

## Matching Algorithm

1. User answers 9 personality questions (0–3 or 0–4 scale, slider 0–100) + preference selections in onboarding
2. `questionnaire_service.build_personality_vector()` maps to 20-value list (1–5 scale) across 5 semantic dimensions:
   - Social/energy, Planning/pressure, Team dynamics, Role/communication, Summary blend
3. `compute_personality_vector()` averages groups of 4 → 5-value normalized [0,1] vector
4. `questionnaire_service.build_interest_vector()` maps selected skills/goals to 16-value list → 8 interest categories
5. `compute_interest_vector()` averages pairs → 8-value normalized [0,1] vector
6. Match score = `0.55 × cosine_similarity(interest) + 0.45 × cosine_similarity(personality)`
7. Results sorted descending by score

---

## Database Collections

| Collection | Description |
|---|---|
| `users` | User profiles, settings, ML vectors, questionnaire data |
| `connections` | Match connections (pending/accepted/declined/passed) |
| `chat_threads` | Chat conversations (personal/group/project/request) |
| `chat_messages` | Messages within threads |
| `forum_categories` | Forum categories |
| `forum_threads` | Forum posts with embedded comments + replies |
| `projects` | Projects with embedded tasks, members, activity log |
| `groups` | Groups with member roster + invitations |
| `feed_items` | Live feed entries for dashboard |
| `otp_codes` | OTP codes with 10-minute TTL |

---

## Environment Variables

```env
# Database
MONGO_URL=mongodb+srv://...
MONGO_DB_NAME=studentconnect
USE_IN_MEMORY_DB=true          # true for dev, false for production

# Auth
JWT_SECRET=your-secret-key

# Email (OTP)
RESEND_API_KEY=re_...

# CORS
FRONTEND_ORIGINS=http://localhost:5173,https://your-domain.com

# App
APP_NAME=StudentConnect
```

---

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive API docs: `http://localhost:8000/docs`

---

## Frontend Integration Notes

- All API calls use `Authorization: Bearer <jwt>` header
- WebSocket connects to `ws://localhost:8000/ws/chat/{threadId}?user_id={userId}`
- Frontend base URL configured via `VITE_API_BASE_URL` (defaults to `http://localhost:8000`)
- Auth flow uses `localStorage` key `sc_token` for JWT persistence
- Dashboard tour completion stored in `localStorage` key `sc_tour_done`
