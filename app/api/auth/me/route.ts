import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse, AuthResponse } from "@/types";

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        dateOfBirth: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Erreur recuperation utilisateur:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}