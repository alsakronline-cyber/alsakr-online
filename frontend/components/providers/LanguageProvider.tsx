"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Language = "en" | "ar"
type Direction = "ltr" | "rtl"

interface LanguageContextType {
    language: Language
    direction: Direction
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en")
    const [direction, setDirection] = useState<Direction>("ltr")

    useEffect(() => {
        // Load from local storage or default to English
        const savedLang = localStorage.getItem("language") as Language
        if (savedLang) {
            setLanguage(savedLang)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        const dir = lang === "ar" ? "rtl" : "ltr"
        setLanguageState(lang)
        setDirection(dir)
        localStorage.setItem("language", lang)

        // Update document attributes for Tailwind CSS RTL support
        document.documentElement.lang = lang
        document.documentElement.dir = dir
    }

    return (
        <LanguageContext.Provider value={{ language, direction, setLanguage }}>
            <div dir={direction} className={direction === "rtl" ? "font-arabic" : "font-sans"}>
                {children}
            </div>
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
