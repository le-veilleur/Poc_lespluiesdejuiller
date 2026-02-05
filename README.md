# Les Pluies de Juillet

Application de billetterie pour le festival "Les Pluies de Juillet".

## Fonctionnalités

- Inscription et connexion des utilisateurs
- Consultation du programme des conférences
- Achat de billets
- Espace administrateur

## Stack technique

- **Frontend** : Next.js, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL + Prisma

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Poc_lespluiesdejuiller
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

### 3. Lancer avec Docker

```bash
docker compose up --build
```

### 4. Accéder à l'application

- **Application** : http://localhost:3010
- **pgAdmin** : http://localhost:5050
