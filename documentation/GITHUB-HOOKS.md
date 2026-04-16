# GitHub Hooks

Documentation des hooks Git locaux utilisés dans le monorepo.

Important:

- ce sont des hooks Git locaux, pas des GitHub Actions
- ils vivent dans [`/.githooks`](../.githooks/)
- le repo les active via `git config core.hooksPath .githooks`

Le script racine associé est:

```bash
pnpm run setup:hooks
```

## Objectif

Le choix actuel est volontaire:

- garder le `dev/watch` fluide pendant le développement
- éviter le bruit d'un lint permanent en fond
- bloquer seulement au moment du commit sur les fichiers réellement stagés

Autrement dit:

- pendant le dev: on code sans friction
- avant le commit: on remet les garde-fous

## Pre-commit actuel

Le hook actuel est [`/.githooks/pre-commit`](../.githooks/pre-commit).

Il lance:

```bash
pnpm exec lint-staged
```

La config est dans [`/.lintstagedrc.mjs`](../.lintstagedrc.mjs).

### Ce qui est vérifié

#### Backend

Sur les fichiers stagés `apps/backend/src/**/*.ts`:

```bash
pnpm exec eslint --config apps/backend/eslint.config.mjs --fix
```

#### Audio processor

Sur les fichiers stagés `apps/audio-processor/src/**/*.ts`:

```bash
pnpm exec eslint --config apps/audio-processor/eslint.config.mjs --fix
```

#### Prettier

Sur les fichiers texte classiques stagés:

- `js`
- `mjs`
- `cjs`
- `ts`
- `tsx`
- `json`
- `md`
- `yml`
- `yaml`
- `scss`
- `css`
- `html`

le hook lance:

```bash
pnpm exec prettier --write
```

## Pourquoi ce choix

Le repo a déjà un `watch` de dev utile pour compiler et faire tourner les apps, mais ce `watch` n'est pas pensé pour remonter le lint en continu.

En pratique:

- `dev/watch` sert au feedback rapide
- le `pre-commit` sert au contrôle qualité léger

Ce compromis réduit la friction:

- pas de lint intrusif pendant l'exploration
- pas d'oubli de format/lint avant commit

## Activer les hooks localement

Si le hook n'est pas actif sur une machine:

```bash
pnpm run setup:hooks
```

Pour vérifier:

```bash
git config --get core.hooksPath
```

La valeur attendue est:

```text
.githooks
```

## Limites actuelles

Le `pre-commit` ne vérifie pas encore:

- la compilation TypeScript complète
- l'état d'un process `dev:watch`
- les tests

C'est volontaire: ces vérifications sont plus lentes et rajoutent de la friction si on les met trop tôt dans le cycle.

## Possibilité d'ajouter un pre-push

Si on veut un garde-fou plus fort sans alourdir chaque commit, la meilleure option est un `pre-push`.

### Pourquoi en pre-push

Le `pre-push` est un bon endroit pour lancer des vérifications plus coûteuses:

- compilation TypeScript
- tests ciblés
- checks multi-packages

Ça garde:

- des commits rapides
- une barrière plus forte juste avant d'envoyer le code

### Recommandation

Le plus logique pour ce monorepo serait:

- `pre-commit`: `lint-staged`
- `pre-push`: compilation ciblée des packages sensibles

Par exemple:

- `@sh3pherd/backend`
- `@sh3pherd/shared-types`

Le principe serait de bloquer le push si une commande de type:

```bash
pnpm --filter @sh3pherd/backend exec tsc --noEmit
pnpm --filter @sh3pherd/shared-types exec tsc --noEmit
```

échoue.

### Important

On ne cherche pas à "lire l'état" d'un `dev:watch`.

Un hook Git doit rester:

- déterministe
- reproductible
- indépendant d'un terminal déjà ouvert

Donc si on ajoute un `pre-push`, il doit relancer ses propres checks, pas essayer de parser la sortie d'un watcher.
