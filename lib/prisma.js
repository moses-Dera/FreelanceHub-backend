import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;

try {
    // Try Accelerate first
    prisma = new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    console.log('Using Prisma Accelerate')
} catch (error) {
    console.warn('Accelerate failed, falling back to direct connection:', error.message)
    
    // Fallback to direct connection
    prisma = new PrismaClient({
        datasourceUrl: process.env.DIRECT_DATABASE_URL,
    })
    
    console.log('Using direct database connection')
}

export { prisma }