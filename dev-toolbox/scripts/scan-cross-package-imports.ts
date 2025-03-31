import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, resolve, relative, dirname } from 'path';
import glob from 'fast-glob';

const PACKAGES_DIR = resolve('packages');
const ALIAS_PREFIX = '@sh3pherd';

function getAllPackages(): string[] {
    return readdirSync(PACKAGES_DIR).filter((name) => {
        const fullPath = join(PACKAGES_DIR, name);
        return statSync(fullPath).isDirectory();
    });
}

function fixCrossImports() {
    const packages = getAllPackages();
    let fixedCount = 0;

    for (const pkg of packages) {
        const currentRoot = join(PACKAGES_DIR, pkg, 'src');
        const files = glob.sync('**/*.ts', { cwd: currentRoot, absolute: true });

        for (const file of files) {
            const content = readFileSync(file, 'utf-8');
            let modifiedContent = content;

            const matches = [...content.matchAll(/from\s+['"]([^'"]+)['"]/g)];

            for (const match of matches) {
                const fullMatch = match[0];
                const importPath = match[1];

                if (importPath.startsWith('.')) {
                    const resolvedPath = resolve(dirname(file), importPath);

                    for (const targetPkg of packages) {
                        if (
                            targetPkg !== pkg &&
                            resolvedPath.startsWith(join(PACKAGES_DIR, targetPkg))
                        ) {
                            const relPath = relative(
                                join(PACKAGES_DIR, targetPkg, 'src'),
                                resolvedPath
                            );

                            const suggestedAlias =
                                relPath === 'index.ts'
                                    ? `${ALIAS_PREFIX}/${targetPkg}`
                                    : `${ALIAS_PREFIX}/${targetPkg}/${relPath.replace(/\.ts$/, '')}`;

                            // Mise à jour de l'import
                            const newImport = fullMatch.replace(importPath, suggestedAlias);
                            modifiedContent = modifiedContent.replace(fullMatch, newImport);
                            fixedCount++;
                        }
                    }
                }
            }

            if (modifiedContent !== content) {
                writeFileSync(file, modifiedContent, 'utf-8');
            }
        }
    }

    if (fixedCount === 0) {
        console.log('✅ Aucun import à corriger 🎉');
    } else {
        console.log(`🛠️ ${fixedCount} import(s) corrigé(s) automatiquement`);
    }
}

fixCrossImports();
