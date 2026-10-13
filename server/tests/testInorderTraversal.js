const { verifySubmission, reportFailure } = require('./judge0TestHelper');
const solutions = require('./fixtures/solutions');

verifySubmission({ problemId: 4, language: 'javascript', code: solutions.javascript[4], expectPass: true })
  .catch(reportFailure);
