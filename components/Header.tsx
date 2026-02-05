"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
      <Link href="/" className="text-xl font-bold">
        Les Pluies de Juillet
      </Link>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/conferences" className="hover:underline">
          Conferences
        </Link>

        {loading ? null : user ? (
          <>
            <Link href="/billets" className="hover:underline">
              Mes billets
            </Link>
            <Link href="/planning" className="hover:underline">
              Mon planning
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className="hover:underline font-medium">
                Administration
              </Link>
            )}
            <span className="text-gray-500">{user.name}</span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-black"
            >
              Deconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
            >
              Inscription
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}