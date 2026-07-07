
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
            // At first sign-in, bake user fields into the token
            if (user) {
                const u = user as any
                // Explicitly set token.id from the DB user object so it is
                // always the real CUID, never undefined
                token.id       = u.id
                token.role     = u.role
                token.language = u.language
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // Prefer the explicit token.id we set; token.sub is NextAuth's
                // auto-set field and is identical but this makes it unambiguous
                session.user.id = (token.id as string) ?? token.sub ?? ""
                // @ts-ignore
                session.user.role     = token.role
                // @ts-ignore
                session.user.language = token.language
            }
            return session
        }
    }
})
