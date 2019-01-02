import { get, getActionType, is, check, map, deepBindActions } from '../utils';
import { parseTasksActions } from './parseRefect';

export function isActionCreator(actionCreator) {
  return actionCreator && is.func(actionCreator) && actionCreator.type;
}

export function defaultMatcher(action, pattern) {
  if (isActionCreator(pattern)) {
    return pattern.type === action.type;
  }

  if (is.func(pattern)) {
    return pattern(action);
  }

  if (is.string(pattern)) {
    return pattern === action.type;
  }

  if (is.array(pattern)) {
    return pattern.some(el => defaultMatcher(action, el));
  }

  return false;
}

export function defaultWorker(task, ...args) {
  check(is.func(task), 'task in defaultWorker should be a function');

  return task(...args);
}

function wrapPattern(pattern, namespace) {
  // watch pattern should auto support namespace

  if (is.string(pattern)) {
    return getActionType(pattern, namespace);
  }

  if (is.array(pattern)) {
    return pattern.map(subPattern => wrapPattern(subPattern, namespace));
  }

  return pattern;
}

function createTaskMiddleware(rootEffectors, matcher = defaultMatcher, worker = defaultWorker) {
  const listeners = [];
  let effectsStore = null;

  const middleware = store => {
    if (!effectsStore) {
      effectsStore = store;
    }

    return next => action => {
      const result = next(action);

      listeners.forEach(listener => {
        listener(action);
      });

      return result;
    };
  };

  function subscribe(pattern, task, ...args) {
    function listener(action) {
      if (matcher(action, pattern)) {
        const { payload } = action;

        check(is.undef(payload) || is.array(payload), 'action in worker is not a refect action!');

        worker(task, ...args, ...(payload || []));
      }
    }
    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);

      if (index >= 0) {
        listeners.splice(index, 1);
      }
    };
  }

  function getStore() {
    return effectsStore;
  }

  function getEffects(namespace, getActions) {
    return {
      get(path) {
        const store = getStore();

        check(store, 'refect-thunk middleware not registerred yet!');

        const state = store.getState();

        if (!path) {
          return get(state, namespace);
        }

        check(is.string(path) || is.number(path), 'path should be a stirng or number');

        return get(state, `${namespace}.${path}`);
      },
      dispatch(action, ...args) {
        return getStore().dispatch(action, ...args);
      },
      put(pattern, ...args) {
        const actions = getActions();
        const action = get(actions, pattern);

        if (!action || !action.type) {
          throw new Error('cannot find action in pattern ' + pattern);
        }

        return getStore().dispatch(action(...args));
      },
      watch(pattern, task, ...args) {
        check(is.func(task), 'task in watch should be an function');

        return subscribe(wrapPattern(pattern, namespace), task, ...args);
      },
      done(actionCreator, ...args) {
        check(actionCreator && is.func(actionCreator.task),
          'actionCreator should be a refect actionCreator');

        return worker(actionCreator.task, ...args);
      },
    };
  }

  middleware.runTask = ({ refectTasks, namespace, getActions, effectors }) => {
    const taskActionCreators = parseTasksActions(refectTasks, namespace);
    const coreEffects = getEffects(namespace, getActions);
    const currEffectors = [...rootEffectors, ...effectors];

    const customEffects = currEffectors.reduce((result, effector) => {
      const currPlugins = effector({ getActions, namespace, getStore });

      return {
        ...result,
        ...currPlugins,
      };
    }, {});

    const finalEffects = {
      ...coreEffects,
      ...customEffects,
    };

    return map(taskActionCreators, (actionCreator, actionName) => {
      const finalTask = (...args) => {
        const actions = getActions();
        const dispatch = getStore().dispatch;
        const bundActions = deepBindActions(actions, dispatch);
        const taskMap = refectTasks(bundActions, finalEffects, coreEffects, customEffects);
        const task = taskMap[actionName];

        return task(...args);
      };

      subscribe(actionCreator.type, finalTask);

      actionCreator.task = finalTask;

      return actionCreator;
    });
  };

  return middleware;
}

export default createTaskMiddleware;
