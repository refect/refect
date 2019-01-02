
import { createStore, applyMiddleware, compose } from 'redux';
import createLogger from 'redux-logger';

import { createRefectStore } from 'refect';
import custom from './custom';

const logger = createLogger(); //, window.devToolsExtension()
const configureStore = compose(applyMiddleware(logger))(createStore);

export const storeConfig = {
  createStore: configureStore,
  custom,
};

const store = createRefectStore(storeConfig);

export default store;
