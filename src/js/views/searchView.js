class SearchView {
  //父元素 將其設置為查詢選擇器
  _parentEl = document.querySelector('.search');

  getQuery() {
    const query = this._parentEl.querySelector('.search__field').value;

    this._clearInput();

    return query;
  }

  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    //不是針對按鈕 是針對整個表單
    //因此無論用戶是點擊提交按鈕
    //還是在鍵入查詢時按Enter鍵
    //都可以使用此方法
    this._parentEl.addEventListener('submit', function (e) {
      //首先要阻止默認是操作 否則頁面將重新加載
      e.preventDefault();
      handler();
    });
  }
}
export default new SearchView();
