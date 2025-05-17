-- Add XP and level columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    xp_required INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, xp_required) VALUES
    ('Novice Writer', 'Start your journaling journey', '📝', 0),
    ('Consistent Writer', 'Write for 7 days straight', '🔥', 100),
    ('Word Smith', 'Write 1000 words', '✍️', 200),
    ('Journal Master', 'Write 10 entries', '📚', 300),
    ('Reflection Expert', 'Write 20 entries', '🎯', 500),
    ('Writing Legend', 'Write 50 entries', '👑', 1000);

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
    new_badges JSONB;
    badge_record RECORD;
BEGIN
    -- Get current badges
    new_badges := NEW.badges;
    
    -- Check for new badges based on XP
    FOR badge_record IN 
        SELECT * FROM public.badges 
        WHERE xp_required <= NEW.xp 
        AND NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(new_badges) AS existing_badge 
            WHERE existing_badge->>'id' = badge_record.id::text
        )
    LOOP
        -- Add new badge to badges array
        new_badges := new_badges || jsonb_build_object(
            'id', badge_record.id,
            'name', badge_record.name,
            'description', badge_record.description,
            'icon', badge_record.icon,
            'awarded_at', now()
        );
    END LOOP;
    
    -- Update badges
    NEW.badges := new_badges;
    
    -- Update level based on XP
    NEW.level := GREATEST(1, FLOOR(NEW.xp / 100)::INTEGER);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically check and award badges
CREATE TRIGGER check_badges_trigger
    BEFORE UPDATE OF xp ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_badges(); 