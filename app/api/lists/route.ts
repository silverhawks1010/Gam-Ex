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

interface GameList {
  id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  owner_id: string;
  items?: GameListItem[];
  shares?: unknown[];
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const { data: ownerLists } = await supabase
      .from('game_lists')
      .select(`*, items:game_list_items(id, game_id, games:game_id(cover:cover_url)), shares:game_list_shares(*)`)
      .eq('owner_id', user.id);

    const { data: sharedListLinks } = await supabase
      .from('game_list_shares')
      .select('list_id')
      .eq('user_id', user.id);

    const sharedListIds = (sharedListLinks || []).map((l: { list_id: string }) => l.list_id);
    let sharedLists: GameList[] = [];
    if (sharedListIds.length > 0) {
      const { data } = await supabase
        .from('game_lists')
        .select(`*, items:game_list_items(id, game_id, games:game_id(cover:cover_url)), shares:game_list_shares(*)`)
        .in('id', sharedListIds);
      sharedLists = data || [];
    }

    const allLists = [...(ownerLists || []), ...sharedLists];
    const uniqueLists = Array.from(new Map(allLists.map(list => [list.id, list])).values());

    const ownerIds = uniqueLists.map(list => list.owner_id);
    const { data: ownerProfiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, email')
      .in('id', ownerIds);

    const listsWithDetails = uniqueLists.map(list => {
      const ownerProfile = ownerProfiles?.find((p: { id: string }) => p.id === list.owner_id);
      const items = (list.items || []).map((item: GameListItem) => ({
        ...item,
        cover_url: item.games?.cover || null
      }));
      return {
        ...list,
        items,
        owner: {
          id: list.owner_id,
          username: ownerProfile?.username || 'Utilisateur',
          avatar_url: ownerProfile?.avatar_url || null,
          email: ownerProfile?.email || '',
        }
      };
    });

    return NextResponse.json(listsWithDetails);
  } catch (err) {
    console.error('Erreur dans GET /api/lists:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const { name, is_public } = await request.json();

    if (!name || typeof name !== 'string' || name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: 'Le nom de la liste doit contenir entre 3 et 100 caractères' }, { status: 400 });
    }

    const { data: list, error } = await supabase
      .from('game_lists')
      .insert({
        name,
        is_public: is_public || false,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la création de la liste' }, { status: 500 });
    }

    return NextResponse.json(list);
  } catch (err) {
    console.error('Erreur dans POST /api/lists:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 