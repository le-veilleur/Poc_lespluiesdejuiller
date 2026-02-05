import { z } from "zod";

// --- Schema de validation pour l'inscription ---
export const registerSchema = z.object({
  email: z.email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  // Format YYYY-MM-DD
  dateOfBirth: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Date de naissance invalide" }
  ),
});

// --- Schema de validation pour la connexion ---
export const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
