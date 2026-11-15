const fs = require('fs');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('Balaclava.TOOLS') || line.includes('toolUnlock') || line.includes('r_tool') || line.includes('upgradeTool')) {
      console.log(`${filePath}:${idx+1}: ${line.trim()}`);
    }
  });
}

['src/ui/ui.js', 'src/data/recipes.js', 'src/data/tools.js', 'src/engine/game.js'].forEach(f => {
  checkFile('C:/Users/gusta/.gemini/antigravity/scratch/balaclava/www/' + f);
});
