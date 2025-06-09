export interface TierList {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  type: "games" | "franchises";
  created_at: string;
  updated_at: string;
} 