'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { BsPlus, BsStar } from 'react-icons/bs';
import { listService } from '@/lib/services/listService';
import { Game } from '@/types/game';
import Image from 'next/image';

interface GameRecommendationsProps {
  listId: string;
  canEdit: boolean;
  onGameAdded?: () => void;
}

interface RecommendedGame extends Game {
  recommendationScore: number;
}

export function GameRecommendations({ listId, canEdit, onGameAdded }: GameRecommendationsProps) {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingGameId, setAddingGameId] = useState<number | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [listId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/recommendations`);
      if (response.ok) {
        const data = await response.json();
        console.log('Données de recommandations reçues:', data);
        setRecommendations(data.recommendations || []);
      } else {
        console.error('Erreur lors du chargement des recommandations:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGame = async (game: RecommendedGame) => {
    if (!canEdit) return;

    setAddingGameId(game.id);
    try {
      await listService.addGameToList(listId, game.id.toString());
      
      toast({
        title: "Succès",
        description: `${game.name} ajouté à la liste`
      });

      // Retirer le jeu des recommandations puisqu'il est maintenant dans la liste
      setRecommendations(prev => prev.filter(rec => rec.id !== game.id));
      onGameAdded?.();
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le jeu à la liste",
        variant: "destructive"
      });
    } finally {
      setAddingGameId(null);
    }
  };

  const getCoverUrl = (game: RecommendedGame) => {
    if (game.cover && typeof game.cover === 'object' && 'url' in game.cover) {
      return game.cover.url;
    }
    return null;
  };

  const getReleaseYear = (game: RecommendedGame) => {
    if (game.first_release_date) {
      return new Date(game.first_release_date * 1000).getFullYear();
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BsStar className="w-5 h-5" />
            Recommandations
          </CardTitle>
          <CardDescription>
            Suggestions basées sur les jeux de votre liste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Chargement des recommandations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BsStar className="w-5 h-5" />
            Recommandations
          </CardTitle>
          <CardDescription>
            Suggestions basées sur les jeux de votre liste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-muted-foreground text-center">
              Aucune recommandation disponible pour le moment.
            </p>
            <div className="text-sm text-muted-foreground text-center space-y-1">
              <p>• Ajoutez plus de jeux à votre liste</p>
              <p>• Les recommandations sont basées sur les jeux similaires dans la base IGDB</p>
              <p>• Certains jeux peuvent ne pas avoir de jeux similaires référencés</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadRecommendations}
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BsStar className="w-5 h-5" />
          Recommandations
        </CardTitle>
        <CardDescription>
          Jeux similaires suggérés basés sur votre liste
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {recommendations.map((game) => {
            const coverUrl = getCoverUrl(game);
            const releaseYear = getReleaseYear(game);
            
            return (
              <div key={game.id} className="group relative">
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg border bg-muted">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs text-muted-foreground text-center p-2">
                        {game.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Score de recommandation */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                    {game.recommendationScore} similaire{game.recommendationScore > 1 ? 's' : ''}
                  </div>
                  
                  {/* Bouton d'ajout */}
                  {canEdit && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        onClick={() => handleAddGame(game)}
                        disabled={addingGameId === game.id}
                        className="bg-primary text-primary-foreground"
                      >
                        {addingGameId === game.id ? (
                          'Ajout...'
                        ) : (
                          <>
                            <BsPlus className="w-4 h-4 mr-1" />
                            Ajouter
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  <h4 className="font-medium text-sm truncate" title={game.name}>
                    {game.name}
                  </h4>
                  {releaseYear && (
                    <p className="text-xs text-muted-foreground">
                      {releaseYear}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 