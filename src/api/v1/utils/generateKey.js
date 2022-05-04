const crypto = require('crypto');

const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
const accessTokenSecret = crypto.randomBytes(32).toString('hex');

console.table({ refreshTokenSecret, accessTokenSecret });
