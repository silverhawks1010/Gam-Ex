import { NextResponse } from 'next/server';
import { igdbService } from '@/lib/services/igdb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await igdbService.searchGames(
      query,
      1,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      20, // On augmente la limite pour avoir plus de résultats à filtrer
      [0, 8, 9] // Catégories : Jeu principal, Remaster, Remake
    );
    
    // On utilise un Set pour garder une trace des noms déjà vus
    const seenNames = new Set<string>();
    const uniqueResults = results.results
      .filter(game => {
        // Si le nom a déjà été vu, on le filtre
        if (seenNames.has(game.name)) {
          return false;
        }
        // Sinon on l'ajoute au Set et on garde le jeu
        seenNames.add(game.name);
        return true;
      })
      .slice(0, 10) // On limite à 10 résultats après dédoublonnage
      .map(game => ({
        id: game.id,
        name: game.name
      }));

    return NextResponse.json(uniqueResults);
  } catch (error) {
    console.error('Error searching games:', error);
    return NextResponse.json({ error: 'Failed to search games' }, { status: 500 });
  }
} 