# Store Rating and Management Platform

A modern full-stack web application designed for multi-tier store rating, performance analytics, and store directory administration. Built with **React 19, Vite, Tailwind CSS v4, TypeScript, Express.js, Prisma ORM, and PostgreSQL**.

---

## Application Screenshots Preview

| Admin Analytics Dashboard | Users Directory & Management |
| :---: | :---: |
| ![Admin Analytics Dashboard](./rolex/Screenshot%202026-09-03%20194122.png) | ![Users Management Table](./rolex/Screenshot%202026-09-03%20194134.png) |
| *Real-time KPI metrics, Leaderboard & Distribution* | *Filterable user management & role control* |

| Stores Directory & Rating Management |
| :---: |
| ![Stores Management Table](./rolex/Screenshot%202026-09-03%20194143.png) |
| *Store directory, search, rating visualization, and details modal* |

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Application Screenshots Preview](#application-screenshots-preview)
3. [User Roles & Key Features](#user-roles--key-features)
4. [Technology Stack](#technology-stack)
5. [Folder Structure](#folder-structure)
6. [Business Rules & Form Validations](#business-rules--form-validations)
7. [Prerequisites](#prerequisites)
8. [Step-by-Step Local Setup](#step-by-step-local-setup)
   - [1. Clone Repository](#1-clone-repository)
   - [2. Backend Setup & Configuration](#2-backend-setup--configuration)
   - [3. Database Migration & Seeding](#3-database-migration--seeding)
   - [4. Frontend Setup & Configuration](#4-frontend-setup--configuration)
   - [5. Running the Application](#5-running-the-application)
9. [Demo Login Credentials](#demo-login-credentials)
10. [API Endpoints Reference](#api-endpoints-reference)
11. [Available NPM Scripts](#available-npm-scripts)

---

## Project Overview

The **Store Rating and Management Platform** allows users to discover local businesses, submit ratings, and manage their listings under a role-based access control (RBAC) architecture:

- **System Administrators** oversee all registered stores, users, and ratings; override published ratings; register new businesses; and remove stores.
- **Store Owners** access a dedicated executive dashboard to track their store's rating metrics, score distribution, and detailed customer reviews.
- **Customers / Normal Users** can browse registered stores, search with debounced filters, sort by name or rating, and submit or update their ratings (1 to 5 stars).

---

## User Roles & Key Features

### 1. System Administrator (`ADMIN`)

![Admin Analytics Dashboard](./rolex/Screenshot%202026-09-03%20194122.png)

- **Executive Analytics Dashboard**:
  - Live metric cards: Total Registered Users (broken down by role), Total Stores, Total Rating Submissions, and Overall Average Platform Rating.
  - Top-Rated Stores Leaderboard with direct link to store management.
  - Rating Distribution visualizer (5-to-1 Star breakdown percentage).
  - Recent Registrations activity feed with role badges.

![Stores Management Interface](./rolex/Screenshot%202026-09-03%20194143.png)

- **Store Management**:
  - Filterable and sortable table of all stores (by name, email, and address).
  - **Store Information Modal**: Click any store to open a comprehensive details modal showing store ID, email, address, total reviews, published score, and assigned owner details.
  - **Rating Override**: Modify any store's rating (1.0 to 5.0 stars with exact decimal precision).
  - **Store Deletion**: Remove a store with automatic cascade deletion of its associated customer reviews.
  - **Add Store**: Register new stores with name, email, address, and assign an eligible store owner.

![Users Management Interface](./rolex/Screenshot%202026-09-03%20194134.png)

- **User Management**:
  - Filterable table of all registered accounts (by name, email, address, and role).
  - Add new users with any system role (`ADMIN`, `STORE_OWNER`, `USER`).

---

### 2. Store Owner (`STORE_OWNER`)
- **Store Performance Dashboard**:
  - Store identity card with copyable business credentials (`[Copy]` / `[Copied!]`).
  - 4 Key Performance Indicators: Average Rating, Total Reviews, Satisfaction Index (4+ Star %), and Milestone Progress.
  - Interactive Rating Distribution progress bars showing the breakdown of 5, 4, 3, 2, and 1-star reviews.
  - Customer Feedback Feed: Live search reviews by customer name/email, filter by specific star tier (All, 5-Star, 4-Star...), and switch between Card View and Table View.

---

### 3. Normal User / Customer (`USER`)
- **Stores Directory**:
  - Searchable list of stores with real-time debounced query support.
  - Sort by Store Name, Address, and Average Rating.
  - Unbreakable star rating display badges.
  - **Rate Store Modal**: Submit a rating (1 to 5 stars) or update an existing rating with instant feedback.
- **Account Settings**:
  - Update password with security validation.

---

## Technology Stack

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 & custom glassmorphism utilities
- **Routing**: React Router v7
- **HTTP Client**: Axios with JWT interceptors & automatic 401 handling
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (TypeScript)
- **ORM**: Prisma ORM v6
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Development Tooling**: `tsx` (TypeScript Execution with Hot Reload)

---

## Folder Structure

```
Roxil_assignment/
├── rolex/                          # Application Screenshots & Media Assets
│   ├── Screenshot 2026-09-03 194122.png   # Admin Dashboard Overview
│   ├── Screenshot 2026-09-03 194134.png   # User Management Interface
│   └── Screenshot 2026-09-03 194143.png   # Store Directory & Management Table
│
├── client/                         # Frontend React Application
│   ├── src/
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── DataTable.tsx       # Generic sortable table component
│   │   │   ├── FilterBar.tsx       # Search and multi-filter input bar
│   │   │   ├── FormInput.tsx       # Validated form text input
│   │   │   ├── FormSelect.tsx      # Form dropdown component
│   │   │   ├── Modal.tsx           # Accessible backdrop modal dialog
│   │   │   ├── Navbar.tsx          # Responsive top navigation header
│   │   │   ├── Skeleton.tsx        # Skeleton loaders for table & cards
│   │   │   ├── StarRating.tsx      # Unbreakable, non-wrapping 5-star rating UI
│   │   │   └── StatCard.tsx        # Text-driven KPI card with trends & tags
│   │   ├── context/                # React Context Providers
│   │   │   ├── AuthContext.tsx     # Authentication state & persistent login
│   │   │   └── ToastContext.tsx    # Toast notification system
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   └── useDebounce.ts      # Debounce hook for instant search
│   │   ├── pages/                  # Route Page Components
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx   # Admin analytics & operational pulse
│   │   │   │   ├── Stores.tsx      # Admin store manager with Details & Rating modal
│   │   │   │   └── Users.tsx       # Admin user management & registration
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx       # User login page
│   │   │   │   └── Register.tsx    # Customer registration page
│   │   │   ├── storeOwner/
│   │   │   │   └── Dashboard.tsx   # Store owner performance dashboard
│   │   │   ├── user/
│   │   │   │   └── StoresList.tsx  # Customer store browsing & rating interface
│   │   │   └── NotFound.tsx        # 404 error page
│   │   ├── services/
│   │   │   └── api.ts              # Centralized Axios API service layer
│   │   ├── types/
│   │   │   └── index.ts            # Shared TypeScript interfaces & types
│   │   ├── utils/
│   │   │   └── formatters.ts       # Store name formatter & utility functions
│   │   ├── App.tsx                 # Root layout & route configuration
│   │   ├── index.css               # Global CSS & Tailwind design system
│   │   └── main.tsx                # Client entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                         # Backend Express Application
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma database schema definition
│   │   └── seed.ts                 # Database seeder (200+ stores & realistic ratings)
│   ├── src/
│   │   ├── controllers/            # Route Controllers
│   │   │   ├── adminController.ts  # Admin operations (stats, stores, users, ratings)
│   │   │   ├── authController.ts   # Authentication (register, login, password)
│   │   │   ├── storeOwnerController.ts # Store owner dashboard & metrics
│   │   │   └── userController.ts   # Customer store listings & rating submissions
│   │   ├── middleware/             # Express Middlewares
│   │   │   ├── auth.ts             # JWT authentication token verification
│   │   │   └── roleAuth.ts         # Role-based access authorization guard
│   │   ├── routes/                 # Express API Routes
│   │   │   ├── adminRoutes.ts      # /api/admin/*
│   │   │   ├── authRoutes.ts       # /api/auth/*
│   │   │   ├── storeOwnerRoutes.ts # /api/store-owner/*
│   │   │   └── userRoutes.ts       # /api/user/*
│   │   ├── utils/
│   │   │   └── validators.ts       # Backend data validation rules
│   │   ├── app.ts                  # Express app initialization & middleware
│   │   └── server.ts               # Server startup listener
│   ├── .env.example                # Example backend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                    # Root package.json for project-level scripts
└── README.md                       # Complete project documentation
```

---

## Business Rules & Form Validations

| Field | Validation Rule | Description |
|---|---|---|
| **User Name** | `20 - 60 characters` | Full name requirement for all registered accounts |
| **Store Name** | `20 - 60 characters` | Distinct store name |
| **Email Address** | Standard RFC 5322 regex | Must be a valid email format and unique per user |
| **Password** | `8 - 16 characters` | Must contain at least **1 uppercase letter** and **1 special character** |
| **Address** | Max `400 characters` | Physical street address |
| **Rating Score** | `1 - 5 (Integer or Decimal)` | Rating scale between 1 and 5 stars |
| **Store Owner Relation** | `1 : 1` | Each Store Owner can only be assigned to a single store |

---

## Prerequisites

Before running this project, ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (bundled with Node.js)
- **PostgreSQL**: v14.0 or higher running locally or hosted on the cloud (e.g., Supabase, Neon, Railway)

---

## Step-by-Step Local Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Roxil_assignment
```

---

### 2. Backend Setup & Configuration

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update the variables in `server/.env` with your PostgreSQL database details:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/roxil_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   CORS_ORIGIN="http://localhost:3000"
   ```

---

### 3. Database Migration & Seeding

1. Generate Prisma Client and apply database migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

2. Seed the database with sample administrators, store owners, 200+ stores, and realistic ratings:
   ```bash
   npm run seed
   ```

---

### 4. Frontend Setup & Configuration

1. Open a new terminal tab and navigate to the `client/` directory:
   ```bash
   cd ../client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure client environment:
   Create a `.env` file in the `client/` folder if using a non-default backend port:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

### 5. Running the Application

You can run both client and server independently or via root scripts.

#### Option A: Running independently in separate terminals

- **Backend (Terminal 1)**:
  ```bash
  cd server
  npm run dev
  ```
  *Server starts at `http://localhost:5000`*

- **Frontend (Terminal 2)**:
  ```bash
  cd client
  npm run dev
  ```
  *Client starts at `http://localhost:3000` or `http://localhost:5173`*

#### Option B: Running from the root directory

```bash
# Start backend from root
npm run dev:server

# Start frontend from root (in a separate terminal)
npm run dev:client
```

Open your browser and navigate to **`http://localhost:3000`** (or the port Vite outputs).

---

## Demo Login Credentials

The seed script creates the following ready-to-use demo accounts:

| Role | Email | Password | Assigned Store / Access |
|---|---|---|---|
| **System Administrator** | `admin@roxil.com` | `Admin@1234` | Full platform admin access |
| **Store Owner** | `storeowner@roxil.com` | `Store@1234` | Owns **"Roxil Flagship Store"** |
| **Customer (Normal User)** | `user@roxil.com` | `User@1234` | Store directory & rating submission |
| **Customer 1 (Seeded)** | `customer1@example.com` | `Password@1234` | Standard rating user |
| **Store Owner 1 (Seeded)** | `storeowner1@roxilshops.com` | `Password@1234` | Owns **"Apex Coffee #1"** |

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new normal user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `PUT` | `/api/auth/password` | Update current user password | Yes |

### Administrator (`/api/admin`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Get total users, stores, and ratings metrics | `ADMIN` |
| `GET` | `/api/admin/stores` | Get all stores with sorting and filters | `ADMIN` |
| `POST` | `/api/admin/stores` | Register a new store and assign an owner | `ADMIN` |
| `PUT` | `/api/admin/stores/:id/rating` | Override / edit a store's rating (1-5) | `ADMIN` |
| `DELETE` | `/api/admin/stores/:id` | Remove a store and delete its reviews | `ADMIN` |
| `GET` | `/api/admin/users` | Get all users with sorting and filters | `ADMIN` |
| `POST` | `/api/admin/users` | Create a user with specified role | `ADMIN` |
| `GET` | `/api/admin/users/:id` | Get specific user details & owned store | `ADMIN` |

### Customer / User (`/api/user`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/user/stores` | Get all stores (with user's own rating) | `USER` |
| `POST` | `/api/user/ratings` | Submit a rating for a store (1 to 5) | `USER` |
| `PUT` | `/api/user/ratings` | Update an existing rating for a store | `USER` |
| `GET` | `/api/user/users` | Get user list for directory lookup | `USER` |

### Store Owner (`/api/store-owner`)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/store-owner/dashboard` | Get store metrics and raters list | `STORE_OWNER` |
| `GET` | `/api/store-owner/average-rating`| Get store's average rating calculation | `STORE_OWNER` |

---

## Available NPM Scripts

### Root Directory
- `npm run dev:server` - Starts the backend server in watch mode
- `npm run dev:client` - Starts the frontend Vite development server
- `npm run build` - Builds both backend and frontend for production
- `npm run prisma:generate` - Generates the Prisma client
- `npm run prisma:migrate` - Applies Prisma database migrations

### Server Directory (`cd server`)
- `npm run dev` - Starts server using `tsx watch`
- `npm run build` - Compiles TypeScript to `dist/`
- `npm run start` - Runs the compiled production server (`node dist/server.js`)
- `npm run seed` - Runs `prisma/seed.ts` database seeder
- `npm run prisma:migrate` - Runs migrations against PostgreSQL

### Client Directory (`cd client`)
- `npm run dev` - Starts Vite dev server
- `npm run build` - Runs `tsc -b` and builds production bundle
- `npm run preview` - Previews production build locally
