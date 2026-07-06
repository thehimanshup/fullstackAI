"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Check, Zap, Star, Crown, ArrowRight, Shield, ExternalLink, CheckCircle2, X, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const RAZORPAY_LINK = "https://razorpay.me/@himanshupandey2458"

const plans = [
    {
        id: "MONTHLY",
        name: "Monthly",
        price: 200,
        period: "/month",
        icon: <Zap className="h-6 w-6" />,
        color: "from-blue-500 to-cyan-500",
        borderColor: "border-blue-500/30",
        glowColor: "shadow-blue-500/20",
        bgColor: "from-blue-500/10 to-cyan-500/5",
        features: [
            "Unlimited AI Tutor sessions",
            "Advanced Analytics",
            "Rubric Evaluator (unlimited)",
            "Practice quizzes",
            "Priority support",
        ],
        popular: false,
        savings: null,
    },
    {
        id: "QUARTERLY",
        name: "Quarterly",
        price: 400,
        period: "/3 months",
        icon: <Star className="h-6 w-6" />,
        color: "from-purple-500 to-pink-500",
        borderColor: "border-purple-500/50",
        glowColor: "shadow-purple-500/30",
        bgColor: "from-purple-500/15 to-pink-500/10",
        features: [
            "Everything in Monthly",
            "Save ₹200 vs monthly",
            "Exam blueprint access",
            "Voice mode (Hindi & English)",
            "Dedicated doubt sessions",
            "Progress reports",
        ],
        popular: true,
        savings: "Save 33%",
    },
    {
        id: "ANNUAL",
        name: "Annual",
        price: 1099,
        period: "/year",
        icon: <Crown className="h-6 w-6" />,
        color: "from-yellow-500 to-orange-500",
        borderColor: "border-yellow-500/30",
        glowColor: "shadow-yellow-500/20",
        bgColor: "from-yellow-500/10 to-orange-500/5",
        features: [
            "Everything in Quarterly",
            "Save ₹1301 vs monthly",
            "Offline study material",
            "1-on-1 mentor sessions",
            "Certificate of completion",
            "Early access to new features",
        ],
        popular: false,
        savings: "Save 54%",
    },
]

export default function SubscriptionPage() {
    const { data: session } = useSession()
    const router = useRouter()

    // Step: "plans" | "payment-pending" | "success"
    const [step, setStep] = useState<"plans" | "payment-pending" | "success">("plans")
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
    const [isActivating, setIsActivating] = useState(false)
    const [activateError, setActivateError] = useState("")

    // 1. User selects a plan — open payment link + show confirmation modal
    const handleSelectPlan = (plan: typeof plans[0]) => {
        setSelectedPlan(plan)
        // Open the Razorpay.me link in a new tab so user can pay
        window.open(RAZORPAY_LINK, "_blank", "noopener,noreferrer")
        setStep("payment-pending")
    }

    // 2. User clicks "I've Paid" — call API to activate the plan
    const handleActivate = async () => {
        if (!selectedPlan || !session?.user?.id) return

        setIsActivating(true)
        setActivateError("")

        try {
            const res = await fetch("/api/payment/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: session.user.id,
                    planId: selectedPlan.id,
                }),
            })

            if (res.ok) {
                setStep("success")
                // Redirect after 2.5s
                setTimeout(() => router.push("/dashboard"), 2500)
            } else {
                const data = await res.json()
                setActivateError(data.error || "Failed to activate plan. Please contact support.")
            }
        } catch {
            setActivateError("Network error. Please try again.")
        } finally {
            setIsActivating(false)
        }
    }

    const handleContinueFree = () => router.push("/dashboard")

    const handleBackToPlans = () => {
        setStep("plans")
        setSelectedPlan(null)
        setActivateError("")
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-background to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />

            <div className="relative z-10 container mx-auto px-4 py-16">

                <AnimatePresence mode="wait">

                    {/* ─── STEP 1: Plan Selection ─── */}
                    {step === "plans" && (
                        <motion.div
                            key="plans"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Header */}
                            <div className="text-center mb-14">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-6 backdrop-blur-sm">
                                    <Shield className="h-4 w-4" />
                                    Unlock Your Full Potential
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-400">
                                    Choose Your Plan
                                </h1>
                                <p className="text-xl text-gray-400 max-w-xl mx-auto">
                                    Join 30,000+ students crushing their exams with AI-powered learning
                                </p>
                            </div>

                            {/* How it works strip */}
                            <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">1</span>
                                    Pick a plan below
                                </div>
                                <ArrowRight className="hidden sm:block h-4 w-4 text-gray-500" />
                                <div className="flex items-center gap-2">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">2</span>
                                    Pay via Razorpay link
                                </div>
                                <ArrowRight className="hidden sm:block h-4 w-4 text-gray-500" />
                                <div className="flex items-center gap-2">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">3</span>
                                    Confirm &amp; activate instantly
                                </div>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {plans.map((plan, i) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`relative rounded-2xl border backdrop-blur-sm overflow-hidden flex flex-col ${plan.borderColor} ${plan.popular ? `shadow-2xl ${plan.glowColor}` : ""}`}
                                    >
                                        {/* Background gradient */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgColor} opacity-60`} />

                                        {/* Most Popular Badge */}
                                        {plan.popular && (
                                            <div className={`absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold tracking-wider text-white bg-gradient-to-r ${plan.color}`}>
                                                ✦ MOST POPULAR ✦
                                            </div>
                                        )}

                                        <div className={`relative p-6 flex flex-col flex-1 ${plan.popular ? "pt-10" : ""}`}>
                                            {/* Plan Header */}
                                            <div className="mb-6">
                                                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${plan.color} text-white mb-3`}>
                                                    {plan.icon}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                                                    {plan.savings && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold">
                                                            {plan.savings}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-baseline gap-1">
                                                    <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                                                    <span className="text-gray-400 text-sm">{plan.period}</span>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-3 mb-8 flex-1">
                                                {plan.features.map((feature, j) => (
                                                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-300">
                                                        <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                                            <Check className="h-2.5 w-2.5 text-white" />
                                                        </div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Pay amount hint */}
                                            <div className="mb-3 p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-gray-400">
                                                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-400" />
                                                Pay exactly <span className="font-bold text-white mx-1">₹{plan.price}</span> on the payment page
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => handleSelectPlan(plan)}
                                                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 
                                                    bg-gradient-to-r ${plan.color} hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                                            >
                                                Pay ₹{plan.price}
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Trust badges */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-500"
                            >
                                <span className="flex items-center gap-2">🔒 Secured by Razorpay</span>
                                <span className="flex items-center gap-2">✅ Instant Activation</span>
                                <span className="flex items-center gap-2">↩️ 7-day Refund Policy</span>
                                <span className="flex items-center gap-2">📞 24/7 Support</span>
                            </motion.div>

                            {/* Skip */}
                            <div className="text-center mt-8">
                                <button
                                    onClick={handleContinueFree}
                                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
                                >
                                    Continue with limited free access →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 2: Payment Pending — Confirm Modal ─── */}
                    {step === "payment-pending" && selectedPlan && (
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-center min-h-[70vh]"
                        >
                            <div className="w-full max-w-md">
                                <div className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden p-8">
                                    {/* Close */}
                                    <button
                                        onClick={handleBackToPlans}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    {/* Plan badge */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${selectedPlan.color} mb-6`}>
                                        {selectedPlan.icon}
                                        {selectedPlan.name} Plan — ₹{selectedPlan.price}
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2">Complete Your Payment</h2>
                                    <p className="text-gray-400 text-sm mb-6">
                                        A Razorpay payment page has opened in a new tab. Please follow these steps:
                                    </p>

                                    {/* Steps */}
                                    <ol className="space-y-4 mb-8">
                                        {[
                                            {
                                                step: 1,
                                                text: `Enter the amount ₹${selectedPlan.price} on the payment page`,
                                                done: false,
                                            },
                                            {
                                                step: 2,
                                                text: "Complete the payment using UPI, card, or netbanking",
                                                done: false,
                                            },
                                            {
                                                step: 3,
                                                text: "Return here and click \"I've Paid\" to activate your plan",
                                                done: false,
                                            },
                                        ].map((item) => (
                                            <li key={item.step} className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${selectedPlan.color} text-white`}>
                                                    {item.step}
                                                </div>
                                                <p className="text-sm text-gray-300 pt-0.5">{item.text}</p>
                                            </li>
                                        ))}
                                    </ol>

                                    {/* Re-open payment link */}
                                    <a
                                        href={RAZORPAY_LINK}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full mb-3 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 
                                            bg-gradient-to-r ${selectedPlan.color} hover:opacity-90 border-0`}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Open Payment Page Again
                                    </a>

                                    {activateError && (
                                        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            {activateError}
                                        </div>
                                    )}

                                    {/* Confirm payment */}
                                    <button
                                        onClick={handleActivate}
                                        disabled={isActivating}
                                        className="w-full py-3 px-6 rounded-xl font-semibold text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {isActivating ? (
                                            <>
                                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                Activating your plan...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                I've Paid — Activate My Plan
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-gray-500 mt-4">
                                        Only click after completing payment. We verify all transactions.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── STEP 3: Success ─── */}
                    {step === "success" && selectedPlan && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center min-h-[70vh]"
                        >
                            <div className="text-center max-w-md">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30"
                                >
                                    <CheckCircle2 className="h-12 w-12 text-white" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mb-3">You're All Set! 🎉</h2>
                                <p className="text-gray-400 mb-2">
                                    Your <span className={`font-bold bg-clip-text text-transparent bg-gradient-to-r ${selectedPlan.color}`}>{selectedPlan.name} Plan</span> is now active.
                                </p>
                                <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>

                                <div className="mt-8">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2.5 }}
                                            className={`h-full bg-gradient-to-r ${selectedPlan.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
