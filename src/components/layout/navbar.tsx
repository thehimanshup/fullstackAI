"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

export function Navbar() {
    const { data: session, status } = useSession()

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between"
        >
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                <span className="text-xl font-bold font-sans text-white">FullStack AI</span>
            </div>

            {status !== "authenticated" && (
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="#about" className="hover:text-white transition-colors">About</Link>
                </div>
            )}

            {status === "authenticated" ? (
                <div className="flex items-center gap-4">
                    <Button variant="premium" size="sm" asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white hidden sm:block">
                        Login
                    </Link>
                    <Button variant="premium" size="sm" asChild>
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            )}
        </motion.nav>
    )
}
