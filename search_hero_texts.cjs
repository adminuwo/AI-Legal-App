const fs = require('fs');
const content = fs.readFileSync('src/landingpage/Hero.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    const match = line.match(/t\(['"]([^'"]+)['"]\)/);
    if (match) {
        console.log(`Line ${index + 1}: ${match[0]}`);
    }
});
