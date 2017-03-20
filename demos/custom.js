function customEffects(getStore, namespace, getActions) {
  return {
    fetch(url, options, field, meta) {
      const actions = getActions();
      const dispatch = getStore().dispatch;

      dispatch(actions.onFetchPending(field, meta));

      return new Promise((resolve, reject) => {
        fetch(url, options).then(res => res.json())
          .then(data => {
            if (data.message) {
              dispatch(actions.onFetchRejected(field, data, meta));
              reject(data);
            } else {
              dispatch(actions.onFetchFulfilled(field, data, meta));
              resolve(data);
            }
          });
      });
    }
  };
}

import { put } from 'redux-saga/effects';

function customSagaEffects(namespace, getActions) {
  return {
    *fetch(url, options, field, meta) {
      const actions = getActions();

      yield put(actions.onFetchPending(field, meta));

      const data = yield fetch(url, options).then(res => res.json());

      if (data.message) {
        yield put(actions.onFetchRejected(field, data, meta));
        return { error: data };
      }

      yield put(actions.onFetchFulfilled(field, data, meta));
      return { data };
    }
  };
}

function customReducers(state) {
  return {
    onFetchPending(field) {
      return {
        ...state,
        [field]: {
          ...(state[field] || {}),
          isLoading: true,
          hasError: false,
        },
      };
    },
    onFetchFulfilled(field, data) {
      return {
        ...state,
        [field]: {
          ...(state[field] || {}),
          isLoading: false,
          hasError: false,
          data,
        },
      };
    },
    onFetchRejected(field, err) {
      return {
        ...state,
        [field]: {
          ...(state[field] || {}),
          isLoading: false,
          hasError: true,
          message: err.message,
        },
      };
    },
  };
}

const custom = { customEffects, customReducers };

export const sagaCustom = { customEffects: customSagaEffects, customReducers };
export default custom;
