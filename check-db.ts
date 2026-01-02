import { prisma } from './lib/prisma'

async function main() {
    try {
        console.log('Attempting to connect...')
        await prisma.$connect()
        console.log('Connected successfully!')
        await prisma.$disconnect()
    } catch (e) {
        console.error('Connection failed:', e)
        process.exit(1)
    }
}

main()
