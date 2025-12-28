import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.PB_URL || 'http://pocketbase:8090');

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const authData = await pb.collection('users').authWithPassword(
                        credentials.email,
                        credentials.password
                    );

                    if (authData.record) {
                        return {
                            id: authData.record.id,
                            email: authData.record.email,
                            name: authData.record.name,
                        };
                    }
                    return null;
                } catch (e) {
                    console.error('PocketBase Auth Error:', e);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
