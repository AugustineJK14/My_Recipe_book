# Supabase Integration Setup

Your Recipe Book now supports Supabase as a backend database with fallback to local storage.

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be set up

### 2. Create the Database Table
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create the table and setup

### 3. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 4. Configure Your App
1. Open `supabase-config.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'your-actual-supabase-url';
   const SUPABASE_ANON_KEY = 'your-actual-anon-key';
   ```

### 5. Test the Connection
1. Start your local server: `python -m http.server 3000`
2. Open the app in your browser
3. Check the browser console for connection status

## Database Schema

### Table: `recipes`

| Column      | Type      | Description                    |
|-------------|-----------|--------------------------------|
| id          | UUID      | Primary key (auto-generated)  |
| title       | TEXT      | Recipe name                    |
| ingredients | JSONB     | JSON array of ingredients     |
| method      | TEXT      | Cooking instructions          |
| created_at  | TIMESTAMP | Creation time (auto)          |
| updated_at  | TIMESTAMP | Last update time (auto)       |

### Ingredients JSON Structure
```json
[
  {"name": "Ingredient Name", "quantity": "Amount"},
  {"name": "Flour", "quantity": "2 cups"}
]
```

## Features

✅ **Automatic Fallback**: If Supabase is unavailable, app uses localStorage  
✅ **Real-time Sync**: Data is saved to cloud database  
✅ **Offline Support**: Continue working when offline  
✅ **UUID Primary Keys**: Better for distributed systems  
✅ **Automatic Timestamps**: Track when recipes are created/updated  

## Security Notes

- Current setup allows public access (no authentication)
- Row Level Security (RLS) is enabled but policy allows all operations
- For production, implement user authentication and proper RLS policies

## Troubleshooting

### "Failed to connect to Supabase"
- Check your URL and API key in `supabase-config.js`
- Ensure your Supabase project is active
- Check browser console for detailed error messages

### "Switching to offline mode"
- App automatically falls back to localStorage
- Your data is still saved locally
- Fix Supabase connection to sync to cloud

### CORS Issues
- Supabase should handle CORS automatically
- If issues persist, check your project settings

## Environment Variables (Optional)

For production deployment, you can use environment variables:

1. Create `.env` file (already created)
2. Set your actual values in `.env`
3. Use a build tool or server to inject them

**Note**: Browser apps can't directly read `.env` files. You'll need a build step or server-side rendering for true environment variable support.
