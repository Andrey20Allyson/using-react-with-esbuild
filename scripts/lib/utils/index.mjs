/**@type {import('../types').DebounceType} */
export function debounce(func, delay) {
  let args = [];
  let called = false;

  function callFunc() {
    func(...args);
    called = false;
  }

  function outFunc(...newArgs) {
    if (called) {
      args = newArgs;
    } else {
      called = true;
      args = newArgs;
      setTimeout(callFunc, delay);
    }
  };

  return outFunc;
}