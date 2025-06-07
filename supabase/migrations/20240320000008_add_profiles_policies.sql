-- Activation RLS pour la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des profils
CREATE POLICY "profiles_public_select"
ON profiles FOR SELECT
USING (true);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "profiles_owner_update"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de supprimer leur propre profil
CREATE POLICY "profiles_owner_delete"
ON profiles FOR DELETE
USING (auth.uid() = id); 