#dockerfile
FROM node:20-alpine
#activer pnpm
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app
#copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./
#installer les dépendances
RUN pnpm install --frozen-lockfile
#copier tout le reste du code
COPY . .

EXPOSE 3001

CMD ["pnpm", "start"]