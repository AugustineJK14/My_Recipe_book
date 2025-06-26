// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import { config } from './config.js';

// Load environment variables from config.js (generated from .env)
const SUPABASE_URL = config.SUPABASE_URL;
const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not found. Please check your .env file and run: node build-config.js');
}

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
