export function debounce<T extends (...arg: any[]) => void>(inFunction: T, delay: number) {
  let args: any[] = [];
  let called = false;

  function callFunc() {
    inFunction(...args);
    called = false;
  }

  function handler(...newArgs: any[]) {
    if (called) {
      args = newArgs;
    } else {
      called = true;
      args = newArgs;
      setTimeout(callFunc, delay);
    }
  };

  return handler as T;
}