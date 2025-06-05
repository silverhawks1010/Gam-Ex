import { createServerClient } from '@/lib/supabase/server';
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
import { DescriptionEditor } from '@/components/profile/DescriptionEditor';
import { MarkdownDescription } from '@/components/profile/MarkdownDescription';

interface ProfilePageProps {
  params: { id: string };
  searchParams?: { public?: string };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const supabase = createServerClient();
  const { id } = params;
  const isPublicView = searchParams?.public === '1';

  // Récupérer le profil par id
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile || error) {
    return notFound();
  }

  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === id;
  const showPrivate = isOwner && !isPublicView;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col items-center w-full bg-gradient-to-b from-background to-muted/60 pb-12">
        {/* Bannière */}
        <div className="relative w-full max-w-3xl h-48 sm:h-64 md:h-72 lg:h-80 rounded-b-3xl overflow-hidden shadow-lg mb-[-64px]">
          {profile.banner_url && profile.banner_url.trim() !== '' ? (
            <Image
              src={profile.banner_url}
              alt="Bannière du profil"
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary/40" />
          )}
        </div>
        {/* Avatar/logo */}
        <div className="relative z-20 -mt-16 sm:-mt-20 flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-32 h-32 ring-4 ring-background shadow-xl flex items-center justify-center">
              {profile.avatar_url && profile.avatar_url.trim() !== '' ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover rounded-full" />
              ) : (
                <FaUserCircle className="w-full h-full text-muted-foreground" />
              )}
            </Avatar>
          </div>
          <h1 className="text-3xl font-bold mt-4">{profile.username}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-muted-foreground">Membre depuis {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        {/* Bio/Description */}
        <section className="w-full max-w-2xl mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
                <MarkdownDescription source={profile.description || 'Aucune description.'} />
            </CardContent>
          </Card>
        </section>
        {/* Listes du joueur */}
        <section className="w-full max-w-2xl mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Mes listes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center py-8">(Le système de listes arrive bientôt ici !)</div>
            </CardContent>
          </Card>
        </section>
        {/* Amis du joueur */}
        <section className="w-full max-w-2xl mt-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Mes amis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center py-8">(Le système d'amis arrive bientôt ici !)</div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
} 