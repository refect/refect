import refect, { refectLocal } from 'react-refect';
import { set, get } from 'refect/utils';
import React from 'react';
import Picker from './Picker';

function tasks(actions, effects) {
  return {
    changeUserId(userId) {
      effects.fetch(`https://api.github.com/search/users?q=${userId}`, {}, 'user', { userId });
    }
  };
}

function reducer(state) {
  return {
    onFetchPending(field, meta) {
      return {
        ...state,
        [field]: {
          ...(state[field] || {}),
          userId: meta.userId,
        },
      };
    },
    onFetchFulfilled(field, data) {
      return set(state, `${field}.data`, data.items.map(item => {
        return {
          ...item,
          text: item.login,
          value: item.login,
        };
      }));
    },
    selectUser(login) {
      const data = get(state, 'user.data');

      return set(state, 'selectedUser', data.find(user => user.login === login));
    },
  };
}

const initialState = {
  user: {
    userId: '',
    data: [],
    isLoading: false,
    hasError: false,
  },
  selectedUser: null,
};

function UserPicker({ actions, selectedUser, user }) {
  const { userId, data, isLoading, hasError } = user;

  return (
    <div className="user-picker">
      user picker:
      <Picker
        value={userId}
        data={data}
        onChange={actions.changeUserId}
        onSelect={actions.selectUser}
      />
    </div>
  );
}

export default refect({
  view: UserPicker,
  initialState,
  tasks,
  reducer,
  defaultNamespace: 'userPicker',
});
