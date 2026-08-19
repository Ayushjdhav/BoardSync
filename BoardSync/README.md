# BoardSync

Node.js and Express backend API service.

## Features
- **Express.js** application with ES Modules (`import`/`export`)
- **Environment Configuration**: Powered by `dotenv`
- **Clean Folder Architecture**:
  - `/src/routes`: API route definitions
  - `/src/controllers`: Request handling logic
  - `/src/middleware`: Custom error handling and 404 middleware
- **Development Tools**: `nodemon` for auto-restart on file changes
- **Health Check Endpoint**: `GET /api/health`

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`.

### 4. Run in Production
```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| `GET` | `/` | API Welcome message | No | `{ "message": "...", "healthCheck": "..." }` |
| `GET` | `/api/health` | Health check endpoint | No | `{ "status": "ok" }` |
| `POST` | `/api/auth/signup` | Register a new user | No | `{ "success": true, "data": { "user": ... } }` |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | No | `{ "success": true, "data": { "token": "...", "user": ... } }` |
| `GET` | `/api/auth/me` | Get authenticated user profile | **Yes (Bearer Token)** | `{ "success": true, "data": { "_id": "...", "name": "...", "email": "..." } }` |
| `GET` | `/api/users` | List all registered users | No | `{ "success": true, "count": N, "data": [...] }` |

## Automated Tests

Run the Jest and Supertest suite:

```bash
npm test
```

Tests use MongoDB Memory Server and do not connect to the database configured in `.env`.


