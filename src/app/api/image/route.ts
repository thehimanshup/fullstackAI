import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const prompt = searchParams.get("prompt")

        if (!prompt) {
            return new NextResponse("Missing prompt", { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.warn("No GEMINI_API_KEY found, falling back to Pollinations")
            return fetchFallback(prompt)
        }

        // Call Google Generative Language API for Imagen 3
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`

        console.log(`Requesting Imagen 3 image for: "${prompt}"`)
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                instances: [
                  {
                    prompt: prompt
                  }
                ],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: "1:1"
                }
            })
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error("Google Imagen API error:", response.status, errText)
            return fetchFallback(prompt)
        }

        const data = await response.json()
        const base64Data = data?.predictions?.[0]?.bytesBase64Encoded

        if (!base64Data) {
            console.error("No base64 data returned from Imagen, falling back")
            return fetchFallback(prompt)
        }

        const buffer = Buffer.from(base64Data, "base64")
        return new Response(buffer, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
            }
        })
    } catch (error) {
        console.error("Image generation route error:", error)
        // Fallback to avoid breaking the UI
        try {
            const { searchParams } = new URL(req.url)
            const prompt = searchParams.get("prompt")
            if (prompt) return fetchFallback(prompt)
        } catch {}
        return new NextResponse("Failed to generate image", { status: 500 })
    }
}

async function fetchFallback(prompt: string) {
    try {
        console.log(`Fetching fallback image from Pollinations for: "${prompt}"`)
        const formattedPrompt = prompt.replace(/\s+/g, "-")
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(formattedPrompt)}`
        const res = await fetch(pollinationsUrl)
        if (!res.ok) {
            throw new Error(`Pollinations returned status ${res.status}`)
        }
        const arrayBuffer = await res.arrayBuffer()
        return new Response(Buffer.from(arrayBuffer), {
            headers: {
                "Content-Type": "image/png",
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
            }
        })
    } catch (error) {
        console.error("Fallback image fetch failed:", error)
        return new NextResponse("Failed to fetch image", { status: 500 })
    }
}
