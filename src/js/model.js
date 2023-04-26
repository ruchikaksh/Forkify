import { async } from 'regenerator-runtime';
import { AJAX } from './helper.js';
import {API_URL, RES_PER_PAGE,API_KEY } from './config.js';



export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page:1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
};
const createRecipeObject = function (data) {
    const { recipe } = data.data; // here the recipe data is stored in reciepe var, after that new reciepe object is created 
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key}),//&& only works if both the statements are true, here if key exists then second part would be executed
    }
}
export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
       
        
        state.recipe = createRecipeObject(data);
     
      
        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;
    }
    catch (err) {
        console.log(`${err}!!`);
        throw err;

        
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`)
        state.search.results = data.data.recipes.map(res => {
            return {
                id: res.id,
                title: res.title,
                publisher: res.publisher,
                image: res.image_url,
                ...(res.key && {key: res.key})
            };
        });
        state.search.page = 1;
    }  catch (err) {
        console.log(`${err}!!`);
        throw err;

        
    }

}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
            //newqt= oldqt*newServings / oldservings
    
        state.recipe.servings = newServings;
    });
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks))
}

export const addBookMark = function (recipe) {
    //Add bookmark
    state.bookmarks.push(recipe);

    //Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
}

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);
    if (id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}
init();//init function means to call at starting

const clearBookmarks = function () {
    localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== ''
        ).map(ing => {
            const ingArr = ing[1].split(',').map(el => el.trim());
            if (ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format :)')
            const [quantity, unit, description] = ingArr;
            return { quantity: quantity ? +quantity : null, unit, description };
        });
        console.log(ingredients);
        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,

        };
        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookMark(state.recipe);
    } catch (err) {
        throw err;
    }

    
};

