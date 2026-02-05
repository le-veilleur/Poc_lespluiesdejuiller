import { z } from "zod";

export const createTicketSchema = z.object({
  type: z.enum(["SOLIDAIRE", "NORMAL", "SOUTIEN", "GRATUIT", "PASS_CULTURE"]),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  email: z.string().email("Email invalide"),
  dateOfBirth: z.coerce.date({ message: "Date de naissance invalide" }),
});
