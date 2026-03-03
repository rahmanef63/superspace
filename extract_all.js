const fs = require('fs');
const content = fs.readFileSync('ts_errors.log', 'utf16le');
const lines = content.split('\n').filter(Boolean);
const nextErrors = lines.filter(l => l.includes('.next/types/app') && l.includes('error TS'));
fs.writeFileSync('all_next_errors.txt', nextErrors.join('\n'), 'utf8');
