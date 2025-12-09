import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const { data, error } = await supabase
    .from('tierlist_items')
    .select('id, tierlist_id, column_id, game_id, franchise_id, position, name, cover')
    .eq('tierlist_id', id)
    .order('position', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { column_id, game_id, franchise_id, position, name, cover } = body;
  if (!column_id || (!game_id && !franchise_id)) {
    return NextResponse.json({ error: 'Column ID and either game_id or franchise_id are required' }, { status: 400 });
  }

  // Vérifier si l'item existe déjà dans la tier list
  const { data: existingItem } = await supabase
    .from('tierlist_items')
    .select('id')
    .eq('tierlist_id', id)
    .eq(game_id ? 'game_id' : 'franchise_id', game_id || franchise_id)
    .single();

  if (existingItem) {
    // Si l'item existe, on le met à jour
    const { data, error } = await supabase
      .from('tierlist_items')
      .update({ column_id, position })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // Si l'item n'existe pas, on le crée
  type TierlistItemInsert = {
    tierlist_id: string;
    column_id: string;
    position: number;
    game_id?: string;
    franchise_id?: string;
    name: string;
    cover: string;
  };

  const insertData: TierlistItemInsert = { 
    tierlist_id: id, 
    column_id, 
    position,
    name,
    cover
  };
  if (game_id) insertData.game_id = game_id;
  if (franchise_id) insertData.franchise_id = franchise_id;
  
  const { data, error } = await supabase
    .from('tierlist_items')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
} 