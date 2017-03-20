import React from 'react';

function tasks(actions, effects) {
  return {
    changeUserId(userId) {
      effects.fetch(`https://api.github.com/users/${userId}/followers`, {}, 'user', { userId });
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
  };
}

const initialState = {
  user: {
    userId: '',
    data: {},
    isLoading: false,
    hasError: false,
  }
};

function DataCard({ actions, user, title }) {
  const { userId, data, isLoading, hasError } = user;

  function handleChagne(e) {
    actions.changeUserId(e.target.value);
  }

  return (
    <div>
      <h1>{title}</h1>
      <input
        value={userId}
        onChange={handleChagne}
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

