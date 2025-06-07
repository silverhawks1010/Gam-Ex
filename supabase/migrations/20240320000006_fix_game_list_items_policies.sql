-- Suppression des politiques existantes pour game_list_items
DROP POLICY IF EXISTS "game_list_items_owner" ON game_list_items;
DROP POLICY IF EXISTS "game_list_items_public" ON game_list_items;

-- Politiques pour game_list_items
CREATE POLICY "game_list_items_owner" ON game_list_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_lists
            WHERE game_lists.id = game_list_items.list_id
            AND game_lists.owner_id = auth.uid()
        )
    );

CREATE POLICY "game_list_items_editor" ON game_list_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
            AND role = 'editor'
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

CREATE POLICY "game_list_items_shared" ON game_list_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM game_list_shares
            WHERE list_id = game_list_items.list_id
            AND user_id = auth.uid()
        )
    ); 