import type { Metadata } from 'next'
import { Inter, Poppins, IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
    weight: ['400', '600', '700'],
    subsets: ['latin'],
    variable: '--font-poppins'
})
const arabic = IBM_Plex_Sans_Arabic({
    weight: ['400', '500', '600', '700'],
    subsets: ['arabic'],
    variable: '--font-arabic'
})

export const metadata: Metadata = {
    title: 'Alsakr Online | AI Spare Parts Marketplace',
    description: 'AI-powered industrial spare parts marketplace for the MENA region.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable,
                poppins.variable,
                arabic.variable
            )}>
                <LanguageProvider>
                    <AuthProvider>
                        <CartProvider>
                            {children}
                        </CartProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    )
}
