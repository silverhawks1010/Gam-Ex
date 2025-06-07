import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/lib/services/gameService';
import { createServerClient } from '@/lib/supabase/server';
import { Game } from '@/types/game';

interface GameFrequency {
  game: Game;
  frequency: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listId = params.id;
    const supabase = createServerClient();

    // Récupérer la liste et ses items (relation game_list_items)
    const { data: list, error } = await supabase
      .from('game_lists')
      .select('id, items:game_list_items(game_id)')
      .eq('id', listId)
      .single();

    if (error || !list) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 });
    }

    // Récupérer les détails complets de tous les jeux de la liste
    const gameDetails = await Promise.all(
      (list.items || []).map(async (item: { game_id: string }) => {
        try {
          return await gameService.getGameDetails(Number(item.game_id));
        } catch (error) {
          console.error(`Erreur lors du chargement du jeu ${item.game_id}:`, error);
          return null;
        }
      })
    );

    const validGames = gameDetails.filter((game): game is Game => game !== null);

    // Extraire tous les jeux similaires et compter leur fréquence
    const similarGamesMap = new Map<number, GameFrequency>();
    const currentGameIds = new Set(validGames.map(game => game.id));

    let totalSimilarGames = 0;

    validGames.forEach(game => {
      console.log(`Analyse du jeu: ${game.name} (ID: ${game.id})`);
      if (game.similar_games && game.similar_games.length > 0) {
        console.log(`  - ${game.similar_games.length} jeux similaires trouvés`);
        game.similar_games.forEach(similarGame => {
          totalSimilarGames++;
          // Exclure les jeux déjà dans la liste
          if (!currentGameIds.has(similarGame.id)) {
            if (similarGamesMap.has(similarGame.id)) {
              const existing = similarGamesMap.get(similarGame.id)!;
              existing.frequency += 1;
              console.log(`  - Jeu similaire ${similarGame.name} déjà trouvé, fréquence: ${existing.frequency}`);
            } else {
              // Créer un objet Game complet à partir du GameSummary
              const fullGame: Game = {
                id: similarGame.id,
                name: similarGame.name,
                slug: similarGame.slug || `game-${similarGame.id}`,
                summary: similarGame.summary,
                first_release_date: similarGame.first_release_date,
                cover: similarGame.cover,
                category: similarGame.category
              };
              
              similarGamesMap.set(similarGame.id, {
                game: fullGame,
                frequency: 1
              });
              console.log(`  - Nouveau jeu similaire ajouté: ${similarGame.name}`);
            }
          } else {
            console.log(`  - Jeu similaire ${similarGame.name} déjà dans la liste, ignoré`);
          }
        });
      } else {
        console.log(`  - Aucun jeu similaire trouvé pour ${game.name}`);
      }
    });

    console.log(`Total de jeux similaires analysés: ${totalSimilarGames}`);
    console.log(`Nombre de recommandations uniques: ${similarGamesMap.size}`);

    // Si pas assez de recommandations, essayer d'utiliser les genres pour des suggestions supplémentaires
    if (similarGamesMap.size < 5) {
      console.log("Pas assez de recommandations basées sur les jeux similaires, utilisation des genres...");
      
      // Extraire les genres les plus populaires de la liste
      const genreCount = new Map<number, number>();
      validGames.forEach(game => {
        if (game.genres) {
          game.genres.forEach(genre => {
            genreCount.set(genre.id, (genreCount.get(genre.id) || 0) + 1);
          });
        }
      });

      // Prendre les 2 genres les plus populaires
      const topGenres = Array.from(genreCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([genreId]) => genreId);

      console.log(`Genres populaires dans la liste: ${topGenres.join(', ')}`);

      if (topGenres.length > 0) {
        try {
          // Rechercher des jeux populaires dans ces genres
          const genreBasedGames = await gameService.searchGames("", 1, "rating", undefined, topGenres);
          
          genreBasedGames.results.slice(0, 10).forEach(game => {
            if (!currentGameIds.has(game.id) && !similarGamesMap.has(game.id)) {
              similarGamesMap.set(game.id, {
                game: game,
                frequency: 0.5 // Score plus bas pour les recommandations basées sur les genres
              });
              console.log(`  - Jeu basé sur le genre ajouté: ${game.name}`);
            }
          });
        } catch (error) {
          console.error("Erreur lors de la recherche par genre:", error);
        }
      }
    }

    // Trier par fréquence et prendre les 5 premiers
    const recommendations = Array.from(similarGamesMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    console.log(`Recommandations finales: ${recommendations.length}`);
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.game.name} (score: ${rec.frequency})`);
    });

    return NextResponse.json({
      recommendations: recommendations.map(rec => ({
        ...rec.game,
        recommendationScore: Math.ceil(rec.frequency)
      })),
      debug: {
        totalGamesInList: validGames.length,
        totalSimilarGamesFound: totalSimilarGames,
        uniqueRecommendations: similarGamesMap.size
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recommandations' },
      { status: 500 }
    );
  }
} 