# Deploying FreelanceHub Backend to Render

This guide explains how to deploy the `FH-backend` to [Render.com](https://render.com) using your **Existing Cloud Database**.

## Option 1: Using Blueprints (Recommended)

1.  Push your code to a GitHub repository.
2.  Log in to your Render dashboard.
3.  Click **New +** and select **Blueprint**.
4.  Connect your GitHub repository.
5.  Render will detect `render.yaml`.
6.  **Crucial Step**: It will prompt you to provide the `DATABASE_URL`.
    *   Paste the connection string of your **existing cloud database** (e.g., from Neon, Supabase, or another Render project).
    *   Format: `postgresql://user:password@host:port/database`
7.  Render will create the Web Service and connect to your database.

## Option 2: Manual Setup

1.  **Create Web Service**:
    *   New -> Web Service.
    *   Connect Repo.
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Environment Variables**:
        *   `DATABASE_URL`: (Paste your existing Cloud DB connection string)
        *   `JWT_SECRET`: (Generate a random string)
        *   `INTERNAL_API_KEY`: (Generate a random string, must match Frontend)
        *   `NODE_ENV`: `production`

## Post-Deployment
- Get the **onrender.com** URL of your backend.
- Update your Frontend's `NEXT_PUBLIC_API_URL` environment variable to point to this new URL.
