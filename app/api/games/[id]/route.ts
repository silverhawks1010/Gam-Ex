import { NextResponse } from 'next/server';
import { gameService } from '@/lib/services/gameService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const game = await gameService.getGameDetails(parseInt(params.id));
    return NextResponse.json(game);
  } catch (error) {
    console.error('Erreur lors de la récupération du jeu:', error);
    return NextResponse.json(
      { error: 'Jeu non trouvé' },
      { status: 404 }
    );
  }
} 