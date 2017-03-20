import 'babel-polyfill';
import { render } from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

import { storeConfig } from '../createStore';

import DataCardRefect from './DataCard';
import { refectLocal } from 'react-refect';

const LocalDataCard = refectLocal(DataCardRefect);

render(
  <LocalDataCard
    storeConfig={storeConfig}
    title="内部 store follower 搜索组件"
  />, document.getElementById('app'));
