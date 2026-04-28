const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/dashboard/pitch-room/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Split into lines
let lines = content.split('\n');

// Fix lines 409-480 by removing 4 leading spaces
for (let i = 408; i <= 480 && i < lines.length; i++) {
  if (lines[i].startsWith('                ')) {  // Starts with 16 spaces
    lines[i] = lines[i].substring(4);  // Remove first 4 spaces
  }
}

// Write back
fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
console.log('Fixed indentation in pitch-room/page.tsx');
