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

                try {
                    const authData = await pb.collection("users").authWithPassword(
                        credentials.email,
                        credentials.password
                    );

                    /* 
                    // Check if email is verified
                    if (!authData.record.verified) {
                        throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
                    }
                    */

                    if (authData.token) {
                        return {
                            id: authData.record.id,
                            email: authData.record.email,
                            name: authData.record.name,
                            role: authData.record.role, // Add role
                            token: authData.token,
                        };
                    }
                    return null;
                } catch (error: any) {
                    console.error("Auth error:", error);
                    // Pass through the verification error message
                    if (error.message && error.message.includes("verify your email")) {
                        throw error;
                    }
                    return null;
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
