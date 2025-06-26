-- Create the recipes table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    method TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- You can modify this later to add user authentication
CREATE POLICY "Allow all operations on recipes" ON recipes
FOR ALL USING (true);

-- Create an index on the title for faster searches
CREATE INDEX idx_recipes_title ON recipes(title);

-- Create an index on created_at for sorting
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_recipes_updated_at 
    BEFORE UPDATE ON recipes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
INSERT INTO recipes (title, ingredients, method) VALUES 
(
    'Chocolate Chip Cookies',
    '[
        {"name": "All-purpose flour", "quantity": "2 1/4 cups"},
        {"name": "Baking soda", "quantity": "1 tsp"},
        {"name": "Salt", "quantity": "1 tsp"},
        {"name": "Butter", "quantity": "1 cup"},
        {"name": "Brown sugar", "quantity": "3/4 cup"},
        {"name": "White sugar", "quantity": "3/4 cup"},
        {"name": "Eggs", "quantity": "2"},
        {"name": "Vanilla extract", "quantity": "2 tsp"},
        {"name": "Chocolate chips", "quantity": "2 cups"}
    ]'::jsonb,
    'Preheat oven to 375°F. Mix flour, baking soda, and salt in a bowl. In another bowl, cream butter and sugars until fluffy. Beat in eggs and vanilla. Gradually blend in flour mixture. Stir in chocolate chips. Drop rounded tablespoons of dough onto ungreased cookie sheets. Bake 9-11 minutes or until golden brown. Cool on baking sheet for 2 minutes before removing.'
);
