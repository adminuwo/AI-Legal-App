const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
    if (line.includes('PREMIUM_TOOLS') || line.includes('LEGAL_TOOLS') || line.includes('legal_draft_maker')) {
        if (line.length < 150) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
        }
    }
});
