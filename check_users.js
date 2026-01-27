
import { prisma } from './lib/prisma.js';

async function main() {
    const users = await prisma.users.findMany({
        select: {
            email: true,
            firstName: true,
            role: true
        }
    });
    console.log('Users in DB:', users);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
