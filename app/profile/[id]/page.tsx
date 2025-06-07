import { notFound } from 'next/navigation';
import { Database } from '@/types/supabase';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/molecules/Navbar';
import { Footer } from '@/components/molecules/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { FaUserCircle } from 'react-icons/fa';
import { MarkdownDescription } from '@/components/profile/MarkdownDescription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BsPinFill, BsList, BsPerson } from 'react-icons/bs';
import { ClientListsManager } from '@/components/profile/ClientListsManager';

interface GameListItem {
  id: string;
  game_id: string;
  added_at?: string;
  added_by?: string;
  cover_url?: string;
}

interface PinnedList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  games: GameListItem[];
}

interface Profile {
  id: string;
  username: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
  pinned_lists: PinnedList[];
}

interface ProfilePageProps {
  params: { id: string };
  searchParams?: { public?: string };
}

// Fonction utilitaire pour générer une URL d'icône IGDB
function getIGDBCoverUrl(coverUrl: string) {
  if (!coverUrl) return '';
  return coverUrl.startsWith('//') ? `https:${coverUrl}` : coverUrl;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { createServerSupabaseClient } = await import('@/lib/supabase/server-client');
  const supabase = createServerSupabaseClient();
  const { id } = params;

  // 1. Récupérer le profil seul
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile || error) {
    return notFound();
  }

  // 2. Récupérer les listes épinglées si besoin
  let pinnedLists: PinnedList[] = [];
  if (profile.pinned_lists && profile.pinned_lists.length > 0) {
    const { data: lists } = await supabase
      .from('game_lists')
      .select(`
        id, 
        name, 
        description, 
        is_public, 
        created_at, 
        updated_at, 
        game_list_items(
          id, 
          game_id, 
          added_at, 
          added_by,
          games:game_id(
            cover:cover_url
          )
        )
      `)
      .in('id', profile.pinned_lists);
    pinnedLists = (lists || []).map(list => ({
      ...list,
      games: (list.game_list_items || []).map((item: any) => ({
        id: item.id,
        game_id: item.game_id,
        added_at: item.added_at,
        added_by: item.added_by,
        cover_url: item.games?.cover || null
      }))
    }));
  }

  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();
  const loggedInUserId = user?.id;
  const profileUserId = id;
  const isOwner = loggedInUserId === profileUserId;

  // Récupérer les listes pertinentes selon le scénario
  let relevantLists: any[] = [];
  if (isOwner) {
    // Scénario 1 : toutes les listes dont il est propriétaire OU où il est éditeur
    // a) Listes possédées
    const { data: ownedLists } = await supabase
      .from('game_lists')
      .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
      .eq('owner_id', loggedInUserId)
      .order('created_at', { ascending: false });
    // b) Listes où il est éditeur
    const { data: sharedListIds } = await supabase
      .from('game_list_shares')
      .select('list_id')
      .eq('user_id', loggedInUserId)
      .eq('role', 'editor');
    const sharedIds = (sharedListIds || []).map((s: any) => s.list_id);
    let sharedLists: any[] = [];
    if (sharedIds.length > 0) {
      const { data } = await supabase
        .from('game_lists')
        .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
        .in('id', sharedIds)
        .order('created_at', { ascending: false });
      sharedLists = data || [];
    }
    // Fusionner et dédupliquer
    relevantLists = [
      ...(ownedLists || []),
      ...sharedLists
    ].filter((list, index, self) =>
      self.findIndex(l => l.id === list.id) === index
    );
  } else {
    // Scénario 2 : listes publiques ET (possédées OU partagées avec profileUserId en tant qu'éditeur)
    // a) Listes publiques possédées
    const { data: publicOwnedLists } = await supabase
      .from('game_lists')
      .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
      .eq('is_public', true)
      .eq('owner_id', profileUserId)
      .order('created_at', { ascending: false });
    // b) Listes publiques partagées avec profileUserId
    const { data: sharedListIds } = await supabase
      .from('game_list_shares')
      .select('list_id')
      .eq('user_id', profileUserId)
      .eq('role', 'editor');
    const sharedIds = (sharedListIds || []).map((s: any) => s.list_id);
    let publicSharedLists: any[] = [];
    if (sharedIds.length > 0) {
      const { data } = await supabase
        .from('game_lists')
        .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
        .eq('is_public', true)
        .in('id', sharedIds)
        .order('created_at', { ascending: false });
      publicSharedLists = data || [];
    }
    // Fusionner et dédupliquer
    relevantLists = [
      ...(publicOwnedLists || []),
      ...publicSharedLists
    ].filter((list, index, self) =>
      self.findIndex(l => l.id === list.id) === index
    );
  }

  const typedProfile: Profile = {
    ...profile,
    pinned_lists: pinnedLists
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Hero Section with Banner and Avatar */}
      <div className="relative w-full">
        {/* Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          {typedProfile.banner_url && typedProfile.banner_url.trim() !== '' ? (
            <Image
              src={typedProfile.banner_url}
              alt="Bannière du profil"
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary/40" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl flex items-center justify-center">
              {typedProfile.avatar_url && typedProfile.avatar_url.trim() !== '' ? (
                <img src={typedProfile.avatar_url} alt={typedProfile.username} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full text-muted-foreground">
                  <FaUserCircle size="100%" />
                </div>
              )}
            </Avatar>
          </div>
          <h1 className="text-3xl font-bold mt-4 text-center">{typedProfile.username}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <span>Membre depuis {new Date(typedProfile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pt-32 pb-12">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <BsPerson className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="lists" className="flex items-center gap-2">
              <BsList className="w-4 h-4" />
              Toutes les listes
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownDescription source={typedProfile.description || 'Aucune description.'} />
                </CardContent>
              </Card>
              {/* Pinned Lists */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BsPinFill className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">Listes épinglées</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {pinnedLists && pinnedLists.length > 0 ? (
                    <div className="grid gap-6">
                      {pinnedLists.map((list: PinnedList) => (
                        <Card key={list.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{list.name}</CardTitle>
                              <Link 
                                href={`/lists/${list.id}`}
                                className="text-sm text-primary hover:underline"
                              >
                                Voir la liste
                              </Link>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="w-full">
                              <div className="flex gap-2 pb-2">
                                {list.games.slice(0, 5).map((item: GameListItem) => (
                                  <div
                                    key={item.id}
                                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted"
                                  >
                                    <div className="w-full h-full flex items-center justify-center text-xs text-center p-1">
                                      {item.cover_url ? (
                                        <Image 
                                          src={getIGDBCoverUrl(item.cover_url || '')} 
                                          alt={`Cover for game ${item.game_id}`} 
                                          width={64} 
                                          height={64}
                                          className="object-cover"
                                        />
                                      ) : (
                                        <span className="text-xs text-muted-foreground">?</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {list.games.length > 5 && (
                                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs">
                                    +{list.games.length - 5}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Aucune liste épinglée
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lists Tab */}
          <TabsContent value="lists">
            <ClientListsManager initialLists={relevantLists} userId={loggedInUserId || ''} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
} 