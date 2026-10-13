const { verifySubmission, reportFailure } = require('./judge0TestHelper');
const solutions = require('./fixtures/solutions');

verifySubmission({ problemId: 5, language: 'javascript', code: solutions.javascript[5], expectPass: true })
  .catch(reportFailure);
