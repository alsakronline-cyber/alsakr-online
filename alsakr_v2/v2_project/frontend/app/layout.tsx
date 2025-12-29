import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Al Sakr Online V2 | Industrial AI Command Center',
    description: 'The next generation of industrial spare parts procurement and management.',
};

import { AuthProvider } from './providers';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-200 antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
