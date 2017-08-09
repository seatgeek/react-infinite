/* @flow */

class ScrollUtils {
  loadingSpinner: HTMLDivElement;
  getScrollable: () => ?HTMLDivElement;
  infiniteHandleScroll: (e: SyntheticEvent) => void;

  constructor(
    loadingSpinner: HTMLDivElement,
    getScrollable: () => ?HTMLDivElement,
    infiniteHandleScroll: (e: SyntheticEvent) => void
  ) {
    this.loadingSpinner = loadingSpinner;
    this.getScrollable = getScrollable;
    this.infiniteHandleScroll = infiniteHandleScroll;
  }

  getLoadingSpinnerHeight(): number {
    var loadingSpinnerHeight = 0;
    if (this.loadingSpinner) {
      loadingSpinnerHeight = this.loadingSpinner.offsetHeight || 0;
    }
    return loadingSpinnerHeight;
  }

  subscribeToScrollListener() {}

  unsubscribeFromScrollListener() {}

  // To prevent things which use the nodeScrollListener from
  // rebinding `this` away (the `onScroll` of the scrollable div).
  nodeScrollListener = (e: SyntheticEvent) => {
    return this.infiniteHandleScroll(e);
  };

  getScrollTop(): number {
    const scrollable = this.getScrollable();
    return scrollable ? scrollable.scrollTop : 0;
  }

  setScrollTop(value: number) {
    const scrollable = this.getScrollable();
    if (scrollable) {
      scrollable.scrollTop = value;
    }
  }

  scrollShouldBeIgnored(e: SyntheticEvent): boolean {
    return e.target !== this.getScrollable();
  }

  buildScrollableStyle(
    containerHeight: number,
    scrollableStyle: CSSStyle
  ): CSSStyle {
    return Object.assign(
      {},
      {
        height: containerHeight,
        overflowX: 'hidden',
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch'
      },
      scrollableStyle
    );
  }
}

export default ScrollUtils;
