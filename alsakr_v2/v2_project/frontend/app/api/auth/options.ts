import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090");

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

                    if (authData.token) {
                        return {
                            id: authData.record.id,
                            email: authData.record.email,
                            name: authData.record.name,
                            token: authData.token,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.accessToken = (user as any).token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session as any).user.id = token.id;
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
