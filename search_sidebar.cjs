const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('title:') || line.includes('label:') || line.includes('path:') || line.includes('id:') || line.includes('navItems') || line.includes('tools')) {
        if (index > 50 && index < 200) { // Limit to where lists might be defined
            console.log(`Line ${index + 1}: ${line.trim()}`);
        }
    }
});
