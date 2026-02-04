import type { TicketType } from "@/types";

// Prix par type de billet
export const TICKET_PRICES: Record<TicketType, number> = {
  SOLIDAIRE: 15,
  NORMAL: 30,
  SOUTIEN: 50,
  GRATUIT: 0,
  PASS_CULTURE: 0,
};

// Calculer l'age a partir de la date de naissance
export function getAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

// Valider un type de billet en fonction de l'age
// Retourne le type effectif ou une erreur string
export function validateTicketTypeForAge(
  requestedType: TicketType,
  age: number
): { type: TicketType; error?: never } | { type?: never; error: string } {
  if (age < 12) {
    return { type: "GRATUIT" };
  }
  if (requestedType === "PASS_CULTURE" && age < 15) {
    return { error: "Le Pass Culture est reserve aux 15-18 ans" };
  }
  return { type: requestedType };
}
