import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function calculateStreak(attempts: { createdAt: Date }[]): number {
  if (attempts.length === 0) return 0
  const uniqueDates = [...new Set(attempts.map(a => a.createdAt.toDateString()))]
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime())
  if (uniqueDates.length === 0) return 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const lastDate = new Date(uniqueDates[0]); lastDate.setHours(0, 0, 0, 0)
  if (lastDate < yesterday) return 0
  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i]); curr.setHours(0, 0, 0, 0)
    const prev = new Date(uniqueDates[i - 1]); prev.setHours(0, 0, 0, 0)
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diff === 1) streak++
    else break
  }
  return streak
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all attempts with subject/chapter info
    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            chapter: { include: { subject: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    const total = attempts.length
    const correct = attempts.filter(a => a.isCorrect).length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    const avgTime = total > 0
      ? Math.round(attempts.reduce((s, a) => s + a.timeTaken, 0) / total)
      : 0
    const streak = calculateStreak(attempts)

    // Today's count
    const todayStr = new Date().toDateString()
    const todayCount = attempts.filter(a => a.createdAt.toDateString() === todayStr).length

    // ── Last 7 days activity ──────────────────────────────────────────────────
    const last7: { date: string; count: number; correct: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
      const dayStr = d.toDateString()
      const dayAttempts = attempts.filter(a => a.createdAt.toDateString() === dayStr)
      last7.push({
        date: label,
        count: dayAttempts.length,
        correct: dayAttempts.filter(a => a.isCorrect).length,
      })
    }

    // ── Subject-wise stats ────────────────────────────────────────────────────
    const subjectMap: Record<string, { total: number; correct: number; subject: string }> = {}
    for (const a of attempts) {
      const name = a.question.chapter.subject.name
      if (!subjectMap[name]) subjectMap[name] = { total: 0, correct: 0, subject: name }
      subjectMap[name].total++
      if (a.isCorrect) subjectMap[name].correct++
    }
    const subjectStats = Object.values(subjectMap).map(s => ({
      subject: s.subject,
      total: s.total,
      correct: s.correct,
      accuracy: Math.round((s.correct / s.total) * 100),
    })).sort((a, b) => b.total - a.total)

    // ── Recent sessions (last 10) ─────────────────────────────────────────────
    const recentSessions = attempts.slice(0, 10).map(a => ({
      id: a.id,
      subject: a.question.chapter.subject.name,
      chapter: a.question.chapter.title,
      isCorrect: a.isCorrect,
      timeTaken: a.timeTaken,
      createdAt: a.createdAt.toISOString(),
    }))

    return NextResponse.json({
      stats: { total, correct, accuracy, avgTime, streak, todayCount },
      last7,
      subjectStats,
      recentSessions,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}
