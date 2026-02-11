import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { GRADE_ORDER, PREMIER_GRADES } from '../data/constants';

export default function RevenueInput({ onAddRevenue, onAddBulkRevenues, masterData }) {
    const [studentName, setStudentName] = useState(''); // Added studentName state
    const [grade, setGrade] = useState(GRADE_ORDER[0]);
    const [lessons, setLessons] = useState('');
    const [isPremier, setIsPremier] = useState(false);
    const [isGroup, setIsGroup] = useState(false); // Added isGroup state
    const fileInputRef = useRef(null);

    // Update available lessons when grade changes
    useEffect(() => {
        if (masterData && masterData.tuitionData && masterData.tuitionData[grade]) {
            const availableLessons = Object.keys(masterData.tuitionData[grade]);
            setLessons(availableLessons[0]);
        }
        setIsPremier(false); // Reset premier when grade changes
        setIsGroup(false); // Reset group when grade changes
    }, [grade, masterData]);

    const handleAdd = () => {
        onAddRevenue({ grade, lessons: parseInt(lessons), studentCount: 1, isPremier, isGroup, studentName });
        setStudentName(''); // Reset name after adding
        setIsPremier(false);
        setIsGroup(false);
    };

    const handleDownloadTemplate = () => {
        const headers = ["氏名", "学年", "週コマ数(数字のみ)", "プレミア(あり/なし)"];
        const rows = [
            headers.join(','),
            "山田 太郎,中1,2,なし",
            "鈴木 花子,中2,1,あり",
            "佐藤 次郎,小学生,2,なし"
        ];
        const csvString = rows.join('\r\n');
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "一括登録テンプレート.csv");
        link.click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const rows = text.split(/\r\n|\n/).filter(row => row.trim() !== '');

            // Skip header if it exists (simple check: if first col contains "氏名")
            const startIndex = rows[0].includes('氏名') ? 1 : 0;
            const newItems = [];
            let errorCount = 0;

            for (let i = startIndex; i < rows.length; i++) {
                const cols = rows[i].split(',');
                if (cols.length < 3) continue;

                // Format: Name, Grade, Lessons, Premier
                const rowName = cols[0].trim(); // Get Name
                const rowGrade = cols[1].trim();
                const rowLessons = parseInt(cols[2].trim());
                const rowPremierStr = cols[3] ? cols[3].trim() : "";
                const rowIsPremier = rowPremierStr === "あり" || rowPremierStr === "TRUE" || rowPremierStr === "1";

                // Validation
                if (!GRADE_ORDER.includes(rowGrade)) {
                    console.warn(`Invalid grade at row ${i + 1}: ${rowGrade}`);
                    errorCount++;
                    continue;
                }
                if (isNaN(rowLessons)) {
                    console.warn(`Invalid lessons at row ${i + 1}: ${cols[2]}`);
                    errorCount++;
                    continue;
                }

                newItems.push({
                    studentName: rowName, // Include Name
                    grade: rowGrade,
                    lessons: rowLessons,
                    isPremier: rowIsPremier
                });
            }

            if (newItems.length > 0) {
                onAddBulkRevenues(newItems);
                alert(`${newItems.length}件のデータを読み込みました。${errorCount > 0 ? `(${errorCount}件のエラーあり)` : ''}`);
            } else {
                alert('読み込めるデータがありませんでした。フォーマットを確認してください。');
            }

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const showPremier = PREMIER_GRADES.includes(grade);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">

            {/* Manual Input Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-600">収入の追加 (手動入力)</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-600 mb-1">生徒氏名 (任意)</label>
                        <input
                            type="text"
                            id="studentName"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="例: 山田 太郎"
                        />
                    </div>
                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-600 mb-1">学年</label>
                        <select
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {GRADE_ORDER.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="lessons" className="block text-sm font-medium text-gray-600 mb-1">週当たりコマ数</label>
                        <select
                            id="lessons"
                            value={lessons}
                            onChange={(e) => setLessons(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {grade && masterData.tuitionData[grade] && Object.keys(masterData.tuitionData[grade]).map(l => (
                                <option key={l} value={l}>{l} コマ</option>
                            ))}
                        </select>
                    </div>

                    {showPremier && (
                        <div className="space-y-2">
                            <div id="premier-lesson-wrapper">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isPremier}
                                        onChange={(e) => setIsPremier(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        プレミア授業 (+{(masterData.PREMIER_FEES && masterData.PREMIER_FEES[grade] ? masterData.PREMIER_FEES[grade] : 0).toLocaleString()}円/月)
                                    </span>
                                </label>
                            </div>

                            <div id="group-lesson-wrapper">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={isGroup}
                                        onChange={(e) => setIsGroup(e.target.checked)}
                                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        グループレッスン (+{(masterData.PREMIER_FEES && masterData.PREMIER_FEES[grade] ? masterData.PREMIER_FEES[grade] * 2 : 0).toLocaleString()}円/月)
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 shadow-sm"
                    >
                        収入と講師給与を追加
                    </button>
                </div>
            </div>

            {/* CSV Import Section */}
            <div className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    <FileSpreadsheet size={20} />
                    <span>CSV一括登録</span>
                </h2>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleDownloadTemplate}
                        className="text-sm text-blue-600 hover:text-blue-800 underline text-left"
                    >
                        入力用テンプレートCSVをダウンロード
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className="cursor-pointer bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition shadow-sm flex items-center gap-2 w-full justify-center"
                        >
                            <Upload size={18} />
                            <span>CSVファイルをアップロード</span>
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 text-center">※ 1列目を氏名として取り込みます</p>
                </div>
            </div>

        </div>
    );
}
