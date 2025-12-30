import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import PocketBase from "pocketbase";

// Use internal Docker network URL for server-side operations
const pb = new PocketBase(process.env.PB_INTERNAL_URL || "http://pocketbase:8090");

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Use internal Docker network URL for server-side operations
                const pbInstance = new PocketBase(process.env.PB_INTERNAL_URL || "http://pocketbase:8090");

                try {
                    const authData = await pbInstance.collection("users").authWithPassword(
                        credentials.email,
                        credentials.password
                    );

                    if (authData.token) {
                        return {
                            id: authData.record.id,
                            email: authData.record.email,
                            name: authData.record.name,
                            role: authData.record.role,
                            token: authData.token,
                        };
                    }
                    return null;
                } catch (error: any) {
                    console.error("Auth error details:", {
                        message: error.message,
                        status: error.status,
                        data: error.data
                    });

                    if (error.message && (error.message.includes("verify your email") ||
                        error.message.includes("identities") ||
                        error.status === 400)) {
                        const message = error.data?.message || error.message;
                        throw new Error(message);
                    }

                    throw new Error("Invalid email or password");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role; // Add role
                token.accessToken = (user as any).token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session as any).user.id = token.id;
                (session as any).user.role = token.role; // Add role
                (session as any).user.accessToken = token.accessToken;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "CHANGE_ME",
};
