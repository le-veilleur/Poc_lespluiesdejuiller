import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { addCartItemSchema } from "@/lib/validators/cart";
import { TICKET_PRICES, getAge, validateTicketTypeForAge } from "@/lib/tickets";
import type { ApiResponse, CartItem } from "@/types";

// POST /api/cart/items - Ajouter un item au panier
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<CartItem>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const result = addCartItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Valider l'age du participant (pas du compte acheteur)
    const age = getAge(result.data.dateOfBirth);
    const validation = validateTicketTypeForAge(result.data.type, age);

    if (validation.error) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const ticketType = validation.type!;
    const price = TICKET_PRICES[ticketType];

    // Recuperer ou creer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId: auth.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: auth.userId },
      });
    }

    // Creer l'item dans le panier
    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        type: ticketType,
        price,
        name: result.data.name,
        email: result.data.email,
        dateOfBirth: result.data.dateOfBirth,
      },
    });

    return NextResponse.json(
      { success: true, data: item as CartItem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur ajout item panier:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
