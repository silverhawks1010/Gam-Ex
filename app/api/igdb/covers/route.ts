import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/lib/services/gameService';

// Simple cache en mémoire (clé: gameId, valeur: coverUrl)
const coverCache: { [gameId: string]: string } = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json({ error: 'Paramètre ids requis' }, { status: 400 });
  }

  const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
  const result: { [gameId: string]: string | null } = {};
  const toFetch: string[] = [];

  // 1. Récupérer du cache
  ids.forEach(gameId => {
    if (coverCache[gameId]) {
      result[gameId] = coverCache[gameId];
    } else {
      toFetch.push(gameId);
    }
  });

  // 2. Appeler IGDB pour les ids manquants
  if (toFetch.length > 0) {
    await Promise.all(toFetch.map(async (gameId) => {
      try {
        const coverUrl = await gameService.getGameCover(Number(gameId));
        if (coverUrl) {
          coverCache[gameId] = 'https:' + coverUrl;
          result[gameId] = 'https:' + coverUrl;
        } else {
          result[gameId] = null;
        }
      } catch {
        result[gameId] = null;
      }
    }));
  }

  return NextResponse.json(result);
} 