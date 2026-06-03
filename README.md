# StoreRate — Full Stack Rating Platform

A full-stack web application for rating stores, built with:
- **Backend**: Express.js + PostgreSQL
- **Frontend**: React.js

---

## 📋 Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) v16+
- [PostgreSQL](https://www.postgresql.org/) v13+
- npm v8+

---

## 🗄️ Database Setup

### 1. Create the database

Open your PostgreSQL shell (`psql`) and run:

```sql
CREATE DATABASE store_rating_db;
```

### 2. Run the schema

```bash
psql -U postgres -d store_rating_db -f backend/src/config/schema.sql
```

> This creates all tables, indexes, triggers, and the default admin user.

**Default Admin Credentials:**
- Email: `admin@storerating.com`
- Password: `Admin@1234`

---

## ⚙️ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` and fill in your database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: **http://localhost:5000**

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

The `.env` file should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🚀 Quick Start (Both at once)

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm install && npm start
```

Then open **http://localhost:3000** in your browser.

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **Admin** | Dashboard stats, manage users & stores |
| **Normal User** | Browse stores, submit/modify ratings |
| **Store Owner** | View store performance & ratings received |

---

## 🔐 Authentication

- JWT-based authentication
- Tokens stored in localStorage
- Role-based route protection

---

## 📝 Form Validation Rules

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Email | Standard email format |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special character |
| Address | Max 400 characters |
| Rating | Integer 1–5 |

---

## 🛠️ API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/password` | Update password |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get stats |
| GET | `/api/admin/users` | List all users (filterable) |
| GET | `/api/admin/users/:id` | Get user details |
| POST | `/api/admin/users` | Create user |
| GET | `/api/admin/stores` | List all stores (filterable) |
| POST | `/api/admin/stores` | Create store |

### Stores (requires user role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List stores with user ratings |
| POST | `/api/stores/:id/ratings` | Submit/update rating |

### Store Owner (requires store_owner role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/dashboard` | Get store dashboard |

---

## 📁 Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection
│   │   │   └── schema.sql        # Database schema
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── storeController.js
│   │   │   └── ownerController.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authentication
│   │   │   └── validate.js       # Input validation
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── stores.js
│   │   │   └── owner.js
│   │   └── index.js              # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js    # Auth state management
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── ChangePassword.js
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.js
    │   │   │   ├── AdminUsers.js
    │   │   │   └── AdminStores.js
    │   │   ├── user/
    │   │   │   └── UserDashboard.js
    │   │   └── owner/
    │   │       └── OwnerDashboard.js
    │   ├── components/
    │   │   └── common/
    │   │       └── Layout.js     # Sidebar layout
    │   ├── utils/
    │   │   └── api.js            # Axios instance
    │   ├── App.js                # Routes & role-based redirects
    │   ├── index.js
    │   └── index.css             # Global styles & design system
    ├── .env.example
    └── package.json
```

---

## 🐛 Troubleshooting

**Cannot connect to database:**
- Ensure PostgreSQL is running: `pg_ctl status` or check Services
- Verify credentials in `backend/.env`
- Make sure `store_rating_db` database exists

**CORS errors:**
- Ensure backend is running on port 5000
- Check that `REACT_APP_API_URL` in frontend `.env` points to the correct backend URL

**Port already in use:**
- Backend: Change `PORT` in `backend/.env`
- Frontend: React will prompt to use another port automatically
