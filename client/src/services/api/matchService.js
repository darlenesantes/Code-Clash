const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/$/, '');

async function request(path, options) {
  const response = await fetch(`${baseURL}/api/game/${path}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to contact the match server.');
  return data;
}

const matchService = {
  getOptions: () => request('options'),
  createRoom: (preferences) => request('rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences)
  })
};

export default matchService;
