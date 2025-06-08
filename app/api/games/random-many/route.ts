import { NextResponse } from 'next/server';
import { igdbService } from '@/lib/services/igdb';
import type { Game } from '@/types/game';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // On récupère le nombre de jeux demandé, avec des limites raisonnables
  const requestedCount = Number(searchParams.get('count')) || 50;
  const count = Math.min(Math.max(requestedCount, 1), 500); // Entre 1 et 500 jeux
  const currentYear = new Date().getFullYear();

  const games = await igdbService.getRandomGames(count, {
    yearMax: currentYear,
  });

  if (!games || games.length === 0) {
    return NextResponse.json({ error: 'No games found' }, { status: 404 });
  }

  const selected = games.map((g: Game) => ({
    id: g.id,
    name: g.name,
    cover: g.cover?.url || null,
  }));

  return NextResponse.json({
    count: selected.length,
    total: count,
    games: selected
  });
} 