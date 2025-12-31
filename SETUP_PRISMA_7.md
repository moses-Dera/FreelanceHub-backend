# Setup Guide: New Backend with Prisma 7 + PostgreSQL

This guide outlines the steps to set up a new Node.js backend project using Prisma ORM version 7 with PostgreSQL.

## 1. Project Initialization

Initialize your Node.js project and install necessary dependencies.

```bash
mkdir my-backend
cd my-backend
npm init -y
```

## 2. Install Dependencies

Install Prisma 7 packages, the PostgreSQL adapter, and TypeScript utility tools (required for the new configuration format).

```bash
# Core dependencies
npm install @prisma/client@7 @prisma/adapter-pg pg dotenv express cors

# Dev dependencies
npm install -D prisma@7 typescript tsx @types/node @types/express @types/pg nodemon
```

## 3. Configuration

### `tsconfig.json`
Initialize TypeScript configuration.
```bash
npx tsc --init
```

### `prisma.config.ts` (NEW in v7)
Create this file in your project root. This replaces the database URL configuration in `schema.prisma`.

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### `prisma/schema.prisma`
Create the schema file. Note the changes in the `generator` and `datasource` blocks.

```prisma
generator client {
  provider = "prisma-client"  // Changed from prisma-client-js
  output   = "../generated/prisma" // REQUIRED: Custom output path
}

datasource db {
  provider = "postgresql"
  // url is NO LONGER defined here
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### `.env`
Create your environment file.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
PORT=3000
```

## 4. Prisma Client Instantiation

Create a library file (e.g., `lib/prisma.ts`) to instantiate the client. You MUST use the driver adapter in v7.

```typescript
// lib/prisma.ts
import { PrismaClient } from '../generated/prisma/index.js'; // Import from GENERATED path
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
```

## 5. Scripts

Update your `package.json` to use `tsx` for running the server, as the generated client requires it (or a build step).

```json
"scripts": {
  "dev": "nodemon --exec tsx server.js",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

## 6. Run commands

Generate the client and start developing.

```bash
# Generate Prisma Client
npx prisma generate

# Create/Push migrations (uses prisma.config.ts)
npx prisma migrate dev --name init

# Run the server
npm run dev
```
