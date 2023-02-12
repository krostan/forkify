import View from './View';
import icons from '../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      //選最近的 類似查詢選擇器select
      //但是它是在樹中向下搜索
      //對於子對象
      //基本上是在樹中向上搜索
      //因為在按鈕中
      //實際上可以點擊span元素或SVG元素
      //而不是點級按鈕本身
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    const prevButton = `
    <button data-goto="${
      curPage - 1
    }" class="btn--inline pagination__btn--prev">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${curPage - 1}</span>
    </button>
    `;

    const nextButton = `
    <button data-goto="${
      curPage + 1
    }" class="btn--inline pagination__btn--next">
      <span>Page ${curPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button
    `;

    // Page 1 ,and there are other pages
    if (curPage === 1 && numPages > 1) {
      return nextButton;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return prevButton;
    }

    // Other page
    if (curPage < numPages) {
      return prevButton + nextButton;
    }

    // Page 1 ,and there are NO other pages
    return '';
  }
}

export default new PaginationView();
