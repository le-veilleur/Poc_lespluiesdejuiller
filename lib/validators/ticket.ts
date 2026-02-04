import { z } from "zod";

export const createTicketSchema = z.object({
  type: z.enum(["SOLIDAIRE", "NORMAL", "SOUTIEN", "GRATUIT", "PASS_CULTURE"]),
});
