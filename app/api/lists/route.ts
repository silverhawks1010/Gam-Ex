import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Erreur d\'authentification' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    // 1. Récupérer toutes les listes dont tu es propriétaire
    const { data: ownerLists, error: ownerError } = await supabase
      .from('game_lists')
      .select(`*, items:game_list_items(id, game_id, games:game_id(cover:cover_url)), shares:game_list_shares(*)`)
      .eq('owner_id', user.id);

    if (ownerError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des listes' }, { status: 500 });
    }

    // 2. Récupérer toutes les listes partagées avec toi
    const { data: sharedListLinks, error: sharedLinksError } = await supabase
      .from('game_list_shares')
      .select('list_id')
      .eq('user_id', user.id);

    if (sharedLinksError) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des listes partagées' }, { status: 500 });
    }

    const sharedListIds = (sharedListLinks || []).map(l => l.list_id);
    let sharedLists = [];
    if (sharedListIds.length > 0) {
      const { data, error } = await supabase
        .from('game_lists')
        .select(`*, items:game_list_items(id, game_id, games:game_id(cover:cover_url)), shares:game_list_shares(*)`)
        .in('id', sharedListIds);
      if (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération des listes partagées' }, { status: 500 });
      }
      sharedLists = data || [];
    }

    // 3. Fusionner sans doublons
    const allLists = [...(ownerLists || []), ...sharedLists];
    const uniqueLists = Array.from(new Map(allLists.map(list => [list.id, list])).values());

    // 4. Récupérer les profils des propriétaires
    const ownerIds = uniqueLists.map(list => list.owner_id);
    const { data: ownerProfiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, email')
      .in('id', ownerIds);

    // 5. Transformer les données pour correspondre au type GameListWithDetails
    const listsWithDetails = uniqueLists.map(list => {
      const ownerProfile = ownerProfiles?.find(p => p.id === list.owner_id);
      // Mapper les covers sur chaque item
      const items = (list.items || []).map((item: any) => ({
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
  } catch (error) {
    console.error('Erreur dans GET /api/lists:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
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
  } catch (error) {
    console.error('Erreur dans POST /api/lists:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 