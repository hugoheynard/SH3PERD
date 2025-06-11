# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @sh3pherd/backend build

# --- Runtime Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Copier uniquement le dossier de ton app et les fichiers de workspace
COPY apps/backend/package.json ./package.json
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Installer les dépendances de prod du backend
RUN pnpm install --prod --filter @sh3pherd/backend...

# Copier la build backend
COPY --from=builder /app/apps/backend/dist ./dist

CMD ["node", "dist/main"]
