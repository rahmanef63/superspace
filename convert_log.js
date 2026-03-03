const fs = require('fs');
const content = fs.readFileSync('build_output.log', 'utf16le');
fs.writeFileSync('build_err.txt', content, 'utf8');
