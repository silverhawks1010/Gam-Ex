import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  if (!ids) return NextResponse.json([], { status: 200 });

  // Retourne des jeux factices pour debug
  const games = ids.split(',').map(id => ({
    id: Number(id),
    name: `Game ${id}`,
    cover: { url: 'https://placehold.co/80x96' }
  }));
  return NextResponse.json(games);
} 