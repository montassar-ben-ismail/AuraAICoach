# === Stage 1 : Build ===
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer avec npm
RUN npm ci

# Copier tout le code source
COPY . .

# Build de production
RUN npm run build

# Stage 2 : Production avec Nginx 
FROM nginx:alpine

# Copier le build Vite (dans dist/)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]