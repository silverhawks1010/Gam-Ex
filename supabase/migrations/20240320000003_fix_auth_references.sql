-- Suppression de tout
DROP TABLE IF EXISTS game_list_shares CASCADE;
DROP TABLE IF EXISTS game_list_items CASCADE;
DROP TABLE IF EXISTS game_lists CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recréation des tables
CREATE TABLE game_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE game_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL,
    game_id TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    added_by UUID NOT NULL,
    CONSTRAINT fk_list FOREIGN KEY (list_id) REFERENCES game_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_added_by FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(list_id, game_id)
);

CREATE TABLE game_list_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'observer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_list FOREIGN KEY (list_id) REFERENCES game_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(list_id, user_id)
);

-- Création des index
CREATE INDEX game_lists_owner_id_idx ON game_lists(owner_id);
CREATE INDEX game_list_items_list_id_idx ON game_list_items(list_id);
CREATE INDEX game_list_items_game_id_idx ON game_list_items(game_id);
CREATE INDEX game_list_shares_list_id_idx ON game_list_shares(list_id);
CREATE INDEX game_list_shares_user_id_idx ON game_list_shares(user_id);

-- Trigger pour updated_at
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

-- Activation RLS
ALTER TABLE game_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_list_shares ENABLE ROW LEVEL SECURITY;

-- Politiques minimales pour game_lists
CREATE POLICY "game_lists_owner" ON game_lists
    FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "game_lists_public" ON game_lists
    FOR SELECT
    USING (is_public = true);

-- Politiques minimales pour game_list_items
CREATE POLICY "game_list_items_owner" ON game_list_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_items_public" ON game_list_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.is_public = true
        )
    );

-- Politiques minimales pour game_list_shares
CREATE POLICY "game_list_shares_owner" ON game_list_shares
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_shares.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_shares_user" ON game_list_shares
    FOR SELECT
    USING (user_id = auth.uid()); 