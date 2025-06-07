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
import { BsPencil, BsTrash, BsShare, BsEye, BsEyeSlash, BsPersonPlus, BsPeople } from 'react-icons/bs';
import { Game } from '@/types/game';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { use } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FaUserCircle } from 'react-icons/fa';
import { AddGameToListModal } from '@/components/lists/AddGameToListModal';
import { GameRecommendations } from '@/components/lists/GameRecommendations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [newName, setNewName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'observer' | 'editor'>('observer');
  const [members, setMembers] = useState<any[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);

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
      const res = await fetch(`/api/profiles/bulk?ids=${userIds.join(',')}`);
      const { profiles } = await res.json();
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* HEADER MODERNE */}
        <section
          className="relative rounded-2xl overflow-hidden mb-8 shadow-lg"
          style={{
            background:
              (list as any).banner_url
                ? `url(${(list as any).banner_url}) center/cover no-repeat`
                : 'linear-gradient(90deg, var(--primary), var(--secondary))',
            minHeight: 120,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 p-6">
            <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
              {list.owner?.avatar_url ? (
                <AvatarImage src={list.owner.avatar_url} alt={list.owner.username} />
              ) : (
                <AvatarFallback><FaUserCircle className="w-12 h-12" /></AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground drop-shadow-lg">{list.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${list.is_public ? 'bg-primary/90 text-primary-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>{list.is_public ? 'Publique' : 'Privée'}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-foreground/80 mt-1 flex-wrap">
                <span>{games.length} jeu{games.length > 1 ? 'x' : ''}</span>
                <span>{members.length} membre{members.length > 1 ? 's' : ''}</span>
                <span>Propriétaire : <span className="font-medium">{list.owner?.username}</span></span>
              </div>
            </div>
            {/* ACTIONS PRINCIPALES */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              <TooltipProvider>
                {canEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="secondary" onClick={() => setIsEditing(true)} aria-label="Modifier la liste">
                        <BsPencil className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Modifier la liste</TooltipContent>
                  </Tooltip>
                )}
                {canEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="secondary" onClick={() => setShowMembersModal(true)} aria-label="Gérer les membres">
                        <BsPeople className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Gérer les membres</TooltipContent>
                  </Tooltip>
                )}
                {canEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AddGameToListModal listId={list.id} onGameAdded={loadList} />
                    </TooltipTrigger>
                    <TooltipContent>Ajouter un jeu</TooltipContent>
                  </Tooltip>
                )}
                {isOwner && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="destructive" onClick={handleDeleteList} aria-label="Supprimer la liste">
                        <BsTrash className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Supprimer la liste</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
        </section>

        {/* MODAL EDIT LIST */}
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

        {/* MODAL GESTION MEMBRES */}
        <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gestion des membres</DialogTitle>
              <DialogDescription>
                Gérez les membres ayant accès à cette liste et leurs permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Section d'ajout de membre (uniquement pour le propriétaire) */}
              {isOwner && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Ajouter un membre</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email de l'utilisateur"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={shareRole} onValueChange={(value: 'observer' | 'editor') => setShareRole(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observer">Lecteur</SelectItem>
                        <SelectItem value="editor">Éditeur</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleShareList} disabled={!shareEmail.trim()}>
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}
              {/* Liste des membres */}
              <div className="space-y-2">
                <h4 className="font-medium">Membres actuels</h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {member.avatar_url ? (
                            <AvatarImage src={member.avatar_url} alt={member.username} />
                          ) : (
                            <AvatarFallback><FaUserCircle className="w-6 h-6" /></AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.role === 'owner'
                              ? 'Propriétaire'
                              : member.role === 'editor'
                              ? 'Éditeur'
                              : 'Lecteur'}
                          </p>
                        </div>
                      </div>
                      {/* Actions (uniquement pour le propriétaire sur les non-propriétaires) */}
                      {isOwner && !member.isOwner && member.user_id !== user?.id && (
                        <div className="flex items-center gap-2">
                          <Select 
                            value={member.role} 
                            onValueChange={async (value) => {
                              try {
                                await listService.shareList(list.id, member.email, value as 'observer' | 'editor');
                                loadList();
                                toast({ 
                                  title: 'Rôle mis à jour', 
                                  description: `Rôle de ${member.username} mis à jour.` 
                                });
                              } catch (e) {
                                toast({ 
                                  title: 'Erreur', 
                                  description: 'Impossible de modifier le rôle', 
                                  variant: 'destructive' 
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="w-28">
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
                            onClick={async () => {
                              if (confirm(`Êtes-vous sûr de vouloir retirer ${member.username} de la liste ?`)) {
                                try {
                                  await listService.removeShare(list.id, member.user_id);
                                  loadList();
                                  toast({ 
                                    title: 'Membre retiré', 
                                    description: `${member.username} a été retiré de la liste.` 
                                  });
                                } catch (e) {
                                  toast({ 
                                    title: 'Erreur', 
                                    description: 'Impossible de retirer le membre', 
                                    variant: 'destructive' 
                                  });
                                }
                              }
                            }}
                          >
                            <BsTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMembersModal(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* GRILLE DE JEUX MODERNE */}
        <section className="mb-12">
          {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-muted-foreground mb-2">Aucun jeu dans cette liste</p>
              {canEdit && <AddGameToListModal listId={list.id} onGameAdded={loadList} />}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {games.map((game) => (
                <div key={game.id} className="relative group transition-transform hover:scale-[1.03] hover:shadow-xl border border-border rounded-xl overflow-hidden bg-card">
                  <GameCard game={game} />
                  {canEdit && (
                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveGame(game.id)}
                        aria-label="Retirer le jeu"
                      >
                        <BsTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BOUTON FLOTTANT AJOUT JEU MOBILE */}
        {canEdit && (
          <div className="fixed bottom-6 right-6 z-50 sm:hidden">
            <AddGameToListModal listId={list.id} onGameAdded={loadList} />
          </div>
        )}

        {/* SECTION MEMBRES */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <BsPeople className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">Membres</span>
            <div className="flex -space-x-2 ml-2">
              {members.slice(0, 5).map((member) => (
                <Avatar key={member.user_id} className="w-8 h-8 border-2 border-background">
                  {member.avatar_url ? (
                    <AvatarImage src={member.avatar_url} alt={member.username} />
                  ) : (
                    <AvatarFallback><FaUserCircle className="w-6 h-6" /></AvatarFallback>
                  )}
                </Avatar>
              ))}
              {members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{members.length - 5}</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-4"
              onClick={() => setShowMembersModal(true)}
            >
              Gérer
            </Button>
          </div>
        </section>

        {/* SECTION RECOMMANDATIONS */}
        {games.length > 0 && (
          <section className="mt-8">
            <GameRecommendations 
              listId={list.id}
              canEdit={canEdit}
              onGameAdded={loadList}
            />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
} 