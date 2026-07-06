"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import {
  Brain, Target, Trophy, Zap, Check, Star, Crown,
  Quote, Lightbulb, Eye, Rocket, GraduationCap, ArrowRight,
  Video, Users, Bot
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const features = [
    {
      title: "Adaptive Quizzes",
      description: "AI-generated questions tailored to your weak areas and exam blueprints for JEE, NEET & UPSC.",
      icon: <Target className="h-6 w-6 text-purple-400" />,
      gradient: "from-purple-500/10 to-purple-500/5",
      border: "border-purple-500/20",
    },
    {
      title: "AI Personal Tutor",
      description: "24/7 doubt solving with voice-based explanations in Hindi & English using Socratic teaching.",
      icon: <Brain className="h-6 w-6 text-pink-400" />,
      gradient: "from-pink-500/10 to-pink-500/5",
      border: "border-pink-500/20",
    },
    {
      title: "Gamified Progress",
      description: "Earn badges, climb leaderboards, and visualize your mastery growth over time.",
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      gradient: "from-yellow-500/10 to-yellow-500/5",
      border: "border-yellow-500/20",
    },
    {
      title: "Rubric Evaluator",
      description: "AI-powered answer sheet evaluation — upload a marking scheme and get instant detailed feedback.",
      icon: <Zap className="h-6 w-6 text-blue-400" />,
      gradient: "from-blue-500/10 to-blue-500/5",
      border: "border-blue-500/20",
    },
  ]

  const pricing = [
    {
      id: "free",
      name: "Free Starter",
      price: "₹0",
      period: "forever",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "from-gray-500 to-slate-500",
      borderColor: "border-white/10",
      glowColor: "",
      bgColor: "from-white/5 to-white/2",
      features: [
        "5 AI Tutor sessions/month",
        "Basic quizzes",
        "Daily progress tracker",
        "Community forum access",
      ],
      cta: "Start Free",
      href: "/signup",
      external: false,
      popular: false,
      savings: null,
    },
    {
      id: "MONTHLY",
      name: "Monthly",
      price: "₹200",
      period: "/month",
      icon: <Zap className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-500/30",
      glowColor: "shadow-blue-500/20",
      bgColor: "from-blue-500/10 to-cyan-500/5",
      features: [
        "Unlimited AI Tutor sessions",
        "Advanced analytics dashboard",
        "Rubric Evaluator (unlimited)",
        "All practice quizzes",
        "Priority support",
      ],
      cta: "Get Monthly",
      href: "/subscription",
      external: false,
      popular: false,
      savings: null,
    },
    {
      id: "QUARTERLY",
      name: "Quarterly",
      price: "₹400",
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
        "Weekly progress reports",
      ],
      cta: "Get Quarterly",
      href: "/subscription",
      external: false,
      popular: true,
      savings: "Save 33%",
    },
    {
      id: "ANNUAL",
      name: "Annual",
      price: "₹1099",
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
      cta: "Get Annual",
      href: "/subscription",
      external: false,
      popular: false,
      savings: "Save 54%",
    },
  ]

  const stats = [
    { value: "1000+", label: "Active Students" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "3 Lakh+", label: "Questions Solved" },
    { value: "4.9★", label: "Average Rating" },
  ]

  return (
    <div className="min-h-screen">

      {/* ─── Hero ─── */}
      <section className="relative pt-28 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent" />

        {/* Floating orbs */}
        <div className="absolute top-32 left-10 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-pink-600/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-8 backdrop-blur-sm">
              🚀 Powering 1000+ Students Across India
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                Master Your Exams with
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                AI-Powered Intelligence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Personalized study plans, adaptive testing, and instant doubt solving for Students from 1-12, JEE, NEET, and UPSC —
              powered by cutting-edge AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="premium" className="text-lg px-10 py-6 h-auto" asChild>
                <Link href="/signup">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="glass" className="text-lg px-10 py-6 h-auto" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="py-12 border-y border-white/5 bg-white/2">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 relative">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose FullStack AI?</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built for India&apos;s most competitive learners — school students and exam aspirants alike.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full hover:bg-white/10 transition-all cursor-pointer group border ${feature.border} bg-gradient-to-br ${feature.gradient} hover:scale-[1.02]`}>
                  <CardHeader>
                    <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Coming Soon ─── */}
      <section className="py-28 relative overflow-hidden bg-white/2 border-y border-white/5">
        {/* Background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm font-medium text-cyan-300 mb-6">
              🔮 Upcoming Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              What&apos;s{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">
                Coming Next
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We&apos;re building the future of learning — here&apos;s a sneak peek at what&apos;s launching soon.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* Live Master Classes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group relative rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent backdrop-blur-sm p-7 hover:border-red-500/40 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-400 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
                    COMING SOON
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Live Master Classes</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  Join live, expert-led sessions for JEE, NEET &amp; UPSC. Interact with top educators in real-time, ask questions, and learn alongside thousands of motivated peers.
                </p>
                <ul className="space-y-2">
                  {["Live Q&A with expert educators", "Recorded replays on demand", "Subject-specific deep dives"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Avatar-Based AI Tutor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 }}
              className="group relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent backdrop-blur-sm p-7 hover:border-violet-500/40 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-violet-500/15 border border-violet-500/30 text-xs font-bold text-violet-400 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 inline-block" />
                    COMING SOON
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Avatar-Based AI Tutor</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  Meet your personal AI tutor with a lifelike animated avatar — making learning more engaging, expressive, and interactive than ever before.
                </p>
                <ul className="space-y-2">
                  {["Animated AI tutor avatar", "Emotion-aware explanations", "Interactive voice conversations"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Private Room Group Study */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24 }}
              className="group relative rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent backdrop-blur-sm p-7 hover:border-teal-500/40 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-teal-500/15 border border-teal-500/30 text-xs font-bold text-teal-400 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 inline-block" />
                    COMING SOON
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Private Room Group Study</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  Create or join private study rooms with your friends. Collaborate, quiz each other, share notes, and stay accountable together in a focused group environment.
                </p>
                <ul className="space-y-2">
                  {["Private invite-only study rooms", "Collaborative quizzes & notes", "Real-time group progress tracking"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

          </div>

          {/* Teaser strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              🚀 Stay tuned — these features are{" "}
              <span className="text-white font-semibold">launching very soon</span>.
              Sign up today to get{" "}
              <span className="text-cyan-400 font-semibold">early access</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-28 bg-white/2 border-y border-white/5">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">Choose the plan that fits your ambition and budget.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border backdrop-blur-sm overflow-hidden flex flex-col ${plan.borderColor}
                  ${plan.popular ? `shadow-2xl ${plan.glowColor}` : ""}`}
              >
                {/* Bg gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgColor} opacity-70`} />

                {/* Popular badge */}
                {plan.popular && (
                  <div className={`absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold tracking-wider text-white bg-gradient-to-r ${plan.color}`}>
                    ✦ MOST POPULAR ✦
                  </div>
                )}

                <div className={`relative p-6 flex flex-col flex-1 ${plan.popular ? "pt-10" : ""}`}>
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${plan.color} text-white mb-3`}>
                      {plan.icon}
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {plan.savings && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold">
                          {plan.savings}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-sm">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.href}
                    target={plan.external ? "_blank" : undefined}
                    rel={plan.external ? "noopener noreferrer" : undefined}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-center text-sm transition-all duration-200
                      bg-gradient-to-r ${plan.color} hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-md`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            All paid plans include a <span className="text-white font-medium">7-day refund policy</span> &mdash; no questions asked.
          </p>
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="py-28 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="container px-4 mx-auto relative z-10">

          {/* Objective & Vision */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-300 mb-6">
              About FullStack AI
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Mission &amp; Vision</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-purple-500/20">
                  <Rocket className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Objective</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-base">
                To democratize quality education across India by putting the power of AI in the hands of every
                student — regardless of their city, school, or economic background. We believe every aspirant
                deserves a personal tutor, a smart study companion, and the tools to reach their full potential.
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  "Make JEE/NEET/UPSC prep accessible to all",
                  "Replace rote learning with conceptual mastery",
                  "Provide real-time, personalised feedback",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <div className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-purple-500/40 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-purple-300" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-pink-500/5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-pink-500/20">
                  <Eye className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-base">
                To become India&apos;s most trusted AI-powered education platform — transforming how 100 million students
                learn, prepare, and succeed. We envision a future where every student has a brilliant, patient,
                always-available mentor guiding them at every step of their academic journey.
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  "100M students empowered by 2030",
                  "AI tutors in every regional language",
                  "Zero gap between urban & rural education",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <div className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-pink-500/40 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-pink-300" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Founder Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white">Meet the Founder</h3>
            </div>

            <div className="relative p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-purple-600/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-pink-600/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row gap-10 items-center md:items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                      <span className="text-5xl font-bold text-white">H</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Lightbulb className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium mb-4">
                    🏆 Founder &amp; CEO
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-1">Himanshu Pandey</h4>
                  <p className="text-purple-400 font-medium mb-5">Founder &amp; CEO, FullStack AI</p>

                  <div className="relative mb-6">
                    <Quote className="absolute -top-2 -left-1 h-5 w-5 text-purple-400/40" />
                    <p className="text-gray-300 leading-relaxed text-base italic pl-5">
                      I built FullStack AI after seeing brilliant students fail prestigious exams — not because they
                      lacked intelligence, but because they lacked access to quality guidance. Every student
                      deserves a Chanakya in their pocket — a mentor who knows them, believes in them, and
                      pushes them to their highest potential.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: "🎓", label: "Education", value: "Computer Science & AI" },
                      { icon: "💡", label: "Focus", value: "EdTech & AI Innovation" },
                      { icon: "🌍", label: "Impact", value: "1000+ Students Helped" },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-left">
                        <div className="text-xl mb-1">{item.icon}</div>
                        <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                        <div className="text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Philosophy strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl border border-white/10 bg-white/3 text-center"
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              FullStack AI is built on the belief that <span className="text-white font-semibold">intelligence is not fixed</span>.
              With the right tools, mentorship, and consistency, every student can achieve extraordinary results.
              Our platform combines the wisdom of India&apos;s greatest pedagogical traditions with the power of
              modern artificial intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 border-y border-white/5">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Preparation?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Join 30,000+ students who are already learning smarter with FullStack AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="premium" className="text-lg px-10 py-6 h-auto" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="glass" className="text-lg px-10 py-6 h-auto" asChild>
                <Link href="#pricing">View Plans</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-14 border-t border-white/10 bg-black/30">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
              <div>
                <span className="font-bold text-white text-lg">FullStack AI</span>
                <p className="text-xs text-gray-500">by Himanshu Pandey</p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#about" className="hover:text-white transition-colors">About</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2026 FullStack AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
