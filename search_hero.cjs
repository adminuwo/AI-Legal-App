const fs = require('fs');
const content = fs.readFileSync('src/landingpage/Hero.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (/image|video|creative|assistant|mall|aisa/i.test(line) && line.length < 150) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
