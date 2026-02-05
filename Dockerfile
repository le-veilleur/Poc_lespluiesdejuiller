# Étape 1 : Phase de construction
FROM node:20-alpine AS builder

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances Node.js
RUN npm install

# Copie tous les fichiers du projet dans le conteneur
COPY . .

# Copie le fichier .env pour les variables d'environnement
COPY .env ./

# Génère les types Prisma
RUN npx prisma generate

# Construit l'application Next.js
RUN npm run build

# Étape 2 : Phase d'exécution
FROM node:20-alpine AS runner

# Définit le répertoire de travail dans le conteneur d'exécution
WORKDIR /app

# Copie les fichiers package.json et package-lock.json depuis la phase de construction
COPY --from=builder /app/package*.json ./

# Copie le répertoire .next généré lors de la construction
COPY --from=builder /app/.next ./.next

# Copie les dépendances Node.js installées lors de la construction
COPY --from=builder /app/node_modules ./node_modules

# Copie le répertoire public contenant les fichiers statiques
COPY --from=builder /app/public ./public

# Copie les types Prisma générés
COPY --from=builder /app/prisma/generated ./prisma/generated

# Copie le fichier de configuration Prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Expose le port 3000 pour l'application Next.js
EXPOSE 3010

# Commande pour démarrer l'application Next.js
CMD ["npx", "next", "dev", "-p", "3010"]
