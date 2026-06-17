const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('LEGAL_TOOLKIT')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
