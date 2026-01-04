import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

// Create connection pool
const pool = new Pool({ 
    connectionString: process.env.DIRECT_DATABASE_URL 
})

// Create adapter
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter
const prisma = new PrismaClient({ 
    adapter,
    log: ['error']
})

console.log('Using PostgreSQL adapter with direct connection')

export { prisma }