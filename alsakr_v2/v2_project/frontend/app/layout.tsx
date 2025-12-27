import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Al Sakr Online V2 | Industrial AI Command Center',
    description: 'The next generation of industrial spare parts procurement and management.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
                {children}
            </body>
        </html>
    );
}
