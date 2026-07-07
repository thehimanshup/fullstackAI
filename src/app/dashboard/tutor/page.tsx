"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Send, Bot, User, Sparkles, Volume2, VolumeX } from "lucide-react"
import { chatWithAI } from "./actions"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

const LANG_MAP: Record<string, string> = {
    "English":    "en-IN",
    "Hindi":      "hi-IN",
    "Marathi":    "mr-IN",
    "Tamil":      "ta-IN",
    "Telugu":     "te-IN",
    "Bengali":    "bn-IN",
    "Gujarati":   "gu-IN",
    "Kannada":    "kn-IN",
    "Malayalam":  "ml-IN",
    "Odia":       "od-IN",
    "Punjabi":    "pa-IN",
}

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function TutorPage() {
    // Fetch language fresh from DB so Settings changes take effect immediately
    // (JWT tokens cache the language and only update on re-login)
    const [userLanguage, setUserLanguage] = useState("English")
    const speechLangCode = LANG_MAP[userLanguage] || "en-IN"

    useEffect(() => {
        fetch("/api/auth/profile")
            .then(r => r.ok ? r.json() : null)
            .then(profile => {
                if (profile?.language) setUserLanguage(profile.language)
            })
            .catch(() => {}) // silently fall back to "English"
    }, [])

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I'm your AI Tutor. 🤖\n\nI can help you with:\n✓ Physics, Chemistry, Mathematics\n✓ JEE, NEET, UPSC preparation\n✓ Doubt solving with step-by-step explanations\n✓ Concept clarification in Hindi or English\n\nWhat would you like to study today?"
        }
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Instantiate audio object on mount
    useEffect(() => {
        audioRef.current = new Audio()
    }, [])

    // Pre-trigger voice loading (needed in Chrome/Safari)
    useEffect(() => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.getVoices()
            const handleVoices = () => window.speechSynthesis.getVoices()
            window.speechSynthesis.addEventListener("voiceschanged", handleVoices)
            return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoices)
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim() || isTyping) return

        const userMessage = input
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMessage }])

        // Web Standards Hack: Unlock HTML5 Audio engine inside user gesture boundary before async call
        if (audioRef.current && !isMuted) {
            audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
            audioRef.current.play().catch(() => {})
        }

        // Prepare context for Gemini
        // We skip the first assistant message if it's just the greeting
        const history = messages.map(msg => ({
            role: msg.role === "user" ? "user" as const : "model" as const,
            parts: [{ text: msg.content }]
        }))

        setIsTyping(true)
        try {
            const { responseText, learningEvent } = await chatWithAI(history, userMessage, userLanguage)
            setMessages(prev => [...prev, { role: "assistant", content: responseText }])
            speak(responseText)

            if (learningEvent) {
                setToastMessage(`🧠 Learning logged: ${learningEvent.subject} - ${learningEvent.chapter} (${learningEvent.isCorrect ? 'Correct' : 'Needs Practice'})`)
                setTimeout(() => setToastMessage(""), 4000)
            }
        } catch (error) {
            console.error("Error:", error)
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I encountered an error. Please check your internet connection and try again."
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const speak = async (text: string) => {
        if (isMuted) return

        // Remove markdown, links, images, formatting, and emojis for clean reading
        let cleanText = text.replace(/!\[.*?\]\(.*?\)/g, "")
        cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, "$1")
        cleanText = cleanText.replace(/[*_#`~]/g, "")
        cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        
        // Clean text can be up to 500 characters for high quality reading
        cleanText = cleanText.substring(0, 500).trim()
        if (!cleanText) return

        try {
            // Stop any currently playing audio to avoid overlays
            const existingAudio = (window as any)._tutorAudio
            if (existingAudio) {
                existingAudio.pause()
                existingAudio.currentTime = 0
            }

            // Call Sarvam Proxy API
            const res = await fetch("/api/tutor/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: cleanText,
                    languageCode: speechLangCode
                })
            })

            if (!res.ok) {
                throw new Error("Sarvam TTS API failed")
            }

            const { audioBase64 } = await res.json()
            
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = `data:audio/wav;base64,${audioBase64}`
                await audioRef.current.play()
            }
        } catch (e) {
            console.error("Sarvam TTS error, falling back to Web Speech API:", e)
            fallbackSpeechSynthesis(cleanText)
        }
    }

    const fallbackSpeechSynthesis = (cleanText: string) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(cleanText)
            utterance.lang = speechLangCode
            
            const voices = window.speechSynthesis.getVoices()
            const match = voices.find(v => v.lang.toLowerCase().includes(speechLangCode.toLowerCase()))
            if (match) {
                utterance.voice = match
            }
            window.speechSynthesis.speak(utterance)
        }
    }

    const [isListening, setIsListening] = useState(false)
    const handleVoiceInput = () => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            alert("Speech recognition is not supported in your browser.")
            return
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.lang = speechLangCode
        recognition.interimResults = false

        recognition.onstart = () => {
            setIsListening(true)
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInput(prev => prev + " " + transcript)
        }

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto relative">
            {toastMessage && (
                <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium border border-white/20 flex items-center gap-2">
                        {toastMessage}
                    </div>
                </div>
            )}
            <div className="mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Socratic Mentor
                </h1>
                <p className="text-sm text-muted-foreground">Ask questions, don't expect direct answers.</p>
            </div>

            <Card className="flex-1 flex flex-col bg-black/40 border-white/10 overflow-hidden">
                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-500",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                                msg.role === "assistant"
                                    ? "bg-gradient-to-br from-purple-600 to-pink-600"
                                    : "bg-gradient-to-br from-blue-600 to-cyan-600"
                            )}>
                                {msg.role === "assistant" ? (
                                    <Bot className="h-5 w-5 text-white" />
                                ) : (
                                    <User className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed relative group",
                                    msg.role === "assistant"
                                        ? "bg-white/10 text-gray-100 rounded-tl-none shadow-lg prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none pr-10"
                                        : "bg-gradient-to-br from-primary to-primary/80 text-white rounded-tr-none shadow-lg whitespace-pre-wrap"
                                )}
                            >
                                {msg.role === "assistant" ? (
                                    <>
                                        <ReactMarkdown
                                            components={{
                                                img: ({ node, ...props }) => <img {...props} className="rounded-lg my-3 w-full max-w-sm border border-white/20 shadow-md" />,
                                                a: ({ node, ...props }) => <a {...props} target="_blank" className="text-purple-300 hover:text-purple-200 underline font-semibold inline-flex items-center mt-2 p-2 bg-purple-500/20 rounded-lg break-words max-w-full" />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                        <button
                                            onClick={() => speak(msg.content)}
                                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/15 hover:border-white/20 cursor-pointer"
                                            title="Read Aloud"
                                        >
                                            <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                                        </button>
                                    </>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4 max-w-[85%] animate-in fade-in">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/10 rounded-tl-none shadow-lg">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-sm">
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn("rounded-full h-12 w-12 hover:bg-white/10 group", isListening && "bg-red-500/20 text-red-500")}
                            title="Hold to talk"
                            onMouseDown={handleVoiceInput}
                            onTouchStart={handleVoiceInput}
                        >
                            <Mic className={cn("h-5 w-5 transition-colors", isListening ? "text-red-500 animate-pulse" : "text-purple-400 group-hover:text-purple-300")} />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full h-12 w-12 hover:bg-white/10 group"
                            title={isMuted ? "Unmute Read Aloud" : "Mute Read Aloud"}
                            onClick={() => {
                                if (!isMuted) {
                                    window.speechSynthesis.cancel()
                                }
                                setIsMuted(!isMuted)
                            }}
                        >
                            {isMuted ? (
                                <VolumeX className="h-5 w-5 text-gray-500 group-hover:text-gray-400" />
                            ) : (
                                <Volume2 className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                            )}
                        </Button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Speak or type your reasoning..."}
                            className="flex-1 bg-black/50 border border-white/10 rounded-full px-6 focus:outline-none focus:border-purple-500 transition-colors text-white placeholder:text-gray-500"
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                            disabled={isTyping}
                        />
                        <Button
                            size="icon"
                            variant="premium"
                            className="rounded-full h-12 w-12 shadow-lg"
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        💡 Tip: Try speaking your thoughts aloud using the microphone.
                    </p>
                </div>
            </Card>
        </div>
    )
}
