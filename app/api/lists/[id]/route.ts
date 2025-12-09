import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

interface GameListItem {
  id: string;
  game_id: string;
  added_at?: string;
  added_by?: string;
  cover_url?: string;
  games?: { cover?: string };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const { data: list, error } = await supabase
      .from('game_lists')
      .select(`*, items:game_list_items(id, game_id, games:game_id(cover:cover_url))`)
      .eq('id', id)
      .single();
    if (error || !list) {
      return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 });
    }
    const items = (list.items || []).map((item: GameListItem) => ({
      ...item,
      cover_url: item.games?.cover || null
    }));
    return NextResponse.json({ ...list, items });
  } catch (err) {
    console.error('Erreur dans GET /api/lists/[id]:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { id } = await params;
    const { error } = await supabase
      .from('game_lists')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);
    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur dans DELETE /api/lists/[id]:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 