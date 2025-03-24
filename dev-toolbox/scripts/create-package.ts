import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';

const packageName = process.argv[2];

if (!packageName) {
    console.error('❌ Tu dois fournir un nom de package :');
    console.error('   👉 npm run create:package <nom>');
    process.exit(1);
}

const basePath = join('packages', packageName);
const srcPath = join(basePath, 'src');
const testPath = join(basePath, '__tests__');
const templatePath = join('dev-toolbox', 'templates');

if (existsSync(basePath)) {
    console.error(`❌ Le package ${packageName} existe déjà.`);
    process.exit(1);
}

function loadTemplate(file: string, replacements: Record<string, string>) {
    let content = readFileSync(join(templatePath, file), 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
        content = content.replaceAll(`{{${key}}}`, value);
    }
    return content;
}

try {
    mkdirSync(srcPath, { recursive: true });
    mkdirSync(testPath, { recursive: true });

    writeFileSync(join(basePath, 'package.json'), loadTemplate('package.json', { packageName }));
    writeFileSync(join(basePath, 'tsconfig.json'), loadTemplate('tsconfig.json', { packageName }));
    writeFileSync(join(basePath, 'jest.config.cjs'), loadTemplate('jest.config.cjs', { packageName }));
    writeFileSync(join(srcPath, 'index.ts'), `// Entry point for @sh3pherd/${packageName}\n`);
    writeFileSync(join(testPath, `${packageName}.test.ts`), `test('${packageName} works', () => {
    expect(true).toBe(true);
  });
  `);

    console.log(`✅ Package @sh3pherd/${packageName} créé avec succès dans /packages/${packageName}`);
} catch (err) {
    console.error('❌ Une erreur est survenue pendant la création du package :', err);

    // 🧯 Rollback en cas d'échec
    try {
        rmSync(basePath, { recursive: true, force: true });
        console.log(`🗑️  Package partiel supprimé : /packages/${packageName}`);
    } catch (rmErr) {
        console.warn(`⚠️ Échec lors de la suppression du package : ${rmErr}`);
    }

    process.exit(1);
}

// 🧹 Nettoyage post-script
try {
    rmSync('dist-dev-toolbox', { recursive: true, force: true });
    console.log('🧹 Dossier dist-dev-toolbox supprimé après exécution');
} catch (err) {
    console.warn('⚠️ Impossible de supprimer dist-dev-toolbox :', err);
}
