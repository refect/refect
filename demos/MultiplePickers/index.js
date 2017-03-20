import 'antd/dist/antd.css';
import './index.scss';

import { render } from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import UserPicker from './UserPicker';
import RepoPicker from './RepoPicker';

import { refectLocal } from 'react-refect';
import { storeConfig } from '../createStore';

function tasks(actions, effects) {
  return {
    mount() {
      effects.watch('userPicker.selectUser', (userId) => {
        actions.repoPicker.changeUserId(userId);
      });
    },
  };
}

function renderRepo(repo) {
  if (!repo) {
    return null;
  }

  return (
    <div>
      <div className="item">name: {repo.name}</div>
      <div className="item">size: {repo.size}</div>
      <div className="item">stargazers_count: {repo.stargazers_count}</div>
    </div>
  );
}

function Pickers(props) {
  const { userPicker, repoPicker } = props;
  const selectedRepo = repoPicker && repoPicker.selectedRepo;
  const selectedUser = userPicker && userPicker.selectedUser;

  return (
    <div>
      <UserPicker />
      <RepoPicker />
      <div className="detail">
        repo detail:
        {renderRepo(selectedRepo)}
      </div>
    </div>
  );
}

const Root = refectLocal({
  view: Pickers,
  tasks,
  defaultNamespace: 'root',
});

render(<Root storeConfig={storeConfig} />, document.getElementById('app'));
