const fs = require('fs');
const content = fs.readFileSync('ts_errors.log', 'utf16le');
const lines = content.split('\n').filter(Boolean);
const errorCounts = {};
for (const line of lines) {
    if (line.includes("error TS") && line.includes("File '")) {
        const match = line.match(/error TS\d+: (.*)/);
        if (match) {
            let err = match[1];
            errorCounts[err] = (errorCounts[err] || 0) + 1;
        }
    }
}
const sorted = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 30);
fs.writeFileSync('err_summary.txt', JSON.stringify(sorted, null, 2));
