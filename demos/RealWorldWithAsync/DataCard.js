import refect, { refectLocal } from 'react-refect';
import React from 'react';
import './DataCard.scss';

function tasks(actions, effects) {
  return {
    async changeUserId(userId) {
      const data = await effects.fetch(`https://api.github.com/users/${userId}/followers`, {}, 'user', { userId });
      console.log('data received in async task', data);

      return data;
    },
  };
}

function reducer(state) {
  return {
    changeUserId(userId) {
      return {
        ...state,
        userId,
      };
    },
  };
}

const initialState = {
  user: {
    data: {},
    isLoading: false,
    hasError: false,
  }
};

function fmtE(fn) {
  return function (e) {
    return fn(e.target.value);
  };
}

function DataCard({ actions, user, title, userId }) {
  const { data, isLoading, hasError } = user;

  return (
    <div>
      <h1>{title}</h1>
      <input
        value={userId}
        onChange={fmtE(actions.changeUserId)}
        placeholder="请输入 Github ID，如 camsong"
      />
      <div className="message">
        {isLoading && <div className="spinner"></div>}
        {hasError && <p className="error"> 接口受限，歇会重试 :( </p>}
      </div>
      <ul>
        {Array.isArray(data) && data.map(follower => {
          const { id, avatar_url: avatarUrl, html_url: htmlUrl, login } = follower;

          return (
            <li key={id}>
              <a href={htmlUrl} target="_blank">
                <img alt="avatar" src={avatarUrl} style={{ width: 100, height: 100 }}></img>
                <p className="userId" title={login}>{login}</p>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const DataCardRefect = {
  view: DataCard,
  initialState,
  tasks,
  reducer,
};

export default DataCardRefect;

