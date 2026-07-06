import { NextResponse } from "next/server"

const SARVAM_API_KEY = process.env.SARVAM_API_KEY

export async function POST(request: Request) {
    try {
        if (!SARVAM_API_KEY) {
            return NextResponse.json({ error: "SARVAM_API_KEY is not configured" }, { status: 500 })
        }

        const { text, languageCode } = await request.json()

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        // Sarvam TTS request
        const res = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
                "api-subscription-key": SARVAM_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                target_language_code: languageCode || "en-IN",
                model: "bulbul:v3",
            }),
        })

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}))
            console.error("Sarvam API error:", errBody)
            return NextResponse.json({ 
                error: `Sarvam API error: ${errBody?.message || res.statusText || res.status}` 
            }, { status: res.status })
        }

        const data = await res.json()
        
        // Sarvam returns { request_id: string, audios: [base64_string] }
        if (!data.audios || data.audios.length === 0) {
            return NextResponse.json({ error: "No audio returned from Sarvam" }, { status: 502 })
        }

        return NextResponse.json({ audioBase64: data.audios[0] })
    } catch (error: any) {
        console.error("Sarvam Proxy error:", error)
        return NextResponse.json({ error: error.message || "Failed to generate TTS" }, { status: 500 })
    }
}
