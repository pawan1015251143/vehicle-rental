# 🚗 VehicleRent — Vehicle Rental Management System

A full-stack MERN application for renting vehicles with role-based access control, real-time chat, and payment integration.

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Redux Toolkit
- Axios
- Socket.io Client
- React Router v6

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (Image Upload)
- Razorpay (Payments)
- Socket.io (Real-Time Chat)

## Features

- ✅ **Authentication & Authorization** — JWT-based with role management
- ✅ **4 User Roles** — Customer, Vehicle Owner, Driver, Admin
- ✅ **Vehicle Management** — CRUD, search, filter, approval system
- ✅ **Booking System** — Hourly & Daily bookings with conflict detection
- ✅ **Payment Integration** — Razorpay with order creation & verification
- ✅ **Reviews & Ratings** — Star ratings with average calculation
- ✅ **Real-Time Chat** — Socket.io powered messaging with typing indicators
- ✅ **Wishlist** — Save favorite vehicles
- ✅ **Admin Dashboard** — Stats, user management, vehicle approvals
- ✅ **Owner Dashboard** — Vehicle listing, booking management, revenue tracking
- ✅ **Customer Dashboard** — Booking history, wishlist overview
- ✅ **Image Upload** — Cloudinary integration for vehicle images & avatars
- ✅ **Security** — Helmet, rate limiting, mongo sanitize, CORS

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account (test mode)

### 1. Clone & Setup

```bash
cd vehicle-rental
```

### 2. Backend Setup

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your actual values (see Environment Variables section)
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## Environment Variables

Create `backend/.env`:

| Variable | Description | How to Get |
|---|---|---|
| PORT | Server port | Use `5000` |
| NODE_ENV | Environment | Use `development` |
| MONGODB_URI | MongoDB connection string | MongoDB Atlas → Connect → Drivers |
| JWT_SECRET | JWT signing key | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| JWT_EXPIRE | Token expiry | Use `7d` |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | Cloudinary Dashboard |
| CLOUDINARY_API_KEY | Cloudinary API key | Cloudinary Dashboard |
| CLOUDINARY_API_SECRET | Cloudinary API secret | Cloudinary Dashboard |
| RAZORPAY_KEY_ID | Razorpay key ID | Razorpay Dashboard → API Keys |
| RAZORPAY_KEY_SECRET | Razorpay key secret | Razorpay Dashboard → API Keys |
| CLIENT_URL | Frontend URL | Use `http://localhost:5173` |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get profile
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/password` — Change password

### Vehicles
- `GET /api/vehicles` — List (public, with filters)
- `GET /api/vehicles/:id` — Details
- `POST /api/vehicles` — Create (owner)
- `PUT /api/vehicles/:id` — Update (owner)
- `DELETE /api/vehicles/:id` — Delete (owner/admin)
- `PUT /api/vehicles/:id/approval` — Approve/reject (admin)

### Bookings
- `POST /api/bookings` — Create booking
- `GET /api/bookings/my` — Customer bookings
- `GET /api/bookings/owner` — Owner bookings
- `PUT /api/bookings/:id/status` — Update status

### Payments
- `POST /api/payments/create-order` — Create Razorpay order
- `POST /api/payments/verify` — Verify payment

### Reviews
- `POST /api/reviews` — Create review
- `GET /api/reviews/vehicle/:vehicleId` — Vehicle reviews

### Chat
- `POST /api/chats` — Get/create chat
- `GET /api/chats` — My chats
- `GET /api/chats/:id/messages` — Chat messages

### Admin
- `GET /api/admin/stats` — Dashboard stats
- `GET /api/admin/users` — All users
- `PUT /api/admin/users/:id` — Update user
- `DELETE /api/admin/users/:id` — Delete user

## Project Structure

```
vehicle-rental/
├── backend/
│   ├── config/          # DB, Cloudinary, Razorpay configs
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Socket.io setup
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # Redux store & slices
│   │   ├── services/    # API & Socket services
│   │   ├── App.jsx      # Main app with routes
│   │   └── main.jsx     # Entry point
│   └── index.html
├── .env.example
└── README.md
```

## License
MIT
