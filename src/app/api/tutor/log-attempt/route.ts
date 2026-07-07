import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id
        const body = await request.json()
        const { subject: subjectName, chapter: chapterTitle, isCorrect } = body

        if (!subjectName || !chapterTitle || typeof isCorrect !== "boolean") {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Step 1: Find or create Subject
        let subject = await prisma.subject.findFirst({ where: { name: subjectName } })
        if (!subject) {
            subject = await prisma.subject.create({ data: { name: subjectName } })
        }

        // Step 2: Find or create Chapter
        let chapter = await prisma.chapter.findFirst({
            where: { title: chapterTitle, subjectId: subject.id }
        })
        if (!chapter) {
            chapter = await prisma.chapter.create({
                data: { title: chapterTitle, subjectId: subject.id }
            })
        }

        // Step 3: Find or create placeholder Question for Socratic Tutor
        const placeholderContent = "__SOCRATIC_TUTOR_INTERACTION__"
        let question = await prisma.question.findFirst({
            where: { content: placeholderContent, chapterId: chapter.id }
        })
        if (!question) {
            question = await prisma.question.create({
                data: {
                    content: placeholderContent,
                    type: "AI_TUTOR",
                    correctAnswer: "N/A",
                    difficulty: "MEDIUM",
                    chapterId: chapter.id
                }
            })
        }

        // Step 4: Create the Attempt record
        const attempt = await prisma.attempt.create({
            data: {
                userId,
                questionId: question.id,
                isCorrect,
                timeTaken: 15,
            }
        })

        console.log(`[log-attempt] Saved: userId=${userId} subject=${subjectName} correct=${isCorrect} attemptId=${attempt.id}`)
        return NextResponse.json({ success: true, attemptId: attempt.id })

    } catch (error: any) {
        console.error("[log-attempt] Error:", error?.message || error)
        return NextResponse.json({ error: error?.message || "Failed to log attempt" }, { status: 500 })
    }
}
