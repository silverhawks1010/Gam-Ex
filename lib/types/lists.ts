export type GameList = {
  id: string;
  name: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  banner_url: string | null;
};

export type GameListItem = {
  id: string;
  list_id: string;
  game_id: string;
  added_at: string;
  added_by: string;
};

export type GameListShare = {
  id: string;
  list_id: string;
  user_id: string;
  role: 'editor' | 'observer';
  created_at: string;
};

export type GameListWithDetails = GameList & {
  items: GameListItem[];
  shares: GameListShare[];
  owner: {
    id: string;
    username: string;
    avatar_url: string | null;
    email: string;
  };
}; 