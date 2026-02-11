import React from 'react';
import { X } from 'lucide-react';

export default function SummaryLogicModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">収支サマリーの算出ロジック</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto text-gray-700 space-y-6 leading-relaxed">
                    <section>
                        <h3 className="font-bold text-lg mb-2 text-blue-700">1. 収入合計</h3>
                        <p>
                            登録された全ての生徒からの収入の総和です。
                        </p>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm mt-2">
                            <p>収入合計 = Σ (授業料 + 諸経費 + プレミア加算費 + グループ加算費)</p>
                            <p className="mt-1 text-xs text-gray-500">※ グループ加算費 = プレミア加算費の2倍</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-red-700">2. 支出合計</h3>
                        <p>
                            発生する全ての費用の総和です。
                        </p>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm mt-2">
                            <p className="mb-2"><strong>支出合計 = ①人件費(給与) + ②人件費(交通費) + ③その他固定費 + ④ロイヤリティ</strong></p>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>人件費(給与): 生徒追加時に自動計算される講師給与と事務給の合計</li>
                                <li>人件費(グループ): 開講スケジュールに基づいて固定計上されるグループレッスン人件費</li>
                                <li>人件費(交通費): 手動で追加された交通費の合計</li>
                                <li>その他固定費: 家賃や光熱費など、手動で追加された固定費の合計</li>
                                <li>ロイヤリティ: 収入合計 × 設定されたロイヤリティ率(%)</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-green-700">3. 月間利益</h3>
                        <p>
                            最終的な手元に残る利益です。
                        </p>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm mt-2">
                            <p>月間利益 = 収入合計 - 支出合計</p>
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t bg-gray-50 text-right rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
