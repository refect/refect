import refect, { refectLocal } from 'react-refect';
import { set, get } from 'refect/utils';
import React from 'react';
import Picker from './Picker';

function tasks(actions, effects) {
  return {
    changeRepoId(name) {
      const userId = effects.get('userId');

      effects.fetch(`https://api.github.com/search/repositories?q=${name}+user:${userId}`, {}, 'repo', { name });
    }
  };
}

function reducer(state, manager) {
  return {
    changeUserId(userId) {
      return manager.setState({ userId });
    },
    onFetchPending(field, meta) {
      return set(state, `${field}.name`, meta.name);
    },
    onFetchFulfilled(field, data) {
      return set(state, `${field}.data`, data.items.map(item => {
        return {
          ...item,
          text: item.name,
          value: item.name,
        };
      }));
    },
    selectRepo(name) {
      const data = get(state, 'repo.data');

      return set(state, 'selectedRepo', data.find(repo => repo.name === name));
    },
  };
}

const initialState = {
  userId: '',
  repo: {
    name: '',
    data: [],
    isLoading: false,
    hasError: false,
  },
  selectedRepo: null,
};

function RepoPicker({ actions, repo, userId, selectedRepo }) {
  const { name, data, isLoading, hasError } = repo;

  return (
    <div className="repo-picker">
      repo picker:
      {
        userId ? <Picker
          value={name}
          data={data}
          onChange={actions.changeRepoId}
          onSelect={actions.selectRepo}
        /> : <span>please select user first!</span>
      }
    </div>
  );
}

export default refect({
  view: RepoPicker,
  initialState,
  tasks,
  reducer,
  defaultNamespace: 'repoPicker',
});
