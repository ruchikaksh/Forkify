import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';//polyfilling everything else for old browsers
import 'regenerator-runtime/runtime';//polyfilling async/await
import {async} from 'regenerator-runtime'



if (module.hot) {
  module.hot.accept();
}



// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////



const controlRecipe = async function () {
  try {
     
    const id = window.location.hash.slice(1);
    // console.log(id);
    if (!id) return;
    recipeView.renderSpinner();

    //Update result view to mark selected search result
    resultView.update(model.getSearchResultsPage())
    bookmarksView.update(model.state.bookmarks);
       //1. loading reciepe
    
    await model.loadRecipe(id);
    const { recipe } = model.state;
   //2. Rendering recipe
    recipeView.render(model.state.recipe);
    
        
    } catch (err) {
    recipeView.renderError();
    }
};

const controlSearchResults = async function () {
  try {

    resultView.renderSpinner();
    //1. get search result
    const query = searchView.getQuery();
    if (!query) return;
     // Load search result
    await model.loadSearchResults(query);

    // console.log(model.state.search.results);
    //Render result
    resultView.render(model.getSearchResultsPage());

    //Render intial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
}

const controlPagination = function (goToPage) {
 //Render new result
    resultView.render(model.getSearchResultsPage(goToPage));

    //Render new pagination buttons
    paginationView.render(model.state.search);
}


const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function () {
  //Add/remove bookmarks
  if(!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
 else model.deleteBookmark(model.state.recipe.id);
 //Update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

   //upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in URL
    window.history.pushState(null,'',`#${model.state.recipe.id}`)

    //Close the form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
      
 

  } catch (err) {
    console.error('*', err);
    addRecipeView.renderError(err.message);
  }

  
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  
}
init();
