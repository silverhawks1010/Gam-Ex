export interface TierListItem {
  id: string;
  tier_list_id: string;
  column_id: string | null;
  position: number;
  game_id?: string;
  franchise_id?: string;
} 