import createRefectEnhancer from './enhancer';
import createDefaultTaskMiddleware from './middleware';
import { compose, applyMiddleware, createStore as originCreateStore } from 'redux';
import { identity } from 'utils';

const defaultCustom = () => ({});

export default function createRefectStore(storeConfig = {}) {
  const { createStore = originCreateStore, custom = {}, reducers = identity, initialState,
    createTaskMiddleware = createDefaultTaskMiddleware } = storeConfig;
  const { customReducers = defaultCustom, customEffects = defaultCustom } = custom;
  const taskMiddleware = createTaskMiddleware(customEffects);

  const finalCreateStore = compose(
    applyMiddleware(taskMiddleware),
    createRefectEnhancer(customReducers),
  )(createStore);

  const store = finalCreateStore(reducers, initialState);

  store.runTask = taskMiddleware.runTask;
  return store;
}
