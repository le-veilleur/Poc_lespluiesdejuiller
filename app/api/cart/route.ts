import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse, Cart } from "@/types";

// GET /api/cart - Recuperer le panier de l'utilisateur (creer si inexistant)
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Cart>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: auth.userId },
      include: { items: { orderBy: { createdAt: "asc" } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: auth.userId },
        include: { items: true },
      });
    }

    return NextResponse.json({ success: true, data: cart as Cart });
  } catch (error) {
    console.error("Erreur recuperation panier:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Vider le panier entier
export async function DELETE(
  request: Request
): Promise<NextResponse<ApiResponse>> {
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
    });

    if (cart) {
      await prisma.cart.delete({ where: { id: cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression panier:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
