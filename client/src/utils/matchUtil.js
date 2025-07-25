/**
 * @param {number} length Length of code we want to generate
 * @returns A random series of letters and numbers of the specified length
 */
function createGameCode(length) {
    const code = crypto.randomUUID().replace(/-/g, '').substring(0, length);
    return code;
}