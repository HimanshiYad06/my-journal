export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awarded_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  xp: number;
  level: number;
  badges: Badge[];
} 