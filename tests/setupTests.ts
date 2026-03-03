import '@testing-library/jest-dom';

expect.extend({
  toBeVisibleWithin(el: HTMLElement, ms: number): { pass: boolean; message: () => string } {
    const pass = el.offsetParent !== null;
    return {
      pass,
      message: () => `expected element to${pass ? ' not' : ''} be visible within ${ms}ms`,
    };
  },
});
