# Forums API

A RESTful forum backend built with Node.js, TypeScript, Express, and MongoDB.

## Features
- User registration and login with JWT authentication
- Create, edit, delete, and like posts
- Comment on posts with full CRUD
- Admin analytics dashboard
- Role-based access control (user/admin)
- 80%+ test coverage with Jest

## Tech Stack
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- Winston logging
- Jest + Supertest

## API Endpoints
- POST /user/create
- POST /user/login
- GET/POST/PUT/DELETE /posts
- POST /posts/:id/like
- GET/POST/PUT/DELETE /posts/:postId/comments
- GET /admin/stats
- GET /admin/users

## Run locally
npm install
npm run serve
