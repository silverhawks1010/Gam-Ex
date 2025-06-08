import { NextResponse } from 'next/server';
import { igdbService } from '@/lib/services/igdb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const count = Math.min(Number(searchParams.get('count')) || 10, 500);
  const minGames = Math.max(Number(searchParams.get('minGames')) || 3, 1);

  const franchises = await igdbService.getRandomFranchises(count, minGames);

  if (!franchises || franchises.length === 0) {
    return NextResponse.json({ error: 'No franchises found' }, { status: 404 });
  }

  return NextResponse.json({
    count: franchises.length,
    franchises,
  });
} 