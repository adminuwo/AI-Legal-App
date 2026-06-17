const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('SidebarTools')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
