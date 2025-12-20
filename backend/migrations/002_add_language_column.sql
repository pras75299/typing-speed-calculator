-- Add language column to texts table for code typing practice
ALTER TABLE texts 
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'javascript';

-- Create index for language filtering
CREATE INDEX IF NOT EXISTS idx_texts_language ON texts(language);

-- Update existing texts to have javascript as default language
UPDATE texts SET language = 'javascript' WHERE language IS NULL;

