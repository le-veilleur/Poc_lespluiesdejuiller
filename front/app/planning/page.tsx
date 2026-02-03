"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse, PlanningEntry } from "@/types";

export default function PlanningPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<PlanningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [noTicket, setNoTicket] = useState(false);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchPlanning();
  }, [user, authLoading, router]);

  async function fetchPlanning() {
    try {
      const res = await fetch("/api/planning");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 403) {
        setNoTicket(true);
        setLoading(false);
        return;
      }

      const data: ApiResponse<PlanningEntry[]> = await res.json();
      if (data.success && data.data) {
        setEntries(data.data);
      }
    } catch {
      setError("Erreur lors du chargement du planning");
    } finally {
      setLoading(false);
    }
  }

  async function removeEntry(id: string) {
    setRemovingId(id);
    setError("");

    try {
      const res = await fetch(`/api/planning/${id}`, { method: "DELETE" });
      const data: ApiResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      setEntries(entries.filter((e) => e.id !== id));
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setRemovingId(null);
    }
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon planning</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {noTicket ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            Vous devez acheter un billet pour acceder au planning.
          </p>
          <Link
            href="/billets"
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Acheter un billet
          </Link>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            Votre planning est vide.
          </p>
          <Link
            href="/conferences"
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Voir les conferences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-6 flex items-start justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {entry.conference?.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {entry.conference?.description}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>
                    {entry.conference?.date &&
                      formatDate(entry.conference.date)}
                  </span>
                  <span>{entry.conference?.location}</span>
                  {entry.conference?.category && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {entry.conference.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                disabled={removingId === entry.id}
                className="ml-4 text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                {removingId === entry.id ? "Retrait..." : "Retirer"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}