import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/lib/services/gameService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results = await gameService.searchGames(query, page);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Erreur lors de la recherche de jeux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de jeux' },
      { status: 500 }
    );
  }
} 