"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function calculateStreak(attempts: { createdAt: Date }[]): number {
    if (attempts.length === 0) return 0

    // Get unique dates sorted descending
    const uniqueDates = [...new Set(attempts.map(a => a.createdAt.toDateString()))]
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime())

    if (uniqueDates.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // If the last attempt was not today or yesterday, streak is broken
    const lastDate = uniqueDates[0]
    lastDate.setHours(0, 0, 0, 0)
    if (lastDate < yesterday) return 0

    // Count consecutive days
    let streak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
        const curr = new Date(uniqueDates[i])
        curr.setHours(0, 0, 0, 0)
        const prev = new Date(uniqueDates[i - 1])
        prev.setHours(0, 0, 0, 0)
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
            streak++
        } else {
            break
        }
    }

    return streak
}

export async function getDashboardData() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            user: { name: 'Guest', email: '' },
            stats: { streak: 0, accuracy: 0, solved: 0, todayAttempts: 0 },
            recommendations: []
        }
    }

    const userId = session.user.id

    const attempts = await prisma.attempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })

    const totalAttempts = attempts.length
    const correctAttempts = attempts.filter(a => a.isCorrect).length
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
    const solved = correctAttempts

    // Proper consecutive-day streak
    const streak = calculateStreak(attempts)

    // Today's attempts count
    const todayStr = new Date().toDateString()
    const todayAttempts = attempts.filter(a => a.createdAt.toDateString() === todayStr).length

    return {
        user: session.user,
        stats: {
            streak,
            accuracy,
            solved,
            todayAttempts,
        },
    }
}
