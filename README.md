# RoomBook – Conference Room Booking

Web application for booking conference rooms. Users can browse rooms, check their schedule and availability, book a time slot and manage their reservations. Administrators manage rooms and all reservations.

**Live demo:** https://krzysiekdobosz.github.io/Conference-Room-REACT-NODE-MONGO/

The demo runs entirely in the browser with test data (no server needed). Test accounts:

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| User  | `user@example.com`  | `user123`  |
| Admin | `admin@example.com` | `admin123` |

## Features

- Registration and login with JWT
- Room list with capacity filter and availability search for a chosen time range
- Daily schedule of every room with a visual timeline
- Booking with validation (no overlapping reservations, no bookings in the past, max 12 hours)
- "My reservations" view with cancellation
- Admin panel: add, edit and delete rooms, view and cancel any reservation
- Responsive layout with automatic dark mode

## Tech stack

- **Client:** React 18, React Router, Vite
- **Server:** Node.js, Express, Mongoose, JSON Web Tokens, bcrypt
- **Database:** MongoDB

## Project structure

```
room-reservation-app/
├── client/          React application (Vite)
│   └── src/api/     HTTP client and the in-browser mock used by the demo
└── server/          REST API (Express + MongoDB)
```

## Running locally

Requirements: Node.js 18+ and a running MongoDB instance.

```bash
# server
cd room-reservation-app/server
cp .env.example .env
npm install
npm run seed      # sample rooms, reservations and the test accounts above
npm run dev       # http://localhost:5000

# client (in a second terminal)
cd room-reservation-app/client
npm install
npm run dev       # http://localhost:5173, /api is proxied to the server
```

To run only the demo version locally: `npm run build:demo && npm run preview -- --mode demo`. `npm run deploy:demo` publishes it to the `gh-pages` branch.

## API

| Method | Endpoint                          | Access | Description                                |
| ------ | --------------------------------- | ------ | ------------------------------------------ |
| POST   | `/api/auth/register`              | public | Create an account                          |
| POST   | `/api/auth/login`                 | public | Log in, returns a JWT                      |
| GET    | `/api/auth/me`                    | user   | Current user                               |
| GET    | `/api/rooms?minCapacity&from&to`  | public | Rooms, optionally with availability        |
| GET    | `/api/rooms/:id/schedule?date`    | public | Reservations of a room on a given day      |
| POST   | `/api/rooms`                      | admin  | Create a room                              |
| PUT    | `/api/rooms/:id`                  | admin  | Update a room                              |
| DELETE | `/api/rooms/:id`                  | admin  | Delete a room and its reservations         |
| GET    | `/api/reservations?all=true`      | user   | Own reservations (`all` – admins only)     |
| POST   | `/api/reservations`               | user   | Book a room                                |
| DELETE | `/api/reservations/:id`           | user   | Cancel own reservation (admins: any)       |

## Tests

```bash
cd room-reservation-app/server && npm test
cd room-reservation-app/client && npm test
```
