# Habit Tracker

A minimalist productivity application for tracking habits, managing tasks, and keeping daily notes.

## Features

### Habit Tracking
- Create custom habits with personalized colors and icons
- Track daily completions with a visual calendar
- View streak statistics and completion rates
- Drag-and-drop reordering of habits
- Achievement system that unlocks badges based on your progress

### Daily Journal
- Write daily notes with a rich text editor (bold, italic, underline, links)
- Create daily tasks specific to each date
- View and navigate between dates easily

### Notes
- Create and manage standalone notes
- Rich text formatting support
- Quick access from the sidebar

### Tasks
- Separate task management system
- Mark tasks as complete/incomplete
- Organize your to-dos independently from daily entries

### User Experience
- Light and dark theme support
- Clean, minimalist interface
- Responsive design
- Real-time data synchronization

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **UI Components:** Radix UI, Lucide Icons
- **State Management:** TanStack Query
- **Rich Text:** Tiptap Editor

## Requirements

- Node.js 18+
- Docker and Docker Compose (for local database)

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

```bash
docker-compose up -d
cp .env.example .env
npm run db:push
```

### 3. Run the Application

```bash
npm run dev
```

The app will be available at: http://localhost:5000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run db:push` | Apply schema to database |
| `npm run check` | TypeScript type checking |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | - |
| `PORT` | Server port | 5000 |

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/         # API client and utilities
│   │   └── pages/       # Page components
│   └── public/          # Static assets (favicon, etc.)
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # Database operations
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle database schema
└── script/              # Build scripts
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user and all associated data

### Habits
- `GET /api/users/:userId/habits` - Get user's habits
- `POST /api/users/:userId/habits` - Create a habit
- `PATCH /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit
- `POST /api/habits/:habitId/completions` - Toggle habit completion
- `GET /api/habits/:habitId/completions` - Get completion history

### Daily Entries
- `GET /api/users/:userId/daily/:date` - Get daily entry with tasks
- `PUT /api/users/:userId/daily/:date` - Create/update daily entry
- `POST /api/daily/:entryId/tasks` - Add task to daily entry
- `PATCH /api/daily/tasks/:taskId` - Update daily task
- `DELETE /api/daily/tasks/:taskId` - Delete daily task

### Notes
- `GET /api/users/:userId/notes` - Get user's notes
- `POST /api/users/:userId/notes` - Create a note
- `PATCH /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Tasks
- `GET /api/users/:userId/tasks` - Get user's tasks
- `POST /api/users/:userId/tasks` - Create a task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Database Schema

The application uses the following data models:

- **Users** - User accounts with name and creation date
- **Habits** - Trackable habits with color, icon, and streak count
- **Completions** - Records of habit completions by date
- **Daily Entries** - Journal entries for specific dates
- **Daily Tasks** - Tasks associated with daily entries
- **Notes** - Standalone notes with rich text content
- **Tasks** - Independent task items
