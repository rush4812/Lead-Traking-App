# LeadFlow — Full-Stack Leads Tracking Application

A modern, robust, full-stack **Leads Tracking Web Application** designed for sales teams to capture inquiries, qualify prospective clients, track communication notes, and filter leads across pipeline stages.

Built with **Node.js**, **Express.js**, **SQLite (`better-sqlite3`)**, and **React (Vite)**.

---

## 📑 Table of Contents
1. [Project Overview & Architecture](#-project-overview--architecture)
2. [Tech Stack](#-tech-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Database Schema & Design](#-database-schema--design)
5. [Installation & Getting Started](#-installation--getting-started)
6. [Database Seeding](#-database-seeding)
7. [API Documentation & cURL Examples](#-api-documentation--curl-examples)
8. [Validation & Security](#-validation--security)
9. [Error Handling & HTTP Status Codes](#-error-handling--http-status-codes)
10. [Automated API Testing](#-automated-api-testing)
11. [Git & GitHub Commands Guide](#-git--github-commands-guide)
12. [Interview FAQ & Technical Explanations](#-interview-faq--technical-explanations)

---

## 🏛 Project Overview & Architecture

LeadFlow follows a clean, decoupled 3-tier architecture:

```
[ React Client (Vite + Modern UI) ]
                │
                ▼ (HTTP Requests: JSON / Query Params)
[ Express.js REST API Router ]
                │
                ▼ (Input Validation & Error Middleware)
[ Controllers & Query Service ]
                │
                ▼ (Parameterized SQL Queries)
[ SQLite Database (leads.db) ]
```

### Key Highlights:
- **Zero-Config Database**: Uses embedded SQLite with `better-sqlite3`, requiring no separate database server or Docker container.
- **Relational Integrity**: Enforces Foreign Keys (`PRAGMA foreign_keys = ON`) with `ON DELETE CASCADE` so notes are automatically deleted when a parent lead is removed.
- **Resilient API**: Full input validation, status whitelisting, email regex checks, and centralized JSON error handling.
- **Responsive React UI**: Instant search by name/email, live status filtering, timeline notes viewer, and optimistic modals.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose / Rationale |
| :--- | :--- | :--- |
| **Backend Runtime** | **Node.js** (v18+) | Fast asynchronous I/O and unified JavaScript ecosystem. |
| **Web Framework** | **Express.js** | Minimalist, robust routing and middleware orchestration. |
| **Database** | **SQLite** (`better-sqlite3`) | High-performance, synchronous, zero-latency embedded SQL engine. |
| **Frontend Framework** | **React** (v18+) | Declarative, component-driven UI with reactive state management. |
| **Build Tool** | **Vite** | Blazing-fast hot module replacement (HMR) and optimized production bundles. |
| **Icons & Styling** | **Lucide Icons** & **Vanilla CSS** | Modern aesthetic with glassmorphism, responsive cards, and clean typography. |

---

## 📁 Project Directory Structure

```
Lead Tracking App/
├── package.json                  # Root scripts (unified start/seed/test)
├── .gitignore                    # Prevents node_modules, .env, and .db files from Git
├── README.md                     # Comprehensive technical documentation
│
├── backend/                      # Express.js REST API Server
│   ├── package.json              # Backend dependencies
│   ├── test_api.js               # 19 automated integration test suites
│   └── src/
│       ├── app.js                # Express app initialization & middleware
│       ├── db/
│       │   ├── database.js       # SQLite connection, schema & pragma setup
│       │   ├── seed.js           # Realistic test data generator
│       │   └── leads.db          # SQLite database file (auto-generated)
│       ├── controllers/
│       │   ├── leadController.js # Lead CRUD & search/filter business logic
│       │   └── noteController.js # Notes retrieval & creation logic
│       ├── routes/
│       │   └── leadRoutes.js     # REST endpoint routing definitions
│       ├── validators/
│       │   ├── leadValidator.js  # Email format, status enum & field sanitizers
│       │   └── noteValidator.js  # Note content validator
│       └── middleware/
│           └── errorHandler.js   # 404 and global JSON error handler
│
└── frontend/                     # React Single Page Application (Vite)
    ├── package.json              # Frontend dependencies
    ├── index.html                # SEO-optimized HTML entry point
    ├── vite.config.js            # Vite configuration
    └── src/
        ├── main.jsx              # DOM rendering root
        ├── App.jsx               # Main state coordinator & view switcher
        ├── index.css             # Unified modern stylesheet
        ├── components/
        │   ├── Navbar.jsx        # App header & brand
        │   ├── StatusBadge.jsx   # Color-coded badge for new/contacted/qualified/lost
        │   ├── LeadModal.jsx     # Create & Edit lead modal with validation
        │   └── DeleteConfirmModal.jsx # Confirmation dialog for safe deletion
        ├── pages/
        │   ├── LeadsListPage.jsx # Stats cards, search, status filter & table
        │   └── LeadDetailPage.jsx# Lead profile & Activity Notes timeline
        └── services/
            └── api.js            # Centralized fetch wrapper for backend API
```

---

## 🗄 Database Schema & Design

### 1. `leads` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each lead |
| `name` | `TEXT` | `NOT NULL` | Full name of the contact |
| `email` | `TEXT` | `NOT NULL` | Email address (indexed for quick lookup) |
| `phone` | `TEXT` | `NOT NULL` | Contact phone number |
| `status` | `TEXT` | `CHECK(status IN ('new', 'contacted', 'qualified', 'lost'))` | Current lifecycle stage |
| `createdAt` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Record timestamp |

### 2. `notes` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each note |
| `leadId` | `INTEGER` | `NOT NULL`, `FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE` | Parent lead reference |
| `content` | `TEXT` | `NOT NULL` | Meeting notes, call logs, or updates |
| `createdAt` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Note timestamp |

### Relational Design Decisions:
1. **One-to-Many Relationship**: One lead can have multiple chronological notes.
2. **`ON DELETE CASCADE`**: When a lead is deleted, SQLite automatically deletes all associated notes, preventing orphaned records.
3. **Database Indexes**: Added indexes on `leads(email)`, `leads(status)`, and `notes(leadId)` for $O(1)$/$O(\log N)$ lookup performance.

---

## 🚀 Installation & Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd "Lead Tracking App"
```

### 2. Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run Backend Server
```bash
cd backend
npm run dev
```
> The API server will start on: **`http://localhost:5000`**

### 4. Run Frontend Development Server
In a separate terminal window:
```bash
cd frontend
npm run dev
```
> The React application will start on: **`http://localhost:5173`**

---

## 🌱 Database Seeding

To populate your database with realistic sample leads and activity notes, run:
```bash
cd backend
npm run seed
```

This creates 4 sample leads across all status stages (`new`, `contacted`, `qualified`, `lost`) along with activity notes.

---

## 📡 API Documentation & cURL Examples

### Base URL: `http://localhost:5000/api`

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `200 OK`
```bash
curl http://localhost:5000/api/health
```

---

### 2. Get All Leads (with Search & Status Filters)
- **Endpoint**: `GET /api/leads`
- **Query Parameters**:
  - `search` *(optional)*: Search query matching name or email (`?search=rahul`)
  - `status` *(optional)*: Filter by status (`?status=qualified`)
- **Response**: `200 OK`
```bash
# Fetch all leads
curl http://localhost:5000/api/leads

# Search leads by name or email
curl "http://localhost:5000/api/leads?search=rahul"

# Filter by status
curl "http://localhost:5000/api/leads?status=qualified"

# Combined search and filter
curl "http://localhost:5000/api/leads?search=amit&status=qualified"
```

---

### 3. Create a New Lead
- **Endpoint**: `POST /api/leads`
- **Headers**: `Content-Type: application/json`
- **Response**: `201 Created`
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Patel",
    "email": "rahul@gmail.com",
    "phone": "9876543210",
    "status": "new"
  }'
```

---

### 4. Get a Single Lead (with Notes)
- **Endpoint**: `GET /api/leads/:id`
- **Response**: `200 OK` (or `404 Not Found`)
```bash
curl http://localhost:5000/api/leads/1
```

---

### 5. Update a Lead (Partial Update)
- **Endpoint**: `PATCH /api/leads/:id`
- **Headers**: `Content-Type: application/json`
- **Response**: `200 OK` (or `404 Not Found`)
```bash
curl -X PATCH http://localhost:5000/api/leads/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified"
  }'
```

---

### 6. Delete a Lead
- **Endpoint**: `DELETE /api/leads/:id`
- **Response**: `200 OK` (or `404 Not Found`)
```bash
curl -X DELETE http://localhost:5000/api/leads/1
```

---

### 7. Get All Notes for a Lead
- **Endpoint**: `GET /api/leads/:id/notes`
- **Response**: `200 OK` (or `404 Not Found`)
```bash
curl http://localhost:5000/api/leads/1/notes
```

---

### 8. Add a Note to a Lead
- **Endpoint**: `POST /api/leads/:id/notes`
- **Headers**: `Content-Type: application/json`
- **Response**: `201 Created` (or `404 Not Found` if lead doesn't exist)
```bash
curl -X POST http://localhost:5000/api/leads/1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Customer requested detailed quotation and trial setup."
  }'
```

---

## 🛡 Validation & Security

1. **Email Format Validation**: Tested against RFC-compliant regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
2. **Status Whitelist**: Strictly restricted to `'new' | 'contacted' | 'qualified' | 'lost'`. Any other value returns `400 Bad Request`.
3. **Empty String Protection**: All strings are trimmed; whitespace-only inputs are rejected.
4. **SQL Injection Prevention**: 100% of database queries use parameterized SQL (`?` placeholders). No user strings are concatenated into SQL queries.
5. **Parent Entity Existence Verification**: Attempting to add a note to a non-existent `leadId` is intercepted and rejected with `404 Not Found`.

---

## 🚦 Error Handling & HTTP Status Codes

All API errors return a standard JSON structure:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Invalid email format. Please provide a valid email address."]
}
```

| HTTP Status | Name | Usage in LeadFlow |
| :--- | :--- | :--- |
| **`200`** | **OK** | Successful `GET`, `PATCH`, and `DELETE` requests. |
| **`201`** | **Created** | Successfully created a new Lead or Note. |
| **`400`** | **Bad Request** | Invalid input, missing required fields, malformed email, or empty note. |
| **`404`** | **Not Found** | Requested lead ID does not exist or endpoint does not exist. |
| **`500`** | **Internal Server Error** | Unexpected server or database exception handled gracefully. |

---

## 🧪 Automated API Testing

A complete automated test suite is included in `backend/test_api.js`. It runs 19 automated tests covering all CRUD endpoints, filters, validations, and edge cases.

To execute the test suite:
```bash
cd backend
node test_api.js
```

### Test Coverage Checklist:
- [x] `GET /api/health`
- [x] `GET /api/leads` (All records)
- [x] `GET /api/leads?search=rahul` (Search by name)
- [x] `GET /api/leads?search=priya@gmail.com` (Search by email)
- [x] `GET /api/leads?status=qualified` (Filter by status)
- [x] `POST /api/leads` (Valid creation $\rightarrow$ 201)
- [x] `POST /api/leads` (Invalid email $\rightarrow$ 400)
- [x] `POST /api/leads` (Missing name $\rightarrow$ 400)
- [x] `POST /api/leads` (Invalid status $\rightarrow$ 400)
- [x] `GET /api/leads/:id` (Single record with notes)
- [x] `GET /api/leads/999999` (Non-existent ID $\rightarrow$ 404)
- [x] `PATCH /api/leads/:id` (Partial update $\rightarrow$ 200)
- [x] `POST /api/leads/:id/notes` (Valid note creation $\rightarrow$ 201)
- [x] `POST /api/leads/:id/notes` (Empty note $\rightarrow$ 400)
- [x] `POST /api/leads/999999/notes` (Non-existent lead $\rightarrow$ 404)
- [x] `GET /api/leads/:id/notes` (Fetch notes array)
- [x] `DELETE /api/leads/:id` (Delete lead $\rightarrow$ 200)
- [x] Cascade Delete Verification (Notes deleted with parent lead)
- [x] `DELETE /api/leads/999999` (Non-existent lead $\rightarrow$ 404)

---

## 📦 Git & GitHub Commands Guide

When preparing your submission repository, follow these standard Git commands:

```bash
# 1. Initialize a new Git repository
git init

# 2. Check untracked files (verify node_modules and .db files are ignored)
git status

# 3. Stage all project files
git add .

# 4. Create your first commit
git commit -m "feat: complete full-stack leads tracking app with Express, SQLite, and React"

# 5. Rename default branch to main
git branch -M main

# 6. Link your local repo to your GitHub repository
git remote add origin https://github.com/<your-username>/leads-tracking-app.git

# 7. Push your code to GitHub
git push -u origin main
```

---

## 🎯 Interview FAQ & Technical Explanations

### 1. "Why did you use SQLite?"
> *"I used SQLite because it is lightweight, zero-configuration, and stores the database in a local file without requiring a separate database server. In Node.js, `better-sqlite3` provides fast, synchronous execution with zero network latency, making it ideal for developer evaluations, embedded applications, and lightweight CRM tools."*

### 2. "How did you implement the Lead $\rightarrow$ Notes relationship?"
> *"We implemented a One-to-Many relational schema where the `notes` table stores a `leadId` foreign key referencing `leads.id`. In SQLite, we enabled foreign keys using `PRAGMA foreign_keys = ON;` and defined `ON DELETE CASCADE`. When a lead is deleted, all attached notes are automatically deleted, ensuring database consistency."*

### 3. "Why did you choose `PATCH` over `PUT`?"
> *"In REST principles, `PUT` is meant to replace an entire entity, requiring all fields to be supplied. `PATCH` is designed for partial updates. For leads, users frequently change only the status (e.g. from 'new' to 'contacted') without re-entering their name, email, and phone, so `PATCH` is the semantically correct and efficient choice."*

### 4. "How do you protect against SQL injection?"
> *"Every SQL query uses prepared statements and parameterized placeholders (`?`). User inputs are never concatenated directly into SQL strings, allowing the SQLite engine to treat input values strictly as data rather than executable code."*

### 5. "Why do you validate on the backend if the frontend already has validation?"
> *"Frontend validation improves user experience with instant feedback, but it can easily be bypassed using tools like Postman, curl, or custom scripts. Backend validation is the true line of defense to guarantee data integrity, security, and schema correctness before saving to the database."*

---

## 📄 License
This project is licensed under the ISC License.
