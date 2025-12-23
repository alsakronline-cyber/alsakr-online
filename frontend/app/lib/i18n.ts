type Language = 'en' | 'ar';

const translations = {
    en: {
        dashboard: "Dashboard",
        inquiries: "Inquiries",
        quotes: "Quotes",
        analytics: "Analytics",
        uploadImage: "Upload Image",
        search: "Search",
        processing: "Processing...",
        results: "Results",
        partNumber: "Part Number",
        manufacturer: "Manufacturer",
        description: "Description",
        status: "Status",
        actions: "Actions",
        pending: "Pending",
        quoted: "Quoted",
        closed: "Closed",
    },
    ar: {
        dashboard: "لوحة التحكم",
        inquiries: "الاستفسارات",
        quotes: "عروض الأسعار",
        analytics: "التحليلات",
        uploadImage: "رفع صورة",
        search: "بحث",
        processing: "جاري المعالجة...",
        results: "النتائج",
        partNumber: "رقم القطعة",
        manufacturer: "المصنع",
        description: "الوصف",
        status: "الحالة",
        actions: "إجراءات",
        pending: "قيد الانتظار",
        quoted: "تم التسعير",
        closed: "مغلق",
    }
};

export const useTranslation = (lang: Language) => {
    return (key: keyof typeof translations['en']) => {
        return translations[lang][key] || key;
    };
};
