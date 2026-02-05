import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse, Ticket } from "@/types";

// POST /api/cart/confirm - Confirmer le panier et creer les billets
export async function POST(
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
    const cart = await prisma.cart.findUnique({
      where: { userId: auth.userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Le panier est vide" },
        { status: 400 }
      );
    }

    // Transaction : creer tous les billets puis supprimer le panier
    const tickets = await prisma.$transaction(async (tx) => {
      // Creer un Ticket par CartItem
      const createdTickets = await Promise.all(
        cart.items.map((item) =>
          tx.ticket.create({
            data: {
              userId: auth.userId,
              type: item.type,
              price: item.price,
            },
          })
        )
      );

      // Supprimer le panier (cascade supprime les items)
      await tx.cart.delete({ where: { id: cart.id } });

      return createdTickets;
    });

    return NextResponse.json(
      { success: true, data: tickets as Ticket[] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur confirmation panier:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
