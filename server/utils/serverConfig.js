const { getJudge0ConfigStatus } = require('./judge0Helper');

function getServerConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  const errors = [];
  const port = Number(env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('PORT must be a valid TCP port.');

  let clientOrigin = (env.CLIENT_ORIGIN || (production ? '' : 'http://localhost:3000')).trim().replace(/\/+$/, '');
  try {
    const url = new URL(clientOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash ||
        (production && (url.protocol !== 'https:' || /^(localhost|127\.|\[::1\]|your[-_])/i.test(url.hostname)))) {
      throw new Error('Invalid origin');
    }
    clientOrigin = url.origin;
  } catch {
    errors.push('CLIENT_ORIGIN must be the frontend origin (HTTPS in production), without a path or credentials.');
  }

  const googleClientId = (env.GOOGLE_CLIENT_ID || '').trim();
  if (production) {
    if (!/^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(googleClientId)) {
      errors.push('GOOGLE_CLIENT_ID must be a real Google web client ID.');
    }
    const judge0 = getJudge0ConfigStatus(env);
    if (!judge0.configured) errors.push(`Judge0 configuration is missing or invalid: ${judge0.missing.join(', ')}.`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { port, clientOrigin, googleClientId };
}

module.exports = { getServerConfig };
