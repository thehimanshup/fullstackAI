"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Helper wrapper to handle transient 503/429 errors from Gemini
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
    try {
        return await fn()
    } catch (error: any) {
        const isTransient = error?.status === 503 || error?.status === 429 ||
                            error?.message?.includes("503") || error?.message?.includes("429") ||
                            error?.message?.includes("high demand") || error?.message?.includes("Service Unavailable")

        if (retries > 0 && isTransient) {
            console.warn(`Gemini API returned retryable error. Retrying in ${delay}ms... (${retries} retries left)`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return callWithRetry(fn, retries - 1, delay * 2)
        }
        throw error
    }
}

export async function chatWithAI(
    history: { role: "user" | "model", parts: { text: string }[] }[],
    message: string,
    userLanguage: string = "English"
) {
    try {
        const session = await auth()

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are an expert Socratic AI Mentor for Indian students. 
            PHILOSOPHY: NEVER give direct answers. ALWAYS ask probing, thought-provoking questions to elicit self-discovery. 
            Guide the student to the answer step-by-step. 
            SUPPORTED LANGUAGES: The user's preferred language is ${userLanguage}. You MUST respond exclusively in ${userLanguage} unless requested otherwise.
            
            MULTIMODAL INSTRUCTIONS (EXTRAORDINARY FEATURE): 
            YOU MUST include an educational diagram, chart, or scientific illustration in ALMOST EVERY response to help the student visualize the concept.
            Generate these images on-the-fly by embedding a Markdown image using this exact URL format:
            ![Image Description](/api/image?prompt=detailed-description-with-hyphens-instead-of-spaces)
            Example: ![Structure of Atom](/api/image?prompt=highly-detailed-scientific-diagram-of-an-atom-structure)
            Ensure the prompt parameter contains only alphanumeric characters and hyphens. Do not use spaces, %20, or special characters in the prompt.
            
            MASTERY TRACKING: Provide a quick assessment of their understanding (0-100%) at the end of every 3-4 interactions implicitly.
            Be encouraging, patient, and use formatting (Markdown) to make text readable.
            
            EVALUATION RULE: At the very end of your response, you MUST append a structured JSON block evaluated based on the user's latest input. 
            This block will be parsed out programmatically and must follow this EXACT format at the bottom of your output:
            
            ---EVALUATION---
            {
              "isLearningEvent": boolean,
              "subject": "string",
              "chapter": "string",
              "isCorrect": boolean
            }
            
            Guidelines for the JSON block:
            1. If the student is just starting, asking questions, or chat is introductory, set "isLearningEvent" to false.
            2. If the student answers a question you asked or explains a concept correctly, set "isLearningEvent" to true, and "isCorrect" to true.
            3. If the student answers a question incorrectly or makes a conceptual error, set "isLearningEvent" to true, and "isCorrect" to false.
            4. Identify the subject (e.g. Physics, Chemistry, Math, History, Biology, etc.) and chapter/topic (e.g. Thermodynamics, Cell Division, Integration, etc.). Keep subject and chapter names concise.`
        })

        // Gemini requires history to start with a 'user' role
        let chatHistory = history
        const firstUserIndex = chatHistory.findIndex(msg => msg.role === "user")
        if (firstUserIndex > 0) {
            chatHistory = chatHistory.slice(firstUserIndex)
        } else if (firstUserIndex === -1 && chatHistory.length > 0) {
            chatHistory = []
        }

        const chat = model.startChat({
            history: chatHistory,
        })

        // 1. Get response from Socratic Mentor (containing response text & evaluation JSON)
        const rawText = await callWithRetry(async () => {
            const result = await chat.sendMessage(message)
            return result.response.text()
        })

        let responseText = rawText
        let learningEvent = null

        // 2. Parse the evaluation block
        const marker = "---EVALUATION---"
        const markerIndex = rawText.lastIndexOf(marker)
        if (markerIndex !== -1) {
            responseText = rawText.substring(0, markerIndex).trim()
            const jsonPart = rawText.substring(markerIndex + marker.length).trim()
            try {
                const cleanedJson = jsonPart.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim()
                const evaluation = JSON.parse(cleanedJson)
                if (evaluation.isLearningEvent && evaluation.subject && evaluation.chapter && session?.user?.id) {
                    learningEvent = {
                        subject: evaluation.subject,
                        chapter: evaluation.chapter,
                        isCorrect: evaluation.isCorrect
                    }
                    // Await the DB write — fire-and-forget fails on Vercel because serverless
                    // functions are terminated as soon as the response is sent, killing unawaited promises
                    try {
                        await logLearningEventToDB(session.user.id, evaluation.subject, evaluation.chapter, evaluation.isCorrect)
                    } catch (e) {
                        console.error("DB Log Error:", e)
                    }
                }
            } catch (err) {
                console.error("Failed to parse evaluation JSON:", err, jsonPart)
            }
        }

        return { responseText, learningEvent }
    } catch (error) {
        console.error("Gemini API Error:", error)
        throw new Error("Failed to get response from AI Tutor")
    }
}

// Background worker function to log the event to DB
async function logLearningEventToDB(userId: string, subjectName: string, chapterTitle: string, isCorrect: boolean) {
    // 1. Find or create Subject
    let subject = await prisma.subject.findFirst({
        where: { name: subjectName }
    })
    if (!subject) {
        subject = await prisma.subject.create({
            data: { name: subjectName }
        })
    }

    // 2. Find or create Chapter
    let chapter = await prisma.chapter.findFirst({
        where: { title: chapterTitle, subjectId: subject.id }
    })
    if (!chapter) {
        chapter = await prisma.chapter.create({
            data: { title: chapterTitle, subjectId: subject.id }
        })
    }

    // 3. Find or create a placeholder Question for Socratic Tutor attempts
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

    // 4. Create the Attempt
    await prisma.attempt.create({
        data: {
            userId,
            questionId: question.id,
            isCorrect,
            timeTaken: 15, // standard arbitrary time for chat response
        }
    })
}
