# Implementation Plan - BoardSync (Node.js + Express Backend Setup)

Set up a modular, clean Node.js and Express backend project called **BoardSync** with environment-based configuration, modern ES module syntax, clean layered folder structure (`routes`, `controllers`, `middleware`), health check route, and `nodemon` for auto-reloading during development.

---

## Proposed Project Structure

```
BoardSync/
├── src/
│   ├── controllers/
│   │   └── health.controller.js  # Controller handling health check logic
│   ├── middleware/
│   │   ├── error.middleware.js   # Centralized error handler
│   │   └── notFound.middleware.js# 404 Not Found handler
│   ├── routes/
│   │   ├── health.routes.js      # Health check router definition
│   │   └── index.js              # Main API router aggregator (/api)
│   ├── app.js                    # Express app initialization & middleware configuration
│   └── server.js                 # Server entrypoint listening on PORT from .env
├── .env                          # Local environment variables (PORT=3000)
├── .env.example                  # Template environment variables
├── .gitignore                    # Git ignore file for node_modules, .env, etc.
├── package.json                  # Project metadata, dependencies & scripts
└── README.md                     # Quickstart documentation
```

---

## Proposed Changes

### 1. Package Configuration & Dependencies
#### [NEW] [package.json](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/package.json)
- Project name: `BoardSync`
- ES Modules enabled (`"type": "module"`)
- Dependencies: `express`, `dotenv`, `cors`
- Dev Dependencies: `nodemon`
- Scripts:
  - `"dev"`: `"nodemon src/server.js"`
  - `"start"`: `"node src/server.js"`

### 2. Environment Configuration
#### [NEW] [.env](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/.env) & [.env.example](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/.env.example)
- `PORT=3000`
- `NODE_ENV=development`

### 3. Controller Layer
#### [NEW] [health.controller.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/controllers/health.controller.js)
- `getHealth`: Returns JSON `{ status: "ok" }` with HTTP status `200`.

### 4. Routes Layer
#### [NEW] [health.routes.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/routes/health.routes.js)
- Define `router.get('/health', getHealth)`
#### [NEW] [index.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/routes/index.js)
- Aggregates sub-routers under `/api` prefix (e.g. `router.use('/', healthRoutes)` making `GET /api/health`).

### 5. Middleware Layer
#### [NEW] [notFound.middleware.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/middleware/notFound.middleware.js)
- Intercepts requests to non-existing routes and returns a JSON 404 error.
#### [NEW] [error.middleware.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/middleware/error.middleware.js)
- Catches unhandled errors and returns standardized error responses.

### 6. App & Server Entrypoints
#### [NEW] [app.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/app.js)
- Express application instance setup with `cors()`, `express.json()`, route mounting, and middleware.
#### [NEW] [server.js](file:///c:/WEB%20DEVLOPMENT/BACKEND-PROJECT/BoardSync/src/server.js)
- Loads environment variables via `dotenv.config()`.
- Starts the server on `process.env.PORT || 3000` and logs server URL.

---

## Verification Plan

### Automated / Manual Verification
1. **Dependency Installation**: Run `npm install` and verify zero errors.
2. **Server Startup**: Run `node src/server.js` or `npm run dev` in background and verify it binds to port `3000`.
3. **Health Route Test**: Send an HTTP GET request to `http://localhost:3000/api/health` using `curl` / fetch script and verify:
   - Status code is `200 OK`
   - Response body equals `{ "status": "ok" }`
4. **404 Route Test**: Send a request to an unknown route (e.g. `http://localhost:3000/api/nonexistent`) to verify the `notFound` middleware returns 404.
