import React from 'react';

const QuoteTable: React.FC = () => {
    // Mock data
    const quotes = [
        { id: 'Q-1001', vendor: 'Official Dist #1', amount: 5400, currency: 'SAR', delivery: '2 Weeks' },
        { id: 'Q-1002', vendor: 'Global Parts Ltd', amount: 5150, currency: 'SAR', delivery: '3 Weeks' },
    ];

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-medium text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="px-6 py-4">Quote ID</th>
                        <th className="px-6 py-4">Vendor</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Delivery</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                    {quotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{quote.id}</td>
                            <td className="px-6 py-4">{quote.vendor}</td>
                            <td className="px-6 py-4 font-semibold">{quote.amount} {quote.currency}</td>
                            <td className="px-6 py-4 text-slate-500">{quote.delivery}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default QuoteTable;
