import { render } from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

import store, { storeConfig } from '../createStore';

import DataCardRefect from './DataCard';
import refect, { refectLocal } from 'react-refect';

const DataCard = refect(DataCardRefect);
const LocalDataCard = refectLocal(DataCardRefect);

render((
  <div>
    <Provider store={store}>
      <div>
        <DataCard title="外部 store follower 搜索组件" />
        <DataCard title="外部 store follower 搜索组件1" namespace="reuse1" />
        <DataCard title="外部 store follower 搜索组件2" namespace="reuse2" />
      </div>
    </Provider>
  </div>
), document.getElementById('app'));

// render(
//   <LocalDataCard
//     storeConfig={storeConfig}
//     title="内部 store follower 搜索组件"
//   />, document.getElementById('app'));
