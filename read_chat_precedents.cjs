const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');
for (let i = 6730; i <= 6770; i++) {
    console.log(`Line ${i}: ${lines[i - 1]}`);
}
