const { verifySubmission, reportFailure } = require('./judge0TestHelper');
const solutions = require('./fixtures/solutions');

verifySubmission({ problemId: 2, language: 'javascript', code: solutions.javascript[2], expectPass: true })
  .catch(reportFailure);
