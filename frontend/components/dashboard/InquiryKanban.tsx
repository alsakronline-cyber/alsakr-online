import React from 'react';

interface Inquiry {
    id: string;
    partName: string;
    customer: string;
    status: 'pending' | 'quoted' | 'closed';
}

const KanbanColumn = ({ title, items, color }: { title: string, items: Inquiry[], color: string }) => (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 min-h-[500px]">
        <div className={`flex items-center justify-between mb-4 pb-2 border-b-2`} style={{ borderColor: color }}>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
            <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold shadow-sm">{items.length}</span>
        </div>
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate w-3/4">{item.partName}</span>
                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: color }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{item.customer}</p>
                </div>
            ))}
        </div>
    </div>
);

const InquiryKanban: React.FC = () => {
    // Mock data - replace with API call
    const inquiries: Inquiry[] = [
        { id: '1', partName: 'SICK Sensor WL-12', customer: 'Saudi Aramco', status: 'pending' },
        { id: '2', partName: 'ABB Drive ACS880', customer: 'SABIC', status: 'quoted' },
        { id: '3', partName: 'Siemens PLC S7-1200', customer: 'Maaden', status: 'closed' },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn
                title="Pending"
                items={inquiries.filter(i => i.status === 'pending')}
                color="#fbbf24"
            />
            <KanbanColumn
                title="Quoted"
                items={inquiries.filter(i => i.status === 'quoted')}
                color="#3b82f6"
            />
            <KanbanColumn
                title="Closed"
                items={inquiries.filter(i => i.status === 'closed')}
                color="#22c55e"
            />
        </div>
    );
};

export default InquiryKanban;
