# FreelanceHub Backend

The backend API for **FreelanceHub**, a platform connecting freelancers and clients. Built with **Node.js**, **Express**, and **Prisma**.

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/) (v7)
- **Caching:** [Redis](https://redis.io/)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, Rate Limiting, CORS

## 📂 Project Structure

```bash
FH-backend/
├── config/               # Configuration files
├── controllers/          # Request handlers
├── middlewares/          # Auth, Validation, Caching middleware
├── prisma/               # Database schema and migrations
├── routes/               # API route definitions
├── services/             # Business logic (Email, Payments)
├── utils/                # Helper functions
└── server.js             # Entry point
```

## 🛠️ Features

- **User Management**: Authentication, Profile updates, Client/Freelancer roles.
- **Job Board**: CRUD operations for Jobs.
- **Proposals**: Submit, review, and accept proposals.
- **Contracts**: Manage active work contracts.
- **Notifications**: System-wide notifications.
- **Performance**: Redis caching for high-traffic endpoints.

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- Redis Server (Optional, but recommended for caching)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd FH-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://user:password@localhost:5432/freelancehub?schema=public"
   
   # Security
   JWT_SECRET=your_super_secret_jwt_key
   INTERNAL_API_KEY=your_shared_secret_key
   
   # Redis (Optional)
   REDIS_URL=redis://localhost:6379
   
   # Email Service (Nodemailer)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. Database Setup (Prisma):
   ```bash
   # Run migrations (dev)
   npx prisma migrate dev --name init
   
   # Generate Prisma Client
   npx prisma generate
   ```

### Running Locally

Start the development server (with Nodemon):

```bash
npm run dev
```

The server will start at `http://localhost:4000`.

## 📚 API Documentation

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for a detailed list of available endpoints.

### Key Endpoints

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Jobs**: `GET /api/jobs`, `POST /api/jobs`
- **Proposals**: `POST /api/jobs/:id/proposals`



## 📄 License

This project is licensed under the ISC License.
