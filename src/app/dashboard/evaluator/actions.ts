"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

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

export async function evaluateDocument(
    base64Data: string,
    mimeType: string,
    rubric: string,
    markingSchemeBase64?: string,
    markingSchemeMimeType?: string
) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        let prompt: string
        const parts: any[] = []

        if (markingSchemeBase64 && markingSchemeMimeType) {
            // Teacher has uploaded a marking scheme file — compare directly
            prompt = `You are an expert AI Examiner. You have been provided with TWO documents:
1. The STUDENT'S ANSWER (first document)
2. The TEACHER'S MARKING SCHEME / ANSWER KEY (second document)

Additional Rubric/Criteria provided:
${rubric || "Not provided — use the marking scheme as the sole reference."}

Please evaluate the student's answer by:
- Comparing each answer/point against the marking scheme
- Awarding marks based on how closely the student's answers match the expected answers
- Identifying correct, partially correct, and incorrect responses

Provide your evaluation in a structured Markdown format:
## 📊 Overall Score
## ✅ Detailed Mark Breakdown (per question/section)
## 💪 Strengths
## 📈 Areas for Improvement
## 💡 Actionable Suggestions for the Student`

            parts.push(
                prompt,
                { inlineData: { data: base64Data, mimeType } },
                { inlineData: { data: markingSchemeBase64, mimeType: markingSchemeMimeType } }
            )
        } else {
            // Text-only rubric
            prompt = `You are an expert AI Examiner. Please evaluate the following submitted document against the provided rubric.
        
Rubric:
${rubric}

Provide your evaluation in a structured Markdown format:
## 📊 Overall Score
## 📋 Detailed Breakdown (based on rubric criteria)
## 💪 Strengths
## 📈 Areas for Improvement
## 💡 Specific Actionable Suggestions`

            parts.push(
                prompt,
                { inlineData: { data: base64Data, mimeType } }
            )
        }

        const responseText = await callWithRetry(async () => {
            const result = await model.generateContent(parts)
            const response = await result.response
            return response.text()
        })

        return responseText
    } catch (error) {
        console.error("Evaluation Error:", error)
        throw new Error("Failed to evaluate document")
    }
}
