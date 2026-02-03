"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse, Conference } from "@/types";

const CATEGORIES = [
  "Tous",
  "Culture",
  "Ecologie",
  "Musique",
  "Cinema",
  "Litterature",
  "Societe",
  "Art",
  "Technologie",
];

export default function ConferencesPage() {
  const { user } = useAuth();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchConferences = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "Tous") {
        params.set("category", selectedCategory);
      }
      if (selectedDate) {
        params.set("date", selectedDate);
      }

      const query = params.toString();
      const url = `/api/conferences${query ? `?${query}` : ""}`;
      const res = await fetch(url);
      const data: ApiResponse<Conference[]> = await res.json();
      if (data.success && data.data) {
        setConferences(data.data);
      }
    } catch {
      setError("Erreur lors du chargement des conferences");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDate]);

  // useEffect exécute du code après le rendu, pour des actions 
  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  async function addToPlanning(conferenceId: string) {
    setAddingId(conferenceId);
    setMessage("");

    try {
      const res = await fetch("/api/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId }),
      });

      const data: ApiResponse = await res.json();

      if (res.status === 403) {
        setMessage("Vous devez acheter un billet avant d'ajouter au planning");
        return;
      }

      if (res.status === 409) {
        setMessage("Cette conference est deja dans votre planning");
        return;
      }

      if (!data.success) {
        setMessage(data.error || "Erreur lors de l'ajout");
        return;
      }

      setMessage("Conference ajoutee au planning");
    } catch {
      setMessage("Erreur de connexion au serveur");
    } finally {
      setAddingId(null);
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

  function resetFilters() {
    setSelectedCategory("Tous");
    setSelectedDate("");
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Conferences</h1>

      {/* Filtres */}
      <div className="border border-gray-200 rounded-lg p-4 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Filtres
          </h2>
          {(selectedCategory !== "Tous" || selectedDate) && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-black underline"
            >
              Reinitialiser
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Categorie
          </label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  selectedCategory === cat
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="filterDate"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Date
          </label>
          <input
            id="filterDate"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {message && (
        <div
          className={`px-4 py-3 rounded mb-6 ${
            message.includes("ajoutee")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-yellow-50 border border-yellow-200 text-yellow-700"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : conferences.length === 0 ? (
        <p className="text-gray-500">
          Aucune conference
          {selectedCategory !== "Tous" || selectedDate
            ? " pour ces filtres."
            : " pour le moment."}
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {conferences.length} conference{conferences.length > 1 ? "s" : ""}{" "}
            trouvee{conferences.length > 1 ? "s" : ""}
          </p>
          {conferences.map((conf) => (
            <div
              key={conf.id}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{conf.title}</h2>
                  <p className="text-gray-500 mt-1">{conf.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600 flex-wrap">
                    <span>{formatDate(conf.date)}</span>
                    <span>{conf.location}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {conf.category}
                    </span>
                    <span>{conf.capacity} places</span>
                  </div>
                </div>
                {user && (
                  <button
                    onClick={() => addToPlanning(conf.id)}
                    disabled={addingId === conf.id}
                    className="ml-4 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingId === conf.id ? "Ajout..." : "Ajouter au planning"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
