import { prisma } from './lib/prisma.js';

async function seedJobs() {
    try {
        // First, create a client user if none exists
        let client = await prisma.users.findFirst({
            where: { role: 'CLIENT' }
        });

        if (!client) {
            client = await prisma.users.create({
                data: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'client@example.com',
                    password: '$2b$10$hashedpassword',
                    role: 'CLIENT'
                }
            });
        }

        // Create three sample jobs
        const jobs = await prisma.jobs.createMany({
            data: [
                {
                    title: 'Full Stack Web Developer',
                    description: 'Looking for an experienced full stack developer to build a modern web application using React and Node.js.',
                    budgetMin: '5000',
                    budgetMax: '8000',
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    clientId: client.id,
                    status: 'OPEN'
                },
                {
                    title: 'Mobile App Developer',
                    description: 'Need a skilled mobile developer to create a cross-platform app using React Native.',
                    budgetMin: '3000',
                    budgetMax: '5000',
                    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                    clientId: client.id,
                    status: 'OPEN'
                },
                {
                    title: 'UI/UX Designer',
                    description: 'Seeking a creative UI/UX designer to design modern and user-friendly interfaces.',
                    budgetMin: '2000',
                    budgetMax: '4000',
                    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                    clientId: client.id,
                    status: 'OPEN'
                }
            ]
        });

        console.log(`Created ${jobs.count} jobs successfully!`);
    } catch (error) {
        console.error('Error seeding jobs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedJobs();