import assert from 'assert';
import { getActionType, check, map, is, reduce,
  get, set, update, traverse, parseActionType,
  values, deepBindActions, noOp } from '../../src/utils';

describe('utils', () => {
  it('getActionType', () => {
    assert.strictEqual(getActionType('actionA'), 'actionA');
    assert.strictEqual(getActionType('actionA', 'pageA'), 'pageA/actionA');
    assert.strictEqual(getActionType('actionA', 'pageA.cardA'), 'pageA/cardA/actionA');
  });

  it('parseActionType', () => {
    const actionType = 'pageA/cardB/changeData';
    const { namespace, name } = parseActionType(actionType);

    assert.strictEqual(namespace, 'pageA.cardB');
    assert.strictEqual(name, 'changeData');
  });

  it('check', () => {
    try {
      check(true, 'safe');
    } catch (e) {
      // it shouldn't throw an error
      assert.strictEqual(true, false);
    }

    try {
      check(false, 'unsafe');
    } catch (e) {
      assert.strictEqual(e.message, 'unsafe');
    }
  });

  it('is', () => {
    assert.strictEqual(is.func({}), false);
    assert.strictEqual(is.object(() => {}), false);
    assert.strictEqual(is.object([]), false);
    assert.strictEqual(is.undef(undefined), true);
    assert.strictEqual(is.func(() => {}), true);
    assert.strictEqual(is.string(''), true);
    assert.strictEqual(is.number(0), true);
    assert.strictEqual(is.object({}), true);
    assert.strictEqual(is.func(() => {}), true);
    assert.strictEqual(is.func(noOp), true);
    assert.strictEqual(is.array([]), true);
  });

  it('map', () => {
    const obj = { a: 1, b: 2 };
    const newObj = map(obj, el => el * 2);

    assert.strictEqual(newObj.a, 2);
    assert.strictEqual(newObj.b, 4);
  });

  it('get & set', () => {
    let obj = set({}, 'a.b', 'c');

    assert.strictEqual(obj.a.b, 'c');
    assert.strictEqual(get(obj, 'a.b'), 'c');

    obj = set(obj, 'aa', 'bb');
    assert.strictEqual(get(obj, 'aa'), 'bb');
  });

  it('update', () => {
    const obj = {
      a: { aa: 1 },
    };
    const newObj = update(obj, 'a.aa', el => el * 2);

    assert.strictEqual(newObj.a.aa, 2);
  });

  it('deepBindActions', () => {
    const action = type => ({ type });

    const actions = {
      a: {
        aa: {
          aaa: () => action('aaa'),
        },
        ab: () => action('ab'),
      },
      b: () => action('b'),
    };
    const dispatch = (actn) => actn.type;
    const boundActions = deepBindActions(actions, dispatch);

    assert.strictEqual(boundActions.b(), 'b');
    assert.strictEqual(boundActions.a.ab(), 'ab');
    assert.strictEqual(boundActions.a.aa.aaa(), 'aaa');
  });
});
