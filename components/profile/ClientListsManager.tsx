"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { listService } from '@/lib/services/listService';
import { ListsGrid } from "@/components/lists/ListsGrid";

interface GameListItem {
  id: string;
  game_id: string;
  cover_url?: string;
}

interface List {
  id: string;
  name: string;
  items?: GameListItem[];
  game_list_items?: GameListItem[];
}

interface ClientListsManagerProps {
  initialLists: List[];
  userId: string;
}

export function ClientListsManager({ initialLists }: ClientListsManagerProps) {
  const [lists, setLists] = useState<List[]>(initialLists);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const userLists = await listService.getUserLists();
        setLists(userLists);
      } catch {
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
    } catch {
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
      <ListsGrid lists={lists} isLoading={loadingLists} />
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