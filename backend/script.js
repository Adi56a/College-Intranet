const axios = require('axios');
const XLSX = require('xlsx');
const path = require('path');

// Load XLSX file (update path as necessary)
const filePath = path.join(__dirname, 'Data.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert all rows to array of objects
const students = XLSX.utils.sheet_to_json(sheet, { defval: '' });

(async () => {
  let serial = 1;

  for (const s of students) {
    const payload = {
      name: s['Name of the student'],
      department: s['Programme name'],
      number: `${s['Mobile Number']}`.trim(),
      rollNumber: `CS${String(serial).padStart(5, '0')}`,
      email: String(s['Email ID']).trim(),
      password: 'Student@123'
    };

    try {
      const res = await axios.post('http://172.16.1.62:3000/api/student/create-student', payload);

      // Log full response data
      console.log(`Created: ${payload.name} (${payload.rollNumber}) - Status: ${res.status} - Response:`, res.data);
    } catch (err) {
      if (err.response) {
        console.error(`Failed for: ${payload.name} (${payload.rollNumber}) - Status: ${err.response.status} - Response:`, err.response.data);
      } else {
        console.error(`Failed for: ${payload.name} (${payload.rollNumber}) - Error:`, err.message);
      }
    }

    serial++;
  }
})();
