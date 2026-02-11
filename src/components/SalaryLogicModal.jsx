import React from 'react';
import { X } from 'lucide-react';

export default function SalaryLogicModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">講師給与の算出ロジック</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto text-gray-700 space-y-6 leading-relaxed">
                    <section>
                        <h3 className="font-bold text-lg mb-2 text-blue-700">1. 基本となる考え方</h3>
                        <p>
                            生徒の受講コマ数に基づいて、必要な「講師の授業時間」を算出し、そこに時給を掛けて計算します。
                            また、授業以外の事務作業時間（10分/コマ）も加算されます。
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-blue-700">2. 計算式</h3>
                        <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm">
                            <p className="mb-2"><strong>① 月間総授業対話時間 (時間)</strong></p>
                            <p className="pl-4 mb-4">= (生徒の週コマ数 × 生徒数 × 4週) / 講師1人当生徒数 × (80分 / 60)</p>

                            <p className="mb-2"><strong>② 授業給 (円)</strong></p>
                            <p className="pl-4 mb-1">プレミア授業の場合：</p>
                            <p className="pl-8 mb-1">プレミア時間 = 総対話時間 × (適用率 / 100)</p>
                            <p className="pl-8 mb-1">通常時間 = 総対話時間 × (1 - 適用率 / 100)</p>
                            <p className="pl-8 mb-4">給与 = (プレミア時間 × プレミア時給) + (通常時間 × 一般時給)</p>

                            <p className="pl-4 mb-4">通常授業の場合：</p>
                            <p className="pl-8 mb-4">給与 = 総対話時間 × 一般時給</p>

                            <p className="mb-2"><strong>③ 事務給 (円)</strong></p>
                            <p className="pl-4 mb-1">月間総対話回数 = (生徒の週コマ数 × 生徒数 × 4週) / 講師1人当生徒数</p>
                            <p className="pl-4">= 月間総対話回数 × (10分 / 60) × 事務時給(1,200円)</p>
                        </div>
                        <p className="mt-2 text-right font-bold text-lg">
                            合計給与 = ② 授業給 + ③ 事務給
                        </p>

                        <div className="bg-green-50 p-4 rounded border border-green-200 font-mono text-sm mt-4">
                            <p className="mb-2 text-green-800"><strong>[New] グループレッスン給与</strong></p>
                            <p className="pl-4 mb-2">個別レッスンとは異なり、開講スケジュールに基づいた固定給として計算されます。</p>
                            <p className="pl-4"><strong>月額給与 = 週の開講日数 × 4週 × 1日の授業時間 × グループ時給</strong></p>
                            <p className="pl-4 text-xs text-gray-500 mt-1">※ 生徒数には依存しません。支出の「グループレッスン人件費」から登録します。</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-gray-600">補足</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>1レッスンは80分として計算しています。</li>
                            <li>1ヶ月は4週として計算しています。</li>
                            <li>事務給の時給は固定(1,200円)です。</li>
                            <li>「講師1人当生徒数」はマスタ設定 (デフォルト初期値: 2人) で変更可能です。</li>
                        </ul>
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
