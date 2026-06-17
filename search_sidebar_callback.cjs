const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('ToolSelect') || line.includes('activateTool') || line.includes('setMode') || line.includes('activeLegalTool')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
