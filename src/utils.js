import { curry, placeholder } from './curry';

export {
  curry,
  placeholder,
};

export function check(isPredicated, error) {
  if (!isPredicated) {
    throw new Error(error);
  }
}

export const identity = el => el;

export const is = {
  func(origin) {
    return typeof origin === 'function';
  },
  array(origin) {
    return Array.isArray(origin);
  },
  number(origin) {
    return typeof origin === 'number';
  },
  object(origin) {
    return !!(origin && !is.array(origin) && typeof origin === 'object');
  },
  undef(origin) {
    return origin === undefined;
  },
  string(origin) {
    return typeof origin === 'string';
  }
};

// object mapper
export function map(data, mapper) {
  check(is.object(data), 'refect/utils/map: data should be an plain object');
  check(is.func(mapper), 'refect/utils/map: mapper should be a function');

  return Object.keys(data).reduce((result, key) => {
    const value = data[key];

    return {
      ...result,
      [key]: mapper(value, key),
    };
  }, {});
}

export function get(data, path) {
  check(is.string(path) || is.number(path), 'refect/utils/get: path should be string or number');

  if (!path) {
    return data;
  }

  check(is.object(data) || is.array(data) || is.undef(data),
    'refect/utils/get: data is invalid');

  if (!data) {
    return undefined;
  }

  if (path && path.indexOf('.') < 0) {
    return data[path];
  }

  const [firstPos, ...paths] = path.split('.');

  return get(data[firstPos], paths.join('.'));
}

function isNumberStr(str) {
  if (str === '') {
    return false;
  }

  if (is.number(str)) {
    return Number.isInteger(str);
  }

  return str.split('').every(ch => ch >= '0' && ch <= '9');
}

export function set(data, path, value) {
  check(is.object(data) || is.array(data) || is.undef(data),
    'refect/utils/set: data is invalid');
  check(is.string(path) || Number.isInteger(path),
    'refect/utils/set: path should be string or number');

  if (path === '') {
    return value;
  }

  if (is.undef(data)) {
    data = {};
  }

  if (Number.isInteger(path) || path.indexOf('.') < 0) {
    // array
    if (is.array(data) || (is.undef(data) && isNumberStr(path))) {
      check(isNumberStr(path), 'set an array with a key of string!');

      const index = Number(path);
      const validData = data || [];

      check(index <= validData.length, 'array length smaller than index');

      if (index === validData.length) {
        return validData.concat([value]);
      }

      return validData.slice(0, index).concat([value]).concat(validData.slice(index + 1));
    }

    // object
    return {
      ...data,
      [path]: value,
    };
  }

  const [fpath, ...paths] = path.split('.');

  const cData = data[fpath];
  const fpathValue = set(cData, paths.join('.'), value);

  return set(data, fpath, fpathValue);
}

export function update(data, path, updator) {
  check(is.object(data) || is.array(data) || is.undef(data),
    'refect/utils/update: data is invalid');
  check(is.string(path) || is.number(path),
    'refect/utils/update: path should be string or number');

  const value = get(data, path);
  const newValue = updator(value);

  return set(data, path, newValue);
}

export function omit(data, path) {
  check(is.string(path), 'refect/utils/omit: path is invalid');

  if (is.undef(data)) {
    return data;
  }

  if (!path) {
    return data;
  }

  if (path.indexOf('.') < 0) {
    const { [path]: pathData, ...rest } = data;

    return rest;
  }

  const purePath = path.slice(0, path.lastIndexOf('.'));
  const lastPath = path.slice(path.lastIndexOf('.') + 1);
  const pureData = get(data, purePath);

  if (!pureData) {
    return data;
  }

  return set(data, purePath, omit(pureData, lastPath));
}

// traverse leaf node of an object
export function traverse(data, visitor, path = '') {
  check(is.func(visitor), 'refect/utils/traverse: visitor should be a function');

  if (!is.object(data)) {
    return visitor(data, path);
  }

  return map(data, (currData, dataPath) => {
    const currPath = path ? `${path}.${dataPath}` : dataPath;

    return traverse(currData, visitor, currPath);
  });
}

const separator = '/';

export function parseActionType(actionType) {
  check(is.string(actionType), 'refect/utils/parseActionType: actionType should be a string');

  const actionTypePath = actionType.replace(/\//g, '.');
  const namespaceEndPos = actionTypePath.lastIndexOf('.');

  if (namespaceEndPos === -1) {
    return {
      namespace: '',
      name: actionType,
    };
  }

  const namespace = actionTypePath.slice(0, namespaceEndPos);
  const name = actionTypePath.slice(namespaceEndPos + 1);

  return { namespace, name };
}

export function getActionType(functionName, namespace) {
  return (namespace && namespace.split('.') || [])
    .concat(functionName.split('.'))
    .join('.')
    .replace(/\./g, separator);
}

export const defaultRefectTasks = () => ({});
export const noOp = () => {};

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function assign(source, target) {
  Object.keys(source).forEach(key => {
    if (hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  });

  return target;
}

export function deepBindActions(actions, dispatch) {
  return traverse(actions, (action) => {
    check(is.func(action),
      'refect/utils/deepBindActions: action ' + action + 'is not a function');
    const boundAction = (...args) => dispatch(action(...args));

    return assign(action, boundAction);
  });
}

export function getManager(state) {
  function setState(...args) {
    const [pathOrMutation, value] = args;

    if (is.object(pathOrMutation)) {
      return { ...state, ...pathOrMutation };
    }

    if (args.length === 2) {
      return set(state, pathOrMutation, value);
    }

    if (args.length === 1) {
      return val => set(state, pathOrMutation, val);
    }

    throw new Error('manager.setState: no params or params too much');
  }

  function updateState(path, updator) {
    return update(state, path, updator);
  }

  function getState(path) {
    return get(state, path);
  }

  return {
    setState,
    getState,
    updateState,
  };
}

