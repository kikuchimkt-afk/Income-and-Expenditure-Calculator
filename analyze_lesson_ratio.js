import XLSX from 'xlsx';

const filename = '2025ベストワン売上_藍住.xlsx';
const targetColumn = '授業調整費';
const lessonsColumn = '通常';

try {
    const workbook = XLSX.readFile(filename);
    const monthlyStats = [];

    workbook.SheetNames.forEach(sheetName => {
        // Filter for YYYYMM sheets
        if (!/^\d{6}$/.test(sheetName)) return;

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let totalWeeklyLessons = 0;
        let premierStudentCount = 0;

        jsonData.forEach(row => {
            if (!row['氏名']) return;

            // Sum Total Lessons
            const lessons = row[lessonsColumn];
            if (lessons && !isNaN(lessons)) {
                totalWeeklyLessons += Number(lessons);
            }

            // Count Premier Students (Assuming 1 Premier Lesson/week per student)
            const fee = row[targetColumn];
            if (fee && !isNaN(fee) && Number(fee) > 0) {
                premierStudentCount++;
            }
        });

        if (totalWeeklyLessons > 0) {
            // Premier Lessons = Premier Student Count (1 per student)
            const premierLessons = premierStudentCount;
            const ratio = (premierLessons / totalWeeklyLessons) * 100;

            monthlyStats.push({
                month: sheetName,
                totalLessons: totalWeeklyLessons,
                premierLessons: premierLessons,
                ratio: ratio.toFixed(2)
            });
        }
    });

    console.log('--- Monthly Lesson Ratio Stats ---');
    console.table(monthlyStats);

    if (monthlyStats.length > 0) {
        const avgRatio = monthlyStats.reduce((sum, item) => sum + parseFloat(item.ratio), 0) / monthlyStats.length;
        console.log('\n--- Overall Average ---');
        console.log(`Average Premier Lesson Ratio: ${avgRatio.toFixed(2)}%`);
        console.log('(Assumption: Each Premier Student takes exactly 1 Premier Lesson per week)');
    } else {
        console.log('No valid data found.');
    }

} catch (e) {
    console.error('Error:', e);
}
