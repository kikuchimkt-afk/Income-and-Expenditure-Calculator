import React, { useState } from 'react';
import { Download, HelpCircle } from 'lucide-react';
import SummaryLogicModal from './SummaryLogicModal';

export default function SimulationSummary({ summary, onExportCsv, items, onRemoveItem }) {
    const {
        totalRevenue, totalExpense, totalProfit, totalStudents,
        summarySalary, summaryTransport, summaryGroupLabor, summaryFixed, royaltyAmount, salesTaxAmount,
        totalBaseTuition, totalMonthlyFees, totalPremierFees, totalGroupFees
    } = summary;
    const [isLogicOpen, setIsLogicOpen] = useState(false);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-700">収支サマリー</h2>
                <button
                    onClick={() => setIsLogicOpen(true)}
                    className="text-gray-400 hover:text-blue-600 flex items-center gap-1 text-sm transition-colors"
                    title="収支算出ロジックを見る"
                >
                    <HelpCircle size={18} />
                    <span className="hidden sm:inline">内訳詳細</span>
                </button>
            </div>
            <div className="space-y-3">
                {/* 収入合計 */}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-600">収入合計</span>
                    <span className="text-2xl font-bold text-blue-600">¥{totalRevenue.toLocaleString()}</span>
                </div>
                {/* 収入内訳 */}
                <div className="pl-4 space-y-1 text-sm border-b pb-2 mb-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ 個別指導授業料</span>
                        <span className="font-semibold text-blue-500">¥{totalBaseTuition.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ 諸費</span>
                        <span className="font-semibold text-blue-500">¥{totalMonthlyFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ プレミア費</span>
                        <span className="font-semibold text-blue-500">¥{totalPremierFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ グループレッスン売上</span>
                        <span className="font-semibold text-blue-500">¥{totalGroupFees.toLocaleString()}</span>
                    </div>
                </div>
                {/* 支出合計 */}
                <div className="flex justify-between items-center pb-2">
                    <span className="text-lg font-medium text-gray-600">支出合計</span>
                    <span className="text-2xl font-bold text-red-600">¥{totalExpense.toLocaleString()}</span>
                </div>
                {/* 支出内訳 */}
                <div className="pl-4 space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ 人件費 (給与)</span>
                        <span className="font-semibold text-red-500">¥{summarySalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ 人件費 (交通費)</span>
                        <span className="font-semibold text-red-500">¥{summaryTransport.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ グループレッスン人件費</span>
                        <span className="font-semibold text-red-500">¥{(summaryGroupLabor || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">└ その他固定費</span>
                        <span className="font-semibold text-red-500">¥{summaryFixed.toLocaleString()}</span>
                    </div>
                    {royaltyAmount > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">└ ロイヤリティ</span>
                            <span className="font-semibold text-red-500">¥{royaltyAmount.toLocaleString()}</span>
                        </div>
                    )}
                    {salesTaxAmount > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">└ 消費税</span>
                            <span className="font-semibold text-red-500">¥{salesTaxAmount.toLocaleString()}</span>
                        </div>
                    )}
                </div>
                {/* 生徒総数 */}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-medium text-gray-600">生徒総数</span>
                    <span className="text-2xl font-bold text-gray-700">{totalStudents.toLocaleString()}人</span>
                </div>
                <hr />
                {/* 純利益 */}
                <div className={`flex justify-between items-center p-4 bg-gray-50 rounded-lg`}>
                    <span className="text-xl font-bold text-gray-800">月間利益</span>
                    <span className={`text-3xl font-extrabold ${totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        ¥{totalProfit.toLocaleString()}
                    </span>
                </div>
                <div className="mt-2">
                    <button
                        onClick={onExportCsv}
                        disabled={items.length === 0}
                        className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 shadow-sm disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        月謝明細をCSV出力
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">詳細</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-400">項目が追加されていません。</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className={`flex justify-between items-center p-2 rounded-md ${item.type === 'revenue' ? 'bg-blue-50' : (item.isSalary ? 'bg-red-100/50' : 'bg-red-50')}`}>
                                <div className="flex items-center">
                                    <p className={`font-medium text-sm ${item.isSalary ? 'pl-4' : ''}`}>{item.description}</p>
                                </div>
                                <div className="text-right flex items-center space-x-2">
                                    <p className={`font-semibold ${item.type === 'revenue' ? 'text-blue-600' : 'text-red-600'}`}>
                                        {item.type === 'revenue' ? '+' : '-'}{item.amount.toLocaleString()}円
                                    </p>
                                    {typeof item.id === 'number' && (
                                        <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => onRemoveItem(item.id)}>✖</button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <SummaryLogicModal
                isOpen={isLogicOpen}
                onClose={() => setIsLogicOpen(false)}
            />
        </div>
    );
}
