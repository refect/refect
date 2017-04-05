import {
  parseRefectActions, parseRefectReducer, combineRefectReducer, parseRefectEffects,
} from './parseRefect';

import { get, check, deepBindActions, is, defaultRefectTasks, getManager } from '../utils';

const defaultEffects = [];
const defaultRefectReducer = defaultRefectTasks;

export default function configureRefect({ options, namespace, store, uuid }) {
  const { reducer: refectReducer = defaultRefectReducer, tasks: refectTasks = defaultRefectTasks,
    initialState, effects = defaultEffects } = options;

  function getActions() {
    return store.getActions(namespace);
  }

  const currActions = getActions();
  const hasActionExists = currActions && is.object(currActions) &&
    Object.keys(currActions).length;

  const hasNamespaceExists = !!get(store.getState(), namespace);

  if (hasActionExists || hasNamespaceExists) {
    const savedUUID = store.getUUID(namespace);
    const errMsg = 'You can not use the same ' +
      `namespace '${namespace}' in different refect component, please set a different one.`;

    check(savedUUID === uuid, errMsg);
  } else {
    const rootPutinReducers = store.getRootPutinReducers();
    const { putinReducers, effectors } = parseRefectEffects(effects);

    const reducers = [...rootPutinReducers, ...putinReducers, refectReducer];
    const finalRefectReducer = combineRefectReducer(...reducers);
    const reducerActionCreators = parseRefectActions(finalRefectReducer, namespace);
    const reducer = parseRefectReducer(finalRefectReducer, namespace, initialState);

    check(store.runTask, 'store should use a task middleware!');
    const taskActionCreators = store.runTask({
      refectTasks, namespace, getActions,
      effectors,
    });

    const actionCreators = {
      ...reducerActionCreators,
      ...taskActionCreators,
    };

    check(store.updateRefect, 'store should use refect enhancer!');

    store.updateRefect({
      reducer,
      actions: actionCreators,
      uuid,
    }, namespace);
  }

  return deepBindActions(getActions(), store.dispatch);
}
