const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('PRECEDENTS') && line.length < 150) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
