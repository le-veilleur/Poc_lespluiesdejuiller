"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  // le user est null si personne n'est connecte est il est dans le contexte AuthContext
  const { user } = useAuth();

  return (
    <main className="flex-1 flex items-center justify-center px-4 min-h-[calc(100vh-65px)]">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold">Les Pluies de Juillet</h1>

        <p className="text-lg text-gray-500">
          Festival de conferences et rencontres culturelles.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/conferences"
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-900"
          >
            Voir les conferences
          </Link>

          {!user && (
            <Link
              href="/register"
              className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-100"
            >
              Creer un compte
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}