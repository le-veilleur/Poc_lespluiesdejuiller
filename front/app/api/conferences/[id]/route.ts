import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse, Conference } from "@/types";

// GET /api/conferences/:id - Detail d'une conference
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Conference>>> {
  try {
    const { id } = await params;

    const conference = await prisma.conference.findUnique({ where: { id } });

    if (!conference) {
      return NextResponse.json(
        { success: false, error: "Conference introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conference as Conference,
    });
  } catch (error) {
    console.error("Erreur recuperation conference:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/conferences/:id - Modifier une conference (admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Conference>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acces refuse" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const conference = await prisma.conference.update({
      where: { id },
      data: {
        ...body,
        ...(body.date && { date: new Date(body.date) }),
      },
    });

    return NextResponse.json({
      success: true,
      data: conference as Conference,
    });
  } catch (error) {
    console.error("Erreur modification conference:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/conferences/:id – Supprimer une conference (admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const auth = authenticateRequest(request.headers);
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acces refuse" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    await prisma.conference.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression conference:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
