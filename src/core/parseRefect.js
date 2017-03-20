import { parseActionType, getActionType, map, check, is,
  defaultRefectTasks, noOp, get, assign, getManager } from 'utils';

export function parseTasksActions(refectTasks, namespace = '') {
  const tasks = refectTasks({}, {});

  const actionCreators = map(tasks, (task, taskName) => {
    const type = getActionType(taskName, namespace);

    function actionCreator(...args) {
      if (task.length) {
        return { type, payload: args };
      }

      return {
        type,
      };
    }

    actionCreator.type = type;
    return actionCreator;
  });

  return actionCreators;
}

export function parseRefectActions(refectReducer, namespace = '') {
  const mockState = {};
  const refectReducerMap = refectReducer(mockState, getManager(mockState));

  return map(refectReducerMap, (reducer, actionCreatorName) => {
    const type = getActionType(actionCreatorName, namespace);

    function actionCreator(...args) {
      if (reducer.length) {
        return {
          type,
          payload: args,
        };
      }

      return { type };
    }

    actionCreator.type = type;

    return actionCreator;
  });
}

export function parseRefectReducer(refectReducer, namespace, initialState) {
  return function reducer(state = initialState, action) {
    const manager = getManager(state);
    const freshRefectReducerMap = refectReducer(state, manager);
    const { name: funcName, namespace: actionNamespace } = parseActionType(action.type);

    if (actionNamespace === namespace && funcName && get(freshRefectReducerMap, funcName)) {
      const { payload } = action;
      const currentReducer = get(freshRefectReducerMap, funcName);
      check(is.func(currentReducer), 'currentReducer is not a function');

      if (payload) {
        return currentReducer(...payload);
      }

      return currentReducer();
    }

    return state;
  };
}
