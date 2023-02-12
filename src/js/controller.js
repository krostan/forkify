import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js';
import 'regenerator-runtime';
// https://forkify-api.herokuapp.com/v2

if (module.hot) {
  module.hot.accept();
}

///////////////////////////////////////
//實際上被處裡的地方
const controlRecipes = async function () {
  try {
    //獲取hash ID 也就是要獲得菜單的ID 還需要去掉ID前面的 #字串
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    //使用render 會造成重新加載
    //使用update 只有實際更改的元素被更新
    resultsView.update(model.getSearchResultsPage());
    // 3) Updating bookmarks views
    bookmarksView.update(model.state.bookmarks);

    // 1) loading recipe
    //非同步函數會返回一個promise
    await model.loadRecipe(id);

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

//查詢控制
const controlSearchResults = async function () {
  try {
    //loag動畫
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Reander results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

//搜尋頁面跳轉控制
const controlPagination = function (goToPage) {
  // 1) Reander NEW results
  // resultsView.render(model.state.search.results);
  //跳轉到的頁面的內容
  //此時state.search.page 的值 變為goToPage
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  //這裡抓到的search.page 已經變更為變為goToPage
  //所以現在的當前頁面就是goToPage
  paginationView.render(model.state.search);
};

//食譜份量控制
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};
// 加入標籤控制
const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

//控制本地標籤
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//接收新配方
const controlAddRecipe = async function (newRecipe) {
  try {
    //在開始上傳數據之前
    //在添加recipeView中呈現一個加載為調器
    // Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipde(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    //如果沒有將標籤render進去
    //會造成 當你添加了新的菜譜
    //當你點擊右上的標籤時
    //會導致錯誤
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();

    // Close form window
    setTimeout(function () {
      // addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application!');
};

//發布者
const init = function () {
  //控制本地標籤
  bookmarksView.addHandlerRender(controlBookmarks);
  //顯示食譜內容
  recipeView.addHandlerRender(controlRecipes);
  //更新份量
  recipeView.addHandlerUpdateServings(controlServings);
  //加入&顯示標籤
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  //查詢
  searchView.addHandlerSearch(controlSearchResults);
  //換頁
  paginationView.addHandlerClick(controlPagination);
  //
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};

init();
