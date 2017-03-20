import assert from 'assert';
import createRefectEnhancer from '../../../src/core/enhancer';
import createRefectStore from '../../../src/core/createRefectStore';
import { parseRefectActions, parseRefectReducer } from '../../../src/core/parseRefect';

function customReducers(state) {
  return {
    changeData(data) {
      return {
        ...state,
        data,
      };
    },
  };
}

const custom = { customReducers };

const refectEnhancer = createRefectEnhancer(customReducers);
const store = createRefectStore({ custom });

function refectReducer(state) {
  return {
    showDialog() {
      return {
        ...state,
        shouldShowDialog: true,
      };
    },
    hideDialog() {
      return {
        ...state,
        shouldShowDialog: false,
      };
    },
  };
}

describe('enhancer', () => {
  it('updateRefect', () => {
    const initialState = {};

    const reducerActionCreators = parseRefectActions(refectReducer);
    const reducer = parseRefectReducer(refectReducer, '', initialState);

    store.updateRefect({
      reducer,
      actions: reducerActionCreators,
      uuid: Math.random(),
    });

    const actions = store.getActions();
    store.dispatch(actions.showDialog());
    assert.strictEqual(store.getState().shouldShowDialog, true);
    store.dispatch(actions.hideDialog());
    assert.strictEqual(store.getState().shouldShowDialog, false);
  });

  it('customReducers', () => {
    store.dispatch({ type: 'changeData', payload: [[1, 2, 3]] });
    assert.strictEqual(store.getState().data.length, 3);
    store.dispatch({ type: 'pageA/changeData', payload: [[1, 2, 3]] });
    assert.strictEqual(store.getState().pageA.data.length, 3);
  });
});
