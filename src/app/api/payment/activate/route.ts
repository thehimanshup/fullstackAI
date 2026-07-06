import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

// Calculate subscription expiry date based on plan
function getExpiryDate(planId: string): Date {
    const now = new Date()
    switch (planId) {
        case "MONTHLY":
            now.setMonth(now.getMonth() + 1)
            break
        case "QUARTERLY":
            now.setMonth(now.getMonth() + 3)
            break
        case "ANNUAL":
            now.setFullYear(now.getFullYear() + 1)
            break
        default:
            now.setMonth(now.getMonth() + 1)
    }
    return now
}

const VALID_PLANS = ["MONTHLY", "QUARTERLY", "ANNUAL"]

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { userId, planId } = await req.json()

        // Make sure the request userId matches the authenticated user
        if (userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        if (!VALID_PLANS.includes(planId)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
        }

        const expiryDate = getExpiryDate(planId)

        await prisma.user.update({
            where: { id: userId },
            data: {
                subscription: planId,
                subscriptionExpiry: expiryDate,
            },
        })

        return NextResponse.json({
            success: true,
            plan: planId,
            expiry: expiryDate,
        })
    } catch (error) {
        console.error("Activate plan error:", error)
        return NextResponse.json({ error: "Failed to activate plan" }, { status: 500 })
    }
}
