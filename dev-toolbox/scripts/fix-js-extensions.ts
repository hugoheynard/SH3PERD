import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PACKAGES_DIR = path.resolve(process.cwd(), '../../packages');

// Mémoire interne pour stocker les fichiers déjà traités dans cette exécution
const cache = new Map<string, string>();

function hash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
}

function fixImportsInFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const currentHash = hash(content);

    if (cache.get(filePath) === currentHash) return; // déjà traité

    const updated = content
        .replace(/(import\s.*?from\s+['"])(\.\/[^'"]+?)(['"])/g, (_, prefix, importPath, suffix) => {
            return importPath.endsWith('.js') || importPath.endsWith('.json')
                ? `${prefix}${importPath}${suffix}`
                : `${prefix}${importPath}.js${suffix}`;
        })
        .replace(/(export\s.*?from\s+['"])(\.\/[^'"]+?)(['"])/g, (_, prefix, importPath, suffix) => {
            return importPath.endsWith('.js') || importPath.endsWith('.json')
                ? `${prefix}${importPath}${suffix}`
                : `${prefix}${importPath}.js${suffix}`;
        });

    if (content !== updated) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(`[fix-js-extensions] ✅ Patched: ${filePath}`);
    }

    cache.set(filePath, hash(updated));
}

function walkAndFix(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkAndFix(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.js')) {
            fixImportsInFile(fullPath);
        }
    }
}

function fixAllPackages() {
    if (!fs.existsSync(PACKAGES_DIR)) {
        console.error(`[fix-js-extensions] 📦  "packages/" not found.`);
        process.exit(1);
    }

    const packageDirs = fs.readdirSync(PACKAGES_DIR);
    for (const pkg of packageDirs) {
        const distDir = path.join(PACKAGES_DIR, pkg, 'dist');
        if (fs.existsSync(distDir)) {
            walkAndFix(distDir);
        }
    }

    console.log(`[fix-js-extensions] ✅ Executed with in-memory cache`);
}

fixAllPackages();
