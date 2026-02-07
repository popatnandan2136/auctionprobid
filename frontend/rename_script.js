const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
    
}

const files = getAllFiles(srcDir);
const renamedFiles = new Set();
const fileMapping = {}; // oldFileName -> newFileName (basename)

// 1. Rename files
files.forEach(filePath => {
    if (path.extname(filePath) === '.js') {
        const content = fs.readFileSync(filePath, 'utf8');
        // Simple heuristic for JSX: looking for HTML tags, React imports or return ( <
        if (/<[a-z][\s\S]*>/i.test(content) || /import\s+React/i.test(content) || /return\s*\(\s*</.test(content)) {
            const dir = path.dirname(filePath);
            const name = path.basename(filePath, '.js');
            const newPath = path.join(dir, `${name}.jsx`);

            console.log(`Renaming ${path.relative(srcDir, filePath)} -> ${path.relative(srcDir, newPath)}`);
            fs.renameSync(filePath, newPath);
            renamedFiles.add(newPath); // Store new path
            fileMapping[path.basename(filePath)] = `${name}.jsx`;
        }
    }
});

// Refresh file list after renaming
const allFilesAfterRename = getAllFiles(srcDir);

// 2. Update imports
allFilesAfterRename.forEach(filePath => {
    if (path.extname(filePath) === '.jsx' || path.extname(filePath) === '.js') {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Replace imports/exports ending in .js
        // Look for: from "./path/to/File.js" or "./File.js"
        content = content.replace(/from\s+['"](.+?)\.js['"]/g, (match, importPath) => {
            // Checks if a corresponding .jsx file exists for this import in the fileMapping
            const basename = path.basename(importPath) + '.js';
            // Logic constraint: We blindly replace .js with .jsx if we renamed a file with that basename. 
            // This relies on unique basenames or relative path logic, but simpler approach:
            // just blindly replace .js extension in imports if we are in a jsx/js file context.
            // But better is to check if the file was actually renamed.

            // Let's assume if it ends in .js and we are in this project, it's likely a local import.
            // We only change it if we renamed a file that matches.

            // Actually, safer: just replace .js with .jsx universally for relative paths
            if (importPath.startsWith('.')) {
                changed = true;
                return `from '${importPath}.jsx'`;
            }
            return match;
        });

        // Also handle dynamic imports or require if any (unlikely in this codebase but good practice)

        if (changed) {
            console.log(`Updating imports in ${path.relative(srcDir, filePath)}`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});

console.log('Renaming and update complete.');
