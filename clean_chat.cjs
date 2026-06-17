const fs = require('fs');

let content = fs.readFileSync('c:/Users/USER/Desktop/AI_LEGAL_APP/Aisa/src/pages/Workspace/LegalWorkspace.jsx', 'utf8');

// Remove unwanted component imports
const unwantedImports = [
  'ImageEditor', 'CustomVideoPlayer', 'MagicToolSettingsCard', 'CashFlowStockModal', 
  'CashFlowChartWidget', 'MagicVideoGenModal', 'MagicImageEditModal', 'AiSocialMediaDashboard'
];

unwantedImports.forEach(imp => {
  const regex = new RegExp(`const ${imp} = React\\.lazy\\([\\s\\S]*?\\);\\s*`, 'g');
  content = content.replace(regex, '');
});

// Remove JSX elements
const jsxElements = [
  'ImageEditor', 'CustomVideoPlayer', 'MagicToolSettingsCard', 'CashFlowStockModal', 
  'CashFlowChartWidget', 'MagicVideoGenModal', 'MagicImageEditModal', 'AiSocialMediaDashboard'
];

jsxElements.forEach(el => {
  const regex = new RegExp(`<${el}\\b[^>]*?(?:>[\\s\\S]*?<\\/${el}>|\\/>)`, 'g');
  content = content.replace(regex, '');
});

fs.writeFileSync('c:/Users/USER/Desktop/AI_LEGAL_APP/Aisa/src/pages/Workspace/LegalWorkspace.jsx', content);
console.log('Cleaned up components');
