'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { listService } from '@/lib/services/listService';
import { GameListWithDetails } from '@/lib/types/lists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/molecules/Navbar';
import { Footer } from '@/components/molecules/Footer';
import { GameCard } from '@/components/molecules/GameCard';
import { BsPencil, BsTrash, BsShare, BsEye, BsEyeSlash, BsPersonPlus } from 'react-icons/bs';
import { Game } from '@/types/game';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { use } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FaUserCircle } from 'react-icons/fa';

interface ListPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ListPage({ params }: ListPageProps) {
  const resolvedParams = use(params);
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [list, setList] = useState<GameListWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'observer' | 'editor'>('observer');
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    loadList();
  }, [user, loading, resolvedParams.id]);

  const loadList = async () => {
    try {
      const lists = await listService.getUserLists();
      const currentList = lists.find(l => l.id === resolvedParams.id);
      if (!currentList) {
        router.push('/lists');
        return;
      }
      setList(currentList);
      setNewName(currentList.name);
      setIsPublic(currentList.is_public);

      // Charger les détails des jeux
      const gamesData = await Promise.all(
        currentList.items.map(async (item) => {
          try {
            const response = await fetch(`/api/games/${item.game_id}`);
            if (!response.ok) throw new Error('Jeu non trouvé');
            const data = await response.json();
            return data;
          } catch (error) {
            console.error(`Erreur lors du chargement du jeu ${item.game_id}:`, error);
            return null;
          }
        })
      );
      setGames(gamesData.filter((game): game is Game => game !== null));

      // Charger les profils de tous les membres (propriétaire + partagés)
      const userIds = [
        ...currentList.shares.map(s => s.user_id),
        currentList.owner.id
      ].filter((v, i, arr) => arr.indexOf(v) === i); // unique
      console.log('currentList.shares:', currentList.shares);
      console.log('userIds:', userIds);
      const res = await fetch(`/api/profiles/bulk?ids=${userIds.join(',')}`);
      const { profiles } = await res.json();
      console.log('profiles:', profiles);
      const membersData = userIds.map(user_id => {
        const profile = profiles.find((p: any) => p.id === user_id) || {};
        const share = currentList.shares.find(s => s.user_id === user_id);
        return {
          user_id,
          avatar_url: profile.avatar_url || null,
          username: profile.username || profile.email || 'Utilisateur',
          email: profile.email || '',
          role: user_id === currentList.owner.id ? 'owner' : share?.role || 'observer',
          isOwner: user_id === currentList.owner.id,
        };
      });
      console.log('membersData:', membersData);
      setMembers(membersData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateList = async () => {
    if (!list) return;

    try {
      const updatedList = await listService.updateList(list.id, {
        name: newName,
        is_public: isPublic
      });
      setList({ ...list, ...updatedList });
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Liste mise à jour avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la liste",
        variant: "destructive"
      });
    }
  };

  const handleDeleteList = async () => {
    if (!list) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) return;

    try {
      await listService.deleteList(list.id);
      router.push('/lists');
      toast({
        title: "Succès",
        description: "Liste supprimée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la liste",
        variant: "destructive"
      });
    }
  };

  const handleRemoveGame = async (gameId: number) => {
    if (!list) return;

    try {
      await listService.removeGameFromList(list.id, gameId.toString());
      setList({
        ...list,
        items: list.items.filter(item => item.game_id !== gameId.toString())
      });
      setGames(games.filter(game => game.id !== gameId));
      toast({
        title: "Succès",
        description: "Jeu retiré de la liste"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le jeu de la liste",
        variant: "destructive"
      });
    }
  };

  const handleShareList = async () => {
    if (!list || !shareEmail.trim()) return;

    try {
      await listService.shareList(list.id, shareEmail, shareRole);
      setShareEmail('');
      setShareRole('observer');
      setIsSharing(false);
      toast({
        title: "Succès",
        description: "Liste partagée avec succès"
      });
      // Recharger la liste pour mettre à jour les partages
      loadList();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de partager la liste",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p>Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p>Liste non trouvée</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = list.owner_id === user?.id;
  const isEditor = list.shares.some(share => share.user_id === user?.id && share.role === 'editor');
  const canEdit = isOwner || isEditor;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{list.name}</h1>
            <p className="text-muted-foreground">
              {list.is_public ? (
                <span className="flex items-center gap-1">
                  <BsEye className="w-4 h-4" />
                  Liste publique
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <BsEyeSlash className="w-4 h-4" />
                  Liste privée
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <BsPencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsSharing(true)}
                >
                  <BsPersonPlus className="w-4 h-4 mr-2" />
                  Partager
                </Button>
                {isOwner && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteList}
                  >
                    <BsTrash className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/lists')}
            >
              Retour
            </Button>
          </div>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la liste</DialogTitle>
              <DialogDescription>
                Modifiez le nom et la visibilité de votre liste
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la liste</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ma liste de jeux"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">Liste publique</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateList}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isSharing} onOpenChange={setIsSharing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Partager la liste</DialogTitle>
              <DialogDescription>
                Partagez cette liste avec d'autres utilisateurs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de l'utilisateur</Label>
                <Input
                  id="email"
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="utilisateur@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={shareRole} onValueChange={(value: 'observer' | 'editor') => setShareRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observer">Lecteur</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSharing(false)}>
                Annuler
              </Button>
              <Button onClick={handleShareList}>
                Partager
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Membres</CardTitle>
              <CardDescription>Gérez les membres ayant accès à cette liste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {members.map(member => (
                  <div key={member.user_id} className="flex flex-col items-center p-2 border rounded-md">
                    <Avatar className="w-12 h-12 mb-1">
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url} alt={member.username} />
                      ) : (
                        <AvatarFallback><FaUserCircle className="w-8 h-8" /></AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-semibold">{member.username}</span>
                    {/* Email caché */}
                    {/* <span className="text-xs text-muted-foreground">{member.email}</span> */}
                    <span className="text-sm text-muted-foreground mt-1">
                      {member.role === 'owner'
                        ? 'Propriétaire'
                        : member.role === 'editor'
                        ? 'Éditeur'
                        : 'Lecteur'}
                    </span>
                    {isOwner && !member.isOwner && member.user_id !== user?.id && (
                      <>
                        <Select value={member.role} onValueChange={async (value) => {
                          try {
                            await listService.shareList(list.id, member.email, value as 'observer' | 'editor');
                            loadList();
                            toast({ title: 'Rôle mis à jour', description: `Rôle de ${member.username} mis à jour.` });
                          } catch (e) {
                            toast({ title: 'Erreur', description: 'Impossible de modifier le rôle', variant: 'destructive' });
                          }
                        }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="observer">Lecteur</SelectItem>
                            <SelectItem value="editor">Éditeur</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            try {
                              await listService.removeShare(list.id, member.user_id);
                              loadList();
                              toast({ title: 'Membre retiré', description: `${member.username} a été retiré.` });
                            } catch (e) {
                              toast({ title: 'Erreur', description: 'Impossible de retirer le membre', variant: 'destructive' });
                            }
                          }}
                        >
                          Retirer
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mx-[10%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div key={game.id} className="relative group">
                <GameCard game={game} />
                {canEdit && (
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveGame(game.id)}
                    >
                      <BsTrash className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 