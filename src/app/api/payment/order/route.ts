import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Plan pricing in INR
const PLAN_PRICES: Record<string, number> = {
    MONTHLY: 200,
    QUARTERLY: 400,
    ANNUAL: 1099,
};

export async function POST(req: Request) {
    try {
        const { planId, currency = "INR" } = await req.json();

        const amount = PLAN_PRICES[planId];

        if (!amount) {
            return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency,
            receipt: `receipt_${planId}_${Date.now()}`,
            notes: { planId },
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ ...order, amount, planId });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
