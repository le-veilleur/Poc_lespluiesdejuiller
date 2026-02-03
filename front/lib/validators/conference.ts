import { z } from "zod";

// --- Schema de validation pour la creation de conference ---
export const createConferenceSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caracteres"),
  description: z.string().min(10, "La description est trop courte"),
  date: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Date invalide" }
  ),
  location: z.string().min(2, "Le lieu est requis"),
  capacity: z.number().int().positive("La capacite doit etre positive"),
  category: z.string().min(2, "La categorie est requise"),
});
