"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Eye, EyeOff, UserPlus, GraduationCap, BookOpen } from "lucide-react"

export default function SignupPage() {
    const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        language: "English",
        classGoal: "",
        teacherCode: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role })
            })

            if (res.ok) {
                // Auto-login after successful registration
                const loginRes = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                })

                if (loginRes?.ok) {
                    // New users always go to subscription page
                    router.push("/subscription")
                } else {
                    // Fallback to login page
                    router.push("/login?registered=true")
                }
            } else {
                const text = await res.text()
                if (res.status === 409) {
                    setError("An account with this email already exists. Please log in.")
                } else if (res.status === 403) {
                    setError("Invalid teacher invitation code. Please check and try again.")
                } else {
                    setError(text || "Registration failed. Please try again.")
                }
            }
        } catch {
            setError("Network error. Please check your connection and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-background to-background" />

            <Card className="w-full max-w-md relative z-10 bg-black/40 border-white/10 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                        Join FullStack AI Platform today
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {/* Role Toggle */}
                    <div className="flex gap-3 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
                        <button
                            type="button"
                            onClick={() => setRole("STUDENT")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === "STUDENT"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <GraduationCap className="h-4 w-4" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("TEACHER")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${role === "TEACHER"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <BookOpen className="h-4 w-4" />
                            Teacher
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Phone <span className="text-gray-500">(optional)</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Language</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi (हिंदी)</option>
                                <option value="Bengali">Bengali (বাংলা)</option>
                                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                                <option value="Malayalam">Malayalam (മലയാളം)</option>
                                <option value="Marathi">Marathi (मराठी)</option>
                                <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                                <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                                <option value="Tamil">Tamil (தமிழ்)</option>
                                <option value="Telugu">Telugu (తెలుగు)</option>
                            </select>
                        </div>

                        {role === "STUDENT" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Class / Exam Goal</label>
                                <input
                                    type="text"
                                    name="classGoal"
                                    required
                                    value={formData.classGoal}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. 12th JEE, NEET, UPSC"
                                />
                            </div>
                        )}

                        {role === "TEACHER" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-200">Invitation Code</label>
                                <input
                                    type="text"
                                    name="teacherCode"
                                    required
                                    value={formData.teacherCode}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="Enter teacher invitation code"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-3 pr-10 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="At least 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            variant="premium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Creating account...
                                </span>
                            ) : "Create Account & Get Started"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        <p>Already have an account?{" "}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                                Login here
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
