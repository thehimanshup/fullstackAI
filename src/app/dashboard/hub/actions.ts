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

export async function generateNotes(topic: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} } as any],
            systemInstruction: "You are an expert AI Curriculum Writer. Your goal is to generate comprehensive, curriculum-aligned study notes in Markdown format for the given topic using accurate data from the internet. Include Definitions, Key Formulas/Concepts, Important Examples, and Summary. Keep the tone academic and structured."
        })

        const responseText = await callWithRetry(async () => {
            const result = await model.generateContent(
                `Generate comprehensive and detailed study notes for the academic topic: "${topic}". Perform a web search to gather accurate definitions, key formulas, examples, and summaries for this topic.`
            )
            const response = await result.response
            return response.text()
        })

        return responseText
    } catch (error) {
        console.error("Notes Generation Error:", error)
        throw new Error("Failed to generate notes")
    }
}

export async function searchResources(topic: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} } as any],
            systemInstruction: "You are a study resource finder. Given a topic, search the internet and return a JSON array of resources (books, sample papers, study material, videos). Format: [{ \"title\": \"Name\", \"type\": \"PDF\" | \"Video\" | \"Article\", \"url\": \"https://...\" }]. ONLY RETURN A VALID JSON ARRAY. DO NOT WRAP IN MARKDOWN."
        })

        const responseText = await callWithRetry(async () => {
            const result = await model.generateContent(
                `Find 4-5 study resources for the academic topic: "${topic}". Search the internet for relevant books, sample papers, study materials, or videos.`
            )
            const response = await result.response
            return response.text()
        })

        let text = responseText
        
        // Robust JSON array extraction
        const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
        if (jsonMatch) {
            text = jsonMatch[0]
        } else {
            // Strip out markdown if present
            if (text.startsWith("```json")) {
                text = text.replace(/```json/g, "").replace(/```/g, "").trim()
            } else if (text.startsWith("```")) {
                text = text.replace(/```/g, "").trim()
            }
        }

        try {
            return JSON.parse(text) as { title: string, type: string, url: string }[]
        } catch (parseError) {
            console.error("JSON parsing error:", parseError, "Raw text was:", text)
            return []
        }
    } catch (error) {
        console.error("Search Resources Error:", error)
        return []
    }
}

import fs from "fs"
import path from "path"

export async function getStudyLibrary() {
    const baseDir = path.join(process.cwd(), "Study material")
    const library: Record<string, { subject: string, files: string[] }[]> = {}

    try {
        if (!fs.existsSync(baseDir)) return library

        const years = fs.readdirSync(baseDir).filter(y => fs.statSync(path.join(baseDir, y)).isDirectory())

        for (const year of years) {
            library[year] = []
            
            // Files directly in year directory
            const yearDirPath = path.join(baseDir, year)
            const entries = fs.readdirSync(yearDirPath)
            
            const filesInYearDir = entries.filter(e => fs.statSync(path.join(yearDirPath, e)).isFile())
            if (filesInYearDir.length > 0) {
                 library[year].push({
                     subject: "General",
                     files: filesInYearDir
                 })
            }

            // Subdirectories in year directory (e.g. subjects)
            const subjectDirs = entries.filter(e => fs.statSync(path.join(yearDirPath, e)).isDirectory())
            for (const subject of subjectDirs) {
                const subjectPath = path.join(yearDirPath, subject)
                const files = fs.readdirSync(subjectPath).filter(f => fs.statSync(path.join(subjectPath, f)).isFile())
                if (files.length > 0) {
                    library[year].push({
                        subject,
                        files
                    })
                }
            }
        }
    } catch (error) {
        console.error("Error reading library", error)
    }

    return library
}
