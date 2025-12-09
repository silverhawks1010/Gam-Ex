"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface TierList {
  id: string;
  name: string;
  type: "games" | "franchises";
  is_public: boolean;
  created_at: string;
  user_id: string;
}

export default function TierListHomePage() {
  const [step, setStep] = useState<"list" | "menu" | "form">("list");
  const [type, setType] = useState<"games" | "franchises" | null>(null);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierLists, setTierLists] = useState<TierList[]>([]);
  const router = useRouter();

  // Charger les tier lists au montage du composant
  React.useEffect(() => {
    const fetchTierLists = async () => {
      try {
        const res = await fetch("/api/tierlists");
        if (!res.ok) throw new Error("Erreur lors de la récupération des tier lists");
        const data = await res.json();
        setTierLists(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    };
    fetchTierLists();
  }, []);

  // Affichage de la liste des tier lists
  if (step === "list") {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Mes Tier Lists</h1>
            <Button onClick={() => setStep("menu")}>Créer une nouvelle tier list</Button>
          </div>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tierLists.map((tierList) => (
              <Card key={tierList.id} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{tierList.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Type: {tierList.type === "games" ? "Jeux" : "Franchises"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {tierList.is_public ? "Publique" : "Privée"}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/tier-list/${tierList.id}`)}
                  >
                    Voir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          {tierLists.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore de tier list</p>
              <Button onClick={() => setStep("menu")}>Créer votre première tier list</Button>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // Affichage du menu de choix
  if (step === "menu") {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-12 px-4 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8 text-center">Créer une Tier List</h1>
          <div className="flex flex-col gap-6 w-full max-w-md">
            <Button size="lg" className="w-full" onClick={() => { setType("games"); setStep("form"); }}>
              Classer les Jeux Vidéo
            </Button>
            <Button size="lg" className="w-full" onClick={() => { setType("franchises"); setStep("form"); }}>
              Classer les Franchises
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setStep("list")}>
              Retour à mes tier lists
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Affichage du formulaire de création
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-12 px-4 flex flex-col items-center">
        <Card className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Nouvelle Tier List</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                const res = await fetch("/api/tierlists", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    type,
                    is_public: isPublic,
                  }),
                });
                if (!res.ok) throw new Error("Erreur lors de la création de la tier list");
                const data = await res.json();
                if (!data.id) throw new Error("Réponse inattendue de l'API");
                // Création des colonnes par défaut
                const defaultColumns = [
                  { label: "S", color: "bg-purple-700", position: 0 },
                  { label: "A", color: "bg-green-700", position: 1 },
                  { label: "B", color: "bg-blue-700", position: 2 },
                  { label: "C", color: "bg-yellow-700", position: 3 },
                  { label: "D", color: "bg-red-700", position: 4 },
                ];
                await Promise.all(
                  defaultColumns.map(col =>
                    fetch(`/api/tierlists/${data.id}/columns`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(col),
                    })
                  )
                );
                router.push(`/tier-list/${data.id}`);
              } catch (err: any) {
                setError(err.message || "Erreur inconnue");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="name">Nom de la tier list</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={60}
                className="mt-1"
                placeholder={type === "games" ? "Ex: Mes RPG préférés" : "Ex: Les meilleures sagas"}
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <div className="flex items-center gap-3 mt-1">
                <Switch
                  id="status"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <span>{isPublic ? "Publique" : "Privée"}</span>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep("menu")}>Retour</Button>
              <Button type="submit" className="flex-1" disabled={loading || !name.trim()}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
}