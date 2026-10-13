test('Google login normalizes the configured backend origin and keeps the production route', async () => {
  const previousUrl = process.env.REACT_APP_API_URL;
  const previousFetch = global.fetch;
  process.env.REACT_APP_API_URL = ' https://codeclash-deployment-check.onrender.com/// ';
  global.fetch = jest.fn().mockResolvedValue({ ok: true,
    headers: { get: () => 'application/json' }, json: async () => ({ user: { id: 'player' } }) });
  try {
    let service;
    jest.isolateModules(() => { service = require('./authService').default; });
    const result = await service.googleAuth('synthetic-google-token');
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://codeclash-deployment-check.onrender.com/api/auth/google',
      expect.objectContaining({ method: 'POST' }));
  } finally {
    if (previousUrl === undefined) delete process.env.REACT_APP_API_URL;
    else process.env.REACT_APP_API_URL = previousUrl;
    global.fetch = previousFetch;
  }
});
