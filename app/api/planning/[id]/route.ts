import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse } from "@/types";

// DELETE /api/planning/:id - Retirer une conference du planning
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

    const entry = await prisma.planning.findUnique({ where: { id } });

    if (!entry || entry.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: "Entree de planning introuvable" },
        { status: 404 }
      );
    }

    await prisma.planning.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression planning:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
