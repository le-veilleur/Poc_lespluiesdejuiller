import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { createTicketSchema } from "@/lib/validators/ticket";
import type { ApiResponse, Ticket } from "@/types";

// Prix par type de billet
const TICKET_PRICES: Record<string, number> = {
  SOLIDAIRE: 15,
  NORMAL: 30,
  SOUTIEN: 50,
  GRATUIT: 0,
  PASS_CULTURE: 0,
};

// Calculer l'age a partir de la date de naissance
function getAge(dateOfBirth: Date): number {
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

// GET /api/tickets - Recuperer les billets de l'utilisateur connecte
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Ticket[]>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tickets as Ticket[] });
  } catch (error) {
    console.error("Erreur recuperation billets:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Acheter un billet
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Ticket>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const result = createTicketSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Recuperer l'utilisateur pour verifier l'age
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const age = getAge(user.dateOfBirth);
    let ticketType = result.data.type;

    // Regles metier : age → type de billet
    if (age < 12) {
      ticketType = "GRATUIT";
    } else if (age >= 15 && age <= 18 && ticketType === "PASS_CULTURE") {
      ticketType = "PASS_CULTURE";
    } else if (age < 15 && ticketType === "PASS_CULTURE") {
      return NextResponse.json(
        {
          success: false,
          error: "Le Pass Culture est reserve aux 15-18 ans",
        },
        { status: 400 }
      );
    }

    const price = TICKET_PRICES[ticketType];

    const ticket = await prisma.ticket.create({
      data: {
        userId: auth.userId,
        type: ticketType,
        price,
      },
    });

    return NextResponse.json(
      { success: true, data: ticket as Ticket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur achat billet:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
