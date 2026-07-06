import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CreditCard, Crown, Zap, Star, Calendar } from "lucide-react"
import { ProfileForm } from "./ProfileForm"
import { getSettingsData } from "./actions"
import Link from "next/link"

const PLAN_LABELS: Record<string, { label: string; color: string; icon: any }> = {
    FREE: { label: "Free Plan", color: "text-gray-400", icon: Zap },
    MONTHLY: { label: "Monthly Pro", color: "text-blue-400", icon: Zap },
    QUARTERLY: { label: "Quarterly Pro", color: "text-purple-400", icon: Star },
    ANNUAL: { label: "Annual Pro", color: "text-yellow-400", icon: Crown },
}

export default async function SettingsPage() {
    const user = await getSettingsData()

    const planInfo = user?.subscription ? PLAN_LABELS[user.subscription] || PLAN_LABELS.FREE : PLAN_LABELS.FREE
    const PlanIcon = planInfo.icon

    const isExpired = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) < new Date() : false
    const effectivePlan = isExpired ? "FREE" : (user?.subscription || "FREE")
    const effectivePlanInfo = PLAN_LABELS[effectivePlan] || PLAN_LABELS.FREE

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile + Security all-in-one using ProfileForm */}
            <ProfileForm
                defaultName={user?.name || ""}
                defaultPhone={user?.phone || ""}
                defaultLanguage={user?.language || "English"}
                userEmail={user?.email || ""}
            />

            {/* Subscription Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Subscription
                    </CardTitle>
                    <CardDescription>Manage your subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/5`}>
                                    <PlanIcon className={`h-5 w-5 ${effectivePlanInfo.color}`} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold text-lg ${effectivePlanInfo.color}`}>
                                        {effectivePlanInfo.label}
                                    </h3>
                                    {user?.subscriptionExpiry && !isExpired && (
                                        <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            Expires: {new Date(user.subscriptionExpiry).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "long", year: "numeric"
                                            })}
                                        </div>
                                    )}
                                    {isExpired && (
                                        <p className="text-sm text-red-400 mt-0.5">⚠️ Your plan has expired</p>
                                    )}
                                    {effectivePlan === "FREE" && (
                                        <p className="text-sm text-muted-foreground mt-0.5">Limited features</p>
                                    )}
                                </div>
                            </div>
                            <Button variant="premium" asChild>
                                <Link href="/subscription">
                                    {effectivePlan === "FREE" || isExpired ? "Upgrade Plan" : "Manage Plan"}
                                </Link>
                            </Button>
                        </div>

                        {effectivePlan === "FREE" && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-sm text-muted-foreground">
                                    Upgrade to unlock unlimited AI sessions, advanced analytics, voice mode, and more!
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {["₹200/month", "₹400/quarter", "₹1099/year"].map(p => (
                                        <span key={p} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Configure your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { label: "Daily Study Reminders", desc: "Get notified to maintain your streak", defaultChecked: true },
                        { label: "New Content Alerts", desc: "When new quizzes or topics are added", defaultChecked: true },
                        { label: "Performance Updates", desc: "Weekly progress summaries", defaultChecked: false },
                        { label: "Subscription Reminders", desc: "Alerts before plan expiry", defaultChecked: true },
                    ].map((item, i) => (
                        <label key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div>
                                <p className="font-medium text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    defaultChecked={item.defaultChecked}
                                    className="sr-only peer"
                                    id={`notif-${i}`}
                                />
                                <div className="w-10 h-5 bg-white/10 peer-checked:bg-purple-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-purple-500/20"></div>
                                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
                            </div>
                        </label>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
