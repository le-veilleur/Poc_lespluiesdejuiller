import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse, PlanningEntry } from "@/types";

// GET /api/planning – Recuperer le planning de l'utilisateur
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<PlanningEntry[]>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    // Verifier que l'utilisateur a un billet
    const ticket = await prisma.ticket.findFirst({
      where: { userId: auth.userId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Vous devez avoir un billet pour acceder au planning" },
        { status: 403 }
      );
    }

    const planning = await prisma.planning.findMany({
      where: { userId: auth.userId },
      include: { conference: true },
      orderBy: { conference: { date: "asc" } },
    });

    return NextResponse.json({
      success: true,
      data: planning as unknown as PlanningEntry[],
    });
  } catch (error) {
    console.error("Erreur recuperation planning:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/planning – Ajouter une conference au planning
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<PlanningEntry>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Non autorise" },
      { status: 401 }
    );
  }

  try {
    // Verifier que l'utilisateur a un billet
    const ticket = await prisma.ticket.findFirst({
      where: { userId: auth.userId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Vous devez avoir un billet pour acceder au planning" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { conferenceId } = body;

    if (!conferenceId) {
      return NextResponse.json(
        { success: false, error: "conferenceId est requis" },
        { status: 400 }
      );
    }

    // Verifier que la conference existe
    const conference = await prisma.conference.findUnique({
      where: { id: conferenceId },
    });

    if (!conference) {
      return NextResponse.json(
        { success: false, error: "Conference introuvable" },
        { status: 404 }
      );
    }

    // Ajouter au planning (la contrainte unique empeche les doublons)
    const entry = await prisma.planning.create({
      data: {
        userId: auth.userId,
        conferenceId,
      },
      include: { conference: true },
    });

    return NextResponse.json(
      { success: true, data: entry as unknown as PlanningEntry },
      { status: 201 }
    );
  } catch (error) {
    // Gestion du doublon (contrainte unique Prisma)
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { success: false, error: "Cette conference est deja dans votre planning" },
        { status: 409 }
      );
    }

    console.error("Erreur ajout planning:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
