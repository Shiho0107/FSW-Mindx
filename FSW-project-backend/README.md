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
│   ├── Food.js
│   ├── Finance.js
│   ├── Payment.js
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
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Messages
- `GET /api/messages` - Get messages (filter by conversationId via query param)
- `POST /api/messages` - Send message
- `GET /api/messages/:id` - Get single message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation by ID
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Accounts, Activity, Food, Finance, Payments, Stats
- Same CRUD pattern as above

### Health Check
- `GET /api/health` - Server status

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

## API Request Example

```javascript
// Example: Create a student
const response = await fetch('http://localhost:5000/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    class: '10A',
    phone: '+1234567890'
  })
});

const data = await response.json();
console.log(data);
```

## TODO

- [ ] Implement JWT authentication middleware
- [ ] Add password hashing with bcryptjs
- [ ] Implement `/auth/register` and `/auth/login` endpoints
- [ ] Add input validation middleware
- [ ] Add logging middleware
- [ ] Create error handling utilities
- [ ] Add rate limiting
- [ ] Implement file upload for avatars
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Set up unit tests with Jest

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `JWT_SECRET` | Secret for JWT tokens | Any strong string |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

## Troubleshooting

**"Cannot connect to MongoDB"**
- Check your connection string in `.env`
- Verify IP whitelist in MongoDB Atlas (or use 0.0.0.0/0)
- Check your username/password is correct

**"Port 5000 already in use"**
- Change PORT in `.env`
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

**"Module not found"**
- Run `npm install`
- Check file paths in imports

## License

ISC
