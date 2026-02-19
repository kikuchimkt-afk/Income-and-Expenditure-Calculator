import React from 'react';

export default function PrintReport({ summary, revenues, expenses, targetYear, targetMonth, masterData }) {
    const {
        totalRevenue, totalExpense, totalProfit, totalStudents,
        summarySalary, summaryTransport, summaryGroupLabor, summaryFixed, royaltyAmount, salesTaxAmount,
        totalBaseTuition, totalMonthlyFees, totalPremierFees, totalGroupFees
    } = summary;

    return (
        <div className="hidden print:block p-8 bg-white text-black h-screen box-border">
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-bold mb-2">経営収支報告書</h1>
                <div className="flex justify-between items-end">
                    <p className="text-lg font-semibold">対象年月: {targetYear}年 {targetMonth}月</p>
                    <p className="text-sm">出力日: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Income */}
                <div className="border border-gray-400 p-4 rounded bg-gray-50">
                    <h2 className="text-xl font-bold border-b border-gray-300 mb-2 pb-1 text-blue-800">収入の部</h2>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold">収入合計</span>
                        <span className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="pl-2 space-y-1 text-sm border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                            <span>個別指導授業料</span>
                            <span>¥{totalBaseTuition.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>諸費</span>
                            <span>¥{totalMonthlyFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>プレミア費</span>
                            <span>¥{totalPremierFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>グループレッスン費</span>
                            <span>¥{totalGroupFees.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-gray-300 text-right">
                        <span className="text-sm">生徒総数: </span>
                        <span className="font-bold text-lg">{totalStudents} 名</span>
                    </div>
                </div>

                {/* Expense */}
                <div className="border border-gray-400 p-4 rounded bg-gray-50">
                    <h2 className="text-xl font-bold border-b border-gray-300 mb-2 pb-1 text-red-800">支出の部</h2>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold">支出合計</span>
                        <span className="text-2xl font-bold">¥{totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="pl-2 space-y-1 text-sm border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                            <span>人件費 (給与)</span>
                            <span>¥{summarySalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>人件費 (交通費)</span>
                            <span>¥{summaryTransport.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>その他固定費</span>
                            <span>¥{summaryFixed.toLocaleString()}</span>
                        </div>
                        {(summaryGroupLabor || 0) > 0 && (
                            <div className="flex justify-between">
                                <span>グループレッスン人件費</span>
                                <span>¥{(summaryGroupLabor || 0).toLocaleString()}</span>
                            </div>
                        )}
                        {royaltyAmount > 0 && (
                            <div className="flex justify-between">
                                <span>ロイヤリティ</span>
                                <span>¥{royaltyAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {(salesTaxAmount || 0) > 0 && (
                            <div className="flex justify-between">
                                <span>消費税</span>
                                <span>¥{(salesTaxAmount || 0).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profit */}
                <div className="border border-gray-400 p-4 rounded bg-white flex flex-col justify-center items-center shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">月間損益</h2>
                    <span className={`text-4xl font-extrabold ${totalProfit >= 0 ? 'text-black' : 'text-red-600'}`}>
                        ¥{totalProfit.toLocaleString()}
                    </span>
                    <div className="mt-4 text-sm text-gray-500">
                        利益率: {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>

            {/* Details Table */}
            <div className="w-full">
                <h3 className="text-lg font-bold mb-2 border-b-2 border-gray-600 inline-block">詳細内訳</h3>
                <div className="flex gap-4">
                    {/* Revenues List */}
                    <div className="w-1/2">
                        <h4 className="font-bold bg-blue-100 p-1 mb-1 text-center border text-sm">収入詳細 (抜粋)</h4>
                        <table className="w-full text-xs border-collapse border border-gray-400">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-1">学年/氏名</th>
                                    <th className="border border-gray-300 p-1">内容</th>
                                    <th className="border border-gray-300 p-1">金額</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenues.slice(0, 15).map((r, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 p-1">{r.studentName || r.grade}</td>
                                        <td className="border border-gray-300 p-1">
                                            {r.grade} {r.isPremier ? '(プレミア)' : ''} {r.isGroup ? '(グループ)' : ''} / {r.lessons}コマ
                                        </td>
                                        <td className="border border-gray-300 p-1 text-right">¥{r.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {revenues.length > 15 && (
                                    <tr>
                                        <td className="border border-gray-300 p-1 text-center" colSpan="3">...他 {revenues.length - 15} 件</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Expenses List */}
                    <div className="w-1/2">
                        <h4 className="font-bold bg-red-100 p-1 mb-1 text-center border text-sm">支出詳細 (抜粋)</h4>
                        <table className="w-full text-xs border-collapse border border-gray-400">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-1">項目</th>
                                    <th className="border border-gray-300 p-1">金額</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.slice(0, 15).map((e, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 p-1">{e.description}</td>
                                        <td className="border border-gray-300 p-1 text-right">¥{e.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {expenses.length > 15 && (
                                    <tr>
                                        <td className="border border-gray-300 p-1 text-center" colSpan="2">...他 {expenses.length - 15} 件</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="text-right text-xs mt-4 text-gray-500">
                経営収支シミュレーター Output
            </div>
        </div>
    );
}
