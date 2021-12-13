# My Voting App

## A simple backend and frontend app for creating and voting on polls.

## Techlogy
- Docker
- PostgreSQL
- React
- NestJS

# Reqiurements

- Docker (Latest)
- Docker-Compose (Latest)
- NodeJS (Latest)
- Makefile (Latest)
- Modern Browser (Latest Chrome/Firefox)

# Quick start guide

For the quickest and painless way to get started, you can run `make bootstrap` to install all the dependencies and start both the fronend and backend services.

# Development

### For the backend, you are running the service for the very first time, please run this command to bootstrap the service:

`make db_bootstrap`

Install the dependencies for backend and frontend:

1) Installing backend dependencies run: `npm install --prefix ./backend`

2) Installing frontend dependencies run: `npm install --prefix ./frontend`

3) Run ```docker-compose up``` to start the backend and PostgresSQL.

---


To use/update the Prisma schema run: `npm run prisma:db:push --prefix ./backend`

Or you you are actively developing the backend, run: `npx prisma db push`

---

Once the backend is up running, you can run the frontend with `make fn` to kick start the frontend.