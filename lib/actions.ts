import { supabase } from '@/lib/supabase';

export async function updateUserXP(userId: string, xpToAdd: number) {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newXP = (profile?.xp || 0) + xpToAdd;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXP })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return { success: true, newXP };
  } catch (error) {
    console.error('Error updating XP:', error);
    return { success: false, error };
  }
}

export async function createEntry(content: string, mood: string, activities: string[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Calculate XP based on content length and activities
    const baseXP = Math.min(Math.floor(content.length / 10), 50); // 1 XP per 10 characters, max 50
    const activityBonus = activities.length * 5; // 5 XP per activity
    const totalXP = baseXP + activityBonus;

    // Create the entry
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .insert([
        {
          user_id: user.id,
          content,
          mood,
          activities,
          xp_earned: totalXP
        }
      ])
      .select()
      .single();

    if (entryError) throw entryError;

    // Update user's XP
    await updateUserXP(user.id, totalXP);

    return { success: true, entry, xpEarned: totalXP };
  } catch (error) {
    console.error('Error creating entry:', error);
    return { success: false, error };
  }
} 