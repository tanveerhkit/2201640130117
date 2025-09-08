# URL Shortener Microservice and React Frontend

This repository contains:

- `logging-middleware/`: Reusable logging package that posts logs to the evaluation service API.
- `backend/`: HTTP URL shortener microservice (Express + TypeScript) with analytics and mandatory logging integration.
- `frontend/`: React (CRA) app using Material UI, consuming the backend APIs for URL shortening and statistics. Runs on `http://localhost:3000`.

## Features

- Create short URLs with optional validity (minutes, default 30) and optional custom shortcode.
- Redirect `/:shortcode` to original URL, tracking click timestamp, referrer source, and coarse location.
- Retrieve statistics via `GET /shorturls/:shortcode`.
- Robust validation and error handling with JSON error responses and proper HTTP codes.
- Extensive logging using the reusable logging middleware (no console logging).

## Run Locally

Prerequisites: Node.js 18+ and npm.

1) Build the logging package

```
cd logging-middleware
npm install
npm run build
```

2) Backend

```
cd ../backend
npm install
# Copy .env.sample to .env and fill evaluation server credentials or access token
cp .env.sample .env
npm run dev
```

Backend runs on `http://localhost:8080`.

3) Frontend

```
cd ../frontend
npm install
# Optionally create .env with REACT_APP_BACKEND_URL and REACT_APP_LOG_TOKEN
npm start
```

Frontend runs on `http://localhost:3000`.

## API

- POST `/shorturls` => `{ shortLink, expiry }`
- GET `/shorturls/:code` => statistics JSON
- GET `/:code` => HTTP 302 redirect to original URL (or 410 if expired)

## Logging

Provide either an `access token` directly, or backend-only `client credentials` to let the logger fetch/refresh tokens from the evaluation service.

Backend `.env.sample` shows supported variables. Frontend should only use `REACT_APP_LOG_TOKEN` (do not expose client secrets in the browser).

## Notes

- In-memory storage is used for simplicity; persistence can be added easily by replacing the store layer.
- Coarse location is inferred without external dependencies (private/public classification).
- CORS is enabled for `http://localhost:3000`.

