#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  try {
    if (!fs.existsSync(src)) {
      console.log(`Source ${src} doesn't exist, skipping...`);
      return;
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log(`✅ Copied ${src} to ${dest}`);
  } catch (error) {
    console.log(`⚠️  Copy ${src} failed:`, error.message);
  }
}

// Copy templates and assets
copyRecursive('src/templates', 'dist/templates');
copyRecursive('assets', 'dist/assets');

console.log('🐾 Asset copying complete!');
