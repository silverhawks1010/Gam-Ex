-- Suppression des politiques et tables existantes
DROP TABLE IF EXISTS game_list_shares CASCADE;
DROP TABLE IF EXISTS game_list_items CASCADE;
DROP TABLE IF EXISTS game_lists CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column();

-- Création de la table game_lists
CREATE TABLE IF NOT EXISTS game_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Création de la table game_list_items
CREATE TABLE IF NOT EXISTS game_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES game_lists(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Création de la table game_list_shares
CREATE TABLE IF NOT EXISTS game_list_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES game_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('editor', 'observer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(list_id, user_id)
);

-- Création des index
CREATE INDEX IF NOT EXISTS game_lists_owner_id_idx ON game_lists(owner_id);
CREATE INDEX IF NOT EXISTS game_list_items_list_id_idx ON game_list_items(list_id);
CREATE INDEX IF NOT EXISTS game_list_items_game_id_idx ON game_list_items(game_id);
CREATE INDEX IF NOT EXISTS game_list_shares_list_id_idx ON game_list_shares(list_id);
CREATE INDEX IF NOT EXISTS game_list_shares_user_id_idx ON game_list_shares(user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_lists_updated_at
    BEFORE UPDATE ON game_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS pour game_lists
ALTER TABLE game_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres listes"
    ON game_lists FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent voir les listes publiques"
    ON game_lists FOR SELECT
    USING (is_public = true);

CREATE POLICY "Les utilisateurs peuvent voir les listes partagées avec eux"
    ON game_lists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_lists.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Les utilisateurs peuvent créer leurs propres listes"
    ON game_lists FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les propriétaires peuvent modifier leurs listes"
    ON game_lists FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Les propriétaires peuvent supprimer leurs listes"
    ON game_lists FOR DELETE
    USING (auth.uid() = owner_id);

-- Politiques RLS pour game_list_items
ALTER TABLE game_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir les items des listes qu'ils peuvent voir"
    ON game_list_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND (
                game_lists.owner_id = auth.uid()
                OR game_lists.is_public = true
            )
        )
        OR EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Les propriétaires peuvent ajouter des items à leurs listes"
    ON game_list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "Les éditeurs peuvent ajouter des items aux listes partagées"
    ON game_list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
            AND role = 'editor'
        )
    );

CREATE POLICY "Les propriétaires peuvent supprimer des items de leurs listes"
    ON game_list_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "Les éditeurs peuvent supprimer des items des listes partagées"
    ON game_list_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
            AND role = 'editor'
        )
    );

-- Politiques RLS pour game_list_shares
ALTER TABLE game_list_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir les partages des listes qu'ils peuvent voir"
    ON game_list_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_shares.list_id
            AND (
                game_lists.owner_id = auth.uid()
                OR game_lists.is_public = true
            )
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Les propriétaires peuvent gérer les partages de leurs listes"
    ON game_list_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_shares.list_id
            AND game_lists.owner_id = auth.uid()
        )
    ); 