'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BsPlus, BsSearch } from 'react-icons/bs';
import { listService } from '@/lib/services/listService';
import { Game } from '@/types/game';
import Image from 'next/image';

interface AddGameToListModalProps {
  listId: string;
  onGameAdded?: () => void;
}

// Fonction debounce personnalisée
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function AddGameToListModal({ listId, onGameAdded }: AddGameToListModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction de recherche avec debounce
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&page=1`);
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche');
        }
        const data = await response.json();
        setSearchResults(data.results.slice(0, 10)); // Limiter à 10 résultats
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleAddGame = async () => {
    if (!selectedGame) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un jeu",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await listService.addGameToList(listId, selectedGame.id.toString());
      
      toast({
        title: "Succès",
        description: "Jeu ajouté à la liste avec succès"
      });

      setIsOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedGame(null);
      onGameAdded?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le jeu à la liste",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setSearchQuery(game.name);
    setSearchResults([]);
  };

  const resetModal = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedGame(null);
  };

  const getCoverUrl = (game: Game) => {
    if (game.cover && typeof game.cover === 'object' && 'url' in game.cover) {
      return game.cover.url;
    }
    return null;
  };

  const getReleaseYear = (game: Game) => {
    if (game.first_release_date) {
      return new Date(game.first_release_date * 1000).getFullYear();
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetModal();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <BsPlus className="w-4 h-4" />
          Ajouter un jeu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un jeu à la liste</DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez le jeu que vous souhaitez ajouter à cette liste
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search">Rechercher un jeu</Label>
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tapez le nom du jeu..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {(searchResults.length > 0 || isSearching) && (
            <div className="space-y-2">
              <Label>Résultats de recherche</Label>
              <div className="max-h-80 overflow-y-auto border rounded-md">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Recherche en cours...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Aucun jeu trouvé
                  </div>
                ) : (
                  searchResults.map((game) => {
                    const coverUrl = getCoverUrl(game);
                    const releaseYear = getReleaseYear(game);
                    
                    return (
                      <div
                        key={game.id}
                        className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 ${
                          selectedGame?.id === game.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleGameSelect(game)}
                      >
                        <div className="flex-shrink-0">
                          {coverUrl ? (
                            <Image
                              src={coverUrl}
                              alt={game.name}
                              width={60}
                              height={80}
                              className="rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-[60px] h-[80px] bg-muted rounded-md flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">Pas d'image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{game.name}</h4>
                          {releaseYear && (
                            <p className="text-sm text-muted-foreground">
                              {releaseYear}
                            </p>
                          )}
                          {game.genres && game.genres.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              {game.genres.slice(0, 3).map(g => g.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Jeu sélectionné */}
          {selectedGame && (
            <div className="space-y-2">
              <Label>Jeu sélectionné</Label>
              <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                {getCoverUrl(selectedGame) ? (
                  <Image
                    src={getCoverUrl(selectedGame)!}
                    alt={selectedGame.name}
                    width={60}
                    height={80}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="w-[60px] h-[80px] bg-muted rounded-md flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Pas d'image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{selectedGame.name}</h4>
                  {getReleaseYear(selectedGame) && (
                    <p className="text-sm text-muted-foreground">
                      {getReleaseYear(selectedGame)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddGame}
            disabled={isLoading || !selectedGame}
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter à la liste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 