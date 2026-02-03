import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { createConferenceSchema } from "@/lib/validators/conference";
import type { ApiResponse, Conference } from "@/types";

// GET /api/conferences - Liste des conferences (publique)
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<Conference[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const date = searchParams.get("date");

    // Construire les filtres dynamiquement
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const conferences = await prisma.conference.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: conferences as Conference[],
    });
  } catch (error) {
    console.error("Erreur recuperation conferences:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/conferences - Creer une conference (admin uniquement)
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Conference>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acces refuse" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const result = createConferenceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const conference = await prisma.conference.create({
      data: {
        ...result.data,
        date: new Date(result.data.date),
      },
    });

    return NextResponse.json(
      { success: true, data: conference as Conference },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur creation conference:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
