
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) {
                    return null
                }

                const bcrypt = await import("bcryptjs")
                const passwordsMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (passwordsMatch) {
                    return user
                }

                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // On first sign-in, seed the token with user data
            if (user) {
                const u = user as any
                token.id = u.id
                token.role = u.role
                token.language = u.language
            }

            // On every subsequent request, refresh user fields from DB so
            // language/role changes in Settings are reflected immediately
            // without requiring a re-login.
            if (token.sub) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                        select: { id: true, role: true, language: true },
                    })
                    if (dbUser) {
                        token.id = dbUser.id
                        token.role = dbUser.role
                        token.language = dbUser.language
                    }
                } catch {
                    // DB temporarily unavailable — keep existing token values
                }
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Prefer token.id (explicitly set above) over token.sub
                session.user.id = (token.id as string) || token.sub
                // @ts-ignore
                session.user.role = token.role
                // @ts-ignore
                session.user.language = token.language
            }
            return session
        }
    }
})
