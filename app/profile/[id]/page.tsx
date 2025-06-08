import { notFound } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/molecules/Navbar';
import { Footer } from '@/components/molecules/Footer';
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';
import { MarkdownDescription } from '@/components/profile/MarkdownDescription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BsPinFill, BsList, BsPerson } from 'react-icons/bs';
import { ClientListsManager } from '@/components/profile/ClientListsManager';
import { ListsGrid } from '@/components/lists/ListsGrid';

interface GameListItem {
  id: string;
  game_id: string;
  added_at?: string;
  added_by?: string;
}

interface PinnedList {
  id: string;
  name: string;
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

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { createServerSupabaseClient } = await import('@/lib/supabase/server-client');
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile || error) {
    return notFound();
  }

  let pinnedLists: PinnedList[] = [];
  if (profile.pinned_lists && profile.pinned_lists.length > 0) {
    const { data: lists } = await supabase
      .from('game_lists')
      .select(`
        id, 
        name, 
        is_public, 
        created_at, 
        updated_at, 
        game_list_items(
          id, 
          game_id, 
          added_at, 
          added_by
        )
      `)

      .in('id', profile.pinned_lists);
      
      
    pinnedLists = (lists || []).map(list => ({
      ...list,
      games: (list.game_list_items || []).map((item) => {
        const i = item as { id: string; game_id: string; added_at?: string; added_by?: string; games?: { cover?: string } };
        return {
          id: i.id,
          game_id: i.game_id,
          added_at: i.added_at,
          added_by: i.added_by,
          cover_url: i.games?.cover
        };
      })
    }));
  }

  

  const { data: { user } } = await supabase.auth.getUser();
  const loggedInUserId = user?.id;
  const profileUserId = id;
  const isOwner = loggedInUserId === profileUserId;

  let relevantLists: Array<{ id: string; name: string; is_public: boolean; created_at: string; game_list_items: GameListItem[] }> = [];
  if (isOwner) {
    const { data: ownedLists } = await supabase
      .from('game_lists')
      .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
      .eq('owner_id', loggedInUserId)
      .order('created_at', { ascending: false });
    const { data: sharedListIds } = await supabase
      .from('game_list_shares')
      .select('list_id')
      .eq('user_id', loggedInUserId)
      .eq('role', 'editor');
    const sharedIds = (sharedListIds || []).map((s: { list_id: string }) => s.list_id);
    let sharedLists: Array<{ id: string; name: string; is_public: boolean; created_at: string; game_list_items: GameListItem[] }> = [];
    if (sharedIds.length > 0) {
      const { data } = await supabase
        .from('game_lists')
        .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
        .in('id', sharedIds)
        .order('created_at', { ascending: false });
      sharedLists = data || [];
    }
    relevantLists = [
      ...(ownedLists || []),
      ...sharedLists
    ].filter((list, index, self) =>
      self.findIndex(l => l.id === list.id) === index
    );
  } else {
    const { data: publicOwnedLists } = await supabase
      .from('game_lists')
      .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
      .eq('is_public', true)
      .eq('owner_id', profileUserId)
      .order('created_at', { ascending: false });
    const { data: sharedListIds } = await supabase
      .from('game_list_shares')
      .select('list_id')
      .eq('user_id', profileUserId)
      .eq('role', 'editor');
    const sharedIds = (sharedListIds || []).map((s: { list_id: string }) => s.list_id);
    let publicSharedLists: Array<{ id: string; name: string; is_public: boolean; created_at: string; game_list_items: GameListItem[] }> = [];
    if (sharedIds.length > 0) {
      const { data } = await supabase
        .from('game_lists')
        .select('id, name, is_public, created_at, game_list_items(id, game_id, cover_url)')
        .eq('is_public', true)
        .in('id', sharedIds)
        .order('created_at', { ascending: false });
      publicSharedLists = data || [];
    }
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
      <div className="relative w-full">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl flex items-center justify-center">
              {typedProfile.avatar_url && typedProfile.avatar_url.trim() !== '' ? (
                <Image 
                  src={typedProfile.avatar_url} alt={typedProfile.username}
                  fill
                  className="w-full h-full object-cover rounded-full" 
                />
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
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownDescription source={typedProfile.description || 'Aucune description.'} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BsPinFill className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl">Listes épinglées</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {pinnedLists && pinnedLists.length > 0 ? (
                    <ListsGrid lists={pinnedLists}  />
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Aucune liste épinglée
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="lists">
            <ClientListsManager initialLists={relevantLists} userId={loggedInUserId || ''} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
} 