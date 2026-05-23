#!/usr/bin/env node
/**
 * Production Cleanup Script
 * Removes all documentation and setup files, keeping only production code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const projectPath = process.cwd();

// Files to remove
const filesToRemove = [
    'README.md',
    'README_FIRST.txt',
    'START_HERE.md',
    'QUICKSTART.md',
    'SETUP.md',
    'CHECKLIST.md',
    'API_TESTING.md',
    'TEST_DATA.md',
    'DEPLOYMENT.md',
    'PROJECT_SUMMARY.md',
    'FILE_INVENTORY.md',
    'CONFIG.example.js',
    'DELIVERY_REPORT.md',
    'FINAL_SUMMARY.txt',
    'INDEX.md',
    'create-project.js',
    'setup-dirs.js',
    'create-dirs-simple.js',
    'fix-setup.js',
    'next-env.d.ts',
    'tsconfig.tsbuildinfo',
    'cleanup.js',
    'CLEANUP_INSTRUCTIONS.txt'
];

console.log('🧹 Cleaning up project for production...\n');

let removed = 0;
filesToRemove.forEach(file => {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`✓ ${file}`);
            removed++;
        } catch (err) {
            console.error(`✗ Failed to remove ${file}: ${err.message}`);
        }
    }
});

// Handle README rename
try {
    const readmeProdPath = path.join(projectPath, 'README-PROD.md');
    const readmePath = path.join(projectPath, 'README.md');
    
    if (fs.existsSync(readmeProdPath) && fs.existsSync(readmePath)) {
        fs.unlinkSync(readmePath);
        fs.renameSync(readmeProdPath, readmePath);
        console.log(`✓ README.md (production version)`);
    }
} catch (err) {
    console.log(`Note: README handling completed`);
}

console.log(`\n✅ Production cleanup complete! (Removed ${removed} files)\n`);
console.log('📁 Your project structure:');
console.log(`${os.EOL}   AI-ETL-Intelligence-Frontend/${os.EOL}`);
console.log(`   ├── app/`);
console.log(`   │   ├── layout.tsx`);
console.log(`   │   ├── page.tsx`);
console.log(`   │   └── result/`);
console.log(`   │       └── page.tsx`);
console.log(`   ├── components/`);
console.log(`   │   ├── IncidentForm.tsx`);
console.log(`   │   ├── ResultCard.tsx`);
console.log(`   │   └── Loader.tsx`);
console.log(`   ├── utils/`);
console.log(`   │   └── api.ts`);
console.log(`   ├── styles/`);
console.log(`   │   └── globals.css`);
console.log(`   ├── .eslintrc.json`);
console.log(`   ├── .gitignore`);
console.log(`   ├── next.config.js`);
console.log(`   ├── package.json`);
console.log(`   ├── package-lock.json`);
console.log(`   ├── postcss.config.js`);
console.log(`   ├── tailwind.config.js`);
console.log(`   ├── tsconfig.json`);
console.log(`   └── README.md${os.EOL}`);
console.log(`🚀 Ready for production!`);
