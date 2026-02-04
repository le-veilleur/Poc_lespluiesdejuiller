import { z } from "zod";

// Schema pour ajouter un item au panier
export const addCartItemSchema = z.object({
  type: z.enum(["SOLIDAIRE", "NORMAL", "SOUTIEN", "GRATUIT", "PASS_CULTURE"]),
});
