// Check public build settings before producing a bundle for Vercel.
function validateBuildEnv(env) {
  const errors = [];
  for (const name of ['REACT_APP_API_URL', 'REACT_APP_SOCKET_URL']) {
    try {
      const value = (env[name] || '').trim().replace(/\/+$/, '');
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password ||
          url.pathname !== '/' || url.search || url.hash ||
          /^(localhost|127\.|\[::1\]|your[-_])/i.test(url.hostname)) {
        throw new Error('Invalid origin');
      }
    } catch {
      errors.push(`${name} must be the HTTPS backend origin, without /api, query parameters, or credentials.`);
    }
  }
  if (!/^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(
    (env.REACT_APP_GOOGLE_CLIENT_ID || '').trim())) {
    errors.push('REACT_APP_GOOGLE_CLIENT_ID must be a real Google web client ID.');
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

if (require.main === module) {
  // Use CRA's normal production-file precedence; hosting environment values win.
  process.env.NODE_ENV = 'production';
  require('react-scripts/config/env');
  try {
    validateBuildEnv(process.env);
    console.log('Frontend production environment validation passed.');
  } catch (error) {
    console.error(`Frontend production configuration error:\n${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { validateBuildEnv };
