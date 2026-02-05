-- CartItem : ajout dateOfBirth
ALTER TABLE "CartItem" ADD COLUMN "dateOfBirth" TIMESTAMP(3) NOT NULL DEFAULT '2000-01-01T00:00:00.000Z';
ALTER TABLE "CartItem" ALTER COLUMN "dateOfBirth" DROP DEFAULT;

-- Ticket : ajout dateOfBirth (valeur par defaut pour les lignes existantes)
ALTER TABLE "Ticket" ADD COLUMN "dateOfBirth" TIMESTAMP(3) NOT NULL DEFAULT '2000-01-01T00:00:00.000Z';
ALTER TABLE "Ticket" ALTER COLUMN "dateOfBirth" DROP DEFAULT;
