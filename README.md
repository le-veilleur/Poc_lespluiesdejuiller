# Les Pluies de Juillet

Projet Next.js pour le festival Les Pluies de Juillet.

## Prerequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/)

## Lancer le projet avec Docker

### 1. Configurer les variables d'environnement

Copier le fichier d'exemple et adapter les valeurs :

```bash
cp .env.example .env
```

Variables a configurer dans `front/.env` :

| Variable | Description |
|---|---|
| `POSTGRES_USER` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `POSTGRES_DB` | Nom de la base de donnees |
| `DATABASE_URL` | URL de connexion a la base (format : `postgresql://user:password@db:5432/festival_db`) |
| `PGADMIN_DEFAULT_EMAIL` | Email de connexion pgAdmin |
| `PGADMIN_DEFAULT_PASSWORD` | Mot de passe pgAdmin |
| `JWT_SECRET` | Secret pour signer les tokens JWT |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe (mode test) |
| `STRIPE_PUBLIC_KEY` | Cle publique Stripe (mode test) |
| `NEXT_PUBLIC_API_URL` | URL de l'API (`http://localhost:3000/api`) |

### 2. Lancer les conteneurs

Depuis la racine du projet :

```bash
docker compose up --build
```

Cela demarre 3 services :

| Service | Description | Port |
|---|---|---|
| **front** | Application Next.js | [http://localhost:3000](http://localhost:3000) |
| **db** | Base de donnees PostgreSQL 16 | `localhost:5432` |
| **pgadmin** | Interface d'administration PostgreSQL | [http://localhost:5050](http://localhost:5050) |

### 3. Lancer en arriere-plan

```bash
docker compose up --build -d
```

### 4. Voir les logs

```bash
docker compose logs -f
```

### 5. Arreter les conteneurs

```bash
docker compose down
```

Pour supprimer aussi les volumes (donnees de la base) :

```bash
docker compose down -v
```

## Developpement sans Docker

```bash
cd front
npm install
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).
