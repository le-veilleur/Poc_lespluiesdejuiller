import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse, Ticket } from "@/types";

// GET /api/tickets/:id – Recuperer un billet par son ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Ticket>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || ticket.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: "Billet introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket as Ticket });
  } catch (error) {
    console.error("Erreur recuperation billet:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/:id – Annuler un billet
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || ticket.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: "Billet introuvable" },
        { status: 404 }
      );
    }

    await prisma.ticket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression billet:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
