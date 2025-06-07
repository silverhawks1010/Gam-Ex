"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { listService } from '@/lib/services/listService';

interface ClientListsManagerProps {
  initialLists: any[];
  userId: string;
}

export function ClientListsManager({ initialLists, userId }: ClientListsManagerProps) {
  const [lists, setLists] = useState(initialLists);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const { toast } = useToast();
  // Pour stocker les covers IGDB chargées dynamiquement
  const [covers, setCovers] = useState<{ [gameId: string]: string }>({});

  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const userLists = await listService.getUserLists();
        setLists(userLists);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos listes",
          variant: "destructive"
        });
      } finally {
        setLoadingLists(false);
      }
    };
    fetchLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Batch fetch des covers IGDB manquantes
  useEffect(() => {
    // Récupérer tous les game_id sans cover_url à afficher (max 20 pour limiter la charge)
    const missingIds = new Set<string>();
    lists.forEach(list => {
      (list.items || list.game_list_items || []).slice(0, 10).forEach((item: any) => {
        if (!item.cover_url && item.game_id && !covers[item.game_id]) {
          missingIds.add(item.game_id);
        }
      });
    });
    if (missingIds.size === 0) return;
    const idsArr = Array.from(missingIds).slice(0, 20);
    const idsParam = idsArr.join(",");
    fetch(`/api/igdb/covers?ids=${idsParam}`)
      .then(res => res.json())
      .then((data: { [gameId: string]: string | null }) => {
        // Ne stocke que les covers valides (string)
        const validCovers: { [gameId: string]: string } = {};
        Object.entries(data).forEach(([gameId, url]) => {
          if (typeof url === 'string' && url) {
            validCovers[gameId] = url;
          }
        });
        setCovers(prev => ({ ...prev, ...validCovers }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la liste ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const newList = await listService.createList(newListName, isPublic);
      setLists(prev => [...prev, newList]);
      setShowCreateList(false);
      setNewListName("");
      setIsPublic(true);
      toast({
        title: "Succès",
        description: "Liste créée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la liste",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Toutes les listes</h2>
        <Button onClick={() => setShowCreateList(true)}>
          + Nouvelle liste
        </Button>
      </div>
      {loadingLists ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="grid gap-6">
          {lists.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Aucune liste disponible</p>
              </CardContent>
            </Card>
          ) : (
            lists.map((list: any) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{list.name}</CardTitle>
                    <Link 
                      href={`/lists/${list.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Voir la liste
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {(list.items || list.game_list_items || []).slice(0, 10).map((item: any) => {
                        const cover = item.cover_url || covers[item.game_id];
                        return (
                          <div
                            key={item.id}
                            className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted"
                          >
                            <div className="w-full h-full flex items-center justify-center text-xs text-center p-1">
                              {cover ? (
                                <img 
                                  src={cover} 
                                  alt={`Cover for game ${item.game_id}`} 
                                  width={64} 
                                  height={64}
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">?</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(list.items || list.game_list_items) && (list.items || list.game_list_items).length > 10 && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs">
                          +{(list.items || list.game_list_items).length - 10}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle liste</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la liste</Label>
              <Input
                id="name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Entrez le nom de la liste"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">Liste publique</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateList(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateList}
              disabled={isLoading || !newListName.trim()}
            >
              {isLoading ? 'Création...' : 'Créer la liste'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 