import '@babel/polyfill';
import { render } from 'react-dom';
import React from 'react';
import createRefectSagaMiddleware from 'refect-saga-middleware';

import DataCardRefect from './DataCard';
import { refectLocal } from 'react-refect';

import { sagaCustom } from '../custom';

const LocalDataCard = refectLocal(DataCardRefect);

render(
  <LocalDataCard
    storeConfig={{ custom: sagaCustom, createTaskMiddleware: createRefectSagaMiddleware }}
    title="内部 store follower 搜索组件"
  />, document.getElementById('app'));
