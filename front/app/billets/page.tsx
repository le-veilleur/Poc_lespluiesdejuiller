"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse, Ticket, TicketType } from "@/types";

const TICKET_OPTIONS: { type: TicketType; label: string; price: string }[] = [
  { type: "SOLIDAIRE", label: "Solidaire", price: "15" },
  { type: "NORMAL", label: "Normal", price: "30" },
  { type: "SOUTIEN", label: "Soutien", price: "50" },
];

export default function BilletsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<TicketType>("NORMAL");
  const [buying, setBuying] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // useEffect change l'etat du composant 
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchTickets();
  }, [user, authLoading]);

  async function fetchTickets() {
    try {
      const res = await fetch("/api/tickets");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data: ApiResponse<Ticket[]> = await res.json();
      if (data.success && data.data) {
        setTickets(data.data);
      }
    } catch {
      setError("Erreur lors du chargement des billets");
    } finally {
      setLoading(false);
    }
  }

  async function buyTicket() {
    setBuying(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType }),
      });

      const data: ApiResponse<Ticket> = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de l'achat");
        return;
      }

      setMessage("Billet achete avec succes");
      fetchTickets();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setBuying(false);
    }
  }

  async function deleteTicket(id: string) {
    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      const data: ApiResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      setMessage("Billet supprime");
      setTickets(tickets.filter((t) => t.id !== id));
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("fr-FR", {
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
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes billets</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {message}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Acheter un billet</h2>
        <div className="flex gap-3 flex-wrap mb-4">
          {TICKET_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setSelectedType(opt.type)}
              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                selectedType === opt.type
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label} - {opt.price}€
            </button>
          ))}
        </div>
        <button
          onClick={buyTicket}
          disabled={buying}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {buying ? "Achat en cours..." : "Acheter"}
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4">
        Vos billets ({tickets.length})
      </h2>

      {tickets.length === 0 ? (
        <p className="text-gray-500">Vous n&apos;avez aucun billet.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <span className="font-medium">{ticket.type}</span>
                <span className="text-gray-500 ml-3">{ticket.price}€</span>
                <span className="text-gray-400 text-sm ml-3">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
              <button
                onClick={() => deleteTicket(ticket.id)}
                disabled={deletingId === ticket.id}
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                {deletingId === ticket.id ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
