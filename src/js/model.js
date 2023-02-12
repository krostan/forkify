//Polifilling async function
import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

//狀態包含構建應用程序所需的所有數據
export const state = {
  recipe: {},
  search: {
    query: '', //查詢
    results: [], //結果
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    //如果有任何標籤  其標籤ID 等於剛剛接收到的ID
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    //Temp error handling
    console.error(`${err} 💥💥💥💥💥`);
    //拋出錯誤 向下傳遞給controller
    throw err;
  }
};

//因為將執行AJAX呼叫 所以將是一個非同步函數
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1; //每次搜尋時 初始化page=1
  } catch (err) {
    console.error(`${err} 💥💥💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  // export const getSearchResultsPage = function (page = 1) {
  //當前搜索結果頁面
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //取到9 所以需要10
  return state.search.results.slice(start, end);
};

//進入state
//然後進入 配方的ingredients
//改變每種成分的數量
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // netQt= oldQt * newServings /oldServings // 2 * 8 / 4 = 4
  });
  //更新servings 份量
  state.recipe.servings = newServings;
};

//本地存儲標籤資料
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

//加入標籤
//會收到一個菜譜
//然後把菜譜設為標籤
export const addBookmark = function (recipe) {
  // 添加標籤
  // Add bookmark
  state.bookmarks.push(recipe);
  //如果當前的配方和這裡添加的配方recipe是一樣的
  //當前配方標記為標籤
  // Mark current recipe as bookmark
  //如果為真 那就在recipe 添加一個屬性bookmarked 為 true
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

//刪除標籤
export const deleteBookmark = function (id) {
  // Delete bookmark
  //查詢index
  //查找的ID(state.bookmarks裡的ID)也就是當前ID
  //有等於 傳入的ID的
  //其 索引 存儲到index
  const index = state.bookmarks.findIndex(el => el.id === id);

  //把索引從陣列中刪除
  state.bookmarks.splice(index, 1);
  // Mark current recipe as NOT bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

//從本地取出標籤
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

//清除所有頁面 開發時使用
// const clearBookmarks = function () {
//   localStorage.clear('bookmarks');
// };

// clearBookmarks();

//上傳菜譜
//這一個最終將向API發出請求
//所以是一個async function
export const uploadRecipde = async function (newRecipt) {
  try {
    const ingredients = Object.entries(newRecipt)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient fromat! Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    //因為要上傳菜補 發送到API
    //所以需要將屬性設為與 API相同的屬性名
    const recipe = {
      title: newRecipt.title,
      source_url: newRecipt.sourceUrl,
      image_url: newRecipt.image,
      publisher: newRecipt.publisher,
      cooking_time: +newRecipt.cookingTime,
      servings: +newRecipt.servings,
      ingredients,
    };

    //AJAX請求
    //這會發送食譜 然後返回給我們
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
