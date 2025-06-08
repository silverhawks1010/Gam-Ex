import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  if (!ids) return NextResponse.json([], { status: 200 });

  // Retourne des franchises factices pour debug
  const franchises = ids.split(',').map(id => ({
    id: Number(id),
    name: `Franchise ${id}`,
    cover: 'https://placehold.co/80x96'
  }));
  return NextResponse.json(franchises);
} 