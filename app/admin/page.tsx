"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse, Conference } from "@/types";

// Types admin

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

interface AdminTicket {
  id: string;
  type: string;
  price: number;
  name: string;
  email: string;
  dateOfBirth: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  _count: {
    tickets: number;
    planning: number;
  };
}

// Onglets

type Tab = "stats" | "conferences" | "tickets" | "users";

const TABS: { key: Tab; label: string }[] = [
  { key: "stats", label: "Tableau de bord" },
  { key: "conferences", label: "Conferences" },
  { key: "tickets", label: "Billets" },
  { key: "users", label: "Utilisateurs" },
];

const CATEGORIES = [
  "Culture",
  "Ecologie",
  "Musique",
  "Cinema",
  "Bien-être",
  "Societe",
  "Art",
  "Nature",
];

const TICKET_TYPE_LABELS: Record<string, string> = {
  SOLIDAIRE: "Solidaire (15 €)",
  NORMAL: "Normal (30 €)",
  SOUTIEN: "Soutien (50 €)",
  GRATUIT: "Gratuit (0 €)",
  PASS_CULTURE: "Pass Culture (0 €)",
};

const EMPTY_CONFERENCE_FORM = {
  title: "",
  description: "",
  date: "",
  location: "",
  capacity: "",
  category: CATEGORIES[0],
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("stats");

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Conferences
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [conferencesLoading, setConferencesLoading] = useState(true);
  const [conferenceForm, setConferenceForm] = useState(EMPTY_CONFERENCE_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingConference, setSavingConference] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tickets
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Messages
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Redirection si non-admin
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetching

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data: ApiResponse<DashboardStats> = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch {
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchConferences = useCallback(async () => {
    setConferencesLoading(true);
    try {
      const res = await fetch("/api/conferences");
      const data: ApiResponse<Conference[]> = await res.json();
      if (data.success && data.data) {
        setConferences(data.data);
      }
    } catch {
      setError("Erreur lors du chargement des conferences");
    } finally {
      setConferencesLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/admin/tickets");
      const data: ApiResponse<AdminTicket[]> = await res.json();
      if (data.success && data.data) {
        setTickets(data.data);
      }
    } catch {
      setError("Erreur lors du chargement des billets");
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data: ApiResponse<AdminUser[]> = await res.json();
      if (data.success && data.data) {
        setUsers(data.data);
      }
    } catch {
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user || user.role !== "ADMIN") return;
    fetchStats();
    fetchConferences();
    fetchTickets();
    fetchUsers();
  }, [authLoading, user, fetchStats, fetchConferences, fetchTickets, fetchUsers]);

  // CRUD Conferences

  async function handleConferenceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingConference(true);

    try {
      const body = {
        title: conferenceForm.title,
        description: conferenceForm.description,
        date: conferenceForm.date,
        location: conferenceForm.location,
        capacity: parseInt(conferenceForm.capacity, 10),
        category: conferenceForm.category,
      };

      const url = editingId
        ? `/api/conferences/${editingId}`
        : "/api/conferences";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: ApiResponse<Conference> = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      setMessage(
        editingId
          ? "Conference modifiee avec succes"
          : "Conference creee avec succes"
      );
      setConferenceForm(EMPTY_CONFERENCE_FORM);
      setEditingId(null);
      fetchConferences();
      fetchStats();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setSavingConference(false);
    }
  }

  function startEditing(conf: Conference) {
    setEditingId(conf.id);
    setConferenceForm({
      title: conf.title,
      description: conf.description,
      date: new Date(conf.date).toISOString().slice(0, 16),
      location: conf.location,
      capacity: String(conf.capacity),
      category: conf.category,
    });
    setError("");
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setConferenceForm(EMPTY_CONFERENCE_FORM);
  }

  async function deleteConference(id: string) {
    if (!confirm("Supprimer cette conference ? Cette action est irreversible.")) {
      return;
    }

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/conferences/${id}`, { method: "DELETE" });
      const data: ApiResponse = await res.json();

      if (!data.success) {
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      setMessage("Conference supprimee");
      fetchConferences();
      fetchStats();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setDeletingId(null);
    }
  }

  // Utilitaires

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Gardes de rendu

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>

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

      {/* Onglets */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setError("");
              setMessage("");
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tableau de bord ===== */}
      {activeTab === "stats" && (
        <div>
          {statsLoading ? (
            <p className="text-gray-500">Chargement des statistiques...</p>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                  { label: "Utilisateurs", value: stats.totalUsers },
                  { label: "Billets vendus", value: stats.totalTickets },
                  { label: "Revenus", value: `${stats.totalRevenue} €` },
                  { label: "Conferences", value: stats.totalConferences },
                  { label: "Inscriptions", value: stats.totalRegistrations },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-semibold mb-4">
                Repartition par type de billet
              </h2>
              {stats.ticketsByType.length === 0 ? (
                <p className="text-gray-500">Aucun billet vendu</p>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Type</th>
                        <th className="text-right px-4 py-3 font-medium">Nombre</th>
                        <th className="text-right px-4 py-3 font-medium">Revenus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.ticketsByType.map((row) => (
                        <tr key={row.type} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            {TICKET_TYPE_LABELS[row.type] || row.type}
                          </td>
                          <td className="px-4 py-3 text-right">{row.count}</td>
                          <td className="px-4 py-3 text-right">{row.revenue} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Aucune donnee disponible</p>
          )}
        </div>
      )}

      {/* ===== Conferences ===== */}
      {activeTab === "conferences" && (
        <div>
          {/* Formulaire creation / modification */}
          <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier la conference" : "Nouvelle conference"}
            </h2>
            <form onSubmit={handleConferenceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="confTitle"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Titre
                  </label>
                  <input
                    id="confTitle"
                    type="text"
                    required
                    value={conferenceForm.title}
                    onChange={(e) =>
                      setConferenceForm({ ...conferenceForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Titre de la conference"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confLocation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Lieu
                  </label>
                  <input
                    id="confLocation"
                    type="text"
                    required
                    value={conferenceForm.location}
                    onChange={(e) =>
                      setConferenceForm({ ...conferenceForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Lieu"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date et heure
                  </label>
                  <input
                    id="confDate"
                    type="datetime-local"
                    required
                    value={conferenceForm.date}
                    onChange={(e) =>
                      setConferenceForm({ ...conferenceForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confCapacity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Capacite
                  </label>
                  <input
                    id="confCapacity"
                    type="number"
                    required
                    min="1"
                    value={conferenceForm.capacity}
                    onChange={(e) =>
                      setConferenceForm({ ...conferenceForm, capacity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Nombre de places"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confCategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categorie
                  </label>
                  <select
                    id="confCategory"
                    value={conferenceForm.category}
                    onChange={(e) =>
                      setConferenceForm({ ...conferenceForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="confDescription"
                  required
                  rows={3}
                  value={conferenceForm.description}
                  onChange={(e) =>
                    setConferenceForm({ ...conferenceForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Description (10 caracteres minimum)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={savingConference}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingConference
                    ? "Enregistrement..."
                    : editingId
                      ? "Modifier"
                      : "Creer"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Liste des conferences */}
          <h2 className="text-lg font-semibold mb-4">
            Toutes les conferences ({conferences.length})
          </h2>
          {conferencesLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : conferences.length === 0 ? (
            <p className="text-gray-500">Aucune conference</p>
          ) : (
            <div className="space-y-3">
              {conferences.map((conf) => (
                <div
                  key={conf.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{conf.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{conf.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                      <span>{formatDate(conf.date)}</span>
                      <span>{conf.location}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {conf.category}
                      </span>
                      <span>
                        {conf.registeredCount ?? 0} / {conf.capacity} inscrits
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditing(conf)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteConference(conf.id)}
                      disabled={deletingId === conf.id}
                      className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === conf.id ? "..." : "Supprimer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Billets ===== */}
      {activeTab === "tickets" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Tous les billets ({tickets.length})
          </h2>
          {ticketsLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500">Aucun billet</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Participant</th>
                    <th className="text-left px-4 py-3 font-medium">Acheteur</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Prix</th>
                    <th className="text-left px-4 py-3 font-medium">Date d&apos;achat</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <div>{ticket.name}</div>
                        <div className="text-gray-400 text-xs">{ticket.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{ticket.user.name}</div>
                        <div className="text-gray-400 text-xs">{ticket.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {TICKET_TYPE_LABELS[ticket.type] || ticket.type}
                      </td>
                      <td className="px-4 py-3 text-right">{ticket.price} €</td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== Utilisateurs ===== */}
      {activeTab === "users" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Tous les utilisateurs ({users.length})
          </h2>
          {usersLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">Aucun utilisateur</p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Nom</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-right px-4 py-3 font-medium">Billets</th>
                    <th className="text-right px-4 py-3 font-medium">Inscriptions</th>
                    <th className="text-left px-4 py-3 font-medium">Membre depuis</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            u.role === "ADMIN"
                              ? "bg-black text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{u._count.tickets}</td>
                      <td className="px-4 py-3 text-right">{u._count.planning}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
