import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/lib/services/gameService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'gameId requis' }, { status: 400 });
  }

  try {
    const coverUrl = await gameService.getGameCover(Number(gameId));
    if (!coverUrl) {
      return NextResponse.json({ error: 'Cover non trouvée' }, { status: 404 });
    }
    return NextResponse.json({ coverUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération de la cover' }, { status: 500 });
  }
} 