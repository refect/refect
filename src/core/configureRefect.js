import { parseRefectActions, parseRefectReducer } from './parseRefect';
import { get, check, deepBindActions, is, defaultRefectTasks, getManager } from '../utils';

function combineRefectReducer(...refectReducers) {
  return (state, manager) => {
    const refectReducerMaps = refectReducers.map(
      refectReducer => refectReducer(state, manager));

    return refectReducerMaps.reduce((finalMap, refectReducerMap) => {
      return {
        ...finalMap,
        ...refectReducerMap,
      };
    }, {});
  };
}

const defaultRefectReducer = defaultRefectTasks;
const defaultPlugins = defaultRefectTasks;
const defaultEffects = [];

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
    const putinReducers = effects.map(effect => effect.putinReducer || defaultRefectReducer);
    const finalRefectReducer = combineRefectReducer(refectReducer, ...putinReducers);
    const reducerActionCreators = parseRefectActions(finalRefectReducer, namespace);
    const reducer = parseRefectReducer(finalRefectReducer, namespace, initialState);

    check(store.runTask, 'store should use a task middleware!');
    const taskActionCreators = store.runTask({
      refectTasks, namespace, getActions,
      effects: effects.map(effect => effect.plugin || defaultRefectTasks),
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
