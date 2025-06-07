import { createClient } from '@/lib/supabase/client';
import { GameList, GameListItem, GameListWithDetails } from '@/lib/types/lists';

const supabase = createClient();

export const listService = {
  // Récupérer toutes les listes de l'utilisateur
  async getUserLists(): Promise<GameListWithDetails[]> {
    try {
      console.log('Début getUserLists');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });
      
      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }
      
      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      console.log('Requête des listes pour l\'utilisateur:', user.id);
      // 1. Récupérer toutes les listes dont tu es propriétaire
      const { data: ownerLists, error: ownerError } = await supabase
        .from('game_lists')
        .select(`*, items:game_list_items(*), shares:game_list_shares(*)`)
        .eq('owner_id', user.id);

      if (ownerError) throw ownerError;

      // 2. Récupérer toutes les listes partagées avec toi
      const { data: sharedListLinks, error: sharedLinksError } = await supabase
        .from('game_list_shares')
        .select('list_id')
        .eq('user_id', user.id);
      const sharedListIds = (sharedListLinks || []).map(l => l.list_id);
      let sharedLists = [];
      if (sharedListIds.length > 0) {
        const { data, error } = await supabase
          .from('game_lists')
          .select(`*, items:game_list_items(*), shares:game_list_shares(*)`)
          .in('id', sharedListIds);
        if (error) throw error;
        sharedLists = data || [];
      }

      if (sharedLinksError) throw sharedLinksError;

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
      return uniqueLists.map(list => {
        const ownerProfile = ownerProfiles?.find(p => p.id === list.owner_id);
        return {
          ...list,
          owner: {
            id: list.owner_id,
            username: ownerProfile?.username || 'Utilisateur',
            avatar_url: ownerProfile?.avatar_url || null,
            email: ownerProfile?.email || '',
          }
        };
      });
    } catch (error) {
      console.error('Erreur dans getUserLists:', error);
      throw error;
    }
  },

  // Créer une nouvelle liste
  async createList(name: string, isPublic: boolean): Promise<GameList> {
    try {
      console.log('Début createList:', { name, isPublic });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      if (name.length < 3 || name.length > 100) {
        console.error('Nom de liste invalide:', name);
        throw new Error('Le nom de la liste doit contenir entre 3 et 100 caractères');
      }

      console.log('Création de la liste pour l\'utilisateur:', user.id);
      const { data: list, error } = await supabase
        .from('game_lists')
        .insert({
          name,
          is_public: isPublic,
          owner_id: user.id
        })
        .select()
        .single();

      console.log('Réponse de la création:', { list, error });

      if (error) {
        console.error('Erreur lors de la création de la liste:', error);
        throw error;
      }

      return list;
    } catch (error) {
      console.error('Erreur dans createList:', error);
      throw error;
    }
  },

  // Mettre à jour une liste
  async updateList(id: string, updates: Partial<GameList>): Promise<GameList> {
    try {
      console.log('Début updateList:', { id, updates });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      if (updates.name && (updates.name.length < 3 || updates.name.length > 100)) {
        console.error('Nom de liste invalide:', updates.name);
        throw new Error('Le nom de la liste doit contenir entre 3 et 100 caractères');
      }

      console.log('Mise à jour de la liste pour l\'utilisateur:', user.id);
      const { data: list, error } = await supabase
        .from('game_lists')
        .update(updates)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single();

      console.log('Réponse de la mise à jour:', { list, error });

      if (error) {
        console.error('Erreur lors de la mise à jour de la liste:', error);
        throw error;
      }

      return list;
    } catch (error) {
      console.error('Erreur dans updateList:', error);
      throw error;
    }
  },

  // Supprimer une liste
  async deleteList(id: string): Promise<void> {
    try {
      console.log('Début deleteList:', { id });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      console.log('Suppression de la liste pour l\'utilisateur:', user.id);
      const { error } = await supabase
        .from('game_lists')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      console.log('Réponse de la suppression:', { error });

      if (error) {
        console.error('Erreur lors de la suppression de la liste:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans deleteList:', error);
      throw error;
    }
  },

  // Ajouter un jeu à une liste
  async addGameToList(listId: string, gameId: string): Promise<GameListItem> {
    try {
      console.log('Début addGameToList:', { listId, gameId });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier les permissions
      const { data: list, error: listError } = await supabase
        .from('game_lists')
        .select('*, shares:game_list_shares(*)')
        .eq('id', listId)
        .single();

      if (listError) {
        console.error('Erreur lors de la récupération de la liste:', listError);
        throw listError;
      }

      const isOwner = list.owner_id === user.id;
      const isEditor = list.shares.some((share: { user_id: string; role: string; }) => share.user_id === user.id && share.role === 'editor');

      if (!isOwner && !isEditor) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour modifier cette liste');
      }

      console.log('Ajout du jeu à la liste pour l\'utilisateur:', user.id);
      const { data: item, error } = await supabase
        .from('game_list_items')
        .insert({
          list_id: listId,
          game_id: gameId,
          added_by: user.id
        })
        .select()
        .single();

      console.log('Réponse de l\'ajout:', { item, error });

      if (error) {
        if (error.code === '23505') {
          console.error('Jeu déjà dans la liste');
          throw new Error('Ce jeu est déjà dans la liste');
        }
        console.error('Erreur lors de l\'ajout du jeu:', error);
        throw error;
      }

      return item;
    } catch (error) {
      console.error('Erreur dans addGameToList:', error);
      throw error;
    }
  },

  // Retirer un jeu d'une liste
  async removeGameFromList(listId: string, gameId: string): Promise<void> {
    try {
      console.log('Début removeGameFromList:', { listId, gameId });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier les permissions
      const { data: list, error: listError } = await supabase
        .from('game_lists')
        .select('*, shares:game_list_shares(*)')
        .eq('id', listId)
        .single();

      if (listError) {
        console.error('Erreur lors de la récupération de la liste:', listError);
        throw listError;
      }

      const isOwner = list.owner_id === user.id;
      const isEditor = list.shares.some((share: { user_id: string; role: string; }) => share.user_id === user.id && share.role === 'editor');

      if (!isOwner && !isEditor) {
        throw new Error('Vous n\'avez pas les permissions nécessaires pour modifier cette liste');
      }

      console.log('Suppression du jeu de la liste pour l\'utilisateur:', user.id);
      const { error } = await supabase
        .from('game_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('game_id', gameId);

      console.log('Réponse de la suppression:', { error });

      if (error) {
        console.error('Erreur lors de la suppression du jeu:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans removeGameFromList:', error);
      throw error;
    }
  },

  // Partager une liste avec un autre utilisateur
  async shareList(listId: string, email: string, role: 'editor' | 'observer'): Promise<void> {
    try {
      console.log('Début shareList:', { listId, email, role });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer l'ID de l'utilisateur à partir de son email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        throw new Error('Utilisateur non trouvé');
      }

      if (!profile) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier si le partage existe déjà
      const { data: existingShare, error: shareError } = await supabase
        .from('game_list_shares')
        .select('*')
        .eq('list_id', listId)
        .eq('user_id', profile.id)
        .single();

      if (shareError && shareError.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification du partage existant:', shareError);
        throw shareError;
      }

      if (existingShare) {
        // Mettre à jour le rôle si le partage existe déjà
        const { error: updateError } = await supabase
          .from('game_list_shares')
          .update({ role })
          .eq('id', existingShare.id);

        if (updateError) {
          console.error('Erreur lors de la mise à jour du partage:', updateError);
          throw updateError;
        }
      } else {
        // Créer un nouveau partage
        const { error: insertError } = await supabase
          .from('game_list_shares')
          .insert({
            list_id: listId,
            user_id: profile.id,
            role
          });

        if (insertError) {
          console.error('Erreur lors de la création du partage:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Erreur dans shareList:', error);
      throw error;
    }
  },

  // Supprimer un partage
  async removeShare(listId: string, userId: string): Promise<void> {
    try {
      console.log('Début removeShare:', { listId, userId });
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth response:', { user, authError });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        throw authError;
      }

      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      console.log('Suppression du partage pour l\'utilisateur:', user.id);
      const { error } = await supabase
        .from('game_list_shares')
        .delete()
        .eq('list_id', listId)
        .eq('user_id', userId);

      console.log('Réponse de la suppression:', { error });

      if (error) {
        console.error('Erreur lors de la suppression du partage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans removeShare:', error);
      throw error;
    }
  }
}; 