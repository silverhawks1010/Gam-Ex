import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/lib/services/gameService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ err: 'gameId requis' }, { status: 400 });
  }

  try {
    const coverUrl = await gameService.getGameCover(Number(gameId));
    if (!coverUrl) {
      return NextResponse.json({ err: 'Cover non trouvée' }, { status: 404 });
    }
    return NextResponse.json({ coverUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: 'Erreur lors de la récupération de la cover' }, { status: 500 });
  }
} 