import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { Badge } from '@/lib/types';

interface UserLevelProps {
  level: number;
  xp: number;
  badges: Badge[];
}

export function UserLevel({ level, xp, badges }: UserLevelProps) {
  const xpToNextLevel = (level + 1) * 100;
  const progress = (xp / xpToNextLevel) * 100;

  return (
    <div className="space-y-4">
      {/* Level Display */}
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Level {level}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {xp} / {xpToNextLevel} XP
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Badges Display */}
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">Badges</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center p-3 bg-muted/50 rounded-lg"
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className="text-sm font-medium text-center">{badge.name}</span>
              <span className="text-xs text-muted-foreground text-center">
                {badge.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 