-- Ajouter le champ pinned_lists à la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pinned_lists UUID[] DEFAULT '{}';

-- Créer une politique pour permettre la mise à jour des listes épinglées
CREATE POLICY "Users can update their own pinned lists"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id); 