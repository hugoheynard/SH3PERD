import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ⚠️ Remplacer __dirname dans les modules ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES_DIR = path.resolve(__dirname, '../../packages');

const packages = fs.readdirSync(PACKAGES_DIR).filter((name) => {
    const fullPath = path.join(PACKAGES_DIR, name);
    return fs.statSync(fullPath).isDirectory();
});

const missing = [];

for (const dir of packages) {
    const packageJsonPath = path.join(PACKAGES_DIR, dir, 'package.json');

    if (!fs.existsSync(packageJsonPath)) continue;

    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);

    if (!pkg.scripts || !pkg.scripts['dev:watch']) {
        missing.push(pkg.name || dir);
    }
}

if (missing.length === 0) {
    console.log('✅ Tous les packages ont un script dev:watch');
} else {
    console.warn('⚠️ Les packages suivants n’ont pas de script dev:watch :');
    for (const name of missing) {
        console.warn(`  - ${name}`);
    }
}
