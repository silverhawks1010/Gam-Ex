-- Suppression des politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les partages des listes qu'ils peuvent voir" ON game_list_shares;
DROP POLICY IF EXISTS "Les propriétaires peuvent gérer les partages de leurs listes" ON game_list_shares;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items des listes qu'ils peuvent voir" ON game_list_items;
DROP POLICY IF EXISTS "Les propriétaires peuvent ajouter des items à leurs listes" ON game_list_items;
DROP POLICY IF EXISTS "Les éditeurs peuvent ajouter des items aux listes partagées" ON game_list_items;
DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer des items de leurs listes" ON game_list_items;
DROP POLICY IF EXISTS "Les éditeurs peuvent supprimer des items des listes partagées" ON game_list_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres listes" ON game_lists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les listes publiques" ON game_lists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les listes partagées avec eux" ON game_lists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres listes" ON game_lists;
DROP POLICY IF EXISTS "Les propriétaires peuvent modifier leurs listes" ON game_lists;
DROP POLICY IF EXISTS "Les propriétaires peuvent supprimer leurs listes" ON game_lists;

-- Politiques RLS pour game_lists
CREATE POLICY "game_lists_select_own"
    ON game_lists FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "game_lists_select_public"
    ON game_lists FOR SELECT
    USING (is_public = true);

CREATE POLICY "game_lists_select_shared"
    ON game_lists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_lists.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "game_lists_insert"
    ON game_lists FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "game_lists_update"
    ON game_lists FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "game_lists_delete"
    ON game_lists FOR DELETE
    USING (auth.uid() = owner_id);

-- Politiques RLS pour game_list_items
CREATE POLICY "game_list_items_select_own"
    ON game_list_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_items_select_public"
    ON game_list_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.is_public = true
        )
    );

CREATE POLICY "game_list_items_select_shared"
    ON game_list_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "game_list_items_insert_owner"
    ON game_list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_items_insert_editor"
    ON game_list_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
            AND role = 'editor'
        )
    );

CREATE POLICY "game_list_items_delete_owner"
    ON game_list_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_items_delete_editor"
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
CREATE POLICY "game_list_shares_select_own"
    ON game_list_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_shares.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_shares_select_public"
    ON game_list_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_shares.list_id
            AND game_lists.is_public = true
        )
    );

CREATE POLICY "game_list_shares_select_shared"
    ON game_list_shares FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "game_list_shares_all"
    ON game_list_shares FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_shares.list_id
            AND game_lists.owner_id = auth.uid()
        )
    ); 