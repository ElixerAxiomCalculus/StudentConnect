# StudentConnect — Backend Architecture

## Overview

StudentConnect is a full-stack student collaboration platform. The backend is a **FastAPI** application backed by **MongoDB** (with an in-memory fallback for local development). It exposes a REST + WebSocket API consumed by a React/Vite frontend.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.133 |
| Runtime | Python 3.11+ |
| Primary Database | MongoDB Atlas (via PyMongo) |
| Local Fallback | In-memory store (thread-safe, seeded on startup) |
| Auth | JWT (PyJWT) + bcrypt password hashing |
| Email / OTP | Resend API |
| Realtime | WebSocket (native FastAPI / Starlette) |
| Matching Engine | Cosine similarity on personality + interest vectors |

---

## Directory Structure

```
backend/
├── main.py                     # App factory, CORS, lifespan, router registration
├── requirements.txt
├── .env                        # Runtime secrets (never commit)
├── ARCHITECTURE.md
└── app/
    ├── core/
    │   ├── config.py           # Settings dataclass loaded from .env
    │   ├── datastore.py        # InMemoryStore / MongoStore + Collection abstractions
    │   ├── dependencies.py     # FastAPI dependency injectors (store, user_id, chat_manager)
    │   ├── chat_manager.py     # WebSocket connection manager (per-thread subscriber map)
    │   └── seed_data.py        # Demo users, chats, forums, groups, projects
    ├── models/
    │   └── schemas.py          # Pydantic v2 request/response models
    ├── routes/
    │   ├── auth.py             # POST /api/auth/{register,login,verify-email,resend-otp}, GET /api/auth/me
    │   ├── users.py            # GET /api/users, GET/PUT /api/me
    │   ├── settings.py         # GET/PUT /api/settings/{notifications,privacy,accessibility}
    │   ├── dashboard.py        # GET /api/dashboard/{overview,feed,analytics}
    │   ├── matches.py          # POST questionnaire, GET recommendations/results/summary, POST actions
    │   ├── chat.py             # CRUD chat threads + messages, WS /ws/chat/{thread_id}
    │   ├── forums.py           # Forum threads, categories, votes, comments, replies
    │   ├── groups.py           # Group CRUD, join/leave/invite
    │   ├── projects.py         # Project CRUD, tasks, members
    │   └── health.py           # GET /health
    ├── services/
    │   ├── auth_service.py     # Password hashing, JWT, OTP logic, user registration
    │   ├── user_service.py     # Profile CRUD, settings read/write
    │   ├── dashboard_service.py# Overview aggregation, live feed, analytics
    │   ├── chat_service.py     # Thread + message CRUD, unread counts
    │   ├── forum_service.py    # Thread/comment/reply CRUD, voting, bookmarks
    │   ├── group_service.py    # Group CRUD, membership management
    │   ├── project_service.py  # Project + task CRUD, progress calculation
    │   ├── match_service.py    # Vector-based match scoring, recommendations, actions
    │   ├── scoring_services.py # Compute personality/interest vectors from questionnaire answers
    │   ├── email_service.py    # Send OTP via Resend API
    │   └── common.py           # Shared utilities: IDs, timestamps, user map, activity feed
    └── utils/
        └── vector_utils.py     # Cosine similarity implementation
```

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────┐         ┌──────────────────────────┐
│         users        │         │       connections        │
├──────────────────────┤         ├──────────────────────────┤
│ _id (PK)             │◄───────►│ user_ids[2] (FK × 2)     │
│ name                 │         │ status                   │
│ email                │         │  pending|accepted|       │
│ password_hash        │         │  declined|passed         │
│ email_verified       │         │ initiated_by (FK→users)  │
│ major                │         │ updated_at               │
│ year, semester       │         └──────────────────────────┘
│ avatar, bio, online  │
│ interests[]          │         ┌──────────────────────────┐
│ personality_answers[]│         │       chat_threads       │
│ interest_answers[]   │         ├──────────────────────────┤
│ personality_vector[] │◄───────►│ participant_ids[] (FK)   │
│ interest_vector[]    │         │ type                     │
│ settings{}           │         │  personal|project|       │
│ dashboard{}          │         │  request|group           │
└──────────────────────┘         │ project_id (FK, opt)     │
          │                      │ group_id (FK, opt)       │
          │                      │ title, avatar            │
          │                      │ unread_counts{}          │
          │ 1                    │ pinned_by[], muted_by[]  │
          │                      │ archived_by[]            │
          ▼ N                    │ last_message_preview     │
┌──────────────────────┐         │ last_message_at          │
│    forum_threads     │         └──────────────┬───────────┘
├──────────────────────┤                        │ 1
│ _id (PK)             │                        │
│ category_id (FK)     │                        ▼ N
│ title, body          │         ┌──────────────────────────┐
│ tags[]               │         │      chat_messages       │
│ author_id (FK→users) │         ├──────────────────────────┤
│ created_at           │         │ _id (PK)                 │
│ last_activity        │         │ thread_id (FK)           │
│ upvotes, downvotes   │         │ sender_id (FK→users)     │
│ vote_users{}         │         │ text                     │
│ bookmarked_by[]      │         │ time, status, edited     │
│ follower_ids[]       │         │ attachments[]            │
│ pinned               │         └──────────────────────────┘
│ comments[] (embedded)│
│  └─ replies[]        │         ┌──────────────────────────┐
└──────────┬───────────┘         │         groups           │
           │ N                   ├──────────────────────────┤
           ▼ 1                   │ _id (PK)                 │
┌──────────────────────┐         │ name, description        │
│   forum_categories   │         │ category, visibility     │
├──────────────────────┤         │ tags[]                   │
│ _id (PK)             │         │ owner_id (FK→users)      │
│ name, icon           │         │ members[]                │
└──────────────────────┘         │  {id (FK), role}         │
                                 │ invitee_ids[] (FK)       │
                                 │ request_ids[]            │
┌──────────────────────┐         │ thread_id (FK, opt)      │
│       projects       │         └──────────────────────────┘
├──────────────────────┤
│ _id (PK)             │         ┌──────────────────────────┐
│ project_id (human)   │         │       feed_items         │
│ title, description   │         ├──────────────────────────┤
│ visibility, tags[]   │         │ _id (PK)                 │
│ owner_id (FK→users)  │         │ type  project|forum|group│
│ members[]            │         │ time, title, description │
│  {id (FK), role}     │         │ author_id (FK→users)     │
│ join_requests[]      │         │ tags[], stats{}          │
│ tasks[] (embedded)   │         │ target_id (FK)           │
│  {id, title, status, │         └──────────────────────────┘
│   assignee, deadline}│
│ activity[] (embedded)│
│ progress (0-100)     │
│ thread_id (FK, opt)  │
└──────────────────────┘
```

---

## Collections Reference

### `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | string | Primary key (e.g. `u0`, `u_<hex8>`) |
| `name`, `email` | string | |
| `password_hash` | string | bcrypt hash; empty for seed/demo users |
| `email_verified` | bool | Must be `true` before JWT is issued |
| `major`, `year`, `semester` | string / int | Academic profile |
| `avatar` | string | DiceBear SVG URL |
| `bio`, `online` | string / bool | |
| `interests` | string[] | User-defined tags |
| `personality_answers` | int[20] | Raw questionnaire (1–5 scale) |
| `interest_answers` | int[16] | Raw questionnaire (1–5 scale) |
| `personality_vector` | float[5] | Normalised; 4 answers averaged per dimension |
| `interest_vector` | float[8] | Normalised; 2 answers averaged per dimension |
| `settings` | object | `{notifications, privacy, accessibility}` |
| `dashboard` | object | `{recent_activity[], analytics{}}` |

### `connections`
| Field | Type | Notes |
|---|---|---|
| `user_ids` | string[2] | Always sorted alphabetically |
| `status` | string | `pending \| accepted \| declined \| passed` |
| `initiated_by` | string (FK) | User who sent the request |

### `chat_threads`
| Field | Type | Notes |
|---|---|---|
| `type` | string | `personal \| project \| request \| group` |
| `participant_ids` | string[] | FK → users |
| `project_id` / `group_id` | string (opt) | FK when type matches |
| `unread_counts` | object | `{userId: count}` |
| `pinned_by`, `muted_by`, `archived_by` | string[] | Per-user thread preferences |

### `chat_messages`
| Field | Type | Notes |
|---|---|---|
| `thread_id` | string (FK) | |
| `sender_id` | string (FK) | |
| `status` | string | `delivered \| seen` |
| `attachments` | object[] | `{name, size, type, preview}` |
| `edited` | bool | |

### `forum_threads`
Embeds `comments[]` (each with `replies[]`). Vote state tracked in `vote_users{}` map (`userId → "up"\|"down"`).

### `projects`
Embeds `tasks[]` (each `{id, title, description, status, assignee, deadline}`) and `activity[]` log. `progress` is recalculated on every task mutation as `done_count / total_count * 100`.

### `groups`
| Field | Type | Notes |
|---|---|---|
| `members` | object[] | `{id: FK, role: owner\|member}` |
| `invitee_ids` | string[] | Invited but not yet joined |
| `request_ids` | string[] | Requested but not yet approved |

---

## Authentication Flow

```
Client                          API                           DB
  │                              │                             │
  ├── POST /api/auth/register ──►│ hash password               │
  │                              ├── save user (unverified) ──►│
  │                              ├── generate OTP              │
  │                              ├── store OTP (10 min TTL) ──►│
  │                              └── send email via Resend     │
  │                              │                             │
  ├── POST /api/auth/verify-email►│ check OTP, expiry          │
  │  { email, otp }              ├── mark email_verified ─────►│
  │                              └── issue JWT (7 day) ────────┤
  │◄── { token, user } ─────────┤                             │
  │                              │                             │
  ├── GET /api/* (Bearer token)─►│ decode JWT → user_id        │
  │                              │ (falls back to X-User-Id    │
  │                              │  header, then DEMO_USER_ID) │
```

---

## Matching Algorithm

1. **Questionnaire** — User answers 20 personality questions + 16 interest questions (each 1–5 scale).
2. **Vector computation** (`scoring_services.py`):
   - **Personality vector** (float[5]): every 4 consecutive answers are averaged and normalised to [0, 1].
   - **Interest vector** (float[8]): every 2 consecutive answers are averaged and normalised to [0, 1].
3. **Similarity** (`vector_utils.py`): cosine similarity on each vector pair.
4. **Final score** = `0.55 × interest_similarity + 0.45 × personality_similarity` (interest-weighted).
5. **Common interests**: dimensions where both users score > 0.6 are surfaced as shared interest labels.
6. **Edge cases**: users without completed questionnaires (empty vectors) receive a score of 0 and are sorted to the bottom.

---

## API Surface

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Liveness probe |

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register; sends OTP |
| POST | `/api/auth/verify-email` | None | Verify OTP; returns JWT |
| POST | `/api/auth/resend-otp` | None | Re-send OTP |
| POST | `/api/auth/login` | None | Login; returns JWT |
| GET | `/api/auth/me` | Bearer | Current user from token |

### Users & Profile
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Optional | All users (summary) |
| GET | `/api/me` | User | Full profile |
| PUT | `/api/me` | User | Update profile fields |

### Settings
| Method | Path | Auth | Description |
|---|---|---|---|
| GET / PUT | `/api/settings/notifications` | User | Email/push/in-app toggles |
| GET / PUT | `/api/settings/privacy` | User | Visibility, message/invite permissions |
| GET / PUT | `/api/settings/accessibility` | User | Reduced motion, contrast, text scale |

### Dashboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/overview` | User | Stats + recent activity |
| GET | `/api/dashboard/feed` | None | Live feed (projects, forums, groups) |
| GET | `/api/dashboard/analytics` | User | Charts + collaborators |

### Matches
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/matches/questionnaire` | User | Save answers, recompute vectors |
| GET | `/api/matches/recommendations` | User | Ranked matches (`?limit` `?mode=live`) |
| GET | `/api/matches/results` | User | Same as recommendations |
| POST | `/api/matches/actions` | User | like / pass / accept / decline |
| GET | `/api/matches/summary` | User | Active + pending counts |

### Chat
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/chat/threads` | User | User's thread list |
| POST | `/api/chat/threads` | User | Create thread |
| PATCH | `/api/chat/threads/{id}` | User | Pin / mute / archive |
| GET | `/api/chat/threads/{id}/messages` | User | Message history |
| POST | `/api/chat/threads/{id}/messages` | User | Send message |
| POST | `/api/chat/threads/{id}/read` | User | Mark thread as read |
| WS | `/ws/chat/{id}?user_id=` | None | Real-time message stream |

### Forums
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/forums/categories` | None | Category list with counts |
| GET | `/api/forums/threads` | None | All threads (sorted by activity) |
| GET | `/api/forums/threads/{id}` | None | Single thread with comments |
| POST | `/api/forums/threads` | User | Create thread |
| POST | `/api/forums/threads/{id}/vote` | User | up / down vote |
| POST | `/api/forums/threads/{id}/bookmark` | User | Toggle bookmark |
| POST | `/api/forums/threads/{id}/follow` | User | Toggle follow |
| POST | `/api/forums/threads/{id}/comments` | User | Add comment |
| POST | `/api/forums/threads/{id}/comments/{cid}/vote` | User | Vote on comment |
| POST | `/api/forums/threads/{id}/comments/{cid}/replies` | User | Add reply |

### Groups
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/groups` | User | All groups with membership status |
| POST | `/api/groups` | User | Create group |
| POST | `/api/groups/{id}/join` | User | Join group |
| POST | `/api/groups/{id}/leave` | User | Leave group |
| POST | `/api/groups/{id}/invite` | None | Invite user by ID |

### Projects
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | None | All projects |
| GET | `/api/projects/{id}` | None | Single project |
| POST | `/api/projects` | User | Create project |
| POST | `/api/projects/join` | User | Request join by public project_id |
| POST | `/api/projects/{id}/invite` | None | Invite user by ID or query |
| POST | `/api/projects/{id}/tasks` | User | Add task |
| PATCH | `/api/projects/{id}/tasks/{tid}` | None | Update task |
| DELETE | `/api/projects/{id}/tasks/{tid}` | None | Delete task |
| DELETE | `/api/projects/{id}/members/{mid}` | None | Remove member |

---

## Configuration (`.env`)

```env
APP_NAME=StudentConnect API
USE_IN_MEMORY_DB=false          # true → in-memory seed data, no MongoDB needed
MONGO_URL=mongodb+srv://...      # Atlas connection string
MONGO_DB_NAME=student_similarity
DEMO_USER_ID=u0                  # Fallback user when no token present
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=<change-in-production>
RESEND_OTP=re_<key>              # Resend API key; unset → OTP printed to stdout
```

---

## Starting the Server

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive docs available at `http://localhost:8000/docs`.
