"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame, Target, TrendingUp, Clock, BookOpen,
  CheckCircle2, XCircle, RefreshCw, Zap, Award,
  BarChart3, Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── Types ─────────────────────────────────────────────────────────────────────

interface DayData { date: string; count: number; correct: number }
interface SubjectStat { subject: string; total: number; correct: number; accuracy: number }
interface Session {
  id: string; subject: string; chapter: string
  isCorrect: boolean; timeTaken: number; createdAt: string
}
interface AnalyticsData {
  stats: {
    total: number; correct: number; accuracy: number
    avgTime: number; streak: number; todayCount: number
  }
  last7: DayData[]
  subjectStats: SubjectStat[]
  recentSessions: Session[]
  updatedAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const REFRESH_MS = 30_000 // refresh every 30 seconds

function StatCard({
  label, value, sub, icon: Icon, color, delay = 0
}: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; color: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className={`bg-gradient-to-br ${color} border-opacity-30`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Icon className="h-4 w-4 opacity-70" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black tracking-tight">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Bar chart for 7-day activity ──────────────────────────────────────────────

function ActivityBar({ data }: { data: DayData[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {data.map((d, i) => {
        const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0
        const acc = d.count > 0 ? Math.round((d.correct / d.count) * 100) : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 text-xs text-white px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <div className="font-bold">{d.count} attempts</div>
              {d.count > 0 && <div className="text-green-400">{acc}% accuracy</div>}
            </div>
            <div className="w-full relative flex items-end" style={{ height: "100px" }}>
              <motion.div
                className={`w-full rounded-t-lg ${d.count === 0
                  ? "bg-white/5"
                  : acc >= 80 ? "bg-green-500/70"
                  : acc >= 60 ? "bg-blue-500/70"
                  : "bg-orange-500/70"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPct, d.count > 0 ? 8 : 3)}%` }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                style={{ minHeight: d.count > 0 ? "6px" : "2px" }}
              />
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">{d.date}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Subject accuracy bar ──────────────────────────────────────────────────────

function SubjectBar({ stat, delay = 0 }: { stat: SubjectStat; delay?: number }) {
  const color =
    stat.accuracy >= 80 ? "bg-green-500"
    : stat.accuracy >= 60 ? "bg-blue-500"
    : stat.accuracy >= 40 ? "bg-yellow-500"
    : "bg-red-500"

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1.5"
    >
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-white">{stat.subject}</span>
        <span className="text-muted-foreground text-xs">
          {stat.correct}/{stat.total} &nbsp;
          <span className={`font-bold ${
            stat.accuracy >= 80 ? "text-green-400"
            : stat.accuracy >= 60 ? "text-blue-400"
            : stat.accuracy >= 40 ? "text-yellow-400"
            : "text-red-400"
          }`}>{stat.accuracy}%</span>
        </span>
      </div>
      <div className="w-full h-2.5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${stat.accuracy}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000)

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed")
      const json: AnalyticsData = await res.json()
      setData(json)
      setLastRefreshed(new Date())
      setCountdown(REFRESH_MS / 1000)
    } catch {
      // silent — keep showing stale data
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => fetchData(), REFRESH_MS)
    return () => clearInterval(interval)
  }, [fetchData])

  // Countdown display
  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(tick)
  }, [lastRefreshed])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-purple-500/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-purple-400" />
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Loading your analytics...</p>
      </div>
    )
  }

  const { stats, last7, subjectStats, recentSessions } = data!

  const gradeLabel =
    stats.accuracy >= 90 ? "Outstanding 🏆"
    : stats.accuracy >= 75 ? "Excellent 🌟"
    : stats.accuracy >= 60 ? "Good 👍"
    : stats.accuracy >= 40 ? "Improving 📈"
    : "Keep Going 💪"

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Your Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Live data · auto-refreshes every 30s
          </p>
        </div>

        {/* Refresh indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            {lastRefreshed
              ? `Updated ${lastRefreshed.toLocaleTimeString()}`
              : "Loading..."}
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : `Refresh (${countdown}s)`}
          </button>
        </div>
      </div>

      {/* ── Overview Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Day Streak" value={`${stats.streak}🔥`} sub={stats.streak > 0 ? "Keep it up!" : "Start today"} icon={Flame} color="from-orange-500/15 to-transparent border-orange-500/20" delay={0} />
        <StatCard label="Accuracy" value={`${stats.accuracy}%`} sub={gradeLabel} icon={Target} color="from-blue-500/15 to-transparent border-blue-500/20" delay={0.05} />
        <StatCard label="Questions" value={stats.total} sub={`${stats.correct} correct`} icon={CheckCircle2} color="from-green-500/15 to-transparent border-green-500/20" delay={0.1} />
        <StatCard label="Today" value={stats.todayCount} sub="Attempted today" icon={Activity} color="from-purple-500/15 to-transparent border-purple-500/20" delay={0.15} />
        <StatCard label="Avg Speed" value={`${stats.avgTime}s`} sub="Per question" icon={Clock} color="from-cyan-500/15 to-transparent border-cyan-500/20" delay={0.2} />
        <StatCard label="Subjects" value={subjectStats.length} sub="Topics covered" icon={BookOpen} color="from-pink-500/15 to-transparent border-pink-500/20" delay={0.25} />
      </div>

      {/* ── 7-Day Activity & Performance Badge ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-white/10 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-purple-400" />
                7-Day Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {last7.every(d => d.count === 0) ? (
                <div className="flex flex-col items-center justify-center h-36 text-center">
                  <BarChart3 className="h-10 w-10 text-gray-600 mb-3" />
                  <p className="text-muted-foreground text-sm">No activity this week.</p>
                  <p className="text-xs text-gray-600 mt-1">Start learning to see your chart!</p>
                </div>
              ) : (
                <ActivityBar data={last7} />
              )}
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-green-500/70" />≥80% accuracy</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-500/70" />60-80%</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-orange-500/70" />&lt;60%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-white/10 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-yellow-400" />
                Performance Badge
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-4">
              {/* Ring */}
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <motion.circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={stats.accuracy >= 80 ? "#22c55e" : stats.accuracy >= 60 ? "#3b82f6" : stats.accuracy >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - stats.accuracy / 100) }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-black text-white">{stats.accuracy}%</span>
                  <span className="text-[10px] text-gray-400">Accuracy</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-lg">{gradeLabel}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0
                    ? `${stats.correct} correct out of ${stats.total}`
                    : "No attempts yet"}
                </p>
              </div>
              {/* Streak flame */}
              {stats.streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-bold text-orange-300">{stats.streak} day streak!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Subject-wise Performance ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectStats.length > 0 ? (
              <div className="space-y-5">
                {subjectStats.map((s, i) => (
                  <SubjectBar key={s.subject} stat={s} delay={0.45 + i * 0.05} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-muted-foreground text-sm">No subject data yet.</p>
                <p className="text-xs text-gray-600 mt-1">Start learning to see subject performance!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-400" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence>
                  {recentSessions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.04 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          s.isCorrect ? "bg-green-500/15" : "bg-red-500/15"
                        }`}>
                          {s.isCorrect
                            ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                            : <XCircle className="h-4 w-4 text-red-400" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {s.subject} · {s.chapter}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(s.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })} &nbsp;·&nbsp; {s.timeTaken}s
                          </p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.isCorrect
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-red-500/15 text-red-400 border border-red-500/20"
                      }`}>
                        {s.isCorrect ? "Correct" : "Wrong"}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-10 w-10 text-gray-600 mb-3" />
                <p className="text-muted-foreground text-sm">No activity yet.</p>
                <p className="text-xs text-gray-600 mt-1">Your learning sessions will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
