import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create both clients
const acceleratePrisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate())

const directPrisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_DATABASE_URL,
})

// Proxy handler for fallback logic
const prismaProxy = new Proxy({}, {
    get(target, prop) {
        return async (...args) => {
            try {
                // Try Accelerate first
                return await acceleratePrisma[prop](...args)
            } catch (error) {
                console.warn(`Accelerate failed for ${String(prop)}, using direct connection:`, error.message)
                // Fallback to direct connection
                return await directPrisma[prop](...args)
            }
        }
    }
})

export { prismaProxy as prisma }