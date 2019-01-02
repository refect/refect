import createRefectEnhancer from './enhancer';
import createDefaultTaskMiddleware from './middleware';
import { compose, applyMiddleware, createStore } from 'redux';
import { combineRefectReducer, parseRefectEffects } from './parseRefect';
import { identity } from '../utils';

const defaultCustom = () => ({});
const noOp = () => {};

export default function createRefectStore(storeConfig = {}) {
  const { middlewares = [], enhancers = [], rootEffects = [],
    initReducers = identity, initialState, storeCreated = noOp,
    createTaskMiddleware = createDefaultTaskMiddleware } = storeConfig;

  const { effectors, putinReducers } = parseRefectEffects(rootEffects);

  const taskMiddleware = createTaskMiddleware(effectors);

  const finalCreateStore = compose(
    applyMiddleware(...middlewares, taskMiddleware),
    createRefectEnhancer(putinReducers),
    ...enhancers,
  )(createStore);

  const store = finalCreateStore(initReducers, initialState);

  store.runTask = taskMiddleware.runTask;
  storeCreated(store);

  return store;
}
