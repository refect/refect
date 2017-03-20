import { get, set, check, parseActionType, identity, omit } from 'utils';
import { parseRefectActions, parseRefectReducer } from './parseRefect';

function combineCustomReducer(reducer, customReducers) {
  return (state, action) => {
    const { namespace } = parseActionType(action.type);
    const customReducer = parseRefectReducer(customReducers, namespace);

    const nodeState = get(state, namespace);
    const newNodeState = customReducer(nodeState, action);

    if (newNodeState !== nodeState) {
      const newState = set(state, namespace, newNodeState);

      return reducer(newState, action);
    }

    return reducer(state, action);
  };
}

export default function createRefectEnhancer(customReducers) {
  return function refectEnhancer(createStore) {
    return (reducer, initialState, enhancer) => {
      let currentReducer = reducer;
      const store = createStore(currentReducer, initialState, enhancer);
      let actions = {};
      let uuids = {};

      store.replaceReducer(reducer, combineCustomReducer);

      function replaceReducer(nextReducer) {
        store.replaceReducer(combineCustomReducer(nextReducer, customReducers));

        currentReducer = nextReducer;
      }

      function updateUUID(uuid, namespace) {
        if (!namespace) {
          return;
        }

        uuids = set(uuids, namespace, {
          uuid,
        });
      }

      function updateReducer(reducerNode, namespace) {
        const prevReducer = currentReducer;

        function newReducer(state, action) {
          const nodeState = get(state, namespace);
          const restState = omit(state, namespace);

          const newState = prevReducer(restState, action);

          return set(newState, namespace, reducerNode(nodeState, action));
        }

        replaceReducer(newReducer);
      }

      function updateActions(subActions, namespace) {
        const customActions = parseRefectActions(customReducers, namespace);

        if (!namespace) {
          actions = {
            ...customActions,
            ...subActions,
          };

          return;
        }

        check(!get(actions, namespace),
          `enhancer/updateActions: actions in ${namespace} has existed`);

        actions = set(actions, namespace, {
          ...customActions,
          ...subActions,
        });
      }

      return {
        ...store,
        replaceReducer,
        updateRefect(refect, namespace = '') {
          updateReducer(refect.reducer, namespace);
          updateActions(refect.actions, namespace);
          updateUUID(refect.uuid, namespace);
        },
        getActions(namespace = '') {
          return get(actions, namespace) || {};
        },
        getUUID(namespace = '') {
          return get(uuids, `${namespace}.uuid`) || '';
        }
      };
    };
  };
}
