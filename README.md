# NEXTEST — Student Online Test Portal

> **Prepare. Attempt. Progress.**

NEXTEST is a modern, student-facing digital examination and assessment platform built strictly in accordance with collegiate technology requirements:
- **Frontend**: **React 18** powered by **Vite** with a distinct, premium visual identity (Midnight Navy, Deep Indigo, Rich Violet, Electric Lavender, Teal, and Warm Amber).
- **Backend**: Plain **Node.js** using the built-in `http` module exclusively — strictly **no Express.js, Fastify, or other frameworks**.
- **Database**: **MongoDB** connected using the official `mongodb` Node.js driver — strictly **no Mongoose or other ODMs**.
- **Database Inspection**: Managed and inspected directly via **MongoDB Compass**.

---

## 1. Project Purpose & Highlights

NEXTEST provides college students with a focused, reliable, and distraction-free examination portal. It replaces paper assessments and bloated commercial learning platforms with a lightweight, secure architecture where examination timers and scoring remain authoritative on the server.

### Core Features:
- **Student Authentication**: Secure registration with email normalization, password confirmation, bcrypt password hashing, and HTTP-only session cookies.
- **Personalized Student Dashboard**: Welcome greeting, real-time stat cards (available tests, upcoming tests, completed attempts, average score percentage), active test resumption alert, and circular SVG score progress gauge.
- **Examination Catalogue**: Filterable by subject categories (Data Structures, Database Systems, Computer Networks, Programming Fundamentals) and searchable by test title or code.
- **Scheduled Timetable & Upcoming Tests**: Department-scheduled tests display scheduled opening dates and locked indicators. The backend strictly rejects early attempts before opening timestamps.
- **Detailed Examination Instructions**: Pre-test rules, total marks, question count, duration, passing threshold, and confirmation modal before the official countdown starts.
- **Active Examination Engine**:
  - One-question-at-a-time focus view.
  - Interactive radio option selection with instant visual feedback.
  - **Live Autosave**: Responses are persisted automatically to MongoDB upon selection.
  - **Authoritative Countdown Timer**: Server-calculated deadline survives page reloads without resetting.
  - **Warning States**: Amber highlight when time is under 5 minutes; pulsing red alert when under 1 minute.
  - **Question Navigator**: Palette grid displaying answered (teal), active (violet ring), and unanswered (subtle border) questions with quick-jump capability.
  - **Submission Confirmation**: Pre-submission dialog detailing answered vs. unanswered counts.
  - **Automatic Timeout Finalization**: Automatic lock and evaluation when the official timer hits zero.
- **Instant Server-Side Results**:
  - Zero browser-supplied scoring; all marks are calculated securely on the Node.js backend.
  - Correct, incorrect, and unanswered counters.
  - Circular SVG score gauge and pass/fail status indicator.
  - Question-by-question review with correct choices highlighted and conceptual explanations.
- **Academic Attempt History**: Complete transcript of all past attempts, dates, time taken, marks, and view-result actions.
- **Student Profile**: Account identity, registration timestamp, academic performance summary, and inline name editing.

---

## 2. Technology Stack & Minimal Dependencies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18 | Declarative component UI, hooks, responsive states |
| **Frontend Tooling** | Vite 6 | Development server and production bundling |
| **Frontend Icons** | `lucide-react` | Clean, lightweight modern icons |
| **Backend Server** | Plain Node.js (`http` module) | Built-in HTTP server, custom URL routing, CORS, security headers |
| **Database Driver**| `mongodb` (v6.x) | Official MongoDB Node.js driver (direct MongoClient, no ODM) |
| **Password Security**| `bcryptjs` (v2.x) | Salted, non-reversible password hashing |
| **Environment** | `dotenv` (v16.x) | Configuration loader for `.env` variables |
| **DB Management** | MongoDB Compass | Graphical inspection of collections, indexes, and documents |

### Why Minimal Dependencies?
To adhere strictly to college guidelines, external frameworks like Express, Fastify, and Mongoose were completely excluded. All routing, JSON request body parsing, cookie management, session verification, rate limiting, and security headers are implemented natively with Node.js built-ins.

---

## 3. Folder Structure

```
NEXTEST/
├── client/                     # React Frontend
│   ├── index.html              # HTML entry with Plus Jakarta Sans & JetBrains Mono
│   ├── package.json            # React + Vite configuration
│   ├── vite.config.js          # Vite config with /api proxy to localhost:5001
│   └── src/
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Top-level view router and authentication protection
│       ├── context/
│       │   └── AuthContext.jsx # Student session, login, register, logout provider
│       ├── components/
│       │   ├── Navbar.jsx      # Branded wordmark, navigation, student badge
│       │   ├── Footer.jsx      # Academic portal footer and architectural tags
│       │   ├── StatCard.jsx    # Metric card with color accents
│       │   ├── TestCard.jsx    # Assessment card with duration, marks, actions
│       │   ├── CountdownTimer.jsx # Server-synchronized countdown with urgent pulses
│       │   ├── QuestionNavigator.jsx # Grid palette for question jumping
│       │   ├── ScoreRing.jsx   # SVG circular progress score gauge
│       │   ├── Modal.jsx       # Accessible modal dialog
│       │   └── Alert.jsx       # Error, success, and warning notices
│       ├── pages/
│       │   ├── LandingPage.jsx         # Hero, interactive dashboard preview, 3-step guide
│       │   ├── LoginPage.jsx           # Student sign-in form with validation
│       │   ├── RegisterPage.jsx        # Registration form with password confirmation
│       │   ├── DashboardPage.jsx       # Student dashboard with real metrics
│       │   ├── AvailableTestsPage.jsx  # Search & subject-filtered test catalogue
│       │   ├── UpcomingTestsPage.jsx   # Scheduled future examinations
│       │   ├── TestInstructionsPage.jsx# Pre-exam guidelines and start modal
│       │   ├── TestTakingPage.jsx      # Core examination engine with autosave
│       │   ├── ResultsPage.jsx         # Final score report & question review
│       │   ├── AttemptHistoryPage.jsx  # Past attempts transcript table
│       │   └── ProfilePage.jsx         # Account settings and name update
│       ├── services/
│       │   └── api.js          # Centralized fetch wrapper with credentials
│       └── styles/
│           ├── theme.css       # Design tokens (Midnight, Indigo, Violet, Teal, Amber)
│           └── index.css       # Resets and typography
├── server/                     # Plain Node.js HTTP Backend
│   ├── package.json            # Node backend configuration
│   ├── .env                    # Active backend environment variables
│   ├── .env.example            # Environment template
│   ├── src/
│   │   ├── server.js           # Built-in http.createServer entry point
│   │   ├── config.js           # Configuration loader
│   │   ├── db.js               # MongoClient connection & index creation
│   │   ├── http/
│   │   │   ├── router.js       # Custom HTTP router with parameter & query parsing
│   │   │   ├── request.js      # Cookie parsing & bounded JSON body parsing
│   │   │   ├── response.js     # JSON response helpers, Set-Cookie, security headers
│   │   │   └── middleware.js   # Session authentication & sliding rate limiter
│   │   ├── services/
│   │   │   ├── authService.js      # Register, login, session creation, logout
│   │   │   ├── studentService.js   # Student profile & name updates
│   │   │   ├── testService.js      # Available & upcoming tests, question sanitization
│   │   │   ├── attemptService.js   # Start, resume, autosave, submit, history
│   │   │   └── scoringService.js   # Server-side grading & pass/fail calculations
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth/* endpoints
│   │   │   ├── studentRoutes.js    # /api/students/* endpoints
│   │   │   ├── testRoutes.js       # /api/tests/* endpoints
│   │   │   ├── attemptRoutes.js    # /api/attempts/* & /api/dashboard
│   │   │   └── healthRoutes.js     # /api/health endpoint
│   │   └── seed/
│   │       ├── seedData.js         # Single source of truth for test schedules & questions
│   │       └── seed.js             # Idempotent seeding script
│   └── tests/
│       ├── backend.test.js     # Scoring, bcrypt hashing, sanitization unit tests
│       ├── e2e.test.js         # HTTP router, CORS, validation, auth guard tests
│       └── db_flow.test.js     # Complete examination lifecycle flow verification
├── package.json                # Root automation scripts
├── .env                        # Root environment configuration
├── .env.example                # Root environment template
├── .gitignore                  # Git exclusions
└── README.md                   # Complete implementation documentation
```

---

## 4. Required Software & Prerequisites

Before running the application, verify that your machine has the following tools installed:

1. **Node.js**: Version 18.0.0 or later (tested on v26.10.0).
2. **npm**: Version 9.0.0 or later (tested on v11.19.1).
3. **MongoDB Server**:
   - A local MongoDB instance (`brew install mongodb-community`), OR
   - A free MongoDB Atlas cluster connection string (`mongodb+srv://...`).
4. **MongoDB Compass**: Graphical desktop client for database inspection.

### Checking Node.js and npm:
Open your terminal and run:
```bash
node -v
npm -v
```

---

## 5. Starting & Connecting MongoDB

> **Important Technical Note**: MongoDB Compass is a graphical database management client, **not** a standalone database server. The application requires an active MongoDB database server.

You can connect NEXTEST to either a local MongoDB server or a remote MongoDB Atlas database:

### Option A: Local MongoDB Community Edition (Recommended for Mac)
If Homebrew is installed on your Mac:
```bash
# 1. Tap the official MongoDB Homebrew repository
brew tap mongodb/brew

# 2. Install MongoDB Community server
brew install mongodb-community

# 3. Start the MongoDB background service
brew services start mongodb-community
```
Verify it is running:
```bash
brew services list
```
The local connection URI will be:
```
mongodb://127.0.0.1:27017/nextest
```

### Option B: Free Cloud MongoDB Atlas
If you do not want to install MongoDB locally:
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster.
3. Under **Network Access**, add `0.0.0.0/0` (or your current IP).
4. Under **Database Access**, create a database user with password.
5. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/nextest?retryWrites=true&w=majority
   ```
6. Paste this URI into your `.env` file as `MONGODB_URI`.

---

## 6. How to Connect & Inspect via MongoDB Compass

1. Open the **MongoDB Compass** desktop application on your computer.
2. In the **New Connection** screen, paste your connection string:
   - For local: `mongodb://127.0.0.1:27017`
   - For Atlas: `mongodb+srv://<username>:<password>@cluster0.mongodb.net`
3. Click **Connect**.
4. In the left sidebar, click on the **`nextest`** database (it is created automatically upon seeding or first registration).
5. You will see four collections:
   - **`students`**: Contains registered student documents with normalized emails and bcrypt `passwordHash` fields.
   - **`tests`**: Contains examination documents with syllabus codes (`DS-201`, `DBMS-301`, `CN-401`, `PF-101`), scheduled opening/closing dates, instructions, and questions.
   - **`attempts`**: Contains each student's exam attempt records, authoritative `deadline` timestamps, real-time `savedResponses`, final calculated `score`, `percentage`, `correctCount`, and post-submission breakdown.
   - **`sessions`**: Contains active session crypto tokens linked to student IDs with TTL expiration.

---

## 7. Environment Configuration (`.env`)

The project includes pre-configured `.env` and `.env.example` files:

```ini
# Server Port (default 5001)
PORT=5001

# Node Environment
NODE_ENV=development

# MongoDB Connection URI (Local or Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/nextest

# Database Name
DB_NAME=nextest

# Unguessable Session Key for cookie verification
SESSION_SECRET=nextest_super_secure_session_secret_change_in_production_key_32bytes

# Allowed CORS Origin (Vite client URL)
CORS_ORIGIN=http://localhost:5173
```

### Environment Variable Explanations:
- `PORT`: TCP port where the plain Node.js HTTP server listens (default `5001`).
- `NODE_ENV`: Runtime mode (`development` or `production`).
- `MONGODB_URI`: Complete connection URI passed directly to the official `MongoClient`.
- `DB_NAME`: Database namespace (`nextest`).
- `SESSION_SECRET`: Cryptographic secret string for securing session cookies.
- `CORS_ORIGIN`: Allowed origin for browser API requests (`http://localhost:5173`).

---

## 8. Installation & Setup Commands

All dependencies are already installed in your workspace. If you ever need to re-install:

```bash
# From the root NEXTEST directory:
npm run install:all
```
Or install in each directory individually:
```bash
cd server && npm install
cd ../client && npm install
```

---

## 9. Database Seeding

Populate the database with university-grade examinations (Data Structures, Database Systems, Computer Networks, and Programming Fundamentals):

```bash
npm run seed
```
Output:
```
[Seed] Starting NEXTEST database seeding...
[Database] Connected successfully to MongoDB: nextest
[Database] Indexes verified and ensured.
  + Inserted test: DS-201 - "Data Structures & Algorithms" (Data Structures)
  + Inserted test: DBMS-301 - "Database Management Systems" (Database Systems)
  + Inserted test: CN-401 - "Computer Networks & Protocols" (Computer Networks)
  + Inserted test: PF-101 - "Programming Fundamentals & Logic" (Programming Fundamentals)

[Seed] Complete: 4 tests inserted/updated.
[Seed] All test schedules and questions successfully synchronized in MongoDB.
```

> **Idempotent Guarantee**: Running `npm run seed` repeatedly is completely safe. It updates test questions and schedules without creating duplicate exams, deleting student accounts, or wiping out previous student attempt records.

---

## 10. Starting the Application

Open two terminal tabs in the `NEXTEST` directory:

### Terminal 1: Start the Backend Server
```bash
npm run start:server
```
*The Node.js HTTP server will start on `http://localhost:5001`.*

### Terminal 2: Start the React Frontend
```bash
npm run start:client
```
*The Vite development server will start on `http://localhost:5173`.*

---

## 11. Application URLs

- **Frontend Student Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend HTTP API**: [http://localhost:5001](http://localhost:5001)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 12. Complete Step-by-Step Student Walkthrough

1. **Visit Landing Page**:
   - Open [http://localhost:5173](http://localhost:5173).
   - Review the brand tagline ("Prepare. Attempt. Progress."), feature cards, and interactive dashboard preview.
2. **Register a Student Account**:
   - Click **Get Started** or **Register**.
   - Enter Full Name (e.g. `Maya Lin`), Email (`maya@college.edu`), and Password (min 6 characters).
   - Confirm password and submit. The server hashes the password with bcrypt, stores the record in MongoDB, issues an HTTP-only cookie, and navigates to the personalized dashboard.
3. **Explore Dashboard**:
   - Note the personalized greeting ("Welcome back, Maya").
   - Review the 4 stat cards, academic accuracy gauge, featured test card, upcoming schedule list, and attempt history table.
4. **Browse Available Tests**:
   - Click **Available Tests** in the navigation bar.
   - Use the search bar to filter by name (`Data Structures`) or click category pills (`Database Systems`, `Programming Fundamentals`).
5. **Read Test Instructions**:
   - Click **Start Assessment** on `Data Structures & Algorithms`.
   - Review the 25-minute duration, 6 MCQs, 30 total marks, and examination rules.
   - Click **I Agree & Begin Examination**.
   - A modal prompt confirms you are ready to start your timer. Click **Start Examination**.
6. **Take the Examination**:
   - The test interface opens with the official countdown timer ticking.
   - Click option choices for Question 1. Notice the **Saved ✓** indicator confirms real-time database persistence.
   - Navigate with **Next** and **Previous** or jump directly using the **Question Navigator** palette on the right.
   - Try refreshing the page in your browser (`Cmd + R`): the attempt resumes seamlessly at the current question with all saved choices restored and the timer locked to the authoritative deadline.
7. **Submit & Review Results**:
   - Click **Submit Exam**.
   - A modal displays total questions, answered questions, and any unanswered questions.
   - Click **Confirm Final Submission**.
   - The Results page immediately loads with your official marks, percentage, Pass/Fail badge, and correct/incorrect breakdown.
   - Expand questions to review which questions were correct or incorrect, along with conceptual explanations.
8. **Check History & Profile**:
   - Click **My History** in the navigation bar to see the persistent transcript record.
   - Click your student avatar to view your profile, where you can edit your name and review overall statistics.
   - Click **Sign Out** to terminate your session.

---

## 13. Updating Seed Examination Schedules

All demonstration schedules and questions are maintained in a single file:
[`server/src/seed/seedData.js`](file:///Users/heenakhilnani/Documents/NEXTEST/server/src/seed/seedData.js)

To adjust test schedules:
- To make a test **Available**: Ensure `startTime` is set in the past and `endTime` is in the future.
- To make a test **Upcoming**: Set `startTime` to a future date (e.g., `now + 3 * ONE_DAY_MS`).
- To change duration: Modify `durationMinutes: 30`.

After modifying the file, simply re-run:
```bash
npm run seed
```

---

## 14. Testing & Verification Commands

NEXTEST includes an automated test suite verifying 32 distinct assertions across unit, HTTP integration, and multi-step examination flows:

```bash
# Run all tests
npm test

# Run individual test suites:
npm run test:unit  # Unit tests: scoring, bcrypt hashing, sanitization
npm run test:e2e   # HTTP server: router, CORS, validation, security headers
npm run test:flow  # Lifecycle flow: registration, attempt, autosave, scoring
```

### Frontend Production Build Check:
```bash
npm run build:client
```
*Builds production assets to `client/dist/` in under 1 second.*

---

## 15. Security & Academic Integrity Measures

1. **Server-Side Scoring**:
   The student's browser is never trusted with scoring calculations. Correct options (`correctOptionId`) and explanations are stripped from question payloads during active tests.
2. **Server-Authoritative Deadlines**:
   The attempt deadline is locked on the server (`deadline = startTime + durationMinutes * 60000`). Local computer clocks or browser manipulations cannot extend time.
3. **HTTP-Only Cookies**:
   Authentication tokens are stored in `HttpOnly`, `SameSite=Lax` cookies, preventing XSS attacks from reading tokens. Passwords and tokens are never kept in `localStorage`.
4. **Duplicate Submission Lock**:
   Attempts are finalized atomically using `$set: { status: 'submitted' }`. Once finalized, further submissions or answer modifications are strictly rejected with HTTP 400.
5. **Rate Limiting**:
   Sliding in-memory rate limiting protects `/api/auth/register` and `/api/auth/login` from brute-force dictionary attacks.
6. **Cross-Student Resource Isolation**:
   Every query for attempt saves, results, and profiles filters by the authenticated student's unique `_id`. Students cannot read or write another student's data.
7. **HTTP Security Headers**:
   Includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 16. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`connect ECONNREFUSED 127.0.0.1:27017`** | MongoDB server is not running locally. | Run `brew services start mongodb-community` or set a free MongoDB Atlas URI in `.env`. Note: MongoDB Compass alone is a client, not the server. |
| **`EADDRINUSE: address already in use :::5000`** | Port 5000 is occupied by another process. | Change `PORT=5001` in `.env` (and update the target port in `client/vite.config.js`). |
| **"Session expired or invalid"** | Cookies disabled or expired. | Sign in again through the login page to generate a fresh 24-hour session. |
| **"Payload too large" (HTTP 413)** | Request body exceeds the 1MB safety limit. | Submit standard JSON payloads within the 1MB threshold. |

---

## 17. License

Academic Project. Built for collegiate demonstration and evaluation purposes.
