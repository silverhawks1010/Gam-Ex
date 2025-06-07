import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type ImageType = 'avatar' | 'banner';

export interface ImageUploadResult {
  success: boolean;
  error?: string;
  path?: string;
}

export const imageService = {
  async uploadImage(
    file: File,
    userId: string,
    type: ImageType
  ): Promise<ImageUploadResult> {
    try {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Le fichier doit être une image'
        };
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'L\'image ne doit pas dépasser 5MB'
        };
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

      // Supprimer l'ancienne image si elle existe
      const { data: existingFiles } = await supabase.storage
        .from('user-images')
        .list(`${userId}`);

      const oldImage = existingFiles?.find(file => file.name.startsWith(`${type}-`));
      if (oldImage) {
        await supabase.storage
          .from('user-images')
          .remove([`${userId}/${oldImage.name}`]);
      }

      // Uploader la nouvelle image
      const { error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return {
          success: false,
          error: 'Erreur lors de l\'upload de l\'image'
        };
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(fileName);

      // Mettre à jour le profil utilisateur
      const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', userId);

      if (updateError) {
        // Supprimer l'image uploadée en cas d'erreur
        await supabase.storage
          .from('user-images')
          .remove([fileName]);

        return {
          success: false,
          error: 'Erreur lors de la mise à jour du profil'
        };
      }

      return {
        success: true,
        path: publicUrl
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return {
        success: false,
        error: 'Une erreur est survenue'
      };
    }
  },

  async getImageUrl(userId: string, type: ImageType): Promise<string | null> {
    try {
      // Récupérer l'URL depuis le profil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(type === 'avatar' ? 'avatar_url' : 'banner_url')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return null;
      }

      // Explicitly check for avatar_url or banner_url based on type
      if (type === 'avatar' && 'avatar_url' in profile) {
        return profile.avatar_url;
      } else if (type === 'banner' && 'banner_url' in profile) {
        return profile.banner_url;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL:', error);
      return null;
    }
  }
}; 