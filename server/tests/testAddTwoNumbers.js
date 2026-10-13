const { verifySubmission, reportFailure } = require('./judge0TestHelper');
const solutions = require('./fixtures/solutions');

verifySubmission({ problemId: 3, language: 'javascript', code: solutions.javascript[3], expectPass: true })
  .catch(reportFailure);
