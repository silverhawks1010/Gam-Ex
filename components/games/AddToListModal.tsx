'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { listService } from '@/lib/services/listService';
import { GameListWithDetails } from '@/lib/types/lists';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BsPlus } from 'react-icons/bs';

interface AddToListModalProps {
  gameId: string;
  trigger?: React.ReactNode;
}

export function AddToListModal({ gameId, trigger }: AddToListModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [lists, setLists] = useState<GameListWithDetails[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadLists();
    }
  }, [isOpen, user]);

  const loadLists = async () => {
    try {
      const userLists = await listService.getUserLists();
      setLists(userLists);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger vos listes",
        variant: "destructive"
      });
    }
  };

  const handleAddToList = async () => {
    if (selectedLists.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une liste",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(
        selectedLists.map(listId => listService.addGameToList(listId, gameId))
      );
      
      toast({
        title: "Succès",
        description: "Jeu ajouté aux listes sélectionnées"
      });
      
      setIsOpen(false);
      setSelectedLists([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le jeu aux listes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <BsPlus className="w-4 h-4" />
            Ajouter à une liste
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter à une liste</DialogTitle>
          <DialogDescription>
            Sélectionnez les listes auxquelles vous souhaitez ajouter ce jeu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {lists.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore de liste. Créez-en une depuis la page des listes.
            </p>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <div key={list.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={list.id}
                    checked={selectedLists.includes(list.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLists([...selectedLists, list.id]);
                      } else {
                        setSelectedLists(selectedLists.filter(id => id !== list.id));
                      }
                    }}
                  />
                  <Label
                    htmlFor={list.id}
                    className="flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>{list.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {list.items.length} jeux
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleAddToList} disabled={isLoading || lists.length === 0}>
            {isLoading ? 'Ajout en cours...' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 