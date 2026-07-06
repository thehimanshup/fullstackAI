import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // Create Physics Subject
    const physics = await prisma.subject.create({
        data: {
            name: 'Physics',
            icon: 'Atom',
            chapters: {
                create: [
                    {
                        title: 'Rotational Motion',
                        topics: {
                            create: [
                                { name: 'Moment of Inertia', videoUrl: 'https://example.com/moi' },
                                { name: 'Torque', videoUrl: 'https://example.com/torque' },
                            ],
                        },
                        questions: {
                            create: [
                                {
                                    content: 'A solid sphere and a hollow sphere of the same mass and radius are released from the top of an inclined plane. Which one reaches the bottom first?',
                                    type: 'MCQ',
                                    options: JSON.stringify(['Solid Sphere', 'Hollow Sphere', 'Both same time', 'Depends on angle']),
                                    correctAnswer: 'Solid Sphere',
                                    explanation: 'Solid sphere has a smaller moment of inertia (2/5 MR^2) compared to hollow sphere (2/3 MR^2), so it has greater acceleration.',
                                    difficulty: 'MEDIUM',
                                },
                                {
                                    content: 'Calculate the moment of inertia of a rod of mass M and length L about an axis passing through its center and perpendicular to its length.',
                                    type: 'MCQ',
                                    options: JSON.stringify(['ML^2/12', 'ML^2/3', 'ML^2/2', 'ML^2/4']),
                                    correctAnswer: 'ML^2/12',
                                    explanation: 'Standard formula for rod about center.',
                                    difficulty: 'EASY',
                                }
                            ]
                        }
                    },
                ]
            },
        },
    })

    // Create Math Subject
    const math = await prisma.subject.create({
        data: {
            name: 'Mathematics',
            icon: 'FunctionSquare',
            chapters: {
                create: [
                    {
                        title: 'Calculus',
                        topics: {
                            create: [
                                { name: 'Limits', videoUrl: 'https://example.com/limits' },
                                { name: 'Derivatives', videoUrl: 'https://example.com/derivatives' },
                            ]
                        }
                    }
                ]
            }
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
