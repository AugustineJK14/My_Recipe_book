// Import Supabase client
import { supabase, testConnection } from './supabase-config.js';

// Global variables
let currentRecipeId = null;
let recipes = [];
let isOfflineMode = false;

// DOM Elements
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
    testConnection().then(connected => {
        if (connected) {
            loadRecipesFromDB();
        } else {
            isOfflineMode = true;
            loadRecipesFromLocalStorage();
        }
    });
});

// Event Listeners
function initializeEventListeners() {
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

// Recipe Management
async function loadRecipesFromDB() {
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) {
        console.error('Error loading recipes:', error);
        alert('Failed to load recipes from the database. Switching to offline mode.');
        isOfflineMode = true;
        loadRecipesFromLocalStorage();
    } else {
        recipes = data;
        displayRecipes();
    }
}

function loadRecipesFromLocalStorage() {
    const savedRecipes = localStorage.getItem('myRecipes');
    // Load recipes from localStorage if available
    if (savedRecipes) {
        recipes = JSON.parse(savedRecipes);
    } else {
        // Load sample recipe for first time users
        recipes = [{
            id: '1',
            title: 'Spaghetti Bolognese',
            method: 'Cook the spaghetti according to the package instructions. In a pan, heat some oil over medium heat. Add the onions and garlic, sauté until translucent. Add minced meat, cook until browned. Stir in tomato sauce, let simmer for 10 minutes. Season with salt and pepper. Serve sauce over pasta, garnish with basil leaves.',
            ingredients: [
                { name: 'Spaghetti', quantity: '200g' },
                { name: 'Minced Meat', quantity: '150g' },
                { name: 'Tomato Sauce', quantity: '100ml' },
                { name: 'Onion', quantity: '1' },
                { name: 'Garlic Clove', quantity: '2' },
                { name: 'Salt', quantity: 'to taste' },
                { name: 'Pepper', quantity: 'to taste' },
                { name: 'Basil Leaves', quantity: 'for garnish' }
            ],
            createdAt: new Date().toISOString()
        }];
        saveRecipesToStorage();
    }
    displayRecipes();
}

function saveRecipesToStorage() {
    localStorage.setItem('myRecipes', JSON.stringify(recipes));
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
    const createdDate = recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Unknown';
    
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
    
    const recipeData = {
        title,
        method,
        ingredients,
        updated_at: new Date().toISOString()
    };
    
    if (isOfflineMode) {
        // Save to localStorage in offline mode
        saveRecipeOffline(recipeData);
    } else {
        // Save to Supabase
        await saveRecipeToSupabase(recipeData);
    }
}

function saveRecipeOffline(recipeData) {
    if (currentRecipeId) {
        // Update existing recipe
        const recipeIndex = recipes.findIndex(r => r.id === currentRecipeId);
        if (recipeIndex !== -1) {
            recipes[recipeIndex] = { ...recipes[recipeIndex], ...recipeData };
        }
    } else {
        // Create new recipe
        recipeData.id = 'recipe_' + Date.now();
        recipeData.created_at = new Date().toISOString();
        recipes.push(recipeData);
    }
    
    saveRecipesToStorage();
    closeRecipeModal();
    displayRecipes();
}

async function saveRecipeToSupabase(recipeData) {
    try {
        if (currentRecipeId) {
            // Update existing recipe
            const { data, error } = await supabase
                .from('recipes')
                .update(recipeData)
                .eq('id', currentRecipeId)
                .select();
                
            if (error) throw error;
            
            // Update local recipes array
            const recipeIndex = recipes.findIndex(r => r.id === currentRecipeId);
            if (recipeIndex !== -1) {
                recipes[recipeIndex] = data[0];
            }
        } else {
            // Create new recipe
            recipeData.created_at = new Date().toISOString();
            
            const { data, error } = await supabase
                .from('recipes')
                .insert([recipeData])
                .select();
                
            if (error) throw error;
            
            // Add to local recipes array
            recipes.push(data[0]);
        }
        
        closeRecipeModal();
        displayRecipes();
        
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Failed to save recipe to database. Switching to offline mode.');
        isOfflineMode = true;
        saveRecipeOffline(recipeData);
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
        if (isOfflineMode) {
            // Delete from localStorage in offline mode
            recipes = recipes.filter(r => r.id !== currentRecipeId);
            saveRecipesToStorage();
            closeViewModal();
            displayRecipes();
        } else {
            // Delete from Supabase
            await deleteRecipeFromSupabase();
        }
    }
}

async function deleteRecipeFromSupabase() {
    try {
        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', currentRecipeId);
            
        if (error) throw error;
        
        // Remove from local recipes array
        recipes = recipes.filter(r => r.id !== currentRecipeId);
        closeViewModal();
        displayRecipes();
        
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe from database. Switching to offline mode.');
        isOfflineMode = true;
        
        // Delete locally as fallback
        recipes = recipes.filter(r => r.id !== currentRecipeId);
        saveRecipesToStorage();
        closeViewModal();
        displayRecipes();
    }
}
