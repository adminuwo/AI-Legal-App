const fs = require('fs');

let content = fs.readFileSync('c:/Users/USER/Desktop/AI_LEGAL_APP/Aisa/src/pages/Workspace/LegalWorkspace.jsx', 'utf8');

// Find the start of Chat component
const startMatch = content.match(/const Chat = \(\) => \{\n/);
if (!startMatch) {
  console.error("Could not find start of Chat component");
  process.exit(1);
}

const startIndex = startMatch.index + startMatch[0].length;
let states = [];
const lines = content.slice(startIndex).split('\n');

let stateLines = [];
let otherLines = [];

for (let line of lines) {
  if (line.match(/^\s*const \[.*\] = useState\(/) || line.match(/^\s*const \[.*\] = React\.useState\(/)) {
    stateLines.push(line);
  } else {
    // If we hit return (, we stop extracting states? No, states are scattered.
    // Actually, just extract lines with useState
  }
}

console.log("Found " + stateLines.length + " states");
