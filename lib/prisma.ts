import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

export { prisma }