"use client";
import React, { useState, useRef, useEffect } from "react";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, rectIntersection, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { GameSummary } from "@/types/game";
import Image from "next/image";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import type { Game } from '@/types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

type FranchiseSummary = { id: number; name: string; cover: string | null };

function normalizeIGDBUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return "https:" + url;
  return url;
}

const DEFAULT_ROWS = [
  { label: "S", color: "bg-yellow-400", games: [] },
  { label: "A", color: "bg-green-400", games: [] },
  { label: "B", color: "bg-blue-400", games: [] },
  { label: "C", color: "bg-purple-400", games: [] },
  { label: "D", color: "bg-red-400", games: [] },
];

type TierRow = {
  label: string;
  color: string;
  games: GameSummary[];
};

type FranchiseTierRow = {
  label: string;
  color: string;
  games: FranchiseSummary[];
};

function omitDragAndAnimationProps<T extends object>(props: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in props) {
    if (!key.startsWith('onDrag') && !key.startsWith('onAnimation')) {
      result[key] = props[key];
    }
  }
  return result;
}

function GameCard({ game, onRemove, dragProps, isDragging }: { game: GameSummary; onRemove?: () => void; dragProps?: React.HTMLAttributes<HTMLDivElement>; isDragging?: boolean; showName?: boolean }) {
  const safeProps = dragProps ? omitDragAndAnimationProps(dragProps) : {};
  return (
    <div className={`relative ${isDragging ? "z-50" : "z-10"}`} {...safeProps}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-20 bg-muted rounded overflow-visible flex flex-col items-center cursor-pointer">
            <div className="w-full flex items-center justify-center" style={{height: 96}}>
              {game.cover && game.cover.url ? (
                <Image 
                  src={normalizeIGDBUrl(game.cover.url.replace("t_thumb", "t_cover_big"))}
                  alt={game.name} 
                  width={80} 
                  height={96} 
                  className="object-cover w-full h-full" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
              )}
            </div>
            {onRemove && (
              <button
                onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
                onPointerDown={e => e.stopPropagation()}
                className="absolute top-1 left-1 text-red-500 bg-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                tabIndex={0}
                aria-label="Supprimer"
              >
                ×
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{game.name}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function SortableGameCard({ game, id, onRemove, showName }: { game: GameSummary; id: string; onRemove?: () => void; showName?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { game } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <GameCard game={game} onRemove={onRemove} isDragging={isDragging} showName={showName} />
    </div>
  );
}

function SortableFranchiseCard({ franchise, id, showName, onRemove }: { franchise: FranchiseSummary; id: string; showName?: boolean; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { franchise } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex flex-col items-center cursor-pointer">
            {franchise.cover ? (
              <Image
                src={franchise.cover}
                alt={franchise.name}
                width={80}
                height={96}
                className="object-cover w-full h-full rounded"
              />
            ) : (
              <div className="w-20 h-24 flex items-center justify-center bg-muted rounded">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            )}
            {showName && (
              <div className="text-xs font-bold text-center mt-1 truncate max-w-[80px]">{franchise.name}</div>
            )}
            {onRemove && (
              <button
                onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove(); }}
                className="absolute top-1 left-1 text-red-500 bg-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                tabIndex={0}
                aria-label="Supprimer"
              >
                ×
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{franchise.name}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function DroppableContainer({ id, children, className = "", ref }: { id: string; children: React.ReactNode; className?: string; ref?: React.RefObject<HTMLDivElement> }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      id={id}
      className={`${className} ${isOver ? 'border-2 border-blue-500' : ''}`}
    >
      {children}
    </div>
  );
}

export default function TierListPage() {
  const [mainMode, setMainMode] = useState<'menu' | 'games' | 'franchises'>('menu');
  const [rows, setRows] = useState<TierRow[]>(DEFAULT_ROWS);
  const [franchiseRows, setFranchiseRows] = useState<FranchiseTierRow[]>(DEFAULT_ROWS);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newRowLabel, setNewRowLabel] = useState("");
  const [newRowColor, setNewRowColor] = useState("bg-gray-300");
  const [galleryGames, setGalleryGames] = useState<GameSummary[]>([]);
  const [franchises, setFranchises] = useState<FranchiseSummary[]>([]);
  const [activeGame, setActiveGame] = useState<GameSummary | null>(null);
  const [activeFranchise, setActiveFranchise] = useState<FranchiseSummary | null>(null);
  const [randomCount, setRandomCount] = useState(50);
  // Autocomplete states
  const [autocompleteInput, setAutocompleteInput] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<{ id: number; name: string }[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteTimeout = useRef<NodeJS.Timeout | null>(null);
  const [galleryPage, setGalleryPage] = useState(1);
  const galleryPageSize = 50;
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [tierListName, setTierListName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Batch fetch covers for galleryGames
  useEffect(() => {
    const missingIds = galleryGames.filter(g => !g.cover).map(g => g.id);
    if (missingIds.length === 0) return;
    const idsParam = missingIds.join(",");
    fetch(`/api/igdb/covers?ids=${idsParam}`)
      .then(res => res.json())
      .then((data: Record<string, string | null>) => {
        setGalleryGames(games => games.map(g =>
          data[g.id] && !g.cover ? { ...g, cover: { id: g.id, url: data[g.id] as string } } : g
        ));
      });
  }, [galleryGames]);

  // Charger automatiquement les franchises quand on passe en mode franchises
  useEffect(() => {
    if (mainMode === 'franchises') {
      fetch('/api/franchises/random-many?count=500')
        .then(res => res.json())
        .then(data => setFranchises(data.franchises || []));
    }
  }, [mainMode]);

  // Edition rang
  const handleEdit = (idx: number, label: string, color: string) => {
    setRows(rows => rows.map((row, i) => i === idx ? { ...row, label, color } : row));
    setEditingIndex(null);
  };
  // Suppression rang
  const handleDeleteRow = (idx: number) => {
    if (rows.length <= 1) return;
    setGalleryGames(galleryGames => [...galleryGames, ...rows[idx].games]);
    setRows(rows => rows.filter((_, i) => i !== idx));
  };
  // Ajout rang
  const handleAddRow = () => {
    if (!newRowLabel.trim()) return;
    setRows([...rows, { label: newRowLabel, color: newRowColor, games: [] }]);
    setNewRowLabel("");
    setNewRowColor("bg-gray-300");
  };

  // Drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getDroppableContainerId = (overId: string | undefined | null): string | null => {
    if (!overId) return null;
    if (overId.startsWith('row:') || overId === 'gallery:0') return overId;
    const el = document.getElementById(overId);
    if (!el) return null;
    let parent = el.parentElement;
    while (parent) {
      if (parent.dataset.droppable === 'true' && parent.id) return parent.id;
      parent = parent.parentElement;
    }
    return null;
  };

  const handleDragStart = (event: DragEndEvent) => {
    const { data } = event.active;
    if (data.current) {
      if (data.current.game) {
        setActiveGame(data.current.game);
      } else if (data.current.franchise) {
        setActiveFranchise(data.current.franchise);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveGame(null);
      setActiveFranchise(null);
      return;
    }

    let overId = over.id as string;
    overId = getDroppableContainerId(overId) || overId;
    if (!overId || (!overId.startsWith('row:') && overId !== 'gallery:0')) {
      setActiveGame(null);
      setActiveFranchise(null);
      return;
    }

    const [typeFrom, fromIdx, itemId] = String(active.id).split(":");
    if (!itemId) {
      setActiveGame(null);
      setActiveFranchise(null);
      return;
    }

    if (mainMode === 'franchises') {
      const [typeTo, toIdx] = overId.split(":");
      const toRowIdx = Number(toIdx);

      // Gestion des franchises
      if (typeFrom === "gallery" && typeTo === "gallery") {
        const oldIndex = franchises.findIndex(f => f.id === Number(itemId));
        const overFranchiseId = String(over.id).split(":")[2];
        const newIndex = franchises.findIndex(f => f.id === Number(overFranchiseId));
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setFranchises(f => arrayMove(f, oldIndex, newIndex));
        }
      } else if (typeTo === "gallery") {
        if (typeFrom === "row") {
          const fromRowIdx = Number(fromIdx);
          const franchise = franchiseRows[fromRowIdx]?.games.find(g => g.id === Number(itemId));
          if (franchise) {
            setFranchiseRows(rows => rows.map((row, i) =>
              i === fromRowIdx
                ? { ...row, games: row.games.filter(g => g.id !== Number(itemId)) }
                : row
            ));
            // Ajout à la galerie (toujours en fin, sans doublon)
            setFranchises(f => [...f.filter(ff => ff.id !== franchise.id), franchise]);
          }
        }
      } else if (typeTo === "row") {
        if (typeFrom === "gallery") {
          const franchise = franchises.find(f => f.id === Number(itemId));
          if (franchise) {
            setFranchises(f => f.filter(fm => fm.id !== franchise.id));
            setFranchiseRows(rows => rows.map((row, i) =>
              i === toRowIdx
                ? { ...row, games: [...row.games, franchise] }
                : row
            ));
          }
        } else if (typeFrom === "row") {
          const fromRowIdx = Number(fromIdx);
          if (fromRowIdx === toRowIdx) {
            const fromFranchises = franchiseRows[fromRowIdx].games;
            const oldIndex = fromFranchises.findIndex(f => f.id === Number(itemId));
            let newIndex = over.data?.current?.sortable?.index;
            if (typeof newIndex !== "number") newIndex = franchiseRows[toRowIdx].games.length - 1;
            setFranchiseRows(rows => rows.map((row, i) =>
              i === fromRowIdx
                ? { ...row, games: arrayMove(row.games, oldIndex, newIndex) }
                : row
            ));
          } else {
            const franchise = franchiseRows[fromRowIdx].games.find(f => f.id === Number(itemId));
            if (franchise) {
              setFranchiseRows(rows => rows.map((row, i) => {
                if (i === fromRowIdx) {
                  return { ...row, games: row.games.filter(f => f.id !== franchise.id) };
                } else if (i === toRowIdx) {
                  return { ...row, games: [...row.games, franchise] };
                }
                return row;
              }));
            }
          }
        }
      }
    } else {
      // Gestion des jeux (code existant)
      const [typeTo, toIdx] = overId.split(":");
      const toRowIdx = Number(toIdx);

      if (typeFrom === "gallery" && typeTo === "gallery") {
        const oldIndex = galleryGames.findIndex(g => g.id === Number(itemId));
        const overGameId = String(over.id).split(":")[2];
        const newIndex = galleryGames.findIndex(g => g.id === Number(overGameId));
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setGalleryGames(g => arrayMove(g, oldIndex, newIndex));
        }
      } else if (typeTo === "gallery") {
        if (typeFrom === "row") {
          const fromRowIdx = Number(fromIdx);
          setRows(rows => rows.map((row, i) =>
            i === fromRowIdx
              ? { ...row, games: row.games.filter(g => g.id !== Number(itemId)) }
              : row
          ));
          const game = rows[fromRowIdx]?.games.find(g => g.id === Number(itemId));
          if (game && !galleryGames.some(g => g.id === game.id)) {
            setGalleryGames(g => [...g, game]);
          }
        }
      } else if (typeTo === "row") {
        if (typeFrom === "gallery") {
          const game = galleryGames.find(g => g.id === Number(itemId));
          if (game) {
            setGalleryGames(g => g.filter(gm => gm.id !== game.id));
            setRows(rows => rows.map((row, i) =>
              i === toRowIdx
                ? { ...row, games: row.games.some(g => g.id === game.id) ? row.games : [...row.games, game] }
                : row
            ));
          }
        } else if (typeFrom === "row") {
          const fromRowIdx = Number(fromIdx);
          if (fromRowIdx === toRowIdx) {
            const fromGames = rows[fromRowIdx].games;
            const oldIndex = fromGames.findIndex(g => g.id === Number(itemId));
            let newIndex = over.data?.current?.sortable?.index;
            if (typeof newIndex !== "number") newIndex = rows[toRowIdx].games.length - 1;
            setRows(rows => rows.map((row, i) =>
              i === fromRowIdx
                ? { ...row, games: arrayMove(row.games, oldIndex, newIndex) }
                : row
            ));
          } else {
            const game = rows[fromRowIdx].games.find(g => g.id === Number(itemId));
            if (game) {
              setRows(rows => rows.map((row, i) => {
                if (i === fromRowIdx) {
                  return { ...row, games: row.games.filter(g => g.id !== game.id) };
                } else if (i === toRowIdx) {
                  return { ...row, games: row.games.some(g => g.id === game.id) ? row.games : [...row.games, game] };
                } else {
                  return row;
                }
              }));
            }
          }
        }
      }
    }

    setActiveGame(null);
    setActiveFranchise(null);
  };

  // Autocomplete handler
  const handleAutocompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAutocompleteInput(value);
    setShowAutocomplete(!!value);
    if (autocompleteTimeout.current) clearTimeout(autocompleteTimeout.current);
    if (!value.trim()) {
      setAutocompleteResults([]);
      return;
    }
    setAutocompleteLoading(true);
    autocompleteTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(value)}`);
        const data: { id: number; name: string }[] = await res.json();
        setAutocompleteResults(data);
      } catch {
        setAutocompleteResults([]);
      } finally {
        setAutocompleteLoading(false);
      }
    }, 300);
  };

  const handleSelectGame = async (game: { id: number; name: string }) => {
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(game.name)}`);
      const data: { id: number; name: string }[] = await res.json();
      const found = data.find((g) => g.id === game.id);
      if (found && !galleryGames.some(g => g.id === found.id)) {
        setGalleryGames(galleryGames => [...galleryGames, { id: found.id, name: found.name, cover: undefined }]);
      }
    } catch {}
    setAutocompleteInput("");
    setAutocompleteResults([]);
    setShowAutocomplete(false);
  };

  // Générer des jeux connus aléatoires
  const handleGenerateRandom = async () => {
    try {
      const res = await fetch(`/api/games/random-many?count=${randomCount}`);
      const data: { count: number; total: number; games: Game[] } = await res.json();
      setGalleryGames(
        data.games.map((g) => ({
          id: g.id,
          name: g.name,
          cover: g.cover
            ? typeof g.cover === "string"
              ? { id: g.id, url: g.cover }
              : g.cover
            : undefined,
        }))
      );
      setGalleryPage(1);
    } catch {}
  };

  // Suppression d'un jeu d'un rang
  const handleRemoveGameFromRow = (rowIdx: number, gameId: number) => {
    setRows(rows => rows.map((row, i) =>
      i === rowIdx ? { ...row, games: row.games.filter(g => g.id !== gameId) } : row
    ));
    const game = rows[rowIdx].games.find(g => g.id === gameId);
    if (game) setGalleryGames(g => [...g, game]);
  };

  // Suppression d'un jeu de la galerie
  const handleRemoveGameFromGallery = (gameId: number) => {
    setGalleryGames(g => g.filter(gm => gm.id !== gameId));
  };

  const totalFranchisePages = Math.ceil(franchises.length / galleryPageSize);
  const paginatedFranchises = franchises.slice(
    (galleryPage - 1) * galleryPageSize,
    galleryPage * galleryPageSize
  );

  const totalPages = Math.ceil(galleryGames.length / galleryPageSize);
  const paginatedGalleryGames = galleryGames.slice(
    (galleryPage - 1) * galleryPageSize,
    galleryPage * galleryPageSize
  );

  async function handleSaveTierList() {
    setIsSaving(true);
    try {
      // 1. Créer la tier list
      const res = await fetch('/api/tierlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tierListName, is_public: isPublic, type: 'games' }),
      });
      if (!res.ok) throw new Error('Erreur création tier list');
      const tierList = await res.json();

      // 2. Créer les colonnes
      const columnPromises = rows.map((row, idx) =>
        fetch(`/api/tierlists/${tierList.id}/columns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: row.label, color: row.color, position: idx }),
        })
      );
      const columnResponses = await Promise.all(columnPromises);
      const columnData = await Promise.all(columnResponses.map(r => r.json()));

      // 3. Créer les items
      const itemPromises = rows.flatMap((row, rowIdx) =>
        row.games.map((game, gameIdx) =>
          fetch(`/api/tierlists/${tierList.id}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              column_id: columnData[rowIdx].id,
              item_id: game.id,
              game_id: game.id,
              position: gameIdx,
            }),
          })
        )
      );
      await Promise.all(itemPromises);

      toast({ title: 'Succès', description: 'Tier list sauvegardée !' });
      setSaveDialogOpen(false);
      // Redirige ou autre action si besoin
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveFranchiseTierList() {
    setIsSaving(true);
    try {
      // 1. Créer la tier list
      const res = await fetch('/api/tierlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tierListName, is_public: isPublic, type: 'franchises' }),
      });
      if (!res.ok) throw new Error('Erreur création tier list');
      const tierList = await res.json();

      // 2. Créer les colonnes
      const columnPromises = franchiseRows.map((row, idx) =>
        fetch(`/api/tierlists/${tierList.id}/columns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: row.label, color: row.color, position: idx }),
        })
      );
      const columnResponses = await Promise.all(columnPromises);
      const columnData = await Promise.all(columnResponses.map(r => r.json()));

      // 3. Créer les items (franchises)
      const itemPromises = franchiseRows.flatMap((row, rowIdx) =>
        row.games.map((franchise, franchiseIdx) =>
          fetch(`/api/tierlists/${tierList.id}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              column_id: columnData[rowIdx].id,
              item_id: franchise.id,
              franchise_id: franchise.id,
              position: franchiseIdx,
            }),
          })
        )
      );
      await Promise.all(itemPromises);

      toast({ title: 'Succès', description: 'Tier list franchises sauvegardée !' });
      setSaveDialogOpen(false);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  if (mainMode === 'menu') {
    return (
      <div>
        <Navbar />
        <main className="max-w-2xl mx-auto py-20 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-10 text-center">Tier List</h1>
          <div className="flex flex-col gap-6 w-full">
            <Button className="w-full py-6 text-xl" onClick={() => setMainMode('games')}>
              Tier List Jeux Vidéo
            </Button>
            <Button className="w-full py-6 text-xl" onClick={() => setMainMode('franchises')}>
              Tier List Franchises
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (mainMode === 'games') {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Tier List Jeux Vidéo</h1>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setSaveDialogOpen(true)}>Sauvegarder la tier list</Button>
          </div>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sauvegarder la tier list</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={tierListName}
                    onChange={e => setTierListName(e.target.value)}
                    placeholder="Nom de la tier list"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Rendre publique</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveTierList} disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Modern Add Row Form */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              <Input
                className="w-32 rounded-lg shadow-sm"
                placeholder="Nom de la ligne"
                value={newRowLabel}
                onChange={e => setNewRowLabel(e.target.value)}
                maxLength={40}
              />
              <Select value={newRowColor} onValueChange={setNewRowColor}>
                <SelectTrigger className="w-32 rounded-lg shadow-sm">
                  <SelectValue placeholder="Couleur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-yellow-400">Jaune</SelectItem>
                  <SelectItem value="bg-green-400">Vert</SelectItem>
                  <SelectItem value="bg-blue-400">Bleu</SelectItem>
                  <SelectItem value="bg-purple-400">Violet</SelectItem>
                  <SelectItem value="bg-red-400">Rouge</SelectItem>
                  <SelectItem value="bg-gray-300">Gris</SelectItem>
                  <SelectItem value="bg-pink-400">Rose</SelectItem>
                  <SelectItem value="bg-orange-400">Orange</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="default" className="rounded-lg shadow-sm" onClick={handleAddRow}>+ Ajouter</Button>
            </div>
            {/* Ajout de jeux modernisé */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Rechercher un jeu..."
                  value={autocompleteInput}
                  onChange={handleAutocompleteChange}
                  onFocus={() => setShowAutocomplete(!!autocompleteInput)}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                  className="w-full rounded-lg shadow-sm"
                />
                {showAutocomplete && (
                  <div className="absolute z-10 left-0 right-0 bg-popover border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {autocompleteLoading ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">Recherche...</div>
                    ) : autocompleteResults.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">Aucun résultat</div>
                    ) : (
                      autocompleteResults.map(game => (
                        <div
                          key={game.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm rounded"
                          onMouseDown={() => handleSelectGame(game)}
                        >
                          {game.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={randomCount.toString()} onValueChange={(v) => setRandomCount(Number(v))}>
                  <SelectTrigger className="w-[120px] rounded-lg shadow-sm">
                    <SelectValue placeholder="Nombre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleGenerateRandom} className="rounded-lg shadow-sm whitespace-nowrap">
                  Générer {randomCount} jeux
                </Button>
              </div>
            </div>
          </div>
          {/* Liste des lignes (tiers) */}
          <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="w-full flex flex-col gap-4 mb-10">
              {rows.map((row, idx) => (
                <div key={idx} className="flex flex-row items-stretch gap-2 w-full bg-neutral-900/80 rounded-lg shadow-sm">
                  <div className={`w-56 flex items-center justify-center rounded-l font-bold text-white ${row.color} select-none min-h-[72px]`}>
                    {editingIndex === idx ? (
                      <Input
                        className="w-44 mr-2 rounded-lg shadow-sm px-3 py-2"
                        value={row.label}
                        onChange={e => setRows(rows => rows.map((r, i) => i === idx ? { ...r, label: e.target.value } : r))}
                        maxLength={40}
                      />
                    ) : (
                      <span className="text-[clamp(0.9rem,1vw,1.1rem)] text-secondary font-bold px-2 text-center break-words whitespace-pre-line w-full">{row.label}</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <SortableContext items={row.games.map(g => `row:${idx}:${g.id}`)} strategy={horizontalListSortingStrategy}>
                      <DroppableContainer id={`row:${idx}`} className="flex flex-row flex-wrap gap-2 min-h-[72px] bg-transparent rounded-r px-4 py-2 items-center">
                        {row.games.map(game => (
                          <SortableGameCard key={game.id} game={game} id={`row:${idx}:${game.id}`} onRemove={() => handleRemoveGameFromRow(idx, game.id)} showName={false} />
                        ))}
                      </DroppableContainer>
                    </SortableContext>
                  </div>
                  <div className="flex flex-col gap-1 ml-2 items-end justify-center pr-2">
                    <div className="flex gap-1 mb-1">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => idx > 0 && setRows(rows => { const newRows = [...rows]; [newRows[idx-1], newRows[idx]] = [newRows[idx], newRows[idx-1]]; return newRows; })} disabled={idx === 0} aria-label="Monter">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => setEditingIndex(idx)}>
                          <span className="sr-only">Éditer</span>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.071-6.071a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0v3.586a1 1 0 001 1h3.586"></path></svg>
                        </Button>
                    </div>
                    {editingIndex === idx ? (
                      <>
                        <Select value={row.color} onValueChange={(value) => setRows(rows => rows.map((r, i) => i === idx ? { ...r, color: value } : r))}>
                          <SelectTrigger className="w-20 mb-1 rounded-lg shadow-sm">
                            <SelectValue placeholder="Couleur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bg-yellow-400">Jaune</SelectItem>
                            <SelectItem value="bg-green-400">Vert</SelectItem>
                            <SelectItem value="bg-blue-400">Bleu</SelectItem>
                            <SelectItem value="bg-purple-400">Violet</SelectItem>
                            <SelectItem value="bg-red-400">Rouge</SelectItem>
                            <SelectItem value="bg-gray-300">Gris</SelectItem>
                            <SelectItem value="bg-pink-400">Rose</SelectItem>
                            <SelectItem value="bg-orange-400">Orange</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button variant="default" size="sm" className="rounded-full" onClick={() => handleEdit(idx, row.label, row.color)}>
                            <span className="sr-only">Valider</span>✔️
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditingIndex(null)}>
                            <span className="sr-only">Annuler</span>✖️
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => idx < rows.length-1 && setRows(rows => { const newRows = [...rows]; [newRows[idx+1], newRows[idx]] = [newRows[idx], newRows[idx+1]]; return newRows; })} disabled={idx === rows.length-1} aria-label="Descendre">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
                    </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-100 text-red-600" onClick={() => handleDeleteRow(idx)}>
                        <span className="sr-only">Supprimer</span>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                      </Button>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Galerie de jeux non classés modernisée */}
            <div className="mb-8">
              <h2 className="font-semibold mb-2">Galerie de jeux</h2>
              <SortableContext items={paginatedGalleryGames.map(g => `gallery:0:${g.id}`)} strategy={horizontalListSortingStrategy}>
                <DroppableContainer 
                  id="gallery:0" 
                  className="bg-neutral-900/60 rounded-lg shadow-sm p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-10 gap-4"
                >
                  {paginatedGalleryGames.map(game => (
                    <SortableGameCard 
                      key={game.id} 
                      game={game} 
                      id={`gallery:0:${game.id}`} 
                      onRemove={() => handleRemoveGameFromGallery(game.id)} 
                      showName={true} 
                    />
                  ))}
                </DroppableContainer>
              </SortableContext>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                    disabled={galleryPage === 1}
                    className="rounded"
                  >
                    Précédent
                  </Button>
                  <span>
                    Page {galleryPage} / {totalPages}
                  </span>
                  <Button
                    onClick={() => setGalleryPage(p => Math.min(totalPages, p + 1))}
                    disabled={galleryPage === totalPages}
                    className="rounded"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
            <DragOverlay>
              {activeGame && <GameCard game={activeGame} />}
            </DragOverlay>
          </DndContext>
        </main>
        <Footer />
      </div>
    );
  }

  if (mainMode === 'franchises') {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Tier List Franchises</h1>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setSaveDialogOpen(true)}>Sauvegarder la tier list</Button>
          </div>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sauvegarder la tier list</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={tierListName}
                    onChange={e => setTierListName(e.target.value)}
                    placeholder="Nom de la tier list"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public">Rendre publique</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveFranchiseTierList} disabled={isSaving}>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Modern Add Row Form */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-row gap-2 w-full sm:w-auto">
              <Input
                className="w-32 rounded-lg shadow-sm"
                placeholder="Nom de la ligne"
                value={newRowLabel}
                onChange={e => setNewRowLabel(e.target.value)}
                maxLength={40}
              />
              <Select value={newRowColor} onValueChange={setNewRowColor}>
                <SelectTrigger className="w-32 rounded-lg shadow-sm">
                  <SelectValue placeholder="Couleur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-yellow-400">Jaune</SelectItem>
                  <SelectItem value="bg-green-400">Vert</SelectItem>
                  <SelectItem value="bg-blue-400">Bleu</SelectItem>
                  <SelectItem value="bg-purple-400">Violet</SelectItem>
                  <SelectItem value="bg-red-400">Rouge</SelectItem>
                  <SelectItem value="bg-gray-300">Gris</SelectItem>
                  <SelectItem value="bg-pink-400">Rose</SelectItem>
                  <SelectItem value="bg-orange-400">Orange</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="default" className="rounded-lg shadow-sm" onClick={handleAddRow}>+ Ajouter</Button>
            </div>
          </div>
          {/* Liste des lignes (tiers) */}
          <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="w-full flex flex-col gap-4 mb-10">
              {franchiseRows.map((row, idx) => (
                <div key={idx} className="flex flex-row items-stretch gap-2 w-full bg-neutral-900/80 rounded-lg shadow-sm">
                  <div className={`w-56 flex items-center justify-center rounded-l font-bold text-white ${row.color} select-none min-h-[72px]`}>
                    {editingIndex === idx ? (
                      <Input
                        className="w-44 mr-2 rounded-lg shadow-sm px-3 py-2"
                        value={row.label}
                        onChange={e => setFranchiseRows(rows => rows.map((r, i) => i === idx ? { ...r, label: e.target.value } : r))}
                        maxLength={40}
                      />
                    ) : (
                      <span className="text-[clamp(0.9rem,1vw,1.1rem)] text-secondary font-bold px-2 text-center break-words whitespace-pre-line w-full">{row.label}</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <SortableContext items={row.games.map(g => `row:${idx}:${g.id}`)} strategy={horizontalListSortingStrategy}>
                      <DroppableContainer id={`row:${idx}`} className="flex flex-row flex-wrap gap-2 min-h-[72px] bg-transparent rounded-r px-4 py-2 items-center">
                        {row.games.map(franchise => (
                          <SortableFranchiseCard 
                            key={franchise.id} 
                            franchise={franchise} 
                            id={`row:${idx}:${franchise.id}`} 
                            showName={false} 
                            onRemove={() => {
                              setFranchiseRows(rows => rows.map((r, i) =>
                                i === idx ? { ...r, games: r.games.filter(g => g.id !== franchise.id) } : r
                              ));
                              setFranchises(f => [...f.filter(ff => ff.id !== franchise.id), franchise]);
                            }}
                          />
                        ))}
                      </DroppableContainer>
                    </SortableContext>
                  </div>
                  <div className="flex flex-col gap-1 ml-2 items-end justify-center pr-2">
                    <div className="flex gap-1 mb-1">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => idx > 0 && setFranchiseRows(rows => { const newRows = [...rows]; [newRows[idx-1], newRows[idx]] = [newRows[idx], newRows[idx-1]]; return newRows; })} disabled={idx === 0} aria-label="Monter">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => setEditingIndex(idx)}>
                          <span className="sr-only">Éditer</span>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.071-6.071a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0v3.586a1 1 0 001 1h3.586"></path></svg>
                        </Button>
                    </div>
                    {editingIndex === idx ? (
                      <>
                        <Select value={row.color} onValueChange={(value) => setFranchiseRows(rows => rows.map((r, i) => i === idx ? { ...r, color: value } : r))}>
                          <SelectTrigger className="w-20 mb-1 rounded-lg shadow-sm">
                            <SelectValue placeholder="Couleur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bg-yellow-400">Jaune</SelectItem>
                            <SelectItem value="bg-green-400">Vert</SelectItem>
                            <SelectItem value="bg-blue-400">Bleu</SelectItem>
                            <SelectItem value="bg-purple-400">Violet</SelectItem>
                            <SelectItem value="bg-red-400">Rouge</SelectItem>
                            <SelectItem value="bg-gray-300">Gris</SelectItem>
                            <SelectItem value="bg-pink-400">Rose</SelectItem>
                            <SelectItem value="bg-orange-400">Orange</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button variant="default" size="sm" className="rounded-full" onClick={() => handleEdit(idx, row.label, row.color)}>
                            <span className="sr-only">Valider</span>✔️
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditingIndex(null)}>
                            <span className="sr-only">Annuler</span>✖️
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent" onClick={() => idx < franchiseRows.length-1 && setFranchiseRows(rows => { const newRows = [...rows]; [newRows[idx+1], newRows[idx]] = [newRows[idx], newRows[idx+1]]; return newRows; })} disabled={idx === franchiseRows.length-1} aria-label="Descendre">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg>
                    </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-100 text-red-600" onClick={() => setFranchiseRows(rows => rows.filter((_, i) => i !== idx))}>
                        <span className="sr-only">Supprimer</span>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                      </Button>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Galerie de franchises */}
            <div className="mb-8">
              <h2 className="font-semibold mb-2">Galerie de franchises</h2>
              <SortableContext items={paginatedFranchises.map(f => `gallery:0:${f.id}`)} strategy={horizontalListSortingStrategy}>
                <DroppableContainer 
                  id="gallery:0" 
                  className="bg-neutral-900/60 rounded-lg shadow-sm p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-10 gap-4"
                >
                  {paginatedFranchises.map(franchise => (
                    <SortableFranchiseCard
                      key={franchise.id}
                      franchise={franchise}
                      id={`gallery:0:${franchise.id}`}
                      showName={true}
                    />
                  ))}
                </DroppableContainer>
              </SortableContext>
              {/* Pagination */}
              {totalFranchisePages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                    disabled={galleryPage === 1}
                    className="rounded"
                  >
                    Précédent
                  </Button>
                  <span>
                    Page {galleryPage} / {totalFranchisePages}
                  </span>
                  <Button
                    onClick={() => setGalleryPage(p => Math.min(totalFranchisePages, p + 1))}
                    disabled={galleryPage === totalFranchisePages}
                    className="rounded"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
            <DragOverlay>
              {activeFranchise && (
                <div className="flex flex-col items-center cursor-pointer">
                  {activeFranchise.cover ? (
                    <Image
                      src={activeFranchise.cover}
                      alt={activeFranchise.name}
                      width={80}
                      height={96}
                      className="object-cover w-full h-full rounded"
                    />
                  ) : (
                    <div className="w-20 h-24 flex items-center justify-center bg-muted rounded">
                      <span className="text-xs text-muted-foreground">?</span>
                    </div>
                  )}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
        <Footer />
      </div>
    );
  }
}