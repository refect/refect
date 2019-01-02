import { get, set, check, parseActionType, identity, omit } from '../utils';
import { parseRefectActions, parseRefectReducer } from './parseRefect';

export default function createRefectEnhancer(rootPutinReducers) {
  return function refectEnhancer(createStore) {
    return (reducer, initialState, enhancer) => {
      let currentReducer = reducer;
      const store = createStore(currentReducer, initialState, enhancer);
      let actions = {};
      let uuids = {};

      function replaceReducer(nextReducer) {
        store.replaceReducer(nextReducer);
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
        if (!namespace) {
          actions = subActions;

          return;
        }

        check(!get(actions, namespace),
          `enhancer/updateActions: actions in ${namespace} has existed`);

        actions = set(actions, namespace, subActions);
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
        },
        getRootPutinReducers() {
          return rootPutinReducers;
        },
      };
    };
  };
}
