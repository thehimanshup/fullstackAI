"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner" // Assuming sonner is installed or will be used for notifications

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CheckoutButtonProps {
    amount: number
    planName: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium" | "glass"
    children: React.ReactNode
}

export function CheckoutButton({ amount, planName, variant = "premium", children }: CheckoutButtonProps) {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckout = async () => {
        if (!session?.user) {
            router.push("/login")
            return
        }

        setLoading(true)

        try {
            // 1. Create order on server
            const res = await fetch("/api/payment/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            })

            const order = await res.json()

            if (order.error) {
                throw new Error(order.error)
            }

            // 2. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: order.amount,
                currency: order.currency,
                name: "FullStack AI",
                description: `Upgrade to ${planName}`,
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify payment on server
                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: session?.user?.id,
                        }),
                    })

                    const verifyData = await verifyRes.json()

                    if (verifyData.success) {
                        toast.success("Payment Successful! Welcome to Pro.")
                        router.refresh()
                        router.push("/dashboard")
                    } else {
                        toast.error("Payment verification failed.")
                    }
                },
                prefill: {
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                },
                theme: {
                    color: "#8B5CF6", // Purple-500
                },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error) {
            console.error("Checkout Error:", error)
            toast.error("Something went wrong with the checkout.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            className="w-full mt-6"
            variant={variant}
            onClick={handleCheckout}
            disabled={loading}
        >
            {loading ? "Processing..." : children}
        </Button>
    )
}
