import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import glob from 'fast-glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagesDir = path.resolve(__dirname, '../../packages');
const aliasPrefix = '@sh3pherd/';

async function updateReferences(): Promise<void> {
    const packages = await fs.readdir(packagesDir);

    for (const pkg of packages) {
        const pkgPath = path.join(packagesDir, pkg);
        const tsconfigPath = path.join(pkgPath, 'tsconfig.json');

        let tsconfig: any;
        try {
            const raw = await fs.readFile(tsconfigPath, 'utf-8');
            tsconfig = JSON.parse(raw);
        } catch (err) {
            console.warn(`⚠️  Impossible de lire ${pkg}/tsconfig.json, ignoré.`);
            continue;
        }

        const tsFiles = await glob(['src/**/*.ts'], {
            cwd: pkgPath,
            absolute: true,
        });

        const internalDeps = new Set<string>();

        for (const file of tsFiles) {
            const content = await fs.readFile(file, 'utf-8');
            const matches = content.matchAll(/from\s+['"](@sh3pherd\/[^'"]+)['"]/g);

            for (const [, dep] of matches) {
                const depName = dep.replace(aliasPrefix, '').split('/')[0];
                if (depName && depName !== pkg) {
                    internalDeps.add(depName);
                }
            }
        }

        const newDeps = [...internalDeps];
        const newReferences = newDeps.map((dep) => ({ path: `../${dep}` }));

        const oldReferences = (tsconfig.references ?? []).map((r: any) =>
            typeof r.path === 'string' ? r.path.replace(/^\.\.\//, '') : ''
        );

        const added = newDeps.filter((dep) => !oldReferences.includes(dep));
        const removed = oldReferences.filter((dep) => !newDeps.includes(dep));

        if (added.length === 0 && removed.length === 0) {
            console.log(`✅ ${pkg}/tsconfig.json déjà à jour`);
            continue;
        }

        tsconfig.references = newReferences;
        await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));

        const logs: string[] = [];
        if (added.length > 0) logs.push(`➕ ajouté(s) : ${added.join(', ')}`);
        if (removed.length > 0) logs.push(`➖ retiré(s) : ${removed.join(', ')}`);

        console.log(`🔄 ${pkg}/tsconfig.json mis à jour → ${logs.join(' | ')}`);
    }
}

async function generateTsconfigBuild(): Promise<void> {
    const packages = await fs.readdir(packagesDir);

    const dependencyGraph: Record<string, Set<string>> = {};
    const allPackages = new Set<string>();

    for (const pkg of packages) {
        const tsconfigPath = path.join(packagesDir, pkg, 'tsconfig.json');

        try {
            const raw = await fs.readFile(tsconfigPath, 'utf-8');
            const tsconfig = JSON.parse(raw);
            allPackages.add(pkg);
            const refs: string[] = (tsconfig.references || [])
                .map((ref: { path: string }) => path.basename(ref.path));

            dependencyGraph[pkg] = new Set(refs);
        } catch {
            continue;
        }
    }

    // Topological sort
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function visit(pkg: string) {
        if (visited.has(pkg)) return;
        if (visiting.has(pkg)) {
            throw new Error(`🚨 Dépendance circulaire détectée dans ${pkg}`);
        }

        visiting.add(pkg);
        for (const dep of dependencyGraph[pkg] || []) {
            visit(dep);
        }
        visiting.delete(pkg);
        visited.add(pkg);
        sorted.push(pkg);
    }

    for (const pkg of allPackages) {
        visit(pkg);
    }

    const buildConfig = {
        extends: './tsconfig.base.json',
        files: [],
        references: sorted.map((pkg) => ({ path: `packages/${pkg}` })),
        exclude: ['dist', 'node_modules']
    };

    const buildPath = path.resolve(__dirname, '../../tsconfig.build.json');
    await fs.writeFile(buildPath, JSON.stringify(buildConfig, null, 2));

    console.log(`✅ tsconfig.build.json généré avec ${sorted.length} packages dans le bon ordre`);
}


updateReferences().catch((err) => {
    console.error('❌ Erreur pendant updateReferences :', err);
    process.exit(1);
});

(async () => {
    await updateReferences();
    await generateTsconfigBuild();
})();
