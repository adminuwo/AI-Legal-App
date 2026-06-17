const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('NavLink') || line.includes('<Link') || line.includes('path') || line.includes('navigate(')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
