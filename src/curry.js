export const placeholder = {
  '@@functional/placeholder': true,
};

const isPlaceHolder = val => val === placeholder;

const curry0 = (fn) => {
  return function _curried(...args) {
    if (args.length === 0 || args.length === 1 && isPlaceHolder(args[0])) {
      return _curried;
    }

    return fn(...args);
  };
};

const curryN = (n, fn) => {
  if (n === 1) {
    return fn;
  }

  return curry0((...args) => {
    const argsLength = args.filter(arg => arg !== placeholder).length;

    if (argsLength >= n) {
      return fn(...args);
    }

    return curryN(n - argsLength, curry0((...restArgs) => {
      const newArgs = args.map(arg => {
        return isPlaceHolder(arg) ? restArgs.shift() : arg;
      });

      return fn(...newArgs, ...restArgs);
    }));
  });
};

export const curry = fn => {
  return curryN(fn.length, fn);
};
