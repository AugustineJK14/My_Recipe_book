# My Recipe Book

A beautiful, personal recipe book application with Google authentication and cloud storage. Built with vanilla JavaScript, Firebase, and deployed on Vercel.

## Features

- 🔐 **Google Authentication** - Sign in with your Google account
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ➕ **Add Recipes** - Create new recipes with ingredients and methods
- 📝 **Edit Recipes** - Modify existing recipes anytime
- 🗑️ **Delete Recipes** - Remove recipes you no longer need
- 🔍 **View Recipes** - Beautiful recipe cards with detailed view
- ☁️ **Cloud Storage** - Your recipes are saved in Firebase Firestore
- 🎨 **Beautiful UI** - Elegant beige color scheme with cursive fonts

## Setup Instructions

### 1. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** and add **Google** as a sign-in provider
4. Enable **Firestore Database** in test mode
5. Get your Firebase configuration from Project Settings > General > Your apps
6. Replace the placeholder values in `firebase-config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### 2. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Local Development

1. Clone or download this repository
2. Open a terminal in the project directory
3. Install dependencies: `npm install`
4. Start local server: `npm run dev`
5. Open `http://localhost:3000` in your browser

### 4. Deploy to Vercel

#### Option 1: Deploy from GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/)
3. Import your GitHub repository
4. Vercel will automatically detect it as a static site
5. Deploy!

#### Option 2: Deploy using Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your site will be deployed!

## File Structure

```
my-recipe-book/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet with beige theme
├── app.js             # Main JavaScript application
├── firebase-config.js  # Firebase configuration
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Add Recipe**: Click the + button to open the recipe form
3. **Fill Details**: 
   - Enter recipe name (editable title)
   - Add ingredients with quantities (click + to add more)
   - Write cooking method in the text area
4. **Save**: Click "Save Recipe" to store in your personal collection
5. **View**: Click any recipe card to view full details
6. **Edit**: Click the edit button in recipe view to modify
7. **Delete**: Click the trash button to remove a recipe

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Firebase Auth with Google Provider
- **Database**: Cloud Firestore
- **Hosting**: Vercel
- **Fonts**: Google Fonts (Dancing Script, Poppins)
- **Icons**: Font Awesome

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to use this project for personal or educational purposes.

## Support

If you encounter any issues:
1. Check that your Firebase configuration is correct
2. Ensure Firestore security rules are properly set
3. Verify that Google Authentication is enabled in Firebase Console
4. Check browser console for any error messages

Happy cooking! 🍳
