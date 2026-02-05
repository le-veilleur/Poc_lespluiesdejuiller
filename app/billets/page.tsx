"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse, Ticket, TicketType, Cart, CartItem } from "@/types";

// Options de billets affichees a l'utilisateur
const TICKET_OPTIONS: { type: TicketType; label: string; price: string }[] = [
  { type: "SOLIDAIRE", label: "Solidaire", price: "15" },
  { type: "NORMAL", label: "Normal", price: "30" },
  { type: "SOUTIEN", label: "Soutien", price: "50" },
];

export default function BilletsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State des billets achetes
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State du panier
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedType, setSelectedType] = useState<TicketType>("NORMAL");
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketDob, setTicketDob] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Messages
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // --- Fetch ---

  // Recuperer les billets achetes
  const fetchTickets = useCallback(async () => {
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
  }, [router]);

  // Recuperer le panier
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) return;
      const data: ApiResponse<Cart> = await res.json();
      if (data.success && data.data) {
        setCart(data.data);
      }
    } catch {
      // Echec silencieux, le panier affichera vide
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    // Pre-remplir nom/email/dateOfBirth avec les infos du compte pour le 1er billet
    setTicketName(user.name);
    setTicketEmail(user.email);
    setTicketDob(new Date(user.dateOfBirth).toISOString().split("T")[0]);
    fetchTickets();
    fetchCart();
  }, [user, authLoading, router, fetchTickets, fetchCart]);

  // --- Actions panier ---

  // Ajouter un billet au panier
  async function addToCart() {
    if (!ticketName.trim() || !ticketEmail.trim() || !ticketDob) {
      setError("Veuillez renseigner le nom, l'email et la date de naissance du participant");
      return;
    }

    setAddingToCart(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, name: ticketName.trim(), email: ticketEmail.trim(), dateOfBirth: ticketDob }),
      });

      const data: ApiResponse<CartItem> = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de l'ajout au panier");
        return;
      }

      setMessage("Billet ajoute au panier");
      // Vider les champs pour le prochain billet
      setTicketName("");
      setTicketEmail("");
      setTicketDob("");
      fetchCart();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setAddingToCart(false);
    }
  }

  // Retirer un item du panier
  async function removeFromCart(itemId: string) {
    setRemovingItemId(itemId);
    setError("");

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
      const data: ApiResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      fetchCart();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setRemovingItemId(null);
    }
  }

  // Vider le panier entier
  async function clearCart() {
    setError("");

    try {
      const res = await fetch("/api/cart", { method: "DELETE" });
      const data: ApiResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors du vidage du panier");
        return;
      }

      setCart(null);
      setMessage("Panier vide");
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }

  // Confirmer la commande : creer les billets a partir du panier
  async function confirmCart() {
    setConfirming(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/cart/confirm", { method: "POST" });
      const data: ApiResponse<Ticket[]> = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de la confirmation");
        return;
      }

      setMessage("Commande confirmee ! Vos billets ont ete crees.");
      setCart(null);
      fetchTickets();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setConfirming(false);
    }
  }

  // --- Actions billets ---

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

  // --- Utilitaires ---

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Calculs du panier
  const cartItems = cart?.items ?? [];
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const cartItemCount = cartItems.length;

  // --- Rendu ---

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

      {/* Informations tarifaires */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-800">
        <p className="font-semibold mb-2">Informations tarifaires</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Moins de 12 ans : <strong>billet gratuit</strong></li>
          <li>15-18 ans : eligible au <strong>Pass Culture</strong></li>
          <li>Solidaire : 15&euro; / Normal : 30&euro; / Soutien : 50&euro;</li>
        </ul>
      </div>

      {/* Section 1 : Ajouter au panier */}
      <div className="border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Ajouter au panier</h2>

        {/* Champs nom, email et date de naissance du participant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="ticketName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du participant
            </label>
            <input
              id="ticketName"
              type="text"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              placeholder="Nom complet"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="ticketEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email du participant
            </label>
            <input
              id="ticketEmail"
              type="email"
              value={ticketEmail}
              onChange={(e) => setTicketEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="ticketDob" className="block text-sm font-medium text-gray-700 mb-1">
              Date de naissance
            </label>
            <input
              id="ticketDob"
              type="date"
              value={ticketDob}
              onChange={(e) => setTicketDob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

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
              {opt.label} - {opt.price}&euro;
            </button>
          ))}
        </div>
        <button
          onClick={addToCart}
          disabled={addingToCart || !ticketName.trim() || !ticketEmail.trim() || !ticketDob}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {addingToCart ? "Ajout en cours..." : "Ajouter au panier"}
        </button>
      </div>

      {/* Section 2 : Votre panier */}
      {cartItemCount > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Votre panier ({cartItemCount}{" "}
            {cartItemCount > 1 ? "articles" : "article"})
          </h2>
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100"
              >
                <div>
                  <span className="font-medium">{item.type}</span>
                  <span className="text-gray-500 ml-3">{item.price}&euro;</span>
                  <span className="text-gray-400 text-sm ml-3">
                    {item.name} ({item.email})
                  </span>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  disabled={removingItemId === item.id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  {removingItemId === item.id ? "..." : "Retirer"}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between font-semibold text-lg mb-4 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{cartTotal}&euro;</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={confirmCart}
              disabled={confirming}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {confirming
                ? "Confirmation en cours..."
                : "Confirmer la commande"}
            </button>
            <button
              onClick={clearCart}
              className="px-4 py-2 text-gray-600 hover:text-black text-sm transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>
      )}

      {/* Section 3 : Billets achetes */}
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
                <span className="text-gray-500 ml-3">{ticket.price}&euro;</span>
                <span className="text-gray-400 text-sm ml-3">
                  {ticket.name} ({ticket.email})
                </span>
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
