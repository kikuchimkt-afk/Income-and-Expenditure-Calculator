import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

export default function MasterSettingsModal({ isOpen, onClose, currentSettings, onSave, onReset, onResetAll }) {
    const [localSettings, setLocalSettings] = useState(currentSettings);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(currentSettings);
        }
    }, [isOpen, currentSettings]);

    if (!isOpen) return null;

    const handleTuitionChange = (grade, lessons, value) => {
        setLocalSettings(prev => ({
            ...prev,
            tuitionData: {
                ...prev.tuitionData,
                [grade]: {
                    ...prev.tuitionData[grade],
                    [lessons]: parseInt(value) || 0
                }
            }
        }));
    };

    const handlePremierFeeChange = (grade, value) => {
        setLocalSettings(prev => ({
            ...prev,
            PREMIER_FEES: {
                ...prev.PREMIER_FEES,
                [grade]: parseInt(value) || 0
            }
        }));
    };

    const handleConstantChange = (key, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: parseInt(value) || 0
        }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">マスタ設定 (授業料・諸経費)</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">

                    {/* Base Fees */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">諸経費 (円/月)</label>
                            <input
                                type="number"
                                value={localSettings.MONTHLY_FEE}
                                onChange={(e) => handleConstantChange('MONTHLY_FEE', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">講師一人当生徒数</label>
                            <input
                                type="number"
                                value={localSettings.STUDENT_PER_TEACHER}
                                onChange={(e) => handleConstantChange('STUDENT_PER_TEACHER', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Tuition Table */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">授業料テーブル (円/月)</h3>
                            <div className="space-y-4">
                                {Object.keys(localSettings.tuitionData).map(grade => (
                                    <div key={grade} className="bg-white border rounded-lg p-3 shadow-sm">
                                        <h4 className="font-semibold text-blue-700 mb-2 text-sm">{grade}</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Object.keys(localSettings.tuitionData[grade]).map(lessons => (
                                                <div key={lessons}>
                                                    <span className="text-xs text-gray-500 block">週{lessons}</span>
                                                    <input
                                                        type="number"
                                                        value={localSettings.tuitionData[grade][lessons]}
                                                        onChange={(e) => handleTuitionChange(grade, lessons, e.target.value)}
                                                        className="w-full p-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Premier Fees */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">プレミア加算費 (円/月)</h3>
                            <div className="space-y-2">
                                {Object.keys(localSettings.PREMIER_FEES).map(grade => (
                                    <div key={grade} className="flex items-center justify-between bg-white border p-3 rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-700">{grade}</span>
                                        <input
                                            type="number"
                                            value={localSettings.PREMIER_FEES[grade]}
                                            onChange={(e) => handlePremierFeeChange(grade, e.target.value)}
                                            className="w-32 p-2 border border-gray-300 rounded text-right focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">※ プレミア授業が選択された場合に加算される月額費用です。</p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-lg">
                    <div className="flex gap-2">
                        <button
                            onClick={onResetAll}
                            className="flex items-center space-x-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
                        >
                            <RotateCcw size={18} />
                            <span>全データ初期化</span>
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('マスタ設定を初期値に戻しますか？')) {
                                    onReset();
                                    onClose();
                                }
                            }}
                            className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 px-4 py-2 rounded transition-colors"
                        >
                            <RotateCcw size={18} />
                            <span>設定のみリセット</span>
                        </button>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Save size={18} />
                            <span>設定を保存</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
