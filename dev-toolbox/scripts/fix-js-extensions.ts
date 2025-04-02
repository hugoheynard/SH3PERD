import fs from 'fs';
import path from 'path';

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');

/**
 * Corrige les imports relatifs dans un fichier .js
 */
function fixImportsInFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');

    const updated = content.replace(
        /(import\s.*?from\s+['"])(\.\/[^'"]+?)(['"])/g,
        (_, prefix, importPath, suffix) => {
            if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
                return `${prefix}${importPath}${suffix}`;
            }
            return `${prefix}${importPath}.js${suffix}`;
        }
    ).replace(
        /(export\s.*?from\s+['"])(\.\/[^'"]+?)(['"])/g,
        (_, prefix, importPath, suffix) => {
            if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
                return `${prefix}${importPath}${suffix}`;
            }
            return `${prefix}${importPath}.js${suffix}`;
        }
    );

    fs.writeFileSync(filePath, updated, 'utf8');
}

/**
 * Parcourt tous les fichiers .js d'un dossier
 */
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

/**
 * Trouve tous les packages et patch leur /dist
 */
function fixAllPackages() {
    if (!fs.existsSync(PACKAGES_DIR)) {
        console.error(`[fix-js-extensions] 📦  "packages/" not found.`);
        process.exit(1);
    }

    const packageDirs = fs.readdirSync(PACKAGES_DIR);

    for (const pkg of packageDirs) {
        const distDir = path.join(PACKAGES_DIR, pkg, 'dist');

        if (fs.existsSync(distDir)) {
            console.log(`[fix-js-extensions] Patching ${pkg}/dist`);
            walkAndFix(distDir);
        } else {
            console.log(`[fix-js-extensions] ⏭ Pas de dist pour ${pkg}, ignoré`);
        }
    }

    console.log(`[fix-js-extensions] ✅ Executed on all packages`);
}

fixAllPackages();
