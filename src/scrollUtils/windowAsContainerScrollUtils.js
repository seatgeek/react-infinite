/* @flow */

import ScrollUtils from './scrollUtils';

class WindowAsContainerScrollUtils extends ScrollUtils {
  window: window;

  constructor(
    loadingSpinner: HTMLDivElement,
    window: window,
    infiniteHandleScroll: (e: SyntheticEvent) => void
  ) {
    super(loadingSpinner, () => null, infiniteHandleScroll);
    this.window = window;
  }

  subscribeToScrollListener() {
    this.window.addEventListener('scroll', this.infiniteHandleScroll);
  }

  unsubscribeFromScrollListener() {
    this.window.removeEventListener('scroll', this.infiniteHandleScroll);
  }

  nodeScrollListener = (e: SyntheticEvent) => {};

  getScrollTop(): number {
    return this.window.pageYOffset;
  }

  setScrollTop(value: number) {
    this.window.scroll(this.window.pageXOffset, value);
  }

  scrollShouldBeIgnored(e: SyntheticEvent): boolean {
    return false;
  }

  buildScrollableStyle(
    containerHeight: number,
    scrollableStyle: CSSStyle
  ): CSSStyle {
    return {};
  }
}

export default WindowAsContainerScrollUtils;
