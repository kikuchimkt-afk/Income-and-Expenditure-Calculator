import XLSX from 'xlsx';

const filename = '2025ベストワン売上_藍住.xlsx';
const targetColumn = '授業調整費';

try {
    const workbook = XLSX.readFile(filename);
    const monthlyStats = [];

    workbook.SheetNames.forEach(sheetName => {
        // Filter for YYYYMM sheets (4 digits year + 2 digits month)
        if (!/^\d{6}$/.test(sheetName)) return;

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet); // Array of objects

        let totalStudents = 0;
        let premierStudents = 0;

        jsonData.forEach(row => {
            // Check if row has a name (valid student row)
            if (!row['氏名']) return;

            totalStudents++;

            // Check tuition adjustment fee
            // It might be a number or string, check if > 0
            const fee = row[targetColumn];
            if (fee && !isNaN(fee) && Number(fee) > 0) {
                premierStudents++;
            }
        });

        if (totalStudents > 0) {
            const ratio = (premierStudents / totalStudents) * 100;
            monthlyStats.push({
                month: sheetName,
                total: totalStudents,
                premier: premierStudents,
                ratio: ratio.toFixed(2)
            });
        }
    });

    console.log('--- Monthly Stats ---');
    console.table(monthlyStats);

    if (monthlyStats.length > 0) {
        const avgRatio = monthlyStats.reduce((sum, item) => sum + parseFloat(item.ratio), 0) / monthlyStats.length;
        console.log('\n--- Overall Average ---');
        console.log(`Average Premier Ratio: ${avgRatio.toFixed(2)}%`);
    } else {
        console.log('No valid data found.');
    }

} catch (e) {
    console.error('Error:', e);
}
