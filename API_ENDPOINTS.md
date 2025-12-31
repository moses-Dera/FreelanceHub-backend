# API Endpoints

## Auth (`/api/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login user | Public |
| `POST` | `/api/auth/logout` | Logout user | Authenticated |
| `POST` | `/api/auth/refresh-token` | Refresh access token | Public |
| `POST` | `/api/auth/delete/:id` | Delete a user | Admin |

## Jobs (`/api/jobs`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/jobs/add` | Post a new job | Admin, Client |
| `GET` | `/api/jobs` | Get all jobs (with optional search/filter) | Public |
| `GET` | `/api/jobs/:id` | Get a specific job | Public |
| `PUT` | `/api/jobs/:id` | Update a job | Admin, Client |
| `DELETE` | `/api/jobs/:id` | Delete a job | Admin, Client |

## Proposals

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/jobs/:id/proposals` | Submit a proposal for a job | Authenticated |
| `GET` | `/api/jobs/:id/proposals` | Get all proposals for a job | Authenticated |
| `GET` | `/api/proposals/:id` | Get details of a specific proposal | Authenticated |

## Contracts (`/api/contracts`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contracts` | Create a new contract | Authenticated |
| `GET` | `/api/contracts` | Get user's contracts | Authenticated |
