import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import type { ApiResponse } from "@/types";

interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  totalConferences: number;
  totalRegistrations: number;
  ticketsByType: {
    type: string;
    count: number;
    revenue: number;
  }[];
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<DashboardStats>>> {
  const auth = authenticateRequest(request.headers);
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acces refuse" },
      { status: 403 }
    );
  }

  try {
    const [
      totalUsers,
      totalTickets,
      totalConferences,
      totalRegistrations,
      revenueResult,
      ticketsByType,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.ticket.count(),
      prisma.conference.count(),
      prisma.planning.count(),
      prisma.ticket.aggregate({ _sum: { price: true } }),
      prisma.ticket.groupBy({
        by: ["type"],
        _count: { id: true },
        _sum: { price: true },
      }),
    ]);

    const data: DashboardStats = {
      totalUsers,
      totalTickets,
      totalRevenue: revenueResult._sum.price ?? 0,
      totalConferences,
      totalRegistrations,
      ticketsByType: ticketsByType.map((group) => ({
        type: group.type,
        count: group._count.id,
        revenue: group._sum.price ?? 0,
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Erreur recuperation stats admin:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
