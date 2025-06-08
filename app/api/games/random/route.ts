import { NextResponse } from 'next/server';
import { igdbService } from '@/lib/services/igdb';

function getFiltersForMode(mode: string) {
  switch (mode) {
    case 'recent':
      return {
        yearMin: new Date(new Date().getFullYear() - 2, 0, 1).getFullYear(),
        ratingMin: 70,
        hypes: 1000,
      };
    case 'family':
      return {
        ratingMin: 70,
        hypes: 50,
        pegiMax: 7, // à filtrer côté JS car IGDB ne filtre pas sur PEGI directement
      };
    case 'upcoming':
      return {
        upcoming: true,
        hypes: 30,
      };
    case 'retro':
      return {
        yearMax: 2004,
        ratingMin: 60,
        hypes: 10,
      };
    case 'famous':
      return {
        ratingMin: 75,
        ratingCountMin: 500,
      };
    default:
      return {};
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'all';
  const excludeParam = searchParams.get('exclude');
  const excludeIds = excludeParam ? excludeParam.split(',').map(Number).filter(Boolean) : [];
  const filters = getFiltersForMode(mode);

  const game = await igdbService.getRandomGameForGuess({
    excludeIds,
    yearMin: filters.yearMin,
    yearMax: filters.yearMax,
    ratingMin: filters.ratingMin,
    ratingCountMin: filters.ratingCountMin,
    mode,
  });


  if (!game) {
    return NextResponse.json({ error: 'No game found' }, { status: 404 });
  }

  // Préparer les indices
  const hints = [];
  if (game && game.first_release_date) {
    const year = new Date(game.first_release_date * 1000).getFullYear();
    hints.push({ type: 'text', value: `Année de sortie : ${year}` });
  }
  if (game && game.themes && game.themes.length > 0) {
    hints.push({ type: 'text', value: `Thème : ${(game.themes as { name: string }[]).map((t) => t.name).join(', ')}` });
  }
  if (game && game.involved_companies && game.involved_companies.length > 0) {
    const pub = (game.involved_companies as { publisher?: boolean; company?: { name?: string } }[]).find((c) => c.publisher)?.company?.name;
    if (pub) hints.push({ type: 'text', value: `Éditeur : ${pub}` });
  }
  const coverUrl = game && game.cover && typeof game.cover === 'object'
    ? game.cover.url
    : typeof game?.cover === 'string'
      ? game.cover
      : null;
  if (coverUrl) {
    hints.push({ type: 'image', value: coverUrl });
  }

  return NextResponse.json({
    id: game.id,
    name: game.name,
    screenshot: game.screenshots?.[0]?.url || (typeof game.cover === 'object' ? game.cover.url : game.cover) || null,
    hints,
  });
} 