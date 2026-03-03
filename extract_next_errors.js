const fs = require('fs');
const content = fs.readFileSync('ts_errors.log', 'utf16le');
const lines = content.split('\n').filter(Boolean);
const nextErrors = lines.filter(l => l.includes('.next/types/app'));
fs.writeFileSync('extracted_errors.txt', nextErrors.slice(0, 50).join('\n'), 'utf8');
