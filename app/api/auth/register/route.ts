import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators/auth";
import type { ApiResponse, AuthResponse } from "@/types";

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  try {
    const body = await request.json();

    // Validation avec Zod
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, dateOfBirth } = result.data;

    // Verifier si l'utilisateur existe deja
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Cet email est deja utilise" },
        { status: 409 }
      );
    }

    // Creer l'utilisateur
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        dateOfBirth: new Date(dateOfBirth),
      },
    });

    // Generer le token JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            dateOfBirth: user.dateOfBirth,
            role: user.role,
          },
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
