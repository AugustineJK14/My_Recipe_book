// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Load environment variables from config.js (generated from .env)
const SUPABASE_URL = window.SUPABASE_CONFIG?.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not found. Please check your .env file and run: node build-config.js');
}

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
export async function testConnection() {
    try {
        const { data, error } = await supabase.from('recipes').select('count', { count: 'exact' });
        if (error) {
            console.error('Supabase connection error:', error);
            return false;
        }
        console.log('Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('Failed to connect to Supabase:', error);
        return false;
    }
}
