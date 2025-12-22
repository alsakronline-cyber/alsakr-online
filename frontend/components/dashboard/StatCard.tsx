import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: string;
}

export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
    return (
        <div className="p-6 rounded-xl bg-gray-800 border border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                {Icon && (
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Icon className="w-6 h-6" />
                    </div>
                )}
                {trend && <span className="text-xs text-green-400 flex items-center">{trend}</span>}
            </div>
            <h3 className="text-3xl font-bold mb-1 text-white">{value}</h3>
            <p className="text-sm text-gray-400">{title}</p>
        </div>
    );
}
