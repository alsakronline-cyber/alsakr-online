import { notFound } from 'next/navigation';

export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

// Simplified for Next.js App Router without next-intl middleware for now
// In a full implementation, you'd integrate next-intl or react-i18next here.
export function getDictionary(locale: string) {
    if (!locales.includes(locale)) return null;
    try {
        // This assumes JSON files exist in public/locales
        // For this task, we'll return a stub or mock
        return {
            "welcome": locale === 'en' ? "Welcome" : "أهلا بك"
        }
    } catch (error) {
        return null;
    }
}
