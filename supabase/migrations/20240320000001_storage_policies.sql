-- Politique pour permettre la lecture publique des images
CREATE POLICY "Les images sont accessibles publiquement"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-images');

-- Politique pour permettre l'insertion d'images uniquement par l'utilisateur authentifié
CREATE POLICY "Les utilisateurs peuvent uploader leurs propres images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la mise à jour des images uniquement par l'utilisateur authentifié
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre la suppression des images uniquement par l'utilisateur authentifié
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
); 