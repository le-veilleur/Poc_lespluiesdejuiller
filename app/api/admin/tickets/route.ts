import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse } from "@/types";

interface AdminTicket {
  id: string;
  type: string;
  price: number;
  name: string;
  email: string;
  dateOfBirth: Date;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<AdminTicket[]>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acces refuse" },
      { status: 403 }
    );
  }

  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tickets as AdminTicket[],
    });
  } catch (error) {
    console.error("Erreur recuperation billets admin:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
