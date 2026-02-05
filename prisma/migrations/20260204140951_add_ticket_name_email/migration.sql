-- CartItem : ajout name/email (table vide normalement, mais on protege)
ALTER TABLE "CartItem" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CartItem" ADD COLUMN "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CartItem" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "CartItem" ALTER COLUMN "email" DROP DEFAULT;

-- Ticket : ajout name/email avec valeur par defaut pour les lignes existantes
ALTER TABLE "Ticket" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Participant';
ALTER TABLE "Ticket" ADD COLUMN "email" TEXT NOT NULL DEFAULT 'inconnu@festival.fr';
ALTER TABLE "Ticket" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "Ticket" ALTER COLUMN "email" DROP DEFAULT;
