import {
  parseTasksActions, parseRefectActions, parseRefectReducer,
} from '../../../src/core/parseRefect';
import assert from 'assert';

function refectTasks(actions, effects) {
  return {
    load(userId) {},
    postData() {}
  };
}

function refectReducer(state) {
  return {
    changeData(data) {
      return {
        ...state,
        data,
      };
    },
    showDialog() {
      return {
        ...state,
        shouldShowDialog: true,
      };
    },
  };
}

describe('parseRefect', () => {
  it('parseTasksActions', () => {
    const taskActions = parseTasksActions(refectTasks, 'pageA.cardB');

    assert.strictEqual(!!taskActions.load().payload, true);
    assert.strictEqual(taskActions.load().type, 'pageA/cardB/load');
    assert.strictEqual(taskActions.postData().type, 'pageA/cardB/postData');
    assert.strictEqual(!!taskActions.postData().payload, false);
  });

  it('parseRefectActions', () => {
    const actions = parseRefectActions(refectReducer, 'pageA.cardB');

    assert.strictEqual(!!actions.changeData().payload, true);
    assert.strictEqual(actions.changeData().type, 'pageA/cardB/changeData');
    assert.strictEqual(actions.showDialog().type, 'pageA/cardB/showDialog');
    assert.strictEqual(!!actions.showDialog().payload, false);
  });

  it('parseRefectReducer', () => {
    const initialState = {
      shouldShowDialog: false,
      data: [],
    };
    const actions = parseRefectActions(refectReducer, 'pageA.cardB');
    const reducer = parseRefectReducer(refectReducer, 'pageA.cardB', initialState);

    const newState = reducer(initialState, actions.changeData([1, 2, 3]));
    assert.strictEqual(newState.data.length, 3);
    assert.strictEqual(newState.shouldShowDialog, false);

    const finalState = reducer(newState, actions.showDialog());
    assert.strictEqual(finalState.data.length, 3);
    assert.strictEqual(finalState.shouldShowDialog, true);
  });
});
