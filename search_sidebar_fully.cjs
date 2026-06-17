const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    // Look for menu, list, tab, path, route, tool selection, or render items
    if (/navItems|menuItems|tabs|navigation|links|tool/i.test(line) || line.includes('const ') || line.includes('function ') || line.includes('return (')) {
        if (line.length < 150) {
            console.log(`Line ${index + 1}: ${line.trim()}`);
        }
    }
});
