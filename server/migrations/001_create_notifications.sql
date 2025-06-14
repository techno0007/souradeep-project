-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add some initial notifications for testing
INSERT INTO public.notifications (title, message, type, is_read)
VALUES 
    ('Welcome to the System', 'Your account has been successfully set up.', 'system', false),
    ('New Feature Available', 'Check out our latest booking management features.', 'update', false),
    ('System Maintenance', 'Scheduled maintenance on Sunday, 2 AM - 4 AM.', 'alert', false); 