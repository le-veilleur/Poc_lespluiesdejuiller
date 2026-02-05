import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse } from "@/types";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  _count: {
    tickets: number;
    planning: number;
  };
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<AdminUser[]>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acces refuse" },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            tickets: true,
            planning: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: users as AdminUser[],
    });
  } catch (error) {
    console.error("Erreur recuperation utilisateurs admin:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
