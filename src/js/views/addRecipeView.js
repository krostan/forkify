import View from './View';
import icons from '../../img/icons.svg';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded :)';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  //切換hidden
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  //在頁面加載後立即呼叫此函數
  _addHandlerShowWindow() {
    //這樣寫 這裡的this.toggleWindow 的this 指的是this._btnOpen這個元素
    //所以需要使用bind()
    //此方法創建一個被呼叫的函數的副本
    //將這個副本的this設為我們傳遞給bind的值
    //此this 指向當前對象
    // this._btnOpen.addEventListener('click', this.toggleWindow);
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  //關閉新增菜譜的頁面
  _addHandlerHideWindow() {
    //點擊叉叉
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    //點擊 模糊區域
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }
  //提交表單 submit
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      //new FormData(this) 回傳一個object
      //將其擴展到陣列中
      //此時陣列中每一項都是一個 包含 key和value陣列
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);

      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
