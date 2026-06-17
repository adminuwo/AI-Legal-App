const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');

const keywords = [
    'Image Generator',
    'Video Generator',
    'AI Ads',
    'Magic Tools',
    'Welcome',
    'card',
    'dashboard',
    'toolGrid'
];

lines.forEach((line, index) => {
    keywords.forEach(kw => {
        if (line.includes(kw) && line.length < 150) {
            console.log(`Line ${index + 1} (${kw}): ${line.trim()}`);
        }
    });
});
