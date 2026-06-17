const fs = require('fs');
const content = fs.readFileSync('src/Components/SideBar/Sidebar.jsx', 'utf8');
const lines = content.split('\n');

// Print lines in render block that display navigation buttons or sections
let insideRender = false;
let renderLines = [];
lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line.includes('return (') && lineNum > 510) {
        insideRender = true;
    }
    if (insideRender) {
        renderLines.push({ num: lineNum, text: line });
    }
});

console.log(`Render lines count: ${renderLines.length}`);
// Let's search for navigation tags, links, buttons, or custom components inside render
renderLines.forEach(l => {
    if (l.text.includes('button') || l.text.includes('Link') || l.text.includes('SidebarTools') || l.text.includes('Dashboard') || l.text.includes('Admin') || l.text.includes('ai-personal-assistant') || l.text.includes('social-agent')) {
        console.log(`Line ${l.num}: ${l.text.trim()}`);
    }
});
