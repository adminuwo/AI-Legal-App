const fs = require('fs');

let content = fs.readFileSync('c:/Users/USER/Desktop/AI_LEGAL_APP/Aisa/src/pages/Workspace/LegalWorkspace.jsx', 'utf8');

const elementsToRemove = [
  'ImageEditor', 'CustomVideoPlayer', 'MagicToolSettingsCard', 'CashFlowStockModal', 
  'CashFlowChartWidget', 'MagicVideoGenModal', 'MagicImageEditModal', 'AiSocialMediaDashboard'
];

let lines = content.split('\n');
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  let startElement = elementsToRemove.find(el => line.includes('<' + el));
  if (startElement) {
    skip = true;
  }
  
  if (!skip) {
    newLines.push(line);
  }
  
  if (skip && (line.includes('/>') || line.includes('</' + startElement + '>'))) {
    skip = false;
  }
}

fs.writeFileSync('c:/Users/USER/Desktop/AI_LEGAL_APP/Aisa/src/pages/Workspace/LegalWorkspace.jsx', newLines.join('\n'));
console.log('Removed specific JSX elements block by block');
