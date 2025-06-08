export interface TierListColumn {
  id: string;
  label: string;
  color: string;
  items: TierListItem[];
}

export interface TierListItem {
  id: string;
  type: 'game' | 'franchise';
  name: string;
  imageUrl: string;
}

export interface TierList {
  id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  owner_id: string;
  columns: TierListColumn[];
} 