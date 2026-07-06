import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name, phone, role, language, classGoal, teacherCode } = body

        if (!email || !password || !name || !role) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        if (role === "TEACHER" && teacherCode !== "Fullstack409") {
            return new NextResponse("Invalid teacher code", { status: 403 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone,
                role,
                language,
                classGoal: role === "STUDENT" ? classGoal : null,
            }
        })

        return NextResponse.json(user)

    } catch (error) {
        console.error("REGISTER_ERROR", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
