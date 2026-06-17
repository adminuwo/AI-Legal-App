const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');
for (let i = 4210; i <= 4240; i++) {
    console.log(`Line ${i}: ${lines[i - 1]}`);
}
