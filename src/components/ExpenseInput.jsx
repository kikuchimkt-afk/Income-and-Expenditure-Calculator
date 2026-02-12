import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SalaryLogicModal from './SalaryLogicModal';

export default function ExpenseInput({ settings, onUpdateSettings, onAddFixedExpense, onUpdateFixedExpense, onAddTransportCost, onUpsertGroupExpense }) {
    const [fixedCostName, setFixedCostName] = useState('');
    const [fixedCostAmount, setFixedCostAmount] = useState('');
    const [transportCount, setTransportCount] = useState(1);
    const [groupDays, setGroupDays] = useState(3); // Default 3 days
    const [isLogicOpen, setIsLogicOpen] = useState(false);

    const handleAddFixed = () => {
        if (!fixedCostName || !fixedCostAmount) return;
        onAddFixedExpense(fixedCostName, parseInt(fixedCostAmount));
        setFixedCostName('');
        setFixedCostAmount('');
    };

    const handleAddTransport = () => {
        if (transportCount <= 0) return;
        onAddTransportCost(parseInt(transportCount));
        setTransportCount(1);
    };

    const handleAddGroupCost = () => {
        const wage = parseInt(settings.groupHourlyWage || 0);
        const hours = parseInt(settings.groupDailyHours || 3);
        const days = parseInt(groupDays || 0);
        const total = wage * hours * days * 4; // 4 weeks

        if (onUpsertGroupExpense) {
            onUpsertGroupExpense(`グループレッスン人件費 (${days}日/週)`, total);
        } else {
            onAddFixedExpense(`グループレッスン人件費 (${days}日/週)`, total);
        }
    };

    const handleUpdateGroupCost = () => {
        const wage = parseInt(settings.groupHourlyWage || 0);
        const hours = parseInt(settings.groupDailyHours || 3);
        const days = parseInt(groupDays || 0);
        const total = wage * hours * days * 4; // 4 weeks

        if (onUpsertGroupExpense) {
            onUpsertGroupExpense(`グループレッスン人件費 (${days}日/週)`, total);
        } else {
            onUpdateFixedExpense(`グループレッスン人件費 (${days}日/週)`, total);
        }
    };

    const handleUpdateFixed = () => {
        if (!fixedCostName || !fixedCostAmount) return;
        onUpdateFixedExpense(fixedCostName, parseInt(fixedCostAmount));
        setFixedCostName('');
        setFixedCostAmount('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
            {/* Wage Settings */}
            <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-red-700">支出の追加・設定</h2>
                    <button
                        onClick={() => setIsLogicOpen(true)}
                        className="text-gray-400 hover:text-blue-600 flex items-center gap-1 text-sm transition-colors"
                        title="給与算出ロジックを見る"
                    >
                        <HelpCircle size={18} />
                        <span className="hidden sm:inline">算出ロジック</span>
                    </button>
                </div>

                {/* 時給設定 */}
                <div className="space-y-4 mb-6 border-b pb-6">
                    <h3 className="text-md font-semibold text-gray-700">講師時給・適用率設定</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">一般時給 (円/時)</label>
                            <input
                                type="number"
                                value={settings.hourlyWageNormal}
                                onChange={(e) => onUpdateSettings('hourlyWageNormal', parseInt(e.target.value))}
                                min="0" step="50"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">プレミア時給 (円/時)</label>
                            <input
                                type="number"
                                value={settings.hourlyWagePremier}
                                onChange={(e) => onUpdateSettings('hourlyWagePremier', parseInt(e.target.value))}
                                min="0" step="50"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">プレミア適用率 (%)</label>
                            <input
                                type="number"
                                value={settings.premierWageRatio}
                                onChange={(e) => onUpdateSettings('premierWageRatio', parseInt(e.target.value))}
                                min="0" max="100" step="5"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">事務給 (円/時)</label>
                            <input
                                type="number"
                                value={settings.adminWagePerHour}
                                onChange={(e) => onUpdateSettings('adminWagePerHour', parseInt(e.target.value))}
                                min="0" step="50"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">グループ時給 (円/時)</label>
                            <input
                                type="number"
                                value={settings.groupHourlyWage}
                                onChange={(e) => onUpdateSettings('groupHourlyWage', parseInt(e.target.value))}
                                min="0" step="50"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">グループ授業時間 (h/日)</label>
                            <input
                                type="number"
                                value={settings.groupDailyHours}
                                onChange={(e) => onUpdateSettings('groupDailyHours', parseInt(e.target.value))}
                                min="0" step="0.5"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Group Lesson Cost Section */}
                <div>
                    <h3 className="text-md font-semibold mb-3 text-green-700 border-b border-green-200 pb-1">グループレッスン人件費</h3>
                    <div className="bg-green-50 p-4 rounded-md space-y-4">
                        <p className="text-sm text-gray-600">
                            週の開講日数と設定された時給・時間から算出します。<br />
                            <span className="text-xs">計算式: 日数 × 4週 × 時間({settings.groupDailyHours || 3}h) × 時給({settings.groupHourlyWage || 0}円)</span>
                        </p>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1">週の開講日数 (日)</label>
                                <input
                                    type="number"
                                    value={groupDays}
                                    onChange={(e) => setGroupDays(e.target.value)}
                                    min="0" max="7"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                                />
                            </div>
                            <button
                                onClick={handleAddGroupCost}
                                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 shadow-sm h-[42px]"
                            >
                                追加
                            </button>
                            <button
                                onClick={handleUpdateGroupCost}
                                className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition duration-300 shadow-sm h-[42px]"
                            >
                                再計算
                            </button>
                        </div>
                        <p className="text-right font-bold text-green-800">
                            月額算出: {(groupDays * 4 * (settings.groupDailyHours || 3) * (settings.groupHourlyWage || 0)).toLocaleString()} 円
                        </p>
                    </div>
                </div>

                {/* Fixed Cost Section */}
                <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-700">その他固定費・交通費・ロイヤリティ</h3>

                    {/* ロイヤリティ設定 */}
                    <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                        <label className="block text-sm font-medium text-gray-800 mb-1">ロイヤリティ率 (%)</label>
                        <p className="text-xs text-gray-500 mb-2">収入合計に対して発生するロイヤリティの割合 (5~15%)</p>
                        <input
                            type="number"
                            value={settings.royaltyRate}
                            onChange={(e) => onUpdateSettings('royaltyRate', parseInt(e.target.value))}
                            min="0" max="100" step="1"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">支出項目</label>
                        <input
                            type="text"
                            value={fixedCostName}
                            onChange={(e) => setFixedCostName(e.target.value)}
                            placeholder="例: 家賃、光熱費"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">月額費用 (円)</label>
                        <input
                            type="number"
                            value={fixedCostAmount}
                            onChange={(e) => setFixedCostAmount(e.target.value)}
                            placeholder="例: 150000" min="0" step="1000"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddFixed}
                            className="flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 shadow-sm"
                        >
                            固定費を追加
                        </button>
                        <button
                            onClick={handleUpdateFixed}
                            className="flex-1 bg-rose-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-rose-700 transition duration-300 shadow-sm"
                        >
                            更新
                        </button>
                    </div>
                    <hr />
                    <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">勤務講師数</label>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                value={transportCount}
                                onChange={(e) => setTransportCount(e.target.value)}
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                onClick={handleAddTransport}
                                className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-orange-600 transition duration-300 shadow-sm"
                            >
                                交通費を追加
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SalaryLogicModal
                isOpen={isLogicOpen}
                onClose={() => setIsLogicOpen(false)}
            />
        </div>
    );
}
