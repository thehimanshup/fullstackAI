import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Target, TrendingUp, BookOpen, ArrowRight } from "lucide-react"
import { getDashboardData } from "./actions"
import Link from "next/link"

export default async function DashboardPage() {
    const { user, stats } = await getDashboardData()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Welcome back, {user.name?.split(' ')[0] || 'Aspirant'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Ready to crush your goals today?
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Day Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.streak > 0 ? "🔥 Keep the fire burning!" : "Start today to build your streak!"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.accuracy}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.accuracy >= 80 ? "Excellent performance!" : stats.accuracy >= 60 ? "Good, keep improving!" : "Practice more to improve"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Questions Solved</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.solved}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.solved > 0 ? "Top 5% of students" : "Start solving to track progress!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/tutor" className="group p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">AI Tutor</p>
                            <p className="text-xs text-gray-400">Ask doubts instantly — 24/7</p>
                        </div>
                        <ArrowRight className="ml-auto h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                </Link>
                <Link href="/dashboard/analytics" className="group p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 hover:border-green-500/40 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">Analytics</p>
                            <p className="text-xs text-gray-400">Track your progress & growth</p>
                        </div>
                        <ArrowRight className="ml-auto h-4 w-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                    </div>
                </Link>
            </div>
        </div>
    )
}
