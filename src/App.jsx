import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Settings, Save, Trash2, RotateCcw } from 'lucide-react';
import RevenueInput from './components/RevenueInput';
import ExpenseInput from './components/ExpenseInput';
import SimulationSummary from './components/SimulationSummary';
import MasterSettingsModal from './components/MasterSettingsModal';
import PrintReport from './components/PrintReport';
import {
  tuitionData as initialTuitionData,
  MONTHLY_FEE as initialMonthlyFee,
  PREMIER_FEES as initialPremierFees,
  WEEKS_PER_MONTH,
  LESSON_DURATION_HOURS,
  STUDENT_PER_TEACHER as initialStudentPerTeacher,
  ADMIN_WAGE_PER_HOUR,
  ADMIN_TIME_PER_LESSON_HOURS,
  TRANSPORT_COST_PER_TEACHER,
  GRADE_ORDER
} from './data/constants';

// Safe number parsers to prevent NaN
const safeInt = (val, fallback = 0) => {
  const n = parseInt(val);
  return isNaN(n) ? fallback : n;
};
const safeFloat = (val, fallback = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

function App() {
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [settings, setSettings] = useState({
    hourlyWageNormal: 1300,
    hourlyWagePremier: 1800,
    premierWageRatio: 50,
    adminWagePerHour: 1200,
    royaltyRate: 0,
    salesTaxRate: 0, // New setting
    groupHourlyWage: 2500,
    groupDailyHours: 3
  });

  // Date State
  const today = new Date();
  const [targetYear, setTargetYear] = useState(today.getFullYear());
  const [targetMonth, setTargetMonth] = useState(today.getMonth() + 1);

  // --- Master Data State ---
  const [masterData, setMasterData] = useState({
    tuitionData: initialTuitionData,
    MONTHLY_FEE: initialMonthlyFee,
    PREMIER_FEES: initialPremierFees,
    STUDENT_PER_TEACHER: initialStudentPerTeacher
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- Persistence State ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // --- Persistence Logic ---
  // Load data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('simulationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.revenues) setRevenues(parsed.revenues);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.nextId) setNextId(parsed.nextId);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.masterData) setMasterData(parsed.masterData);
        if (parsed.targetYear) setTargetYear(parsed.targetYear);
        if (parsed.targetMonth) setTargetMonth(parsed.targetMonth);
        if (parsed.autoSave !== undefined) setAutoSave(parsed.autoSave);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsLoaded(true); // Mark as loaded
  }, []);

  // Save data on change
  useEffect(() => {
    if (!isLoaded) return; // Don't save if not loaded yet
    if (!autoSave) return; // Don't auto-save if disabled

    const dataToSave = {
      revenues,
      expenses,
      nextId,
      settings,
      masterData,
      targetYear,
      targetMonth,
      autoSave
    };
    localStorage.setItem('simulationData', JSON.stringify(dataToSave));
    setLastSaved(new Date());
  }, [revenues, expenses, nextId, settings, masterData, targetYear, targetMonth, autoSave, isLoaded]);

  const handleManualSave = () => {
    const dataToSave = {
      revenues,
      expenses,
      nextId,
      settings,
      masterData,
      targetYear,
      targetMonth,
      autoSave
    };
    localStorage.setItem('simulationData', JSON.stringify(dataToSave));
    setLastSaved(new Date());
    alert('データを保存しました。');
  };

  const handleResetAllData = () => {
    if (window.confirm('本当に全てのデータを初期化しますか？\nこの操作は取り消せません。')) {
      localStorage.removeItem('simulationData');
      setRevenues([]);
      setExpenses([]);
      setNextId(1);
      setSettings({
        hourlyWageNormal: 1300,
        hourlyWagePremier: 1800,
        premierWageRatio: 50,
        adminWagePerHour: 1200,
        royaltyRate: 0,
        salesTaxRate: 0,
        groupHourlyWage: 2500,
        groupDailyHours: 3
      });
      setTargetYear(today.getFullYear());
      setTargetMonth(today.getMonth() + 1);
      setMasterData({
        tuitionData: initialTuitionData,
        MONTHLY_FEE: initialMonthlyFee,
        PREMIER_FEES: initialPremierFees,
        STUDENT_PER_TEACHER: initialStudentPerTeacher
      });
      window.location.reload(); // Reload to ensure clean state
    }
  };

  // --- Logic for Salary Calculation ---
  const calculateSalary = useCallback((lessons, count, isPremier, currentSettings, currentMasterData) => {
    const { hourlyWageNormal, hourlyWagePremier, premierWageRatio, adminWagePerHour } = currentSettings;
    const { STUDENT_PER_TEACHER } = currentMasterData;
    const ratio = premierWageRatio / 100;

    const totalStudentLessonsPerMonth = lessons * count * WEEKS_PER_MONTH;
    const totalTeacherLessonsPerMonth = totalStudentLessonsPerMonth / STUDENT_PER_TEACHER;
    const totalTeacherHoursPerMonth = totalTeacherLessonsPerMonth * LESSON_DURATION_HOURS;

    let salaryAmount;
    if (isPremier) {
      const premierHours = totalTeacherHoursPerMonth * ratio;
      const normalHours = totalTeacherHoursPerMonth * (1 - ratio);
      salaryAmount = Math.round((premierHours * hourlyWagePremier) + (normalHours * hourlyWageNormal));
    } else {
      salaryAmount = Math.round(totalTeacherHoursPerMonth * hourlyWageNormal);
    }

    const adminSalaryAmount = Math.round(totalTeacherLessonsPerMonth * ADMIN_TIME_PER_LESSON_HOURS * adminWagePerHour);
    return salaryAmount + adminSalaryAmount;
  }, []);

  // Trigger recalculation when Master Data or Settings change
  // Uses callback form of setState to avoid stale closure
  useEffect(() => {
    setRevenues(prevRevenues => {
      if (prevRevenues.length === 0) return prevRevenues;

      const updatedRevenues = prevRevenues.map(r => {
        const gradeData = masterData.tuitionData[r.grade];
        const unitPrice = gradeData ? gradeData[r.lessons] : r.baseTuition;
        const premierFee = masterData.PREMIER_FEES[r.grade] || 0;
        const groupFee = r.isGroup ? premierFee * 2 : 0;

        let subtotal = (unitPrice * r.studentCount) + (masterData.MONTHLY_FEE * r.studentCount);
        if (r.isPremier) {
          subtotal += premierFee * r.studentCount;
        }
        if (r.isGroup) {
          subtotal += groupFee * r.studentCount;
        }
        return { ...r, amount: subtotal, baseTuition: unitPrice };
      });

      // Also update linked expenses using the latest revenues
      setExpenses(prevExpenses => prevExpenses.map(expense => {
        if (expense.linkedRevenueId !== undefined) {
          const linkedRevenue = updatedRevenues.find(r => r.id === expense.linkedRevenueId);
          if (linkedRevenue) {
            const newAmount = calculateSalary(linkedRevenue.lessons, linkedRevenue.studentCount, linkedRevenue.isPremier, settings, masterData);
            return { ...expense, amount: newAmount };
          }
        }
        return expense;
      }));

      return updatedRevenues;
    });
  }, [masterData, settings, calculateSalary]);


  // --- Handlers ---
  const addRevenue = ({ grade, lessons, studentCount, isPremier, studentName, isGroup }) => { // added isGroup
    const unitPrice = masterData.tuitionData[grade] ? masterData.tuitionData[grade][lessons] : 0;
    const premierFee = masterData.PREMIER_FEES[grade] || 0;
    const groupFee = isGroup ? premierFee * 2 : 0;

    let subtotal = (unitPrice * studentCount) + (masterData.MONTHLY_FEE * studentCount);
    let description = `${studentName ? studentName + ' : ' : ''}${grade} / 週${lessons}コマ + 諸費`;
    if (isPremier) {
      subtotal += premierFee * studentCount;
      description += ` (プレミア)`;
    }
    if (isGroup) {
      subtotal += groupFee * studentCount;
      description += ` (グループ)`;
    }

    const revenueId = nextId;
    const newRevenue = {
      id: revenueId, type: 'revenue', description, amount: subtotal,
      studentCount, grade, lessons, baseTuition: unitPrice, isPremier, isGroup, studentName: studentName || ''
    };
    setRevenues(prev => [...prev, newRevenue]);

    // Only add linked expense if NOT a group lesson
    if (!isGroup) {
      const totalSalary = calculateSalary(lessons, studentCount, isPremier, settings, masterData);
      const newExpense = {
        id: revenueId + 1, type: 'expense',
        description: `講師給与+事務給: ${studentName ? studentName : grade} (${studentCount}人分)`,
        amount: totalSalary, linkedRevenueId: revenueId
      };
      setExpenses(prev => [...prev, newExpense]);
      setNextId(prev => prev + 2);
    } else {
      setNextId(prev => prev + 1); // Only increment for revenue
    }
  };

  const addBulkRevenues = (newItems) => {
    let currentId = nextId;
    const newRevenues = [];
    const newExpenses = [];

    newItems.forEach(item => {
      const { grade, lessons, isPremier, studentName, isGroup } = item;
      const studentCount = 1; // Always 1 for individual mode

      const unitPrice = masterData.tuitionData[grade] ? masterData.tuitionData[grade][lessons] : 0;
      const premierFee = masterData.PREMIER_FEES[grade] || 0;
      const groupFee = isGroup ? premierFee * 2 : 0;

      let subtotal = (unitPrice * studentCount) + (masterData.MONTHLY_FEE * studentCount);
      let description = `${studentName ? studentName + ' : ' : ''}${grade} / 週${lessons}コマ + 諸費`;
      if (isPremier) {
        subtotal += premierFee * studentCount;
        description += ` (プレミア)`;
      }
      if (isGroup) {
        subtotal += groupFee * studentCount;
        description += ` (グループ)`;
      }

      const revenueId = currentId;
      const newRevenue = {
        id: revenueId, type: 'revenue', description, amount: subtotal,
        studentCount, grade, lessons, baseTuition: unitPrice, isPremier, isGroup, studentName: studentName || ''
      };
      newRevenues.push(newRevenue);

      // Only add linked expense if NOT a group lesson
      if (!isGroup) {
        const totalSalary = calculateSalary(lessons, studentCount, isPremier, settings, masterData);
        const newExpense = {
          id: revenueId + 1, type: 'expense',
          description: `講師給与+事務給: ${studentName ? studentName : grade} (${studentCount}人分)`,
          amount: totalSalary, linkedRevenueId: revenueId
        };
        newExpenses.push(newExpense);
        currentId += 2;
      } else {
        currentId += 1;
      }
    });

    setRevenues(prev => [...prev, ...newRevenues]);
    setExpenses(prev => [...prev, ...newExpenses]);
    setNextId(currentId);
  };

  const addFixedExpense = (name, amount) => {
    const existing = expenses.find(e => e.description === name && e.linkedRevenueId === undefined && !e.description.startsWith('講師交通費'));
    if (existing) {
      setExpenses(expenses.map(e => e.id === existing.id ? { ...e, amount: e.amount + amount } : e));
    } else {
      setExpenses([...expenses, { id: nextId, type: 'expense', description: name, amount }]);
      setNextId(nextId + 1);
    }
  };

  const updateFixedExpense = (name, amount) => {
    const existing = expenses.find(e => e.description === name && e.linkedRevenueId === undefined && !e.description.startsWith('講師交通費'));
    if (existing) {
      setExpenses(expenses.map(e => e.id === existing.id ? { ...e, amount: amount } : e));
      alert(`${name}を更新しました。`);
    } else {
      alert(`該当する項目(${name})が見つかりません。新規追加してください。`);
    }
  };

  const addTransportCost = (count) => {
    const totalCost = count * TRANSPORT_COST_PER_TEACHER;
    const filteredExpenses = expenses.filter(e => !e.description.startsWith('講師交通費'));
    setExpenses([...filteredExpenses, {
      id: nextId, type: 'expense', description: `講師交通費 (${count}人分)`, amount: totalCost
    }]);
    setNextId(nextId + 1);
  };

  const upsertGroupExpense = (name, amount) => {
    // 1. Remove ALL existing group lesson expenses
    const filteredExpenses = expenses.filter(e => !e.description.startsWith('グループレッスン人件費'));

    // 2. Add new if amount > 0
    if (amount > 0) {
      const newExpense = { id: nextId, type: 'expense', description: name, amount };
      setExpenses([...filteredExpenses, newExpense]);
      setNextId(nextId + 1);
    } else {
      // If 0, just remove (update with filtered list)
      setExpenses(filteredExpenses);
    }
  };

  const removeItem = (id) => {
    const rev = revenues.find(r => r.id === id);
    if (rev) {
      setRevenues(revenues.filter(r => r.id !== id));
      // Only remove linked expense if it exists (Group lessons won't have one)
      setExpenses(expenses.filter(e => e.linkedRevenueId !== id));
    } else {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const updateSettings = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveMasterSettings = (newSettings) => {
    setMasterData(newSettings);
  };

  const handleResetMasterSettings = () => {
    setMasterData({
      tuitionData: initialTuitionData,
      MONTHLY_FEE: initialMonthlyFee,
      PREMIER_FEES: initialPremierFees,
      STUDENT_PER_TEACHER: initialStudentPerTeacher
    });
  };

  const exportCsv = () => {
    if (revenues.length === 0) return;
    const csvRows = [];
    // Header with new columns
    const headers = ["氏名", "学年", "授業料", "諸費", "プレミア費", "グループ費", "月謝総計", "対象年月", "出力日"];
    csvRows.push(headers.join(','));

    // Output Date YYYY/MM/DD
    const outputDate = new Date();
    const outputDateStr = `${outputDate.getFullYear()}/${outputDate.getMonth() + 1}/${outputDate.getDate()}`;
    const targetDateStr = `${targetYear}年${targetMonth}月`;

    let serialNumber = 1;
    revenues.forEach(rev => {
      for (let i = 0; i < rev.studentCount; i++) {
        const tuition = rev.baseTuition;
        const monthlyFee = masterData.MONTHLY_FEE;
        const premierFee = rev.isPremier ? (masterData.PREMIER_FEES[rev.grade] || 0) : 0;
        const groupFee = rev.isGroup ? (masterData.PREMIER_FEES[rev.grade] ? masterData.PREMIER_FEES[rev.grade] * 2 : 0) : 0;
        const total = tuition + monthlyFee + premierFee + groupFee;
        const row = [
          rev.studentName || '', // Name
          rev.grade,
          tuition,
          monthlyFee,
          premierFee,
          groupFee,
          total,
          targetDateStr, // Target Date
          outputDateStr // Output Date
        ];
        csvRows.push(row.join(','));
        serialNumber++;
      }
    });

    const csvString = csvRows.join('\r\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // Filename YYYY-MM
    link.setAttribute("download", `月謝明細_${targetYear}-${String(targetMonth).padStart(2, '0')}.csv`);
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Derived State for Summary ---
  const summary = useMemo(() => {
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalProfit = totalRevenue - totalExpense;
    const totalStudents = revenues.reduce((sum, r) => sum + r.studentCount, 0);

    const summarySalary = expenses.filter(e => e.linkedRevenueId !== undefined).reduce((sum, e) => sum + e.amount, 0);
    const summaryTransport = expenses.filter(e => e.description.startsWith('講師交通費')).reduce((sum, e) => sum + e.amount, 0);
    const summaryGroupLabor = expenses.filter(e => e.description.startsWith('グループレッスン人件費')).reduce((sum, e) => sum + e.amount, 0);
    const summaryFixed = expenses.filter(e =>
      e.linkedRevenueId === undefined &&
      !e.description.startsWith('講師交通費') &&
      !e.description.startsWith('グループレッスン人件費')
    ).reduce((sum, e) => sum + e.amount, 0);

    // Royalty Calculation
    const royaltyAmount = Math.round(totalRevenue * (settings.royaltyRate / 100));

    // Sales Tax Calculation
    const salesTaxAmount = Math.round(totalRevenue * (settings.salesTaxRate / 100));

    const finalTotalExpense = totalExpense + royaltyAmount + salesTaxAmount;
    const finalTotalProfit = totalRevenue - finalTotalExpense;

    // Revenue Breakdown
    let totalBaseTuition = 0;
    let totalMonthlyFees = 0;
    let totalPremierFees = 0;
    let totalGroupFees = 0;

    revenues.forEach(r => {
      const count = r.studentCount;
      const premierFeeLevel = masterData.PREMIER_FEES[r.grade] || 0;

      totalBaseTuition += r.baseTuition * count;
      totalMonthlyFees += masterData.MONTHLY_FEE * count;

      if (r.isPremier) {
        totalPremierFees += premierFeeLevel * count;
      }
      if (r.isGroup) {
        totalGroupFees += (premierFeeLevel * 2) * count;
      }
    });

    return {
      totalRevenue,
      totalExpense: finalTotalExpense,
      totalProfit: finalTotalProfit,
      totalStudents,
      summarySalary,
      summaryTransport,
      summaryGroupLabor, // New field
      summaryFixed,
      royaltyAmount,
      salesTaxAmount, // New field
      // Breakdown
      totalBaseTuition,
      totalMonthlyFees,
      totalPremierFees,
      totalGroupFees
    };
  }, [revenues, expenses, settings, masterData]);

  // Combine for list
  const allItems = useMemo(() => {
    const items = [...revenues, ...expenses].map(item => {
      let sortKey = 100;
      let isSalary = false;
      if (item.type === 'revenue') {
        sortKey = GRADE_ORDER.indexOf(item.grade);
      } else if (item.linkedRevenueId !== undefined) {
        const linked = revenues.find(r => r.id === item.linkedRevenueId);
        sortKey = linked ? GRADE_ORDER.indexOf(linked.grade) + 0.5 : 99;
        isSalary = true;
      }
      return { ...item, sortKey, isSalary };
    });

    // Add Royalty Item if > 0
    if (settings.royaltyRate > 0) {
      const royaltyAmount = Math.round(revenues.reduce((sum, r) => sum + r.amount, 0) * (settings.royaltyRate / 100));
      if (royaltyAmount > 0) {
        items.push({
          id: 'royalty',
          type: 'expense',
          description: `ロイヤリティ (${settings.royaltyRate}%)`,
          amount: royaltyAmount,
          sortKey: 200, // Put at the end
          isSalary: false
        });
      }
    }

    // Add Sales Tax Item if > 0
    if (settings.salesTaxRate > 0) {
      const salesTaxAmount = Math.round(revenues.reduce((sum, r) => sum + r.amount, 0) * (settings.salesTaxRate / 100));
      if (salesTaxAmount > 0) {
        items.push({
          id: 'salesTax',
          type: 'expense',
          description: `消費税 (${settings.salesTaxRate}%)`,
          amount: salesTaxAmount,
          sortKey: 201, // Put after royalty
          isSalary: false
        });
      }
    }

    return items.sort((a, b) => a.sortKey - b.sortKey || a.id - b.id);
  }, [revenues, expenses, settings]);

  return (
    <>
      <div className="hidden print:block">
        <PrintReport
          summary={summary}
          revenues={revenues}
          expenses={expenses}
          targetYear={targetYear}
          targetMonth={targetMonth}
          masterData={masterData}
        />
      </div>

      <div className="bg-gray-100 text-gray-800 min-h-screen relative print:hidden">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <header className="relative text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-700">収支シミュレーター</h1>

            {/* Year/Month Selector */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="flex items-center bg-white rounded-md shadow-sm border p-1">
                <input
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(parseInt(e.target.value))}
                  className="w-20 text-center border-none focus:ring-0 font-bold text-lg"
                />
                <span className="text-gray-600">年</span>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(parseInt(e.target.value))}
                  className="w-16 text-center border-none focus:ring-0 font-bold text-lg cursor-pointer"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <span className="text-gray-600 mr-2">月</span>
              </div>
            </div>

            <p className="text-gray-500 mt-2">授業料収入と支出を入力して、リアルタイムで利益を計算します。</p>

            <div className="absolute top-0 right-0 flex items-center gap-3">
              {/* Auto Save Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full shadow-sm text-sm hover:bg-gray-50 transition-colors select-none">
                <div className={`w-3 h-3 rounded-full ${autoSave ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="hidden"
                />
                <span className={`${autoSave ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                  {autoSave ? '自動保存ON' : '自動保存OFF'}
                </span>
              </label>

              {/* Manual Save (Visible/Active primarily when auto-save is off, but useful always) */}
              <button
                onClick={handleManualSave}
                disabled={autoSave}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${autoSave ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 bg-white shadow-sm'}`}
                title="手動保存 (自動保存OFF時に有効)"
              >
                <Save size={20} />
              </button>

              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white bg-white/50 rounded-full transition-colors"
                title="レポート印刷"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
              </button>

              {/* Reset/Trash */}
              <button
                onClick={handleResetAllData}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 bg-white/50 rounded-full transition-colors"
                title="全データ消去"
              >
                <Trash2 size={20} />
              </button>

              {/* Settings */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white bg-white/50 rounded-full transition-colors"
                title="マスタ設定"
              >
                <Settings size={20} />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <RevenueInput onAddRevenue={addRevenue} onAddBulkRevenues={addBulkRevenues} masterData={masterData} />
            </div>
            <div className="lg:col-span-1">
              <ExpenseInput
                expenses={expenses}
                settings={settings}
                onUpdateSettings={updateSettings}
                onAddFixedExpense={addFixedExpense}
                onUpdateFixedExpense={updateFixedExpense}
                onAddTransportCost={addTransportCost}
                onUpsertGroupExpense={upsertGroupExpense}
                onRemoveItem={removeItem}
              />
            </div>
            <div className="lg:col-span-1">
              <SimulationSummary
                summary={summary}
                onExportCsv={exportCsv}
                items={allItems}
                onRemoveItem={removeItem}
              />
            </div>
          </div>
        </div>

      </div>
      <MasterSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={masterData}
        onSave={handleSaveMasterSettings}
        onReset={handleResetMasterSettings}
        onResetAll={handleResetAllData}
      />
    </>
  );
}

export default App;
