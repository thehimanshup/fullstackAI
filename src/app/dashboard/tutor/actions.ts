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

export async function chatWithAI(
    history: { role: "user" | "model", parts: { text: string }[] }[],
    message: string,
    userLanguage: string = "English"
) {
    try {
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
            This block will be parsed out programmatically and must follow this EXACT format at the bottom of your output with NO extra text after it:
            
            ---EVALUATION---
            {
              "isLearningEvent": true,
              "subject": "Physics",
              "chapter": "Newton Laws",
              "isCorrect": true
            }
            
            IMPORTANT: Always output the ---EVALUATION--- block. Never skip it.
            Guidelines for the JSON block:
            1. If the student is just starting or chat is introductory (first message), set "isLearningEvent" to false.
            2. If the student answers a question you asked or explains a concept, set "isLearningEvent" to true.
            3. Set "isCorrect" to true if correct, false if incorrect or partially correct.
            4. "subject" and "chapter" must be concise English strings even if responding in another language.`
        })

        // Gemini requires history to start with a 'user' role
        let chatHistory = history
        const firstUserIndex = chatHistory.findIndex(msg => msg.role === "user")
        if (firstUserIndex > 0) {
            chatHistory = chatHistory.slice(firstUserIndex)
        } else if (firstUserIndex === -1 && chatHistory.length > 0) {
            chatHistory = []
        }

        const chat = model.startChat({ history: chatHistory })

        // Get AI response (text + evaluation JSON appended at the end)
        const rawText = await callWithRetry(async () => {
            const result = await chat.sendMessage(message)
            return result.response.text()
        })

        let responseText = rawText
        let learningEvent: { subject: string; chapter: string; isCorrect: boolean } | null = null

        // Parse the ---EVALUATION--- block that Gemini appends
        const marker = "---EVALUATION---"
        const markerIndex = rawText.lastIndexOf(marker)
        if (markerIndex !== -1) {
            responseText = rawText.substring(0, markerIndex).trim()
            const jsonPart = rawText.substring(markerIndex + marker.length).trim()
            try {
                const cleanedJson = jsonPart
                    .replace(/```json\n?/gi, "")
                    .replace(/```\n?/gi, "")
                    .trim()
                const evaluation = JSON.parse(cleanedJson)
                if (evaluation.isLearningEvent && evaluation.subject && evaluation.chapter) {
                    learningEvent = {
                        subject: String(evaluation.subject).trim(),
                        chapter: String(evaluation.chapter).trim(),
                        isCorrect: Boolean(evaluation.isCorrect),
                    }
                }
            } catch (err) {
                console.error("Failed to parse evaluation JSON:", err, "\nRaw JSON part:", jsonPart)
            }
        } else {
            console.warn("No ---EVALUATION--- block found in Gemini response")
        }

        // NOTE: DB write is intentionally NOT done here.
        // The client calls POST /api/tutor/log-attempt after receiving this response.
        // This keeps the server action fast and avoids Vercel's 10s timeout.
        return { responseText, learningEvent }
    } catch (error) {
        console.error("Gemini API Error:", error)
        throw new Error("Failed to get response from AI Tutor")
    }
}
