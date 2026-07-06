"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateLanguage(language: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.user.update({
        where: { id: session.user.id },
        data: { language }
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
}

export async function updateProfile(data: {
    name: string
    phone: string
    language: string
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    if (!data.name.trim()) throw new Error("Name cannot be empty")

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            name: data.name.trim(),
            phone: data.phone.trim() || null,
            language: data.language,
        }
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    if (newPassword.length < 6) throw new Error("Password must be at least 6 characters")

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user || !user.password) throw new Error("User not found")

    const bcrypt = await import("bcryptjs")
    const isCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isCorrect) throw new Error("Current password is incorrect")

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed }
    })

    return { success: true }
}

export async function deleteAccount() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Delete all user data
    await prisma.attempt.deleteMany({ where: { userId: session.user.id } })
    await prisma.userProgress.deleteMany({ where: { userId: session.user.id } })
    await prisma.session.deleteMany({ where: { userId: session.user.id } })
    await prisma.account.deleteMany({ where: { userId: session.user.id } })
    await prisma.user.delete({ where: { id: session.user.id } })

    return { success: true }
}

export async function getSettingsData() {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            language: true,
            subscription: true,
            subscriptionExpiry: true,
            role: true,
            classGoal: true,
        }
    })

    return user
}
