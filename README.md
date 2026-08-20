# CIJS — Class Information & Job System

CIJS (Class Information & Job System) is a modern full-stack web application designed for comprehensive school management and communication. It provides robust school administration tools, role-based dashboards, event/schedule tracking, real-time chat, and detailed statistics.

The repository is structured into two main packages:
- **`FSW-project-backend`**: A Node.js/Express REST API and Socket.io server integrated with MongoDB Atlas.
- **`FSW-project-frontend`**: A React single-page application built on Vite and React Router v7, styled using custom Sass.

---

## Key Features

- 🔐 **Role-Based Access Control**: Customized layout and endpoint permissions for **Admin**, **Teacher**, and **Student** roles.
- ⚡ **Real-Time Communication**: Socket.io real-time chat supporting both 1-on-1 direct messaging and group conversation rooms.
- 💬 **Advanced Chat Interactions**: Live typing indicators ("is typing..."), active/online user tracking, and message read-status mapping.
- 📅 **Personalized Class Calendars**: Interactively view scheduled classes and events filtered automatically for the logged-in student or teacher.
- 👥 **Scoped Contact Scoping**: Messaging contact lists dynamically filtered to restrict communication options to classmate, student-teacher, or administrator relations.
- 👥 **Student & Teacher Registry**: Full CRUD support for student profiles (grades, parent details, attendance rates) and teacher directories.
- 📊 **Dashboard & Absence Reporting**: Summary metrics and an interactive student absence logs tracker.
- ⚙️ **User Profiles & History**: Edit account details (name, email, password hashing) and review student/teacher class attendance history.
- 🛠️ **Generic CRUD Backend Factory**: Clean backend design utilizing Mongoose schemas and a reusable factory controller to automate endpoints for models like Students, Teachers, Accounts, Events, Activities, Foods, Stats, and Payments.

---

## Technology Stack

### Backend
- **Runtime & Framework**: Node.js & Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Real-Time Engine**: Socket.io
- **Security & Auth**: JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Environment**: dotenv

### Frontend
- **Framework & Bundler**: React 19 (JavaScript) & Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors for authentication
- **Styling**: Sass (Syntactically Awesome Style Sheets)
- **Notifications**: React Toastify
- **Icons**: Lucide React
- **Real-Time Client**: Socket.io-client

---

## Directory Structure

```
FSW-Mindx/
├── FSW-project-backend/         # Node.js/Express API Server
│   ├── server.js                # Main server entrypoint & socket configuration
│   ├── models/                  # Mongoose Schemas (Account, Student, Teacher, Event, etc.)
│   ├── controllers/             # Business Logic & Generic CRUD Controller
│   ├── routes/                  # API endpoints (Auth, Students, Teachers, Messages, etc.)
│   ├── .env.example             # Backend environment template
│   └── package.json             # Backend dependencies
│
└── FSW-project-frontend/        # Vite + React Client App
    ├── src/
    │   ├── api/                 # Axios configuration and API wrappers
    │   ├── components/          # Reusable UI controls and Layout elements
    │   ├── context/             # React Context Providers (Auth context)
    │   ├── hooks/               # Custom hooks (e.g. Socket integration)
    │   ├── pages/               # Route pages (Dashboard, Messages, Students, etc.)
    │   └── styles/              # Global styles & Sass configurations
    │   ├── App.jsx              # Main App routing configuration
    │   └── main.jsx             # Entry React DOM mount
    ├── .env.example             # Frontend environment template
    └── package.json             # Frontend dependencies
```

---

## Setup & Installation

### 1. Prerequisites
- **Node.js** 16+ and **npm** installed.
- **MongoDB Atlas** account (or local MongoDB database).

---

### 2. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd FSW-project-backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and fill in your connection secrets:
   ```bash
   cp .env.example .env
   ```
   Modify `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/cijs-db?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the Backend Server**:
   - **Development mode** (runs with Node `--watch` for auto-reload):
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```
   The backend server will launch at `http://localhost:5000`.

---

### 3. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd FSW-project-frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
   Modify `.env` to connect to your backend:
   ```env
   VITE_BASE_URL=http://localhost:5000/api
   VITE_API_KEY=your-api-key
   ```

4. **Run Vite Development Server**:
   ```bash
   npm run dev
   ```
   The client application will run at `http://localhost:5173`.

---

## Demo Administrator Login

To log in and test all administrative features:
- **Email**: `admin@school.com`
- **Password**: `admin123`

---

## API Endpoints List

### Authentication
- `POST /api/auth/login` — Login user and issue JWT token
- `GET /api/auth/me` — Verify current user session

### Core Resources (CRUD via Generic Controllers)
- **Students**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` under `/api/students`
- **Teachers**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` under `/api/teachers`
- **Accounts**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` under `/api/accounts`
- **Events**: `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` under `/api/events`

### Real-Time Chat & Messages
- `/api/conversations` — Retrieve or create conversations
- `/api/messages` — Fetch and send messages in conversations

### Additional Models
- `/api/activities`, `/api/food`, `/api/finance`, `/api/payments`, `/api/stats`, `/api/groups`

---

## License

ISC License.
