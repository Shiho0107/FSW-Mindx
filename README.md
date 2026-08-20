# CIJS Backend Server

A Node.js/Express backend server with MongoDB Atlas integration for the CIJS (Class Information & Job System) project.

## Features

- ✅ Express.js server
- ✅ MongoDB Atlas integration with Mongoose
- ✅ RESTful API for all resources (Students, Teachers, Events, Accounts, Messages, etc.)
- ✅ CORS enabled for frontend communication
- ✅ Generic CRUD controller pattern
- ✅ Environment configuration
- ✅ Error handling middleware

## Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env                       # Environment variables (local)
├── .env.example               # Environment variables template
├── models/                    # Mongoose schemas
│   ├── Student.js
│   ├── Teacher.js
│   ├── Event.js
│   ├── Account.js
│   ├── Message.js
│   ├── Conversation.js
│   ├── Activity.js
│   └── Stat.js
├── controllers/               # Business logic
│   ├── crudController.js      # Generic CRUD controller
│   ├── studentController.js
│   ├── teacherController.js
│   ├── messageController.js
│   └── ...
├── routes/                    # API routes
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── messageRoutes.js
│   └── ...
├── middleware/                # Custom middleware (TODO)
└── utils/                     # Utility functions (TODO)
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student by ID
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher by ID
- `DELETE /api/teachers/:id` - Delete teacher

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event


## Setup Instructions

### 1. Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account

### 2. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or log in
3. Create a new cluster (M0 free tier)
4. Create a database user with a strong password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string: `mongodb+srv://username:password@cluster-name.mongodb.net/dbname`

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster-name.mongodb.net/cijs-db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

### 5. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## Connect Frontend to Backend

Update your frontend `.env` file:

```env
VITE_API_KEY=your-api-key
VITE_BASE_URL=http://localhost:5000/api
```

## Admin acount

admin@school.com
admin123


## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `JWT_SECRET` | Secret for JWT tokens | Any strong string |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |


## License

ISC
