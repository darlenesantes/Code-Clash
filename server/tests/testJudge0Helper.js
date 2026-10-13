const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function helperWithTransport(post) {
  const moduleObject = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../utils/judge0Helper.js'), 'utf8'), {
    module: moduleObject, Buffer, URL,
    process: { env: { JUDGE0_API_URL: 'https://judge.example/submissions',
      JUDGE0_API_KEY: 'test-key', JUDGE0_API_HOST: 'judge.example' } },
    require: (name) => {
      assert.equal(name, 'axios');
      return { post };
    }
  });
  return moduleObject.exports;
}

test('Judge0 helper sends encoded code and stdin, then decodes response exactly once', async () => {
  const encode = (text) => Buffer.from(text).toString('base64');
  let requests = 0;
  const helper = helperWithTransport(async (url, payload, options) => {
    requests++;
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('base64_encoded'), 'true');
    assert.equal(parsed.searchParams.get('wait'), 'true');
    assert.equal(Buffer.from(payload.source_code, 'base64').toString(), 'print(123)');
    assert.equal(Buffer.from(payload.stdin, 'base64').toString(), 'input');
    assert.equal(payload.language_id, 71);
    assert.equal(options.headers['X-RapidAPI-Key'], 'test-key');
    return { data: { status: { id: 3 }, stdout: encode('123\n'), stderr: encode('stderr'),
      compile_output: encode('compile'), message: encode('message') } };
  });
  const result = await helper.runJudge0('print(123)', 71, 'input');
  assert.equal(requests, 1);
  assert.equal(result.stdout, '123\n');
  assert.equal(result.stderr, 'stderr');
  assert.equal(result.compile_output, 'compile');
  assert.equal(result.message, 'message');
});

test('Judge0 helper handles empty response fields and reports request errors without credentials', async () => {
  const empty = await helperWithTransport(async () => ({ data: { status: { id: 6 } } })).runJudge0('code', 63);
  assert.equal(empty.stdout, '');
  assert.equal(empty.compile_output, '');
  const error = new Error('Unauthorized');
  error.response = { data: { message: 'Unauthorized' } };
  error.config = { headers: { 'X-RapidAPI-Key': 'test-key' }, source_code: 'private-code' };
  await assert.rejects(helperWithTransport(async () => { throw error; }).runJudge0('code', 63), (caught) => {
    assert.equal(caught.message, 'Judge0 request failed: Unauthorized');
    assert.ok(!caught.message.includes('test-key'));
    assert.equal(caught.config, undefined);
    return true;
  });
});
