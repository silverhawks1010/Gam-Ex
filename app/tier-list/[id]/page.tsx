"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { useParams } from "next/navigation";
import Image from "next/image";

// Types
interface TierList {
  id: string;
  name: string;
  type: string;
  is_public: boolean;
}
interface Column {
  id: string;
  label: string;
  color: string;
  position: number;
}
interface Item {
  id: string;
  column_id: string;
  game_id: number | null;
  franchise_id: number | null;
  position: number;
}
interface GameSummary { id: number; name: string; cover?: { url: string } }
interface FranchiseSummary { id: number; name: string; cover?: string | null }

export default function TierListViewPage() {
  const { id } = useParams<{ id: string }>();
  const [tierList, setTierList] = useState<TierList | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [games, setGames] = useState<Record<number, GameSummary>>({});
  const [franchises, setFranchises] = useState<Record<number, FranchiseSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/tierlists/${id}`).then(r => r.json()),
      fetch(`/api/tierlists/${id}/columns`).then(r => r.json()),
      fetch(`/api/tierlists/${id}/items`).then(r => r.json()),
    ]).then(async ([tierListData, columnsData, itemsData]) => {
      setTierList(tierListData);
      setColumns(columnsData.sort((a: Column, b: Column) => a.position - b.position));
      setItems(itemsData);
      // Récupère tous les game_ids et franchise_ids uniques
      const gameIds = itemsData.filter((i: Item) => i.game_id).map((i: Item) => i.game_id);
      const franchiseIds = itemsData.filter((i: Item) => i.franchise_id).map((i: Item) => i.franchise_id);
      // Fetch game details (à adapter selon ton API)
      const gamesMap: Record<number, GameSummary> = {};
      if (gameIds.length) {
        const res = await fetch(`/api/igdb/games?ids=${gameIds.join(",")}`);
        const data = await res.json();
        data.forEach((g: GameSummary) => { gamesMap[g.id] = g; });
      }
      setGames(gamesMap);
      // Fetch franchise details (à adapter selon ton API)
      const franchisesMap: Record<number, FranchiseSummary> = {};
      if (franchiseIds.length) {
        const res = await fetch(`/api/igdb/franchises?ids=${franchiseIds.join(",")}`);
        const data = await res.json();
        data.forEach((f: FranchiseSummary) => { franchisesMap[f.id] = f; });
      }
      setFranchises(franchisesMap);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!tierList) return <div>Tier list introuvable</div>;

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">{tierList.name}</h1>
        <div className="w-full flex flex-col gap-4 mb-10">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-row items-stretch gap-2 w-full bg-neutral-900/80 rounded-lg shadow-sm">
              <div className={`w-56 flex items-center justify-center rounded-l font-bold text-white ${column.color} select-none min-h-[72px]`}>
                <span className="text-[clamp(0.9rem,1vw,1.1rem)] text-secondary font-bold px-2 text-center break-words whitespace-pre-line w-full">{column.label}</span>
              </div>
              <div className="flex flex-row flex-1 flex-wrap gap-2 min-h-[72px] bg-transparent rounded-r px-4 py-2 items-center">
                {items
                  .filter(item => item.column_id === column.id)
                  .sort((a, b) => a.position - b.position)
                  .map(item => {
                    if (item.game_id && games[item.game_id]) {
                      const game = games[item.game_id];
                      return (
                        <div key={item.id} className="w-20 bg-muted rounded flex flex-col items-center">
                          {game.cover?.url ? (
                            <Image src={game.cover.url} alt={game.name} width={80} height={96} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted" style={{ height: 96 }}>
                              <span className="text-xs text-muted-foreground">?</span>
                            </div>
                          )}
                          <div className="text-xs font-bold text-center mt-1 truncate max-w-[80px]">{game.name}</div>
                        </div>
                      );
                    }
                    if (item.franchise_id && franchises[item.franchise_id]) {
                      const franchise = franchises[item.franchise_id];
                      return (
                        <div key={item.id} className="w-20 bg-muted rounded flex flex-col items-center">
                          {franchise.cover ? (
                            <Image src={franchise.cover} alt={franchise.name} width={80} height={96} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted" style={{ height: 96 }}>
                              <span className="text-xs text-muted-foreground">?</span>
                            </div>
                          )}
                          <div className="text-xs font-bold text-center mt-1 truncate max-w-[80px]">{franchise.name}</div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
