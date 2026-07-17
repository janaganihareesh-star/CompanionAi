const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/controllers');
const backupDir = path.join(__dirname, '../.history');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Simple backup of controllers before server starts
fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.js')) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(backupDir, `${file}.backup-${Date.now()}`);
    fs.copyFileSync(srcPath, destPath);
  }
});

// Clean up old backups (keep last 20)
const backups = fs.readdirSync(backupDir)
  .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
  .sort((a, b) => b.time - a.time);

if (backups.length > 20) {
  for (let i = 20; i < backups.length; i++) {
    fs.unlinkSync(path.join(backupDir, backups[i].name));
  }
}

console.log('[Auto-Backup] Controllers backed up successfully.');
