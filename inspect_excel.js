import XLSX from 'xlsx';
import fs from 'fs';

const filename = '2025ベストワン売上_藍住.xlsx';

try {
    const workbook = XLSX.readFile(filename);
    console.log('Sheet Names:', workbook.SheetNames);

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Get headers (first row)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (jsonData.length > 0) {
        console.log('First Sheet Headers:', jsonData[0]);
        console.log('First 3 rows of data:', jsonData.slice(1, 4));
    } else {
        console.log('Sheet appears empty.');
    }

} catch (e) {
    console.error('Error reading file:', e);
}
