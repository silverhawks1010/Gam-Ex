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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/molecules/Navbar';
import { Footer } from '@/components/molecules/Footer';
import { BsPlus, BsTrash, BsPencil, BsEye, BsEyeSlash } from 'react-icons/bs';

export default function ListsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [lists, setLists] = useState<GameListWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    loadLists();
  }, [user, loading]);

  const loadLists = async () => {
    try {
      const userLists = await listService.getUserLists();
      setLists(userLists);
    } catch (e) {
      console.error("Erreur lors du chargement des listes :", e);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos listes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la liste ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      const newList = await listService.createList(newListName, isPublic);
      if (user) {
        setLists([...lists, { 
          ...newList, 
          items: [], 
          shares: [], 
          owner: { 
            id: user.id,
            username: user.user_metadata?.username || user.email || 'Utilisateur',
            avatar_url: (user.user_metadata as { avatar_url?: string })?.avatar_url || null,
            email: user.email || '',
          } 
        }]);
        setNewListName('');
        setIsPublic(false);
        setIsCreating(false);
        toast({
          title: "Succès",
          description: "Liste créée avec succès"
        });
      }
    } catch (e) {
      console.error("Erreur lors de la création de la liste :", e);
      toast({
        title: "Erreur",
        description: "Impossible de créer la liste",
        variant: "destructive"
      });
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) return;

    try {
      await listService.deleteList(listId);
      setLists(lists.filter(list => list.id !== listId));
      toast({
        title: "Succès",
        description: "Liste supprimée avec succès"
      });
    } catch (e) {
      console.error("Erreur lors de la suppression de la liste :", e);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la liste",
        variant: "destructive"
      });
    }
  };

  const handleUpdateList = async (listId: string, updates: Partial<GameListWithDetails>) => {
    try {
      const updatedList = await listService.updateList(listId, updates);
      setLists(lists.map(list => list.id === listId ? { ...list, ...updatedList } : list));
      toast({
        title: "Succès",
        description: "Liste mise à jour avec succès"
      });
    } catch (e) {
      console.error("Erreur lors de la mise à jour de la liste :", e);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la liste",
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Listes</h1>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <BsPlus className="w-5 h-5" />
                Nouvelle Liste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle liste</DialogTitle>
                <DialogDescription>
                  Donnez un nom à votre liste et choisissez sa visibilité
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la liste</Label>
                  <Input
                    id="name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
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
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateList}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Card key={list.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{list.name}</CardTitle>
                    <CardDescription>
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
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdateList(list.id, { is_public: !list.is_public })}
                    >
                      {list.is_public ? <BsEyeSlash className="w-4 h-4" /> : <BsEye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <BsTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {list.items.length} jeux
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => router.push(`/lists/${list.id}`)}
                    >
                      <BsPencil className="w-4 h-4" />
                      Modifier
                    </Button>
                  </div>
                  {list.shares.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Partagé avec {list.shares.length} personne(s)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
} 