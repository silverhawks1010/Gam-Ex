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


export default function TierListHomePage() {
  const [step, setStep] = useState<"menu" | "form">("menu");
  const [type, setType] = useState<"games" | "franchises" | null>(null);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
                    status: isPublic ? "true" : "false",
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
                placeholder={type === "game" ? "Ex: Mes RPG préférés" : "Ex: Les meilleures sagas"}
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