import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Calculate subscription expiry date based on plan
function getExpiryDate(planId: string): Date {
    const now = new Date();
    switch (planId) {
        case "MONTHLY":
            now.setMonth(now.getMonth() + 1);
            break;
        case "QUARTERLY":
            now.setMonth(now.getMonth() + 3);
            break;
        case "ANNUAL":
            now.setFullYear(now.getFullYear() + 1);
            break;
        default:
            now.setMonth(now.getMonth() + 1);
    }
    return now;
}

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            planId
        } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const expiryDate = getExpiryDate(planId);

            // Update user subscription in database
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscription: planId,       // "MONTHLY" | "QUARTERLY" | "ANNUAL"
                    subscriptionExpiry: expiryDate,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Payment verified successfully",
                plan: planId,
                expiry: expiryDate,
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid payment signature" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Razorpay Verification Error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
