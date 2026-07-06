"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Bot, CheckCircle, BarChart2, Settings, LogOut, CreditCard } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Academic Hub", href: "/dashboard/hub" },
    { icon: Bot, label: "Socratic Mentor", href: "/dashboard/tutor" },
    { icon: CheckCircle, label: "Rubric Evaluator", href: "/dashboard/evaluator" },
    { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
    { icon: CreditCard, label: "Subscription", href: "/subscription" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        await signOut({ redirect: false })
        router.push("/")
        router.refresh()
    }

    const userInitial = session?.user?.name
        ? session.user.name.charAt(0).toUpperCase()
        : session?.user?.email?.charAt(0).toUpperCase() || "A"

    return (
        <div className="w-64 h-screen bg-black/40 border-r border-white/10 flex flex-col fixed left-0 top-0 pt-20">
            {/* User Profile at top */}
            {session?.user && (
                <div className="px-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {userInitial}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {session.user.name || "Aspirant"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                                {session.user.email}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Links */}
            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary/20 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                    {isSigningOut ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                    ) : (
                        <LogOut className="h-5 w-5" />
                    )}
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                </button>
            </div>
        </div>
    )
}
