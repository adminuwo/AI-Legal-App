const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (/tool|gavel|evidence|precedent|contract|cases|dashboard/i.test(line)) {
        if (line.length < 150) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
        }
    }
});
