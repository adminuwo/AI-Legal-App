const fs = require('fs');
const content = fs.readFileSync('src/pages/Chat.jsx', 'utf8');
const lines = content.split('\n');

const matched = new Set();
lines.forEach(line => {
    const regex = /legal_[a-zA-Z0-9_]+/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        matched.add(match[0]);
    }
});

console.log("Found legal tool IDs:");
console.log(Array.from(matched));
