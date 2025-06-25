import { auth, googleProvider, db } from './firebase-config.js';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global variables
let currentUser = null;
let currentRecipeId = null;
let recipes = [];

// DOM Elements
const signinPage = document.getElementById('signin-page');
const dashboardPage = document.getElementById('dashboard-page');
const googleSigninBtn = document.getElementById('google-signin-btn');
const signoutBtn = document.getElementById('signout-btn');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const addRecipeBtn = document.getElementById('add-recipe-btn');
const recipesGrid = document.getElementById('recipes-grid');
const emptyState = document.getElementById('empty-state');

// Modal elements
const recipeModal = document.getElementById('recipe-modal');
const viewModal = document.getElementById('view-modal');
const closeModalBtn = document.getElementById('close-modal');
const closeViewModalBtn = document.getElementById('close-view-modal');
const recipeTitleInput = document.getElementById('recipe-title');
const recipeForm = document.getElementById('recipe-form');
const ingredientsContainer = document.getElementById('ingredients-container');
const addIngredientBtn = document.getElementById('add-ingredient');
const recipeMethodTextarea = document.getElementById('recipe-method');
const cancelRecipeBtn = document.getElementById('cancel-recipe');

// View modal elements
const viewRecipeTitle = document.getElementById('view-recipe-title');
const viewIngredients = document.getElementById('view-ingredients');
const viewMethod = document.getElementById('view-method');
const editRecipeBtn = document.getElementById('edit-recipe');
const deleteRecipeBtn = document.getElementById('delete-recipe');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    
    // Check authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            showDashboard();
            loadUserRecipes();
        } else {
            currentUser = null;
            showSignIn();
        }
    });
});

// Event Listeners
function initializeEventListeners() {
    // Authentication
    googleSigninBtn.addEventListener('click', signInWithGoogle);
    signoutBtn.addEventListener('click', handleSignOut);
    
    // Recipe management
    addRecipeBtn.addEventListener('click', openRecipeModal);
    closeModalBtn.addEventListener('click', closeRecipeModal);
    closeViewModalBtn.addEventListener('click', closeViewModal);
    cancelRecipeBtn.addEventListener('click', closeRecipeModal);
    recipeForm.addEventListener('submit', saveRecipe);
    
    // Dynamic ingredients
    addIngredientBtn.addEventListener('click', addIngredientRow);
    
    // Recipe actions
    editRecipeBtn.addEventListener('click', editCurrentRecipe);
    deleteRecipeBtn.addEventListener('click', deleteCurrentRecipe);
    
    // Modal backdrop clicks
    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal) closeRecipeModal();
    });
    
    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) closeViewModal();
    });
}

// Authentication functions
async function signInWithGoogle() {
    try {
        googleSigninBtn.classList.add('loading');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('User signed in:', result.user);
    } catch (error) {
        console.error('Error signing in:', error);
        alert('Error signing in. Please try again.');
    } finally {
        googleSigninBtn.classList.remove('loading');
    }
}

async function handleSignOut() {
    try {
        await signOut(auth);
        console.log('User signed out');
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// UI Navigation
function showSignIn() {
    signinPage.classList.add('active');
    dashboardPage.classList.remove('active');
}

function showDashboard() {
    signinPage.classList.remove('active');
    dashboardPage.classList.add('active');
    
    // Update user info
    if (currentUser) {
        userPhoto.src = currentUser.photoURL || '';
        userName.textContent = currentUser.displayName || 'User';
    }
}

// Recipe Management
async function loadUserRecipes() {
    if (!currentUser) return;
    
    try {
        const q = query(
            collection(db, 'recipes'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        recipes = [];
        
        querySnapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayRecipes();
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
}

function displayRecipes() {
    if (recipes.length === 0) {
        recipesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    recipesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    recipesGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipesGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => viewRecipe(recipe);
    
    const ingredientCount = recipe.ingredients ? recipe.ingredients.length : 0;
    const createdDate = recipe.createdAt ? new Date(recipe.createdAt.toDate()).toLocaleDateString() : 'Unknown';
    
    card.innerHTML = `
        <h3>${recipe.title}</h3>
        <div class="recipe-meta">
            <span>${ingredientCount} ingredients</span> • 
            <span>Added ${createdDate}</span>
        </div>
    `;
    
    return card;
}

// Modal Management
function openRecipeModal(recipe = null) {
    currentRecipeId = recipe ? recipe.id : null;
    
    // Reset form
    recipeTitleInput.value = recipe ? recipe.title : '';
    recipeMethodTextarea.value = recipe ? recipe.method : '';
    
    // Clear ingredients
    ingredientsContainer.innerHTML = '';
    
    if (recipe && recipe.ingredients) {
        // Load existing ingredients
        recipe.ingredients.forEach(ingredient => {
            addIngredientRow(ingredient.name, ingredient.quantity);
        });
    } else {
        // Add one empty ingredient row
        addIngredientRow();
    }
    
    recipeModal.classList.add('active');
    recipeTitleInput.focus();
}

function closeRecipeModal() {
    recipeModal.classList.remove('active');
    currentRecipeId = null;
}

function addIngredientRow(name = '', quantity = '') {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    
    row.innerHTML = `
        <input type="text" class="ingredient-name" placeholder="Ingredient name" value="${name}" required>
        <input type="text" class="ingredient-quantity" placeholder="Quantity" value="${quantity}" required>
        <button type="button" class="remove-ingredient">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Add remove functionality
    row.querySelector('.remove-ingredient').addEventListener('click', () => {
        if (ingredientsContainer.children.length > 1) {
            row.remove();
        }
    });
    
    ingredientsContainer.appendChild(row);
}

async function saveRecipe(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const title = recipeTitleInput.value.trim();
    const method = recipeMethodTextarea.value.trim();
    
    if (!title || !method) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Collect ingredients
    const ingredients = [];
    const ingredientRows = ingredientsContainer.querySelectorAll('.ingredient-row');
    
    for (let row of ingredientRows) {
        const name = row.querySelector('.ingredient-name').value.trim();
        const quantity = row.querySelector('.ingredient-quantity').value.trim();
        
        if (name && quantity) {
            ingredients.push({ name, quantity });
        }
    }
    
    if (ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }
    
    try {
        const recipeData = {
            title,
            method,
            ingredients,
            userId: currentUser.uid,
            updatedAt: serverTimestamp()
        };
        
        if (currentRecipeId) {
            // Update existing recipe
            await updateDoc(doc(db, 'recipes', currentRecipeId), recipeData);
        } else {
            // Create new recipe
            recipeData.createdAt = serverTimestamp();
            await addDoc(collection(db, 'recipes'), recipeData);
        }
        
        closeRecipeModal();
        await loadUserRecipes();
        
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Error saving recipe. Please try again.');
    }
}

// Recipe Viewing
function viewRecipe(recipe) {
    currentRecipeId = recipe.id;
    
    viewRecipeTitle.textContent = recipe.title;
    viewMethod.textContent = recipe.method;
    
    // Display ingredients
    viewIngredients.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="ingredient-name-display">${ingredient.name}</span>
            <span class="ingredient-quantity-display">${ingredient.quantity}</span>
        `;
        viewIngredients.appendChild(li);
    });
    
    viewModal.classList.add('active');
}

function closeViewModal() {
    viewModal.classList.remove('active');
    currentRecipeId = null;
}

function editCurrentRecipe() {
    const recipe = recipes.find(r => r.id === currentRecipeId);
    if (recipe) {
        closeViewModal();
        openRecipeModal(recipe);
    }
}

async function deleteCurrentRecipe() {
    if (!currentRecipeId) return;
    
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
        try {
            await deleteDoc(doc(db, 'recipes', currentRecipeId));
            closeViewModal();
            await loadUserRecipes();
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Error deleting recipe. Please try again.');
        }
    }
}
